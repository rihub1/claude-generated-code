//+------------------------------------------------------------------+
//|                  ICT Sentiment Trading Bot v1.0                    |
//|  Strategy: Liquidity Sweeps → OB/FVG entries, anti-retail bias    |
//|  Pairs: EURUSD, GBPUSD, GBPJPY, XAUUSD (run one EA per chart)    |
//|  Sentiment: Contrarian to myfxbook retail positioning              |
//+------------------------------------------------------------------+
#property copyright "ICT Sentiment Bot v1.0"
#property version   "1.00"
#property description "ICT: Liquidity Sweeps → Kill Zones → Order Blocks → FVGs"
#property description "Sentiment: Anti-retail bias from myfxbook community outlook"

#include <Trade\Trade.mqh>
CTrade trade;

//--- Risk Management
input group "=== Risk Management ==="
input double   RiskPercent        = 1.0;      // Risk per trade (% of balance)
input double   MaxLotSize         = 5.0;      // Maximum lot size cap
input int      MaxOpenPositions   = 3;        // Max simultaneous positions on symbol
input double   MinRiskReward      = 1.5;      // Minimum R:R ratio required

//--- Kill Zones (Server time — set UTC offset below)
input group "=== Kill Zones ==="
input int      UTCOffset          = 0;        // Broker UTC offset (e.g. 2 for UTC+2)
input bool     UseLondonKZ        = true;     // London Kill Zone
input int      LondonKZ_Start     = 7;        // London start (UTC hour)
input int      LondonKZ_End       = 10;       // London end   (UTC hour)
input bool     UseNewYorkKZ       = true;     // New York Kill Zone
input int      NYorkKZ_Start      = 13;       // NY start (UTC hour)
input int      NYorkKZ_End        = 16;       // NY end   (UTC hour)
input bool     UseAsianKZ         = false;    // Asian Kill Zone (optional)
input int      AsianKZ_Start      = 0;        // Asian start (UTC hour)
input int      AsianKZ_End        = 3;        // Asian end   (UTC hour)

//--- Liquidity Sweep Detection (Priority 1)
input group "=== Liquidity Sweep Detection (Priority 1) ==="
input int      LiquidityLookback  = 100;      // Bars to scan for liquidity pools
input double   EqualLevelPips     = 3.0;      // Pip tolerance for equal highs/lows
input int      SweepConfirmBars   = 5;        // Bars to look back for a confirmed sweep

//--- Order Blocks (Priority 2)
input group "=== Order Blocks (Priority 2) ==="
input int      OB_Lookback        = 30;       // Bars to scan for order blocks
input double   OB_MinBodyPips     = 5.0;      // Min OB candle body size (pips)
input int      OB_ExpiryBars      = 100;      // OB invalidated after N bars

//--- Fair Value Gaps (Priority 3)
input group "=== Fair Value Gaps (Priority 3) ==="
input double   FVG_MinSizePips    = 3.0;      // Minimum FVG size (pips)
input int      FVG_ExpiryBars     = 50;       // FVG invalidated after N bars

//--- Sentiment Filter
input group "=== Sentiment Filter ==="
input string   SentimentFile      = "myfxbook_sentiment.csv"; // CSV filename (in MQL5/Files/)
input double   SentimentThreshold = 60.0;     // Retail % threshold to trigger contrarian bias
input int      SentimentMaxAge    = 60;        // Max acceptable data age (minutes)

//--- Trade Execution
input group "=== Trade Execution ==="
input int      MagicNumber        = 20250309;  // EA magic number
input string   TradeComment       = "ICT_Bot"; // Trade comment
input double   MaxSlippagePips    = 3.0;       // Max slippage
input bool     UseTrailingStop    = true;      // Enable trailing stop
input double   TrailStartPips     = 20.0;      // Pips profit before trailing activates
input double   TrailStepPips      = 5.0;       // Trailing stop step in pips
input bool     EnableAlerts       = true;      // Enable sound/popup alerts on entry

//=== STRUCTURES ===

struct SSentiment {
   string   symbol;
   double   longPct;
   double   shortPct;
   datetime updateTime;
};

struct SOrderBlock {
   double   high;
   double   low;
   bool     bullish;    // true = bullish OB (last bear candle before up impulse)
   datetime time;
   int      barShift;
   bool     active;
};

