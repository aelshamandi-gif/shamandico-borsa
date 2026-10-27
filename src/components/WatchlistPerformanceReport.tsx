import React, { useState, useMemo } from 'react';
import { Watchlist, Stock, WatchlistPerformanceReportData, StockPerformanceComparison } from '../types/market';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calendar,
  Award,
  Layers,
  Printer,
  Copy,
  Check,
  Percent,
  Bookmark,
  ChevronLeft,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Sparkles,
} from 'lucide-react';

interface WatchlistPerformanceReportProps {
  watchlists: Watchlist[];
  stocks: Stock[];
  activeWatchlistId: string;
  onSelectStock: (stock: Stock) => void;
}

export const WatchlistPerformanceReport: React.FC<WatchlistPerformanceReportProps> = ({
  watchlists,
  stocks,
  activeWatchlistId,
  onSelectStock,
}) => {
  const [selectedWatchlistId, setSelectedWatchlistId] = useState<string>(activeWatchlistId);
  const [period, setPeriod] = useState<'WEEKLY' | 'MONTHLY' | 'QUARTERLY'>('WEEKLY');
  const [copiedNotice, setCopiedNotice] = useState<boolean>(false);

  const currentWatchlist =
    watchlists.find((w) => w.id === selectedWatchlistId) || watchlists[0] || null;

  // EGX 30 Benchmark returns for respective periods
  const egx30PeriodReturns = {
    WEEKLY: 2.85, // +2.85% weekly
    MONTHLY: 7.40, // +7.40% monthly
    QUARTERLY: 14.60, // +14.60% quarterly
  };

  const periodDays = period === 'WEEKLY' ? 5 : period === 'MONTHLY' ? 22 : 65;
  const benchmarkRoi = egx30PeriodReturns[period];

  // Calculate report data
  const reportData: WatchlistPerformanceReportData | null = useMemo(() => {
    if (!currentWatchlist) return null;

    const listStocks = currentWatchlist.stockCodes
      .map((code) => stocks.find((s) => s.code === code))
      .filter((s): s is Stock => s !== undefined);

    if (listStocks.length === 0) return null;

    const stockComparisons: StockPerformanceComparison[] = listStocks.map((stock) => {
      const candles = stock.candles;
      const startIndex = Math.max(0, candles.length - periodDays);
      const startCandle = candles[startIndex] || candles[0];
      const startPrice = startCandle ? startCandle.close : stock.previousClose;
      const currentPrice = stock.price;

      const returnEgp = Number((currentPrice - startPrice).toFixed(2));
      const roiPercent = Number(((returnEgp / (startPrice || 1)) * 100).toFixed(2));
      const alphaVsEgx30 = Number((roiPercent - benchmarkRoi).toFixed(2));

      let status: StockPerformanceComparison['status'] = 'IN_LINE';
      if (alphaVsEgx30 > 1.5) status = 'OUTPERFORM';
      else if (alphaVsEgx30 < -1.5) status = 'UNDERPERFORM';

      // Sum period turnover
      const periodCandles = candles.slice(startIndex);
      const periodTurnover = periodCandles.reduce((sum, c) => sum + c.turnover, 0);

      return {
        stockCode: stock.code,
        stockNameAr: stock.nameAr,
        sector: stock.sector,
        startPrice,
        currentPrice,
        returnEgp,
        roiPercent,
        periodTurnover,
        alphaVsEgx30,
        status,
      };
    });

    const totalRoi = stockComparisons.reduce((sum, s) => sum + s.roiPercent, 0);
    const watchlistRoiPercent = Number((totalRoi / stockComparisons.length).toFixed(2));
    const excessReturn = Number((watchlistRoiPercent - benchmarkRoi).toFixed(2));
    const beatingBenchmarkCount = stockComparisons.filter((s) => s.roiPercent > benchmarkRoi).length;

    const sortedByRoi = [...stockComparisons].sort((a, b) => b.roiPercent - a.roiPercent);
    const topGainer = sortedByRoi[0] || null;
    const lowestPerformer = sortedByRoi[sortedByRoi.length - 1] || null;

    const todayStr = new Date().toISOString().split('T')[0];
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - (period === 'WEEKLY' ? 7 : period === 'MONTHLY' ? 30 : 90));
    const pastStr = pastDate.toISOString().split('T')[0];

    return {
      period,
      periodLabelAr: period === 'WEEKLY' ? 'أسبوعي (7 أيام)' : period === 'MONTHLY' ? 'شهري (30 يوماً)' : 'ربع سنوي (90 يوماً)',
      startDate: pastStr,
      endDate: todayStr,
      watchlistId: currentWatchlist.id,
      watchlistName: currentWatchlist.name,
      stocksCount: listStocks.length,
      watchlistRoiPercent,
      egx30RoiPercent: benchmarkRoi,
      excessReturn,
      beatingBenchmarkCount,
      topGainer,
      lowestPerformer,
      stockComparisons,
    };
  }, [currentWatchlist, stocks, period, benchmarkRoi, periodDays]);

  const handleCopySummary = () => {
    if (!reportData) return;
    const text = `📊 تقرير أداء ${reportData.watchlistName} (${reportData.periodLabelAr})
-----------------------------------------
• عائد المحفظة (ROI): ${reportData.watchlistRoiPercent >= 0 ? '+' : ''}${reportData.watchlistRoiPercent}%
• عائد مؤشر EGX 30: +${reportData.egx30RoiPercent}%
• الفارق والتفوق على المؤشر (Alpha): ${reportData.excessReturn >= 0 ? '+' : ''}${reportData.excessReturn}%
• عدد الأسهم المتفوقة على المؤشر: ${reportData.beatingBenchmarkCount} من أصل ${reportData.stocksCount}
• أفضل سهم أداءً: ${reportData.topGainer?.stockCode} (+${reportData.topGainer?.roiPercent}%)
• تاريخ التقرير: ${reportData.endDate}
منصة شمنديكو لمتابعة وتحليل البورصة المصرية EGX`;

    navigator.clipboard.writeText(text);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!currentWatchlist || !reportData) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
        <Bookmark className="w-8 h-8 text-slate-500 mx-auto mb-2" />
        <h3 className="font-bold text-white text-base">لا توجد أسهم في قائمة المراقبة المحددة</h3>
        <p className="text-xs text-slate-400 mt-1">
          أضف أسهم إلى قائمة المراقبة لتوليد تقارير الأداء الأسبوعية والشهرية ومقارنتها بمؤشر EGX30.
        </p>
      </div>
    );
  }

  const isOutperforming = reportData.excessReturn >= 0;

  return (
    <div className="space-y-6 print:m-0 print:p-0">
      {/* Header & Controls */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-1">
            <Award className="w-4 h-4" />
            <span>تقارير الأداء الاستثماري ومقارنة المؤشر العام (Alpha & Benchmark Report)</span>
          </div>
          <h2 className="text-xl font-black text-white">
            تقرير العائد على الاستثمار (ROI) ومقارنة أداء EGX 30
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            قياس الأداء الفعلي لأسهم قائمة مراقبتك وحساب العائد ومعدل التفوق أو التراجع مقارنة
            بالمؤشر الرئيسي للبورصة المصرية.
          </p>
        </div>

        {/* Action Buttons: Print & Copy */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
            title="نسخ ملخص التقرير للمشاركة"
          >
            {copiedNotice ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedNotice ? 'تم النسخ!' : 'نسخ الملخص'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
            title="طباعة التقرير"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>طباعة / PDF</span>
          </button>
        </div>
      </div>

      {/* Selectors Bar: Watchlist & Period */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 text-xs">
        {/* Watchlist Picker */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-semibold">قائمة المراقبة المستهدفة:</span>
          <select
            value={selectedWatchlistId}
            onChange={(e) => setSelectedWatchlistId(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-white text-xs py-1.5 px-3 rounded-lg focus:outline-none focus:border-emerald-500 font-medium"
          >
            {watchlists.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.stockCodes.length} أسهم)
              </option>
            ))}
          </select>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
          <button
            onClick={() => setPeriod('WEEKLY')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all ${
              period === 'WEEKLY'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            أسبوعي (7 أيام)
          </button>
          <button
            onClick={() => setPeriod('MONTHLY')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all ${
              period === 'MONTHLY'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            شهري (30 يوماً)
          </button>
          <button
            onClick={() => setPeriod('QUARTERLY')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all ${
              period === 'QUARTERLY'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ربع سنوي (90 يوماً)
          </button>
        </div>
      </div>

      {/* Main KPI Comparison Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Watchlist ROI */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>عائد قائمة المراقبة (ROI)</span>
            <span className="font-semibold text-emerald-400">{reportData.periodLabelAr}</span>
          </div>
          <div
            className={`text-3xl font-black tabular-nums mt-2 flex items-center gap-1.5 ${
              reportData.watchlistRoiPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {reportData.watchlistRoiPercent >= 0 ? (
              <TrendingUp className="w-6 h-6" />
            ) : (
              <TrendingDown className="w-6 h-6" />
            )}
            <span>
              {reportData.watchlistRoiPercent >= 0 ? '+' : ''}
              {reportData.watchlistRoiPercent}%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            متوسط العائد الرأسمالي لـ {reportData.stocksCount} أسهم بالقائمة
          </p>
        </div>

        {/* EGX 30 Benchmark ROI */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>عائد مؤشر EGX 30 المرجعي</span>
            <span className="font-semibold text-amber-400">المؤشر العام</span>
          </div>
          <div className="text-3xl font-black text-amber-400 tabular-nums mt-2 flex items-center gap-1.5">
            <TrendingUp className="w-6 h-6" />
            <span>+{reportData.egx30RoiPercent}%</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            العائد الإجمالي لمؤشر الثلاثين الكبار لنفس الفترة
          </p>
        </div>

        {/* Excess Return (Alpha) */}
        <div
          className={`border p-5 rounded-2xl shadow-lg transition-all ${
            isOutperforming
              ? 'bg-gradient-to-br from-emerald-950/30 to-slate-900 border-emerald-500/40'
              : 'bg-gradient-to-br from-rose-950/30 to-slate-900 border-rose-500/40'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>معدل التفوق / التراجع (Alpha)</span>
            <span className="font-semibold text-slate-300">مقارنة بـ EGX 30</span>
          </div>
          <div
            className={`text-3xl font-black tabular-nums mt-2 ${
              isOutperforming ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isOutperforming ? '+' : ''}
            {reportData.excessReturn}%
          </div>
          <p className="text-[11px] text-slate-300 mt-2 font-medium">
            {isOutperforming
              ? `تفوق استثماري إيجابي بفارق ${reportData.excessReturn}% عن مؤشر البورصة`
              : `تراجع أداء القائمة بفارق ${Math.abs(reportData.excessReturn)}% عن المؤشر`}
          </p>
        </div>

        {/* Win Rate / Stocks Beating Benchmark */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>الأسهم المتفوقة على المؤشر</span>
            <span className="font-semibold text-teal-400">Win Ratio</span>
          </div>
          <div className="text-3xl font-black text-white tabular-nums mt-2">
            {reportData.beatingBenchmarkCount}
            <span className="text-base font-normal text-slate-500 mr-1.5">
              / {reportData.stocksCount} سهم
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            نسبة النجاح: {((reportData.beatingBenchmarkCount / reportData.stocksCount) * 100).toFixed(0)}% من الأسهم تجاوزت EGX30
          </p>
        </div>
      </div>

      {/* Visual Comparison Chart: Stock ROI vs EGX30 Benchmark */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">
              مقارنة العائد الفردي للأسهم مقابل خط أداء EGX 30 (+{reportData.egx30RoiPercent}%)
            </h3>
          </div>
          <span className="text-slate-400 text-[11px]">الفترة: {reportData.periodLabelAr}</span>
        </div>

        <div className="space-y-3 pt-2">
          {reportData.stockComparisons.map((stock) => {
            const isBeating = stock.roiPercent >= reportData.egx30RoiPercent;
            const maxVal = Math.max(
              ...reportData.stockComparisons.map((s) => Math.abs(s.roiPercent)),
              reportData.egx30RoiPercent * 1.5,
              10
            );
            const barWidthPercent = Math.min(100, (Math.abs(stock.roiPercent) / maxVal) * 100);

            return (
              <div key={stock.stockCode} className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white font-mono">{stock.stockCode}</span>
                    <span className="text-slate-400 text-[11px]">{stock.stockNameAr}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        isBeating
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isBeating ? `متفوق (+${stock.alphaVsEgx30}%)` : `أدنى (${stock.alphaVsEgx30}%)`}
                    </span>
                  </div>

                  <div className="tabular-nums font-bold text-left">
                    <span className={stock.roiPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {stock.roiPercent >= 0 ? '+' : ''}
                      {stock.roiPercent}%
                    </span>
                  </div>
                </div>

                {/* Bar */}
                <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden relative flex items-center border border-slate-800">
                  {/* Benchmark indicator line */}
                  <div
                    style={{ left: `${(reportData.egx30RoiPercent / maxVal) * 100}%` }}
                    className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10"
                    title={`مؤشر EGX 30: +${reportData.egx30RoiPercent}%`}
                  />

                  <div
                    style={{ width: `${barWidthPercent}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      stock.roiPercent >= reportData.egx30RoiPercent
                        ? 'bg-gradient-to-r from-emerald-600 to-emerald-400'
                        : stock.roiPercent >= 0
                        ? 'bg-gradient-to-r from-teal-700 to-teal-500'
                        : 'bg-gradient-to-r from-rose-700 to-rose-500'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-amber-400 rounded-sm" />
            <span>الخط الأصفر يمثل أداء مؤشر EGX 30 (+{reportData.egx30RoiPercent}%)</span>
          </div>
          <span>الأعمدة الخضراء تعكس الأسهم التي تفوقت على المؤشر</span>
        </div>
      </div>

      {/* Detailed Stock-by-Stock Comparison Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
          <h3 className="font-bold text-white text-sm">
            جدول تفصيلي لعوائد الأسهم ومقارنة الفارق مع EGX 30
          </h3>
          <span className="text-slate-500">من {reportData.startDate} إلى {reportData.endDate}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-medium">
              <tr>
                <th className="py-3 px-4">السهم / الكود</th>
                <th className="py-3 px-3">سعر البداية</th>
                <th className="py-3 px-3">السعر الحالي</th>
                <th className="py-3 px-3">العائد بالجنيه</th>
                <th className="py-3 px-3">عائد السهم (ROI)</th>
                <th className="py-3 px-3">عائد EGX 30</th>
                <th className="py-3 px-3">الفارق (Alpha)</th>
                <th className="py-3 px-3">تقييم الأداء</th>
                <th className="py-3 px-4 text-center">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 tabular-nums">
              {reportData.stockComparisons.map((stock) => {
                const stockObj = stocks.find((s) => s.code === stock.stockCode);
                return (
                  <tr key={stock.stockCode} className="hover:bg-slate-800/40 transition-colors">
                    {/* Stock Code & Name */}
                    <td className="py-3 px-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{stock.stockCode}</span>
                          <span className="text-[10px] text-slate-500">{stock.sector}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{stock.stockNameAr}</div>
                      </div>
                    </td>

                    {/* Start Price */}
                    <td className="py-3 px-3 text-slate-300">
                      {stock.startPrice.toFixed(2)} ج.م
                    </td>

                    {/* Current Price */}
                    <td className="py-3 px-3 font-bold text-white">
                      {stock.currentPrice.toFixed(2)} ج.م
                    </td>

                    {/* Return in EGP */}
                    <td className="py-3 px-3">
                      <span className={stock.returnEgp >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {stock.returnEgp >= 0 ? '+' : ''}
                        {stock.returnEgp.toFixed(2)} ج.م
                      </span>
                    </td>

                    {/* Stock ROI % */}
                    <td className="py-3 px-3">
                      <div
                        className={`font-black flex items-center gap-1 ${
                          stock.roiPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {stock.roiPercent >= 0 ? (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {stock.roiPercent >= 0 ? '+' : ''}
                          {stock.roiPercent}%
                        </span>
                      </div>
                    </td>

                    {/* EGX 30 Benchmark */}
                    <td className="py-3 px-3 text-amber-400 font-semibold">
                      +{reportData.egx30RoiPercent}%
                    </td>

                    {/* Alpha vs Benchmark */}
                    <td className="py-3 px-3">
                      <span
                        className={`font-bold ${
                          stock.alphaVsEgx30 >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {stock.alphaVsEgx30 >= 0 ? '+' : ''}
                        {stock.alphaVsEgx30}%
                      </span>
                    </td>

                    {/* Performance Status */}
                    <td className="py-3 px-3">
                      {stock.status === 'OUTPERFORM' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                          تفوق قوي 🚀
                        </span>
                      ) : stock.status === 'IN_LINE' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-950 text-teal-400 border border-teal-500/30">
                          أداء موازي
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-500/30">
                          أدنى من المؤشر
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-center">
                      {stockObj && (
                        <button
                          onClick={() => onSelectStock(stockObj)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white transition-colors text-[11px] font-semibold border border-slate-700/60"
                          title="فتح التحليل الفني"
                        >
                          تحليل عميق
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editorial Commentary Box (تحليل شمنديكو المقارن) */}
      <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-5 shadow-lg space-y-2 text-xs">
        <div className="flex items-center gap-2 text-emerald-400 font-bold">
          <Sparkles className="w-4 h-4" />
          <span>خلاصة تشخيص أداء المحفظة وقائمة المراقبة (Shamandiko Performance Verdict):</span>
        </div>
        <p className="text-slate-300 leading-relaxed">
          سجلت قائمة <strong>"{reportData.watchlistName}"</strong> عائداً استثمارياً قدره{' '}
          <strong className={isOutperforming ? 'text-emerald-400' : 'text-rose-400'}>
            {reportData.watchlistRoiPercent >= 0 ? '+' : ''}{reportData.watchlistRoiPercent}%
          </strong>{' '}
          خلال الفترة ({reportData.periodLabelAr})، مقارنة بعائد قدره{' '}
          <strong className="text-amber-400">+{reportData.egx30RoiPercent}%</strong> لمؤشر EGX 30.
          {isOutperforming
            ? ` نتج عن ذلك تفوق إيجابي (Alpha) قدره +${reportData.excessReturn}% لصالح محفظتك، بدعم من الأداء القوي لسهم ${reportData.topGainer?.stockCode} (+${reportData.topGainer?.roiPercent}%).`
            : ` تأخر أداء القائمة عن المؤشر بفارق ${Math.abs(reportData.excessReturn)}%، ويوصى بإعادة موازنة الأوزان أو تفعيل مستويات جني الأرباح للأسهم المتراجعة.`}
        </p>
      </div>
    </div>
  );
};
