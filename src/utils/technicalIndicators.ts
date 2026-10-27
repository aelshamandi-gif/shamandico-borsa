import { Candle, Stock } from '../types/market';

/**
 * Calculate Simple Moving Average (SMA)
 */
export function calculateSMA(data: Candle[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j].close;
      }
      result.push(Number((sum / period).toFixed(2)));
    }
  }
  return result;
}

/**
 * Calculate Exponential Moving Average (EMA)
 */
export function calculateEMA(data: Candle[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  const k = 2 / (period + 1);
  let previousEMA: number | null = null;

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else if (i === period - 1) {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j].close;
      }
      previousEMA = sum / period;
      result.push(Number(previousEMA.toFixed(2)));
    } else {
      const currentClose = data[i].close;
      const currentEMA: number = currentClose * k + (previousEMA as number) * (1 - k);
      previousEMA = currentEMA;
      result.push(Number(currentEMA.toFixed(2)));
    }
  }
  return result;
}

/**
 * Calculate Relative Strength Index (RSI)
 */
export function calculateRSI(data: Candle[], period: number = 14): (number | null)[] {
  const result: (number | null)[] = [];
  if (data.length <= period) {
    return data.map(() => null);
  }

  const gains: number[] = [];
  const losses: number[] = [];

  for (let i = 1; i < data.length; i++) {
    const diff = data[i].close - data[i - 1].close;
    if (diff >= 0) {
      gains.push(diff);
      losses.push(0);
    } else {
      gains.push(0);
      losses.push(Math.abs(diff));
    }
  }

  // Initial nulls
  for (let i = 0; i < period; i++) {
    result.push(null);
  }

  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

  const firstRS = avgLoss === 0 ? 100 : avgGain / avgLoss;
  const firstRSI = avgLoss === 0 ? 100 : 100 - 100 / (1 + firstRS);
  result.push(Number(firstRSI.toFixed(2)));

  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;

    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = avgLoss === 0 ? 100 : 100 - 100 / (1 + rs);
    result.push(Number(rsi.toFixed(2)));
  }

  return result;
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 */
export interface MACDResult {
  macdLine: (number | null)[];
  signalLine: (number | null)[];
  histogram: (number | null)[];
}

export function calculateMACD(
  data: Candle[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): MACDResult {
  const fastEMA = calculateEMA(data, fastPeriod);
  const slowEMA = calculateEMA(data, slowPeriod);

  const macdLine: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (fastEMA[i] !== null && slowEMA[i] !== null) {
      macdLine.push(Number(((fastEMA[i] as number) - (slowEMA[i] as number)).toFixed(3)));
    } else {
      macdLine.push(null);
    }
  }

  // Calculate signal line (EMA of MACD line)
  const validMacdValues: { close: number }[] = [];
  const offset = macdLine.findIndex((v) => v !== null);

  if (offset === -1) {
    return {
      macdLine,
      signalLine: data.map(() => null),
      histogram: data.map(() => null),
    };
  }

  for (let i = offset; i < macdLine.length; i++) {
    validMacdValues.push({ close: macdLine[i] as number });
  }

  const signalLineRaw = calculateEMA(validMacdValues as any, signalPeriod);
  const signalLine: (number | null)[] = [];
  for (let i = 0; i < offset; i++) {
    signalLine.push(null);
  }
  signalLine.push(...signalLineRaw);

  const histogram: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (macdLine[i] !== null && signalLine[i] !== null) {
      histogram.push(Number(((macdLine[i] as number) - (signalLine[i] as number)).toFixed(3)));
    } else {
      histogram.push(null);
    }
  }

  return { macdLine, signalLine, histogram };
}

/**
 * Calculate Bollinger Bands
 */
export interface BollingerBandsResult {
  upper: (number | null)[];
  middle: (number | null)[];
  lower: (number | null)[];
}

