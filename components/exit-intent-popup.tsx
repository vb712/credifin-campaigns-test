"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Gift, ArrowRight } from "lucide-react";
import { trackFormStart } from "./google-ads";
import { fbEvents } from "./thank-you-conversions";
import { useTranslation } from "@/lib/i18n";

interface ExitIntentPopupProps {
  productSlug?: string;
  city?: string;
  headline?: string;
  subheadline?: string;
  ctaText?: string;
  onCtaClick?: () => void;
}

/**
 * Exit intent popup to capture abandoning visitors
 * Shows when user moves mouse towards browser chrome (desktop)
 * Or after inactivity timeout (mobile)
 */
export function ExitIntentPopup({
  productSlug,
  city,
  headline,
  subheadline,
  ctaText,
  onCtaClick,
}: ExitIntentPopupProps) {
  const { t } = useTranslation();
  const displayHeadline = headline || `${t('exitIntent.wait')} ${t('exitIntent.dontMiss')}`;
  const displaySubheadline = subheadline || t('thankYou.message');
  const displayCtaText = ctaText || t('cta.getCallback');
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Desktop exit intent detection
  const handleMouseLeave = useCallback(
    (e: MouseEvent) => {
      if (hasShown) return;
      
      // Only trigger when mouse moves to top of viewport (browser chrome)
      if (e.clientY <= 5) {
        setIsVisible(true);
        setHasShown(true);
        
        // Track popup shown
        if (typeof window !== "undefined" && window.gtag) {
          window.gtag("event", "exit_intent_shown", {
            event_category: "engagement",
            product: productSlug,
            city: city,
          });
        }
      }
    },
    [hasShown, productSlug, city]
  );

  // Mobile: Show after scroll up or back button
  useEffect(() => {
    // Check if already shown this session
    const alreadyShown = sessionStorage.getItem("exit_popup_shown");
    if (alreadyShown) {
      setHasShown(true);
      return;
    }

    // Desktop: Mouse leave detection
    document.addEventListener("mouseleave", handleMouseLeave);

    // Mobile: Show after 45 seconds of engagement
    const mobileTimer = setTimeout(() => {
      if (!hasShown && window.innerWidth < 768) {
        setIsVisible(true);
        setHasShown(true);
        sessionStorage.setItem("exit_popup_shown", "true");
      }
    }, 45000);

    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      clearTimeout(mobileTimer);
    };
  }, [handleMouseLeave, hasShown]);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem("exit_popup_shown", "true");
    
    // Track popup closed
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "exit_intent_closed", {
        event_category: "engagement",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Track form submission attempt
      trackFormStart("exit_intent_form");
      fbEvents.initiateCheckout(0, productSlug);

      // Quick callback request (simplified lead)
      const response = await fetch("/api/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          productSlug,
          city,
          source: "exit_intent",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit");
      }

      setIsSubmitted(true);
      
      // Track successful submission
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "exit_intent_converted", {
          event_category: "conversion",
          product: productSlug,
        });
      }

      // Close after delay
      setTimeout(() => {
        setIsVisible(false);
      }, 3000);
      
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-slideUp">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-2 text-gray-400 hover:text-gray-600 transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with gradient */}
        <div className="bg-linear-to-r from-brand-orange to-orange-500 px-6 py-8 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">{displayHeadline}</h2>
          <p className="text-white/90 text-sm">{displaySubheadline}</p>
        </div>

        {/* Form */}
        <div className="p-6">
          {isSubmitted ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('common.success')}</h3>
              <p className="text-gray-600 text-sm">{t('thankYou.step1')}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('form.phoneNumber')}
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-lg text-gray-500 text-sm">
                    +91
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder={t('form.phoneNumberPlaceholder')}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-r-lg focus:border-brand-orange focus:outline-none text-base"
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || phone.length !== 10}
                className="w-full py-4 bg-brand-orange text-white font-semibold text-lg rounded-xl hover:bg-brand-orange/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {t('common.processing')}
                  </span>
                ) : (
                  <>
                    {displayCtaText}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <p className="text-center text-xs text-gray-500 mt-4">
                🔒 Your number is 100% safe with us
              </p>
            </form>
          )}
        </div>

        {/* Trust badges */}
        <div className="border-t border-gray-100 px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
            <span>✓ {t('trust.noSpam')}</span>
            <span>✓ {t('trust.freeService')}</span>
            <span>✓ {t('trust.happyCustomers')}</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
