"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Script from "next/script";
import { trackLeadConversion } from "./google-ads";
import { clearTrackingParams } from "@/lib/tracking";

// Pixel IDs from environment
const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

/**
 * Component to fire all conversion pixels on Thank You page
 * Only fires once per page load
 */
export function ThankYouConversions() {
  const hasFired = useRef(false);
  const searchParams = useSearchParams();
  
  useEffect(() => {
    if (hasFired.current) return;
    hasFired.current = true;
    
    // Get conversion value from URL if passed
    const value = searchParams.get("value");
    const loanType = searchParams.get("loan_type");
    const city = searchParams.get("city");
    
    const conversionValue = value ? parseFloat(value) : 0;
    
    console.log("[Conversion] Firing pixels:", { conversionValue, loanType, city });
    
    // 1. Google Ads Conversion
    trackLeadConversion(conversionValue, "INR");
    
    // 2. Facebook Pixel (if loaded)
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "Lead", {
        value: conversionValue,
        currency: "INR",
        content_name: loanType || "loan_application",
        content_category: "loan",
      });
      console.log("[Conversion] Facebook Lead event fired");
    }
    
    // 3. GA4 conversion event
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "conversion", {
        event_category: "lead",
        event_label: loanType || "loan_application",
        value: conversionValue,
      });
    }
    
    // 4. Clear tracking params after successful conversion
    // This ensures next visit is tracked as new session
    setTimeout(() => {
      clearTrackingParams();
    }, 1000);
    
  }, [searchParams]);
  
  return null;
}

/**
 * Facebook Pixel component
 */
export function FacebookPixel() {
  if (!FB_PIXEL_ID) return null;
  
  return (
    <>
      <Script id="facebook-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${FB_PIXEL_ID}');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}

/**
 * Track Facebook events
 */
export function trackFBEvent(
  event: string,
  params?: Record<string, unknown>
) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", event, params);
    console.log("[FB Pixel] Event:", event, params);
  }
}

/**
 * Track custom FB events
 */
export function trackFBCustomEvent(
  event: string,
  params?: Record<string, unknown>
) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("trackCustom", event, params);
  }
}

// Common FB events
export const fbEvents = {
  // Lead generation
  initiateCheckout: (value?: number, loanType?: string) => {
    trackFBEvent("InitiateCheckout", {
      value,
      currency: "INR",
      content_name: loanType,
    });
  },
  
  // OTP sent
  addToCart: (loanType?: string) => {
    trackFBEvent("AddToCart", {
      content_name: loanType,
      content_category: "loan_application",
    });
  },
  
  // Form interaction
  viewContent: (loanType?: string, city?: string) => {
    trackFBEvent("ViewContent", {
      content_name: loanType,
      content_category: "loan_page",
      content_ids: [loanType],
    });
  },
  
  // EMI calculator
  search: (loanAmount?: number) => {
    trackFBEvent("Search", {
      search_string: `loan_${loanAmount}`,
      content_category: "emi_calculator",
    });
  },
};

// Extend Window type for Facebook Pixel
declare global {
  interface Window {
    fbq: (
      command: string,
      event: string,
      params?: Record<string, unknown>
    ) => void;
  }
}
