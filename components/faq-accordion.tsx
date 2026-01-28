"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  faqsEn: FAQItem[];
  faqsHi: FAQItem[];
  className?: string;
}

export function FAQAccordion({ faqsEn, faqsHi, className = "" }: FAQAccordionProps) {
  const { t, locale } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  // Select FAQs based on locale
  const faqs = locale === 'hi' ? faqsHi : faqsEn;

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-navy to-brand-navy/90 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="bg-brand-orange/20 p-2 rounded-lg">
            <HelpCircle className="h-6 w-6 text-brand-orange" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              {t('faq.title')}
            </h3>
            <p className="text-sm text-white/70">
              {t('faq.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Items */}
      <div className="divide-y divide-gray-100">
        {faqs.map((faq, index) => (
          <div key={index} className="group">
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              aria-expanded={openIndex === index}
            >
              <span className="font-medium text-brand-navy pr-4">
                {faq.question}
              </span>
              <ChevronDown
                className={`h-5 w-5 text-brand-orange flex-shrink-0 transition-transform duration-200 ${
                  openIndex === index ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Answer */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                openIndex === index ? "max-h-96" : "max-h-0"
              }`}
            >
              <div className="px-6 pb-4 text-gray-600 leading-relaxed">
                {faq.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
