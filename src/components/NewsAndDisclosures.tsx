import React, { useState } from 'react';
import { MarketNewsItem, Stock } from '../types/market';
import {
  Globe,
  Building,
  FileText,
  Search,
  Filter,
  ArrowUpRight,
  Clock,
  ExternalLink,
  ChevronLeft,
  X,
  Newspaper,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

interface NewsAndDisclosuresProps {
  newsItems: MarketNewsItem[];
  stocks: Stock[];
  onSelectStock: (stock: Stock) => void;
}

export const NewsAndDisclosures: React.FC<NewsAndDisclosuresProps> = ({
  newsItems,
  stocks,
  onSelectStock,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'EGX' | 'GLOBAL' | 'DISCLOSURE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStockFilter, setSelectedStockFilter] = useState<string>('ALL');
  const [activeArticle, setActiveArticle] = useState<MarketNewsItem | null>(null);

  const filteredNews = newsItems.filter((item) => {
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    if (selectedStockFilter !== 'ALL' && item.relatedStockCode !== selectedStockFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        (item.relatedStockCode && item.relatedStockCode.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-1">
              <Newspaper className="w-4 h-4" />
              <span>مركز الأخبار الاقتصادية وإفصاحات البورصة المصرية</span>
            </div>
            <h2 className="text-xl font-black text-white">
              الأخبار العالمية والمصرية وإفصاحات الشركات المقيدة
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              تغطية إخبارية شاملة لقرارات البنك المركزي، الاحتياطي الفيدرالي، أسعار النفط والذهب،
              إلى جانب الإفصاحات الرسمية لنتائج أعمال الشركات وتوزيعات الأرباح فور صدورها.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs shrink-0 tabular-nums">
            <span className="text-slate-400">عدد الأخبار والإفصاحات:</span>
            <span className="font-bold text-emerald-400">{filteredNews.length}</span>
          </div>
        </div>
      </div>

      {/* Control Strip: Categories & Search */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 rounded-md font-bold transition-all ${
                selectedCategory === 'ALL'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              جميع الأخبار والإفصاحات
            </button>

            <button
              onClick={() => setSelectedCategory('EGX')}
              className={`px-3 py-1.5 rounded-md font-bold transition-all ${
                selectedCategory === 'EGX'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              البورصة المصرية
            </button>

            <button
              onClick={() => setSelectedCategory('GLOBAL')}
              className={`px-3 py-1.5 rounded-md font-bold transition-all ${
                selectedCategory === 'GLOBAL'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              الأسواق العالمية
            </button>

            <button
              onClick={() => setSelectedCategory('DISCLOSURE')}
              className={`px-3 py-1.5 rounded-md font-bold transition-all ${
                selectedCategory === 'DISCLOSURE'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              إفصاحات الشركات المقيدة
            </button>
          </div>

          {/* Stock Filter Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400">تصفية حسب الشركة:</span>
            <select
              value={selectedStockFilter}
              onChange={(e) => setSelectedStockFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs py-1.5 px-3 rounded-lg focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">جميع الشركات</option>
              {stocks.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.code} - {s.nameAr}
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ابحث في الأخبار والإفصاحات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-100 pr-9 pl-3 py-2 rounded-lg placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* News Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNews.map((item) => {
          const relatedStock = item.relatedStockCode
            ? stocks.find((s) => s.code === item.relatedStockCode)
            : null;

          return (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all group"
            >
              <div>
                {/* Meta header */}
                <div className="flex items-center justify-between gap-2 text-xs mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.category === 'DISCLOSURE'
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-500/30'
                          : item.category === 'GLOBAL'
                          ? 'bg-sky-950/80 text-sky-300 border border-sky-500/30'
                          : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {item.categoryLabelAr}
                    </span>

                    <span className="text-slate-500 text-[11px] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.timestamp}
                    </span>
                  </div>

                  {item.impact === 'POSITIVE' && (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/20">
                      تأثير إيجابي
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3
                  onClick={() => setActiveArticle(item)}
                  className="font-bold text-white text-sm leading-snug hover:text-emerald-400 cursor-pointer transition-colors"
                >
                  {item.title}
                </h3>

                {/* Summary */}
                <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-3">
                  {item.summary}
                </p>
              </div>

              {/* Card Footer: Source & Related Stock Link */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px]">{item.source}</span>

                <div className="flex items-center gap-2">
                  {relatedStock && (
                    <button
                      onClick={() => onSelectStock(relatedStock)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-950 border border-slate-800 hover:border-emerald-500/60 text-slate-300 hover:text-emerald-400 text-[11px] font-semibold transition-colors"
                    >
                      <span className="font-bold font-mono">{relatedStock.code}</span>
                      <span className="text-slate-400 text-[10px]">{relatedStock.price.toFixed(2)} ج.م</span>
                      <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                    </button>
                  )}

                  <button
                    onClick={() => setActiveArticle(item)}
                    className="text-emerald-400 hover:text-emerald-300 font-bold text-[11px] flex items-center gap-0.5 transition-colors"
                  >
                    <span>قراءة كامل الخبر</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Article Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative my-auto space-y-4">
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 text-xs mb-1.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                    {activeArticle.categoryLabelAr}
                  </span>
                  <span className="text-slate-400 text-[11px]">{activeArticle.source}</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-400 text-[11px]">{activeArticle.timestamp}</span>
                </div>
                <h3 className="text-lg font-black text-white leading-snug">
                  {activeArticle.title}
                </h3>
              </div>

              <button
                onClick={() => setActiveArticle(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-300 leading-relaxed space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
              <p className="font-semibold text-slate-200">{activeArticle.summary}</p>
              {activeArticle.content && (
                <p className="text-slate-300 text-xs leading-relaxed pt-2 border-t border-slate-800">
                  {activeArticle.content}
                </p>
              )}
            </div>

            {/* Related stock card if present */}
            {activeArticle.relatedStockCode && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                {(() => {
                  const s = stocks.find((item) => item.code === activeArticle.relatedStockCode);
                  if (!s) return null;
                  return (
                    <>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs">{s.code}</span>
                          <span className="text-xs text-slate-300">{s.nameAr}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          السعر الحالي: {s.price.toFixed(2)} ج.م (
                          <span className={s.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                            {s.change >= 0 ? '+' : ''}
                            {s.changePercent.toFixed(2)}%
                          </span>
                          )
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onSelectStock(s);
                          setActiveArticle(null);
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors"
                      >
                        فتح التحليل الفني للسهم
                      </button>
                    </>
                  );
                })()}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveArticle(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
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
