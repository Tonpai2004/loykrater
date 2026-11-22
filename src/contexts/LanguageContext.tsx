'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
} from 'react';
import { usePathname } from 'next/navigation';
import { Locale, translations } from '@/constants/translations';

const STORAGE_KEY = 'loykrater_locale_v1';
const DEFAULT_LOCALE: Locale = 'th';

let memoryLocale: Locale | null = null;
const listeners = new Set<() => void>();

function readLocale(): Locale {
  if (memoryLocale) return memoryLocale;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'th' || saved === 'en') return saved;
  } catch {
    // Fall through to default when storage is unavailable
  }
  return DEFAULT_LOCALE;
}

function writeLocale(next: Locale) {
  memoryLocale = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Ignore storage write errors
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
  const locale = useSyncExternalStore(
    subscribe,
    readLocale,
    () => DEFAULT_LOCALE
  );

  const pathname = usePathname();

  // Only the home experience is bilingual; other pages (e.g. /loy-krathong) keep their own Thai title and lang
  useEffect(() => {
    if (pathname !== '/') {
      document.documentElement.lang = DEFAULT_LOCALE;
      return;
    }
    document.documentElement.lang = locale;
    document.title = translations[locale].meta.title;
  }, [locale, pathname]);

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
