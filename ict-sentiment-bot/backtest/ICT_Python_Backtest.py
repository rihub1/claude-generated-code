"""
ICT Sentinel — Python Backtester
=================================
Uses MetaTrader 5 API for OHLCV data (exact Vantage broker history).
Uses CFTC Commitment of Traders (COT) report for historical sentiment.

WHY CFTC COT FOR SENTIMENT?
  The COT report is published every Friday by the US government showing
  how futures traders are positioned. "Non-Commercial" (speculator) net
  long/short positions correlate directly with retail FX sentiment.
  When speculators are heavily net LONG → we take SHORT (contrarian/ICT).
  ICT explicitly references COT to identify institutional vs retail bias.
  Historical data freely available back to 1986: https://www.cftc.gov

ANTI-LOOKAHEAD DESIGN:
  - All signals are generated using bars[:i]  (data BEFORE bar i)
  - The trade executes at bar[i].open         (current bar's open)
  - SL/TP are checked intrabar using bar[i].high and bar[i].low
  - Sentiment uses COT shifted by 1 week     (previous week's report)
  - No future data is referenced at any point

Run:
    pip install -r requirements_backtest.txt
    python ICT_Python_Backtest.py
"""

import json
import sys
import warnings
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional

import numpy as np
import pandas as pd
import pandas_datareader.data as web
import matplotlib.pyplot as plt
import matplotlib.dates as mdates

warnings.filterwarnings("ignore")

# ──────────────────────────────────────────────────────────────────────
# CONFIGURATION
# ──────────────────────────────────────────────────────────────────────

CONFIG = {
    # Pairs to backtest
    "pairs": ["EURUSD", "GBPUSD", "GBPJPY", "XAUUSD"],

    # Backtest date range
    "start_date": "2020-01-01",
    "end_date":   "2024-12-31",

    # Chart timeframe: "M15", "H1", "H4"
    "timeframe": "M15",

    # Kill zones (UTC hours)
    "london_start": 7,
    "london_end":   10,
    "ny_start":     13,
    "ny_end":       16,

    # Sentiment (COT-based)
    "sent_long_threshold":  60,   # Speculator net long %  → SHORT bias
    "sent_short_threshold": 40,   # Speculator net long %  → LONG  bias

    # ICT parameters
    "pivot_len":    5,     # Swing high/low confirmation bars each side
    "equal_pips":   3.0,   # Equal level tolerance
    "ob_lookback":  30,    # Order block scan depth (bars)
    "ob_min_body":  5.0,   # Min OB body (pips)
    "fvg_lookback": 30,    # FVG scan depth (bars)
    "fvg_min_pips": 3.0,   # Min FVG size (pips)

    # Risk management
    "risk_pct":       1.0,   # % of balance risked per trade
    "max_lot":        5.0,
    "min_rr":         1.5,   # Minimum risk:reward
    "fixed_sl_pips":  20.0,  # Fallback SL when no OB/FVG zone
    "trail_pips":     15.0,  # Trailing stop distance

    # Simulation
    "initial_balance": 10000.0,
    "pip_value_usd":   10.0,   # Per pip per standard lot (~correct for EURUSD/GBPUSD)
}

# COT futures code → forex pair mapping
COT_CODES = {
    "EURUSD": "099741",   # Euro FX futures (CME)
    "GBPUSD": "096742",   # British Pound futures (CME)
    "GBPJPY": "096742",   # Use GBP as proxy for GBPJPY
    "XAUUSD": "088691",   # Gold futures (COMEX)
}

# Pip sizes (mintick * 10 for standard pairs)
PIP_SIZES = {
    "EURUSD": 0.0001,
    "GBPUSD": 0.0001,
    "GBPJPY": 0.01,
    "XAUUSD": 0.1,
}

# ──────────────────────────────────────────────────────────────────────
# DATA STRUCTURES
# ──────────────────────────────────────────────────────────────────────

@dataclass
class Trade:
    direction:   int       # +1 = long, -1 = short
    entry_price: float
    sl:          float
    tp:          float
    lot_size:    float
    entry_time:  datetime
    entry_bar:   int
    reason:      str       # "OB" or "FVG"
    exit_price:  float     = 0.0
    exit_time:   datetime  = None
    exit_reason: str       = ""
    pnl_pips:    float     = 0.0
    pnl_usd:     float     = 0.0
    closed:      bool      = False
    trail_sl:    float     = 0.0   # current trailing stop level

