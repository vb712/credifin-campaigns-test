import { MetadataRoute } from "next";
import { getProducts, getCities } from "@/lib/products";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://campaigns.credif.in";

export default function sitemap(): MetadataRoute.Sitemap {
  const products = getProducts();
  const cities = getCities();

  // Homepage
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  // Product pages (without city)
  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${BASE_URL}/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  // Product + City pages (main landing pages)
  const productCityPages: MetadataRoute.Sitemap = products.flatMap((product) =>
    cities.map((city) => ({
      url: `${BASE_URL}/${product.slug}/${city}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: product.priority === "high" ? 0.8 : 0.7,
    }))
  );

  return [...staticPages, ...productPages, ...productCityPages];
}
