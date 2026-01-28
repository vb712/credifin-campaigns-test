import crypto from "crypto";

// SECURITY: OTP_SECRET must be set in production - no fallback!
function getOtpSecret(): string {
  const secret = process.env.OTP_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("CRITICAL: OTP_SECRET environment variable is required in production");
    }
    // Only allow fallback in development with warning
    console.warn("⚠️ WARNING: Using default OTP_SECRET - SET THIS IN PRODUCTION!");
    return "dev-only-secret-do-not-use-in-production";
  }
  return secret;
}

const OTP_VALIDITY_MINUTES = 10;

/**
 * Generate a 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Create HMAC signature for stateless OTP verification
 * Format: HMAC-SHA256(phone + otp + timestamp)
 */
export function createOTPSignature(phone: string, otp: string, timestamp: number): string {
  const data = `${phone}:${otp}:${timestamp}`;
  return crypto.createHmac("sha256", getOtpSecret()).update(data).digest("hex");
}

/**
 * Verify OTP using HMAC signature (stateless)
 * Returns true if OTP is valid and not expired
 */
export function verifyOTPSignature(
  phone: string,
  otp: string,
  signature: string,
  timestamp: number
): { valid: boolean; error?: string } {
  // Check if OTP is expired (10 minutes validity)
  const now = Date.now();
  const ageMinutes = (now - timestamp) / (1000 * 60);
  
  if (ageMinutes > OTP_VALIDITY_MINUTES) {
    return { valid: false, error: "OTP has expired. Please request a new one." };
  }

  // Verify signature
  const expectedSignature = createOTPSignature(phone, otp, timestamp);
  const isValid = crypto.timingSafeEqual(
    Buffer.from(signature, "hex"),
    Buffer.from(expectedSignature, "hex")
  );

  if (!isValid) {
    return { valid: false, error: "Invalid OTP. Please check and try again." };
  }

  return { valid: true };
}

/**
 * Create a verification token after successful OTP verification
 * This token proves the phone was verified
 */
export function createVerificationToken(phone: string, timestamp: number): string {
  const data = `verified:${phone}:${timestamp}`;
  return crypto.createHmac("sha256", getOtpSecret()).update(data).digest("hex");
}

/**
 * Verify the verification token
 */
export function verifyVerificationToken(
  phone: string,
  token: string,
  timestamp: number
): boolean {
  const expectedToken = createVerificationToken(phone, timestamp);
  try {
    return crypto.timingSafeEqual(
      Buffer.from(token, "hex"),
      Buffer.from(expectedToken, "hex")
    );
  } catch {
    return false;
  }
}

/**
 * Mask phone number for display (e.g., 98****4567)
 */
export function maskPhone(phone: string): string {
  if (phone.length !== 10) return phone;
  return `${phone.slice(0, 2)}****${phone.slice(-4)}`;
}
