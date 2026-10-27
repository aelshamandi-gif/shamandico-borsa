import React, { useState } from 'react';
import { PriceAlert, Stock, Watchlist } from '../types/market';
import {
  Bell,
  Plus,
  Trash2,
  X,
  Check,
  RefreshCw,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface PriceAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stocks: Stock[];
  watchlists: Watchlist[];
  activeWatchlist?: Watchlist;
  alerts: PriceAlert[];
  onCreateAlert: (
    stockCode: string,
    targetPrice: number,
    condition: 'ABOVE' | 'BELOW',
    note?: string,
    fromWatchlistId?: string
  ) => void;
  onDeleteAlert: (alertId: string) => void;
  onResetAlert: (alertId: string) => void;
  onSelectStock: (stock: Stock) => void;
  preselectedStock?: Stock | null;
}

export const PriceAlertsModal: React.FC<PriceAlertsModalProps> = ({
  isOpen,
  onClose,
  stocks,
  watchlists,
  activeWatchlist,
  alerts,
  onCreateAlert,
  onDeleteAlert,
  onResetAlert,
  onSelectStock,
  preselectedStock,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');
  const [filterList, setFilterList] = useState<'ALL' | 'ACTIVE' | 'TRIGGERED'>('ALL');

  const initialStockCode = preselectedStock?.code || activeWatchlist?.stockCodes[0] || stocks[0]?.code || 'COMI';
  const [selectedStockCode, setSelectedStockCode] = useState<string>(initialStockCode);

  const currentStock = stocks.find((s) => s.code === selectedStockCode) || stocks[0];
  const [targetPrice, setTargetPrice] = useState<number>(
    currentStock ? Number((currentStock.price * 1.05).toFixed(2)) : 100
  );
  const [condition, setCondition] = useState<'ABOVE' | 'BELOW'>('ABOVE');
  const [note, setNote] = useState<string>('');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStockChange = (code: string) => {
    setSelectedStockCode(code);
    const s = stocks.find((item) => item.code === code);
    if (s) {
      setTargetPrice(Number((s.price * (condition === 'ABOVE' ? 1.05 : 0.95)).toFixed(2)));
    }
  };

  const applyPercentOffset = (pct: number) => {
    if (!currentStock) return;
    const newPrice = Number((currentStock.price * (1 + pct / 100)).toFixed(2));
    setTargetPrice(newPrice);
    if (pct > 0) {
      setCondition('ABOVE');
    } else {
      setCondition('BELOW');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStock || targetPrice <= 0) return;

    onCreateAlert(
      currentStock.code,
      targetPrice,
      condition,
      note.trim() || undefined,
      activeWatchlist?.id
    );

    setSuccessNotice(`تم ضبط تنبيه لسهم ${currentStock.code} عند ${targetPrice.toFixed(2)} ج.م بنجاح!`);
    setTimeout(() => {
      setSuccessNotice(null);
      setActiveTab('list');
    }, 1000);
  };

  const filteredAlerts = alerts.filter((a) => {
    if (filterList === 'ACTIVE') return !a.triggered;
    if (filterList === 'TRIGGERED') return a.triggered;
    return true;
  });

  const activeAlertsCount = alerts.filter((a) => !a.triggered).length;
  const triggeredAlertsCount = alerts.filter((a) => a.triggered).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative my-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">تنبيهات الأسعار الفورية اللحظية</h3>
              <p className="text-xs text-slate-400">
                إشعار فوري عند وصول أي سهم في قائمة مراقبتك إلى السعر المستهدف
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2 my-4 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'create'
                ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700/60'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>ضبط تنبيه جديد</span>
          </button>

          <button
            onClick={() => setActiveTab('list')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'list'
                ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700/60'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>قائمة التنبيهات ({alerts.length})</span>
          </button>
        </div>

        {activeTab === 'create' && (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {successNotice && (
              <div className="p-3 bg-emerald-950/70 border border-emerald-500/50 rounded-xl text-center text-emerald-300 font-bold flex items-center justify-center gap-2">
                <Check className="w-4 h-4" />
                <span>{successNotice}</span>
              </div>
            )}

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                اختر السهم من القائمة *
              </label>
              <select
                value={selectedStockCode}
                onChange={(e) => handleStockChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-white p-2.5 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
              >
                {activeWatchlist && activeWatchlist.stockCodes.length > 0 && (
                  <optgroup label={`أسهم قائمة المراقبة (${activeWatchlist.name})`}>
                    {activeWatchlist.stockCodes.map((code) => {
                      const st = stocks.find((s) => s.code === code);
                      return (
                        <option key={`wl-${code}`} value={code}>
                          ⭐ {code} - {st?.nameAr} ({st?.price.toFixed(2)} ج.م)
                        </option>
                      );
                    })}
                  </optgroup>
                )}

                <optgroup label="جميع أسهم البورصة المصرية">
                  {stocks.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.code} - {s.nameAr} ({s.price.toFixed(2)} ج.م)
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {currentStock && (
              <div className="flex items-center justify-between p-3 bg-slate-950/80 rounded-xl border border-slate-800 tabular-nums">
                <div>
                  <span className="text-[11px] text-slate-400">السعر اللحظي الحالي للسهم:</span>
                  <div className="font-bold text-white text-sm mt-0.5">
                    {currentStock.price.toFixed(2)} ج.م
                  </div>
                </div>

                <div className="text-left">
                  <span className="text-[11px] text-slate-400">التغير اليومي:</span>
                  <div
                    className={`font-bold text-xs mt-0.5 ${
                      currentStock.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {currentStock.change >= 0 ? '+' : ''}
                    {currentStock.changePercent.toFixed(2)}%
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                شرط إطلاق التنبيه *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCondition('ABOVE')}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 font-semibold transition-all ${
                    condition === 'ABOVE'
                      ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                  <span>عندما يرتفع السعر إلى أو أعلى (≥)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCondition('BELOW')}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 font-semibold transition-all ${
                    condition === 'BELOW'
                      ? 'bg-rose-950/60 border-rose-500/60 text-rose-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <ArrowDownRight className="w-4 h-4 text-rose-400" />
                  <span>عندما ينخفض السعر إلى أو أدنى (≤)</span>
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-slate-300 font-semibold">
                  السعر المستهدف المطلوب للتنبيه (ج.م) *
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => applyPercentOffset(2)}
                    className="px-2 py-0.5 bg-slate-950 border border-slate-800 hover:border-emerald-500/40 rounded text-[10px] text-slate-300 font-mono"
                  >
                    +2%
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPercentOffset(5)}
                    className="px-2 py-0.5 bg-slate-950 border border-slate-800 hover:border-emerald-500/40 rounded text-[10px] text-slate-300 font-mono"
                  >
                    +5%
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPercentOffset(10)}
                    className="px-2 py-0.5 bg-slate-950 border border-slate-800 hover:border-emerald-500/40 rounded text-[10px] text-slate-300 font-mono"
                  >
                    +10%
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPercentOffset(-3)}
                    className="px-2 py-0.5 bg-slate-950 border border-slate-800 hover:border-rose-500/40 rounded text-[10px] text-slate-300 font-mono"
                  >
                    -3%
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPercentOffset(-5)}
                    className="px-2 py-0.5 bg-slate-950 border border-slate-800 hover:border-rose-500/40 rounded text-[10px] text-slate-300 font-mono"
                  >
                    -5%
                  </button>
                </div>
              </div>

              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={targetPrice}
                onChange={(e) => setTargetPrice(Number(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 text-sm font-bold text-white p-2.5 rounded-xl focus:outline-none focus:border-emerald-500 tabular-nums"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                ملاحظة على التنبيه (اختياري)
              </label>
              <input
                type="text"
                placeholder="مثال: هدف جني أرباح، أو كسر مقاومة، أو وقف خسارة..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-white p-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all"
              >
                تفعيل التنبيه الفوري
              </button>
            </div>
          </form>
        )}

        {activeTab === 'list' && (
          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setFilterList('ALL')}
                className={`px-3 py-1 rounded-lg border transition-all ${
                  filterList === 'ALL'
                    ? 'bg-slate-800 border-slate-700 text-white font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                الكل ({alerts.length})
              </button>
              <button
                onClick={() => setFilterList('ACTIVE')}
                className={`px-3 py-1 rounded-lg border transition-all ${
                  filterList === 'ACTIVE'
                    ? 'bg-emerald-950 border-emerald-500/50 text-emerald-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                قيد الانتظار ({activeAlertsCount})
              </button>
              <button
                onClick={() => setFilterList('TRIGGERED')}
                className={`px-3 py-1 rounded-lg border transition-all ${
                  filterList === 'TRIGGERED'
                    ? 'bg-amber-950 border-amber-500/50 text-amber-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                تم إطلاقها ({triggeredAlertsCount})
              </button>
            </div>

            {filteredAlerts.length === 0 ? (
              <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-800 text-slate-400">
                <Bell className="w-6 h-6 mx-auto mb-2 text-slate-500" />
                <p>لا توجد تنبيهات في هذا القسم حالياً.</p>
              </div>
            ) : (
              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {filteredAlerts.map((alert) => {
                  const stockObj = stocks.find((s) => s.code === alert.stockCode);
                  const currentP = stockObj ? stockObj.price : 0;
                  return (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-xl border transition-all ${
                        alert.triggered
                          ? 'bg-amber-950/20 border-amber-500/40'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs tabular-nums">
                              {alert.stockCode}
                            </span>
                            <span className="text-[11px] text-slate-300">{alert.stockNameAr}</span>
                            {alert.triggered ? (
                              <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-500/40">
                                تم إطلاقه 🔔
                              </span>
                            ) : (
                              <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                                قيد الانتظار
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1 tabular-nums">
                            <span>
                              الهدف: <strong className="text-white">{alert.targetPrice.toFixed(2)} ج.م</strong>{' '}
                              ({alert.condition === 'ABOVE' ? 'صعوداً ≥' : 'هبوطاً ≤'})
                            </span>
                            <span>·</span>
                            <span>
                              السعر الحالي:{' '}
                              <strong className="text-slate-200">{currentP.toFixed(2)} ج.م</strong>
                            </span>
                          </div>

                          {alert.note && (
                            <p className="text-[10px] text-slate-500 mt-1">{alert.note}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {alert.triggered && (
                            <button
                              onClick={() => onResetAlert(alert.id)}
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition-colors"
                              title="إعادة تفعيل التنبيه"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {stockObj && (
                            <button
                              onClick={() => {
                                onSelectStock(stockObj);
                                onClose();
                              }}
                              className="p-1 rounded bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white transition-colors"
                              title="فتح التحليل الفني"
                            >
                              <Layers className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => onDeleteAlert(alert.id)}
                            className="p-1 rounded bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors"
                            title="حذف التنبيه"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-end pt-3">
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
              >
                إغلاق
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
