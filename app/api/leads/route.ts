import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyVerificationToken } from "@/lib/otp";
import { leadRateLimiter, checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { prisma } from "@/lib/db";

// Extended lead schema with tracking fields
const extendedLeadSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().length(10).regex(/^[6-9]\d{9}$/),
  pincode: z.string().length(6).regex(/^[1-9][0-9]{5}$/),
  loanType: z.string().min(1),
  city: z.string().optional(),
  productSlug: z.string().optional(),
  otpSignature: z.string().min(1),
  otpTimestamp: z.number().positive(),
  
  // UTM tracking
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmTerm: z.string().optional(),
  utmContent: z.string().optional(),
  
  // Click IDs
  gclid: z.string().optional(),
  fbclid: z.string().optional(),
  
  // Session tracking
  referrer: z.string().optional(),
  landingPage: z.string().optional(),
  sessionId: z.string().optional(),
  
  // Lead scoring
  leadScore: z.number().min(0).max(100).optional(),
  leadTier: z.enum(["hot", "warm", "cold"]).optional(),
  timeOnPage: z.number().min(0).optional(),
  scrollDepth: z.number().min(0).max(100).optional(),
  emiCalculatorUsed: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const result = extendedLeadSchema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const data = result.data;

    // Verify phone was actually verified
    const isVerified = verifyVerificationToken(data.phone, data.otpSignature, data.otpTimestamp);
    if (!isVerified) {
      return NextResponse.json(
        { error: "Phone verification required. Please verify your phone number." },
        { status: 400 }
      );
    }

    // Check verification is recent (within 30 minutes)
    const verificationAge = Date.now() - data.otpTimestamp;
    if (verificationAge > 30 * 60 * 1000) {
      return NextResponse.json(
        { error: "Phone verification expired. Please verify again." },
        { status: 400 }
      );
    }

    // Rate limiting: 5 lead submissions per hour per IP
    const clientIP = getClientIP(request);
    const rateLimitResult = await checkRateLimit(leadRateLimiter, clientIP);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Too many submissions. Please try again later.",
          retryAfter: rateLimitResult.reset,
        },
        { status: 429 }
      );
    }

    // Check for duplicate submission (same phone + product in last hour)
    const existingLead = await prisma.lead.findFirst({
      where: {
        phone: data.phone,
        productSlug: data.productSlug || data.loanType,
        createdAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000), // 1 hour
        },
      },
    });

    if (existingLead) {
      return NextResponse.json(
        { 
          error: "You have already submitted an application. Our team will contact you soon.",
          leadId: existingLead.id,
        },
        { status: 409 }
      );
    }

    // Get user agent
    const userAgent = request.headers.get("user-agent") || undefined;

    // Create lead in database with all tracking data
    const lead = await prisma.lead.create({
      data: {
        name: data.name,
        phone: data.phone,
        pincode: data.pincode,
        loanType: data.loanType,
        city: data.city,
        productSlug: data.productSlug,
        verified: true,
        
        // UTM tracking
        utmSource: data.utmSource,
        utmMedium: data.utmMedium,
        utmCampaign: data.utmCampaign,
        utmTerm: data.utmTerm,
        utmContent: data.utmContent,
        
        // Click IDs (for offline conversion import)
        gclid: data.gclid,
        fbclid: data.fbclid,
        
        // Session tracking
        referrer: data.referrer,
        landingPage: data.landingPage,
        sessionId: data.sessionId,
        
        // Lead scoring
        leadScore: data.leadScore,
        leadTier: data.leadTier,
        timeOnPage: data.timeOnPage,
        scrollDepth: data.scrollDepth,
        emiCalcUsed: data.emiCalculatorUsed,
        
        // Request info
        ipAddress: clientIP !== "unknown" ? clientIP : undefined,
        userAgent: userAgent?.slice(0, 500),
      },
    });

    // Log for analytics
    console.log("[Lead Created]", {
      id: lead.id,
      phone: lead.phone.slice(0, 4) + "****",
      loanType: lead.loanType,
      leadTier: lead.leadTier || "unscored",
      source: lead.utmSource || "direct",
      gclid: lead.gclid ? "yes" : "no",
    });

    return NextResponse.json({
      success: true,
      message: "Application submitted successfully",
      leadId: lead.id,
      referenceNumber: `CRED${lead.id.slice(-8).toUpperCase()}`,
    });
  } catch (error) {
    console.error("Lead submission error:", error);

    // Handle Prisma-specific errors
    if (error instanceof Error && error.message.includes("prisma")) {
      return NextResponse.json(
        { error: "Database temporarily unavailable. Please try again." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Failed to submit application. Please try again." },
      { status: 500 }
    );
  }
}
