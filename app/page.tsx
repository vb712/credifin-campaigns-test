import { Metadata } from "next";
import { getProducts } from "@/lib/products";
import { Header, Footer } from "@/components/layout";
import { HomeContent } from "@/components/home-content";

export const metadata: Metadata = {
  title: "Credifin - Quick Loans for Bharat | E-Rickshaw, EV, Home & Business Loans",
  description:
    "Get instant loan approval with minimal documentation. E-Rickshaw loans, EV two-wheeler loans, home loans, business loans & more. Interest rates starting 8.5% p.a.",
  keywords: [
    "instant loan",
    "quick loan approval",
    "e-rickshaw loan",
    "ev loan",
    "home loan",
    "business loan",
    "personal loan",
    "low interest loan",
    "Credifin",
  ],
  openGraph: {
    title: "Credifin - Quick Loans for Bharat",
    description:
      "Get instant loan approval with minimal documentation. Interest rates starting 8.5% p.a.",
    type: "website",
    locale: "en_IN",
    siteName: "Credifin",
  },
};

export default function HomePage() {
  const products = getProducts();

  // Group products by priority
  const highPriority = products.filter((p) => p.priority === "high");
  const mediumPriority = products.filter((p) => p.priority === "medium");
  const standardPriority = products.filter((p) => p.priority === "standard");

  return (
    <>
      <Header />
      <HomeContent
        highPriority={highPriority}
        mediumPriority={mediumPriority}
        standardPriority={standardPriority}
      />
      <Footer />
    </>
  );
}