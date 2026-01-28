import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { leadRateLimiter, checkRateLimit, getClientIP } from "@/lib/rate-limit";

// Simple callback request schema
const callbackSchema = z.object({
  phone: z.string().length(10).regex(/^[6-9]\d{9}$/),
  productSlug: z.string().optional(),
  city: z.string().optional(),
  source: z.string().optional(), // exit_intent, floating_cta, etc.
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const result = callbackSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Please enter a valid phone number" },
        { status: 400 }
      );
    }

    const { phone, productSlug, city, source } = result.data;

    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimitResult = await checkRateLimit(leadRateLimiter, clientIP);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // Check for duplicate in last 24 hours
    const existing = await prisma.lead.findFirst({
      where: {
        phone,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });

    if (existing) {
      // Just return success, don't create duplicate
      return NextResponse.json({
        success: true,
        message: "Callback request received",
      });
    }

    // Create minimal lead for callback
    const lead = await prisma.lead.create({
      data: {
        name: "Callback Request",
        phone,
        pincode: "000000", // Unknown
        loanType: productSlug || "general-enquiry",
        city,
        productSlug,
        verified: false, // Not OTP verified
        utmSource: source || "exit_intent",
        ipAddress: clientIP !== "unknown" ? clientIP : undefined,
        leadTier: "warm", // Exit intent shows interest
      },
    });

    console.log("[Callback Request]", {
      id: lead.id,
      phone: phone.slice(0, 4) + "****",
      source,
    });

    return NextResponse.json({
      success: true,
      message: "Callback request received",
    });

  } catch (error) {
    console.error("[Callback API Error]", error);
    return NextResponse.json(
      { error: "Failed to submit request" },
      { status: 500 }
    );
  }
}
