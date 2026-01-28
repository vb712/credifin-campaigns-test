import productsDataEn from "@/data/products.json";
import productsDataHi from "@/data/products-hi.json";

export type Locale = "en" | "hi";

export interface Product {
  slug: string;
  displayName: string;
  priority: string;
  targetAudience: string;
  heroText: string;
  heroSubtext: string;
  interestRate: string;
  maxAmount: number;
  minAmount: number;
  maxTenure: number;
  minTenure: number;
  processingFee: string;
  eligibility: string[];
  documents: string[];
  features: string[];
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

// Helper function to merge Hindi translations with English base data
function mergeProductData(enProduct: Product, hiProduct?: Partial<Product>): Product {
  if (!hiProduct) {
    return enProduct;
  }
  
  return {
    // Keep numeric/technical data from English
    slug: enProduct.slug,
    priority: enProduct.priority,
    interestRate: enProduct.interestRate,
    maxAmount: enProduct.maxAmount,
    minAmount: enProduct.minAmount,
    maxTenure: enProduct.maxTenure,
    minTenure: enProduct.minTenure,
    // Override text fields with Hindi translations
    displayName: hiProduct.displayName ?? enProduct.displayName,
    targetAudience: hiProduct.targetAudience ?? enProduct.targetAudience,
    heroText: hiProduct.heroText ?? enProduct.heroText,
    heroSubtext: hiProduct.heroSubtext ?? enProduct.heroSubtext,
    processingFee: hiProduct.processingFee ?? enProduct.processingFee,
    eligibility: hiProduct.eligibility ?? enProduct.eligibility,
    documents: hiProduct.documents ?? enProduct.documents,
    features: hiProduct.features ?? enProduct.features,
    faqs: hiProduct.faqs ?? enProduct.faqs,
  };
}

// Get Hindi product by slug
function getHindiProductBySlug(slug: string): Partial<Product> | undefined {
  return productsDataHi.products.find((p) => p.slug === slug) as Partial<Product> | undefined;
}

export function getProducts(locale: Locale = "en"): Product[] {
  const enProducts = productsDataEn.products as Product[];
  
  if (locale === "en") {
    return enProducts;
  }
  
  // For Hindi, merge translations with English base data
  return enProducts.map((enProduct) => {
    const hiProduct = getHindiProductBySlug(enProduct.slug);
    return mergeProductData(enProduct, hiProduct);
  });
}

export function getProductBySlug(slug: string, locale: Locale = "en"): Product | undefined {
  const enProduct = productsDataEn.products.find((p) => p.slug === slug) as Product | undefined;
  
  if (!enProduct) {
    return undefined;
  }
  
  if (locale === "en") {
    return enProduct;
  }
  
  // For Hindi, merge translations with English base data
  const hiProduct = getHindiProductBySlug(slug);
  return mergeProductData(enProduct, hiProduct);
}

export function getCities(): string[] {
  return productsDataEn.cities;
}

export function formatCity(city: string): string {
  return city
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function replaceCityPlaceholder(text: string, city: string): string {
  const formattedCity = formatCity(city);
  return text.replace(/{city}/g, formattedCity);
}

export function getProductSlugs(): string[] {
  return productsDataEn.products.map((p) => p.slug);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}