struct SFVG {
   double   high;
   double   low;
   bool     bullish;    // true = bullish FVG (gap going up)
   datetime time;
   int      barShift;
   bool     active;
};

struct SLiquidity {
   double   price;
   bool     isBSL;      // true = Buy Side Liquidity (equal highs), false = Sell Side
   datetime time;
   bool     swept;
};

//=== GLOBALS ===

SSentiment   g_sent[30];
int          g_sentCount  = 0;
datetime     g_sentLoaded = 0;

SOrderBlock  g_obs[100];
int          g_obsCount   = 0;

SFVG         g_fvgs[100];
int          g_fvgCount   = 0;

SLiquidity   g_liq[200];
int          g_liqCount   = 0;

double       g_pip;
double       g_point;
datetime     g_lastBarTime = 0;

//+------------------------------------------------------------------+
//| Initialization                                                     |
//+------------------------------------------------------------------+
int OnInit()
{
   trade.SetExpertMagicNumber(MagicNumber);
   trade.SetDeviationInPoints((int)(MaxSlippagePips * 10));
   trade.SetTypeFilling(ORDER_FILLING_IOC);

   int digits = (int)SymbolInfoInteger(_Symbol, SYMBOL_DIGITS);
   g_point = SymbolInfoDouble(_Symbol, SYMBOL_POINT);
   g_pip   = (digits == 3 || digits == 5) ? g_point * 10 : g_point;

   // Gold/Silver use point*10 as pip equivalent
   if(StringFind(_Symbol, "XAU") >= 0 || StringFind(_Symbol, "GOLD") >= 0 ||
      StringFind(_Symbol, "XAG") >= 0)
      g_pip = g_point * 10;

   LoadSentiment();

   Print("=== ICT Sentiment Bot STARTED ===");
   Print("Symbol: ", _Symbol, " | Pip size: ", g_pip, " | Magic: ", MagicNumber);
   Print("Sentiment threshold: ", SentimentThreshold, "% | Symbols loaded: ", g_sentCount);

   return INIT_SUCCEEDED;
}

//+------------------------------------------------------------------+
//| Main Tick                                                          |
//+------------------------------------------------------------------+
void OnTick()
{
   // Only run full logic on new bar open
   datetime currentBar = iTime(_Symbol, PERIOD_CURRENT, 0);
   if(currentBar == g_lastBarTime) {
      if(UseTrailingStop) ManageTrailingStop();
      return;
   }
   g_lastBarTime = currentBar;

   // ── 1. KILL ZONE CHECK ────────────────────────────────────────────
   if(!IsInKillZone()) return;

   // ── 2. POSITION CAP CHECK ─────────────────────────────────────────
   if(CountMyPositions() >= MaxOpenPositions) return;

   // ── 3. REFRESH SENTIMENT ──────────────────────────────────────────
   if((int)(TimeCurrent() - g_sentLoaded) > SentimentMaxAge * 60)
      LoadSentiment();

   // ── 4. GET SENTIMENT BIAS ─────────────────────────────────────────
   int bias = GetSentimentBias(_Symbol);
   if(bias == 0) return;  // No clear extreme — skip

   // ── 5. SCAN LIQUIDITY LEVELS ──────────────────────────────────────
   ScanLiquidityLevels();

   // ── 6. CONFIRM LIQUIDITY SWEEP (required for entry) ───────────────
   //   Bullish setup needs SSL swept; Bearish setup needs BSL swept
   bool sweepOK = CheckLiquiditySweep(bias);
   if(!sweepOK) return;

   // ── 7. SCAN ORDER BLOCKS & FVGs IN BIAS DIRECTION ─────────────────
   ScanOrderBlocks(bias);
   ScanFairValueGaps(bias);

   // ── 8. CHECK ENTRY CONDITIONS ─────────────────────────────────────
   CheckForEntry(bias);
}

//+------------------------------------------------------------------+
//| Kill Zone: is current server time inside an active kill zone?      |
//+------------------------------------------------------------------+
bool IsInKillZone()
{
   MqlDateTime dt;
   TimeToStruct(TimeCurrent(), dt);
   int serverHour = dt.hour;
   int utcHour    = (serverHour - UTCOffset + 24) % 24;

   if(UseLondonKZ && utcHour >= LondonKZ_Start && utcHour < LondonKZ_End) return true;
   if(UseNewYorkKZ && utcHour >= NYorkKZ_Start && utcHour < NYorkKZ_End)  return true;
   if(UseAsianKZ  && utcHour >= AsianKZ_Start  && utcHour < AsianKZ_End)  return true;

   return false;
}

