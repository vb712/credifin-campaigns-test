"use client";

import { Zap, IndianRupee, Clock, Shield } from "lucide-react";
import { HeroImage } from "./hero-image";
import { useTranslation } from "@/lib/i18n";
import { LanguageToggle } from "./language-toggle";

interface HeroSectionProps {
  title: string;
  subtitle: string;
  interestRate: string;
  productSlug: string;
  features?: string[];
}

export function HeroSection({
  title,
  subtitle,
  interestRate,
  productSlug,
}: HeroSectionProps) {
  const { t } = useTranslation();

  return (
    <section className="relative bg-gradient-to-br from-brand-navy via-brand-navy to-brand-navy/90 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative container mx-auto px-4 py-8 lg:py-20">
        {/* Language Toggle - Mobile prominent placement */}
        <div className="flex justify-end mb-4 lg:absolute lg:top-4 lg:right-4">
          <LanguageToggle className="bg-white/10 backdrop-blur-sm" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-center">
          {/* Content */}
          <div className="text-white space-y-4 lg:space-y-6 order-2 lg:order-1">
            {/* Interest Rate Badge */}
            <div className="inline-flex items-center gap-2 bg-brand-orange/20 border border-brand-orange/40 rounded-full px-4 py-2">
              <IndianRupee className="h-4 w-4 text-brand-orange" />
              <span className="text-sm font-medium">
                {t('hero.interestRates')}{" "}
                <span className="text-brand-orange font-bold">
                  {interestRate}% {t('common.perAnnum')}
                </span>
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold leading-tight">
              {title}
            </h1>

            {/* Subtitle */}
            <p className="text-base lg:text-lg text-white/80 max-w-xl">{subtitle}</p>

            {/* Quick Features - More compact on mobile */}
            <div className="flex flex-wrap gap-3 lg:gap-4 pt-2 lg:pt-4">
              <div className="flex items-center gap-2 text-xs lg:text-sm">
                <div className="p-1.5 lg:p-2 bg-brand-orange/20 rounded-lg">
                  <Zap className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-brand-orange" />
                </div>
                <span>{t('hero.quickApproval')}</span>
              </div>
              <div className="flex items-center gap-2 text-xs lg:text-sm">
                <div className="p-1.5 lg:p-2 bg-brand-orange/20 rounded-lg">
                  <Clock className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-brand-orange" />
                </div>
                <span>{t('hero.disbursement24hr')}</span>
              </div>
              <div className="flex items-center gap-2 text-xs lg:text-sm">
                <div className="p-1.5 lg:p-2 bg-brand-orange/20 rounded-lg">
                  <Shield className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-brand-orange" />
                </div>
                <span>{t('hero.secureProcess')}</span>
              </div>
            </div>

            {/* CTA Button - Hidden on mobile since form is prominent */}
            <div className="pt-2 hidden lg:block">
              <a
                href="#lead-form"
                className="inline-flex items-center gap-2 px-8 py-4 bg-brand-orange text-white font-semibold text-lg rounded-xl hover:bg-brand-orange/90 transition-all shadow-lg hover:shadow-xl"
              >
                {t('common.applyForLoan')}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative hidden lg:block order-2">
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
              <HeroImage
                src={`/images/${productSlug}/hero.webp`}
                alt={title}
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-brand-orange/20 rounded-full blur-2xl" />
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-brand-orange/10 rounded-full blur-3xl" />
          </div>
        </div>

        {/* Mobile CTA - Prominent at bottom */}
        <div className="mt-6 lg:hidden">
          <a
            href="#lead-form"
            className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-brand-orange text-white font-semibold text-lg rounded-xl hover:bg-brand-orange/90 transition-all shadow-lg"
          >
            {t('common.applyForLoan')}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
        >
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
}
