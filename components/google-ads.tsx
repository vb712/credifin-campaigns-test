"use client";

import Script from "next/script";
import { useEffect } from "react";

// Google Ads Conversion IDs - Set these in .env
const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID; // e.g., "AW-XXXXXXXXXX"
const CONVERSION_LABEL_LEAD = process.env.NEXT_PUBLIC_CONVERSION_LABEL_LEAD; // e.g., "AbCdEfGhIjKlMnOp"
const CONVERSION_LABEL_PHONE = process.env.NEXT_PUBLIC_CONVERSION_LABEL_PHONE;
const CONVERSION_LABEL_OTP_VERIFIED = process.env.NEXT_PUBLIC_CONVERSION_LABEL_OTP;

export function GoogleAdsTag() {
  if (!GOOGLE_ADS_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-ads-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GOOGLE_ADS_ID}');
        `}
      </Script>
    </>
  );
}

// Track lead form submission conversion
export function trackLeadConversion(value?: number, currency: string = "INR") {
  if (typeof window === "undefined" || !window.gtag || !GOOGLE_ADS_ID) return;
  
  window.gtag("event", "conversion", {
    send_to: `${GOOGLE_ADS_ID}/${CONVERSION_LABEL_LEAD}`,
    value: value || 0,
    currency: currency,
  });
  
  // Also track in GA4
  window.gtag("event", "generate_lead", {
    currency: currency,
    value: value || 0,
  });
  
  console.log("[Ads] Lead conversion tracked:", { value, currency });
}

// Track OTP verified (micro-conversion)
export function trackOTPVerifiedConversion() {
  if (typeof window === "undefined" || !window.gtag || !GOOGLE_ADS_ID) return;
  
  if (CONVERSION_LABEL_OTP_VERIFIED) {
    window.gtag("event", "conversion", {
      send_to: `${GOOGLE_ADS_ID}/${CONVERSION_LABEL_OTP_VERIFIED}`,
    });
  }
  
  // GA4 event
  window.gtag("event", "otp_verified", {
    event_category: "engagement",
  });
  
  console.log("[Ads] OTP verified conversion tracked");
}

// Track phone call click (call conversion)
export function trackPhoneCallConversion(phoneNumber: string) {
  if (typeof window === "undefined" || !window.gtag || !GOOGLE_ADS_ID) return;
  
  if (CONVERSION_LABEL_PHONE) {
    window.gtag("event", "conversion", {
      send_to: `${GOOGLE_ADS_ID}/${CONVERSION_LABEL_PHONE}`,
    });
  }
  
  // GA4 event
  window.gtag("event", "click_to_call", {
    event_category: "engagement",
    event_label: phoneNumber,
  });
  
  console.log("[Ads] Phone call conversion tracked:", phoneNumber);
}

// Track form start (engagement signal)
export function trackFormStart(formName: string = "lead_form") {
  if (typeof window === "undefined" || !window.gtag) return;
  
  window.gtag("event", "form_start", {
    event_category: "engagement",
    event_label: formName,
  });
}

// Track EMI calculator usage (engagement signal)
export function trackEMICalculatorUse(loanAmount: number, tenure: number, emi: number) {
  if (typeof window === "undefined" || !window.gtag) return;
  
  window.gtag("event", "emi_calculated", {
    event_category: "engagement",
    loan_amount: loanAmount,
    tenure_months: tenure,
    calculated_emi: emi,
  });
}

// Track scroll depth for quality signals
export function trackScrollDepth(percentage: number) {
  if (typeof window === "undefined" || !window.gtag) return;
  
  window.gtag("event", "scroll", {
    event_category: "engagement",
    percent_scrolled: percentage,
  });
}

// Track time on page
export function trackTimeOnPage(seconds: number) {
  if (typeof window === "undefined" || !window.gtag) return;
  
  window.gtag("event", "timing_complete", {
    event_category: "engagement",
    name: "time_on_page",
    value: seconds,
  });
}

// Enhanced conversion data (for offline conversion import)
export function setEnhancedConversionData(data: {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  postalCode?: string;
}) {
  if (typeof window === "undefined" || !window.gtag) return;
  
  // Format phone for enhanced conversions (E.164)
  const formattedPhone = data.phone ? `+91${data.phone}` : undefined;
  
  window.gtag("set", "user_data", {
    email: data.email,
    phone_number: formattedPhone,
    address: {
      first_name: data.firstName,
      last_name: data.lastName,
      city: data.city,
      postal_code: data.postalCode,
      country: "IN",
    },
  });
}

// Extend Window type
declare global {
  interface Window {
    gtag: (
      command: string,
      targetId: string,
      config?: Record<string, unknown>
    ) => void;
    dataLayer: unknown[];
  }
}