@dataclass
class BacktestResult:
    pair:             str
    trades:           list = field(default_factory=list)
    equity_curve:     list = field(default_factory=list)
    final_balance:    float = 0.0
    total_return_pct: float = 0.0
    win_rate:         float = 0.0
    avg_rr:           float = 0.0
    max_drawdown_pct: float = 0.0
    sharpe_ratio:     float = 0.0
    total_trades:     int   = 0
    winning_trades:   int   = 0

# ──────────────────────────────────────────────────────────────────────
# DATA FETCHING
# ──────────────────────────────────────────────────────────────────────

def fetch_ohlcv_mt5(pair: str, timeframe: str,
                    start: str, end: str) -> Optional[pd.DataFrame]:
    """Fetch OHLCV from MetaTrader 5 (requires MT5 terminal to be open)."""
    try:
        import MetaTrader5 as mt5
        if not mt5.initialize():
            print("  MT5 not running — falling back to yfinance")
            return None

        tf_map = {
            "M5": mt5.TIMEFRAME_M5, "M15": mt5.TIMEFRAME_M15,
            "M30": mt5.TIMEFRAME_M30, "H1": mt5.TIMEFRAME_H1,
            "H4": mt5.TIMEFRAME_H4,  "D1": mt5.TIMEFRAME_D1,
        }
        tf = tf_map.get(timeframe, mt5.TIMEFRAME_M15)
        start_dt = datetime.strptime(start, "%Y-%m-%d")
        end_dt   = datetime.strptime(end,   "%Y-%m-%d")

        rates = mt5.copy_rates_range(pair, tf, start_dt, end_dt)
        mt5.shutdown()

        if rates is None or len(rates) == 0:
            return None

        df = pd.DataFrame(rates)
        df["time"] = pd.to_datetime(df["time"], unit="s")
        df.set_index("time", inplace=True)
        df = df[["open", "high", "low", "close", "tick_volume"]]
        df.columns = ["open", "high", "low", "close", "volume"]
        print(f"  MT5: loaded {len(df):,} {timeframe} bars for {pair}")
        return df

    except ImportError:
        return None


def fetch_ohlcv_yfinance(pair: str, timeframe: str,
                         start: str, end: str) -> Optional[pd.DataFrame]:
    """
    Fallback OHLCV source using yfinance.
    Note: Yahoo Finance forex data is less reliable than MT5 broker data.
    For best results, use MT5 with your Vantage account.
    """
    import yfinance as yf

    yf_map = {
        "EURUSD": "EURUSD=X", "GBPUSD": "GBPUSD=X",
        "GBPJPY": "GBPJPY=X", "XAUUSD": "GC=F",
    }
    yf_tf_map = {
        "M15": "15m", "M30": "30m", "H1": "1h", "H4": "4h", "D1": "1d"
    }
    ticker = yf_map.get(pair)
    tf     = yf_tf_map.get(timeframe, "15m")

    if not ticker:
        return None

    try:
        df = yf.download(ticker, start=start, end=end, interval=tf,
                         auto_adjust=True, progress=False)
        if df.empty:
            return None
        df.columns = [c.lower() for c in df.columns]
        df.index.name = "time"
        # yfinance intraday limited to ~60 days; fall back to daily
        if len(df) < 100:
            df = yf.download(ticker, start=start, end=end, interval="1d",
                             auto_adjust=True, progress=False)
            df.columns = [c.lower() for c in df.columns]
            df.index.name = "time"
        print(f"  yfinance: loaded {len(df):,} bars for {pair}")
        return df
    except Exception as e:
        print(f"  yfinance error: {e}")
        return None


