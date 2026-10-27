export interface Candle {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  turnover: number; // in EGP
}

export interface OrderBookEntry {
  price: number;
  quantity: number;
  orders: number;
}

export interface StockDisclosure {
  id: string;
  date: string;
  title: string;
  category: 'توزيعات' | 'نتائج أعمال' | 'استحواذ' | 'أسهم خزينة' | 'جمعية عامة';
  summary: string;
}

export interface Stock {
  code: string; // e.g. "COMI"
  isin: string; // e.g. "EGS60121C018"
  nameAr: string;
  nameEn: string;
  sector: string;
  index: 'EGX30' | 'EGX70' | 'Tamayuz';
  
  // Real-time market figures
  price: number; // EGP
  change: number; // EGP
  changePercent: number; // %
  open: number;
  high: number;
  low: number;
  close: number;
  previousClose: number;
  
  // Liquidity and Activity metrics
  volume: number; // traded shares
  turnover: number; // total trading value in EGP
  tradesCount: number; // number of transactions
  avgTradeSize: number; // EGP per trade
  turnoverRatio: number; // % of total market turnover
  liquidityScore: number; // 0 - 100 relative score
  inflowPercent: number; // % of buy orders at ask (سيولة داخلة)
  outflowPercent: number; // % of sell orders at bid (سيولة خارجة)
  netInflow: number; // in EGP (positive = net buying pressure)
  smartMoneyIndex: number; // 0 - 100 institutional accumulation indicator
  
  // Fundamental & Valuation metrics
  marketCap: number; // in Billion EGP
  peRatio: number; // Price to Earnings
  pbRatio: number; // Price to Book
  dividendYield: number; // %
  eps: number; // EGP
  bookValuePerShare: number; // EGP
  roe: number; // Return on Equity %
  fairValue: number; // Estimated fair value EGP
  marginOfSafety: number; // % discount to fair value
  sharesOutstanding: number; // Million shares
  freeFloat: number; // % free float
  foreignOwnership: number; // %
  institutionOwnership: number; // %
  week52High: number;
  week52Low: number;
  beta: number;

  // History & Depth
  candles: Candle[];
  orderBook: {
    bids: OrderBookEntry[];
    asks: OrderBookEntry[];
  };
  disclosures: StockDisclosure[];
}

export interface Watchlist {
  id: string;
  name: string;
  description?: string;
  stockCodes: string[];
  createdAt: string;
  isDefault?: boolean;
}

export interface StockPerformanceComparison {
  stockCode: string;
  stockNameAr: string;
  sector: string;
  startPrice: number;
  currentPrice: number;
  returnEgp: number;
  roiPercent: number; // Return on Investment %
  periodTurnover: number;
  alphaVsEgx30: number; // (roiPercent - egx30RoiPercent)
  status: 'OUTPERFORM' | 'IN_LINE' | 'UNDERPERFORM';
}

export interface WatchlistPerformanceReportData {
  period: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';
  periodLabelAr: string;
  startDate: string;
  endDate: string;
  watchlistId: string;
  watchlistName: string;
  stocksCount: number;
  watchlistRoiPercent: number; // Average ROI of watchlist
  egx30RoiPercent: number; // Benchmark EGX 30 ROI over same period
  excessReturn: number; // (watchlistRoi - egx30Roi)
  beatingBenchmarkCount: number;
  topGainer: StockPerformanceComparison | null;
  lowestPerformer: StockPerformanceComparison | null;
  stockComparisons: StockPerformanceComparison[];
}


export interface PriceAlert {
  id: string;
  stockCode: string;
  stockNameAr: string;
  targetPrice: number;
  condition: 'ABOVE' | 'BELOW'; // 'ABOVE' = يصل إلى أو أعلى، 'BELOW' = ينخفض إلى أو أدنى
  createdAt: string;
  triggered: boolean;
  triggeredAt?: string;
  triggeredPrice?: number;
  note?: string;
  fromWatchlistId?: string;
}

export interface MarketNewsItem {
  id: string;
  title: string;
  summary: string;
  content?: string;
  category: 'EGX' | 'GLOBAL' | 'DISCLOSURE';
  categoryLabelAr: string;
  timestamp: string;
  source: string;
  relatedStockCode?: string;
  impact: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
}

export interface LiveTradeTick {
  id: string;
  time: string;
  stockCode: string;
  stockNameAr: string;
  price: number;
  changePercent: number;
  quantity: number;
  turnover: number;
  type: 'BUY' | 'SELL';
}



export interface MarketIndexData {
  value: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open?: number;
  volume?: number;
  source?: string;
  lastUpdated?: string;
}

export interface MarketSummary {
  status: 'open' | 'closed' | 'pre-open';
  lastUpdated: string;
  dataSource?: string; // 'TradingView Live Feed' | 'البورصة المصرية EGX' | 'Investing.com'
  lastSyncTime?: string;
  isLiveSynced?: boolean;
  activeSource?: 'tradingview' | 'egx' | 'investing' | 'simulation';
  egx30: MarketIndexData;
  egx70: MarketIndexData;
  egx100: MarketIndexData;
  egx30Capped?: MarketIndexData;
  tamayuz?: MarketIndexData;
  totalTurnover: number; // Total EGP Billion
  totalVolume: number; // Total Million shares
  totalTrades: number; // count
  totalMarketCap: number; // Total EGP Billion
  marketBreadth: {
    gainers: number;
    losers: number;
    unchanged: number;
  };
  investorCategories: {
    egyptians: { buyPercent: number; sellPercent: number; netFlow: number };
    arabs: { buyPercent: number; sellPercent: number; netFlow: number };
    foreigners: { buyPercent: number; sellPercent: number; netFlow: number };
    institutions: { buyPercent: number; sellPercent: number; netFlow: number };
    individuals: { buyPercent: number; sellPercent: number; netFlow: number };
  };
}

export interface TechnicalIndicatorConfig {
  // Moving Averages
  ma1Enabled: boolean;
  ma1Period: number;
  ma1Type: 'SMA' | 'EMA';
  ma1Color: string;

  ma2Enabled: boolean;
  ma2Period: number;
  ma2Type: 'SMA' | 'EMA';
  ma2Color: string;

  ma3Enabled: boolean;
  ma3Period: number;
  ma3Type: 'SMA' | 'EMA';
  ma3Color: string;

  // RSI
  rsiEnabled: boolean;
  rsiPeriod: number;
  rsiOverbought: number;
  rsiOversold: number;

  // MACD
  macdEnabled: boolean;
  macdFast: number;
  macdSlow: number;
  macdSignal: number;

  // Bollinger Bands
  bbEnabled: boolean;
  bbPeriod: number;
  bbStdDev: number;
}
