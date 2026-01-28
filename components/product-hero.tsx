"use client";

import { useTranslation } from "@/lib/i18n";
import { LeadForm } from "@/components/lead-form";

interface Product {
  slug: string;
  displayName: string;
  interestRate: string;
  maxAmount: number;
}

interface ProductContent {
  heroText: string;
  heroSubtext: string;
  displayName: string;
}

interface ProductHeroProps {
  product: Product;
  productSlug: string;
  contentEn: ProductContent;
  contentHi: ProductContent;
}

export function ProductHero({ product, productSlug, contentEn, contentHi }: ProductHeroProps) {
  const { t, locale } = useTranslation();
  
  // Select content based on current locale
  const content = locale === 'hi' ? contentHi : contentEn;
  const heroText = content.heroText;
  const heroSubtext = content.heroSubtext;
  const displayName = content.displayName;

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

      <div className="relative container mx-auto px-4 py-6 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 items-start">
          {/* Lead Form - ORDER 1 on mobile for fast access */}
          <div id="lead-form" className="order-1 lg:order-2">
            <LeadForm productSlug={productSlug} />
          </div>

          {/* Hero Content - ORDER 2 on mobile */}
          <div className="text-white space-y-4 lg:space-y-6 order-2 lg:order-1">
            {/* Interest Rate Badge */}
            <div className="inline-flex items-center gap-2 bg-brand-orange/20 border border-brand-orange/40 rounded-full px-3 py-1.5 lg:px-4 lg:py-2">
              <span className="text-xs lg:text-sm font-medium">
                {locale === 'hi' ? 'ब्याज दर शुरू' : 'Interest rates starting'}{" "}
                <span className="text-brand-orange font-bold">
                  {product.interestRate}% {locale === 'hi' ? 'प्रति वर्ष' : 'p.a.'}
                </span>
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight">
              {heroText}
            </h1>

            {/* Subtitle */}
            <p className="text-sm lg:text-lg text-white/80 max-w-xl">{heroSubtext}</p>

            {/* Quick Stats - Compact on mobile */}
            <div className="flex flex-wrap gap-4 lg:gap-6 pt-2">
              <div className="text-center lg:text-left">
                <p className="text-xl lg:text-2xl font-bold text-brand-orange">{product.interestRate}%</p>
                <p className="text-xs text-white/70">{locale === 'hi' ? 'ब्याज दर' : 'Interest Rate'}</p>
              </div>
              <div className="text-center lg:text-left">
                <p className="text-xl lg:text-2xl font-bold text-brand-orange">24hr</p>
                <p className="text-xs text-white/70">{locale === 'hi' ? 'त्वरित स्वीकृति' : 'Quick Approval'}</p>
              </div>
              <div className="text-center lg:text-left">
                <p className="text-xl lg:text-2xl font-bold text-brand-orange">₹{(product.maxAmount / 100000).toFixed(0)}L</p>
                <p className="text-xs text-white/70">{locale === 'hi' ? 'अधिकतम लोन' : 'Max Loan'}</p>
              </div>
            </div>

            {/* Trust Badges - Compact */}
            <div className="flex flex-wrap gap-2 lg:gap-3 pt-2">
              <div className="flex items-center gap-1.5 text-xs bg-white/10 rounded-lg px-2 py-1.5">
                <svg className="h-3.5 w-3.5 text-brand-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>{locale === 'hi' ? '100% सुरक्षित' : '100% Secure'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs bg-white/10 rounded-lg px-2 py-1.5">
                <svg className="h-3.5 w-3.5 text-brand-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{locale === 'hi' ? 'कम दस्तावेज़' : 'Min Documents'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs bg-white/10 rounded-lg px-2 py-1.5">
                <svg className="h-3.5 w-3.5 text-brand-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>{locale === 'hi' ? 'मुफ्त सेवा' : 'Free Service'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" />
        </svg>
      </div>
    </section>
  );
}