def fetch_cot_sentiment(pair: str, start: str, end: str) -> pd.DataFrame:
    """
    Fetch CFTC Commitment of Traders report data.
    Returns a weekly series of speculator net long percentage.
    ANTI-LOOKAHEAD: shifted by 1 week so we only use the PREVIOUS week's report.

    Source: CFTC publishes every Friday for the previous Tuesday's data.
    We use speculator (non-commercial) net position as our retail proxy.
    """
    cot_code = COT_CODES.get(pair)
    if not cot_code:
        return _empty_sentiment(start, end)

    try:
        # Try to download from CFTC directly
        # CFTC provides annual files; we combine them
        dfs = []
        start_year = int(start[:4])
        end_year   = int(end[:4])

        for year in range(start_year, end_year + 1):
            url = f"https://www.cftc.gov/files/dea/history/fut_fin_xls_{year}.zip"
            try:
                df_year = pd.read_excel(url, engine="openpyxl")
                df_year.columns = df_year.columns.str.strip().str.lower()
                dfs.append(df_year)
            except Exception:
                pass  # Year might not be available yet

        if not dfs:
            raise ValueError("No CFTC data downloaded")

        df = pd.concat(dfs, ignore_index=True)

        # Filter to our specific contract
        code_col = [c for c in df.columns if "cftc" in c and "code" in c]
        if not code_col:
            raise ValueError("Could not find CFTC code column")
        df = df[df[code_col[0]].astype(str).str.strip() == cot_code]

        # Get date column
        date_col = [c for c in df.columns if "report" in c and "date" in c or c == "as_of_date"]
        if not date_col:
            date_col = [df.columns[0]]
        df["date"] = pd.to_datetime(df[date_col[0]])
        df.set_index("date", inplace=True)
        df.sort_index(inplace=True)

        # Non-commercial positions: speculators (retail + hedge funds)
        long_col  = [c for c in df.columns if "noncomm" in c and "long"  in c and "all" in c]
        short_col = [c for c in df.columns if "noncomm" in c and "short" in c and "all" in c]

        if not long_col or not short_col:
            raise ValueError("Could not find non-commercial position columns")

        df["nc_long"]  = pd.to_numeric(df[long_col[0]],  errors="coerce").fillna(0)
        df["nc_short"] = pd.to_numeric(df[short_col[0]], errors="coerce").fillna(0)
        df["nc_total"] = df["nc_long"] + df["nc_short"]
        df["nc_long_pct"] = (df["nc_long"] / df["nc_total"].replace(0, np.nan) * 100).fillna(50)

        # ── ANTI-LOOKAHEAD: shift by 1 week ────────────────────────────────
        # COT data published Friday = positions as of Tuesday.
        # Shifting by 1 ensures we only use CONFIRMED past reports.
        df["sentiment_long_pct"] = df["nc_long_pct"].shift(1)
        df["sentiment_long_pct"].fillna(50, inplace=True)

        result = df[["sentiment_long_pct"]].copy()
        result = result[start:end]
        print(f"  COT sentiment: {len(result)} weekly observations for {pair}")
        return result

    except Exception as e:
        print(f"  COT fetch failed ({e}) — using RSI proxy instead")
        return _empty_sentiment(start, end)


def _empty_sentiment(start: str, end: str) -> pd.DataFrame:
    """Return empty sentinel meaning 'use RSI proxy'."""
    return pd.DataFrame(columns=["sentiment_long_pct"])


# ──────────────────────────────────────────────────────────────────────
# ICT SIGNAL LOGIC  (all point-in-time on bars[:i])
# ──────────────────────────────────────────────────────────────────────

def is_kill_zone(dt: datetime) -> bool:
    """True if datetime is within London or NY kill zone."""
    h = dt.hour
    london = CONFIG["london_start"] <= h < CONFIG["london_end"]
    ny     = CONFIG["ny_start"]     <= h < CONFIG["ny_end"]
    return london or ny


def get_pip(pair: str) -> float:
    return PIP_SIZES.get(pair, 0.0001)


