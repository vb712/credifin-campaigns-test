"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface StickyCTAProps {
  textEn?: string;
  textHi?: string;
}

export function StickyCTA({ textEn, textHi }: StickyCTAProps) {
  const { t, locale } = useTranslation();
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  const visibleTargets = useRef(new Set<string>());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleTargets.current.add(entry.target.id);
          } else {
            visibleTargets.current.delete(entry.target.id);
          }
        });

        // Hide sticky button if ANY of the tracked elements are visible
        // (Hero at top OR Form at bottom)
        setIsVisible(visibleTargets.current.size === 0);
      },
      {
        root: null,
        threshold: 0,
        rootMargin: "0px"
      }
    );

    const formButton = document.getElementById("lead-form-submit");
    const heroSection = document.getElementById("product-hero");

    if (formButton) observer.observe(formButton);
    if (heroSection) observer.observe(heroSection);

    return () => observer.disconnect();
  }, [pathname]);

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

  if (!isVisible) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 animate-in slide-in-from-bottom-full duration-300">
      <button
        onClick={handleClick}
        className="w-full py-4 bg-brand-orange text-white font-semibold rounded-xl hover:bg-brand-orange/90 transition-colors flex items-center justify-center gap-2 text-lg shadow-lg active:scale-[0.98]"
      >
        {buttonText}
        <ArrowRight className="h-5 w-5" />
      </button>
    </div>
  );
}