//+------------------------------------------------------------------+
//| Load Sentiment CSV                                                 |
//| Format: symbol,long_pct,short_pct                                  |
//| e.g.: EURUSD,65.3,34.7                                            |
//+------------------------------------------------------------------+
void LoadSentiment()
{
   g_sentCount = 0;

   int handle = FileOpen(SentimentFile, FILE_READ | FILE_TXT | FILE_ANSI);
   if(handle == INVALID_HANDLE) {
      Print("WARNING: Sentiment file '", SentimentFile, "' not found in MQL5/Files/");
      Print("Run sentiment_fetcher.py to generate it. Bot will trade without sentiment filter.");
      return;
   }

   bool firstLine = true;
   while(!FileIsEnding(handle) && g_sentCount < 29) {
      string line = FileReadString(handle);
      if(firstLine) { firstLine = false; continue; } // skip header
      if(StringLen(line) < 5) continue;

      string parts[];
      if(StringSplit(line, ',', parts) < 3) continue;

      StringTrimLeft(parts[0]); StringTrimRight(parts[0]);

      g_sent[g_sentCount].symbol     = parts[0];
      g_sent[g_sentCount].longPct    = StringToDouble(parts[1]);
      g_sent[g_sentCount].shortPct   = StringToDouble(parts[2]);
      g_sent[g_sentCount].updateTime = TimeCurrent();
      g_sentCount++;
   }
   FileClose(handle);
   g_sentLoaded = TimeCurrent();
   Print("Sentiment refreshed: ", g_sentCount, " symbols loaded");
}

//+------------------------------------------------------------------+
//| Get sentiment bias for symbol                                      |
//| Returns: +1 = bullish bias, -1 = bearish bias, 0 = neutral        |
//| Logic: trade AGAINST the retail crowd (ICT institutional bias)     |
//+------------------------------------------------------------------+
int GetSentimentBias(string symbol)
{
   string sym = symbol;
   // Strip broker suffixes like ".a", "m", etc.
   StringReplace(sym, ".", "");
   StringReplace(sym, "m", "");
   if(StringLen(sym) > 6) sym = StringSubstr(sym, 0, 6);

   for(int i = 0; i < g_sentCount; i++) {
      string s = g_sent[i].symbol;
      if(s == sym || StringFind(sym, s) >= 0 || StringFind(s, sym) >= 0) {
         double lPct = g_sent[i].longPct;
         double sPct = g_sent[i].shortPct;

         // Retail majority long → institutions short → we go SHORT
         if(lPct >= SentimentThreshold)  return -1;
         // Retail majority short → institutions long → we go LONG
         if(sPct >= SentimentThreshold)  return  1;

         return 0; // No extreme
      }
   }

   // Symbol not in sentiment file — allow trades without filter
   Print("Note: ", symbol, " not in sentiment file. Sentiment filter bypassed.");
   return 0;
}