def get_sentiment_bias(cot_df: pd.DataFrame, current_time: datetime,
                       price_series: pd.Series) -> int:
    """
    Get sentiment bias at point-in-time.
    Returns +1 (long), -1 (short), 0 (neutral).

    Uses COT if available, otherwise RSI proxy on daily prices.
    ANTI-LOOKAHEAD: only uses data strictly before current_time.
    """
    if not cot_df.empty:
        # Find most recent COT observation BEFORE current_time
        past_cot = cot_df[cot_df.index < current_time]
        if len(past_cot) > 0:
            long_pct = past_cot["sentiment_long_pct"].iloc[-1]
            if long_pct >= CONFIG["sent_long_threshold"]:
                return -1  # Majority long → go short
            if long_pct <= CONFIG["sent_short_threshold"]:
                return  1  # Majority short → go long
            return 0

    # RSI proxy fallback using only confirmed past daily prices
    if len(price_series) < 15:
        return 0
    delta  = price_series.diff()
    gain   = delta.clip(lower=0).rolling(14).mean()
    loss   = (-delta.clip(upper=0)).rolling(14).mean()
    rs     = gain / loss.replace(0, np.nan)
    rsi    = 100 - (100 / (1 + rs))
    if rsi.isna().all():
        return 0
    rsi_val = rsi.iloc[-1]
    if   rsi_val >= CONFIG["sent_long_threshold"]:   return -1
    elif rsi_val <= CONFIG["sent_short_threshold"]:  return  1
    return 0


def find_swing_levels(bars: pd.DataFrame, pip: float) -> tuple:
    """
    Identify the most recent Buy-Side and Sell-Side liquidity levels.
    Uses pivot detection (N bars confirmed on each side).
    Returns (bsl_price, ssl_price) or (None, None).
    ANTI-LOOKAHEAD: only uses bars already closed.
    """
    n = CONFIG["pivot_len"]
    if len(bars) < 2 * n + 5:
        return None, None

    bsl, ssl = None, None
    lookback = min(len(bars) - n, 150)

    for i in range(n, lookback):
        idx = -(i + 1)   # bars from the end, index is negative
        h   = bars["high"].iloc[idx]
        l   = bars["low"].iloc[idx]

        # Swing high: highest within n bars on each side
        window_h = bars["high"].iloc[idx - n : idx + n + 1]
        window_l = bars["low"].iloc[idx - n : idx + n + 1]

        if len(window_h) == 2 * n + 1:
            if h == window_h.max():
                if bsl is None:
                    bsl = h
            if l == window_l.min():
                if ssl is None:
                    ssl = l

        if bsl is not None and ssl is not None:
            break

    return bsl, ssl


def check_liquidity_sweep(bars: pd.DataFrame, bsl: float, ssl: float,
                           bias: int) -> bool:
    """
    Check if a liquidity sweep occurred on the most recent completed bar.
    ANTI-LOOKAHEAD: references bars.iloc[-1] (the last CLOSED bar).
    """
    if len(bars) < 2:
        return False
    last = bars.iloc[-1]  # Most recently closed bar (confirmed)

    if bias == 1 and ssl is not None:
        # Bullish setup: wick below SSL, closed back above
        return last["low"] < ssl and last["close"] > ssl

    if bias == -1 and bsl is not None:
        # Bearish setup: wick above BSL, closed back below
        return last["high"] > bsl and last["close"] < bsl

    return False


def find_order_block(bars: pd.DataFrame, bias: int, pip: float) -> tuple:
    """
    Scan recent bars for an Order Block in bias direction.
    Returns (ob_top, ob_bot) or (None, None).
    ANTI-LOOKAHEAD: scans bars[:len] which are all confirmed past bars.
    """
    n        = len(bars)
    lookback = min(CONFIG["ob_lookback"], n - 5)
    cur_price = bars["close"].iloc[-1]

    for i in range(2, lookback):
        idx = -(i + 1)   # e.g., -3 = 3rd bar from the end
        o   = bars["open"].iloc[idx]
        c   = bars["close"].iloc[idx]
        h   = bars["high"].iloc[idx]
        l   = bars["low"].iloc[idx]
        body = abs(c - o) / pip

        if body < CONFIG["ob_min_body"]:
            continue

        if bias == 1 and c < o:   # Bearish candle → potential bullish OB
            # Check subsequent bars confirmed an upward impulse
            future_slice = bars.iloc[idx + 1 : -1]   # bars after OB up to last closed
            if len(future_slice) > 0 and future_slice["high"].max() > h:
                ob_top = max(o, c)
                ob_bot = min(o, c)
                # Is current price in the OB zone?
                if ob_bot - 3 * pip <= cur_price <= ob_top + 3 * pip:
                    return ob_top, ob_bot

        if bias == -1 and c > o:  # Bullish candle → potential bearish OB
            future_slice = bars.iloc[idx + 1 : -1]
            if len(future_slice) > 0 and future_slice["low"].min() < l:
                ob_top = max(o, c)
                ob_bot = min(o, c)
                if ob_bot - 3 * pip <= cur_price <= ob_top + 3 * pip:
                    return ob_top, ob_bot

    return None, None


