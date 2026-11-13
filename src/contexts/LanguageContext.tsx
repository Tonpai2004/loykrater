'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
} from 'react';
import { Locale, translations } from '@/constants/translations';

const STORAGE_KEY = 'loykrater_locale_v1';
const DEFAULT_LOCALE: Locale = 'th';

// Tiny external store: in-memory choice first (works even when storage is blocked), then the saved choice
let memoryLocale: Locale | null = null;
const listeners = new Set<() => void>();

function readLocale(): Locale {
  if (memoryLocale) return memoryLocale;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'th' || saved === 'en') return saved;
  } catch {
    // Storage blocked, fall through to default
  }
  return DEFAULT_LOCALE;
}

function writeLocale(next: Locale) {
  memoryLocale = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Ignore storage errors
  }
  listeners.forEach((notify) => notify());
}

function subscribe(notify: () => void) {
  listeners.add(notify);
  return () => {
    listeners.delete(notify);
  };
}

interface LanguageContextValue {
  locale: Locale;
  setLocale: (next: Locale) => void;
  toggleLocale: () => void;
  t: (typeof translations)[Locale];
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  toggleLocale: () => {},
  t: translations[DEFAULT_LOCALE],
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Server render is always Thai; the client then picks up the visitor's saved choice
  const locale = useSyncExternalStore(subscribe, readLocale, () => DEFAULT_LOCALE);

  // Tab title & <html lang> follow the chosen language (server HTML ships the Thai title)
  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = translations[locale].meta.title;
  }, [locale]);

  const toggleLocale = useCallback(() => {
    writeLocale(locale === 'th' ? 'en' : 'th');
  }, [locale]);

  return (
    <LanguageContext.Provider
      value={{
        locale,
        setLocale: writeLocale,
        toggleLocale,
        t: translations[locale],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}
