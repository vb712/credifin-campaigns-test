"use client";

import { useEffect, useState, useCallback } from "react";

// UTM and tracking parameters we capture
export interface TrackingParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;        // Google Click ID
  fbclid?: string;       // Facebook Click ID
  msclkid?: string;      // Microsoft Click ID
  referrer?: string;     // Original referrer
  landing_page?: string; // First page visited
  session_id?: string;   // Unique session identifier
}

const STORAGE_KEY = "credifin_tracking";
const SESSION_KEY = "credifin_session";

// Generate unique session ID
function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Get tracking params from URL
function getParamsFromURL(): Partial<TrackingParams> {
  if (typeof window === "undefined") return {};
  
  const params = new URLSearchParams(window.location.search);
  const tracking: Partial<TrackingParams> = {};
  
  // UTM parameters
  const utmParams = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
  utmParams.forEach((param) => {
    const value = params.get(param);
    if (value) {
      tracking[param as keyof TrackingParams] = value;
    }
  });
  
  // Click IDs
  const clickIds = ["gclid", "fbclid", "msclkid"];
  clickIds.forEach((param) => {
    const value = params.get(param);
    if (value) {
      tracking[param as keyof TrackingParams] = value;
    }
  });
  
  return tracking;
}

// Get stored tracking params
function getStoredParams(): TrackingParams | null {
  if (typeof window === "undefined") return null;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

// Store tracking params
function storeParams(params: TrackingParams): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(params));
  } catch {
    // localStorage might be full or disabled
    console.warn("[Tracking] Failed to store params");
  }
}

// Get or create session ID
function getSessionId(): string {
  if (typeof window === "undefined") return "";
  
  try {
    let sessionId = sessionStorage.getItem(SESSION_KEY);
    if (!sessionId) {
      sessionId = generateSessionId();
      sessionStorage.setItem(SESSION_KEY, sessionId);
    }
    return sessionId;
  } catch {
    return generateSessionId();
  }
}

/**
 * Hook to capture and persist UTM/GCLID parameters
 * Uses "first touch" attribution - keeps original source
 */
export function useTracking(): TrackingParams {
  const [params, setParams] = useState<TrackingParams>({});
  
  useEffect(() => {
    // Get existing stored params (first touch)
    const storedParams = getStoredParams();
    
    // Get current URL params
    const urlParams = getParamsFromURL();
    
    // Get session ID
    const sessionId = getSessionId();
    
    // Merge: URL params override stored, but keep first-touch for attribution
    const merged: TrackingParams = {
      // Keep original attribution source (first touch)
      utm_source: storedParams?.utm_source || urlParams.utm_source,
      utm_medium: storedParams?.utm_medium || urlParams.utm_medium,
      utm_campaign: storedParams?.utm_campaign || urlParams.utm_campaign,
      utm_term: storedParams?.utm_term || urlParams.utm_term,
      utm_content: storedParams?.utm_content || urlParams.utm_content,
      // Always update click IDs (last touch for conversion attribution)
      gclid: urlParams.gclid || storedParams?.gclid,
      fbclid: urlParams.fbclid || storedParams?.fbclid,
      msclkid: urlParams.msclkid || storedParams?.msclkid,
      // Session data
      session_id: sessionId,
      landing_page: storedParams?.landing_page || window.location.pathname,
      referrer: storedParams?.referrer || document.referrer || undefined,
    };
    
    // Store merged params
    storeParams(merged);
    setParams(merged);
    
    // Log for debugging
    if (Object.keys(urlParams).length > 0) {
      console.log("[Tracking] Captured URL params:", urlParams);
    }
  }, []);
  
  return params;
}

/**
 * Get tracking params for API submission
 * Call this when submitting lead form
 */
export function getTrackingParams(): TrackingParams {
  return getStoredParams() || {};
}

/**
 * Clear tracking params (call after successful conversion)
 */
export function clearTrackingParams(): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore errors
  }
}

/**
 * Hook to track engagement signals for lead scoring
 */
export function useEngagementTracking() {
  const [engagement, setEngagement] = useState({
    timeOnPage: 0,
    scrollDepth: 0,
    emiCalculatorUsed: false,
    formInteracted: false,
    faqsViewed: 0,
  });
  
  useEffect(() => {
    const startTime = Date.now();
    let maxScrollDepth = 0;
    
    // Track time on page
    const timeInterval = setInterval(() => {
      setEngagement((prev) => ({
        ...prev,
        timeOnPage: Math.floor((Date.now() - startTime) / 1000),
      }));
    }, 5000);
    
    // Track scroll depth
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);
      
      if (scrollPercent > maxScrollDepth) {
        maxScrollDepth = scrollPercent;
        setEngagement((prev) => ({
          ...prev,
          scrollDepth: maxScrollDepth,
        }));
      }
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    return () => {
      clearInterval(timeInterval);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  
  const trackEMICalculator = useCallback(() => {
    setEngagement((prev) => ({ ...prev, emiCalculatorUsed: true }));
  }, []);
  
  const trackFormInteraction = useCallback(() => {
    setEngagement((prev) => ({ ...prev, formInteracted: true }));
  }, []);
  
  const trackFAQView = useCallback(() => {
    setEngagement((prev) => ({ ...prev, faqsViewed: prev.faqsViewed + 1 }));
  }, []);
  
  return {
    engagement,
    trackEMICalculator,
    trackFormInteraction,
    trackFAQView,
  };
}

/**
 * Calculate lead score based on engagement (0-100)
 */
export function calculateLeadScore(engagement: {
  timeOnPage: number;
  scrollDepth: number;
  emiCalculatorUsed: boolean;
  formInteracted: boolean;
  faqsViewed: number;
}): number {
  let score = 0;
  
  // Time on page (max 25 points)
  if (engagement.timeOnPage >= 120) score += 25;
  else if (engagement.timeOnPage >= 60) score += 15;
  else if (engagement.timeOnPage >= 30) score += 10;
  
  // Scroll depth (max 20 points)
  if (engagement.scrollDepth >= 75) score += 20;
  else if (engagement.scrollDepth >= 50) score += 12;
  else if (engagement.scrollDepth >= 25) score += 5;
  
  // EMI calculator used (25 points - strong intent)
  if (engagement.emiCalculatorUsed) score += 25;
  
  // Form interaction (20 points)
  if (engagement.formInteracted) score += 20;
  
  // FAQs viewed (max 10 points)
  score += Math.min(engagement.faqsViewed * 3, 10);
  
  return Math.min(score, 100);
}

/**
 * Get lead quality tier based on score
 */
export function getLeadTier(score: number): "hot" | "warm" | "cold" {
  if (score >= 70) return "hot";
  if (score >= 40) return "warm";
  return "cold";
}