def find_fvg(bars: pd.DataFrame, bias: int, pip: float) -> tuple:
    """
    Scan for a Fair Value Gap that current price is retracing into.
    ANTI-LOOKAHEAD: all bars referenced are confirmed past bars.
    """
    n        = len(bars)
    lookback = min(CONFIG["fvg_lookback"], n - 5)
    cur_price = bars["close"].iloc[-1]

    for i in range(2, lookback - 1):
        idx     = -(i + 1)
        prevH   = bars["high"].iloc[idx - 1]   # bar before middle
        prevL   = bars["low"].iloc[idx - 1]
        nextH   = bars["high"].iloc[idx + 1]   # bar after  middle (idx+1 < 0, still past)
        nextL   = bars["low"].iloc[idx + 1]

        if bias == 1 and nextL > prevH:
            gap_pips = (nextL - prevH) / pip
            if gap_pips >= CONFIG["fvg_min_pips"]:
                if prevH <= cur_price <= nextL:
                    return nextL, prevH

        if bias == -1 and nextH < prevL:
            gap_pips = (prevL - nextH) / pip
            if gap_pips >= CONFIG["fvg_min_pips"]:
                if nextH <= cur_price <= prevL:
                    return prevL, nextH

    return None, None


def calc_lot_size(balance: float, sl_pips: float, pip: float) -> float:
    """Risk-based position sizing."""
    risk_amount = balance * CONFIG["risk_pct"] / 100
    pip_val     = CONFIG["pip_value_usd"]
    if sl_pips <= 0:
        return 0.01
    lot = risk_amount / (sl_pips * pip_val)
    return max(0.01, min(CONFIG["max_lot"], round(lot, 2)))


# ──────────────────────────────────────────────────────────────────────
# BACKTEST ENGINE
# ──────────────────────────────────────────────────────────────────────

def check_exit(trade: Trade, bar: pd.Series, trail_pips: float, pip: float):
    """
    Check intrabar SL/TP hit. Conservative: SL takes priority.
    Updates trailing stop before checking exit.
    ANTI-LOOKAHEAD: uses current bar's high/low (bar is the BAR WE'RE SIMULATING).
    The bar's open/high/low/close are all known since we're simulating it sequentially.
    """
    trail_dist = trail_pips * pip

    # Update trailing stop
    if trade.direction == 1:
        new_trail = bar["high"] - trail_dist
        if trade.trail_sl == 0 or new_trail > trade.trail_sl:
            trade.trail_sl = new_trail
        effective_sl = max(trade.sl, trade.trail_sl) if trade.trail_sl > 0 else trade.sl
        if bar["low"] <= effective_sl:
            return effective_sl, "SL"
        if bar["high"] >= trade.tp:
            return trade.tp, "TP"
    else:
        new_trail = bar["low"] + trail_dist
        if trade.trail_sl == 0 or new_trail < trade.trail_sl:
            trade.trail_sl = new_trail
        effective_sl = min(trade.sl, trade.trail_sl) if trade.trail_sl > 0 else trade.sl
        if bar["high"] >= effective_sl:
            return effective_sl, "SL"
        if bar["low"] <= trade.tp:
            return trade.tp, "TP"

    return None, None


