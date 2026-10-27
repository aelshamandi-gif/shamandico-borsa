import React from 'react';
import { LiveTradeTick, Stock } from '../types/market';
import { ArrowUpRight, ArrowDownRight, Radio, ExternalLink } from 'lucide-react';

interface LiveTradeTapeProps {
  recentTicks: LiveTradeTick[];
  onSelectStockCode: (stockCode: string) => void;
  isSimulating: boolean;
  tickSpeed: 'fastest' | 'fast' | 'normal';
  setTickSpeed: (speed: 'fastest' | 'fast' | 'normal') => void;
}

export const LiveTradeTape: React.FC<LiveTradeTapeProps> = ({
  recentTicks,
  onSelectStockCode,
  isSimulating,
  tickSpeed,
  setTickSpeed,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-bold text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>بث الصفقات اللحظية المباشر (Time & Sales Tape)</span>
          </div>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            تنفيذات حية متتالية لأسهم البورصة المصرية
          </span>
        </div>

        {/* Speed toggle */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400">سرعة البث:</span>
          <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
            <button
              onClick={() => setTickSpeed('fastest')}
              className={`px-2 py-0.5 rounded font-semibold transition-all ${
                tickSpeed === 'fastest'
                  ? 'bg-slate-800 text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              فائق (0.8ث)
            </button>
            <button
              onClick={() => setTickSpeed('fast')}
              className={`px-2 py-0.5 rounded font-semibold transition-all ${
                tickSpeed === 'fast'
                  ? 'bg-slate-800 text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              مباشر (1.5ث)
            </button>
            <button
              onClick={() => setTickSpeed('normal')}
              className={`px-2 py-0.5 rounded font-semibold transition-all ${
                tickSpeed === 'normal'
                  ? 'bg-slate-800 text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              عادي (3ث)
            </button>
          </div>
        </div>
      </div>

      {/* Ticker Row */}
      <div className="flex items-center gap-2 overflow-x-auto pt-2.5 scrollbar-none whitespace-nowrap">
        {recentTicks.slice(0, 10).map((tick) => {
          const isBuy = tick.type === 'BUY';
          return (
            <button
              key={tick.id}
              onClick={() => onSelectStockCode(tick.stockCode)}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-all text-right shrink-0 hover:scale-105 active:scale-95 ${
                isBuy
                  ? 'bg-emerald-950/30 border-emerald-500/30 hover:border-emerald-500/60'
                  : 'bg-rose-950/30 border-rose-500/30 hover:border-rose-500/60'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white text-xs font-mono">{tick.stockCode}</span>
                <span className="text-[10px] text-slate-400 font-mono">{tick.time}</span>
              </div>

              <div className="flex items-center gap-1 tabular-nums">
                <span className="font-black text-xs text-white">{tick.price.toFixed(2)} ج.م</span>
                <span
                  className={`text-[10px] font-bold flex items-center ${
                    isBuy ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isBuy ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {isBuy ? 'شراء' : 'بيع'}
                </span>
              </div>

              <div className="text-[10px] text-slate-400 tabular-nums border-r border-slate-800/80 pr-1.5">
                {tick.quantity.toLocaleString()} سهم
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
