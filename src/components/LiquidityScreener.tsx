import React, { useState } from 'react';
import { Stock, Watchlist } from '../types/market';
import {
  Flame,
  ArrowUpDown,
  Filter,
  Layers,
  BookmarkPlus,
  TrendingUp,
  TrendingDown,
  Info,
  Check,
  Search,
  Sparkles,
} from 'lucide-react';

interface LiquidityScreenerProps {
  stocks: Stock[];
  watchlists: Watchlist[];
  onSelectStock: (stock: Stock) => void;
  onAddToWatchlist: (watchlistId: string, stockCode: string) => void;
}

export const LiquidityScreener: React.FC<LiquidityScreenerProps> = ({
  stocks,
  watchlists,
  onSelectStock,
  onAddToWatchlist,
}) => {
  const [filterMarketType, setFilterMarketType] = useState<'ALL' | 'INSIDE_CABIN' | 'OTC'>('ALL');
  const [filterIndex, setFilterIndex] = useState<'ALL' | 'EGX30' | 'EGX70' | 'Tamayuz'>('ALL');
  const [filterSector, setFilterSector] = useState<string>('ALL');
  const [filterFlow, setFilterFlow] = useState<'ALL' | 'INFLOW' | 'HIGH_TURNOVER'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<
    'turnover' | 'inflowPercent' | 'netInflow' | 'volume' | 'changePercent' | 'smartMoneyIndex'
  >('turnover');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Watchlist selector modal state
  const [selectedStockForWatchlist, setSelectedStockForWatchlist] = useState<Stock | null>(null);
  const [addedSuccessMessage, setAddedSuccessMessage] = useState<string | null>(null);

  const sectors = Array.from(new Set(stocks.map((s) => s.sector)));

  // Aggregate market type counts
  const insideCabinCount = stocks.filter((s) => s.marketType !== 'OTC').length;
  const otcCount = stocks.filter((s) => s.marketType === 'OTC').length;

  // Filter stocks
  const filtered = stocks.filter((stock) => {
    const stockMarketType = stock.marketType || (stock.code.startsWith('EGS') ? 'OTC' : 'INSIDE_CABIN');
    if (filterMarketType !== 'ALL' && stockMarketType !== filterMarketType) return false;
    if (filterIndex !== 'ALL' && stock.index !== filterIndex) return false;
    if (filterSector !== 'ALL' && stock.sector !== filterSector) return false;
    if (filterFlow === 'INFLOW' && stock.inflowPercent < 55) return false;
    if (filterFlow === 'HIGH_TURNOVER' && stock.turnover < 50000000) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        stock.code.toLowerCase().includes(q) ||
        stock.nameAr.includes(q) ||
        stock.nameEn.toLowerCase().includes(q) ||
        (stock.isin && stock.isin.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  // Sort stocks
  const sorted = [...filtered].sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];
    if (sortOrder === 'desc') {
      return valB > valA ? 1 : -1;
    } else {
      return valA > valB ? 1 : -1;
    }
  });

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleAddStock = (watchlistId: string, stockCode: string) => {
    onAddToWatchlist(watchlistId, stockCode);
    setAddedSuccessMessage(`تمت إضافة ${stockCode} إلى قائمة المراقبة بنجاح`);
    setTimeout(() => {
      setAddedSuccessMessage(null);
      setSelectedStockForWatchlist(null);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Title & Explanatory Kicker */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-1">
            <Flame className="w-4 h-4" />
            <span>رادار السيولة وتدفقات الأموال الذكية (Smart Money Flow)</span>
          </div>
          <h2 className="text-xl font-black text-white">
            ترتيب أسهم البورصة المصرية حسب السيولة النقدية والتداولات
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            السيولة هي المحرك الأساسي لحركة الأسعار في البورصة المصرية؛ حيث توضح نسبة السيولة
            الداخلة (الطلبات المنفذة على العرض) مقارنة بالخارجة (البيع على الطلب) ومعدل دوران السهم.
          </p>
        </div>

        {/* Quick Filter Counts */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800 shrink-0 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">المطابق:</span>
            <span className="font-bold text-emerald-400 tabular-nums">{sorted.length}</span>
            <span className="text-slate-400">سهم</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-300">داخل المقصورة:</span>
            <span className="font-bold text-emerald-300 tabular-nums">{insideCabinCount}</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-slate-300">خارج المقصورة (OTC):</span>
            <span className="font-bold text-amber-300 tabular-nums">{otcCount}</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3.5">
        {/* Primary Market Classification Switcher (داخل المقصورة / خارج المقصورة) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => {
                setFilterMarketType('ALL');
                setFilterIndex('ALL');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-bold transition-all ${
                filterMarketType === 'ALL'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>جميع أسهم البورصة المصرية</span>
              <span className="px-1.5 py-0.2 bg-slate-900 rounded text-[10px] text-slate-300 font-mono">
                {stocks.length}
              </span>
            </button>

            <button
              onClick={() => {
                setFilterMarketType('INSIDE_CABIN');
                setFilterIndex('ALL');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-bold transition-all ${
                filterMarketType === 'INSIDE_CABIN'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-emerald-400 hover:text-emerald-300'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>داخل المقصورة (السوق الرئيسي المقيد)</span>
              <span className="px-1.5 py-0.2 bg-emerald-950/80 rounded text-[10px] text-emerald-200 font-mono">
                {insideCabinCount}
              </span>
            </button>

            <button
              onClick={() => {
                setFilterMarketType('OTC');
                setFilterIndex('ALL');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-bold transition-all ${
                filterMarketType === 'OTC'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                  : 'text-amber-400 hover:text-amber-300'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>خارج المقصورة (سوق الصفقات والأوامر OTC)</span>
              <span className="px-1.5 py-0.2 bg-amber-950/80 rounded text-[10px] text-amber-200 font-mono">
                {otcCount}
              </span>
            </button>
          </div>

          {filterMarketType === 'OTC' && (
            <div className="text-xs text-amber-300/90 bg-amber-950/40 border border-amber-500/30 px-3 py-1.5 rounded-lg flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" />
              <span>
                سوق خارج المقصورة يشمل نقل ملكية الشركات والصفقات الخاصة وعروض الشراء المقيدة بنظام المقاصة المصرية MCDR.
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Index Tabs (Available when ALL or INSIDE_CABIN) */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800/80 text-xs">
            <button
              onClick={() => setFilterIndex('ALL')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                filterIndex === 'ALL'
                  ? 'bg-slate-800 text-white font-bold border border-slate-700/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              كل المؤشرات
            </button>
            <button
              onClick={() => setFilterIndex('EGX30')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                filterIndex === 'EGX30'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              EGX 30
            </button>
            <button
              onClick={() => setFilterIndex('EGX70')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                filterIndex === 'EGX70'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              EGX 70
            </button>
            <button
              onClick={() => setFilterIndex('Tamayuz')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                filterIndex === 'Tamayuz'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              تميز (بورصة النيل)
            </button>
          </div>

          {/* Flow Category Filters */}
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setFilterFlow('ALL')}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                filterFlow === 'ALL'
                  ? 'bg-slate-800 border-slate-700 text-white font-semibold'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              كل السيولة
            </button>
            <button
              onClick={() => setFilterFlow('INFLOW')}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                filterFlow === 'INFLOW'
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 font-bold'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              سيولة شرائية داخلة {'>'} 55%
            </button>
            <button
              onClick={() => setFilterFlow('HIGH_TURNOVER')}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                filterFlow === 'HIGH_TURNOVER'
                  ? 'bg-amber-950/60 border-amber-500/50 text-amber-300 font-bold'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              تداول قياسي {'>'} 100 مليون ج.م
            </button>
          </div>

          {/* Sector Dropdown */}
          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterSector}
              onChange={(e) => setFilterSector(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs py-1.5 px-3 rounded-lg focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">جميع القطاعات</option>
              {sectors.map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="relative w-48 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="تصفية بالقائمة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 pr-8 pl-2.5 py-1.5 rounded-lg placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Main Liquidity Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-medium">
              <tr>
                <th className="py-3 px-4">السهم / الكود</th>
                <th className="py-3 px-3">
                  <button
                    onClick={() => handleSort('changePercent')}
                    className="flex items-center gap-1 hover:text-white transition-colors"
                  >
                    <span>السعر والتغير</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </button>
                </th>
                <th className="py-3 px-3">
                  <button
                    onClick={() => handleSort('turnover')}
                    className="flex items-center gap-1 hover:text-white transition-colors text-amber-400 font-bold"
                  >
                    <span>قيمة التداول (السيولة)</span>
                    <ArrowUpDown className="w-3 h-3 text-amber-400" />
                  </button>
                </th>
                <th className="py-3 px-3">
                  <button
                    onClick={() => handleSort('volume')}
                    className="flex items-center gap-1 hover:text-white transition-colors"
                  >
                    <span>كمية التداول</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </button>
                </th>
                <th className="py-3 px-3 min-w-[150px]">
                  <button
                    onClick={() => handleSort('inflowPercent')}
                    className="flex items-center gap-1 hover:text-white transition-colors"
                  >
                    <span>نسبة السيولة (داخلة / خارجة)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </button>
                </th>
                <th className="py-3 px-3">
                  <button
                    onClick={() => handleSort('netInflow')}
                    className="flex items-center gap-1 hover:text-white transition-colors"
                  >
                    <span>صافي السيولة</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </button>
                </th>
                <th className="py-3 px-3">
                  <button
                    onClick={() => handleSort('smartMoneyIndex')}
                    className="flex items-center gap-1 hover:text-white transition-colors"
                  >
                    <span>الأموال الذكية</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </button>
                </th>
                <th className="py-3 px-3">حصة السوق</th>
                <th className="py-3 px-4 text-center">إجراءات سريعة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 tabular-nums">
              {sorted.map((stock, idx) => (
                <tr
                  key={stock.code}
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  {/* Stock Code & Name */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 text-center text-[10px] text-slate-500 font-mono">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            onClick={() => onSelectStock(stock)}
                            className="font-bold text-white hover:text-emerald-400 transition-colors text-xs font-mono"
                          >
                            {stock.code}
                          </button>
                          {stock.marketType === 'OTC' ? (
                            <span className="text-[9px] font-bold text-amber-300 bg-amber-950/90 border border-amber-500/50 px-1.5 py-0.5 rounded">
                              خارج المقصورة OTC
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                              داخل المقصورة
                            </span>
                          )}
                          <span className="text-[9px] text-slate-400 px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded">
                            {stock.index}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-300 truncate max-w-[190px] mt-1 font-medium">
                          {stock.nameAr}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[190px]">
                          {stock.sector}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Price & Change */}
                  <td className="py-3 px-3">
                    <div className="font-bold text-white">{stock.price.toFixed(2)} ج.م</div>
                    <div
                      className={`text-[11px] font-semibold flex items-center gap-0.5 mt-0.5 ${
                        stock.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {stock.change >= 0 ? '+' : ''}
                      {stock.changePercent.toFixed(2)}%
                    </div>
                  </td>

                  {/* Turnover */}
                  <td className="py-3 px-3">
                    <div className="font-bold text-amber-400 text-xs">
                      {(stock.turnover / 1e6).toFixed(2)}
                      <span className="text-[10px] mr-1 text-slate-400 font-normal">مليون ج.م</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {stock.tradesCount.toLocaleString()} صفقة
                    </div>
                  </td>

                  {/* Volume */}
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-200 text-xs">
                      {(stock.volume / 1e6).toFixed(2)}M
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      معدل الصفقة: {(stock.avgTradeSize / 1e3).toFixed(1)}k ج.م
                    </div>
                  </td>

                  {/* Inflow vs Outflow Visual Bar */}
                  <td className="py-3 px-3">
                    <div className="flex items-center justify-between text-[11px] mb-1 font-semibold">
                      <span className="text-emerald-400">داخلة {stock.inflowPercent}%</span>
                      <span className="text-rose-400">خارجة {stock.outflowPercent}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
                      <div
                        style={{ width: `${stock.inflowPercent}%` }}
                        className="bg-emerald-500 h-full"
                      />
                      <div
                        style={{ width: `${stock.outflowPercent}%` }}
                        className="bg-rose-500 h-full"
                      />
                    </div>
                  </td>

                  {/* Net Inflow */}
                  <td className="py-3 px-3">
                    <div
                      className={`font-bold text-xs ${
                        stock.netInflow >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {stock.netInflow >= 0 ? '+' : ''}
                      {(stock.netInflow / 1e6).toFixed(2)}M ج.م
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {stock.netInflow >= 0 ? 'ضغط شرائي' : 'ضغط بيعي'}
                    </div>
                  </td>

                  {/* Smart Money Index */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          stock.smartMoneyIndex >= 85
                            ? 'bg-emerald-500'
                            : stock.smartMoneyIndex >= 70
                            ? 'bg-amber-500'
                            : 'bg-slate-500'
                        }`}
                      />
                      <span className="font-bold text-slate-200">
                        {stock.smartMoneyIndex}
                        <span className="text-[10px] text-slate-500 font-normal">/100</span>
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {stock.smartMoneyIndex >= 85
                        ? 'تجميع مكثف'
                        : stock.smartMoneyIndex >= 70
                        ? 'نشاط ملحوظ'
                        : 'عادي'}
                    </div>
                  </td>

                  {/* Turnover Ratio */}
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-300">{stock.turnoverRatio}%</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">من سيولة السوق</div>
                  </td>

                  {/* Quick Actions */}
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Deep Analysis Button */}
                      <button
                        onClick={() => onSelectStock(stock)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white transition-colors text-[11px] font-semibold border border-slate-700/60"
                        title="تحليل فني وعميق للسهم"
                      >
                        <Layers className="w-3 h-3" />
                        <span>تحليل عميق</span>
                      </button>

                      {/* Add to Watchlist Button */}
                      <button
                        onClick={() => setSelectedStockForWatchlist(stock)}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition-colors border border-slate-700/60"
                        title="إضافة إلى قائمة مراقبة مخصصة"
                      >
                        <BookmarkPlus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add To Watchlist Modal */}
      {selectedStockForWatchlist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <h3 className="text-base font-bold text-white mb-1">
              إضافة السهم ({selectedStockForWatchlist.code} - {selectedStockForWatchlist.nameAr})
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              اختر إحدى قوائم المراقبة المخصصة لإضافة السهم إليها:
            </p>

            {addedSuccessMessage ? (
              <div className="p-3 bg-emerald-950/70 border border-emerald-500/50 rounded-xl text-center text-xs text-emerald-300 flex items-center justify-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{addedSuccessMessage}</span>
              </div>
            ) : (
              <div className="space-y-2 mb-4">
                {watchlists.map((wl) => {
                  const alreadyInList = wl.stockCodes.includes(selectedStockForWatchlist.code);
                  return (
                    <button
                      key={wl.id}
                      disabled={alreadyInList}
                      onClick={() => handleAddStock(wl.id, selectedStockForWatchlist.code)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-right ${
                        alreadyInList
                          ? 'bg-slate-950/40 border-slate-800 opacity-60 cursor-not-allowed'
                          : 'bg-slate-950 border-slate-800 hover:border-emerald-500/60 hover:bg-slate-800/60'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs text-white">{wl.name}</div>
                        {wl.description && (
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {wl.description}
                          </div>
                        )}
                      </div>

                      <div className="text-[11px] font-semibold text-slate-400 shrink-0">
                        {alreadyInList ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            موجود بالفعل
                          </span>
                        ) : (
                          <span className="text-slate-300">+ إضافة</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setSelectedStockForWatchlist(null)}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