def run_backtest(pair: str, ohlcv: pd.DataFrame,
                 cot: pd.DataFrame) -> BacktestResult:
    """
    Main backtest loop — strictly point-in-time.
    Signal at bar[i-1] close → fills at bar[i] open.
    """
    pip      = get_pip(pair)
    balance  = CONFIG["initial_balance"]
    trades   = []
    equity   = []
    open_pos = []

    min_start = max(CONFIG["ob_lookback"], CONFIG["fvg_lookback"], 50)

    # Daily close prices for RSI proxy (ANTI-LOOKAHEAD: shift(1) applied in get_sentiment_bias)
    daily_close = ohlcv["close"].resample("D").last().dropna()

    print(f"\n  Running {pair} backtest: {len(ohlcv):,} bars")
    print(f"  Date range: {ohlcv.index[0].date()} → {ohlcv.index[-1].date()}")

    for i in range(min_start, len(ohlcv)):
        current_bar = ohlcv.iloc[i]    # This bar's data (entry executes at open)
        past_bars   = ohlcv.iloc[:i]   # All CONFIRMED bars BEFORE current bar
        current_time = ohlcv.index[i]

        equity.append({"time": current_time, "balance": balance})

        # ── 1. Check/close open positions on this bar ──────────────────────
        for trade in open_pos[:]:
            exit_price, reason = check_exit(trade, current_bar,
                                            CONFIG["trail_pips"], pip)
            if exit_price:
                trade.exit_price  = exit_price
                trade.exit_time   = current_time
                trade.exit_reason = reason
                trade.pnl_pips    = (exit_price - trade.entry_price) * trade.direction / pip
                trade.pnl_usd     = trade.pnl_pips * CONFIG["pip_value_usd"] * trade.lot_size
                trade.closed      = True
                balance          += trade.pnl_usd
                trades.append(trade)
                open_pos.remove(trade)

        # ── 2. Max positions cap ───────────────────────────────────────────
        if len(open_pos) >= 3:
            continue

        # ── 3. Kill zone filter ────────────────────────────────────────────
        if not is_kill_zone(current_time):
            continue

        # ── 4. Sentiment bias (all past data only) ─────────────────────────
        past_daily = daily_close[daily_close.index < current_time]
        bias = get_sentiment_bias(cot, current_time, past_daily)
        if bias == 0:
            continue

        # ── 5. Liquidity levels & sweep (past bars only) ───────────────────
        bsl, ssl    = find_swing_levels(past_bars, pip)
        sweep_valid = check_liquidity_sweep(past_bars, bsl, ssl, bias)
        if not sweep_valid:
            continue

        # ── 6. Order Block (past bars only, price must be AT the zone) ──────
        ob_top, ob_bot = find_order_block(past_bars, bias, pip)

        # ── 7. Fair Value Gap (past bars only) ─────────────────────────────
        fvg_top, fvg_bot = find_fvg(past_bars, bias, pip)

        if ob_top is None and fvg_top is None:
            continue

        # ── 8. Execute trade at CURRENT bar's open ─────────────────────────
        # This is the anti-lookahead entry: signal from past bars, fill at current open
        entry_price = current_bar["open"]
        zone_top    = ob_top  if ob_top  is not None else fvg_top
        zone_bot    = ob_bot  if ob_bot  is not None else fvg_bot
        reason      = "OB"   if ob_top  is not None else "FVG"

        if bias == 1:
            sl_price    = zone_bot - 5 * pip
            sl_pips     = (entry_price - sl_price) / pip
            tp_price    = entry_price + sl_pips * CONFIG["min_rr"] * pip
        else:
            sl_price    = zone_top + 5 * pip
            sl_pips     = (sl_price - entry_price) / pip
            tp_price    = entry_price - sl_pips * CONFIG["min_rr"] * pip

        # Sanity bounds
        if sl_pips < 5 or sl_pips > 150:
            continue

        lot = calc_lot_size(balance, sl_pips, pip)
        if lot <= 0:
            continue

        new_trade = Trade(
            direction   = bias,
            entry_price = entry_price,
            sl          = sl_price,
            tp          = tp_price,
            lot_size    = lot,
            entry_time  = current_time,
            entry_bar   = i,
            reason      = reason,
        )
        open_pos.append(new_trade)

    # Close any positions still open at end of backtest
    if ohlcv.index[-1] is not None and len(ohlcv) > 0:
        last_bar = ohlcv.iloc[-1]
        for trade in open_pos:
            trade.exit_price  = last_bar["close"]
            trade.exit_time   = ohlcv.index[-1]
            trade.exit_reason = "EOT"   # End of test
            trade.pnl_pips    = (trade.exit_price - trade.entry_price) * trade.direction / pip
            trade.pnl_usd     = trade.pnl_pips * CONFIG["pip_value_usd"] * trade.lot_size
            trade.closed      = True
            balance          += trade.pnl_usd
            trades.append(trade)

    # ── Statistics ─────────────────────────────────────────────────────
    result = BacktestResult(pair=pair, trades=trades, equity_curve=equity,
                            final_balance=balance)

    if not trades:
        return result

    result.total_trades   = len(trades)
    winning               = [t for t in trades if t.pnl_usd > 0]
    result.winning_trades = len(winning)
    result.win_rate       = len(winning) / len(trades) * 100

    pnl_list = [t.pnl_pips for t in trades]
    won_pips  = [t.pnl_pips for t in trades if t.pnl_pips > 0]
    lost_pips = [abs(t.pnl_pips) for t in trades if t.pnl_pips < 0]
    avg_win   = np.mean(won_pips)  if won_pips  else 0
    avg_loss  = np.mean(lost_pips) if lost_pips else 1
    result.avg_rr = avg_win / avg_loss if avg_loss > 0 else 0

    result.total_return_pct = (balance - CONFIG["initial_balance"]) / CONFIG["initial_balance"] * 100

    # Max drawdown
    eq_vals = [e["balance"] for e in equity]
    peak    = CONFIG["initial_balance"]
    max_dd  = 0
    for v in eq_vals:
        if v > peak:
            peak = v
        dd = (peak - v) / peak * 100
        if dd > max_dd:
            max_dd = dd
    result.max_drawdown_pct = max_dd

    # Sharpe ratio (annualised, assuming 252 trading days)
    if len(pnl_list) > 1:
        mu    = np.mean(pnl_list)
        sigma = np.std(pnl_list)
        result.sharpe_ratio = (mu / sigma * np.sqrt(252)) if sigma > 0 else 0

    return result