//+------------------------------------------------------------------+
//| Identify swing highs/lows and group equal levels (liquidity pools) |
//+------------------------------------------------------------------+
void ScanLiquidityLevels()
{
   g_liqCount = 0;
   int bars = MathMin(LiquidityLookback, Bars(_Symbol, PERIOD_CURRENT) - 10);

   double tolerance = EqualLevelPips * g_pip;

   for(int i = 3; i < bars - 3; i++) {
      double high = iHigh(_Symbol, PERIOD_CURRENT, i);
      double low  = iLow (_Symbol, PERIOD_CURRENT, i);

      // Swing high: higher than 3 bars on each side
      bool isSwingHigh = (high > iHigh(_Symbol, PERIOD_CURRENT, i+1) &&
                          high > iHigh(_Symbol, PERIOD_CURRENT, i+2) &&
                          high > iHigh(_Symbol, PERIOD_CURRENT, i+3) &&
                          high > iHigh(_Symbol, PERIOD_CURRENT, i-1) &&
                          high > iHigh(_Symbol, PERIOD_CURRENT, i-2) &&
                          high > iHigh(_Symbol, PERIOD_CURRENT, i-3));

      // Swing low: lower than 3 bars on each side
      bool isSwingLow  = (low < iLow(_Symbol, PERIOD_CURRENT, i+1) &&
                          low < iLow(_Symbol, PERIOD_CURRENT, i+2) &&
                          low < iLow(_Symbol, PERIOD_CURRENT, i+3) &&
                          low < iLow(_Symbol, PERIOD_CURRENT, i-1) &&
                          low < iLow(_Symbol, PERIOD_CURRENT, i-2) &&
                          low < iLow(_Symbol, PERIOD_CURRENT, i-3));

      if(isSwingHigh) {
         // Look for another swing high at roughly the same level = BSL
         for(int j = i + 4; j < bars - 3; j++) {
            double ph = iHigh(_Symbol, PERIOD_CURRENT, j);
            bool isPSH = (ph > iHigh(_Symbol, PERIOD_CURRENT, j+1) &&
                          ph > iHigh(_Symbol, PERIOD_CURRENT, j-1));
            if(isPSH && MathAbs(high - ph) <= tolerance) {
               if(g_liqCount < 199) {
                  g_liq[g_liqCount].price  = (high + ph) / 2.0;
                  g_liq[g_liqCount].isBSL  = true;
                  g_liq[g_liqCount].time   = iTime(_Symbol, PERIOD_CURRENT, i);
                  g_liq[g_liqCount].swept  = false;
                  g_liqCount++;
               }
               break;
            }
         }
      }

      if(isSwingLow) {
         // Look for another swing low at roughly the same level = SSL
         for(int j = i + 4; j < bars - 3; j++) {
            double pl = iLow(_Symbol, PERIOD_CURRENT, j);
            bool isPSL = (pl < iLow(_Symbol, PERIOD_CURRENT, j+1) &&
                          pl < iLow(_Symbol, PERIOD_CURRENT, j-1));
            if(isPSL && MathAbs(low - pl) <= tolerance) {
               if(g_liqCount < 199) {
                  g_liq[g_liqCount].price  = (low + pl) / 2.0;
                  g_liq[g_liqCount].isBSL  = false;
                  g_liq[g_liqCount].time   = iTime(_Symbol, PERIOD_CURRENT, i);
                  g_liq[g_liqCount].swept  = false;
                  g_liqCount++;
               }
               break;
            }
         }
      }
   }
}

//+------------------------------------------------------------------+
//| Check for a recent liquidity sweep that confirms the setup         |
//| Bullish setup: SSL swept (price dipped below equal lows, reversed) |
//| Bearish setup: BSL swept (price spiked above equal highs, reversed)|
//+------------------------------------------------------------------+
bool CheckLiquiditySweep(int bias)
{
   for(int l = 0; l < g_liqCount; l++) {
      if(g_liq[l].swept) continue;

      double liqPx = g_liq[l].price;
      bool   isBSL = g_liq[l].isBSL;

      for(int b = 1; b <= SweepConfirmBars; b++) {
         double barHigh  = iHigh (_Symbol, PERIOD_CURRENT, b);
         double barLow   = iLow  (_Symbol, PERIOD_CURRENT, b);
         double barClose = iClose(_Symbol, PERIOD_CURRENT, b);

         if(bias == 1 && !isBSL) {
            // Bullish: wick below SSL, body closes back above → stop hunt complete
            if(barLow < liqPx && barClose > liqPx) {
               g_liq[l].swept = true;
               Print("SSL sweep confirmed @ ", DoubleToString(liqPx, _Digits),
                     " | Bar ", b, " | → LONG setup");
               if(EnableAlerts) Alert(_Symbol, ": SSL swept @ ", liqPx, " → LONG setup");
               return true;
            }
         }

         if(bias == -1 && isBSL) {
            // Bearish: wick above BSL, body closes back below → stop hunt complete
            if(barHigh > liqPx && barClose < liqPx) {
               g_liq[l].swept = true;
               Print("BSL sweep confirmed @ ", DoubleToString(liqPx, _Digits),
                     " | Bar ", b, " | → SHORT setup");
               if(EnableAlerts) Alert(_Symbol, ": BSL swept @ ", liqPx, " → SHORT setup");
               return true;
            }
         }
      }
   }
   return false;
}

