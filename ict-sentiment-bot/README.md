# ICT Sentiment Trading Bot

A MetaTrader 5 Expert Advisor combining ICT (Inner Circle Trader) institutional
concepts with a contrarian stance against retail forex sentiment from myfxbook.

---

## Strategy Logic

### Entry Priority Order
1. **Liquidity Sweep** (required gate) — price must first sweep a buy-side or
   sell-side liquidity pool (equal highs/lows) to confirm the institutional move
2. **Kill Zone filter** — entry only during London (07:00–10:00 UTC) or
   New York (13:00–16:00 UTC) kill zones
3. **Sentiment bias** — myfxbook retail majority Long → we go Short; majority
   Short → we go Long (trade against the losing retail crowd)
4. **Order Block entry** — retrace into the last institutional OB in bias direction
5. **Fair Value Gap entry** — retrace into a FVG if no OB entry triggered

### Why contrarian sentiment?
Retail traders lose ~70–80% of the time. myfxbook's community outlook shows
where retail is positioned. When the majority leans one way, institutions
typically position the other way — creating the liquidity sweeps ICT describes.

---

## Files

| File | Purpose |
|------|---------|
| `ICT_SentimentBot.mq5` | MT5 Expert Advisor — attach to one chart per pair |
| `sentiment_fetcher.py` | Python script that scrapes myfxbook every 30 min |
| `ICT_Visualizer.pine` | TradingView Pine Script — visualize setups on TV charts |
| `requirements.txt` | Python dependencies |

---

## Setup Guide

### Step 1 — Python Sentiment Fetcher

```bash
# Install dependencies
pip install -r requirements.txt

# Test one-shot fetch
python sentiment_fetcher.py --once

# Run continuously (refreshes every 30 minutes)
python sentiment_fetcher.py
```

**Important:** Edit `MT5_FILES_FOLDER` in `sentiment_fetcher.py` to point to
your MT5 terminal data folder, e.g.:
```
C:\Users\YourName\AppData\Roaming\MetaQuotes\Terminal\<HASH>
```
The script auto-discovers all terminal subfolders and copies the CSV.

To find your MT5 Files path: In MT5 → File → Open Data Folder → MQL5 → Files

---

### Step 2 — MT5 Expert Advisor

1. Copy `ICT_SentimentBot.mq5` to your MT5 data folder:
   `<MT5 Data>/MQL5/Experts/`

2. In MetaEditor, open the file and click **Compile** (F7)

3. In MT5, open a chart for each pair:
   - EURUSD M15 (recommended timeframe)
   - GBPUSD M15
   - GBPJPY M15
   - XAUUSD M15

4. Drag the EA onto each chart. Configure inputs:

| Input | Recommended Value | Notes |
|-------|------------------|-------|
| RiskPercent | 1.0 | 1% per trade |
| MaxLotSize | 5.0 | Cap for safety |
| UTCOffset | Your broker offset | Vantage is typically UTC+3 (summer) |
| SentimentThreshold | 60.0 | 60% retail extreme triggers bias |
| LiquidityLookback | 100 | Bars to scan for equal H/L |
| OB_Lookback | 30 | Bars to scan for order blocks |

5. Enable **Allow Algo Trading** in MT5 toolbar

---

### Step 3 — TradingView Visualizer

1. Open TradingView, go to Pine Script Editor
2. Paste the contents of `ICT_Visualizer.pine`
3. Click **Add to chart**
4. Use this to visually confirm setups before they trigger in MT5

The visualizer shows:
- Kill zone shading (blue=London, orange=NY)
- Order Blocks (teal=bullish, maroon=bearish)
- Fair Value Gaps (green=bullish, red=bearish)
- BSL/SSL levels (dashed lines)
- Equal Highs/Lows with 🎯 marker

---

### Step 4 — Run Both Together

Keep `sentiment_fetcher.py` running in a terminal window while MT5 is open.
The fetcher updates the CSV every 30 minutes; the EA reloads it automatically.

```
[Terminal 1]                [MT5]                      [TradingView]
sentiment_fetcher.py   →   ICT_SentimentBot.mq5   ←→   ICT_Visualizer.pine
  (writes CSV)              (reads CSV + trades)         (visual confirmation)
```

---

## Pair-Specific Notes

| Pair | Notes |
|------|-------|
| EURUSD | Most liquid, tightest spreads — best for this strategy |
| GBPUSD | More volatile, wider kill zones often useful |
| GBPJPY | Very volatile — consider reducing RiskPercent to 0.5% |
| XAUUSD | Gold — uses larger pip values (auto-detected). Widen OB_MinBodyPips to 10+ |

---

## Risk Warnings

- **Backtest thoroughly** before running on a live account
- Start on a **demo account** (Vantage offers free demo)
- ICT strategies work best on **15-minute charts** with HTF confluence
- The sentiment fetcher requires a running Python process — consider a VPS
- myfxbook may change their HTML structure; update the scraper if data stops loading

---

## Troubleshooting

**EA not trading:**
- Check MT5 Journal tab for messages
- Verify `myfxbook_sentiment.csv` exists in your MQL5/Files/ folder
- Confirm you're within a kill zone (London/NY UTC time)
- Check that sentiment threshold is being met (run `--once` to see values)

**Sentiment file not found warning:**
- Run `python sentiment_fetcher.py --once` and check for errors
- The EA will still trade but without the sentiment filter (all pairs neutral)

**Wrong kill zone times:**
- Set `UTCOffset` to match your broker's server time
- Vantage: typically UTC+3 in summer (EEST), UTC+2 in winter (EET)
- Check in MT5: Tools → Options → Server time display

**Selenium needed:**
- If `requests` fetch returns no data, uncomment `selenium` in requirements.txt
- Install ChromeDriver matching your Chrome version