# ──────────────────────────────────────────────────────────────────────
# REPORTING
# ──────────────────────────────────────────────────────────────────────

def print_summary(result: BacktestResult):
    print(f"\n{'═' * 55}")
    print(f"  {result.pair}  —  Backtest Results")
    print(f"{'═' * 55}")
    print(f"  Trades:          {result.total_trades}")
    print(f"  Win Rate:        {result.win_rate:.1f}%")
    print(f"  Avg R:R:         1:{result.avg_rr:.2f}")
    print(f"  Total Return:    {result.total_return_pct:+.2f}%")
    print(f"  Final Balance:   ${result.final_balance:,.2f}")
    print(f"  Max Drawdown:    {result.max_drawdown_pct:.2f}%")
    print(f"  Sharpe Ratio:    {result.sharpe_ratio:.2f}")

    # Trade breakdown
    if result.trades:
        by_reason = {"OB": 0, "FVG": 0}
        for t in result.trades:
            by_reason[t.reason] = by_reason.get(t.reason, 0) + 1
        print(f"\n  Entry breakdown:")
        for r, c in by_reason.items():
            print(f"    {r}: {c} trades")

        by_exit = {}
        for t in result.trades:
            by_exit[t.exit_reason] = by_exit.get(t.exit_reason, 0) + 1
        print(f"\n  Exit breakdown:")
        for r, c in sorted(by_exit.items()):
            print(f"    {r}: {c} trades")


def plot_results(results: list[BacktestResult]):
    n    = len(results)
    fig, axes = plt.subplots(n, 2, figsize=(16, 5 * n))
    if n == 1:
        axes = [axes]

    fig.suptitle("ICT Sentinel — Backtest Results (Lookahead-Free)", fontsize=14, y=1.01)

    for ax_row, result in zip(axes, results):
        ax_eq, ax_bar = ax_row

        # Equity curve
        if result.equity_curve:
            eq_df = pd.DataFrame(result.equity_curve).set_index("time")
            ax_eq.plot(eq_df.index, eq_df["balance"], color="steelblue", linewidth=1)
            ax_eq.axhline(CONFIG["initial_balance"], color="gray", linestyle="--", alpha=0.5)
            ax_eq.fill_between(eq_df.index, eq_df["balance"],
                                CONFIG["initial_balance"], alpha=0.15,
                                color="steelblue" if result.total_return_pct >= 0 else "red")
            ax_eq.set_title(f"{result.pair}  |  Equity Curve  |  "
                             f"Return: {result.total_return_pct:+.1f}%  "
                             f"MaxDD: {result.max_drawdown_pct:.1f}%")
            ax_eq.set_ylabel("Account Balance ($)")
            ax_eq.xaxis.set_major_formatter(mdates.DateFormatter("%Y-%m"))
            ax_eq.tick_params(axis="x", rotation=30)
            ax_eq.grid(alpha=0.3)

        # Per-trade P&L bar chart
        if result.trades:
            pnl_pips = [t.pnl_pips for t in result.trades]
            colours  = ["green" if p > 0 else "red" for p in pnl_pips]
            ax_bar.bar(range(len(pnl_pips)), pnl_pips, color=colours, alpha=0.75)
            ax_bar.axhline(0, color="black", linewidth=0.8)
            ax_bar.set_title(f"{result.pair}  |  Per-Trade P&L (pips)  |  "
                              f"Trades: {result.total_trades}  "
                              f"WR: {result.win_rate:.1f}%")
            ax_bar.set_xlabel("Trade #")
            ax_bar.set_ylabel("Pips")
            ax_bar.grid(axis="y", alpha=0.3)

    plt.tight_layout()
    out = Path("backtest_results.png")
    plt.savefig(out, dpi=150, bbox_inches="tight")
    print(f"\nChart saved: {out.resolve()}")
    plt.show()


