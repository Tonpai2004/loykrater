'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LoyKraTerLogo } from '@/components/home/LoyKraTerLogo';
import { useLanguage } from '@/contexts/LanguageContext';
import { keepThaiPhrases } from '@/lib/thaiText';

interface HomeLandingOverlayProps {
  onEnterPier: () => void;
  onOpenHowToPlay: () => void;
  onOpenLore: () => void;
}

export const HomeLandingOverlay: React.FC<HomeLandingOverlayProps> = ({
  onEnterPier,
  onOpenHowToPlay,
  onOpenLore,
}) => {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="lk-enter [--lk-enter-dur:0.45s] pointer-events-none flex flex-1 flex-col items-center justify-center py-2 sm:px-4 sm:py-4"
    >
      <div className="pointer-events-auto relative flex w-full max-w-md flex-col items-center sm:max-w-[34rem]">
        <div className="pointer-events-none absolute -inset-10 -z-10 rounded-full bg-radial from-[#0B0E17]/75 via-[#0B0E17]/35 to-transparent blur-2xl" />

        <LoyKraTerLogo />

        <motion.div
          className="lk-enter [--lk-enter-delay:0.36s] [--lk-enter-scale:0.4_1] my-[clamp(0.6rem,2.2dvh,1.25rem)] flex w-56 items-center gap-3 sm:w-80 [@media(max-height:440px)]:my-2.5"
        >
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-[#F4D06F]" />
          <span className="h-2 w-2 rotate-45 border border-[#F4D06F] bg-[#D4AF37]/40" />
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#D4AF37]/60 to-[#F4D06F]" />
        </motion.div>

        <motion.button
          type="button"
          onClick={onEnterPier}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="lk-enter [--lk-enter-delay:0.4s] [--lk-enter-y:14px] thai-chamfer group relative w-full cursor-pointer overflow-hidden border-2 border-[#FFF275] bg-gradient-to-r from-[#F4D06F] via-[#FF8C42] to-[#F4D06F] px-4 py-[clamp(0.6rem,1.8dvh,1rem)] text-[#0D1321] shadow-[0_12px_36px_rgba(244,208,111,0.38)] transition-all hover:shadow-[0_16px_46px_rgba(244,208,111,0.55)] sm:px-7"
        >
          <span className="pointer-events-none absolute inset-1 border border-[#0D1321]/25" />
          <div className="relative flex items-center justify-center gap-3">
            <svg
              viewBox="0 0 28 28"
              className="hidden h-6 w-6 shrink-0 transition-transform duration-300 group-hover:scale-110 min-[400px]:block"
              fill="none"
            >
              <path d="M14 4 L18 14 L10 14 Z" fill="#0D1321" />
              <path d="M9 7 L14 15 L6 15 Z" fill="#0D1321" fillOpacity="0.8" />
              <path
                d="M19 7 L22 15 L14 15 Z"
                fill="#0D1321"
                fillOpacity="0.8"
              />
              <path d="M4 16 L24 16 L21 20 L7 20 Z" fill="#0D1321" />
              <path
                d="M4 23 Q14 25.5 24 23"
                stroke="#0D1321"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <div className="text-left">
              <div className="font-display text-base font-semibold tracking-wide whitespace-nowrap sm:text-xl">
                {keepThaiPhrases(t.home.enterPierTitle)}
              </div>
              <div className="font-heading text-[clamp(0.6rem,2.7vw,0.6875rem)] font-medium whitespace-nowrap text-[#0D1321]/80">
                {keepThaiPhrases(t.home.enterPierSub)}
              </div>
            </div>
          </div>
        </motion.button>

        <motion.div
          className="lk-enter [--lk-enter-delay:0.48s] [--lk-enter-y:16px] mt-3 grid w-full grid-cols-1 gap-2.5 sm:mt-3.5 sm:grid-cols-2 sm:gap-3"
        >
          <button
            type="button"
            onClick={onOpenHowToPlay}
            className="thai-chamfer-sm group relative flex cursor-pointer items-center gap-3 border border-[#C5A059]/70 bg-[#0E0C0A]/90 px-3.5 py-2.5 text-left transition-all hover:border-[#FFF275] hover:bg-[#181410]/95 hover:shadow-[0_8px_24px_rgba(212,175,55,0.24)] sm:px-4 sm:py-3"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-[#C5A059]/55 bg-[#C5A059]/10 text-[#F4D06F] transition-transform group-hover:scale-105">
              <svg viewBox="0 0 28 28" className="h-5 w-5" fill="none">
                <path
                  d="M3 7 L10 5 L18 7 L25 5 L25 21 L18 23 L10 21 L3 23 Z"
                  stroke="#F4D06F"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
                <line
                  x1="10"
                  y1="5"
                  x2="10"
                  y2="21"
                  stroke="#C5A059"
                  strokeWidth="1.2"
                />
                <line
                  x1="18"
                  y1="7"
                  x2="18"
                  y2="23"
                  stroke="#C5A059"
                  strokeWidth="1.2"
                />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-display text-sm font-medium whitespace-nowrap text-[#FFF275] group-hover:text-[#FFFDF7]">
                {keepThaiPhrases(t.home.howToPlayTitle)}
              </div>
              <div className="font-heading text-[11px] whitespace-nowrap text-[#FFFDF7]/70">
                {keepThaiPhrases(t.home.howToPlaySub)}
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={onOpenLore}
            className="thai-chamfer-sm group relative flex cursor-pointer items-center gap-3 border border-[#C5A059]/50 bg-[#0E0C0A]/92 px-3.5 py-2.5 text-left transition-all hover:border-[#F4D06F] hover:bg-[#181410]/95 hover:shadow-[0_8px_24px_rgba(212,175,55,0.18)] sm:px-4 sm:py-3"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-[#C5A059]/45 bg-[#C5A059]/10 text-[#F4D06F] transition-transform group-hover:scale-105">
              <svg viewBox="0 0 28 28" className="h-5 w-5" fill="none">
                <rect
                  x="4"
                  y="6"
                  width="20"
                  height="16"
                  stroke="#F4D06F"
                  strokeWidth="1.5"
                />
                <line
                  x1="8"
                  y1="11"
                  x2="20"
                  y2="11"
                  stroke="#C5A059"
                  strokeWidth="1.2"
                />
                <line
                  x1="8"
                  y1="15"
                  x2="16"
                  y2="15"
                  stroke="#C5A059"
                  strokeWidth="1.2"
                />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-display text-sm font-medium whitespace-nowrap text-[#F4D06F] group-hover:text-[#FFF275]">
                {keepThaiPhrases(t.home.loreTitle)}
              </div>
              <div className="font-heading text-[11px] whitespace-nowrap text-[#FFFDF7]/70">
                {keepThaiPhrases(t.home.loreSub)}
              </div>
            </div>
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};
