"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Phone,
  MapPin,
  Briefcase,
  CheckCircle,
  Loader2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { loanTypeDisplayNames, type LoanType } from "@/lib/validations";
import { useTracking, getTrackingParams, useEngagementTracking, calculateLeadScore, getLeadTier } from "@/lib/tracking";
import { trackLeadConversion, trackOTPVerifiedConversion, trackFormStart, setEnhancedConversionData } from "./google-ads";
import { fbEvents } from "./thank-you-conversions";
import { useTranslation } from "@/lib/i18n";

interface LeadFormProps {
  productSlug?: string;
  city?: string;
  className?: string;
  variant?: "default" | "compact" | "sticky";
}

type FormStep = "details" | "otp" | "success";

export function LeadForm({
  productSlug,
  city,
  className = "",
  variant = "default",
}: LeadFormProps) {
  const [step, setStep] = useState<FormStep>("details");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pincode, setPincode] = useState("");
  const [loanType, setLoanType] = useState<LoanType | "">(
    (productSlug as LoanType) || ""
  );
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpData, setOtpData] = useState<{
    signature: string;
    timestamp: number;
  } | null>(null);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [formStarted, setFormStarted] = useState(false);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  // Translation hook
  const { t } = useTranslation();

  // Tracking hooks
  const trackingParams = useTracking();
  const { engagement, trackFormInteraction } = useEngagementTracking();

  // Track form start on first interaction
  const handleFormInteraction = () => {
    if (!formStarted) {
      setFormStarted(true);
      trackFormStart("lead_form");
      trackFormInteraction();
      fbEvents.viewContent(loanType || productSlug, city);
    }
  };

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Phone validation check
  const isPhoneValid = /^[6-9]\d{9}$/.test(phone);

  // Handle OTP input
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Send OTP
  const handleSendOtp = async () => {
    if (!isPhoneValid) {
      setError(t('form.errors.phoneInvalid'));
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send OTP");
      }

      setOtpData({ signature: data.signature, timestamp: data.timestamp });
      setStep("otp");
      setCountdown(60);

      // Track OTP sent (micro-conversion)
      fbEvents.addToCart(loanType || productSlug);

      // In development, log the OTP for testing
      if (data.otp) {
        console.log("Development OTP:", data.otp);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError(t('form.errors.otpInvalid'));
      return;
    }

    if (!otpData) {
      setError(t('form.resendOtp'));
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          otp: otpString,
          signature: otpData.signature,
          timestamp: otpData.timestamp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Invalid OTP");
      }

      setPhoneVerified(true);
      setOtpData({
        signature: data.verificationToken,
        timestamp: data.timestamp,
      });
      setStep("details");

      // Track OTP verified (micro-conversion)
      trackOTPVerifiedConversion();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify OTP");
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Lead
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneVerified) {
      setError(t('form.errors.phoneRequired'));
      return;
    }

    if (!name || !phone || !pincode || !loanType) {
      setError(t('common.required'));
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Get tracking params for attribution
      const tracking = getTrackingParams();

      // Calculate lead score
      const leadScore = calculateLeadScore(engagement);
      const leadTier = getLeadTier(leadScore);

      // Set enhanced conversion data for Google Ads
      setEnhancedConversionData({
        phone,
        firstName: name.split(" ")[0],
        lastName: name.split(" ").slice(1).join(" "),
        postalCode: pincode,
        city: city,
      });

      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          pincode,
          loanType,
          city,
          productSlug,
          otpSignature: otpData?.signature,
          otpTimestamp: otpData?.timestamp,
          // Tracking data
          utmSource: tracking.utm_source,
          utmMedium: tracking.utm_medium,
          utmCampaign: tracking.utm_campaign,
          utmTerm: tracking.utm_term,
          utmContent: tracking.utm_content,
          gclid: tracking.gclid,
          fbclid: tracking.fbclid,
          referrer: tracking.referrer,
          landingPage: tracking.landing_page,
          sessionId: tracking.session_id,
          // Engagement data
          leadScore,
          leadTier,
          timeOnPage: engagement.timeOnPage,
          scrollDepth: engagement.scrollDepth,
          emiCalculatorUsed: engagement.emiCalculatorUsed,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit application");
      }

      // Track successful conversion
      trackLeadConversion(0, "INR");

      // Redirect to thank you page with tracking params
      const thankYouParams = new URLSearchParams({
        loan_type: loanType,
        city: city || "",
        lead_id: data.leadId || "",
      });

      router.push(`/thank-you?${thankYouParams.toString()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setIsLoading(false);
    }
  };

  // OTP verification step
  if (step === "otp") {
    return (
      <div
        className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden ${className}`}
      >
        <div className="bg-gradient-to-r from-brand-navy to-brand-navy/90 px-4 lg:px-6 py-3 lg:py-4">
          <h3 className="text-base lg:text-lg font-semibold text-white">{t('form.verifyOtp')}</h3>
          <p className="text-xs lg:text-sm text-white/70">
            {t('form.otpSent')} {phone}
          </p>
        </div>

        <div className="p-4 lg:p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* OTP Input */}
          <div className="flex justify-center gap-2 lg:gap-3 mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  otpInputRefs.current[index] = el;
                }}
                type="tel"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                className="w-11 h-14 lg:w-12 lg:h-14 text-center text-xl lg:text-2xl font-bold border-2 border-gray-200 rounded-lg focus:border-brand-orange focus:outline-none transition-colors"
                disabled={isLoading}
              />
            ))}
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerifyOtp}
            disabled={isLoading || otp.join("").length !== 6}
            className="w-full py-4 bg-brand-orange text-white font-semibold rounded-xl hover:bg-brand-orange/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 min-h-[56px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                {t('common.processing')}
              </>
            ) : (
              <>
                {t('form.verifyOtp')}
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>

          {/* Resend OTP */}
          <div className="mt-4 text-center">
            {countdown > 0 ? (
              <p className="text-sm text-gray-500">
                {t('form.resendOtp')} {countdown}s
              </p>
            ) : (
              <button
                onClick={handleSendOtp}
                disabled={isLoading}
                className="text-sm text-brand-orange hover:underline disabled:opacity-50 py-2"
              >
                {t('form.resendOtp')}
              </button>
            )}
          </div>

          {/* Change Number */}
          <button
            onClick={() => {
              setStep("details");
              setOtp(["", "", "", "", "", ""]);
              setError("");
            }}
            className="w-full mt-3 text-sm text-gray-500 hover:text-brand-navy py-2"
          >
            ← {t('common.back')}
          </button>
        </div>
      </div>
    );
  }

  // Main form
  const isCompact = variant === "compact";

  return (
    <div
      className={`bg-white rounded-2xl overflow-hidden ${isCompact ? '' : 'shadow-lg border border-gray-100'} ${className}`}
    >
      {/* Header - Hidden in compact mode */}
      {!isCompact && (
        <div className="bg-gradient-to-r from-brand-orange to-brand-orange/90 px-4 lg:px-6 py-3 lg:py-4">
          <h3 className="text-base lg:text-lg font-semibold text-white">
            {t('form.applyForLoan')}
          </h3>
          <p className="text-xs lg:text-sm text-white/80">
            {t('common.instant')} {t('hero.quickApproval').toLowerCase()}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className={`${isCompact ? 'space-y-3' : 'p-4 lg:p-6 space-y-3 lg:space-y-4'}`} onFocus={handleFormInteraction}>
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Name Input */}
        <div>
          <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">
            {t('form.fullName')} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 lg:h-5 lg:w-5 text-gray-400" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('form.fullNamePlaceholder')}
              className="w-full pl-9 lg:pl-10 pr-4 py-3 lg:py-3 border border-gray-200 rounded-xl focus:border-brand-orange focus:outline-none transition-colors text-base lg:text-base min-h-[48px]"
              required
            />
          </div>
        </div>

        {/* Phone Input */}
        <div>
          <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">
            {t('form.phoneNumber')} <span className="text-red-500">*</span>
          </label>
          {/* Changed from relative block to flex for cleaner layout */}
          <div className="flex gap-2">
            <div className="relative flex-1 min-w-0">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 lg:h-5 lg:w-5 text-gray-400" />
              <input
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setPhone(value);
                  if (phoneVerified) setPhoneVerified(false);
                }}
                placeholder={t('form.phoneNumberPlaceholder')}
                className="w-full pl-9 lg:pl-10 pr-4 py-3 lg:py-3 border border-gray-200 rounded-xl focus:border-brand-orange focus:outline-none transition-colors text-base lg:text-base min-h-[48px]"
                required
                disabled={phoneVerified}
              />
            </div>
            {/* Verify / Verified Button - Now adjacent to input */}
            <div className="shrink-0">
              {phoneVerified ? (
                <div className="flex items-center justify-center h-full px-3 bg-green-50 border border-green-200 rounded-xl">
                  <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                    <CheckCircle className="h-5 w-5" />
                    <span className="hidden sm:inline">{t('common.verified')}</span>
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={!isPhoneValid || isLoading}
                  className="h-full px-4 bg-brand-navy text-white text-sm font-medium rounded-xl hover:bg-brand-navy/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[48px] whitespace-nowrap"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    t('form.sendOtp')
                  )}
                </button>
              )}
            </div>
          </div>
          {/* Phone validation indicator */}
          {phone.length > 0 && phone.length < 10 && (
            <p className="mt-1 text-xs text-gray-500">
              {10 - phone.length} digits remaining
            </p>
          )}
          {phone.length === 10 && !isPhoneValid && (
            <p className="mt-1 text-xs text-red-500">
              {t('form.errors.phoneInvalid')}
            </p>
          )}
        </div>

        {/* Pincode Input */}
        <div>
          <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">
            {t('form.pincode')} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 lg:h-5 lg:w-5 text-gray-400" />
            <input
              type="tel"
              inputMode="numeric"
              value={pincode}
              onChange={(e) =>
                setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder={t('form.pincodePlaceholder')}
              className="w-full pl-9 lg:pl-10 pr-4 py-3 lg:py-3 border border-gray-200 rounded-xl focus:border-brand-orange focus:outline-none transition-colors text-base lg:text-base min-h-[48px]"
              required
            />
          </div>
        </div>

        {/* Loan Type Select */}
        <div>
          <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">
            {t('form.loanType')} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 lg:h-5 lg:w-5 text-gray-400" />
            <select
              value={loanType}
              onChange={(e) => setLoanType(e.target.value as LoanType)}
              className="w-full pl-9 lg:pl-10 pr-4 py-3 lg:py-3 border border-gray-200 rounded-xl focus:border-brand-orange focus:outline-none transition-colors text-base lg:text-base appearance-none bg-white min-h-[48px]"
              required
            >
              <option value="">{t('form.loanTypePlaceholder')}</option>
              {Object.entries(loanTypeDisplayNames).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          id="lead-form-submit"
          disabled={isLoading || !phoneVerified}
          className="w-full py-4 bg-brand-orange text-white font-semibold rounded-xl hover:bg-brand-orange/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-lg mt-6 shadow-lg hover:shadow-xl min-h-[56px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              {t('common.processing')}
            </>
          ) : (
            <>
              {t('form.applyForLoan')}
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>

        {/* Trust indicators */}
        <div className="flex items-center justify-center gap-3 lg:gap-4 pt-2 text-xs text-gray-500 flex-wrap">
          <span className="flex items-center gap-1">
            <CheckCircle className="h-3.5 w-3.5 text-green-500" />
            {t('hero.secureProcess')}
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle className="h-3.5 w-3.5 text-green-500" />
            {t('trust.noSpam')}
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle className="h-3.5 w-3.5 text-green-500" />
            {t('trust.freeService')}
          </span>
        </div>
      </form>
    </div>
  );
}
