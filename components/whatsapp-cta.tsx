"use client";

import { MessageCircle } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface WhatsAppCTAProps {
  phoneNumber?: string;
  message?: string;
  productName?: string;
  city?: string;
}

export function WhatsAppCTA({
  phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "918800123456",
  message,
  productName,
  city,
}: WhatsAppCTAProps) {
  const { t } = useTranslation();
  const defaultMessage = productName
    ? `Hi, I'm interested in ${productName}${city ? ` in ${city}` : ""}. Please share more details.`
    : "Hi, I'm interested in getting a loan. Please help me with the details.";

  const finalMessage = message || defaultMessage;
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(finalMessage)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-40 group"
      aria-label="Chat on WhatsApp"
    >
      <div className="relative">
        {/* Pulse animation */}
        <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-25" />
        
        {/* Button */}
        <div className="relative flex items-center justify-center w-14 h-14 bg-green-500 rounded-full shadow-lg hover:bg-green-600 transition-all duration-300 hover:scale-110">
          <MessageCircle className="w-7 h-7 text-white" fill="white" />
        </div>

        {/* Tooltip */}
        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-white text-gray-800 px-3 py-2 rounded-lg shadow-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          {t('cta.chatNow')}
          <div className="absolute left-full top-1/2 -translate-y-1/2 border-8 border-transparent border-l-white" />
        </div>
      </div>
    </a>
  );
}
