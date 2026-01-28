"use client";

import { useState, useMemo, useCallback } from "react";
import { Calculator } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface EMICalculatorProps {
  minAmount?: number;
  maxAmount?: number;
  minTenure?: number;
  maxTenure?: number;
  defaultRate?: number;
  productName?: string;
  productNameHi?: string;
}

export function EMICalculator({
  minAmount = 50000,
  maxAmount = 1000000,
  minTenure = 12,
  maxTenure = 60,
  defaultRate = 10.5,
  productName = "Loan",
  productNameHi = "लोन",
}: EMICalculatorProps) {
  const { locale } = useTranslation();
  const [amount, setAmount] = useState(Math.round((minAmount + maxAmount) / 2));
  const [tenure, setTenure] = useState(Math.round((minTenure + maxTenure) / 2));
  const [rate, setRate] = useState(defaultRate);

  // Translations
  const texts = {
    title: locale === 'hi' ? 'EMI कैलकुलेटर' : 'EMI Calculator',
    subtitle: locale === 'hi' ? `अपनी ${productNameHi} EMI की गणना करें` : `Calculate your ${productName} EMI`,
    loanAmount: locale === 'hi' ? 'लोन राशि' : 'Loan Amount',
    interestRate: locale === 'hi' ? 'ब्याज दर (प्रति वर्ष)' : 'Interest Rate (p.a.)',
    tenure: locale === 'hi' ? 'लोन अवधि' : 'Loan Tenure',
    months: locale === 'hi' ? 'महीने' : 'Months',
    monthsShort: locale === 'hi' ? 'महीने' : 'Mo',
    monthlyEmi: locale === 'hi' ? 'मासिक EMI' : 'Monthly EMI',
    totalInterest: locale === 'hi' ? 'कुल ब्याज' : 'Total Interest',
    totalPayable: locale === 'hi' ? 'कुल भुगतान' : 'Total Payable',
  };

  const calculateEMI = useCallback(
    (principal: number, annualRate: number, months: number) => {
      const monthlyRate = annualRate / 12 / 100;
      if (monthlyRate === 0) return principal / months;
      const emi =
        (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1);
      return Math.round(emi);
    },
    []
  );

  const { emi, totalInterest, totalPayable } = useMemo(() => {
    const emi = calculateEMI(amount, rate, tenure);
    const totalPayable = emi * tenure;
    const totalInterest = totalPayable - amount;
    return { emi, totalInterest, totalPayable };
  }, [amount, rate, tenure, calculateEMI]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getSliderBackground = (value: number, min: number, max: number) => {
    const percentage = ((value - min) / (max - min)) * 100;
    return `linear-gradient(to right, #F37E20 0%, #F37E20 ${percentage}%, #E5E7EB ${percentage}%, #E5E7EB 100%)`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-navy to-brand-navy/90 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="bg-brand-orange/20 p-2 rounded-lg">
            <Calculator className="h-6 w-6 text-brand-orange" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{texts.title}</h3>
            <p className="text-sm text-white/70">
              {texts.subtitle}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Loan Amount Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-brand-navy">
              {texts.loanAmount}
            </label>
            <span className="text-lg font-bold text-brand-orange">
              {formatCurrency(amount)}
            </span>
          </div>
          <input
            type="range"
            min={minAmount}
            max={maxAmount}
            step={10000}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            style={{ background: getSliderBackground(amount, minAmount, maxAmount) }}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{formatCurrency(minAmount)}</span>
            <span>{formatCurrency(maxAmount)}</span>
          </div>
        </div>

        {/* Interest Rate Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-brand-navy">
              {texts.interestRate}
            </label>
            <span className="text-lg font-bold text-brand-orange">{rate}%</span>
          </div>
          <input
            type="range"
            min={7}
            max={24}
            step={0.25}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            style={{ background: getSliderBackground(rate, 7, 24) }}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>7%</span>
            <span>24%</span>
          </div>
        </div>

        {/* Tenure Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-brand-navy">
              {texts.tenure}
            </label>
            <span className="text-lg font-bold text-brand-orange">
              {tenure} {texts.months}
            </span>
          </div>
          <input
            type="range"
            min={minTenure}
            max={maxTenure}
            step={1}
            value={tenure}
            onChange={(e) => setTenure(Number(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            style={{ background: getSliderBackground(tenure, minTenure, maxTenure) }}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{minTenure} {texts.monthsShort}</span>
            <span>{maxTenure} {texts.monthsShort}</span>
          </div>
        </div>

        {/* Results */}
        <div className="bg-brand-orange-light rounded-xl p-5 mt-6">
          <div className="grid grid-cols-1 gap-4">
            {/* Monthly EMI - Highlighted */}
            <div className="bg-white rounded-lg p-4 text-center shadow-sm">
              <p className="text-sm text-gray-600 mb-1">{texts.monthlyEmi}</p>
              <p className="text-3xl font-bold text-brand-orange">
                {formatCurrency(emi)}
              </p>
            </div>

            {/* Other Details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                <p className="text-xs text-gray-500">{texts.totalInterest}</p>
                <p className="text-lg font-semibold text-brand-navy">
                  {formatCurrency(totalInterest)}
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                <p className="text-xs text-gray-500">{texts.totalPayable}</p>
                <p className="text-lg font-semibold text-brand-navy">
                  {formatCurrency(totalPayable)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
