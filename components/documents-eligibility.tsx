"use client";

import { CheckCircle, FileText, Shield } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface DocumentsEligibilityProps {
  eligibility: string[];
  documents: string[];
  eligibilityHi?: string[];
  documentsHi?: string[];
  className?: string;
}

export function DocumentsEligibility({
  eligibility,
  documents,
  eligibilityHi,
  documentsHi,
  className = "",
}: DocumentsEligibilityProps) {
  const { t, locale } = useTranslation();
  
  // Select content based on locale
  const displayEligibility = locale === 'hi' && eligibilityHi ? eligibilityHi : eligibility;
  const displayDocuments = locale === 'hi' && documentsHi ? documentsHi : documents;

  return (
    <div className={`grid md:grid-cols-2 gap-6 ${className}`}>
      {/* Eligibility Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-green-500 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {t('eligibility.title')}
              </h3>
              <p className="text-sm text-white/80">
                {t('eligibility.subtitle')}
              </p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <ul className="space-y-3">
            {displayEligibility.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Documents Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-brand-orange to-brand-orange/90 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {t('documents.title')}
              </h3>
              <p className="text-sm text-white/80">
                {t('documents.subtitle')}
              </p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <ul className="space-y-3">
            {displayDocuments.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-brand-orange flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
