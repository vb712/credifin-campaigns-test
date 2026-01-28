'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { en } from './translations/en';
import { hi } from './translations/hi';

export type Locale = 'en' | 'hi';

type TranslationKeys = typeof en;

const translations: Record<Locale, TranslationKeys> = { en, hi };

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

// Default translation function for SSR
const defaultT = (key: string, params?: Record<string, string | number>): string => {
  const keys = key.split('.');
  let value: any = translations.en;
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  if (typeof value !== 'string') return key;
  
  if (params) {
    return value.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? `{${k}}`));
  }
  
  return value;
};

const defaultContext: I18nContextType = {
  locale: 'en',
  setLocale: () => {},
  t: defaultT,
};

const I18nContext = createContext<I18nContextType>(defaultContext);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('credifin-lang') as Locale;
    if (stored && (stored === 'en' || stored === 'hi')) {
      setLocaleState(stored);
    } else {
      // Detect Hindi preference from browser
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith('hi')) {
        setLocaleState('hi');
        localStorage.setItem('credifin-lang', 'hi');
      }
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('credifin-lang', newLocale);
    document.documentElement.lang = newLocale;
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = translations[locale];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    if (typeof value !== 'string') {
      // Fallback to English
      value = keys.reduce((obj: any, k) => obj?.[k], translations.en);
    }
    
    if (typeof value !== 'string') return key;
    
    if (params) {
      return value.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? `{${k}}`));
    }
    
    return value;
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  // Return default context if not within provider (SSR)
  return context;
}

export function useLocale(): Locale {
  const context = useContext(I18nContext);
  return context?.locale ?? 'en';
}
