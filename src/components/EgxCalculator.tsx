import React, { useState } from 'react';
import { Stock } from '../types/market';
import {
  Calculator,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Percent,
  ShieldCheck,
  Check,
  RefreshCw,
  Info,
} from 'lucide-react';

interface EgxCalculatorProps {
  stocks: Stock[];
  selectedStock?: Stock;
}

export const EgxCalculator: React.FC<EgxCalculatorProps> = ({ stocks, selectedStock }) => {
  const [chosenStockCode, setChosenStockCode] = useState<string>(
    selectedStock?.code || stocks[0]?.code || 'COMI'
  );
  const currentStock = stocks.find((s) => s.code === chosenStockCode) || stocks[0];

  const [buyPrice, setBuyPrice] = useState<number>(currentStock ? currentStock.price : 84.5);
  const [quantity, setQuantity] = useState<number>(1000);
  const [targetSellPrice, setTargetSellPrice] = useState<number>(
    currentStock ? Number((currentStock.price * 1.05).toFixed(2)) : 88.75
  );

  // Broker commission rate (default 0.15% = 0.0015)
  const [brokerCommissionRate, setBrokerCommissionRate] = useState<number>(0.15); // %

  // Official statutory EGX fees:
  // EGX: 0.00012 (0.012%)
  // FRA: 0.00005 (0.005%)
  // MCDR (Misr Clearing): 0.00010 (0.01%)
  // Investor Protection Fund: 0.00005 (0.005%)
  // Total statutory fees = 0.032%
  const statutoryRate = 0.032; // %

  const totalFeePercentPerLeg = brokerCommissionRate + statutoryRate; // e.g. 0.182%

  // Calculations
  const grossBuyAmount = buyPrice * quantity;
  const buyFees = grossBuyAmount * (totalFeePercentPerLeg / 100);
  const totalBuyCost = grossBuyAmount + buyFees;

  const grossSellAmount = targetSellPrice * quantity;
  const sellFees = grossSellAmount * (totalFeePercentPerLeg / 100);
  const netSellProceeds = grossSellAmount - sellFees;

  const netProfit = netSellProceeds - totalBuyCost;
  const roiPercent = totalBuyCost > 0 ? (netProfit / totalBuyCost) * 100 : 0;

  // Break-even price
  // P_sell * (1 - r) = P_buy * (1 + r)
  // P_sell = P_buy * (1 + r) / (1 - r)
  const r = totalFeePercentPerLeg / 100;
  const breakEvenPrice = Number((buyPrice * ((1 + r) / (1 - r))).toFixed(3));

  const handleStockChange = (code: string) => {
    setChosenStockCode(code);
    const s = stocks.find((item) => item.code === code);
    if (s) {
      setBuyPrice(s.price);
      setTargetSellPrice(Number((s.price * 1.05).toFixed(2)));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-1">
          <Calculator className="w-4 h-4" />
          <span>حاسبة عمولات وأرباح التداول في البورصة المصرية EGX</span>
        </div>
        <h2 className="text-xl font-black text-white">
          حساب صافي الأرباح، سعر التعادل، ومصاريف السمسرة والجهات الرقابية
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
          تعتمد الحاسبة على مصاريف التداول الرسمية المطبقة في البورصة المصرية (عمولة شركة السمسرة +
          مصاريف البورصة وهيئة الرقابة المالية ومصر للمقاصة وصندوق حماية المستثمر) لحساب سعر
          التعادل بدقة بالغة قبل تنفيذ الصفقة.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs Panel */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-5">
          <h3 className="font-bold text-white text-sm pb-3 border-b border-slate-800">
            بيانات الصفقة والشراء والبيع
          </h3>

          {/* Stock Quick Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              اختر سهم من البورصة المصرية لتعبئة السعر تلقائياً:
            </label>
            <select
              value={chosenStockCode}
              onChange={(e) => handleStockChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-white p-2.5 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
            >
              {stocks.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.code} - {s.nameAr} ({s.price.toFixed(2)} ج.م)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Buy Price */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                سعر الشراء للسهم الواحد (ج.م) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={buyPrice}
                onChange={(e) => setBuyPrice(Number(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 text-sm font-bold text-white p-2.5 rounded-xl focus:outline-none focus:border-emerald-500 tabular-nums"
              />
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                كمية الأسهم (عدد الأسهم) *
              </label>
              <input
                type="number"
                step="100"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 text-sm font-bold text-white p-2.5 rounded-xl focus:outline-none focus:border-emerald-500 tabular-nums"
              />
            </div>
          </div>

          {/* Target Sell Price */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              سعر البيع المستهدف (ج.م) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={targetSellPrice}
              onChange={(e) => setTargetSellPrice(Number(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-800 text-sm font-bold text-white p-2.5 rounded-xl focus:outline-none focus:border-emerald-500 tabular-nums"
            />
          </div>

          {/* Custom Broker Commission */}
          <div className="pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300">
                نسبة عمولة شركة السمسرة الخاصة بك (%)
              </label>
              <span className="text-xs font-bold text-emerald-400 font-mono">
                {brokerCommissionRate}%
              </span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.40"
              step="0.01"
              value={brokerCommissionRate}
              onChange={(e) => setBrokerCommissionRate(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>0.05% (تخفيضات كبرى)</span>
              <span>0.15% (النسبة الشائعة)</span>
              <span>0.40% (كلاسيكي)</span>
            </div>
          </div>

          {/* Statutory Breakdown Reference */}
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
            <div className="font-semibold text-slate-300 mb-1">
              الرسوم الرسمية الثابتة المقررة (0.032%):
            </div>
            <div className="flex justify-between">
              <span>عمولة البورصة المصرية:</span>
              <span className="font-mono text-slate-300">0.012%</span>
            </div>
            <div className="flex justify-between">
              <span>الهيئة العامة للرقابة المالية (FRA):</span>
              <span className="font-mono text-slate-300">0.005%</span>
            </div>
            <div className="flex justify-between">
              <span>شركة مصر للمقاصة والإيداع (MCDR):</span>
              <span className="font-mono text-slate-300">0.010%</span>
            </div>
            <div className="flex justify-between">
              <span>صندوق حماية المستثمر:</span>
              <span className="font-mono text-slate-300">0.005%</span>
            </div>
          </div>
        </div>

        {/* Right Results Panel */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Profit / Loss Card */}
          <div
            className={`border rounded-2xl p-6 shadow-xl relative overflow-hidden transition-all ${
              netProfit >= 0
                ? 'bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-500/40'
                : 'bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-900 border-rose-500/40'
            }`}
          >
            <div className="text-xs text-slate-400 font-medium">صافي الربح / الخسارة المتوقع</div>
            <div
              className={`text-3xl font-black tabular-nums mt-1 ${
                netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {netProfit >= 0 ? '+' : ''}
              {netProfit.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              <span className="text-sm font-bold text-slate-300">ج.م</span>
            </div>

            <div
              className={`text-sm font-bold mt-2 flex items-center gap-1.5 ${
                roiPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {roiPercent >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>
                العائد على الاستثمار (ROI): {roiPercent >= 0 ? '+' : ''}
                {roiPercent.toFixed(2)}%
              </span>
            </div>

            {/* Break-Even Highlight */}
            <div className="mt-5 pt-4 border-t border-slate-800/80 bg-slate-950/60 -mx-6 -mb-6 p-5">
              <div className="text-[11px] text-slate-400 font-medium">
                سعر التعادل لتغطية كامل العمولات (Break-even):
              </div>
              <div className="text-xl font-black text-amber-400 tabular-nums mt-0.5">
                {breakEvenPrice.toFixed(3)} ج.م
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                أي بيع أعلى من {breakEvenPrice.toFixed(3)} ج.م يحقق ربحاً صافياً لحسابك.
              </p>
            </div>
          </div>

          {/* Financial Breakdown Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-xs tabular-nums space-y-2.5">
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">إجمالي قيمة الشراء الإسمية:</span>
              <span className="font-bold text-white">
                {grossBuyAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.م
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">مصاريف وعمولات الشراء ({totalFeePercentPerLeg.toFixed(3)}%):</span>
              <span className="font-semibold text-rose-400">
                {buyFees.toFixed(2)} ج.م
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-800 font-bold">
              <span className="text-slate-300">التكلفة الفعلية الكلية للشراء:</span>
              <span className="text-white">
                {totalBuyCost.toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.م
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">إجمالي قيمة البيع الإسمية:</span>
              <span className="font-bold text-white">
                {grossSellAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.م
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">مصاريف وعمولات البيع:</span>
              <span className="font-semibold text-rose-400">
                {sellFees.toFixed(2)} ج.م
              </span>
            </div>

            <div className="flex justify-between py-1.5 font-bold">
              <span className="text-slate-300">صافي المبلغ المستلم عند البيع:</span>
              <span className="text-emerald-400">
                {netSellProceeds.toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.م
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
