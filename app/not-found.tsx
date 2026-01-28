"use client";

import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";
import { Header, Footer } from "@/components/layout";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="min-h-[60vh] flex items-center justify-center bg-gray-50">
        <div className="text-center px-4 py-16">
          <div className="w-24 h-24 bg-brand-orange-light rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl font-bold text-brand-orange">404</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-brand-navy mb-4">
            Page Not Found
          </h1>
          <p className="text-gray-600 max-w-md mx-auto mb-8">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. The loan product
            or city you searched for might not exist.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-orange text-white font-semibold rounded-xl hover:bg-brand-orange/90 transition-colors"
            >
              <Home className="h-5 w-5" />
              Go to Homepage
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Go Back
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
