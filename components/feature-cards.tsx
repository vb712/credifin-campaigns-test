"use client";

import { Star } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface FeatureCardsProps {
  features: string[];
  featuresHi?: string[];
  className?: string;
}

export function FeatureCards({ features, featuresHi, className = "" }: FeatureCardsProps) {
  const { locale } = useTranslation();
  
  // Select features based on locale
  const displayFeatures = locale === 'hi' && featuresHi ? featuresHi : features;

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-6 ${className}`}>
      <h3 className="text-xl font-bold text-brand-navy mb-6 flex items-center gap-2">
        <Star className="h-5 w-5 text-brand-orange" />
        {locale === 'hi' ? 'मुख्य विशेषताएं' : 'Key Features'}
      </h3>
      <div className="grid sm:grid-cols-2 gap-4">
        {displayFeatures.map((feature, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-3 bg-brand-orange-light rounded-xl"
          >
            <div className="w-8 h-8 rounded-full bg-brand-orange/20 flex items-center justify-center flex-shrink-0">
              <span className="text-brand-orange font-bold text-sm">
                {index + 1}
              </span>
            </div>
            <span className="text-gray-700 text-sm font-medium">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
