"use client";

interface ReviewSchemaProps {
  productName: string;
  ratingValue?: number;
  reviewCount?: number;
  bestRating?: number;
  worstRating?: number;
}

/**
 * Review/Rating Schema for Google SERP Star Ratings
 * This shows ⭐⭐⭐⭐⭐ ratings directly in search results
 */
export function ReviewSchema({
  productName,
  ratingValue = 4.8,
  reviewCount = 12500,
  bestRating = 5,
  worstRating = 1,
}: ReviewSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: productName,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: ratingValue,
      reviewCount: reviewCount,
      bestRating: bestRating,
      worstRating: worstRating,
    },
    brand: {
      "@type": "Organization",
      name: "Credifin",
    },
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      priceCurrency: "INR",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "0",
        priceCurrency: "INR",
        description: "No processing fee",
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * Local Business Schema for Google Business Profile
 */
export function LocalBusinessSchema({ city }: { city: string }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    name: `Credifin ${city}`,
    description: "NBFC providing quick loans for vehicles, homes, and businesses",
    url: `https://campaigns.credif.in`,
    telephone: "+91-8800123456",
    address: {
      "@type": "PostalAddress",
      addressLocality: city,
      addressRegion: "India",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      // These would be city-specific in production
      latitude: "28.6139",
      longitude: "77.2090",
    },
    openingHours: "Mo-Sa 09:00-18:00",
    priceRange: "₹₹",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "12500",
    },
    sameAs: [
      "https://www.facebook.com/credifin",
      "https://www.instagram.com/credifin",
      "https://www.linkedin.com/company/credifin",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * FAQ Schema for Rich Snippets
 */
export function FAQSchema({ faqs }: { faqs: Array<{ question: string; answer: string }> }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * Breadcrumb Schema for Navigation
 */
export function BreadcrumbSchema({
  items,
}: {
  items: Array<{ name: string; url: string }>;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
