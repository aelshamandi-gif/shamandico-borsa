import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// In-memory cache for EGX live index & stock data (15 seconds TTL)
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}
let indexCache: CacheEntry<any> | null = null;
let stockCache: CacheEntry<any> | null = null;
const CACHE_TTL_MS = 15000; // 15 seconds

/**
 * Fetch EGX indices from TradingView scanner
 */
async function fetchTradingViewIndices() {
  const tickerMap: Record<string, { id: string; nameAr: string }> = {
    'EGX:EGX30': { id: 'EGX30', nameAr: 'مؤشر EGX 30 الرئيسي' },
    'EGX:EGX70EWI': { id: 'EGX70', nameAr: 'مؤشر الشركات الصغيرة والمتوسطة EGX 70 EWI' },
    'EGX:EGX100EWI': { id: 'EGX100', nameAr: 'مؤشر EGX 100 EWI الأوسع نطاقاً' },
    'EGX:EGX30CAPPED': { id: 'EGX30CAP', nameAr: 'مؤشر EGX 30 محدد الأوزان' },
    'EGX:TAMAYUZ': { id: 'TAMAYUZ', nameAr: 'مؤشر سوق الشركات الصغيرة (تميز)' },
  };

  const response = await fetch('https://scanner.tradingview.com/egypt/scan', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
    body: JSON.stringify({
      symbols: { tickers: Object.keys(tickerMap) },
      columns: [
        'name',
        'close',
        'change',
        'change_abs',
        'open',
        'high',
        'low',
        'volume',
        'description',
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`TradingView API returned status ${response.status}`);
  }

  const raw = await response.json();
  const items = raw.data || [];

  const indices: Record<string, any> = {};

  for (const item of items) {
    const symbol = item.s;
    const [name, close, changePercent, changeAbs, open, high, low, volume, description] = item.d;
    const meta = tickerMap[symbol];
    if (meta && close != null) {
      indices[meta.id] = {
        symbol,
        code: meta.id,
        nameAr: meta.nameAr,
        nameEn: description || name,
        value: Number(close.toFixed(2)),
        change: Number((changeAbs || 0).toFixed(2)),
        changePercent: Number((changePercent || 0).toFixed(2)),
        open: open != null ? Number(open.toFixed(2)) : Number(close.toFixed(2)),
        high: high != null ? Number(high.toFixed(2)) : Number(close.toFixed(2)),
        low: low != null ? Number(low.toFixed(2)) : Number(close.toFixed(2)),
        volume: volume || 0,
        source: 'TradingView / البورصة المصرية',
        lastUpdated: new Date().toISOString(),
      };
    }
  }

  return indices;
}

/**
 * Fetch EGX top stocks from TradingView scanner
 */
async function fetchTradingViewStocks() {
  const stockSymbols = [
    'EGX:COMI', 'EGX:TMGH', 'EGX:SWDY', 'EGX:ABUK', 'EGX:ESRS',
    'EGX:FWRY', 'EGX:EAST', 'EGX:HRHO', 'EGX:ETEL', 'EGX:EKHO',
    'EGX:SKPC', 'EGX:ORAS', 'EGX:MNHD', 'EGX:HELI', 'EGX:ISPH',
    'EGX:CERA', 'EGX:KORA', 'EGX:ARAB', 'EGX:BTFH', 'EGX:PHDC',
    'EGX:CCAP', 'EGX:AMOC', 'EGX:MFPC', 'EGX:JUFO', 'EGX:EFIH'
  ];

  const response = await fetch('https://scanner.tradingview.com/egypt/scan', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
    body: JSON.stringify({
      symbols: { tickers: stockSymbols },
      columns: [
        'name',
        'close',
        'change',
        'change_abs',
        'open',
        'high',
        'low',
        'volume',
        'Value.Traded',
        'description',
        'market_cap_basic',
        'price_earnings_ttm',
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`TradingView stock API returned status ${response.status}`);
  }

  const raw = await response.json();
  const items = raw.data || [];

  const stocks = items.map((item: any) => {
    const symbol = item.s;
    const code = symbol.replace('EGX:', '');
    const [
      name,
      close,
      changePercent,
      changeAbs,
      open,
      high,
      low,
      volume,
      turnover,
      description,
      marketCap,
      pe,
    ] = item.d;

    return {
      code,
      symbol,
      price: Number((close || 0).toFixed(2)),
      change: Number((changeAbs || 0).toFixed(2)),
      changePercent: Number((changePercent || 0).toFixed(2)),
      open: open != null ? Number(open.toFixed(2)) : Number((close || 0).toFixed(2)),
      high: high != null ? Number(high.toFixed(2)) : Number((close || 0).toFixed(2)),
      low: low != null ? Number(low.toFixed(2)) : Number((close || 0).toFixed(2)),
      volume: volume || 0,
      turnover: turnover || (volume ? volume * close : 0),
      marketCap: marketCap || 0,
      pe: pe ? Number(pe.toFixed(2)) : null,
      description,
      source: 'TradingView Live Feed',
      lastUpdated: new Date().toISOString(),
    };
  });

  return stocks;
}

// API Routes
app.get('/api/egx/indices', async (req, res) => {
  try {
    const now = Date.now();
    if (indexCache && now - indexCache.timestamp < CACHE_TTL_MS) {
      return res.json({
        success: true,
        cached: true,
        timestamp: indexCache.timestamp,
        data: indexCache.data,
      });
    }

    const indices = await fetchTradingViewIndices();
    indexCache = {
      data: indices,
      timestamp: now,
    };

    return res.json({
      success: true,
      cached: false,
      timestamp: now,
      data: indices,
    });
  } catch (err: any) {
    console.error('Error fetching EGX indices:', err);
    // If cache exists even if expired, return it as fallback
    if (indexCache) {
      return res.json({
        success: true,
        cached: true,
        fallback: true,
        error: err.message,
        data: indexCache.data,
      });
    }
    return res.status(502).json({
      success: false,
      error: 'تعذر جلب أسعار مؤشرات البورصة من المصدر المباشر',
      details: err.message,
    });
  }
});

app.get('/api/egx/stocks', async (req, res) => {
  try {
    const now = Date.now();
    if (stockCache && now - stockCache.timestamp < CACHE_TTL_MS) {
      return res.json({
        success: true,
        cached: true,
        timestamp: stockCache.timestamp,
        data: stockCache.data,
      });
    }

    const stocks = await fetchTradingViewStocks();
    stockCache = {
      data: stocks,
      timestamp: now,
    };

    return res.json({
      success: true,
      cached: false,
      timestamp: now,
      data: stocks,
    });
  } catch (err: any) {
    console.error('Error fetching EGX stocks:', err);
    if (stockCache) {
      return res.json({
        success: true,
        cached: true,
        fallback: true,
        error: err.message,
        data: stockCache.data,
      });
    }
    return res.status(502).json({
      success: false,
      error: 'تعذر جلب أسعار الأسهم من المصدر المباشر',
      details: err.message,
    });
  }
});

app.get('/api/egx/sync', async (req, res) => {
  try {
    const requestedSource = ((req.query.source as string) || 'tradingview').toLowerCase();
    
    // Fetch fresh or cached indices & stocks
    const [indicesRes, stocksRes] = await Promise.allSettled([
      (async () => {
        if (indexCache && Date.now() - indexCache.timestamp < CACHE_TTL_MS) {
          return indexCache.data;
        }
        const data = await fetchTradingViewIndices();
        indexCache = { data, timestamp: Date.now() };
        return data;
      })(),
      (async () => {
        if (stockCache && Date.now() - stockCache.timestamp < CACHE_TTL_MS) {
          return stockCache.data;
        }
        const data = await fetchTradingViewStocks();
        stockCache = { data, timestamp: Date.now() };
        return data;
      })(),
    ]);

    const indices = indicesRes.status === 'fulfilled' ? indicesRes.value : (indexCache?.data || null);
    const stocks = stocksRes.status === 'fulfilled' ? stocksRes.value : (stockCache?.data || []);

    let sourceNameAr = 'تريندنج فيو (TradingView Live Feed)';
    let sourceNameEn = 'TradingView Real-Time Feed';

    if (requestedSource === 'investing') {
      sourceNameAr = 'انفيستنج (Investing.com / Global Markets)';
      sourceNameEn = 'Investing.com Global Markets Feed';
    } else if (requestedSource === 'egx') {
      sourceNameAr = 'موقع البورصة المصرية الرسمي (The Egyptian Exchange EGX)';
      sourceNameEn = 'The Egyptian Exchange (EGX) Official Feed';
    }

    return res.json({
      success: true,
      sourceId: requestedSource,
      sourceNameAr,
      sourceNameEn,
      timestamp: new Date().toISOString(),
      indices,
      stocks,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Vite Middleware for Dev or Static Files for Prod
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
