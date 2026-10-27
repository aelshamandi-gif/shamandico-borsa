/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Stock, Watchlist, MarketSummary, PriceAlert, LiveTradeTick, MarketNewsItem } from './types/market';
import {
  INITIAL_STOCKS,
  INITIAL_MARKET_SUMMARY,
  INITIAL_WATCHLISTS,
} from './data/egxData';
import { INITIAL_NEWS_ITEMS } from './data/newsData';
import { Header } from './components/Header';
import { MarketOverview } from './components/MarketOverview';
import { LiquidityScreener } from './components/LiquidityScreener';
import { CustomWatchlists } from './components/CustomWatchlists';
import { TechnicalAnalysisStudio } from './components/TechnicalAnalysisStudio';
import { EgxCalculator } from './components/EgxCalculator';
import { NewsAndDisclosures } from './components/NewsAndDisclosures';
import { LiveTradeTape } from './components/LiveTradeTape';
import { PriceAlertsModal } from './components/PriceAlertsModal';
import { PriceAlertToast } from './components/PriceAlertToast';
import { WatchlistPerformanceReport } from './components/WatchlistPerformanceReport';
import { CheckCircle2 } from 'lucide-react';

const WATCHLISTS_STORAGE_KEY = 'shamandiko_custom_watchlists';
const ALERTS_STORAGE_KEY = 'shamandiko_price_alerts';

const INITIAL_SAMPLE_ALERTS: PriceAlert[] = [
  {
    id: 'alert-comi-1',
    stockCode: 'COMI',
    stockNameAr: 'البنك التجاري الدولي',
    targetPrice: 85.50,
    condition: 'ABOVE',
    createdAt: '2026-10-27',
    triggered: false,
    note: 'هدف اختراق القمة السنوية',
  },
  {
    id: 'alert-tmgh-1',
    stockCode: 'TMGH',
    stockNameAr: 'مجموعة طلعت مصطفى',
    targetPrice: 74.00,
    condition: 'ABOVE',
    createdAt: '2026-10-27',
    triggered: false,
    note: 'جني أرباح مستهدف',
  },
  {
    id: 'alert-swdy-1',
    stockCode: 'SWDY',
    stockNameAr: 'السويدي إليكتريك',
    targetPrice: 47.50,
    condition: 'BELOW',
    createdAt: '2026-10-27',
    triggered: false,
    note: 'وقف خسارة لحظي',
  },
];

