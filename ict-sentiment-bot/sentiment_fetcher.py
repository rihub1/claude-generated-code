"""
myfxbook Sentiment Fetcher
==========================
Scrapes community outlook from https://www.myfxbook.com/community/outlook
and writes a CSV that the MT5 ICT Sentiment Bot reads.

Output CSV:  myfxbook_sentiment.csv  (also copies to MT5 Files folder)
Schedule:    Runs every FETCH_INTERVAL_MINUTES minutes automatically

Usage:
    pip install -r requirements.txt
    python sentiment_fetcher.py

    # Or one-shot fetch:
    python sentiment_fetcher.py --once
"""

import csv
import json
import logging
import os
import re
import shutil
import sys
import time
from datetime import datetime
from pathlib import Path
import argparse

import requests
from bs4 import BeautifulSoup

# ──────────────────────────────────────────────
# CONFIGURATION
# ──────────────────────────────────────────────

FETCH_INTERVAL_MINUTES = 30          # How often to refresh (minutes)
OUTPUT_CSV             = "myfxbook_sentiment.csv"

# Pairs to track (must match symbol names in MT5)
TRACKED_PAIRS = [
    "EURUSD", "GBPUSD", "GBPJPY", "XAUUSD",
    "USDJPY", "USDCHF", "AUDUSD", "NZDUSD",
    "USDCAD", "EURGBP", "EURJPY", "GBPCHF",
]

# MT5 Files folder — update this to your MT5 installation path
# Common paths:
#   C:\Users\<USER>\AppData\Roaming\MetaQuotes\Terminal\<HASH>\MQL5\Files\
MT5_FILES_FOLDER = r"C:\Users\richa\AppData\Roaming\MetaQuotes\Terminal"

MYFXBOOK_URL = "https://www.myfxbook.com/community/outlook"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/122.0.0.0 Safari/537.36"
    ),
    "Accept":          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer":         "https://www.myfxbook.com/",
}

# ──────────────────────────────────────────────
# LOGGING
# ──────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)s  %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("sentiment_fetcher.log", encoding="utf-8"),
    ],
)
log = logging.getLogger(__name__)


# ──────────────────────────────────────────────
# SCRAPING
# ──────────────────────────────────────────────

def fetch_sentiment_requests() -> list[dict] | None:
    """
    Attempt to get sentiment via plain HTTP request + BeautifulSoup.
    myfxbook renders some data server-side; this works for the outlook table.
    """
    try:
        resp = requests.get(MYFXBOOK_URL, headers=HEADERS, timeout=30)
        resp.raise_for_status()
        return parse_html(resp.text)
    except Exception as e:
        log.warning(f"requests fetch failed: {e}")
        return None


def fetch_sentiment_selenium() -> list[dict] | None:
    """
    Fallback: use Selenium + ChromeDriver if JavaScript rendering is needed.
    Only called when the requests method returns no data.
    """
    try:
        from selenium import webdriver
        from selenium.webdriver.chrome.options import Options
        from selenium.webdriver.common.by import By
        from selenium.webdriver.support.ui import WebDriverWait
        from selenium.webdriver.support import expected_conditions as EC

        opts = Options()
        opts.add_argument("--headless=new")
        opts.add_argument("--no-sandbox")
        opts.add_argument("--disable-dev-shm-usage")
        opts.add_argument("--disable-blink-features=AutomationControlled")
        opts.add_argument(f"user-agent={HEADERS['User-Agent']}")

        driver = webdriver.Chrome(options=opts)
        driver.get(MYFXBOOK_URL)

        # Wait for the sentiment table to load
        WebDriverWait(driver, 20).until(
            EC.presence_of_element_located((By.ID, "outlookSymbolsTable"))
        )
        html = driver.page_source
        driver.quit()
        return parse_html(html)

    except ImportError:
        log.warning("selenium not installed — run: pip install selenium")
        return None
    except Exception as e:
        log.warning(f"selenium fetch failed: {e}")
        return None


def parse_html(html: str) -> list[dict]:
    """Parse myfxbook community outlook HTML into sentiment rows."""
    soup = BeautifulSoup(html, "html.parser")
    results = []

    # ── Strategy 1: look for the outlook table by ID ──────────────────
    table = soup.find("table", {"id": "outlookSymbolsTable"})
    if not table:
        # Try any table that has sentiment-like headers
        for t in soup.find_all("table"):
            headers_text = t.get_text().lower()
            if "short" in headers_text and "long" in headers_text:
                table = t
                break

    if table:
        rows = table.find_all("tr")
        for row in rows:
            cells = row.find_all(["td", "th"])
            if len(cells) < 3:
                continue
            texts = [c.get_text(strip=True) for c in cells]
            symbol, long_pct, short_pct = extract_row(texts)
            if symbol:
                results.append({"symbol": symbol, "long_pct": long_pct, "short_pct": short_pct})
        if results:
            return results

    # ── Strategy 2: scan all table rows ───────────────────────────────
    for row in soup.find_all("tr"):
        cells = row.find_all("td")
        if len(cells) < 3:
            continue
        texts = [c.get_text(strip=True) for c in cells]
        symbol, long_pct, short_pct = extract_row(texts)
        if symbol:
            results.append({"symbol": symbol, "long_pct": long_pct, "short_pct": short_pct})

    # ── Strategy 3: look for embedded JSON data ────────────────────────
    if not results:
        results = extract_from_json_blobs(html)

    return results