//+------------------------------------------------------------------+
//| Identify Order Blocks in the direction of the bias                 |
//| Bullish OB = last bearish candle before an upward impulse         |
//| Bearish OB = last bullish candle before a downward impulse        |
//+------------------------------------------------------------------+
void ScanOrderBlocks(int bias)
{
   g_obsCount = 0;
   int bars = MathMin(OB_Lookback, Bars(_Symbol, PERIOD_CURRENT) - 5);

   for(int i = 3; i < bars; i++) {
      double o = iOpen (_Symbol, PERIOD_CURRENT, i);
      double c = iClose(_Symbol, PERIOD_CURRENT, i);
      double h = iHigh (_Symbol, PERIOD_CURRENT, i);
      double l = iLow  (_Symbol, PERIOD_CURRENT, i);

      double bodyPips = MathAbs(c - o) / g_pip;
      if(bodyPips < OB_MinBodyPips) continue;

      if(bias == 1 && c < o) {
         // Bear candle — check if next 2 bars made a strong up move (confirms bullish OB)
         double nextHigh1 = iHigh(_Symbol, PERIOD_CURRENT, i - 1);
         double nextHigh2 = iHigh(_Symbol, PERIOD_CURRENT, i - 2);
         if(nextHigh1 > h || nextHigh2 > h) {
            if(g_obsCount < 99) {
               g_obs[g_obsCount].high     = o;    // Top of bear body
               g_obs[g_obsCount].low      = c;    // Bottom of bear body
               g_obs[g_obsCount].bullish  = true;
               g_obs[g_obsCount].time     = iTime(_Symbol, PERIOD_CURRENT, i);
               g_obs[g_obsCount].barShift = i;
               g_obs[g_obsCount].active   = true;
               g_obsCount++;
            }
         }
      }

      if(bias == -1 && c > o) {
         // Bull candle — check if next 2 bars made a strong down move (confirms bearish OB)
         double nextLow1 = iLow(_Symbol, PERIOD_CURRENT, i - 1);
         double nextLow2 = iLow(_Symbol, PERIOD_CURRENT, i - 2);
         if(nextLow1 < l || nextLow2 < l) {
            if(g_obsCount < 99) {
               g_obs[g_obsCount].high    = c;    // Top of bull body
               g_obs[g_obsCount].low     = o;    // Bottom of bull body
               g_obs[g_obsCount].bullish = false;
               g_obs[g_obsCount].time    = iTime(_Symbol, PERIOD_CURRENT, i);
               g_obs[g_obsCount].barShift = i;
               g_obs[g_obsCount].active  = true;
               g_obsCount++;
            }
         }
      }
   }
}

//+------------------------------------------------------------------+
//| Identify Fair Value Gaps (3-candle imbalance)                      |
//| Bullish FVG:  candle[i+1].high < candle[i-1].low  (gap upward)   |
//| Bearish FVG:  candle[i+1].low  > candle[i-1].high (gap downward)  |
//+------------------------------------------------------------------+
void ScanFairValueGaps(int bias)
{
   g_fvgCount = 0;
   int bars = MathMin(FVG_ExpiryBars + 5, Bars(_Symbol, PERIOD_CURRENT) - 5);

   for(int i = 1; i < bars - 1; i++) {
      double prevHigh = iHigh(_Symbol, PERIOD_CURRENT, i + 1);
      double prevLow  = iLow (_Symbol, PERIOD_CURRENT, i + 1);
      double nextHigh = iHigh(_Symbol, PERIOD_CURRENT, i - 1);
      double nextLow  = iLow (_Symbol, PERIOD_CURRENT, i - 1);

      if(bias == 1) {
         // Bullish FVG: gap between prev candle top and next candle bottom
         if(nextLow > prevHigh) {
            double gapPips = (nextLow - prevHigh) / g_pip;
            if(gapPips >= FVG_MinSizePips && g_fvgCount < 99) {
               g_fvgs[g_fvgCount].high     = nextLow;
               g_fvgs[g_fvgCount].low      = prevHigh;
               g_fvgs[g_fvgCount].bullish  = true;
               g_fvgs[g_fvgCount].time     = iTime(_Symbol, PERIOD_CURRENT, i);
               g_fvgs[g_fvgCount].barShift = i;
               g_fvgs[g_fvgCount].active   = true;
               g_fvgCount++;
            }
         }
      }

      if(bias == -1) {
         // Bearish FVG: gap between prev candle bottom and next candle top
         if(nextHigh < prevLow) {
            double gapPips = (prevLow - nextHigh) / g_pip;
            if(gapPips >= FVG_MinSizePips && g_fvgCount < 99) {
               g_fvgs[g_fvgCount].high    = prevLow;
               g_fvgs[g_fvgCount].low     = nextHigh;
               g_fvgs[g_fvgCount].bullish = false;
               g_fvgs[g_fvgCount].time    = iTime(_Symbol, PERIOD_CURRENT, i);
               g_fvgs[g_fvgCount].barShift = i;
               g_fvgs[g_fvgCount].active  = true;
               g_fvgCount++;
            }
         }
      }
   }
}