export function calculateBollingerBands(
  data: Candle[],
  period: number = 20,
  stdDevMultiplier: number = 2
): BollingerBandsResult {
  const middle = calculateSMA(data, period);
  const upper: (number | null)[] = [];
  const lower: (number | null)[] = [];

  for (let i = 0; i < data.length; i++) {
    if (middle[i] === null) {
      upper.push(null);
      lower.push(null);
    } else {
      let sumSquares = 0;
      for (let j = 0; j < period; j++) {
        const diff = data[i - j].close - (middle[i] as number);
        sumSquares += diff * diff;
      }
      const variance = sumSquares / period;
      const stdDev = Math.sqrt(variance);

      upper.push(Number(((middle[i] as number) + stdDevMultiplier * stdDev).toFixed(2)));
      lower.push(Number(((middle[i] as number) - stdDevMultiplier * stdDev).toFixed(2)));
    }
  }

  return { upper, middle, lower };
}

/**
 * Calculate Pivot Points (Classic, Camarilla, Fibonacci)
 */
export interface PivotPoints {
  pivot: number;
  r1: number;
  r2: number;
  r3: number;
  s1: number;
  s2: number;
  s3: number;
  fibonacci: {
    r1: number;
    r2: number;
    r3: number;
    s1: number;
    s2: number;
    s3: number;
  };
}

export function calculatePivotPoints(high: number, low: number, close: number): PivotPoints {
  const pivot = (high + low + close) / 3;
  const range = high - low;

  // Classic
  const r1 = 2 * pivot - low;
  const s1 = 2 * pivot - high;
  const r2 = pivot + range;
  const s2 = pivot - range;
  const r3 = high + 2 * (pivot - low);
  const s3 = low - 2 * (high - pivot);

  // Fibonacci
  const fibR1 = pivot + 0.382 * range;
  const fibR2 = pivot + 0.618 * range;
  const fibR3 = pivot + 1.0 * range;
  const fibS1 = pivot - 0.382 * range;
  const fibS2 = pivot - 0.618 * range;
  const fibS3 = pivot - 1.0 * range;

  return {
    pivot: Number(pivot.toFixed(2)),
    r1: Number(r1.toFixed(2)),
    r2: Number(r2.toFixed(2)),
    r3: Number(r3.toFixed(2)),
    s1: Number(s1.toFixed(2)),
    s2: Number(s2.toFixed(2)),
    s3: Number(s3.toFixed(2)),
    fibonacci: {
      r1: Number(fibR1.toFixed(2)),
      r2: Number(fibR2.toFixed(2)),
      r3: Number(fibR3.toFixed(2)),
      s1: Number(fibS1.toFixed(2)),
      s2: Number(fibS2.toFixed(2)),
      s3: Number(fibS3.toFixed(2)),
    },
  };
}

export interface DeepStockReport {
  verdict: 'شراء قوي' | 'شراء' | 'حياد / ترقب' | 'بيع' | 'بيع قوي';
  verdictScore: number; // 0 - 100
  trendSummary: string;
  liquiditySummary: string;
  valuationSummary: string;
  signals: {
    name: string;
    signal: 'إيجابي' | 'سلبي' | 'محايد';
    description: string;
  }[];
  suggestedLevels: {
    entryZone: string;
    target1: number;
    target2: number;
    stopLoss: number;
    riskRewardRatio: string;
  };
}

/**
 * Generate deep technical and liquidity diagnosis for a stock
 */
