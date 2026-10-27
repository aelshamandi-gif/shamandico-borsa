import React, { useState, useMemo, useRef } from 'react';
import { Stock, Candle, TechnicalIndicatorConfig } from '../types/market';
import {
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateMACD,
  calculateBollingerBands,
  calculatePivotPoints,
  generateDeepStockReport,
} from '../utils/technicalIndicators';
import {
  Sliders,
  TrendingUp,
  TrendingDown,
  Layers,
  Activity,
  DollarSign,
  ShieldAlert,
  Target,
  BarChart2,
  Calendar,
  Maximize2,
  Info,
  Check,
  ChevronDown,
  ChevronUp,
  Flame,
  Zap,
} from 'lucide-react';

interface TechnicalAnalysisStudioProps {
  stock: Stock;
  allStocks: Stock[];
  onSelectStock: (stock: Stock) => void;
}

export const TechnicalAnalysisStudio: React.FC<TechnicalAnalysisStudioProps> = ({
  stock,
  allStocks,
  onSelectStock,
}) => {
  // Chart Configuration State
  const [chartType, setChartType] = useState<'candle' | 'area'>('candle');
  const [timeframe, setTimeframe] = useState<'1M' | '3M' | '6M' | '1Y'>('3M');
  const [showIndicatorSettings, setShowIndicatorSettings] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'chart' | 'depth' | 'fundamentals' | 'disclosures'>('chart');

  // Hover state for interactive crosshair
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Indicators Customizable Configuration
  const [config, setConfig] = useState<TechnicalIndicatorConfig>({
    ma1Enabled: true,
    ma1Period: 20,
    ma1Type: 'SMA',
    ma1Color: '#38bdf8', // sky-400

    ma2Enabled: true,
    ma2Period: 50,
    ma2Type: 'SMA',
    ma2Color: '#f59e0b', // amber-500

    ma3Enabled: false,
    ma3Period: 9,
    ma3Type: 'EMA',
    ma3Color: '#a855f7', // purple-500

    rsiEnabled: true,
    rsiPeriod: 14,
    rsiOverbought: 70,
    rsiOversold: 30,

    macdEnabled: true,
    macdFast: 12,
    macdSlow: 26,
    macdSignal: 9,

    bbEnabled: false,
    bbPeriod: 20,
    bbStdDev: 2,
  });

  // Filter candles based on timeframe
  const candles = useMemo(() => {
    const total = stock.candles;
    if (timeframe === '1M') return total.slice(-22);
    if (timeframe === '3M') return total.slice(-65);
    if (timeframe === '6M') return total.slice(-130);
    return total;
  }, [stock.candles, timeframe]);

  // Calculate Indicators dynamically
  const ma1Values = useMemo(() => {
    if (!config.ma1Enabled) return null;
    return config.ma1Type === 'SMA'
      ? calculateSMA(candles, config.ma1Period)
      : calculateEMA(candles, config.ma1Period);
  }, [candles, config.ma1Enabled, config.ma1Period, config.ma1Type]);

  const ma2Values = useMemo(() => {
    if (!config.ma2Enabled) return null;
    return config.ma2Type === 'SMA'
      ? calculateSMA(candles, config.ma2Period)
      : calculateEMA(candles, config.ma2Period);
  }, [candles, config.ma2Enabled, config.ma2Period, config.ma2Type]);

  const ma3Values = useMemo(() => {
    if (!config.ma3Enabled) return null;
    return config.ma3Type === 'SMA'
      ? calculateSMA(candles, config.ma3Period)
      : calculateEMA(candles, config.ma3Period);
  }, [candles, config.ma3Enabled, config.ma3Period, config.ma3Type]);

  const bollingerBands = useMemo(() => {
    if (!config.bbEnabled) return null;
    return calculateBollingerBands(candles, config.bbPeriod, config.bbStdDev);
  }, [candles, config.bbEnabled, config.bbPeriod, config.bbStdDev]);

  const rsiValues = useMemo(() => {
    if (!config.rsiEnabled) return null;
    return calculateRSI(candles, config.rsiPeriod);
  }, [candles, config.rsiEnabled, config.rsiPeriod]);

  const macdData = useMemo(() => {
    if (!config.macdEnabled) return null;
    return calculateMACD(candles, config.macdFast, config.macdSlow, config.macdSignal);
  }, [candles, config.macdEnabled, config.macdFast, config.macdSlow, config.macdSignal]);

  const pivotPoints = useMemo(() => {
    return calculatePivotPoints(stock.high, stock.low, stock.previousClose);
  }, [stock]);

  const deepReport = useMemo(() => {
    return generateDeepStockReport(stock, candles, config.rsiPeriod);
  }, [stock, candles, config.rsiPeriod]);

  // Chart Rendering Math (SVG)
  const chartHeight = 320;
  const chartWidth = 840;
  const padding = { top: 20, right: 60, bottom: 25, left: 10 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // Min and Max prices for scale
  const { minPrice, maxPrice } = useMemo(() => {
    let min = Math.min(...candles.map((c) => c.low));
    let max = Math.max(...candles.map((c) => c.high));

    if (bollingerBands) {
      bollingerBands.upper.forEach((v) => {
        if (v !== null && v > max) max = v;
      });
      bollingerBands.lower.forEach((v) => {
        if (v !== null && v < min) min = v;
      });
    }

    const margin = (max - min) * 0.06;
    return {
      minPrice: Math.max(0.1, min - margin),
      maxPrice: max + margin,
    };
  }, [candles, bollingerBands]);

  const getY = (val: number) => {
    return padding.top + innerHeight - ((val - minPrice) / (maxPrice - minPrice)) * innerHeight;
  };

  const getX = (idx: number) => {
    if (candles.length <= 1) return padding.left;
    return padding.left + (idx / (candles.length - 1)) * innerWidth;
  };

  // Hovered item data
  const hoveredCandle = hoverIndex !== null ? candles[hoverIndex] : candles[candles.length - 1];
  const hoveredRsi =
    hoverIndex !== null && rsiValues ? rsiValues[hoverIndex] : rsiValues?.[rsiValues.length - 1];
  const hoveredMacd =
    hoverIndex !== null && macdData ? macdData.macdLine[hoverIndex] : macdData?.macdLine[macdData.macdLine.length - 1];
  const hoveredSignal =
    hoverIndex !== null && macdData
      ? macdData.signalLine[hoverIndex]
      : macdData?.signalLine[macdData.signalLine.length - 1];

  // SVG Path for Area Chart
  const areaPath = useMemo(() => {
    if (candles.length === 0) return '';
    const points = candles.map((c, i) => `${getX(i)},${getY(c.close)}`).join(' L ');
    const firstX = getX(0);
    const lastX = getX(candles.length - 1);
    const bottomY = padding.top + innerHeight;
    return `M ${firstX},${bottomY} L ${points} L ${lastX},${bottomY} Z`;
  }, [candles, minPrice, maxPrice]);

  const linePath = useMemo(() => {
    if (candles.length === 0) return '';
    return 'M ' + candles.map((c, i) => `${getX(i)},${getY(c.close)}`).join(' L ');
  }, [candles, minPrice, maxPrice]);

  // Path generator for Moving Average lines
  const generateMAPath = (values: (number | null)[]) => {
    const points: string[] = [];
    values.forEach((val, idx) => {
      if (val !== null) {
        points.push(`${getX(idx)},${getY(val)}`);
      }
    });
    if (points.length === 0) return '';
    return 'M ' + points.join(' L ');
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card: Stock Identity & Live Price Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Stock Info & Switcher */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <span className="text-xl font-black text-emerald-400 font-mono">{stock.code}</span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black text-white">{stock.nameAr}</h1>
                <span className="text-xs text-slate-400 font-semibold px-2 py-0.5 bg-slate-950 border border-slate-800 rounded-lg">
                  {stock.index}
                </span>
                <span className="text-xs text-slate-400 font-semibold px-2 py-0.5 bg-slate-950 border border-slate-800 rounded-lg">
                  {stock.sector}
                </span>
              </div>

              <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                <span>{stock.nameEn}</span>
                <span>·</span>
                <span className="font-mono text-slate-500">{stock.isin}</span>
              </div>
            </div>
          </div>

          {/* Quick Stock Selector Dropdown */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">سهم آخر:</span>
              <select
                value={stock.code}
                onChange={(e) => {
                  const target = allStocks.find((s) => s.code === e.target.value);
                  if (target) onSelectStock(target);
                }}
                className="bg-slate-950 border border-slate-800 text-xs text-white py-1.5 px-3 rounded-lg focus:outline-none focus:border-emerald-500"
              >
                {allStocks.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.code} - {s.nameAr}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Box */}
            <div className="text-left bg-slate-950/80 border border-slate-800/80 p-3 rounded-xl min-w-[160px] tabular-nums">
              <div className="text-2xl font-black text-white">{stock.price.toFixed(2)} ج.م</div>
              <div
                className={`text-xs font-bold flex items-center justify-end gap-1 mt-0.5 ${
                  stock.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {stock.change >= 0 ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                <span>
                  {stock.change >= 0 ? '+' : ''}
                  {stock.change.toFixed(2)} ({stock.change >= 0 ? '+' : ''}
                  {stock.changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stock Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mt-5 pt-4 border-t border-slate-800/80 text-xs tabular-nums">
          <div>
            <div className="text-[11px] text-slate-500">سعر الفتح</div>
            <div className="font-bold text-white mt-0.5">{stock.open.toFixed(2)} ج.م</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500">أعلى سعر اليوم</div>
            <div className="font-bold text-emerald-400 mt-0.5">{stock.high.toFixed(2)} ج.م</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500">أدنى سعر اليوم</div>
            <div className="font-bold text-rose-400 mt-0.5">{stock.low.toFixed(2)} ج.م</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500">سيولة السهم اليوم</div>
            <div className="font-bold text-amber-400 mt-0.5">
              {(stock.turnover / 1e6).toFixed(1)}M ج.م
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500">كمية التداول</div>
            <div className="font-bold text-slate-200 mt-0.5">
              {(stock.volume / 1e6).toFixed(2)}M سهم
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500">القيمة العادلة</div>
            <div className="font-bold text-teal-400 mt-0.5">{stock.fairValue.toFixed(2)} ج.م</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500">هامش الأمان</div>
            <div
              className={`font-bold mt-0.5 ${
                stock.marginOfSafety >= 15 ? 'text-emerald-400' : 'text-slate-200'
              }`}
            >
              +{stock.marginOfSafety.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Analytical Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('chart')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
            activeTab === 'chart'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>الرسم البياني والمؤشرات الفنية المتقدمة</span>
        </button>

        <button
          onClick={() => setActiveTab('depth')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
            activeTab === 'depth'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>دفتر الأوامر وعمق السوق (Order Book)</span>
        </button>

        <button
          onClick={() => setActiveTab('fundamentals')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
            activeTab === 'fundamentals'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>التحليل المالي ومضاعفات التقييم</span>
        </button>

        <button
          onClick={() => setActiveTab('disclosures')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
            activeTab === 'disclosures'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>إفصاحات وأخبار السهم ({stock.disclosures.length})</span>
        </button>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'chart' && (
        <div className="space-y-6">
          {/* Chart Controls Bar */}
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex flex-wrap items-center justify-between gap-4">
            {/* Timeframe Selectors */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              {(['1M', '3M', '6M', '1Y'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 rounded-md font-semibold transition-all ${
                    timeframe === tf
                      ? 'bg-slate-800 text-emerald-400 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tf === '1M' ? 'شهر' : tf === '3M' ? '3 أشهر' : tf === '6M' ? '6 أشهر' : 'سنة'}
                </button>
              ))}
            </div>

            {/* Chart Type Toggle */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setChartType('candle')}
                className={`px-3 py-1 rounded-md font-semibold transition-all ${
                  chartType === 'candle'
                    ? 'bg-slate-800 text-emerald-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                الشموع اليابانية
              </button>
              <button
                onClick={() => setChartType('area')}
                className={`px-3 py-1 rounded-md font-semibold transition-all ${
                  chartType === 'area'
                    ? 'bg-slate-800 text-emerald-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                خطي مساحي
              </button>
            </div>

            {/* Indicator Toggles & Customize Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowIndicatorSettings(!showIndicatorSettings)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  showIndicatorSettings
                    ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>تخصيص فترات المؤشرات الفنية</span>
                {showIndicatorSettings ? (
                  <ChevronUp className="w-3.5 h-3.5 ml-1" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 ml-1" />
                )}
              </button>
            </div>
          </div>

          {/* Indicator Configuration Drawer (Collapsible) */}
          {showIndicatorSettings && (
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-bold text-white text-sm">
                    خيارات تخصيص فترات ومؤشرات التحليل الفني
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400">
                  تحديث فوري لجميع الخطوط والمؤشرات على الرسم البياني
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                {/* MA 1 */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sky-400">المتوسط المتحرك الأول (MA 1)</span>
                    <input
                      type="checkbox"
                      checked={config.ma1Enabled}
                      onChange={(e) => setConfig({ ...config, ma1Enabled: e.target.checked })}
                      className="rounded accent-emerald-500"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <label className="text-slate-400">الفترة الزمنية:</label>
                    <input
                      type="number"
                      min={2}
                      max={200}
                      value={config.ma1Period}
                      onChange={(e) =>
                        setConfig({ ...config, ma1Period: Number(e.target.value) || 20 })
                      }
                      className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-center font-bold text-white"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <label className="text-slate-400">النوع:</label>
                    <select
                      value={config.ma1Type}
                      onChange={(e) =>
                        setConfig({ ...config, ma1Type: e.target.value as 'SMA' | 'EMA' })
                      }
                      className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-medium"
                    >
                      <option value="SMA">بسيط (SMA)</option>
                      <option value="EMA">أسي (EMA)</option>
                    </select>
                  </div>
                </div>

                {/* MA 2 */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-400">المتوسط المتحرك الثاني (MA 2)</span>
                    <input
                      type="checkbox"
                      checked={config.ma2Enabled}
                      onChange={(e) => setConfig({ ...config, ma2Enabled: e.target.checked })}
                      className="rounded accent-emerald-500"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <label className="text-slate-400">الفترة الزمنية:</label>
                    <input
                      type="number"
                      min={2}
                      max={200}
                      value={config.ma2Period}
                      onChange={(e) =>
                        setConfig({ ...config, ma2Period: Number(e.target.value) || 50 })
                      }
                      className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-center font-bold text-white"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <label className="text-slate-400">النوع:</label>
                    <select
                      value={config.ma2Type}
                      onChange={(e) =>
                        setConfig({ ...config, ma2Type: e.target.value as 'SMA' | 'EMA' })
                      }
                      className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-medium"
                    >
                      <option value="SMA">بسيط (SMA)</option>
                      <option value="EMA">أسي (EMA)</option>
                    </select>
                  </div>
                </div>

                {/* RSI Configuration */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-400">مؤشر القوة النسبية (RSI)</span>
                    <input
                      type="checkbox"
                      checked={config.rsiEnabled}
                      onChange={(e) => setConfig({ ...config, rsiEnabled: e.target.checked })}
                      className="rounded accent-emerald-500"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <label className="text-slate-400">فترة الـ RSI:</label>
                    <input
                      type="number"
                      min={2}
                      max={50}
                      value={config.rsiPeriod}
                      onChange={(e) =>
                        setConfig({ ...config, rsiPeriod: Number(e.target.value) || 14 })
                      }
                      className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-center font-bold text-white"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <label className="text-slate-400">تشبع شرائي / بيعي:</label>
                    <div className="flex items-center gap-1 font-mono text-[11px] text-slate-300">
                      <span>{config.rsiOverbought}</span>
                      <span>/</span>
                      <span>{config.rsiOversold}</span>
                    </div>
                  </div>
                </div>

                {/* MACD Configuration */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-400">مؤشر الماكد (MACD)</span>
                    <input
                      type="checkbox"
                      checked={config.macdEnabled}
                      onChange={(e) => setConfig({ ...config, macdEnabled: e.target.checked })}
                      className="rounded accent-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-1 text-[11px]">
                    <div>
                      <div className="text-slate-400 text-[10px]">سريع</div>
                      <input
                        type="number"
                        value={config.macdFast}
                        onChange={(e) =>
                          setConfig({ ...config, macdFast: Number(e.target.value) || 12 })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-center font-bold text-white mt-0.5"
                      />
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px]">بطيء</div>
                      <input
                        type="number"
                        value={config.macdSlow}
                        onChange={(e) =>
                          setConfig({ ...config, macdSlow: Number(e.target.value) || 26 })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-center font-bold text-white mt-0.5"
                      />
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px]">إشارة</div>
                      <input
                        type="number"
                        value={config.macdSignal}
                        onChange={(e) =>
                          setConfig({ ...config, macdSignal: Number(e.target.value) || 9 })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-center font-bold text-white mt-0.5"
                      />
                    </div>
                  </div>

                  {/* Bollinger Toggle */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-slate-300 text-[11px]">بولنجر باند (BB 20,2)</span>
                    <input
                      type="checkbox"
                      checked={config.bbEnabled}
                      onChange={(e) => setConfig({ ...config, bbEnabled: e.target.checked })}
                      className="rounded accent-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Hover Crosshair Legend Bar */}
          <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs tabular-nums">
            <div className="flex flex-wrap items-center gap-4">
              <span className="font-bold text-white">{hoveredCandle.date}</span>
              <span className="text-slate-400">
                فتح: <span className="font-bold text-white">{hoveredCandle.open.toFixed(2)}</span>
              </span>
              <span className="text-slate-400">
                أعلى: <span className="font-bold text-emerald-400">{hoveredCandle.high.toFixed(2)}</span>
              </span>
              <span className="text-slate-400">
                أدنى: <span className="font-bold text-rose-400">{hoveredCandle.low.toFixed(2)}</span>
              </span>
              <span className="text-slate-400">
                إغلاق: <span className="font-bold text-white">{hoveredCandle.close.toFixed(2)}</span>
              </span>
              <span className="text-slate-400">
                كمية:{' '}
                <span className="font-bold text-amber-400">
                  {hoveredCandle.volume.toLocaleString()}
                </span>
              </span>
            </div>

            {/* Active Indicator Hover Readouts */}
            <div className="flex items-center gap-3 text-[11px]">
              {config.ma1Enabled && (
                <span className="text-sky-400 font-semibold">
                  MA({config.ma1Period}):{' '}
                  {ma1Values?.[hoverIndex ?? candles.length - 1]?.toFixed(2) ?? '-'}
                </span>
              )}
              {config.ma2Enabled && (
                <span className="text-amber-400 font-semibold">
                  MA({config.ma2Period}):{' '}
                  {ma2Values?.[hoverIndex ?? candles.length - 1]?.toFixed(2) ?? '-'}
                </span>
              )}
              {config.rsiEnabled && hoveredRsi !== null && (
                <span className="text-purple-400 font-semibold">
                  RSI({config.rsiPeriod}): {hoveredRsi?.toFixed(1) ?? '-'}
                </span>
              )}
            </div>
          </div>

          {/* Interactive SVG Main Price Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg overflow-hidden">
            <div className="w-full relative">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-auto select-none cursor-crosshair"
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const mouseX = ((e.clientX - rect.left) / rect.width) * chartWidth;
                  const ratio = Math.max(
                    0,
                    Math.min(1, (mouseX - padding.left) / innerWidth)
                  );
                  const idx = Math.round(ratio * (candles.length - 1));
                  setHoverIndex(idx);
                }}
                onMouseLeave={() => setHoverIndex(null)}
              >
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Gridlines & Y-Axis Prices */}
                {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                  const y = padding.top + innerHeight * pct;
                  const price = maxPrice - (maxPrice - minPrice) * pct;
                  return (
                    <g key={i}>
                      <line
                        x1={padding.left}
                        y1={y}
                        x2={padding.left + innerWidth}
                        y2={y}
                        stroke="#1e293b"
                        strokeDasharray="4 4"
                      />
                      <text
                        x={padding.left + innerWidth + 8}
                        y={y + 4}
                        fill="#64748b"
                        fontSize="10"
                        fontFamily="monospace"
                        textAnchor="start"
                      >
                        {price.toFixed(2)}
                      </text>
                    </g>
                  );
                })}

                {/* Bollinger Bands Overlay */}
                {bollingerBands && (
                  <>
                    <path
                      d={generateMAPath(bollingerBands.upper)}
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                    <path
                      d={generateMAPath(bollingerBands.lower)}
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                  </>
                )}

                {/* Area View */}
                {chartType === 'area' && (
                  <>
                    <path d={areaPath} fill="url(#areaGrad)" />
                    <path d={linePath} fill="none" stroke="#10b981" strokeWidth="2" />
                  </>
                )}

                {/* Candlestick View */}
                {chartType === 'candle' &&
                  candles.map((c, i) => {
                    const x = getX(i);
                    const openY = getY(c.open);
                    const closeY = getY(c.close);
                    const highY = getY(c.high);
                    const lowY = getY(c.low);
                    const isBullish = c.close >= c.open;
                    const candleColor = isBullish ? '#10b981' : '#f43f5e';
                    const candleWidth = Math.max(2, (innerWidth / candles.length) * 0.7);

                    return (
                      <g key={i}>
                        {/* Upper & Lower Wick */}
                        <line
                          x1={x}
                          y1={highY}
                          x2={x}
                          y2={lowY}
                          stroke={candleColor}
                          strokeWidth="1.2"
                        />
                        {/* Body */}
                        <rect
                          x={x - candleWidth / 2}
                          y={Math.min(openY, closeY)}
                          width={candleWidth}
                          height={Math.max(1.5, Math.abs(closeY - openY))}
                          fill={candleColor}
                          rx="0.5"
                        />
                      </g>
                    );
                  })}

                {/* Moving Average 1 Line */}
                {ma1Values && (
                  <path
                    d={generateMAPath(ma1Values)}
                    fill="none"
                    stroke={config.ma1Color}
                    strokeWidth="1.8"
                  />
                )}

                {/* Moving Average 2 Line */}
                {ma2Values && (
                  <path
                    d={generateMAPath(ma2Values)}
                    fill="none"
                    stroke={config.ma2Color}
                    strokeWidth="1.8"
                  />
                )}

                {/* Moving Average 3 Line */}
                {ma3Values && (
                  <path
                    d={generateMAPath(ma3Values)}
                    fill="none"
                    stroke={config.ma3Color}
                    strokeWidth="1.5"
                  />
                )}

                {/* Crosshair Cursor */}
                {hoverIndex !== null && (
                  <g>
                    <line
                      x1={getX(hoverIndex)}
                      y1={padding.top}
                      x2={getX(hoverIndex)}
                      y2={padding.top + innerHeight}
                      stroke="#94a3b8"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                    <circle
                      cx={getX(hoverIndex)}
                      cy={getY(hoveredCandle.close)}
                      r="4"
                      fill="#10b981"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                  </g>
                )}
              </svg>
            </div>
          </div>

          {/* Volume Sub-Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2 px-2">
              <span className="font-bold text-slate-300">أحجام التداول اليومية (Volume)</span>
              <span>
                آخر كمية:{' '}
                <span className="font-bold text-white tabular-nums">
                  {hoveredCandle.volume.toLocaleString()}
                </span>
              </span>
            </div>

            <div className="w-full">
              <svg viewBox={`0 0 ${chartWidth} 70`} className="w-full h-auto">
                {(() => {
                  const maxVol = Math.max(...candles.map((c) => c.volume), 1);
                  return candles.map((c, i) => {
                    const x = getX(i);
                    const barHeight = (c.volume / maxVol) * 55;
                    const isBullish = c.close >= c.open;
                    const w = Math.max(1.5, (innerWidth / candles.length) * 0.7);
                    return (
                      <rect
                        key={i}
                        x={x - w / 2}
                        y={65 - barHeight}
                        width={w}
                        height={barHeight}
                        fill={isBullish ? '#10b981' : '#f43f5e'}
                        opacity="0.8"
                      />
                    );
                  });
                })()}
              </svg>
            </div>
          </div>

          {/* RSI Sub-Chart (Configurable) */}
          {config.rsiEnabled && rsiValues && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
              <div className="flex items-center justify-between text-xs mb-2 px-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-purple-400">
                    مؤشر القوة النسبية RSI ({config.rsiPeriod})
                  </span>
                  <span className="text-[11px] text-slate-400">
                    تشبع شرائي: {config.rsiOverbought} / تشبع بيعي: {config.rsiOversold}
                  </span>
                </div>
                <div className="font-mono font-bold text-purple-300 tabular-nums">
                  {hoveredRsi !== null ? hoveredRsi?.toFixed(1) : '-'}
                  <span className="text-[10px] text-slate-400 mr-1.5 font-normal">
                    {hoveredRsi && hoveredRsi > config.rsiOverbought
                      ? '(تشبع شرائي)'
                      : hoveredRsi && hoveredRsi < config.rsiOversold
                      ? '(تشبع بيعي)'
                      : '(منطقة توازن)'}
                  </span>
                </div>
              </div>

              <div className="w-full">
                <svg viewBox={`0 0 ${chartWidth} 80`} className="w-full h-auto">
                  {/* Overbought & Oversold horizontal lines */}
                  {/* 70 line */}
                  <line
                    x1={padding.left}
                    y1={80 - (config.rsiOverbought / 100) * 70}
                    x2={padding.left + innerWidth}
                    y2={80 - (config.rsiOverbought / 100) * 70}
                    stroke="#f43f5e"
                    strokeDasharray="2 2"
                    strokeWidth="0.8"
                  />
                  {/* 30 line */}
                  <line
                    x1={padding.left}
                    y1={80 - (config.rsiOversold / 100) * 70}
                    x2={padding.left + innerWidth}
                    y2={80 - (config.rsiOversold / 100) * 70}
                    stroke="#10b981"
                    strokeDasharray="2 2"
                    strokeWidth="0.8"
                  />
                  {/* 50 Center line */}
                  <line
                    x1={padding.left}
                    y1={80 - 0.5 * 70}
                    x2={padding.left + innerWidth}
                    y2={80 - 0.5 * 70}
                    stroke="#334155"
                    strokeDasharray="3 3"
                  />

                  {/* RSI Path */}
                  {(() => {
                    const points: string[] = [];
                    rsiValues.forEach((val, idx) => {
                      if (val !== null) {
                        const y = 80 - (val / 100) * 70;
                        points.push(`${getX(idx)},${y}`);
                      }
                    });
                    if (points.length === 0) return null;
                    return (
                      <path
                        d={'M ' + points.join(' L ')}
                        fill="none"
                        stroke="#a855f7"
                        strokeWidth="1.8"
                      />
                    );
                  })()}

                  {/* Indicator hover point */}
                  {hoverIndex !== null && hoveredRsi !== null && (
                    <circle
                      cx={getX(hoverIndex)}
                      cy={80 - ((hoveredRsi ?? 50) / 100) * 70}
                      r="3.5"
                      fill="#a855f7"
                      stroke="#ffffff"
                    />
                  )}
                </svg>
              </div>
            </div>
          )}

          {/* MACD Sub-Chart (Configurable Fast, Slow, Signal) */}
          {config.macdEnabled && macdData && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
              <div className="flex items-center justify-between text-xs mb-2 px-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-400">
                    مؤشر الماكد MACD ({config.macdFast}, {config.macdSlow}, {config.macdSignal})
                  </span>
                  <span className="text-[11px] text-sky-400 font-mono">
                    MACD:{' '}
                    {hoveredMacd !== null && hoveredMacd !== undefined
                      ? hoveredMacd.toFixed(2)
                      : '-'}
                  </span>
                  <span className="text-[11px] text-amber-400 font-mono">
                    Signal:{' '}
                    {hoveredSignal !== null && hoveredSignal !== undefined
                      ? hoveredSignal.toFixed(2)
                      : '-'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">تقارب وتباعد المتوسطات المتحركة</div>
              </div>

              <div className="w-full">
                <svg viewBox={`0 0 ${chartWidth} 90`} className="w-full h-auto">
                  {/* Zero Line */}
                  <line
                    x1={padding.left}
                    y1={45}
                    x2={padding.left + innerWidth}
                    y2={45}
                    stroke="#475569"
                    strokeWidth="1"
                  />

                  {/* Histogram Bars */}
                  {macdData.histogram.map((hist, i) => {
                    if (hist === null) return null;
                    const x = getX(i);
                    const height = Math.min(38, Math.abs(hist) * 20);
                    const y = hist >= 0 ? 45 - height : 45;
                    const w = Math.max(1.5, (innerWidth / candles.length) * 0.7);
                    return (
                      <rect
                        key={i}
                        x={x - w / 2}
                        y={y}
                        width={w}
                        height={Math.max(1, height)}
                        fill={hist >= 0 ? '#10b981' : '#f43f5e'}
                        opacity="0.85"
                      />
                    );
                  })}

                  {/* MACD Line */}
                  {(() => {
                    const points: string[] = [];
                    macdData.macdLine.forEach((val, idx) => {
                      if (val !== null) {
                        const y = 45 - Math.max(-38, Math.min(38, val * 20));
                        points.push(`${getX(idx)},${y}`);
                      }
                    });
                    if (points.length === 0) return null;
                    return (
                      <path
                        d={'M ' + points.join(' L ')}
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="1.6"
                      />
                    );
                  })()}

                  {/* Signal Line */}
                  {(() => {
                    const points: string[] = [];
                    macdData.signalLine.forEach((val, idx) => {
                      if (val !== null) {
                        const y = 45 - Math.max(-38, Math.min(38, val * 20));
                        points.push(`${getX(idx)},${y}`);
                      }
                    });
                    if (points.length === 0) return null;
                    return (
                      <path
                        d={'M ' + points.join(' L ')}
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="1.6"
                      />
                    );
                  })()}
                </svg>
              </div>
            </div>
          )}

          {/* Deep Algorithmic Diagnostic Report Box (تقرير شمنديكو) */}
          <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">
                      تقرير شمنديكو للتشخيص الفني والسيولة
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                        deepReport.verdict === 'شراء قوي' || deepReport.verdict === 'شراء'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                          : deepReport.verdict === 'بيع قوي' || deepReport.verdict === 'بيع'
                          ? 'bg-rose-950 text-rose-400 border border-rose-500/40'
                          : 'bg-amber-950 text-amber-400 border border-amber-500/40'
                      }`}
                    >
                      {deepReport.verdict}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    تحليل آلي فوري يدمج حركة الأسعار والمؤشرات الفنية وتدفقات السيولة وهامش الأمان
                  </p>
                </div>
              </div>

              {/* Confidence Score */}
              <div className="text-left bg-slate-950 p-2.5 rounded-xl border border-slate-800 shrink-0">
                <div className="text-[10px] text-slate-400">درجة إيجابية السهم</div>
                <div className="text-lg font-black text-emerald-400 tabular-nums">
                  {deepReport.verdictScore}/100
                </div>
              </div>
            </div>

            {/* Trading Levels Card */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 text-xs tabular-nums">
              <div>
                <div className="text-[11px] text-slate-500 font-medium">نطاق الدخول المقترح</div>
                <div className="font-bold text-white mt-1">
                  {deepReport.suggestedLevels.entryZone}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-medium">الهدف الأول (مقاومة 1)</div>
                <div className="font-bold text-emerald-400 mt-1">
                  {deepReport.suggestedLevels.target1} ج.م
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-medium">الهدف الثاني (مقاومة 2)</div>
                <div className="font-bold text-emerald-400 mt-1">
                  {deepReport.suggestedLevels.target2} ج.م
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-medium">وقف الخسارة المرجعي</div>
                <div className="font-bold text-rose-400 mt-1">
                  {deepReport.suggestedLevels.stopLoss} ج.م
                </div>
              </div>
            </div>

            {/* Detailed Signal Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {deepReport.signals.map((sig, i) => (
                <div
                  key={i}
                  className="p-3 bg-slate-950/50 rounded-xl border border-slate-800/60 flex items-start gap-3"
                >
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 mt-0.5 ${
                      sig.signal === 'إيجابي'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                        : sig.signal === 'سلبي'
                        ? 'bg-rose-950 text-rose-400 border border-rose-500/30'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {sig.signal}
                  </span>
                  <div>
                    <div className="font-bold text-slate-200">{sig.name}</div>
                    <div className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                      {sig.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Order Book & Market Depth (عمق السوق) */}
      {activeTab === 'depth' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Book Tables */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-white text-sm">دفتر الأوامر اللحظي (Level 2 Quotes)</h3>
              </div>
              <span className="text-xs text-slate-400">أفضل 5 طلبات وعروض</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs tabular-nums">
              {/* Bids (طلبات الشراء) */}
              <div className="space-y-1.5">
                <div className="text-emerald-400 font-bold text-[11px] border-b border-emerald-500/20 pb-1 flex justify-between">
                  <span>طلبات الشراء (Bid)</span>
                  <span>الكمية</span>
                </div>
                {stock.orderBook.bids.map((b, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded bg-emerald-950/20 border border-emerald-500/10 text-slate-200"
                  >
                    <div>
                      <span className="font-bold text-emerald-400">{b.price.toFixed(2)}</span>
                      <span className="text-[10px] text-slate-500 mr-2">({b.orders} طلب)</span>
                    </div>
                    <span className="font-semibold">{b.quantity.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Asks (عروض البيع) */}
              <div className="space-y-1.5">
                <div className="text-rose-400 font-bold text-[11px] border-b border-rose-500/20 pb-1 flex justify-between">
                  <span>عروض البيع (Ask)</span>
                  <span>الكمية</span>
                </div>
                {stock.orderBook.asks.map((a, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded bg-rose-950/20 border border-rose-500/10 text-slate-200"
                  >
                    <div>
                      <span className="font-bold text-rose-400">{a.price.toFixed(2)}</span>
                      <span className="text-[10px] text-slate-500 mr-2">({a.orders} عرض)</span>
                    </div>
                    <span className="font-semibold">{a.quantity.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pivot Points & Support Resistance Levels */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-white text-sm">نقاط الدعم والمقاومة اليومية (Pivot Points)</h3>
              </div>
              <span className="text-xs text-slate-400">حسابات كلاسيكية وفيبوناتشي</span>
            </div>

            <div className="space-y-2 text-xs tabular-nums">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/30">
                <span className="text-rose-300 font-bold">المقاومة الثالثة (R3)</span>
                <span className="font-bold text-white">{pivotPoints.r3} ج.م</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-rose-950/30 border border-rose-500/20">
                <span className="text-rose-400 font-bold">المقاومة الثانية (R2)</span>
                <span className="font-bold text-white">{pivotPoints.r2} ج.م</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-rose-950/20 border border-rose-500/10">
                <span className="text-rose-400 font-bold">المقاومة الأولى (R1)</span>
                <span className="font-bold text-white">{pivotPoints.r1} ج.م</span>
              </div>

              {/* Pivot Point Line */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-amber-950/40 border border-amber-500/40">
                <span className="text-amber-300 font-bold">نقطة الارتكاز المحورية (Pivot)</span>
                <span className="font-black text-amber-300 text-sm">{pivotPoints.pivot} ج.م</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/10">
                <span className="text-emerald-400 font-bold">الدعم الأول (S1)</span>
                <span className="font-bold text-white">{pivotPoints.s1} ج.م</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/20">
                <span className="text-emerald-400 font-bold">الدعم الثاني (S2)</span>
                <span className="font-bold text-white">{pivotPoints.s2} ج.م</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30">
                <span className="text-emerald-300 font-bold">الدعم الثالث (S3)</span>
                <span className="font-bold text-white">{pivotPoints.s3} ج.م</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Fundamental & Valuation Analysis */}
      {activeTab === 'fundamentals' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* P/E Ratio */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <div className="text-slate-400 text-[11px]">مكرر الربحية (P/E Ratio)</div>
              <div className="text-2xl font-black text-white mt-1 tabular-nums">
                {stock.peRatio}x
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                {stock.peRatio < 8
                  ? 'مكرر منخفض وجذاب جداً استثمارياً مقارنة بمتوسط السوق'
                  : 'مكرر ربحية يعكس توقعات نمو متوازنة'}
              </p>
            </div>

            {/* P/B Ratio */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <div className="text-slate-400 text-[11px]">مضاعف القيمة الدفترية (P/B)</div>
              <div className="text-2xl font-black text-white mt-1 tabular-nums">
                {stock.pbRatio}x
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                القيمة الدفترية للسهم: {stock.bookValuePerShare} ج.م
              </p>
            </div>

            {/* Dividend Yield */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <div className="text-slate-400 text-[11px]">عائد التوزيعات النقدية</div>
              <div className="text-2xl font-black text-emerald-400 mt-1 tabular-nums">
                {stock.dividendYield}%
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                {stock.dividendYield > 6
                  ? 'سهم عالي التوزيعات النقدية (Dividend Aristocrat)'
                  : 'توزيعات مستقرة مع إعادة استثمار الأرباح'}
              </p>
            </div>

            {/* Fair Value & Safety */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <div className="text-slate-400 text-[11px]">القيمة العادلة المقدرة</div>
              <div className="text-2xl font-black text-teal-400 mt-1 tabular-nums">
                {stock.fairValue} ج.م
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                هامش الأمان: +{stock.marginOfSafety}% من السعر السوقي الحالي
              </p>
            </div>
          </div>

          {/* Institutional Ownership & Shares Structure */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <h3 className="font-bold text-white text-sm mb-4">
              هيكل الملكية والمساهمين ورأس المال
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs tabular-nums">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-slate-500">عدد الأسهم المصدرة</div>
                <div className="text-base font-bold text-white mt-1">
                  {stock.sharesOutstanding.toLocaleString()} مليون سهم
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-slate-500">نسبة الأسهم حرة التداول</div>
                <div className="text-base font-bold text-emerald-400 mt-1">
                  {stock.freeFloat}%
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-slate-500">ملكية المؤسسات والصناديق</div>
                <div className="text-base font-bold text-amber-400 mt-1">
                  {stock.institutionOwnership}%
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-slate-500">ملكية الأجانب</div>
                <div className="text-base font-bold text-slate-200 mt-1">
                  {stock.foreignOwnership}%
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Disclosures & EGX News */}
      {activeTab === 'disclosures' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-white text-sm">
              إفصاحات وقرارات الشركة الرسمية في البورصة المصرية
            </h3>
            <span className="text-xs text-slate-400">بيانات موثقة من إدارة الإفصاح</span>
          </div>

          <div className="space-y-3">
            {stock.disclosures.map((disc) => (
              <div
                key={disc.id}
                className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between gap-3 text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                      {disc.category}
                    </span>
                    <span className="font-bold text-white">{disc.title}</span>
                  </div>
                  <span className="text-slate-500 font-mono text-[11px]">{disc.date}</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mt-2">{disc.summary}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