//+------------------------------------------------------------------+
//| Entry logic: OBs first (priority 2), FVGs second (priority 3)     |
//+------------------------------------------------------------------+
void CheckForEntry(int bias)
{
   double ask = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
   double bid = SymbolInfoDouble(_Symbol, SYMBOL_BID);

   // === Priority 1 within entries: Order Blocks ===
   for(int i = 0; i < g_obsCount; i++) {
      if(!g_obs[i].active) continue;
      if(g_obs[i].barShift > OB_ExpiryBars) { g_obs[i].active = false; continue; }

      if(bias == 1 && g_obs[i].bullish) {
         // Price retracing into bullish OB from above
         if(bid <= g_obs[i].high + 2 * g_pip && bid >= g_obs[i].low - 3 * g_pip) {
            double slPrice = g_obs[i].low - 5 * g_pip;
            double slPips  = (ask - slPrice) / g_pip;
            double tpPrice = ask + slPips * MinRiskReward * g_pip;
            if(ValidateTrade(slPips)) {
               PrintEntryInfo("LONG (OB)", ask, slPrice, tpPrice, slPips);
               if(OpenBuy(ask, slPrice, tpPrice)) { g_obs[i].active = false; return; }
            }
         }
      }

      if(bias == -1 && !g_obs[i].bullish) {
         // Price retracing into bearish OB from below
         if(ask >= g_obs[i].low - 2 * g_pip && ask <= g_obs[i].high + 3 * g_pip) {
            double slPrice = g_obs[i].high + 5 * g_pip;
            double slPips  = (slPrice - bid) / g_pip;
            double tpPrice = bid - slPips * MinRiskReward * g_pip;
            if(ValidateTrade(slPips)) {
               PrintEntryInfo("SHORT (OB)", bid, slPrice, tpPrice, slPips);
               if(OpenSell(bid, slPrice, tpPrice)) { g_obs[i].active = false; return; }
            }
         }
      }
   }

   // === Priority 2 within entries: Fair Value Gaps ===
   for(int i = 0; i < g_fvgCount; i++) {
      if(!g_fvgs[i].active) continue;
      if(g_fvgs[i].barShift > FVG_ExpiryBars) { g_fvgs[i].active = false; continue; }

      if(bias == 1 && g_fvgs[i].bullish) {
         if(bid <= g_fvgs[i].high && bid >= g_fvgs[i].low) {
            double slPrice = g_fvgs[i].low - 5 * g_pip;
            double slPips  = (ask - slPrice) / g_pip;
            double tpPrice = ask + slPips * MinRiskReward * g_pip;
            if(ValidateTrade(slPips)) {
               PrintEntryInfo("LONG (FVG)", ask, slPrice, tpPrice, slPips);
               if(OpenBuy(ask, slPrice, tpPrice)) { g_fvgs[i].active = false; return; }
            }
         }
      }

      if(bias == -1 && !g_fvgs[i].bullish) {
         if(ask >= g_fvgs[i].low && ask <= g_fvgs[i].high) {
            double slPrice = g_fvgs[i].high + 5 * g_pip;
            double slPips  = (slPrice - bid) / g_pip;
            double tpPrice = bid - slPips * MinRiskReward * g_pip;
            if(ValidateTrade(slPips)) {
               PrintEntryInfo("SHORT (FVG)", bid, slPrice, tpPrice, slPips);
               if(OpenSell(bid, slPrice, tpPrice)) { g_fvgs[i].active = false; return; }
            }
         }
      }
   }
}

//+------------------------------------------------------------------+
//| Validate trade parameters                                          |
//+------------------------------------------------------------------+
bool ValidateTrade(double slPips)
{
   if(slPips < 5.0)   { Print("SL too tight (", slPips, " pips) — skip"); return false; }
   if(slPips > 200.0) { Print("SL too wide (", slPips, " pips) — skip");  return false; }
   return true;
}

