"use client";

import { CheckCircle, Calculator, FileText, ArrowRight } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface ProcessStep {
  icon: React.ReactNode;
  titleKey: string;
  descKey: string;
}

const defaultStepKeys: ProcessStep[] = [
  {
    icon: <CheckCircle className="h-6 w-6" />,
    titleKey: "checkEligibility",
    descKey: "step1Desc",
  },
  {
    icon: <Calculator className="h-6 w-6" />,
    titleKey: "calculateEmi",
    descKey: "step2Desc",
  },
  {
    icon: <FileText className="h-6 w-6" />,
    titleKey: "applyOnline",
    descKey: "step3Desc",
  },
];

interface ProcessTimelineProps {
  className?: string;
}

export function ProcessTimeline({
  className = "",
}: ProcessTimelineProps) {
  const { locale } = useTranslation();

  // Define translations inline for simplicity
  const translations = {
    en: {
      title: "How It Works",
      checkEligibility: "Check Eligibility",
      step1Desc: "Quick 2-min form",
      calculateEmi: "Calculate EMI",
      step2Desc: "Know your monthly payment",
      applyOnline: "Apply Online",
      step3Desc: "Minimal documents",
    },
    hi: {
      title: "यह कैसे काम करता है",
      checkEligibility: "पात्रता जांचें",
      step1Desc: "2 मिनट का फॉर्म",
      calculateEmi: "EMI कैलकुलेट करें",
      step2Desc: "मासिक भुगतान जानें",
      applyOnline: "ऑनलाइन आवेदन करें",
      step3Desc: "कम दस्तावेज़",
    },
  };

  const t = translations[locale];

  const steps = defaultStepKeys.map(step => ({
    icon: step.icon,
    title: t[step.titleKey as keyof typeof t] || step.titleKey,
    description: t[step.descKey as keyof typeof t] || step.descKey,
  }));

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-6 ${className}`}>
      <h3 className="text-xl font-bold text-brand-navy text-center mb-8">
        {t.title}
      </h3>

      {/* Desktop: Horizontal Timeline */}
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center flex-1">
            <div className="flex flex-col items-center text-center flex-1">
              {/* Step Number & Icon */}
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-brand-orange-light flex items-center justify-center text-brand-orange mb-3">
                  {step.icon}
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-brand-orange text-white text-xs font-bold flex items-center justify-center">
                  {index + 1}
                </div>
              </div>
              <h4 className="font-semibold text-brand-navy mb-1">{step.title}</h4>
              <p className="text-sm text-gray-500">{step.description}</p>
            </div>

            {/* Arrow between steps */}
            {index < steps.length - 1 && (
              <div className="flex-shrink-0 mx-4">
                <ArrowRight className="h-6 w-6 text-brand-orange" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile: Vertical Timeline */}
      <div className="md:hidden space-y-6">
        {steps.map((step, index) => (
          <div key={index} className="flex items-start gap-4">
            {/* Step number and connector line */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-brand-orange-light flex items-center justify-center text-brand-orange">
                  {step.icon}
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-orange text-white text-[10px] font-bold flex items-center justify-center">
                  {index + 1}
                </div>
              </div>
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="w-0.5 h-8 bg-brand-orange/30 mt-2" />
              )}
            </div>

            {/* Content */}
            <div className="pt-2">
              <h4 className="font-semibold text-brand-navy">{step.title}</h4>
              <p className="text-sm text-gray-500">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
