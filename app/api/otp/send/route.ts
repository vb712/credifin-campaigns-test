import { NextRequest, NextResponse } from "next/server";
import { sendOtpSchema } from "@/lib/validations";
import { generateOTP, createOTPSignature } from "@/lib/otp";
import { otpRateLimiter, otpMobileRateLimiter, checkRateLimit, getClientIP } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const result = sendOtpSchema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { phone } = result.data;

    // SECURITY: Dual rate limiting - by IP AND by phone number
    const clientIP = getClientIP(request);
    
    // Check IP-based rate limit
    const ipRateLimitResult = await checkRateLimit(otpRateLimiter, clientIP);
    if (!ipRateLimitResult.success) {
      const resetTime = Math.ceil((ipRateLimitResult.reset - Date.now()) / 1000 / 60);
      return NextResponse.json(
        {
          error: `Too many OTP requests. Please try again in ${resetTime} minutes.`,
          retryAfter: ipRateLimitResult.reset,
        },
        { status: 429 }
      );
    }

    // Check mobile-based rate limit (prevents IP rotation attacks)
    const mobileRateLimitResult = await checkRateLimit(otpMobileRateLimiter, phone);
    if (!mobileRateLimitResult.success) {
      const resetTime = Math.ceil((mobileRateLimitResult.reset - Date.now()) / 1000 / 60);
      return NextResponse.json(
        {
          error: `OTP already sent to this number. Please wait ${resetTime} minutes before requesting again.`,
          retryAfter: mobileRateLimitResult.reset,
        },
        { status: 429 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const timestamp = Date.now();
    const signature = createOTPSignature(phone, otp, timestamp);

    // In production, send OTP via SMS gateway (e.g., MSG91, Twilio)
    // For now, we'll return it in the response for development
    console.log(`[DEV] OTP for ${phone}: ${otp}`);

    // TODO: Integrate SMS gateway
    // await sendSMS(phone, `Your Credifin verification code is: ${otp}. Valid for 10 minutes.`);

    const response: Record<string, unknown> = {
      success: true,
      message: "OTP sent successfully",
      timestamp,
      signature,
      remaining: Math.min(ipRateLimitResult.remaining, mobileRateLimitResult.remaining),
    };

    // Include OTP in development mode only
    if (process.env.NODE_ENV === "development") {
      response.otp = otp;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { error: "Failed to send OTP. Please try again." },
      { status: 500 }
    );
  }
}