//+------------------------------------------------------------------+
//| Calculate lot size using fixed % risk                              |
//+------------------------------------------------------------------+
double CalcLotSize(double entryPrice, double slPrice)
{
   double balance  = AccountInfoDouble(ACCOUNT_BALANCE);
   double riskAmt  = balance * RiskPercent / 100.0;
   double slPips   = MathAbs(entryPrice - slPrice) / g_pip;
   if(slPips <= 0) return 0;

   double tickVal  = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_VALUE);
   double tickSz   = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_SIZE);
   double pipVal   = (g_pip / tickSz) * tickVal;
   double lot      = riskAmt / (slPips * pipVal);

   double step  = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_STEP);
   double minL  = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MIN);
   double maxL  = MathMin(SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MAX), MaxLotSize);

   lot = MathFloor(lot / step) * step;
   return MathMax(minL, MathMin(maxL, lot));
}

//+------------------------------------------------------------------+
//| Open buy / sell                                                    |
//+------------------------------------------------------------------+
bool OpenBuy(double price, double sl, double tp)
{
   double lot = CalcLotSize(price, sl);
   if(lot <= 0) return false;
   return trade.Buy(lot, _Symbol, price, sl, tp, TradeComment);
}

bool OpenSell(double price, double sl, double tp)
{
   double lot = CalcLotSize(price, sl);
   if(lot <= 0) return false;
   return trade.Sell(lot, _Symbol, price, sl, tp, TradeComment);
}

//+------------------------------------------------------------------+
//| Count open positions for this symbol + magic                       |
//+------------------------------------------------------------------+
int CountMyPositions()
{
   int count = 0;
   for(int i = PositionsTotal() - 1; i >= 0; i--) {
      if(PositionGetSymbol(i) == _Symbol &&
         PositionGetInteger(POSITION_MAGIC) == MagicNumber)
         count++;
   }
   return count;
}

//+------------------------------------------------------------------+
//| Trailing stop management                                           |
//+------------------------------------------------------------------+
void ManageTrailingStop()
{
   for(int i = PositionsTotal() - 1; i >= 0; i--) {
      ulong ticket = PositionGetTicket(i);
      if(!PositionSelectByTicket(ticket)) continue;
      if(PositionGetString(POSITION_SYMBOL)  != _Symbol)    continue;
      if(PositionGetInteger(POSITION_MAGIC)  != MagicNumber) continue;

      double openPx = PositionGetDouble(POSITION_PRICE_OPEN);
      double curSL  = PositionGetDouble(POSITION_SL);
      double curTP  = PositionGetDouble(POSITION_TP);
      int    digits = (int)SymbolInfoInteger(_Symbol, SYMBOL_DIGITS);
      ENUM_POSITION_TYPE ptype = (ENUM_POSITION_TYPE)PositionGetInteger(POSITION_TYPE);

      double bid = SymbolInfoDouble(_Symbol, SYMBOL_BID);
      double ask = SymbolInfoDouble(_Symbol, SYMBOL_ASK);

      if(ptype == POSITION_TYPE_BUY) {
         double profitPips = (bid - openPx) / g_pip;
         if(profitPips >= TrailStartPips) {
            double newSL = NormalizeDouble(bid - TrailStepPips * g_pip, digits);
            if(newSL > curSL + g_pip)
               trade.PositionModify(ticket, newSL, curTP);
         }
      }

      if(ptype == POSITION_TYPE_SELL) {
         double profitPips = (openPx - ask) / g_pip;
         if(profitPips >= TrailStartPips) {
            double newSL = NormalizeDouble(ask + TrailStepPips * g_pip, digits);
            if(curSL == 0 || newSL < curSL - g_pip)
               trade.PositionModify(ticket, newSL, curTP);
         }
      }
   }
}

//+------------------------------------------------------------------+
//| Print entry details to journal                                     |
//+------------------------------------------------------------------+
void PrintEntryInfo(string type, double entry, double sl, double tp, double slPips)
{
   double rr = MathAbs(tp - entry) / MathAbs(entry - sl);
   Print("=== ENTRY: ", type, " on ", _Symbol, " ===");
   Print("  Entry: ", DoubleToString(entry, _Digits),
         "  SL: ",    DoubleToString(sl, _Digits),
         "  TP: ",    DoubleToString(tp, _Digits));
   Print("  SL pips: ", DoubleToString(slPips, 1),
         "  R:R: 1:", DoubleToString(rr, 2));
}
