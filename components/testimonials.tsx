"use client";

import { Star, Quote } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface Testimonial {
  name: string;
  location: string;
  loanType: string;
  amount: string;
  rating: number;
  text: string;
  avatar?: string;
}

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    name: "Ramesh Kumar",
    location: "Delhi",
    loanType: "E-Rickshaw Loan",
    amount: "₹1,50,000",
    rating: 5,
    text: "Bohot fast approval mila! Sirf 2 din mein paisa account mein aa gaya. Ab daily ₹800 kama raha hoon.",
  },
  {
    name: "Sunita Devi",
    location: "Lucknow",
    loanType: "Two-Wheeler Loan",
    amount: "₹85,000",
    rating: 5,
    text: "Documents bahut kam the. Aadhar aur PAN se kaam ho gaya. Staff ne ghar aake documents le liye.",
  },
  {
    name: "Mohammad Irfan",
    location: "Mumbai",
    loanType: "Used Car Loan",
    amount: "₹3,50,000",
    rating: 5,
    text: "Interest rate sabse kam mila yahan pe. Bank ne mana kar diya tha, Credifin ne same day approve kiya.",
  },
  {
    name: "Priya Sharma",
    location: "Jaipur",
    loanType: "Personal Loan",
    amount: "₹2,00,000",
    rating: 4,
    text: "Emergency mein paise chahiye the. Online apply kiya, 3 ghante mein call aayi aur next day loan mil gaya.",
  },
  {
    name: "Vijay Yadav",
    location: "Patna",
    loanType: "Business Loan",
    amount: "₹5,00,000",
    rating: 5,
    text: "Apni dukaan ke liye loan liya. No collateral required. EMI bhi comfortable hai monthly.",
  },
  {
    name: "Lakshmi Narayanan",
    location: "Chennai",
    loanType: "Home Loan",
    amount: "₹25,00,000",
    rating: 5,
    text: "First time home buyer ke liye special rate mila. Processing fee bhi kam thi. Very professional service.",
  },
];

interface TestimonialsProps {
  testimonials?: Testimonial[];
  title?: string;
  subtitle?: string;
}

export function Testimonials({
  testimonials = DEFAULT_TESTIMONIALS,
  title,
  subtitle,
}: TestimonialsProps) {
  const { t } = useTranslation();
  const displayTitle = title || t('testimonials.happyCustomers');
  const displaySubtitle = subtitle || t('testimonials.subtitle');

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {displayTitle}
          </h2>
          <p className="text-gray-600">{displaySubtitle}</p>
          
          {/* Overall Rating */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="w-5 h-5 text-yellow-400 fill-yellow-400"
                />
              ))}
            </div>
            <span className="font-semibold text-gray-900">4.8/5</span>
            <span className="text-gray-500">(12,500+ reviews)</span>
          </div>
        </div>

        {/* Testimonial Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.slice(0, 6).map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} />
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span className="text-green-600">✓</span> {t('trust.rbiRegistered')}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600">✓</span> ISO 27001 {t('common.verified')}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600">✓</span> 100% {t('common.secure')}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600">✓</span> 500+ Cities
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      {/* Quote Icon */}
      <Quote className="w-8 h-8 text-brand-orange/20 mb-4" />

      {/* Text */}
      <p className="text-gray-700 mb-4 leading-relaxed">"{testimonial.text}"</p>

      {/* Rating */}
      <div className="flex mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= testimonial.rating
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-200"
            }`}
          />
        ))}
      </div>

      {/* Author */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-brand-orange/10 flex items-center justify-center">
          <span className="text-brand-orange font-semibold">
            {testimonial.name.charAt(0)}
          </span>
        </div>
        
        <div>
          <p className="font-medium text-gray-900">{testimonial.name}</p>
          <p className="text-sm text-gray-500">
            {testimonial.loanType} • {testimonial.location}
          </p>
        </div>
      </div>

      {/* Loan Amount Badge */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <span className="text-xs text-gray-500">Loan Amount:</span>
        <span className="ml-2 text-sm font-semibold text-green-600">
          {testimonial.amount}
        </span>
      </div>
    </div>
  );
}

/**
 * Compact testimonial strip for landing pages
 */
export function TestimonialStrip() {
  const { t } = useTranslation();
  
  return (
    <div className="bg-brand-navy text-white py-3">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-6 flex-wrap text-sm">
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="w-4 h-4 text-yellow-400 fill-yellow-400"
                />
              ))}
            </div>
            <span className="font-semibold">4.8/5</span>
          </div>
          <span className="hidden md:inline">|</span>
          <span>{t('trust.happyCustomers')}</span>
          <span className="hidden md:inline">|</span>
          <span>{t('trust.rbiRegistered')}</span>
        </div>
      </div>
    </div>
  );
}
