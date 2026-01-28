"use client";

import Link from "next/link";
import { ArrowRight, Zap, Shield, Clock, IndianRupee } from "lucide-react";
import { LeadForm } from "@/components/lead-form";
import { useTranslation } from "@/lib/i18n";

interface Product {
  slug: string;
  displayName: string;
  priority: string;
  targetAudience: string;
  heroSubtext: string;
  interestRate: string;
}

interface HomeContentProps {
  highPriority: Product[];
  mediumPriority: Product[];
  standardPriority: Product[];
}

export function HomeContent({ highPriority, mediumPriority, standardPriority }: HomeContentProps) {
  const { t, locale } = useTranslation();

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
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

        <div className="relative container mx-auto px-4 py-8 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Content - Order 2 on mobile so form shows first */}
            <div className="text-white space-y-5 lg:space-y-6 order-2 lg:order-1">
              <div className="hidden lg:inline-flex items-center gap-2 bg-brand-orange/20 border border-brand-orange/40 rounded-full px-4 py-2">
                <Zap className="h-4 w-4 text-brand-orange" />
                <span className="text-sm font-medium">
                  {locale === 'hi' ? 'तुरंत स्वीकृति • लॉगिन की जरूरत नहीं' : 'Instant Approval • No Login Required'}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight text-center lg:text-left">
                {t('hero.quickLoans')}{" "}
                <span className="text-brand-orange">{t('hero.forBharat')}</span>
              </h1>

              <p className="text-base lg:text-xl text-white/80 max-w-xl text-center lg:text-left mx-auto lg:mx-0">
                {locale === 'hi' 
                  ? 'ई-रिक्शा से लेकर घर तक, हम आपके सपनों को सबसे कम ब्याज दर और तेज़ स्वीकृति के साथ पूरा करते हैं।'
                  : 'From E-Rickshaws to Homes, we finance your dreams with the lowest interest rates and fastest approvals.'}
              </p>

              {/* Stats - Centered on mobile */}
              <div className="flex justify-center lg:justify-start gap-6 lg:gap-8 pt-2 lg:pt-4">
                <div className="text-center lg:text-left">
                  <p className="text-2xl lg:text-3xl font-bold text-brand-orange">8.5%</p>
                  <p className="text-xs lg:text-sm text-white/70">
                    {locale === 'hi' ? 'ब्याज दर शुरू' : 'Starting Interest'}
                  </p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-2xl lg:text-3xl font-bold text-brand-orange">24hr</p>
                  <p className="text-xs lg:text-sm text-white/70">
                    {locale === 'hi' ? 'त्वरित स्वीकृति' : 'Quick Approval'}
                  </p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-2xl lg:text-3xl font-bold text-brand-orange">50K+</p>
                  <p className="text-xs lg:text-sm text-white/70">
                    {locale === 'hi' ? 'खुश ग्राहक' : 'Happy Customers'}
                  </p>
                </div>
              </div>

              {/* Features/Badges - Centered on mobile */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-2 lg:gap-4 pt-2 lg:pt-4">
                <div className="flex items-center gap-1.5 lg:gap-2 text-xs lg:text-sm bg-white/10 rounded-lg px-2.5 lg:px-3 py-1.5 lg:py-2">
                  <Shield className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-brand-orange" />
                  <span>{t('trust.secureData').split(' ')[0]} {locale === 'hi' ? 'सुरक्षित' : 'Secure'}</span>
                </div>
                <div className="flex items-center gap-1.5 lg:gap-2 text-xs lg:text-sm bg-white/10 rounded-lg px-2.5 lg:px-3 py-1.5 lg:py-2">
                  <Clock className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-brand-orange" />
                  <span>{locale === 'hi' ? 'कम दस्तावेज़' : 'Minimal Documents'}</span>
                </div>
                <div className="flex items-center gap-1.5 lg:gap-2 text-xs lg:text-sm bg-white/10 rounded-lg px-2.5 lg:px-3 py-1.5 lg:py-2">
                  <IndianRupee className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-brand-orange" />
                  <span>{locale === 'hi' ? 'कोई छुपे शुल्क नहीं' : 'No Hidden Charges'}</span>
                </div>
              </div>
            </div>

            {/* Lead Form - Order 1 on mobile so it shows first */}
            <div className="lg:pl-8 order-1 lg:order-2">
              <LeadForm />
            </div>
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

      {/* Products Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-4">
              {locale === 'hi' ? 'अपना लोन उत्पाद चुनें' : 'Choose Your Loan Product'}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {locale === 'hi' 
                ? 'दैनिक कमाई करने वालों से लेकर घर मालिकों तक, भारत में सभी के लिए सही फाइनेंसिंग समाधान।'
                : 'From daily earners to homeowners, we have the right financing solution for everyone in Bharat.'}
            </p>
          </div>

          {/* High Priority - Featured */}
          <div className="mb-12">
            <h3 className="text-lg font-semibold text-brand-orange mb-6 flex items-center gap-2">
              <Zap className="h-5 w-5" />
              {locale === 'hi' ? 'सबसे लोकप्रिय' : 'Most Popular'}
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {highPriority.map((product) => (
                <Link
                  key={product.slug}
                  href={`/${product.slug}`}
                  className="group relative bg-gradient-to-br from-brand-orange-light to-white border-2 border-brand-orange/20 rounded-2xl p-6 hover:border-brand-orange hover:shadow-lg transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-xl font-bold text-brand-navy group-hover:text-brand-orange transition-colors">
                        {product.displayName}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {product.targetAudience}
                      </p>
                    </div>
                    <div className="bg-brand-orange text-white text-xs font-bold px-3 py-1 rounded-full">
                      {product.interestRate}% {locale === 'hi' ? 'प्रति वर्ष' : 'p.a.'}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    {product.heroSubtext}
                  </p>
                  <div className="flex items-center text-brand-orange font-medium text-sm group-hover:gap-3 gap-2 transition-all">
                    {t('cta.applyNow')} <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Medium Priority */}
          <div className="mb-12">
            <h3 className="text-lg font-semibold text-brand-navy mb-6">
              {locale === 'hi' ? 'सुरक्षित लोन' : 'Secured Loans'}
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {mediumPriority.map((product) => (
                <Link
                  key={product.slug}
                  href={`/${product.slug}`}
                  className="group bg-white border border-gray-200 rounded-xl p-5 hover:border-brand-orange hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold text-brand-navy group-hover:text-brand-orange transition-colors">
                      {product.displayName}
                    </h4>
                    <span className="text-xs text-brand-orange font-medium">
                      {product.interestRate}%
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                    {product.targetAudience}
                  </p>
                  <div className="flex items-center text-brand-orange text-sm font-medium group-hover:gap-2 gap-1 transition-all">
                    {t('cta.knowMore')} <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Standard Priority */}
          <div>
            <h3 className="text-lg font-semibold text-brand-navy mb-6">
              {locale === 'hi' ? 'और लोन विकल्प' : 'More Loan Options'}
            </h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-4">
              {standardPriority.map((product) => (
                <Link
                  key={product.slug}
                  href={`/${product.slug}`}
                  className="group bg-gray-50 border border-gray-100 rounded-lg p-4 hover:bg-brand-orange-light hover:border-brand-orange/30 transition-all text-center"
                >
                  <h4 className="font-medium text-brand-navy text-sm group-hover:text-brand-orange transition-colors">
                    {product.displayName}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {locale === 'hi' ? `${product.interestRate}% से` : `From ${product.interestRate}%`}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-brand-navy mb-4">
              {locale === 'hi' ? 'Credifin क्यों चुनें?' : 'Why Choose Credifin?'}
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                icon: <Zap className="h-8 w-8" />,
                title: locale === 'hi' ? 'तुरंत स्वीकृति' : 'Instant Approval',
                desc: locale === 'hi' 
                  ? 'कम दस्तावेज़ों के साथ 24 घंटे में लोन स्वीकृति पाएं'
                  : 'Get loan approval within 24 hours with minimal documentation',
              },
              {
                icon: <IndianRupee className="h-8 w-8" />,
                title: locale === 'hi' ? 'सबसे कम दरें' : 'Lowest Rates',
                desc: locale === 'hi'
                  ? '8.5% प्रति वर्ष से शुरू प्रतिस्पर्धी ब्याज दरें'
                  : 'Competitive interest rates starting from 8.5% p.a.',
              },
              {
                icon: <Shield className="h-8 w-8" />,
                title: locale === 'hi' ? '100% सुरक्षित' : '100% Secure',
                desc: locale === 'hi'
                  ? 'आपकी व्यक्तिगत जानकारी के लिए बैंक-ग्रेड सुरक्षा'
                  : 'Bank-grade security for your personal information',
              },
              {
                icon: <Clock className="h-8 w-8" />,
                title: locale === 'hi' ? 'त्वरित वितरण' : 'Quick Disbursement',
                desc: locale === 'hi'
                  ? 'स्वीकृति के 48 घंटे के भीतर आपके खाते में पैसा'
                  : 'Get funds in your account within 48 hours of approval',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 text-center shadow-sm"
              >
                <div className="w-16 h-16 bg-brand-orange-light rounded-full flex items-center justify-center mx-auto mb-4 text-brand-orange">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-brand-navy mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
