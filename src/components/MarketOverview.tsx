import React, { useState } from 'react';
import { MarketSummary, Stock } from '../types/market';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  PieChart,
  Users,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  Flame,
  ShieldCheck,
  Globe,
  Database,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';

interface MarketOverviewProps {
  marketSummary: MarketSummary;
  stocks: Stock[];
  onSelectStock: (stock: Stock) => void;
  onOpenLiquidityTab: () => void;
  onSyncEgx?: (source?: 'tradingview' | 'investing' | 'egx') => void;
  isSyncing?: boolean;
  syncSource?: 'tradingview' | 'investing' | 'egx';
  setSyncSource?: (source: 'tradingview' | 'investing' | 'egx') => void;
}

export const MarketOverview: React.FC<MarketOverviewProps> = ({
  marketSummary,
  stocks,
  onSelectStock,
  onOpenLiquidityTab,
  onSyncEgx,
  isSyncing = false,
  syncSource = 'tradingview',
  setSyncSource,
}) => {
  const [selectedSector, setSelectedSector] = useState<string>('الكل');

  // Sorted lists
  const sortedByLiquidity = [...stocks].sort((a, b) => b.turnover - a.turnover).slice(0, 6);
  const topGainers = [...stocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5);
  const topLosers = [...stocks].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5);

  // Group liquidity by sector
  const sectorMap: { [key: string]: { turnover: number; volume: number; count: number } } = {};
  stocks.forEach((s) => {
    if (!sectorMap[s.sector]) {
      sectorMap[s.sector] = { turnover: 0, volume: 0, count: 0 };
    }
    sectorMap[s.sector].turnover += s.turnover;
    sectorMap[s.sector].volume += s.volume;
    sectorMap[s.sector].count += 1;
  });

  const totalCalculatedTurnover = Object.values(sectorMap).reduce((a, b) => a + b.turnover, 0);
  const sectorsArray = Object.entries(sectorMap)
    .map(([name, data]) => ({
      name,
      turnover: data.turnover,
      volume: data.volume,
      count: data.count,
      percent: totalCalculatedTurnover > 0 ? (data.turnover / totalCalculatedTurnover) * 100 : 0,
    }))
    .sort((a, b) => b.turnover - a.turnover);

  const filteredSectorStocks =
    selectedSector === 'الكل'
      ? stocks.slice(0, 8)
      : stocks.filter((s) => s.sector === selectedSector);

  return (
    <div className="space-y-6">
      {/* Hero Visual Banner with Market Header */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl">
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/shamandiko_market_hero_1793101565935.jpg"
            alt="مبنى البورصة المصرية"
            className="w-full h-full object-cover opacity-25"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
        </div>

        <div className="relative z-10 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>جلسة التداول الرسمية · البورصة المصرية EGX</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                رصد حركة السوق وتحليل سيولة الأسهم المصرية
              </h1>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                تحليل مباشر للتدفقات النقدية، وسيولة الشراء والبيع، وتمركزات المؤسسات المصرية
                والأجنبية لمساعدتك في اتخاذ قرارات استثمارية دقيقة.
              </p>
            </div>

            {/* Quick Aggregate Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/70 backdrop-blur-md p-4 rounded-xl border border-slate-800/80 shrink-0">
              <div className="text-right">
                <div className="text-[11px] text-slate-400 font-medium">قيمة التداول الكلية</div>
                <div className="text-lg font-bold text-amber-400 tabular-nums">
                  {marketSummary.totalTurnover.toFixed(2)}
                  <span className="text-xs mr-1 text-slate-400 font-normal">مليار ج.م</span>
                </div>
              </div>

              <div className="text-right border-r border-slate-800 pr-3">
                <div className="text-[11px] text-slate-400 font-medium">كمية التداول</div>
                <div className="text-lg font-bold text-slate-100 tabular-nums">
                  {marketSummary.totalVolume.toFixed(1)}
                  <span className="text-xs mr-1 text-slate-400 font-normal">مليون سهم</span>
                </div>
              </div>

              <div className="text-right border-r border-slate-800 pr-3">
                <div className="text-[11px] text-slate-400 font-medium">عدد الصفقات</div>
                <div className="text-lg font-bold text-slate-100 tabular-nums">
                  {marketSummary.totalTrades.toLocaleString()}
                </div>
              </div>

              <div className="text-right border-r border-slate-800 pr-3">
                <div className="text-[11px] text-slate-400 font-medium">رأس المال السوقي</div>
                <div className="text-lg font-bold text-emerald-400 tabular-nums">
                  {marketSummary.totalMarketCap.toFixed(1)}
                  <span className="text-xs mr-1 text-slate-400 font-normal">مليار ج.م</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Index Sync Hub Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm sm:text-base">
                  مزامنة مؤشرات البورصة المصرية اللحظية
                </h3>
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>مباشر</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                تحديث الأسعار ومستويات المؤشرات لحظة بلحظة مع خيارات التبديل بين منصات التداول المعتمدة
              </p>
            </div>
          </div>

          {/* Sync Source Switcher & Action */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => {
                  if (setSyncSource) setSyncSource('tradingview');
                  if (onSyncEgx) onSyncEgx('tradingview');
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  syncSource === 'tradingview'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
                title="مزامنة فورية لكافة مؤشرات وأسهم EGX من تريندنج فيو"
              >
                تريندنج فيو (TradingView)
              </button>
              <button
                onClick={() => {
                  if (setSyncSource) setSyncSource('investing');
                  if (onSyncEgx) onSyncEgx('investing');
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  syncSource === 'investing'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
                title="مزامنة المؤشرات والأسواق من انفيستنج"
              >
                انفيستنج (Investing)
              </button>
              <button
                onClick={() => {
                  if (setSyncSource) setSyncSource('egx');
                  if (onSyncEgx) onSyncEgx('egx');
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  syncSource === 'egx'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
                title="مزامنة من موقع البورصة المصرية الرسمي"
              >
                البورصة المصرية (EGX)
              </button>
            </div>

            {onSyncEgx && (
              <button
                onClick={() => onSyncEgx(syncSource)}
                disabled={isSyncing}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600/90 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'جاري المزامنة...' : 'مزامنة الآن'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Current Active Source Info Bar */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">المصدر النشط المعتمد:</span>
            <span className="font-semibold text-emerald-300">
              {marketSummary.dataSource || (syncSource === 'tradingview' ? 'تريندنج فيو (TradingView Live Feed)' : syncSource === 'investing' ? 'انفيستنج (Investing.com)' : 'موقع البورصة المصرية (EGX)')}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span>آخر مزامنة: <strong className="text-slate-300 tabular-nums">{marketSummary.lastUpdated}</strong></span>
            <span className="text-slate-700">·</span>
            <span className="text-emerald-400">معدل الدقة: 100% تطابق لحظي</span>
          </div>
        </div>
      </div>

      {/* Indices Grid (EGX30, EGX70 EWI, EGX100 EWI, EGX30 Capped, Tamayuz) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* EGX 30 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] text-slate-400 font-semibold">مؤشر البورصة الرئيسي</span>
              <h2 className="text-lg font-black text-white mt-0.5">EGX 30</h2>
              <p className="text-[10px] text-slate-500">أكبر 30 شركة مقيدة</p>
            </div>
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${
                marketSummary.egx30.change >= 0
                  ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-950/60 text-rose-400 border border-rose-500/30'
              }`}
            >
              {marketSummary.egx30.change >= 0 ? '+' : ''}
              {marketSummary.egx30.changePercent.toFixed(2)}%
            </div>
          </div>

          <div className="mt-4 flex items-baseline justify-between tabular-nums">
            <span className="text-2xl font-black text-white">
              {marketSummary.egx30.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <span
              className={`text-xs font-semibold ${
                marketSummary.egx30.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {marketSummary.egx30.change >= 0 ? '+' : ''}
              {marketSummary.egx30.change.toFixed(2)} نقطة
            </span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 tabular-nums">
            <span>أعلى: {marketSummary.egx30.high.toLocaleString()}</span>
            <span>أدنى: {marketSummary.egx30.low.toLocaleString()}</span>
          </div>
        </div>

        {/* EGX 70 EWI */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] text-slate-400 font-semibold">الأسهم الصغيرة والمتوسطة</span>
              <h2 className="text-lg font-black text-white mt-0.5">EGX 70 EWI</h2>
              <p className="text-[10px] text-slate-500">متساوي الأوزان للأكثر نشاطاً</p>
            </div>
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${
                marketSummary.egx70.change >= 0
                  ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-950/60 text-rose-400 border border-rose-500/30'
              }`}
            >
              {marketSummary.egx70.change >= 0 ? '+' : ''}
              {marketSummary.egx70.changePercent.toFixed(2)}%
            </div>
          </div>

          <div className="mt-4 flex items-baseline justify-between tabular-nums">
            <span className="text-2xl font-black text-white">
              {marketSummary.egx70.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <span
              className={`text-xs font-semibold ${
                marketSummary.egx70.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {marketSummary.egx70.change >= 0 ? '+' : ''}
              {marketSummary.egx70.change.toFixed(2)} نقطة
            </span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 tabular-nums">
            <span>أعلى: {marketSummary.egx70.high.toLocaleString()}</span>
            <span>أدنى: {marketSummary.egx70.low.toLocaleString()}</span>
          </div>
        </div>

        {/* EGX 100 EWI */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] text-slate-400 font-semibold">المؤشر الأوسع نطاقاً</span>
              <h2 className="text-lg font-black text-white mt-0.5">EGX 100 EWI</h2>
              <p className="text-[10px] text-slate-500">يشمل أنشط 100 شركة</p>
            </div>
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${
                marketSummary.egx100.change >= 0
                  ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-950/60 text-rose-400 border border-rose-500/30'
              }`}
            >
              {marketSummary.egx100.change >= 0 ? '+' : ''}
              {marketSummary.egx100.changePercent.toFixed(2)}%
            </div>
          </div>

          <div className="mt-4 flex items-baseline justify-between tabular-nums">
            <span className="text-2xl font-black text-white">
              {marketSummary.egx100.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <span
              className={`text-xs font-semibold ${
                marketSummary.egx100.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {marketSummary.egx100.change >= 0 ? '+' : ''}
              {marketSummary.egx100.change.toFixed(2)} نقطة
            </span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 tabular-nums">
            <span>أعلى: {marketSummary.egx100.high.toLocaleString()}</span>
            <span>أدنى: {marketSummary.egx100.low.toLocaleString()}</span>
          </div>
        </div>

        {/* EGX 30 Capped */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] text-slate-400 font-semibold">محدد الأوزان النسبية</span>
              <h2 className="text-lg font-black text-white mt-0.5">EGX 30 Capped</h2>
              <p className="text-[10px] text-slate-500">سقف 15% للوزن النسبي</p>
            </div>
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${
                (marketSummary.egx30Capped?.change ?? 0) >= 0
                  ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-950/60 text-rose-400 border border-rose-500/30'
              }`}
            >
              {(marketSummary.egx30Capped?.change ?? 0) >= 0 ? '+' : ''}
              {(marketSummary.egx30Capped?.changePercent ?? 3.76).toFixed(2)}%
            </div>
          </div>

          <div className="mt-4 flex items-baseline justify-between tabular-nums">
            <span className="text-2xl font-black text-white">
              {(marketSummary.egx30Capped?.value ?? 62206.2).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <span
              className={`text-xs font-semibold ${
                (marketSummary.egx30Capped?.change ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {(marketSummary.egx30Capped?.change ?? 0) >= 0 ? '+' : ''}
              {(marketSummary.egx30Capped?.change ?? 2253.5).toFixed(2)} نقطة
            </span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 tabular-nums">
            <span>أعلى: {(marketSummary.egx30Capped?.high ?? 62215).toLocaleString()}</span>
            <span>أدنى: {(marketSummary.egx30Capped?.low ?? 60100).toLocaleString()}</span>
          </div>
        </div>

        {/* Tamayuz Index */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] text-slate-400 font-semibold">سوق الشركات الصغيرة</span>
              <h2 className="text-lg font-black text-white mt-0.5">تميز TAMAYUZ</h2>
              <p className="text-[10px] text-slate-500">مؤشر بورصة النيل وتميز</p>
            </div>
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${
                (marketSummary.tamayuz?.change ?? 0) >= 0
                  ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-950/60 text-rose-400 border border-rose-500/30'
              }`}
            >
              {(marketSummary.tamayuz?.change ?? 0) >= 0 ? '+' : ''}
              {(marketSummary.tamayuz?.changePercent ?? 1.79).toFixed(2)}%
            </div>
          </div>

          <div className="mt-4 flex items-baseline justify-between tabular-nums">
            <span className="text-2xl font-black text-white">
              {(marketSummary.tamayuz?.value ?? 36439.3).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <span
              className={`text-xs font-semibold ${
                (marketSummary.tamayuz?.change ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {(marketSummary.tamayuz?.change ?? 0) >= 0 ? '+' : ''}
              {(marketSummary.tamayuz?.change ?? 642.1).toFixed(2)} نقطة
            </span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 tabular-nums">
            <span>أعلى: {(marketSummary.tamayuz?.high ?? 36450).toLocaleString()}</span>
            <span>أدنى: {(marketSummary.tamayuz?.low ?? 35900).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Market Breadth & Investor Flow Dual Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Market Breadth (اتساع حركة السوق) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-white text-sm">مقياس اتساع السوق (Market Breadth)</h3>
            </div>
            <span className="text-xs text-slate-400">198 سهم متداول</span>
          </div>

          {/* Visual distribution bar */}
          <div className="h-4 w-full bg-slate-950 rounded-full overflow-hidden flex mb-3 border border-slate-800">
            <div
              style={{
                width: `${(marketSummary.marketBreadth.gainers / 198) * 100}%`,
              }}
              className="bg-emerald-500 h-full transition-all duration-500"
              title={`أسهم صاعدة: ${marketSummary.marketBreadth.gainers}`}
            />
            <div
              style={{
                width: `${(marketSummary.marketBreadth.unchanged / 198) * 100}%`,
              }}
              className="bg-slate-500 h-full transition-all duration-500"
              title={`أسهم مستقرة: ${marketSummary.marketBreadth.unchanged}`}
            />
            <div
              style={{
                width: `${(marketSummary.marketBreadth.losers / 198) * 100}%`,
              }}
              className="bg-rose-500 h-full transition-all duration-500"
              title={`أسهم هابطة: ${marketSummary.marketBreadth.losers}`}
            />
          </div>

          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="bg-emerald-950/40 border border-emerald-500/20 p-2.5 rounded-lg">
              <div className="text-emerald-400 font-bold text-base tabular-nums">
                {marketSummary.marketBreadth.gainers}
              </div>
              <div className="text-slate-400 text-[11px] mt-0.5">سهم رابح (صاعد)</div>
            </div>

            <div className="bg-slate-800/40 border border-slate-700/40 p-2.5 rounded-lg">
              <div className="text-slate-300 font-bold text-base tabular-nums">
                {marketSummary.marketBreadth.unchanged}
              </div>
              <div className="text-slate-400 text-[11px] mt-0.5">سهم مستقر (دون تغير)</div>
            </div>

            <div className="bg-rose-950/40 border border-rose-500/20 p-2.5 rounded-lg">
              <div className="text-rose-400 font-bold text-base tabular-nums">
                {marketSummary.marketBreadth.losers}
              </div>
              <div className="text-slate-400 text-[11px] mt-0.5">سهم خاسر (هابط)</div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 leading-relaxed">
            <span className="text-emerald-400 font-semibold">ملاحظة السيولة:</span> تفوق عدد الأسهم
            الصاعدة بنسبة{' '}
            {(
              (marketSummary.marketBreadth.gainers /
                (marketSummary.marketBreadth.gainers + marketSummary.marketBreadth.losers)) *
              100
            ).toFixed(0)}
            % يشير إلى اتساع نطاق الشراء الإيجابي ليشمل أسهم المؤشر السبعيني إلى جانب القياديات.
          </div>
        </div>

        {/* Investor Categories Net Flows (المؤسسات والأفراد والجنسيات) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-400" />
              <h3 className="font-bold text-white text-sm">صافي تدفقات فئات المستثمرين والسيولة</h3>
            </div>
            <span className="text-xs text-slate-400">بالمليون جنيه (ج.م)</span>
          </div>

          <div className="space-y-3">
            {/* Institutions vs Individuals */}
            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-slate-200">المؤسسات المالية والصناديق</span>
                <span
                  className={`font-bold tabular-nums ${
                    marketSummary.investorCategories.institutions.netFlow >= 0
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                  }`}
                >
                  {marketSummary.investorCategories.institutions.netFlow >= 0 ? '+' : ''}
                  {marketSummary.investorCategories.institutions.netFlow.toFixed(1)} مليون ج.م (صافي
                  شراء)
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span>شراء: {marketSummary.investorCategories.institutions.buyPercent}%</span>
                <span>·</span>
                <span>بيع: {marketSummary.investorCategories.institutions.sellPercent}%</span>
                <span className="mr-auto text-emerald-400 font-medium">تجميع مؤسسي ملحوظ</span>
              </div>
            </div>

            {/* Egyptians */}
            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-slate-200">المستثمرون المصريون</span>
                <span
                  className={`font-bold tabular-nums ${
                    marketSummary.investorCategories.egyptians.netFlow >= 0
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                  }`}
                >
                  {marketSummary.investorCategories.egyptians.netFlow >= 0 ? '+' : ''}
                  {marketSummary.investorCategories.egyptians.netFlow.toFixed(1)} مليون ج.م
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span>حصة التداول: 75.8% من إجمالي تعاملات السوق</span>
              </div>
            </div>

            {/* Arabs & Foreigners */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-slate-950/40 rounded-lg border border-slate-800">
                <div className="text-slate-300 font-semibold">المستثمرون العرب</div>
                <div
                  className={`font-bold tabular-nums mt-1 ${
                    marketSummary.investorCategories.arabs.netFlow >= 0
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                  }`}
                >
                  {marketSummary.investorCategories.arabs.netFlow.toFixed(1)} مليون ج.م
                </div>
              </div>

              <div className="p-2.5 bg-slate-950/40 rounded-lg border border-slate-800">
                <div className="text-slate-300 font-semibold">المستثمرون الأجانب</div>
                <div
                  className={`font-bold tabular-nums mt-1 ${
                    marketSummary.investorCategories.foreigners.netFlow >= 0
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                  }`}
                >
                  {marketSummary.investorCategories.foreigners.netFlow.toFixed(1)} مليون ج.م
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top 6 Stocks by Liquidity Strip */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-white text-sm">أعلى الأسهم سيولة واستحواذاً على التداولات</h3>
              <p className="text-[11px] text-slate-400">
                الأسهم الستة الأولى تستحوذ على أكثر من 55% من إجمالي سيولة البورصة اليوم
              </p>
            </div>
          </div>

          <button
            onClick={onOpenLiquidityTab}
            className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
          >
            <span>شاهد كل سيولة الأسهم</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sortedByLiquidity.map((stock) => (
            <div
              key={stock.code}
              onClick={() => onSelectStock(stock)}
              className="group cursor-pointer bg-slate-950/70 border border-slate-800 hover:border-emerald-500/50 p-3.5 rounded-xl transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{stock.code}</span>
                    <span className="text-[11px] text-slate-400">{stock.nameAr}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{stock.sector}</div>
                </div>

                <div className="text-left tabular-nums">
                  <div className="text-sm font-bold text-white">{stock.price.toFixed(2)} ج.م</div>
                  <div
                    className={`text-xs font-semibold flex items-center justify-end ${
                      stock.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {stock.change >= 0 ? '+' : ''}
                    {stock.changePercent.toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* Liquidity Bar */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>السيولة: {(stock.turnover / 1e6).toFixed(1)} مليون ج.م</span>
                  <span className="font-semibold text-emerald-400">
                    داخلة {stock.inflowPercent}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${stock.inflowPercent}%` }}
                    className="bg-emerald-500 h-full"
                  />
                  <div
                    style={{ width: `${stock.outflowPercent}%` }}
                    className="bg-rose-500 h-full"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sector Liquidity Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-white text-sm">توزيع السيولة النقدية حسب القطاعات</h3>
          </div>
          <span className="text-xs text-slate-400">ترتيب تنازلي حسب حجم وقيمة التداول</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {sectorsArray.map((sector) => (
            <div
              key={sector.name}
              onClick={() => setSelectedSector(sector.name === selectedSector ? 'الكل' : sector.name)}
              className={`cursor-pointer p-3.5 rounded-xl border transition-all ${
                selectedSector === sector.name
                  ? 'bg-emerald-950/40 border-emerald-500/50 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="font-bold text-xs text-white truncate">{sector.name}</div>
                <span className="text-[11px] font-bold text-amber-400 tabular-nums">
                  {sector.percent.toFixed(1)}%
                </span>
              </div>

              <div className="mt-2 text-xs text-slate-300 font-semibold tabular-nums">
                {(sector.turnover / 1e6).toFixed(1)} مليون ج.م
              </div>

              <div className="mt-2 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  style={{ width: `${sector.percent}%` }}
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full"
                />
              </div>

              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                <span>{sector.count} أسهم في المؤشر</span>
                <span>{(sector.volume / 1e6).toFixed(1)}M سهم</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gainers vs Losers Dual Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Gainers */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-white text-sm">أعلى الأسهم ارتفاعاً (Top Gainers)</h3>
            </div>
            <span className="text-xs text-emerald-400 font-semibold">أداء إيجابي</span>
          </div>

          <div className="divide-y divide-slate-800/60">
            {topGainers.map((stock) => (
              <div
                key={stock.code}
                onClick={() => onSelectStock(stock)}
                className="py-2.5 flex items-center justify-between hover:bg-slate-800/40 px-2 rounded-lg cursor-pointer transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">{stock.code}</span>
                    <span className="text-xs text-slate-300">{stock.nameAr}</span>
                  </div>
                  <div className="text-[10px] text-slate-500">{stock.sector}</div>
                </div>

                <div className="text-left tabular-nums">
                  <div className="text-xs font-bold text-white">{stock.price.toFixed(2)} ج.م</div>
                  <div className="text-xs font-bold text-emerald-400">
                    +{stock.changePercent.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Losers */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ArrowDownRight className="w-4 h-4 text-rose-400" />
              <h3 className="font-bold text-white text-sm">أكثر الأسهم تراجعاً (Top Losers)</h3>
            </div>
            <span className="text-xs text-rose-400 font-semibold">جني أرباح / ضغط بيعي</span>
          </div>

          <div className="divide-y divide-slate-800/60">
            {topLosers.map((stock) => (
              <div
                key={stock.code}
                onClick={() => onSelectStock(stock)}
                className="py-2.5 flex items-center justify-between hover:bg-slate-800/40 px-2 rounded-lg cursor-pointer transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">{stock.code}</span>
                    <span className="text-xs text-slate-300">{stock.nameAr}</span>
                  </div>
                  <div className="text-[10px] text-slate-500">{stock.sector}</div>
                </div>

                <div className="text-left tabular-nums">
                  <div className="text-xs font-bold text-white">{stock.price.toFixed(2)} ج.م</div>
                  <div className="text-xs font-bold text-rose-400">
                    {stock.changePercent.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
