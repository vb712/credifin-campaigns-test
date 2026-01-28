import { NextRequest, NextResponse } from "next/server";
import { verifyOtpSchema } from "@/lib/validations";
import { verifyOTPSignature, createVerificationToken } from "@/lib/otp";
import { otpVerifyRateLimiter, checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const result = verifyOtpSchema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { phone, otp, signature, timestamp } = result.data;

    // SECURITY: Brute force protection - limit OTP verification attempts per phone
    const rateLimitResult = await checkRateLimit(otpVerifyRateLimiter, phone);
    if (!rateLimitResult.success) {
      const resetTime = Math.ceil((rateLimitResult.reset - Date.now()) / 1000 / 60);
      return NextResponse.json(
        {
          error: `Too many verification attempts. Please request a new OTP in ${resetTime} minutes.`,
          retryAfter: rateLimitResult.reset,
        },
        { status: 429 }
      );
    }

    // Warn user if running low on attempts
    if (rateLimitResult.remaining <= 2) {
      console.log(`[SECURITY] Low verify attempts remaining for ${phone.slice(0, 4)}****`);
    }

    // Verify OTP using HMAC signature (stateless)
    const verification = verifyOTPSignature(phone, otp, signature, timestamp);

    if (!verification.valid) {
      return NextResponse.json(
        { error: verification.error },
        { status: 400 }
      );
    }

    // Create verification token to prove phone was verified
    const verificationTimestamp = Date.now();
    const verificationToken = createVerificationToken(phone, verificationTimestamp);

    return NextResponse.json({
      success: true,
      message: "Phone verified successfully",
      verificationToken,
      timestamp: verificationTimestamp,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { error: "Failed to verify OTP. Please try again." },
      { status: 500 }
    );
  }
}
