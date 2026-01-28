"use client";

import { Phone } from "lucide-react";
import { trackPhoneCallConversion } from "./google-ads";
import { useTranslation } from "@/lib/i18n";

interface ClickToCallProps {
  phoneNumber: string;
  className?: string;
  variant?: "button" | "link" | "icon";
  children?: React.ReactNode;
}

/**
 * Click-to-call component with conversion tracking
 * Tracks phone call clicks as conversions for Google Ads
 */
export function ClickToCall({
  phoneNumber,
  className = "",
  variant = "button",
  children,
}: ClickToCallProps) {
  const { t } = useTranslation();

  const handleClick = () => {
    // Track the call conversion
    trackPhoneCallConversion(phoneNumber);
    
    // GA4 event
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "click", {
        event_category: "phone_call",
        event_label: phoneNumber,
        transport_type: "beacon",
      });
    }
  };

  // Format phone for display (add spaces)
  const displayPhone = phoneNumber.replace(/(\d{4})(\d{3})(\d{3})/, "$1-$2-$3");
  
  // Full tel link with country code
  const telLink = `tel:+91${phoneNumber}`;

  if (variant === "icon") {
    return (
      <a
        href={telLink}
        onClick={handleClick}
        className={`inline-flex items-center justify-center w-12 h-12 bg-brand-orange text-white rounded-full hover:bg-brand-orange/90 transition-colors ${className}`}
        aria-label={`${t('cta.callUs')}: ${displayPhone}`}
      >
        <Phone className="w-5 h-5" />
      </a>
    );
  }

  if (variant === "link") {
    return (
      <a
        href={telLink}
        onClick={handleClick}
        className={`inline-flex items-center gap-2 text-brand-orange hover:text-brand-orange/80 font-medium transition-colors ${className}`}
      >
        <Phone className="w-4 h-4" />
        {children || displayPhone}
      </a>
    );
  }

  // Default button variant
  return (
    <a
      href={telLink}
      onClick={handleClick}
      className={`inline-flex items-center justify-center gap-2 px-6 py-4 bg-brand-orange text-white font-semibold text-lg rounded-xl hover:bg-brand-orange/90 transition-colors ${className}`}
    >
      <Phone className="w-5 h-5" />
      {children || `${t('cta.callUs')}: ${displayPhone}`}
    </a>
  );
}

/**
 * Floating call button for mobile
 */
export function FloatingCallButton({
  phoneNumber,
  className = "",
}: {
  phoneNumber: string;
  className?: string;
}) {
  const handleClick = () => {
    trackPhoneCallConversion(phoneNumber);
  };

  return (
    <a
      href={`tel:+91${phoneNumber}`}
      onClick={handleClick}
      className={`fixed bottom-24 right-4 z-40 w-14 h-14 bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-green-700 transition-colors md:hidden ${className}`}
      aria-label="Call now"
    >
      <Phone className="w-6 h-6" />
      {/* Pulse animation */}
      <span className="absolute w-full h-full rounded-full bg-green-600 animate-ping opacity-25" />
    </a>
  );
}

/**
 * Header call CTA
 */
export function HeaderCallCTA({
  phoneNumber,
  className = "",
}: {
  phoneNumber: string;
  className?: string;
}) {
  const handleClick = () => {
    trackPhoneCallConversion(phoneNumber);
  };

  const displayPhone = phoneNumber.replace(/(\d{4})(\d{3})(\d{3})/, "$1-$2-$3");

  return (
    <a
      href={`tel:+91${phoneNumber}`}
      onClick={handleClick}
      className={`hidden md:flex items-center gap-2 px-4 py-2 bg-brand-navy/10 text-brand-navy font-medium rounded-lg hover:bg-brand-navy/20 transition-colors ${className}`}
    >
      <Phone className="w-4 h-4" />
      <span className="text-sm">{displayPhone}</span>
    </a>
  );
}
