"use client";

import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin } from "lucide-react";
import { LanguageToggle, LanguageToggleCompact } from "./language-toggle";
import { useTranslation } from "@/lib/i18n";

export function Header() {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="Credifin"
              width={140}
              height={40}
              className="h-8 md:h-10 w-auto"
              priority
            />
          </Link>

          {/* Contact & Language Toggle - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageToggle />
            <a
              href="tel:+918000000000"
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-brand-orange transition-colors"
            >
              <Phone className="h-4 w-4" />
              <span>1800-XXX-XXXX</span>
            </a>
          </div>

          {/* Mobile: Language Toggle & Call */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageToggleCompact />
            <a
              href="tel:+918000000000"
              className="p-2 bg-brand-orange/10 rounded-lg text-brand-orange"
            >
              <Phone className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-navy text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="mb-4">
              <Image
                src="/logo.png"
                alt="Credifin"
                width={140}
                height={40}
                className="h-8 md:h-10 w-auto brightness-0 invert"
              />
            </div>
            <p className="text-white/70 text-sm max-w-sm mb-4">
              {t('footer.aboutUsDesc')}
            </p>
            <div className="flex items-center gap-2 text-sm text-white/70">
              <MapPin className="h-4 w-4" />
              <span>India</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">{t('footer.loanProducts')}</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <Link href="/e-rickshaw-loan" className="hover:text-brand-orange transition-colors">
                  {t('products.eRickshawLoan')}
                </Link>
              </li>
              <li>
                <Link href="/ev-two-wheeler-loan" className="hover:text-brand-orange transition-colors">
                  {t('products.evTwoWheelerLoan')}
                </Link>
              </li>
              <li>
                <Link href="/home-loan" className="hover:text-brand-orange transition-colors">
                  {t('products.homeLoan')}
                </Link>
              </li>
              <li>
                <Link href="/business-loan" className="hover:text-brand-orange transition-colors">
                  {t('products.businessLoan')}
                </Link>
              </li>
              <li>
                <Link href="/personal-loan" className="hover:text-brand-orange transition-colors">
                  {t('products.personalLoan')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">{t('footer.contactUs')}</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li>
                <a
                  href="tel:+918000000000"
                  className="flex items-center gap-2 hover:text-brand-orange transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  1800-XXX-XXXX (Toll Free)
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@credifin.in"
                  className="flex items-center gap-2 hover:text-brand-orange transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  support@credifin.in
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/50">
          <p>{t('footer.copyright')}</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">
              {t('footer.privacyPolicy')}
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              {t('footer.termsConditions')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