export default function App() {
  const [stocks, setStocks] = useState<Stock[]>(INITIAL_STOCKS);
  const [marketSummary, setMarketSummary] = useState<MarketSummary>(INITIAL_MARKET_SUMMARY);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'liquidity' | 'watchlists' | 'reports' | 'technical' | 'calculator' | 'news'
  >('overview');

  // News and Corporate Disclosures
  const [newsItems] = useState<MarketNewsItem[]>(INITIAL_NEWS_ITEMS);

  // Watchlists loaded from localStorage or default
  const [watchlists, setWatchlists] = useState<Watchlist[]>(() => {
    try {
      const saved = localStorage.getItem(WATCHLISTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_WATCHLISTS;
  });

  const [activeWatchlistId, setActiveWatchlistId] = useState<string>(
    watchlists[0]?.id || 'watchlist-core'
  );

  // Price Alerts State
  const [alerts, setAlerts] = useState<PriceAlert[]>(() => {
    try {
      const saved = localStorage.getItem(ALERTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_SAMPLE_ALERTS;
  });

  // Active visual toasts for triggered alerts
  const [activeToasts, setActiveToasts] = useState<PriceAlert[]>([]);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  const [alertPreselectedStock, setAlertPreselectedStock] = useState<Stock | null>(null);

  // Selected stock for deep analysis
  const [selectedStock, setSelectedStock] = useState<Stock>(INITIAL_STOCKS[0]);

  // Simulation switch for live tick updates & speed control
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [tickSpeed, setTickSpeed] = useState<'fastest' | 'fast' | 'normal'>('fast');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncSource, setSyncSource] = useState<'tradingview' | 'investing' | 'egx'>('tradingview');
  const [autoSyncEnabled, setAutoSyncEnabled] = useState<boolean>(true);
  const [syncSuccessToast, setSyncSuccessToast] = useState<{ show: boolean; msg: string; source: string } | null>(null);

  // Real-time Live Executed Trades Tape
  const [recentTrades, setRecentTrades] = useState<LiveTradeTick[]>(() => {
    return [
      {
        id: 'trade-init-1',
        time: '14:28:45',
        stockCode: 'COMI',
        stockNameAr: 'البنك التجاري الدولي',
        price: 121.50,
        changePercent: 1.93,
        quantity: 12500,
        turnover: 1518750,
        type: 'BUY',
      },
      {
        id: 'trade-init-2',
        time: '14:28:40',
        stockCode: 'TMGH',
        stockNameAr: 'مجموعة طلعت مصطفى',
        price: 82.95,
        changePercent: 3.95,
        quantity: 18400,
        turnover: 1526280,
        type: 'BUY',
      },
      {
        id: 'trade-init-3',
        time: '14:28:32',
        stockCode: 'SWDY',
        stockNameAr: 'السويدي إليكتريك',
        price: 103.44,
        changePercent: 2.82,
        quantity: 9200,
        turnover: 951648,
        type: 'BUY',
      },
      {
        id: 'trade-init-4',
        time: '14:28:22',
        stockCode: 'ESRS',
        stockNameAr: 'حديد عز',
        price: 141.00,
        changePercent: 2.55,
        quantity: 4500,
        turnover: 634500,
        type: 'BUY',
      },
      {
        id: 'trade-init-5',
        time: '14:28:15',
        stockCode: 'FWRY',
        stockNameAr: 'فوري للمدفوعات',
        price: 17.20,
        changePercent: 3.93,
        quantity: 65000,
        turnover: 1118000,
        type: 'BUY',
      },
    ];
  });

  // Persist watchlists
  useEffect(() => {
    try {
      localStorage.setItem(WATCHLISTS_STORAGE_KEY, JSON.stringify(watchlists));
    } catch {
      // ignore
    }
  }, [watchlists]);

  // Persist alerts
  useEffect(() => {
    try {
      localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alerts));
    } catch {
      // ignore
    }
  }, [alerts]);

  // Live real-time moment-by-moment tick engine
  useEffect(() => {
    if (!isSimulating) return;

    // Fastest = 800ms, Fast = 1500ms, Normal = 3000ms
    const intervalTime = tickSpeed === 'fastest' ? 800 : tickSpeed === 'fast' ? 1500 : 3000;

    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];

      let egx30Shift = 0;
      let egx70Shift = 0;

      setStocks((prevStocks) => {
        // pick 2 to 4 random stocks to update on this tick
        const countToUpdate = Math.floor(2 + Math.random() * 3);
        const shuffled = [...prevStocks].sort(() => 0.5 - Math.random());
        const selectedCodes = new Set(shuffled.slice(0, countToUpdate).map((s) => s.code));

        const newTrades: LiveTradeTick[] = [];
        const triggeredAlertsInThisTick: PriceAlert[] = [];

        const updated = prevStocks.map((stock) => {
          if (!selectedCodes.has(stock.code)) return stock;

          const pctChange = (Math.random() - 0.47) * 0.005; // -0.25% to +0.25%
          const newPrice = Number((stock.price * (1 + pctChange)).toFixed(2));
          const diff = Number((newPrice - stock.previousClose).toFixed(2));
          const changePercent = Number(((diff / stock.previousClose) * 100).toFixed(2));
          const addVolume = Math.floor(3000 + Math.random() * 20000);
          const addTurnover = Math.floor(addVolume * newPrice);
          const isBuyExecution = pctChange >= 0;

          // Track impact on indices
          if (stock.index === 'EGX30') {
            const weight = stock.code === 'COMI' ? 2.5 : stock.code === 'TMGH' ? 1.8 : 1.0;
            egx30Shift += pctChange * weight * 120;
          } else if (stock.index === 'EGX70') {
            egx70Shift += pctChange * 80;
          }

          // Add to live trade tape
          newTrades.push({
            id: `trade-${Date.now()}-${stock.code}`,
            time: timeStr,
            stockCode: stock.code,
            stockNameAr: stock.nameAr,
            price: newPrice,
            changePercent,
            quantity: addVolume,
            turnover: addTurnover,
            type: isBuyExecution ? 'BUY' : 'SELL',
          });

          // Check if this stock meets any price alert
          alerts.forEach((alert) => {
            if (alert.stockCode === stock.code && !alert.triggered) {
              const conditionMet =
                (alert.condition === 'ABOVE' && newPrice >= alert.targetPrice) ||
                (alert.condition === 'BELOW' && newPrice <= alert.targetPrice);

              if (conditionMet) {
                const triggeredAlert: PriceAlert = {
                  ...alert,
                  triggered: true,
                  triggeredAt: timeStr,
                  triggeredPrice: newPrice,
                };
                triggeredAlertsInThisTick.push(triggeredAlert);
              }
            }
          });

          // Inflow update
          const buyBias = pctChange >= 0 ? 0.3 : -0.3;
          const newInflow = Math.min(
            85,
            Math.max(25, Number((stock.inflowPercent + (Math.random() - 0.5) * 1.5 + buyBias).toFixed(1)))
          );
          const newOutflow = Number((100 - newInflow).toFixed(1));

          return {
            ...stock,
            price: newPrice,
            change: diff,
            changePercent,
            high: Math.max(stock.high, newPrice),
            low: Math.min(stock.low, newPrice),
            close: newPrice,
            volume: stock.volume + addVolume,
            turnover: stock.turnover + addTurnover,
            inflowPercent: newInflow,
            outflowPercent: newOutflow,
            tradesCount: stock.tradesCount + Math.floor(1 + Math.random() * 3),
          };
        });

        // Update live trades tape
        if (newTrades.length > 0) {
          setRecentTrades((prev) => [...newTrades, ...prev].slice(0, 25));
        }

        // Handle newly triggered alerts
        if (triggeredAlertsInThisTick.length > 0) {
          setAlerts((prevAlerts) =>
            prevAlerts.map((a) => {
              const matched = triggeredAlertsInThisTick.find((t) => t.id === a.id);
              return matched ? matched : a;
            })
          );
          setActiveToasts((prev) => [...triggeredAlertsInThisTick, ...prev]);
        }

        return updated;
      });

      // Update EGX30, EGX70, EGX100 indices dynamically moment-by-moment
      setMarketSummary((prev) => {
        const delta30 = egx30Shift !== 0 ? egx30Shift : (Math.random() - 0.48) * 3.5;
        const newEgx30Val = Number((prev.egx30.value + delta30).toFixed(2));
        const newEgx30Change = Number((prev.egx30.change + delta30).toFixed(2));
        const base30 = newEgx30Val - newEgx30Change;
        const newEgx30Pct = Number(((newEgx30Change / (base30 || 1)) * 100).toFixed(2));

        const delta70 = egx70Shift !== 0 ? egx70Shift : (Math.random() - 0.47) * 2.2;
        const newEgx70Val = Number((prev.egx70.value + delta70).toFixed(2));
        const newEgx70Change = Number((prev.egx70.change + delta70).toFixed(2));
        const base70 = newEgx70Val - newEgx70Change;
        const newEgx70Pct = Number(((newEgx70Change / (base70 || 1)) * 100).toFixed(2));

        const delta100 = (delta30 + delta70) * 0.6;
        const newEgx100Val = Number((prev.egx100.value + delta100).toFixed(2));
        const newEgx100Change = Number((prev.egx100.change + delta100).toFixed(2));
        const base100 = newEgx100Val - newEgx100Change;
        const newEgx100Pct = Number(((newEgx100Change / (base100 || 1)) * 100).toFixed(2));

        return {
          ...prev,
          lastUpdated: `${timeStr} (لحظة بلحظة)`,
          egx30: {
            ...prev.egx30,
            value: newEgx30Val,
            change: newEgx30Change,
            changePercent: newEgx30Pct,
            high: Math.max(prev.egx30.high, newEgx30Val),
            low: Math.min(prev.egx30.low, newEgx30Val),
          },
          egx70: {
            ...prev.egx70,
            value: newEgx70Val,
            change: newEgx70Change,
            changePercent: newEgx70Pct,
            high: Math.max(prev.egx70.high, newEgx70Val),
            low: Math.min(prev.egx70.low, newEgx70Val),
          },
          egx100: {
            ...prev.egx100,
            value: newEgx100Val,
            change: newEgx100Change,
            changePercent: newEgx100Pct,
            high: Math.max(prev.egx100.high, newEgx100Val),
            low: Math.min(prev.egx100.low, newEgx100Val),
          },
          totalTurnover: Number((prev.totalTurnover + 0.003).toFixed(3)),
          totalVolume: Number((prev.totalVolume + 0.05).toFixed(1)),
          totalTrades: prev.totalTrades + Math.floor(1 + Math.random() * 4),
        };
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isSimulating, tickSpeed, alerts]);

  // Synchronize directly with TradingView / Investing / EGX live feeds
  const handleSyncEgx = async (targetSource?: 'tradingview' | 'investing' | 'egx') => {
    const activeSrc = targetSource || syncSource;
    setIsSyncing(true);
    try {
      const res = await fetch(`/api/egx/sync?source=${activeSrc}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success) {
        const timeStr = new Date().toLocaleTimeString('ar-EG', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });

        // Update indices with live values
        if (data.indices) {
          setMarketSummary((prev) => {
            const next = { ...prev };
            if (data.indices.EGX30) {
              next.egx30 = {
                value: data.indices.EGX30.value,
                change: data.indices.EGX30.change,
                changePercent: data.indices.EGX30.changePercent,
                high: data.indices.EGX30.high,
                low: data.indices.EGX30.low,
                open: data.indices.EGX30.open,
                volume: data.indices.EGX30.volume,
                source: data.sourceNameAr,
                lastUpdated: timeStr,
              };
            }
            if (data.indices.EGX70) {
              next.egx70 = {
                value: data.indices.EGX70.value,
                change: data.indices.EGX70.change,
                changePercent: data.indices.EGX70.changePercent,
                high: data.indices.EGX70.high,
                low: data.indices.EGX70.low,
                open: data.indices.EGX70.open,
                volume: data.indices.EGX70.volume,
                source: data.sourceNameAr,
                lastUpdated: timeStr,
              };
            }
            if (data.indices.EGX100) {
              next.egx100 = {
                value: data.indices.EGX100.value,
                change: data.indices.EGX100.change,
                changePercent: data.indices.EGX100.changePercent,
                high: data.indices.EGX100.high,
                low: data.indices.EGX100.low,
                open: data.indices.EGX100.open,
                volume: data.indices.EGX100.volume,
                source: data.sourceNameAr,
                lastUpdated: timeStr,
              };
            }
            if (data.indices.EGX30CAP) {
              next.egx30Capped = {
                value: data.indices.EGX30CAP.value,
                change: data.indices.EGX30CAP.change,
                changePercent: data.indices.EGX30CAP.changePercent,
                high: data.indices.EGX30CAP.high,
                low: data.indices.EGX30CAP.low,
                source: data.sourceNameAr,
                lastUpdated: timeStr,
              };
            }
            if (data.indices.TAMAYUZ) {
              next.tamayuz = {
                value: data.indices.TAMAYUZ.value,
                change: data.indices.TAMAYUZ.change,
                changePercent: data.indices.TAMAYUZ.changePercent,
                high: data.indices.TAMAYUZ.high,
                low: data.indices.TAMAYUZ.low,
                source: data.sourceNameAr,
                lastUpdated: timeStr,
              };
            }
            next.dataSource = data.sourceNameAr;
            next.lastSyncTime = timeStr;
            next.isLiveSynced = true;
            next.activeSource = activeSrc;
            next.lastUpdated = timeStr;
            return next;
          });
        }

        // Update individual stocks with live prices & turnover
        if (Array.isArray(data.stocks) && data.stocks.length > 0) {
          const liveStocksMap = new Map(data.stocks.map((s: any) => [s.code, s]));
          setStocks((prevStocks) =>
            prevStocks.map((stock) => {
              const live = liveStocksMap.get(stock.code) as any;
              if (live) {
                return {
                  ...stock,
                  price: live.price || stock.price,
                  change: live.change != null ? live.change : stock.change,
                  changePercent: live.changePercent != null ? live.changePercent : stock.changePercent,
                  open: live.open || stock.open,
                  high: Math.max(stock.high, live.high || stock.price),
                  low: Math.min(stock.low, live.low || stock.price),
                  volume: live.volume || stock.volume,
                  turnover: live.turnover || stock.turnover,
                };
              }
              return stock;
            })
          );
        }

        setSyncSuccessToast({
          show: true,
          msg: 'تمت مزامنة أسعار المؤشرات والأسهم بنجاح',
          source: data.sourceNameAr,
        });
        setTimeout(() => setSyncSuccessToast(null), 4000);
      }
    } catch (err) {
      console.error('Sync failed:', err);
      const timeStr = new Date().toLocaleTimeString('ar-EG');
      setMarketSummary((prev) => ({
        ...prev,
        lastUpdated: timeStr,
      }));
    } finally {
      setIsSyncing(false);
    }
  };

  // Initial sync on mount
  useEffect(() => {
    handleSyncEgx('tradingview');
  }, []);

  // Periodic background auto-sync every 30 seconds
  useEffect(() => {
    if (!autoSyncEnabled) return;
    const interval = setInterval(() => {
      handleSyncEgx();
    }, 30000);
    return () => clearInterval(interval);
  }, [autoSyncEnabled, syncSource]);

  // Keep selectedStock up to date
  useEffect(() => {
    const live = stocks.find((s) => s.code === selectedStock.code);
    if (live) {
      setSelectedStock(live);
    }
  }, [stocks, selectedStock.code]);

  // Alert Actions
  const handleCreateAlert = (
    stockCode: string,
    targetPrice: number,
    condition: 'ABOVE' | 'BELOW',
    note?: string,
    fromWatchlistId?: string
  ) => {
    const st = stocks.find((s) => s.code === stockCode);
    const newAlert: PriceAlert = {
      id: `alert-${Date.now()}`,
      stockCode,
      stockNameAr: st?.nameAr || stockCode,
      targetPrice,
      condition,
      createdAt: new Date().toISOString().split('T')[0],
      triggered: false,
      note,
      fromWatchlistId,
    };
    setAlerts((prev) => [newAlert, ...prev]);
  };

  const handleDeleteAlert = (alertId: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    setActiveToasts((prev) => prev.filter((t) => t.id !== alertId));
  };

  const handleResetAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId ? { ...a, triggered: false, triggeredAt: undefined, triggeredPrice: undefined } : a
      )
    );
  };

  const handleDismissToast = (alertId: string) => {
    setActiveToasts((prev) => prev.filter((t) => t.id !== alertId));
  };

  // Watchlist Actions
  const handleCreateWatchlist = (name: string, description?: string) => {
    const newWl: Watchlist = {
      id: `wl-${Date.now()}`,
      name,
      description,
      stockCodes: [],
      createdAt: new Date().toISOString().split('T')[0],
    };
    setWatchlists((prev) => [...prev, newWl]);
    setActiveWatchlistId(newWl.id);
  };

  const handleDeleteWatchlist = (id: string) => {
    if (watchlists.length <= 1) return;
    setWatchlists((prev) => prev.filter((w) => w.id !== id));
    if (activeWatchlistId === id) {
      const remaining = watchlists.filter((w) => w.id !== id);
      if (remaining[0]) setActiveWatchlistId(remaining[0].id);
    }
  };

  const handleAddToWatchlist = (watchlistId: string, stockCode: string) => {
    setWatchlists((prev) =>
      prev.map((w) => {
        if (w.id === watchlistId) {
          if (!w.stockCodes.includes(stockCode)) {
            return { ...w, stockCodes: [...w.stockCodes, stockCode] };
          }
        }
        return w;
      })
    );
  };

  const handleRemoveFromWatchlist = (watchlistId: string, stockCode: string) => {
    setWatchlists((prev) =>
      prev.map((w) => {
        if (w.id === watchlistId) {
          return { ...w, stockCodes: w.stockCodes.filter((c) => c !== stockCode) };
        }
        return w;
      })
    );
  };

  const handleSelectStock = (st: Stock) => {
    setSelectedStock(st);
    setActiveTab('technical');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAlertForStock = (st: Stock) => {
    setAlertPreselectedStock(st);
    setIsAlertsModalOpen(true);
  };

  const activeAlertsCount = alerts.filter((a) => !a.triggered).length;
  const triggeredAlertsCount = alerts.filter((a) => a.triggered).length;
  const currentActiveWatchlist = watchlists.find((w) => w.id === activeWatchlistId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-400">
      {/* Top Header with Alerts button */}
      <Header
        marketSummary={marketSummary}
        stocks={stocks}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSelectStock={handleSelectStock}
        isSimulating={isSimulating}
        setIsSimulating={setIsSimulating}
        alertsCount={activeAlertsCount}
        triggeredAlertsCount={triggeredAlertsCount}
        onOpenAlertsModal={() => {
          setAlertPreselectedStock(null);
          setIsAlertsModalOpen(true);
        }}
        onSyncEgx={handleSyncEgx}
        isSyncing={isSyncing}
        tickSpeed={tickSpeed}
        setTickSpeed={setTickSpeed}
        syncSource={syncSource}
        setSyncSource={setSyncSource}
        autoSyncEnabled={autoSyncEnabled}
        setAutoSyncEnabled={setAutoSyncEnabled}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-5 space-y-5">
        {/* Live Real-time Executed Trades Tape */}
        <LiveTradeTape
          recentTicks={recentTrades}
          onSelectStockCode={(code) => {
            const st = stocks.find((s) => s.code === code);
            if (st) handleSelectStock(st);
          }}
          isSimulating={isSimulating}
          tickSpeed={tickSpeed}
          setTickSpeed={setTickSpeed}
        />

        {/* Tab 1: Market Overview */}
        {activeTab === 'overview' && (
          <MarketOverview
            marketSummary={marketSummary}
            stocks={stocks}
            onSelectStock={handleSelectStock}
            onOpenLiquidityTab={() => setActiveTab('liquidity')}
            onSyncEgx={handleSyncEgx}
            isSyncing={isSyncing}
            syncSource={syncSource}
            setSyncSource={setSyncSource}
          />
        )}

        {/* Tab 2: Top Liquidity Screener */}
        {activeTab === 'liquidity' && (
          <LiquidityScreener
            stocks={stocks}
            watchlists={watchlists}
            onSelectStock={handleSelectStock}
            onAddToWatchlist={handleAddToWatchlist}
          />
        )}

        {/* Tab 3: Custom Watchlists */}
        {activeTab === 'watchlists' && (
          <CustomWatchlists
            stocks={stocks}
            watchlists={watchlists}
            activeWatchlistId={activeWatchlistId}
            setActiveWatchlistId={setActiveWatchlistId}
            onCreateWatchlist={handleCreateWatchlist}
            onDeleteWatchlist={handleDeleteWatchlist}
            onAddToWatchlist={handleAddToWatchlist}
            onRemoveFromWatchlist={handleRemoveFromWatchlist}
            onSelectStock={handleSelectStock}
            onSetAlertForStock={handleOpenAlertForStock}
            onViewReport={(id) => {
              setActiveWatchlistId(id);
              setActiveTab('reports');
            }}
          />
        )}

        {/* Tab 4: Performance Reports & EGX30 Comparison */}
        {activeTab === 'reports' && (
          <WatchlistPerformanceReport
            watchlists={watchlists}
            stocks={stocks}
            activeWatchlistId={activeWatchlistId}
            onSelectStock={handleSelectStock}
          />
        )}

        {/* Tab 5: Technical Analysis & Deep Diagnostics */}
        {activeTab === 'technical' && (
          <TechnicalAnalysisStudio
            stock={selectedStock}
            allStocks={stocks}
            onSelectStock={setSelectedStock}
          />
        )}

        {/* Tab 5: Egyptian and Global News & Corporate Disclosures */}
        {activeTab === 'news' && (
          <NewsAndDisclosures
            newsItems={newsItems}
            stocks={stocks}
            onSelectStock={handleSelectStock}
          />
        )}

        {/* Tab 6: EGX Fee & Profit Calculator */}
        {activeTab === 'calculator' && (
          <EgxCalculator stocks={stocks} selectedStock={selectedStock} />
        )}
      </main>

      {/* Real-time Price Alert Toasts (Popup when triggered) */}
      <PriceAlertToast
        alerts={activeToasts}
        onDismiss={handleDismissToast}
        onViewStock={(code) => {
          const st = stocks.find((s) => s.code === code);
          if (st) handleSelectStock(st);
        }}
      />

      {/* Live Index Sync Notification Toast */}
      {syncSuccessToast && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 border border-emerald-500/80 text-slate-100 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom duration-300">
          <div className="w-8 h-8 rounded-xl bg-emerald-950 flex items-center justify-center border border-emerald-500/50 text-emerald-400 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-white">{syncSuccessToast.msg}</div>
            <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">{syncSuccessToast.source}</div>
          </div>
        </div>
      )}

      {/* Price Alerts Modal */}
      <PriceAlertsModal
        isOpen={isAlertsModalOpen}
        onClose={() => setIsAlertsModalOpen(false)}
        stocks={stocks}
        watchlists={watchlists}
        activeWatchlist={currentActiveWatchlist}
        alerts={alerts}
        onCreateAlert={handleCreateAlert}
        onDeleteAlert={handleDeleteAlert}
        onResetAlert={handleResetAlert}
        onSelectStock={handleSelectStock}
        preselectedStock={alertPreselectedStock}
      />

      {/* Clean Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/90 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-black text-slate-300">شمنديكو</span>
            <span>·</span>
            <span>منصة متخصصة في متابعة البورصة المصرية EGX وتحليل تدفقات السيولة والأخبار</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>جلسات التداول: الأحد إلى الخميس (10:00 ص - 2:30 م)</span>
            <span>·</span>
            <span>تحديثات الأسعار والتنفيذات حية وفورية</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
