"use client";

import { ArrowRight } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface StickyCTAProps {
  textEn?: string;
  textHi?: string;
}

export function StickyCTA({ textEn, textHi }: StickyCTAProps) {
  const { t, locale } = useTranslation();
  
  // Select text based on locale
  const buttonText = locale === 'hi' 
    ? (textHi || t('common.applyForLoan'))
    : (textEn || t('common.applyForLoan'));

  const handleClick = () => {
    // Scroll to lead form
    const form = document.getElementById("lead-form");
    if (form) {
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="md:hidden sticky-cta">
      <button
        onClick={handleClick}
        className="w-full py-4 bg-brand-orange text-white font-semibold rounded-xl hover:bg-brand-orange/90 transition-colors flex items-center justify-center gap-2 text-lg shadow-lg"
      >
        {buttonText}
        <ArrowRight className="h-5 w-5" />
      </button>
    </div>
  );
}
