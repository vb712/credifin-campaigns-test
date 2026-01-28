'use client';

import { useTranslation, Locale } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale } = useTranslation();

  const handleToggle = (newLocale: Locale) => {
    setLocale(newLocale);
  };

  return (
    <div className={cn(
      "inline-flex items-center rounded-full bg-gray-100 p-1 text-sm font-medium",
      className
    )}>
      <button
        onClick={() => handleToggle('en')}
        className={cn(
          "px-3 py-1.5 rounded-full transition-all duration-200 ease-in-out",
          locale === 'en'
            ? "bg-white text-primary shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        )}
        aria-label="Switch to English"
      >
        EN
      </button>
      <button
        onClick={() => handleToggle('hi')}
        className={cn(
          "px-3 py-1.5 rounded-full transition-all duration-200 ease-in-out",
          locale === 'hi'
            ? "bg-white text-primary shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        )}
        aria-label="हिंदी में बदलें"
      >
        हिंदी
      </button>
    </div>
  );
}

// Compact version for mobile
export function LanguageToggleCompact({ className }: { className?: string }) {
  const { locale, setLocale } = useTranslation();

  const toggleLanguage = () => {
    setLocale(locale === 'en' ? 'hi' : 'en');
  };

  return (
    <button
      onClick={toggleLanguage}
      className={cn(
        "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium",
        "bg-primary/10 text-primary hover:bg-primary/20 transition-colors",
        className
      )}
      aria-label={locale === 'en' ? 'हिंदी में बदलें' : 'Switch to English'}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
      {locale === 'en' ? 'हिंदी' : 'EN'}
    </button>
  );
}