export function generateDeepStockReport(
  stock: Stock,
  candles: Candle[],
  rsiPeriod: number = 14
): DeepStockReport {
  const currentPrice = stock.price;
  const rsiValues = calculateRSI(candles, rsiPeriod);
  const latestRSI = rsiValues[rsiValues.length - 1] ?? 50;

  const macd = calculateMACD(candles);
  const latestHist = macd.histogram[macd.histogram.length - 1] ?? 0;
  const prevHist = macd.histogram[macd.histogram.length - 2] ?? 0;

  const sma20 = calculateSMA(candles, 20);
  const latestSMA20 = sma20[sma20.length - 1] ?? currentPrice;

  const sma50 = calculateSMA(candles, 50);
  const latestSMA50 = sma50[sma50.length - 1] ?? currentPrice;

  const pivots = calculatePivotPoints(stock.high, stock.low, stock.previousClose);

  // Score computation
  let score = 50;
  const signals: DeepStockReport['signals'] = [];

  // 1. RSI Signal
  if (latestRSI > 70) {
    score -= 10;
    signals.push({
      name: `مؤشر القوة النسبية RSI (${latestRSI.toFixed(1)})`,
      signal: 'سلبي',
      description: 'تشبع شرائي في المنطقة الحالية، قد يشهد السهم جني أرباح أو تهدئة.',
    });
  } else if (latestRSI < 30) {
    score += 15;
    signals.push({
      name: `مؤشر القوة النسبية RSI (${latestRSI.toFixed(1)})`,
      signal: 'إيجابي',
      description: 'تشبع بيعي ارتدادي، فرصة لتمركز مضاربي مع إشارات ارتداد.',
    });
  } else if (latestRSI >= 50) {
    score += 10;
    signals.push({
      name: `مؤشر القوة النسبية RSI (${latestRSI.toFixed(1)})`,
      signal: 'إيجابي',
      description: 'القوة الشرائية أعلى من خط المنتصف 50 وتدعم استمرار الزخم الصاعد.',
    });
  } else {
    score -= 5;
    signals.push({
      name: `مؤشر القوة النسبية RSI (${latestRSI.toFixed(1)})`,
      signal: 'سلبي',
      description: 'القوة الشرائية أدنى من مستوى 50 تعكس ضغطاً بيعياً مؤقتاً.',
    });
  }

  // 2. MACD Signal
  if (latestHist > 0 && latestHist > prevHist) {
    score += 15;
    signals.push({
      name: 'مؤشر الماكد MACD',
      signal: 'إيجابي',
      description: 'تقاطع صاعد وأعمدة هيستوجرام خضراء تتسع مما يؤكد تسارع الزخم.',
    });
  } else if (latestHist > 0 && latestHist <= prevHist) {
    signals.push({
      name: 'مؤشر الماكد MACD',
      signal: 'محايد',
      description: 'الماكد إيجابي ولكن هناك تباطؤ طفيف في وتيرة التسارع.',
    });
  } else if (latestHist < 0 && latestHist < prevHist) {
    score -= 15;
    signals.push({
      name: 'مؤشر الماكد MACD',
      signal: 'سلبي',
      description: 'تقاطع هابط وتزايد الضغط البيعي وفقاً لأعمدة الهيستوجرام.',
    });
  } else {
    signals.push({
      name: 'مؤشر الماكد MACD',
      signal: 'محايد',
      description: 'الماكد في مرحلة تقارب وتجهيز لانعكاس محتمل.',
    });
  }

  // 3. Moving Average Position
  if (currentPrice > latestSMA20 && latestSMA20 > latestSMA50) {
    score += 15;
    signals.push({
      name: 'المتوسطات المتحركة (SMA 20 & SMA 50)',
      signal: 'إيجابي',
      description: 'السهم يتداول أعلى متوسطاته في ترتيب صاعد نموذجي (Golden Alignment).',
    });
  } else if (currentPrice < latestSMA20 && currentPrice < latestSMA50) {
    score -= 15;
    signals.push({
      name: 'المتوسطات المتحركة (SMA 20 & SMA 50)',
      signal: 'سلبي',
      description: 'السهم يتداول أدنى المتوسطات الرئيسية مما يجعلها مستويات مقاومة قوية.',
    });
  } else {
    signals.push({
      name: 'المتوسطات المتحركة',
      signal: 'محايد',
      description: 'السهم يتأرجح بين متوسط 20 و50 يوماً في مسار عرضي تجميعي.',
    });
  }

  // 4. Liquidity Analysis
  if (stock.inflowPercent > 55) {
    score += 15;
    signals.push({
      name: `سيولة السهم (الداخلة ${stock.inflowPercent}%)`,
      signal: 'إيجابي',
      description: `سيولة شرائية قوية مع طلبات تنفيذ على العرض (Aggressive Buying) بقيمة تداول ${((stock.turnover)/1e6).toFixed(1)} مليون جنيه.`,
    });
  } else if (stock.inflowPercent < 45) {
    score -= 15;
    signals.push({
      name: `سيولة السهم (الخارجة ${stock.outflowPercent}%)`,
      signal: 'سلبي',
      description: 'غلبة أوامر البيع على الطلب مع تخارج سيولة للمضاربين.',
    });
  } else {
    signals.push({
      name: 'توازن السيولة',
      signal: 'محايد',
      description: 'توازن نسبي بين قوى العرض والطلب دون هيمنة واضحة لطرف.',
    });
  }

  // 5. Valuation & Margin of Safety
  if (stock.marginOfSafety > 15) {
    score += 10;
    signals.push({
      name: `هامش الأمان المالي (+${stock.marginOfSafety}%)`,
      signal: 'إيجابي',
      description: `السهم يتداول بخصم عن قيمته العادلة المقدرة بـ ${stock.fairValue} جنيه، بمكرر ربحية ${stock.peRatio}x.`,
    });
  } else if (stock.marginOfSafety < -15) {
    score -= 10;
    signals.push({
      name: `هامش الأمان المالي (${stock.marginOfSafety}%)`,
      signal: 'سلبي',
      description: `السهم تخطى القيمة العادلة المقدرة بـ ${stock.fairValue} جنيه ويتداول بعلاوة سعرية مرتفعة.`,
    });
  }

  // Normalize score
  score = Math.max(10, Math.min(95, score));

  let verdict: DeepStockReport['verdict'] = 'حياد / ترقب';
  if (score >= 75) verdict = 'شراء قوي';
  else if (score >= 60) verdict = 'شراء';
  else if (score <= 35) verdict = 'بيع قوي';
  else if (score <= 45) verdict = 'بيع';

  const stopLoss = Number((Math.min(stock.low * 0.98, pivots.s1 * 0.99)).toFixed(2));
  const target1 = Number(Math.max(pivots.r1, currentPrice * 1.04).toFixed(2));
  const target2 = Number(Math.max(pivots.r2, currentPrice * 1.085).toFixed(2));
  const entryZone = `${Number((currentPrice * 0.99).toFixed(2))} - ${Number((currentPrice * 1.005).toFixed(2))} ج.م`;
  const risk = Math.abs(currentPrice - stopLoss);
  const reward = Math.abs(target1 - currentPrice);
  const riskReward = (reward / (risk || 0.1)).toFixed(1);

  return {
    verdict,
    verdictScore: score,
    trendSummary:
      verdict === 'شراء قوي' || verdict === 'شراء'
        ? 'اتجاه صاعد مدعوم بتدفقات سيولة مؤسسية ونشاط واضح على مستويات الطلب.'
        : verdict === 'بيع قوي' || verdict === 'بيع'
        ? 'اتجاه هابط أو تصحيحي مع ضغوط بيعية واضحة تتطلب الحذر والالتزام بوقف الخسارة.'
        : 'حركة تذبذب عرضية في انتظار اختراق مستويات المقاومة أو تأكيد السيولة.',
    liquiditySummary:
      stock.inflowPercent >= 50
        ? `السهم يشهد سيولة داخلة بنسبة ${stock.inflowPercent}% من إجمالي تداولاته البالغة ${((stock.turnover)/1e6).toFixed(1)} مليون ج.م مع مؤشر سيولة ذكية ${stock.smartMoneyIndex}/100.`
        : `تداول السهم يعكس خروج سيولة بنسبة ${stock.outflowPercent}% مما يرجح استمرار التهدئة لحين ظهور طلبات جديدة.`,
    valuationSummary:
      stock.peRatio < 10
        ? `التقييم جذاب بمكرر ربحية منخفض ${stock.peRatio}x وعائد توزيعات ${stock.dividendYield}% مع قيمة عادلة ${stock.fairValue} ج.م.`
        : `مكرر ربحية السهم يبلغ ${stock.peRatio}x ومضاعف القيمة الدفترية ${stock.pbRatio}x مقارنة بمتوسط القطاع.`,
    signals,
    suggestedLevels: {
      entryZone,
      target1,
      target2,
      stopLoss,
      riskRewardRatio: `1 : ${riskReward}`,
    },
  };
}
