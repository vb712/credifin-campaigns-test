import { z } from "zod";

// Strict validation - reject script tags and potential XSS
const sanitizeString = (value: string) => {
  if (/<script/i.test(value) || /javascript:/i.test(value) || /on\w+=/i.test(value)) {
    return false;
  }
  return true;
};

// Phone validation schema (Indian mobile numbers)
export const phoneSchema = z
  .string()
  .length(10, "Phone number must be exactly 10 digits")
  .regex(/^[6-9]\d{9}$/, "Please enter a valid Indian mobile number");

// Pincode validation schema (Indian pincodes)
export const pincodeSchema = z
  .string()
  .length(6, "Pincode must be exactly 6 digits")
  .regex(/^[1-9][0-9]{5}$/, "Please enter a valid Indian pincode");

// Name validation schema
export const nameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name must be less than 100 characters")
  .regex(/^[a-zA-Z\s.'-]+$/, "Name can only contain letters, spaces, dots, hyphens")
  .refine(sanitizeString, "Invalid characters in name");

// Loan type validation
const loanTypes = [
  "e-rickshaw-loan",
  "ev-two-wheeler-loan",
  "home-loan",
  "business-loan",
  "loan-against-property",
  "personal-loan",
  "car-loan",
  "two-wheeler-loan",
  "commercial-vehicle-loan",
  "education-loan",
] as const;

export const loanTypeSchema = z.enum(loanTypes);

// OTP validation schema
export const otpSchema = z
  .string()
  .length(6, "OTP must be exactly 6 digits")
  .regex(/^\d{6}$/, "OTP must contain only numbers");

// Send OTP request schema
export const sendOtpSchema = z.object({
  phone: phoneSchema,
});

// Verify OTP request schema
export const verifyOtpSchema = z.object({
  phone: phoneSchema,
  otp: otpSchema,
  signature: z.string().min(1, "Signature is required"),
  timestamp: z.number().positive("Invalid timestamp"),
});

// Lead submission schema
export const leadSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  pincode: pincodeSchema,
  loanType: loanTypeSchema,
  city: z.string().optional(),
  productSlug: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  otpSignature: z.string().min(1, "Phone verification required"),
  otpTimestamp: z.number().positive("Invalid verification timestamp"),
});

// Type exports
export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type LeadInput = z.infer<typeof leadSchema>;
export type LoanType = z.infer<typeof loanTypeSchema>;

// Loan type display names mapping
export const loanTypeDisplayNames: Record<string, string> = {
  "e-rickshaw-loan": "E-Rickshaw Loan",
  "ev-two-wheeler-loan": "EV Two Wheeler Loan",
  "home-loan": "Home Loan",
  "business-loan": "Business Loan",
  "loan-against-property": "Loan Against Property",
  "personal-loan": "Personal Loan",
  "car-loan": "Car Loan",
  "two-wheeler-loan": "Two Wheeler Loan",
  "commercial-vehicle-loan": "Commercial Vehicle Loan",
  "education-loan": "Education Loan",
};
