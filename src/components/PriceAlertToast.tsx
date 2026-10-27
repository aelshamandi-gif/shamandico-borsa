import React from 'react';
import { PriceAlert, Stock } from '../types/market';
import { Bell, ArrowUpRight, ArrowDownRight, X, ExternalLink } from 'lucide-react';

interface PriceAlertToastProps {
  alerts: PriceAlert[];
  onDismiss: (alertId: string) => void;
  onViewStock: (stockCode: string) => void;
}

export const PriceAlertToast: React.FC<PriceAlertToastProps> = ({
  alerts,
  onDismiss,
  onViewStock,
}) => {
  if (alerts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="pointer-events-auto bg-slate-900/95 border-2 border-emerald-500/80 shadow-2xl shadow-emerald-950/80 rounded-2xl p-4 text-right backdrop-blur-md animate-in slide-in-from-bottom duration-300 transition-all text-xs"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                <Bell className="w-4 h-4 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-white text-sm">{alert.stockCode}</span>
                  <span className="text-[11px] text-slate-300 font-medium">
                    {alert.stockNameAr}
                  </span>
                </div>
                <div className="text-[11px] text-emerald-400 font-bold mt-0.5 flex items-center gap-1">
                  {alert.condition === 'ABOVE' ? (
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
                  )}
                  <span>
                    وصل للسعر المستهدف: {alert.targetPrice.toFixed(2)} ج.م
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onDismiss(alert.id)}
              className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
              title="إغلاق التنبيه"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 tabular-nums">
            <span>
              السعر المنفذ: <strong className="text-white">{alert.triggeredPrice?.toFixed(2)} ج.م</strong>
            </span>
            <button
              onClick={() => {
                onViewStock(alert.stockCode);
                onDismiss(alert.id);
              }}
              className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 transition-colors"
            >
              <span>فتح التحليل الفني</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
