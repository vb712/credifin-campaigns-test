"use client";

import Script from "next/script";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID;

export function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}

// Track custom events
export function trackEvent(
  action: string,
  category: string,
  label?: string,
  value?: number
) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
}

// Track lead form submission
export function trackLeadSubmission(loanType: string, city?: string) {
  trackEvent("lead_submit", "Lead Generation", `${loanType}${city ? ` - ${city}` : ""}`);
}

// Track OTP events
export function trackOTPSent(phone: string) {
  trackEvent("otp_sent", "Authentication", phone.slice(0, 4) + "****");
}

export function trackOTPVerified() {
  trackEvent("otp_verified", "Authentication");
}

// Track EMI calculator usage
export function trackEMICalculation(loanAmount: number, tenure: number) {
  trackEvent("emi_calculated", "Engagement", `${loanAmount}-${tenure}mo`);
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
