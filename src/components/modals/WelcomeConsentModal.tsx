'use client';

import React, { useEffect, useRef, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatLines, HardDrive, ShieldCheck, VideoCamera } from 'iconoir-react';
import { useLanguage } from '@/contexts/LanguageContext';

const CONSENT_STORAGE_KEY = 'loykrater_consent_v1';

// Same tiny external-store pattern as LanguageContext: in-memory first so accepting
// still works for this visit when storage is blocked
let memoryAccepted = false;
const listeners = new Set<() => void>();

function readAccepted(): boolean {
  if (memoryAccepted) return true;
  try {
    return window.localStorage.getItem(CONSENT_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function acceptConsent() {
  memoryAccepted = true;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, '1');
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

const ITEM_ICONS = [VideoCamera, ChatLines, ShieldCheck, HardDrive];

// Shown once per browser before anything else; it only mounts after hydration,
// so the server-rendered home copy paints untouched underneath
export const WelcomeConsentModal: React.FC = () => {
  const { locale, setLocale, t } = useLanguage();
  // Server snapshot says "accepted" so nothing renders until the client knows better
  const accepted = useSyncExternalStore(subscribe, readAccepted, () => true);
  const acceptRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!accepted) acceptRef.current?.focus({ preventScroll: true });
  }, [accepted]);

  return (
    <AnimatePresence>
      {!accepted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="pointer-events-auto fixed inset-0 z-[70] flex items-center justify-center bg-[#060810]/88 p-2.5 backdrop-blur-md sm:p-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 48, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 36, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="consent-title"
            className="thai-chamfer relative flex max-h-[calc(100dvh-1.25rem)] w-full max-w-2xl flex-col overflow-hidden border border-[#D4AF37]/60 bg-[#0E1222] text-[#FFFDF7] shadow-[0_30px_90px_rgba(0,0,0,0.92),0_18px_50px_rgba(244,208,111,0.18)] [zoom:var(--ui-zoom,1)] sm:max-h-[calc(min(92dvh,50rem)/var(--ui-zoom,1))]"
          >
            <div className="pointer-events-none absolute inset-1.5 border border-[#D4AF37]/20" />

            <div className="relative flex items-start justify-between gap-3 border-b border-[#D4AF37]/35 bg-[#080B14] px-4 py-3.5 sm:px-7 sm:py-5">
              <div className="flex min-w-0 items-center gap-3.5">
                <div className="hidden h-10 w-10 shrink-0 items-center justify-center border border-[#D4AF37]/70 bg-[#0B0E17] sm:flex">
                  <span className="h-2.5 w-2.5 rotate-45 bg-[#F4D06F] shadow-[0_0_12px_rgba(244,208,111,0.7)]" />
                </div>
                <div className="min-w-0">
                  <p className="font-heading text-[11px] font-medium tracking-wider text-[#F4D06F]">
                    {t.consent.headerTag}
                  </p>
                  <h2
                    id="consent-title"
                    className="font-display mt-0.5 text-lg leading-snug text-balance text-[#FFF275] sm:text-2xl"
                  >
                    {t.consent.title}
                  </h2>
                </div>
              </div>

              <div
                role="group"
                aria-label="Language switcher"
                className="thai-chamfer-sm flex shrink-0 items-center border border-[#D4AF37]/55 bg-[#0B0E17]/92 p-1"
              >
                {(['th', 'en'] as const).map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setLocale(code)}
                    aria-pressed={locale === code}
                    className={`cursor-pointer px-2 py-1 text-xs font-semibold tracking-wider whitespace-nowrap transition-all sm:px-2.5 ${
                      locale === code
                        ? 'bg-[#D4AF37] text-[#0B0E17] shadow-[0_0_12px_rgba(244,208,111,0.35)]'
                        : 'text-[#FFFDF7]/65 hover:text-[#FFF275]'
                    }`}
                  >
                    {code === 'th' ? 'ไทย' : 'EN'}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[linear-gradient(160deg,rgba(24,30,58,0.98)_0%,rgba(13,17,34,0.99)_100%)] px-4 py-4 sm:px-7 sm:py-6">
              <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
                {t.consent.items.map((item, i) => {
                  const Icon = ITEM_ICONS[i % ITEM_ICONS.length];
                  return (
                    <li
                      key={item.title}
                      className="flex gap-3 border border-[#D4AF37]/30 border-l-2 border-l-[#F4D06F] bg-[#080B14]/85 p-3"
                    >
                      <span className="thai-chamfer-sm flex h-9 w-9 shrink-0 items-center justify-center border border-[#D4AF37]/50 bg-[#12172B] text-[#F4D06F]">
                        <Icon width={17} height={17} strokeWidth={1.7} />
                      </span>
                      <div className="min-w-0">
                        <p className="font-display text-sm leading-snug text-[#FFF275]">
                          {item.title}
                        </p>
                        <p className="font-heading mt-1 text-[11px] leading-relaxed text-pretty text-[#FFFDF7]/75 sm:text-xs">
                          {item.body}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="relative flex flex-col items-center gap-2 border-t border-[#D4AF37]/30 bg-[#080B14] px-4 py-3.5 sm:px-7 sm:py-4">
              <button
                ref={acceptRef}
                type="button"
                onClick={acceptConsent}
                className="thai-chamfer-sm font-heading flex w-full cursor-pointer items-center justify-center gap-2 border border-[#FFF275]/60 bg-[#D4AF37] px-4 py-3 text-sm font-semibold whitespace-nowrap text-[#0B0E17] transition-colors hover:bg-[#FFF275] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFF275] sm:w-auto sm:min-w-72"
              >
                <span className="h-2 w-2 rotate-45 bg-[#0B0E17]" />
                <span>{t.consent.acceptBtn}</span>
              </button>
              <p className="font-heading text-center text-[10px] text-pretty text-[#FFFDF7]/55">
                {t.consent.footnote}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