def export_trades_csv(results: list[BacktestResult]):
    rows = []
    for result in results:
        for t in result.trades:
            rows.append({
                "pair":        result.pair,
                "direction":   "LONG" if t.direction == 1 else "SHORT",
                "reason":      t.reason,
                "entry_time":  t.entry_time,
                "exit_time":   t.exit_time,
                "entry":       round(t.entry_price, 5),
                "exit":        round(t.exit_price,  5),
                "sl":          round(t.sl,           5),
                "tp":          round(t.tp,           5),
                "lot":         t.lot_size,
                "pnl_pips":    round(t.pnl_pips, 1),
                "pnl_usd":     round(t.pnl_usd,  2),
                "exit_reason": t.exit_reason,
            })
    df = pd.DataFrame(rows)
    out = Path("backtest_trades.csv")
    df.to_csv(out, index=False)
    print(f"Trade log saved: {out.resolve()}")


# ──────────────────────────────────────────────────────────────────────
# MAIN
# ──────────────────────────────────────────────────────────────────────

def main():
    print("╔═══════════════════════════════════════════════╗")
    print("║   ICT Sentinel — Anti-Lookahead Backtester    ║")
    print("╚═══════════════════════════════════════════════╝")
    print(f"Period : {CONFIG['start_date']} → {CONFIG['end_date']}")
    print(f"TF     : {CONFIG['timeframe']}")
    print(f"Pairs  : {', '.join(CONFIG['pairs'])}")
    print(f"Risk   : {CONFIG['risk_pct']}% per trade\n")

    all_results = []

    for pair in CONFIG["pairs"]:
        print(f"─── {pair} ──────────────────────────────────────")

        # 1. Fetch OHLCV (try MT5 first, fall back to yfinance)
        ohlcv = fetch_ohlcv_mt5(pair, CONFIG["timeframe"],
                                 CONFIG["start_date"], CONFIG["end_date"])
        if ohlcv is None:
            ohlcv = fetch_ohlcv_yfinance(pair, CONFIG["timeframe"],
                                          CONFIG["start_date"], CONFIG["end_date"])
        if ohlcv is None or len(ohlcv) < 100:
            print(f"  SKIP: insufficient data for {pair}")
            continue

        # 2. Fetch COT sentiment (historical, anti-lookahead)
        cot = fetch_cot_sentiment(pair, CONFIG["start_date"], CONFIG["end_date"])

        # 3. Run backtest
        result = run_backtest(pair, ohlcv, cot)
        all_results.append(result)
        print_summary(result)

    if not all_results:
        print("\nNo results — check data connectivity.")
        return

    # 4. Export & plot
    export_trades_csv(all_results)
    plot_results(all_results)

    # 5. Aggregate summary
    total_trades = sum(r.total_trades for r in all_results)
    if total_trades > 0:
        avg_wr = np.mean([r.win_rate for r in all_results if r.total_trades > 0])
        print(f"\n{'═'*55}")
        print(f"  AGGREGATE — All pairs")
        print(f"{'═'*55}")
        print(f"  Total trades:   {total_trades}")
        print(f"  Avg win rate:   {avg_wr:.1f}%")

    print("\nDone.")


if __name__ == "__main__":
    main()
