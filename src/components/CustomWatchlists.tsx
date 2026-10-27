import React, { useState } from 'react';
import { Stock, Watchlist } from '../types/market';
import {
  Bookmark,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Layers,
  X,
  Search,
  Check,
  DollarSign,
  PieChart,
  BarChart3,
  Sparkles,
  AlertCircle,
  Bell,
} from 'lucide-react';

interface CustomWatchlistsProps {
  stocks: Stock[];
  watchlists: Watchlist[];
  activeWatchlistId: string;
  setActiveWatchlistId: (id: string) => void;
  onCreateWatchlist: (name: string, description?: string) => void;
  onDeleteWatchlist: (id: string) => void;
  onAddToWatchlist: (watchlistId: string, stockCode: string) => void;
  onRemoveFromWatchlist: (watchlistId: string, stockCode: string) => void;
  onSelectStock: (stock: Stock) => void;
  onSetAlertForStock?: (stock: Stock) => void;
  onViewReport?: (watchlistId: string) => void;
}

export const CustomWatchlists: React.FC<CustomWatchlistsProps> = ({
  stocks,
  watchlists,
  activeWatchlistId,
  setActiveWatchlistId,
  onCreateWatchlist,
  onDeleteWatchlist,
  onAddToWatchlist,
  onRemoveFromWatchlist,
  onSelectStock,
  onSetAlertForStock,
  onViewReport,
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDesc, setNewListDesc] = useState('');

  // Add stock to active list picker state
  const [isAddStockOpen, setIsAddStockOpen] = useState(false);
  const [stockSearchTerm, setStockSearchTerm] = useState('');

  const currentWatchlist =
    watchlists.find((wl) => wl.id === activeWatchlistId) || watchlists[0] || null;

  // Stocks currently inside this active watchlist
  const watchlistStocks = currentWatchlist
    ? currentWatchlist.stockCodes
        .map((code) => stocks.find((s) => s.code === code))
        .filter((s): s is Stock => s !== undefined)
    : [];

  // Available stocks to add (stocks not yet in this watchlist)
  const availableToAdd = currentWatchlist
    ? stocks.filter((s) => !currentWatchlist.stockCodes.includes(s.code))
    : stocks;

  const filteredAvailable = availableToAdd.filter(
    (s) =>
      s.code.toLowerCase().includes(stockSearchTerm.toLowerCase()) ||
      s.nameAr.includes(stockSearchTerm) ||
      s.sector.includes(stockSearchTerm)
  );

  // Quick Performance Summary for the active watchlist
  const count = watchlistStocks.length;
  const avgChangePercent =
    count > 0 ? watchlistStocks.reduce((sum, s) => sum + s.changePercent, 0) / count : 0;
  const totalTurnover =
    count > 0 ? watchlistStocks.reduce((sum, s) => sum + s.turnover, 0) : 0;
  const totalMarketCap =
    count > 0 ? watchlistStocks.reduce((sum, s) => sum + s.marketCap, 0) : 0;

  const greenCount = watchlistStocks.filter((s) => s.changePercent > 0).length;
  const redCount = watchlistStocks.filter((s) => s.changePercent < 0).length;
  const neutralCount = watchlistStocks.filter((s) => s.changePercent === 0).length;

  const bestStock =
    count > 0
      ? [...watchlistStocks].sort((a, b) => b.changePercent - a.changePercent)[0]
      : null;
  const worstStock =
    count > 0
      ? [...watchlistStocks].sort((a, b) => a.changePercent - b.changePercent)[0]
      : null;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    onCreateWatchlist(newListName.trim(), newListDesc.trim());
    setNewListName('');
    setNewListDesc('');
    setIsCreateModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Section: Header & Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-1">
            <Bookmark className="w-4 h-4" />
            <span>إدارة وتتبع المحافظ وقوائم المراقبة المخصصة</span>
          </div>
          <h2 className="text-xl font-black text-white">
            قوائم المراقبة الشخصية وملخص الأداء اللحظي
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            أنشئ قوائمك الخاصة لمتابعة أسهمك المفضلة، قطاعات معينة، أو استراتيجيات المضاربة
            والاستثمار طويل الأجل مع تحليل أداء مجمع لكل قائمة.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>إنشاء قائمة مراقبة جديدة</span>
        </button>
      </div>

      {/* Watchlist Tabs Bar */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-2">
          {watchlists.map((wl) => {
            const isActive = wl.id === activeWatchlistId;
            return (
              <button
                key={wl.id}
                onClick={() => setActiveWatchlistId(wl.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border shrink-0 ${
                  isActive
                    ? 'bg-slate-800 border-emerald-500/60 text-white shadow-md'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Bookmark
                  className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`}
                />
                <span>{wl.name}</span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] tabular-nums ${
                    isActive ? 'bg-emerald-950 text-emerald-300' : 'bg-slate-950 text-slate-500'
                  }`}
                >
                  {wl.stockCodes.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Delete current watchlist button (if not default) */}
        {currentWatchlist && !currentWatchlist.isDefault && (
          <button
            onClick={() => onDeleteWatchlist(currentWatchlist.id)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-500/40 rounded-xl transition-colors shrink-0"
            title="حذف هذه القائمة"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">حذف القائمة</span>
          </button>
        )}
      </div>

      {/* Quick Performance Summary Strip for Selected Watchlist */}
      {currentWatchlist && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{currentWatchlist.name}</h3>
                <span className="text-[11px] text-slate-500 font-medium">
                  {watchlistStocks.length} أسهم مدرجة
                </span>
              </div>
              {currentWatchlist.description && (
                <p className="text-xs text-slate-400 mt-1">{currentWatchlist.description}</p>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {onViewReport && (
                <button
                  onClick={() => onViewReport(currentWatchlist.id)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-950/70 border border-indigo-500/40 hover:bg-indigo-900/60 text-indigo-300 text-xs font-semibold transition-all shrink-0"
                  title="عرض تقرير العائد الأسبوعي والشهري ومقارنته بمؤشر EGX 30"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>تقرير أداء القائمة ومقارنة EGX30</span>
                </button>
              )}

              {/* Add stock trigger */}
              <button
                onClick={() => setIsAddStockOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 hover:bg-emerald-900/50 text-emerald-300 text-xs font-semibold transition-all shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة سهم إلى هذه القائمة</span>
              </button>
            </div>
          </div>

          {/* Aggregate KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4 text-xs">
            {/* Avg Performance */}
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
              <div className="text-[11px] text-slate-400 font-medium">متوسط أداء القائمة</div>
              <div
                className={`text-base font-black tabular-nums mt-1 flex items-center gap-1 ${
                  avgChangePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {avgChangePercent >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>
                  {avgChangePercent >= 0 ? '+' : ''}
                  {avgChangePercent.toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Total Turnover */}
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
              <div className="text-[11px] text-slate-400 font-medium">إجمالي السيولة</div>
              <div className="text-base font-bold text-amber-400 tabular-nums mt-1">
                {(totalTurnover / 1e6).toFixed(1)}
                <span className="text-xs mr-1 text-slate-400 font-normal">مليون ج.م</span>
              </div>
            </div>

            {/* Distribution */}
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
              <div className="text-[11px] text-slate-400 font-medium">صعود / هبوط</div>
              <div className="text-sm font-bold tabular-nums mt-1 flex items-center gap-2">
                <span className="text-emerald-400">{greenCount} صاعد</span>
                <span className="text-slate-600">·</span>
                <span className="text-rose-400">{redCount} هابط</span>
              </div>
            </div>

            {/* Best Performer */}
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
              <div className="text-[11px] text-slate-400 font-medium">أفضل سهم أداءً</div>
              {bestStock ? (
                <div className="mt-1 flex items-center justify-between">
                  <span className="font-bold text-white text-xs">{bestStock.code}</span>
                  <span className="font-bold text-emerald-400 tabular-nums text-xs">
                    +{bestStock.changePercent.toFixed(2)}%
                  </span>
                </div>
              ) : (
                <div className="text-slate-500 mt-1">-</div>
              )}
            </div>

            {/* Worst Performer */}
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
              <div className="text-[11px] text-slate-400 font-medium">أدنى سهم أداءً</div>
              {worstStock ? (
                <div className="mt-1 flex items-center justify-between">
                  <span className="font-bold text-white text-xs">{worstStock.code}</span>
                  <span
                    className={`font-bold tabular-nums text-xs ${
                      worstStock.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {worstStock.changePercent.toFixed(2)}%
                  </span>
                </div>
              ) : (
                <div className="text-slate-500 mt-1">-</div>
              )}
            </div>

            {/* Total Market Cap */}
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
              <div className="text-[11px] text-slate-400 font-medium">رأس المال السوقي</div>
              <div className="text-base font-bold text-slate-200 tabular-nums mt-1">
                {totalMarketCap.toFixed(1)}
                <span className="text-xs mr-1 text-slate-400 font-normal">مليار ج.م</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stocks Table in Active Watchlist */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        {watchlistStocks.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Bookmark className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">هذه القائمة فارغة حالياً</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              أضف الأسهم التي تود متابعتها في هذه القائمة لمراقبة أسعارها وتحركات سيولتها اللحظية.
            </p>
            <button
              onClick={() => setIsAddStockOpen(true)}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة أسهم للقائمة الآن</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-medium">
                <tr>
                  <th className="py-3 px-4">السهم / الكود</th>
                  <th className="py-3 px-3">السعر والتغير</th>
                  <th className="py-3 px-3">قيمة التداول (السيولة)</th>
                  <th className="py-3 px-3">نسبة السيولة الداخلة</th>
                  <th className="py-3 px-3">مؤشر الأموال الذكية</th>
                  <th className="py-3 px-3">مكرر الربحية P/E</th>
                  <th className="py-3 px-3">القيمة العادلة</th>
                  <th className="py-3 px-3">هامش الأمان</th>
                  <th className="py-3 px-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 tabular-nums">
                {watchlistStocks.map((stock) => (
                  <tr
                    key={stock.code}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Stock Code & Name */}
                    <td className="py-3 px-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onSelectStock(stock)}
                            className="font-bold text-white hover:text-emerald-400 transition-colors text-xs"
                          >
                            {stock.code}
                          </button>
                          <span className="text-[10px] text-slate-400 px-1.5 py-0.2 bg-slate-950 border border-slate-800 rounded">
                            {stock.sector}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[170px] mt-0.5">
                          {stock.nameAr}
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
                        {(stock.turnover / 1e6).toFixed(1)} مليون ج.م
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {stock.tradesCount.toLocaleString()} صفقة
                      </div>
                    </td>

                    {/* Inflow % */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-400">{stock.inflowPercent}%</span>
                        <div className="h-1.5 w-16 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${stock.inflowPercent}%` }}
                            className="bg-emerald-500 h-full"
                          />
                        </div>
                      </div>
                    </td>

                    {/* Smart Money */}
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-200">
                        {stock.smartMoneyIndex}/100
                      </span>
                    </td>

                    {/* P/E */}
                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-300">{stock.peRatio}x</span>
                    </td>

                    {/* Fair Value */}
                    <td className="py-3 px-3">
                      <span className="font-bold text-white">{stock.fairValue.toFixed(2)} ج.م</span>
                    </td>

                    {/* Margin of Safety */}
                    <td className="py-3 px-3">
                      <span
                        className={`font-bold ${
                          stock.marginOfSafety >= 20
                            ? 'text-emerald-400'
                            : stock.marginOfSafety > 0
                            ? 'text-teal-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {stock.marginOfSafety > 0 ? '+' : ''}
                        {stock.marginOfSafety.toFixed(1)}%
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onSelectStock(stock)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white transition-colors text-[11px] font-semibold border border-slate-700/60"
                          title="تحليل فني متقدم"
                        >
                          <Layers className="w-3 h-3" />
                          <span>تحليل عميق</span>
                        </button>

                        {onSetAlertForStock && (
                          <button
                            onClick={() => onSetAlertForStock(stock)}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-300 transition-colors border border-slate-700/60"
                            title="ضبط تنبيه سعري فوري لهذا السهم"
                          >
                            <Bell className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => onRemoveFromWatchlist(currentWatchlist.id, stock.code)}
                          className="p-1 rounded bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors border border-slate-700/60"
                          title="إزالة السهم من هذه القائمة"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create New Watchlist Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">إنشاء قائمة مراقبة مخصصة جديدة</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  اسم قائمة المراقبة *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: أسهم المضاربة، البتروكيماويات، المحفظة الذهبية..."
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-white p-2.5 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  وصف مختصر (اختياري)
                </label>
                <input
                  type="text"
                  placeholder="مثال: متابعة يومية لأسهم الخروج والدخول السريع"
                  value={newListDesc}
                  onChange={(e) => setNewListDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-white p-2.5 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20"
                >
                  حفظ القائمة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Stock to Active Watchlist Modal */}
      {isAddStockOpen && currentWatchlist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">
                  إضافة أسهم إلى "{currentWatchlist.name}"
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  انقر على أي سهم لإضافته مباشرة للقائمة الحالية
                </p>
              </div>
              <button
                onClick={() => setIsAddStockOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ابحث بكود السهم أو اسم الشركة..."
                value={stockSearchTerm}
                onChange={(e) => setStockSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 pr-9 pl-3 py-2 rounded-lg placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* List of Available Stocks */}
            <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60 border border-slate-800 rounded-xl bg-slate-950/60 p-1">
              {filteredAvailable.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  جميع الأسهم المطابقة موجودة بالفعل في قائمتك أو لا توجد نتائج
                </div>
              ) : (
                filteredAvailable.map((stock) => (
                  <div
                    key={stock.code}
                    className="p-2.5 flex items-center justify-between hover:bg-slate-800/60 rounded-lg transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs tabular-nums">
                          {stock.code}
                        </span>
                        <span className="text-xs text-slate-300 font-medium">{stock.nameAr}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {stock.sector} · {stock.price.toFixed(2)} ج.م (
                        <span
                          className={stock.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}
                        >
                          {stock.change >= 0 ? '+' : ''}
                          {stock.changePercent.toFixed(2)}%
                        </span>
                        )
                      </div>
                    </div>

                    <button
                      onClick={() => onAddToWatchlist(currentWatchlist.id, stock.code)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-[11px] font-bold transition-colors"
                    >
                      + إضافة
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setIsAddStockOpen(false)}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                تم الإنتهاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
