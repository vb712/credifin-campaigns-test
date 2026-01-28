import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getProducts } from "@/lib/products";
import { Header, Footer } from "@/components/layout";
import { EMICalculator } from "@/components/emi-calculator";
import { ProcessTimeline } from "@/components/process-timeline";
import { FAQAccordion } from "@/components/faq-accordion";
import { DocumentsEligibility } from "@/components/documents-eligibility";
import { FeatureCards } from "@/components/feature-cards";
import { StickyCTA } from "@/components/sticky-cta";
import { ProductHero } from "@/components/product-hero";

interface PageProps {
  params: Promise<{
    product: string;
  }>;
}

// Generate static params for all products
export async function generateStaticParams() {
  const products = getProducts();
  return products.map((product) => ({
    product: product.slug,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { product: productSlug } = await params;
  const product = getProductBySlug(productSlug);

  if (!product) {
    return {
      title: "Page Not Found | Credifin",
    };
  }

  const title = `${product.displayName} | Credifin - Quick Approval & Low Interest`;
  const description = `Apply for ${product.displayName}. Interest rates starting ${product.interestRate}% p.a. Quick approval, minimal documents. Perfect for ${product.targetAudience}.`;

  return {
    title,
    description,
    keywords: [
      product.displayName,
      product.slug,
      "quick loan approval",
      "low interest rate",
      "Credifin",
      "instant loan",
    ],
    openGraph: {
      title,
      description,
      type: "website",
      locale: "en_IN",
      siteName: "Credifin",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `https://campaigns.credif.in/${productSlug}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { product: productSlug } = await params;
  const product = getProductBySlug(productSlug, "en");
  const productHi = getProductBySlug(productSlug, "hi");

  if (!product) {
    notFound();
  }

  // Prepare content for both languages
  const contentEn = {
    heroText: product.heroText.replace(/ in \{city\}/g, "").replace(/\{city\}/g, "India"),
    heroSubtext: product.heroSubtext,
    displayName: product.displayName,
  };
  
  const contentHi = {
    heroText: productHi?.heroText?.replace(/ में /g, " में ").replace(/\{city\}/g, "भारत") || contentEn.heroText,
    heroSubtext: productHi?.heroSubtext || contentEn.heroSubtext,
    displayName: productHi?.displayName || contentEn.displayName,
  };

  // FAQs for both languages
  const faqsEn = product.faqs.map((faq) => ({
    question: faq.question.replace(/ in \{city\}/g, "").replace(/\{city\}/g, "India"),
    answer: faq.answer.replace(/ in \{city\}/g, "").replace(/\{city\}/g, "India"),
  }));

  const faqsHi = productHi?.faqs?.map((faq) => ({
    question: faq.question.replace(/\{city\}/g, "भारत"),
    answer: faq.answer.replace(/\{city\}/g, "भारत"),
  })) || faqsEn;

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FinancialProduct",
    name: product.displayName,
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
      "@type": "Country",
      name: "India",
    },
    feesAndCommissionsSpecification: `Processing Fee: ${product.processingFee}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header />

      <main className="min-h-screen bg-gray-50 pb-20 md:pb-0">
        {/* Mobile-First Hero with Form */}
        <ProductHero 
          product={product}
          productSlug={productSlug}
          contentEn={contentEn}
          contentHi={contentHi}
        />

        {/* Main Content */}
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
          </div>
        </div>
      </main>

      <Footer />

      {/* Sticky CTA for Mobile */}
      <StickyCTA textEn={`Apply for ${product.displayName}`} textHi={`${productHi?.displayName || product.displayName} के लिए आवेदन करें`} />
    </>
  );
}
