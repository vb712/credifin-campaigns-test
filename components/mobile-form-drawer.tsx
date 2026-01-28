"use client";

import { useState, useEffect, useRef } from "react";
import { X, ArrowRight, ChevronUp } from "lucide-react";
import { LeadForm } from "./lead-form";
import { useTranslation } from "@/lib/i18n";
import { LanguageToggle } from "./language-toggle";

interface MobileFormDrawerProps {
  productSlug?: string;
  city?: string;
  ctaText?: string;
  triggerScrollPercent?: number; // Auto-show after scrolling this % of viewport
}

export function MobileFormDrawer({
  productSlug,
  city,
  ctaText,
  triggerScrollPercent = 30, // Show after 30% scroll by default
}: MobileFormDrawerProps) {
  const { t } = useTranslation();
  const buttonText = ctaText || `${t('cta.applyNow')} - ${t('common.free')}`;
  const [isOpen, setIsOpen] = useState(false);
  const [showPulse, setShowPulse] = useState(true);
  const [hasAutoShown, setHasAutoShown] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Handle scroll to auto-show drawer hint
  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      
      // After scrolling past trigger point, add extra emphasis
      if (scrollPercent > triggerScrollPercent && !hasAutoShown) {
        setHasAutoShown(true);
        // Pulse effect to draw attention
        setShowPulse(true);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [triggerScrollPercent, hasAutoShown]);

  // Close drawer on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden"; // Prevent background scroll
    }
    
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setShowPulse(false);
  };

  return (
    <>
      {/* Sticky CTA Bar - Only visible on mobile when drawer is closed */}
      <div 
        className={`md:hidden fixed bottom-0 left-0 right-0 z-40 transition-transform duration-300 ${
          isOpen ? "translate-y-full" : "translate-y-0"
        }`}
      >
        {/* Gradient fade effect above the bar */}
        <div className="h-6 bg-gradient-to-t from-white to-transparent" />
        
        <div className="bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] px-4 py-3 safe-area-bottom">
          <button
            onClick={handleOpen}
            className={`w-full py-4 bg-brand-orange text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-lg shadow-lg relative overflow-hidden ${
              showPulse ? "animate-pulse-subtle" : ""
            }`}
          >
            {/* Shimmer effect */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" />
            
            <span className="relative flex items-center gap-2">
              {buttonText}
              <ChevronUp className="h-5 w-5" />
            </span>
          </button>
          
          {/* Quick trust indicators */}
          <div className="flex items-center justify-center gap-4 mt-2 text-xs text-gray-500">
            <span>✓ {t('trust.noSpam')}</span>
            <span>✓ {t('trust.quickProcess')}</span>
            <span>✓ {t('common.instant')}</span>
          </div>
        </div>
      </div>

      {/* Backdrop overlay */}
      <div
        className={`md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`md:hidden fixed inset-x-0 bottom-0 z-50 transition-transform duration-300 ease-out ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Application form"
      >
        <div className="bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Drawer handle */}
          <div className="flex-shrink-0 pt-3 pb-2">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto" />
          </div>

          {/* Header with close button and language toggle */}
          <div className="flex-shrink-0 flex items-center justify-between px-4 pb-2 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-semibold text-brand-navy">
                {t('common.checkEligibility')}
              </h2>
              <p className="text-sm text-gray-500">{t('trust.quickProcessDesc')}</p>
            </div>
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <button
                onClick={() => setIsOpen(false)}
                className="p-3 hover:bg-gray-100 rounded-full transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center"
                aria-label={t('common.close')}
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Scrollable form content */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
            <LeadForm
              productSlug={productSlug}
              city={city}
              variant="compact"
              className="shadow-none border-0"
            />
          </div>
        </div>
      </div>

      {/* Add styles for animations */}
      <style jsx global>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        
        @keyframes pulse-subtle {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 4px 20px rgba(243, 126, 32, 0.3);
          }
          50% {
            transform: scale(1.02);
            box-shadow: 0 6px 30px rgba(243, 126, 32, 0.5);
          }
        }
        
        .animate-pulse-subtle {
          animation: pulse-subtle 2s ease-in-out infinite;
        }
        
        /* Safe area for notched devices */
        .safe-area-bottom {
          padding-bottom: max(12px, env(safe-area-inset-bottom));
        }
      `}</style>
    </>
  );
}
