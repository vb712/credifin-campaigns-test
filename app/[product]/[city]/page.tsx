import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getProductBySlug,
  getProducts,
  getCities,
  formatCity,
  replaceCityPlaceholder,
} from "@/lib/products";
import { Header, Footer } from "@/components/layout";
import { ProductHero } from "@/components/product-hero";
import { LeadForm } from "@/components/lead-form";
import { EMICalculator } from "@/components/emi-calculator";
import { ProcessTimeline } from "@/components/process-timeline";
import { FAQAccordion } from "@/components/faq-accordion";
import { DocumentsEligibility } from "@/components/documents-eligibility";
import { FeatureCards } from "@/components/feature-cards";
import { StickyCTA } from "@/components/sticky-cta";
import { WhatsAppCTA } from "@/components/whatsapp-cta";
import { FloatingCallButton } from "@/components/click-to-call";
import { ExitIntentPopup } from "@/components/exit-intent-popup";
import { ReviewSchema, LocalBusinessSchema, FAQSchema, BreadcrumbSchema } from "@/components/review-schema";
import { Testimonials, TestimonialStrip } from "@/components/testimonials";

interface PageProps {
  params: Promise<{
    product: string;
    city: string;
  }>;
}

// Generate static params for all product/city combinations
export async function generateStaticParams() {
  const products = getProducts();
  const cities = getCities();

  const params: Array<{ product: string; city: string }> = [];

  for (const product of products) {
    for (const city of cities) {
      params.push({
        product: product.slug,
        city,
      });
    }
  }

  return params;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { product: productSlug, city } = await params;
  const product = getProductBySlug(productSlug);

  if (!product) {
    return {
      title: "Page Not Found | Credifin",
    };
  }

  const formattedCity = formatCity(city);
  const title = `${product.displayName} in ${formattedCity} | Credifin`;
  const description = replaceCityPlaceholder(
    `Apply for ${product.displayName} in {city}. Interest rates starting ${product.interestRate}% p.a. Quick approval, minimal documents. ${product.targetAudience}.`,
    city
  );

  return {
    title,
    description,
    keywords: [
      `${product.displayName} ${formattedCity}`,
      `${product.slug} ${city}`,
      `loan in ${formattedCity}`,
      product.displayName,
      "quick loan approval",
      "low interest rate",
      "Credifin",
    ],
    openGraph: {
      title,
      description,
      type: "website",
      locale: "en_IN",
      siteName: "Credifin",
      images: [
        {
          url: `/images/${productSlug}/og.webp`,
          width: 1200,
          height: 630,
          alt: `${product.displayName} in ${formattedCity}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `https://campaigns.credif.in/${productSlug}/${city}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function ProductCityPage({ params }: PageProps) {
  const { product: productSlug, city } = await params;
  const product = getProductBySlug(productSlug, "en");
  const productHi = getProductBySlug(productSlug, "hi");

  if (!product) {
    notFound();
  }

  // Validate city
  const cities = getCities();
  if (!cities.includes(city)) {
    notFound();
  }

  const formattedCity = formatCity(city);

  // Prepare content for both languages with city replacement
  const contentEn = {
    heroText: replaceCityPlaceholder(product.heroText, city),
    heroSubtext: replaceCityPlaceholder(product.heroSubtext, city),
    displayName: `${product.displayName} in ${formattedCity}`,
  };

  const contentHi = {
    heroText: productHi?.heroText ? replaceCityPlaceholder(productHi.heroText, city) : contentEn.heroText,
    heroSubtext: productHi?.heroSubtext ? replaceCityPlaceholder(productHi.heroSubtext, city) : contentEn.heroSubtext,
    displayName: productHi?.displayName || contentEn.displayName,
  };

  // FAQs for both languages
  const faqsEn = product.faqs.map((faq) => ({
    question: replaceCityPlaceholder(faq.question, city),
    answer: replaceCityPlaceholder(faq.answer, city),
  }));

  const faqsHi = productHi?.faqs?.map((faq) => ({
    question: replaceCityPlaceholder(faq.question, city),
    answer: replaceCityPlaceholder(faq.answer, city),
  })) || faqsEn;

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FinancialProduct",
    name: `${product.displayName} in ${formattedCity}`,
    description: contentEn.heroSubtext,
    provider: {
      "@type": "FinancialService",
      name: "Credifin",
      url: "https://credif.in",
    },
    interestRate: {
      "@type": "QuantitativeValue",
      value: product.interestRate,
      unitText: "PERCENT",
    },
    amount: {
      "@type": "MonetaryAmount",
      minValue: product.minAmount,
      maxValue: product.maxAmount,
      currency: "INR",
    },
    areaServed: {
      "@type": "City",
      name: formattedCity,
      addressCountry: "IN",
    },
    feesAndCommissionsSpecification: `Processing Fee: ${product.processingFee}`,
  };

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ReviewSchema productName={`${product.displayName} in ${formattedCity}`} />
      <LocalBusinessSchema city={formattedCity} />
      <FAQSchema faqs={faqsEn} />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://campaigns.credif.in" },
          { name: product.displayName, url: `https://campaigns.credif.in/${productSlug}` },
          { name: formattedCity, url: `https://campaigns.credif.in/${productSlug}/${city}` },
        ]}
      />

      <Header />

      {/* Helper for hydration matching if needed, though replaced in layout */}

      <main className="min-h-screen bg-gray-50 pb-20 md:pb-0">
        {/* Mobile-First Hero with Form (Matches Product Page) */}
        <ProductHero
          product={product}
          productSlug={productSlug}
          contentEn={contentEn}
          contentHi={contentHi}
        />

        {/* Main Content - Single Column */}
        <div className="container mx-auto px-4 py-8 lg:py-12">
          <div className="space-y-8 max-w-4xl mx-auto">
            {/* Process Timeline */}
            <ProcessTimeline />

            {/* EMI Calculator */}
            <EMICalculator
              minAmount={product.minAmount}
              maxAmount={product.maxAmount}
              minTenure={product.minTenure}
              maxTenure={product.maxTenure}
              defaultRate={parseFloat(product.interestRate)}
              productName={product.displayName}
              productNameHi={productHi?.displayName || product.displayName}
            />

            {/* Features */}
            <FeatureCards
              features={product.features}
              featuresHi={productHi?.features || product.features}
            />

            {/* Documents & Eligibility */}
            <DocumentsEligibility
              eligibility={product.eligibility}
              documents={product.documents}
              eligibilityHi={productHi?.eligibility || product.eligibility}
              documentsHi={productHi?.documents || product.documents}
            />

            {/* FAQs */}
            <FAQAccordion faqsEn={faqsEn} faqsHi={faqsHi} />

            {/* Testimonials Section - Kept as requested for Delhi specificity */}
            <Testimonials
              title={`Trusted by Thousands in ${formattedCity}`}
              subtitle="See why customers choose Credifin for their loan needs"
            />
          </div>
        </div>
      </main>

      <Footer />

      {/* WhatsApp Floating CTA */}
      <WhatsAppCTA
        productName={product.displayName}
        city={formattedCity}
      />

      {/* Floating Call Button for Mobile */}
      <FloatingCallButton phoneNumber="8800123456" />

      {/* Sticky CTA for Mobile (Matches Product Page) */}
      <StickyCTA
        textEn={`Apply for ${product.displayName}`}
        textHi={`${productHi?.displayName || product.displayName} के लिए आवेदन करें`}
      />

      {/* Exit Intent Popup */}
      <ExitIntentPopup
        productSlug={productSlug}
        city={city}
        headline="Wait! Special Offer for You"
        subheadline={`Get ${product.displayName} approved in ${formattedCity} within 24 hours!`}
      />
    </>
  );
}
