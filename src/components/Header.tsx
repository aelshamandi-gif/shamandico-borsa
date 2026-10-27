import React, { useState } from 'react';
import { MarketSummary, Stock } from '../types/market';
import {
  TrendingUp,
  TrendingDown,
  Search,
  Sliders,
  Bookmark,
  Activity,
  Layers,
  Calculator,
  RefreshCw,
  Clock,
  Sparkles,
  Bell,
  Newspaper,
  Radio,
  BarChart3,
  Globe,
  ChevronDown,
  Check,
  CheckCircle2,
  Database,
} from 'lucide-react';

interface HeaderProps {
  marketSummary: MarketSummary;
  stocks: Stock[];
  activeTab: 'overview' | 'liquidity' | 'watchlists' | 'reports' | 'technical' | 'calculator' | 'news';
  setActiveTab: (tab: 'overview' | 'liquidity' | 'watchlists' | 'reports' | 'technical' | 'calculator' | 'news') => void;
  onSelectStock: (stock: Stock) => void;
  isSimulating: boolean;
  setIsSimulating: React.Dispatch<React.SetStateAction<boolean>>;
  alertsCount: number;
  triggeredAlertsCount: number;
  onOpenAlertsModal: () => void;
  onSyncEgx: (source?: 'tradingview' | 'investing' | 'egx') => void;
  isSyncing: boolean;
  tickSpeed: 'fastest' | 'fast' | 'normal';
  setTickSpeed: (speed: 'fastest' | 'fast' | 'normal') => void;
  syncSource?: 'tradingview' | 'investing' | 'egx';
  setSyncSource?: (source: 'tradingview' | 'investing' | 'egx') => void;
  autoSyncEnabled?: boolean;
  setAutoSyncEnabled?: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  marketSummary,
  stocks,
  activeTab,
  setActiveTab,
  onSelectStock,
  isSimulating,
  setIsSimulating,
  alertsCount,
  triggeredAlertsCount,
  onOpenAlertsModal,
  onSyncEgx,
  isSyncing,
  tickSpeed,
  setTickSpeed,
  syncSource = 'tradingview',
  setSyncSource,
  autoSyncEnabled = true,
  setAutoSyncEnabled,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSourceMenuOpen, setIsSourceMenuOpen] = useState(false);

  const filteredStocks = searchQuery.trim()
    ? stocks.filter(
        (s) =>
          s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.nameAr.includes(searchQuery) ||
          s.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.sector.includes(searchQuery)
      )
    : [];

  const sourceLabels = {
    tradingview: { label: 'تريندنج فيو (TradingView)', short: 'TradingView', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40' },
    investing: { label: 'انفيستنج (Investing.com)', short: 'Investing.com', color: 'text-sky-400 bg-sky-950/60 border-sky-500/40' },
    egx: { label: 'موقع البورصة المصرية (EGX)', short: 'البورصة EGX', color: 'text-amber-400 bg-amber-950/60 border-amber-500/40' },
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      {/* Top Ticker Ribbon */}
      <div className="bg-slate-950/90 border-b border-slate-800/80 px-4 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto whitespace-nowrap scrollbar-none">
          <div className="flex items-center gap-5 tabular-nums">
            {/* Active Data Feed Source Badge */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold border border-slate-700 bg-slate-900 text-slate-300">
              <Database className="w-3 h-3 text-emerald-400" />
              <span>المصدر:</span>
              <span className="text-emerald-300 font-semibold">
                {marketSummary.dataSource || sourceLabels[syncSource].short}
              </span>
            </div>

            <span className="text-slate-700">|</span>

            {/* EGX 30 */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-300">EGX 30</span>
              <span className="font-semibold text-slate-100">
                {marketSummary.egx30.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span
                className={`flex items-center text-[11px] font-medium ${
                  marketSummary.egx30.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {marketSummary.egx30.change >= 0 ? (
                  <TrendingUp className="w-3 h-3 ml-0.5" />
                ) : (
                  <TrendingDown className="w-3 h-3 ml-0.5" />
                )}
                {marketSummary.egx30.change >= 0 ? '+' : ''}
                {marketSummary.egx30.changePercent.toFixed(2)}%
              </span>
            </div>

            <span className="text-slate-700">|</span>

            {/* EGX 70 */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-300">EGX 70 EWI</span>
              <span className="font-semibold text-slate-100">
                {marketSummary.egx70.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span
                className={`flex items-center text-[11px] font-medium ${
                  marketSummary.egx70.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {marketSummary.egx70.change >= 0 ? (
                  <TrendingUp className="w-3 h-3 ml-0.5" />
                ) : (
                  <TrendingDown className="w-3 h-3 ml-0.5" />
                )}
                {marketSummary.egx70.change >= 0 ? '+' : ''}
                {marketSummary.egx70.changePercent.toFixed(2)}%
              </span>
            </div>

            <span className="text-slate-700">|</span>

            {/* EGX 100 */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-300">EGX 100 EWI</span>
              <span className="font-semibold text-slate-100">
                {marketSummary.egx100.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span
                className={`flex items-center text-[11px] font-medium ${
                  marketSummary.egx100.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {marketSummary.egx100.change >= 0 ? (
                  <TrendingUp className="w-3 h-3 ml-0.5" />
                ) : (
                  <TrendingDown className="w-3 h-3 ml-0.5" />
                )}
                {marketSummary.egx100.change >= 0 ? '+' : ''}
                {marketSummary.egx100.changePercent.toFixed(2)}%
              </span>
            </div>

            {/* EGX 30 Capped */}
            {marketSummary.egx30Capped && (
              <>
                <span className="text-slate-700">|</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-300">EGX 30 CAP</span>
                  <span className="font-semibold text-slate-100">
                    {marketSummary.egx30Capped.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  <span
                    className={`flex items-center text-[11px] font-medium ${
                      marketSummary.egx30Capped.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {marketSummary.egx30Capped.change >= 0 ? '+' : ''}
                    {marketSummary.egx30Capped.changePercent.toFixed(2)}%
                  </span>
                </div>
              </>
            )}

            {/* Tamayuz Index */}
            {marketSummary.tamayuz && (
              <>
                <span className="text-slate-700">|</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-300">تميز TAMAYUZ</span>
                  <span className="font-semibold text-slate-100">
                    {marketSummary.tamayuz.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  <span
                    className={`flex items-center text-[11px] font-medium ${
                      marketSummary.tamayuz.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {marketSummary.tamayuz.change >= 0 ? '+' : ''}
                    {marketSummary.tamayuz.changePercent.toFixed(2)}%
                  </span>
                </div>
              </>
            )}

            <span className="text-slate-700">|</span>

            {/* Market Turnover */}
            <div className="flex items-center gap-1.5 text-slate-400">
              <span>إجمالي السيولة:</span>
              <span className="font-bold text-amber-400 tabular-nums">
                {marketSummary.totalTurnover.toFixed(2)} مليار ج.م
              </span>
            </div>
          </div>

          {/* Session Status, Source Selector & Real-Time Sync */}
          <div className="flex items-center gap-2 shrink-0 relative">
            {/* Source Selection Dropdown Button */}
            <div className="relative">
              <button
                onClick={() => setIsSourceMenuOpen(!isSourceMenuOpen)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all shadow-sm ${sourceLabels[syncSource].color}`}
                title="اختر مصدر مزامنة الأسعار والمؤشرات"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{sourceLabels[syncSource].short}</span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {isSourceMenuOpen && (
                <div className="absolute top-full mt-1.5 left-0 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 text-right">
                  <div className="px-2.5 py-1 text-[11px] font-bold text-slate-400 border-b border-slate-800 mb-1.5">
                    اختر مصدر مزامنة المؤشرات والأسهم:
                  </div>
                  
                  <button
                    onClick={() => {
                      if (setSyncSource) setSyncSource('tradingview');
                      onSyncEgx('tradingview');
                      setIsSourceMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-colors ${
                      syncSource === 'tradingview' ? 'bg-emerald-950/80 text-emerald-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-right">
                      <div className="font-bold flex items-center gap-1">
                        <span>تريندنج فيو (TradingView)</span>
                        <span className="px-1 text-[9px] rounded bg-emerald-600 text-white font-normal">مباشر</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal">تحديث مباشر وشامل لكافة مؤشرات EGX والأسهم</div>
                    </div>
                    {syncSource === 'tradingview' && <Check className="w-4 h-4 text-emerald-400 shrink-0 mr-1" />}
                  </button>

                  <button
                    onClick={() => {
                      if (setSyncSource) setSyncSource('investing');
                      onSyncEgx('investing');
                      setIsSourceMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-colors mt-1 ${
                      syncSource === 'investing' ? 'bg-sky-950/80 text-sky-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-right">
                      <div className="font-bold flex items-center gap-1">
                        <span>انفيستنج (Investing.com)</span>
                        <span className="px-1 text-[9px] rounded bg-sky-600 text-white font-normal">عالمي</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal">مؤشرات EGX30 و 70 و 100 والأسهم القيادية</div>
                    </div>
                    {syncSource === 'investing' && <Check className="w-4 h-4 text-sky-400 shrink-0 mr-1" />}
                  </button>

                  <button
                    onClick={() => {
                      if (setSyncSource) setSyncSource('egx');
                      onSyncEgx('egx');
                      setIsSourceMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-colors mt-1 ${
                      syncSource === 'egx' ? 'bg-amber-950/80 text-amber-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-right">
                      <div className="font-bold flex items-center gap-1">
                        <span>موقع البورصة المصرية (EGX)</span>
                        <span className="px-1 text-[9px] rounded bg-amber-600 text-white font-normal">رسمي</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal">البيانات الرسمية المعتمدة من موقع البورصة</div>
                    </div>
                    {syncSource === 'egx' && <Check className="w-4 h-4 text-amber-400 shrink-0 mr-1" />}
                  </button>
                </div>
              )}
            </div>

            {/* Sync Now Button */}
            <button
              onClick={() => onSyncEgx(syncSource)}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
              title="مزامنة فورية الآن من المصدر المختار"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'جاري المزامنة...' : 'مزامنة فورية'}</span>
            </button>

            {/* Speed Selector */}
            <div className="flex items-center gap-0.5 bg-slate-900 p-0.5 rounded border border-slate-800 text-[10px]">
              <button
                onClick={() => setTickSpeed('fastest')}
                className={`px-1.5 py-0.5 rounded font-bold transition-all ${
                  tickSpeed === 'fastest'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="تحديث لحظة بلحظة فائق السرعة كل 800 مللي ثانية"
              >
                0.8ث
              </button>
              <button
                onClick={() => setTickSpeed('fast')}
                className={`px-1.5 py-0.5 rounded font-bold transition-all ${
                  tickSpeed === 'fast'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="تحديث لحظي كل 1.5 ثانية"
              >
                1.5ث
              </button>
              <button
                onClick={() => setTickSpeed('normal')}
                className={`px-1.5 py-0.5 rounded font-bold transition-all ${
                  tickSpeed === 'normal'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="تحديث قياسي كل 3 ثوان"
              >
                3ث
              </button>
            </div>

            {/* Live Indicator */}
            <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-bold bg-emerald-950/50 border border-emerald-500/30 px-2 py-0.5 rounded">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>{marketSummary.lastUpdated}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('overview')}
              className="flex items-center gap-2.5 text-right focus:outline-none group"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-black tracking-tight text-white font-sans">
                    شمنديكو
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                    EGX
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 hidden sm:block -mt-0.5">
                  منصة متابعة البورصة المصرية وتحليل السيولة
                </p>
              </div>
            </button>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden lg:flex items-center gap-1 p-1 bg-slate-950/70 border border-slate-800 rounded-lg">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'overview'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>حركة السوق والسيولة</span>
            </button>

            <button
              onClick={() => setActiveTab('liquidity')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'liquidity'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>أكثر الأسهم سيولة</span>
            </button>

            <button
              onClick={() => setActiveTab('watchlists')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'watchlists'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>قوائم المراقبة</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'reports'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>تقارير الأداء ومقارنة EGX30</span>
            </button>

            <button
              onClick={() => setActiveTab('technical')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'technical'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>التحليل الفني والعميق</span>
            </button>

            <button
              onClick={() => setActiveTab('news')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'news'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Newspaper className="w-3.5 h-3.5" />
              <span>الأخبار والإفصاحات</span>
            </button>

            <button
              onClick={() => setActiveTab('calculator')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'calculator'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>حاسبة العمولات</span>
            </button>
          </nav>

          {/* Right Action Cluster: Alerts Button & Search Bar */}
          <div className="flex items-center gap-3">
            {/* Price Alerts Bell Button */}
            <button
              onClick={onOpenAlertsModal}
              className={`relative p-2 rounded-lg border transition-all ${
                triggeredAlertsCount > 0
                  ? 'bg-amber-950/60 border-amber-500/60 text-amber-300 ring-2 ring-amber-500/30 animate-pulse'
                  : alertsCount > 0
                  ? 'bg-slate-800 border-slate-700 text-emerald-400'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
              title="تنبيهات الأسعار الفورية"
            >
              <Bell className="w-4 h-4" />
              {alertsCount > 0 && (
                <span
                  className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-black flex items-center justify-center tabular-nums text-white shadow-sm ${
                    triggeredAlertsCount > 0 ? 'bg-amber-500 animate-bounce' : 'bg-emerald-600'
                  }`}
                >
                  {alertsCount}
                </span>
              )}
            </button>

            {/* Search Bar with Instant Lookup */}
            <div className="relative w-52 md:w-72">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ابحث بكود السهم أو الاسم (مثال: COMI, طلعت مصطفى)..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                className="w-full bg-slate-950/80 border border-slate-800 text-xs text-slate-100 pr-9 pl-3 py-2 rounded-lg placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Search Dropdown */}
            {isSearchOpen && filteredStocks.length > 0 && (
              <div className="absolute top-full mt-1.5 right-0 w-full bg-slate-900 border border-slate-700 rounded-lg shadow-xl shadow-black/50 z-50 max-h-80 overflow-y-auto">
                <div className="p-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-800 px-3">
                  نتائج البحث ({filteredStocks.length})
                </div>
                {filteredStocks.map((stock) => (
                  <button
                    key={stock.code}
                    onClick={() => {
                      onSelectStock(stock);
                      setActiveTab('technical');
                      setSearchQuery('');
                      setIsSearchOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2.5 hover:bg-slate-800/80 transition-colors text-right border-b border-slate-800/40 last:border-0"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs tabular-nums">
                          {stock.code}
                        </span>
                        <span className="text-xs text-slate-300 font-medium">{stock.nameAr}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {stock.sector} · {stock.index}
                      </div>
                    </div>

                    <div className="text-left tabular-nums">
                      <div className="text-xs font-bold text-white">
                        {stock.price.toFixed(2)} ج.م
                      </div>
                      <div
                        className={`text-[11px] font-semibold flex items-center justify-end ${
                          stock.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {stock.change >= 0 ? '+' : ''}
                        {stock.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

        {/* Mobile / Tablet Nav Strip */}
        <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto mt-2.5 pb-1 text-xs whitespace-nowrap scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              activeTab === 'overview'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-300'
            }`}
          >
            حركة السوق
          </button>
          <button
            onClick={() => setActiveTab('liquidity')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              activeTab === 'liquidity'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-300'
            }`}
          >
            أكثر الأسهم سيولة
          </button>
          <button
            onClick={() => setActiveTab('watchlists')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              activeTab === 'watchlists'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-300'
            }`}
          >
            قوائم المراقبة
          </button>
          <button
            onClick={() => setActiveTab('technical')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              activeTab === 'technical'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-300'
            }`}
          >
            التحليل الفني والعميق
          </button>
          <button
            onClick={() => setActiveTab('news')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              activeTab === 'news'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-300'
            }`}
          >
            الأخبار والإفصاحات
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              activeTab === 'calculator'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-300'
            }`}
          >
            حاسبة العمولات
          </button>
          <button
            onClick={onOpenAlertsModal}
            className="px-3 py-1.5 rounded-md font-medium bg-slate-800 text-amber-300 border border-slate-700 flex items-center gap-1"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>التنبيهات ({alertsCount})</span>
          </button>
        </div>
      </div>
    </header>
  );
};