def extract_row(texts: list[str]) -> tuple[str | None, float, float]:
    """Try to extract symbol, long%, short% from a table row's text cells."""
    # Find which cell looks like a forex symbol
    symbol = None
    for t in texts[:3]:
        t_clean = t.replace("/", "").replace("-", "").upper()
        if t_clean in TRACKED_PAIRS or any(p in t_clean for p in TRACKED_PAIRS):
            symbol = t_clean[:6]
            break

    if not symbol:
        return None, 0.0, 0.0

    # Find percentage values
    pcts = []
    for t in texts:
        m = re.search(r"(\d{1,3}(?:\.\d+)?)\s*%?", t)
        if m:
            val = float(m.group(1))
            if 0 < val < 100:
                pcts.append(val)

    if len(pcts) >= 2:
        return symbol, pcts[0], pcts[1]
    elif len(pcts) == 1:
        return symbol, pcts[0], 100.0 - pcts[0]
    return None, 0.0, 0.0


def extract_from_json_blobs(html: str) -> list[dict]:
    """Search for JSON arrays embedded in the HTML that contain sentiment data."""
    results = []
    # Look for patterns like {"symbol":"EURUSD","longPercentage":65.3,...}
    pattern = re.compile(
        r'\{[^{}]*?"symbol"\s*:\s*"([A-Z]{6})"[^{}]*?"long[Pp]ercentage"\s*:\s*([\d.]+)[^{}]*?"short[Pp]ercentage"\s*:\s*([\d.]+)',
        re.IGNORECASE,
    )
    for m in pattern.finditer(html):
        sym, lpct, spct = m.group(1), float(m.group(2)), float(m.group(3))
        if sym in TRACKED_PAIRS:
            results.append({"symbol": sym, "long_pct": lpct, "short_pct": spct})

    return results


# ──────────────────────────────────────────────
# CSV OUTPUT
# ──────────────────────────────────────────────

def write_csv(data: list[dict], path: str = OUTPUT_CSV) -> None:
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["symbol", "long_pct", "short_pct", "updated_at"])
        for row in data:
            writer.writerow([
                row["symbol"],
                f"{row['long_pct']:.1f}",
                f"{row['short_pct']:.1f}",
                datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC"),
            ])
    log.info(f"Wrote {len(data)} rows → {path}")


def copy_to_mt5(csv_path: str) -> None:
    """
    Copy the CSV to all MT5 terminal Files directories found under MT5_FILES_FOLDER.
    MT5 EA reads from: <Terminal Hash>/MQL5/Files/myfxbook_sentiment.csv
    """
    base = Path(MT5_FILES_FOLDER)
    if not base.exists():
        log.warning(f"MT5 folder not found: {MT5_FILES_FOLDER}")
        log.warning("Update MT5_FILES_FOLDER in sentiment_fetcher.py")
        return

    copied = 0
    for terminal_dir in base.iterdir():
        if not terminal_dir.is_dir():
            continue
        target_dir = terminal_dir / "MQL5" / "Files"
        if target_dir.exists():
            dest = target_dir / OUTPUT_CSV
            shutil.copy2(csv_path, dest)
            log.info(f"Copied → {dest}")
            copied += 1

    if copied == 0:
        log.warning("No MT5 MQL5/Files/ directories found. Copy CSV manually.")
    else:
        log.info(f"Distributed to {copied} MT5 terminal(s)")


# ──────────────────────────────────────────────
# MAIN FETCH LOOP
# ──────────────────────────────────────────────

def run_once() -> bool:
    log.info("Fetching myfxbook community outlook...")

    data = fetch_sentiment_requests()

    if not data:
        log.info("Requests method returned no data, trying selenium...")
        data = fetch_sentiment_selenium()

    if not data:
        log.error("Could not fetch sentiment data from myfxbook. Check connection.")
        return False

    # Filter to tracked pairs only
    filtered = [d for d in data if d["symbol"] in TRACKED_PAIRS]
    if not filtered:
        log.warning("Fetched data but no tracked pairs matched. Raw data sample:")
        for d in data[:5]:
            log.warning(f"  {d}")
        filtered = data  # Use all data if nothing matched

    log.info(f"Sentiment snapshot at {datetime.utcnow().strftime('%H:%M UTC')}:")
    for row in filtered:
        bias = "→ SHORT bias" if row["long_pct"] >= 60 else ("→ LONG bias" if row["short_pct"] >= 60 else "→ neutral")
        log.info(f"  {row['symbol']:8s}  Long: {row['long_pct']:5.1f}%  Short: {row['short_pct']:5.1f}%  {bias}")

    write_csv(filtered)
    copy_to_mt5(OUTPUT_CSV)
    return True


def main():
    parser = argparse.ArgumentParser(description="myfxbook sentiment fetcher for ICT bot")
    parser.add_argument("--once", action="store_true", help="Fetch once and exit")
    args = parser.parse_args()

    if args.once:
        success = run_once()
        sys.exit(0 if success else 1)

    log.info(f"Starting sentiment fetcher — refreshing every {FETCH_INTERVAL_MINUTES} minutes")
    log.info(f"Tracked pairs: {', '.join(TRACKED_PAIRS)}")

    while True:
        try:
            run_once()
        except KeyboardInterrupt:
            log.info("Stopped by user.")
            break
        except Exception as e:
            log.error(f"Unexpected error: {e}", exc_info=True)

        log.info(f"Next fetch in {FETCH_INTERVAL_MINUTES} minutes...")
        try:
            time.sleep(FETCH_INTERVAL_MINUTES * 60)
        except KeyboardInterrupt:
            log.info("Stopped by user.")
            break


if __name__ == "__main__":
    main()
