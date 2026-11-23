'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HomeSimpleDoor, ShareAndroid } from 'iconoir-react';
import { AudioVolumeController } from '@/components/AudioVolumeController';
import { useLanguage } from '@/contexts/LanguageContext';
import { GameState } from '@/types/krathong';
import { keepThaiPhrases } from '@/lib/thaiText';

interface TopBarControlsProps {
  gameState: GameState;
  onGoHome: () => void;
  onOpenHowToPlay: () => void;
  onOpenInvite: () => void;
}

export const TopBarControls: React.FC<TopBarControlsProps> = ({
  gameState,
  onGoHome,
  onOpenHowToPlay,
  onOpenInvite,
}) => {
  const { locale, setLocale, t } = useLanguage();
  const isAtPier = gameState !== 'HOME';

  return (
    <header className="flex w-full shrink-0 items-center justify-between gap-2 sm:gap-3">
      <div className="pointer-events-auto flex items-center gap-2">
        <AnimatePresence>
          {isAtPier && (
            <motion.div
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -14 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-2"
            >
              <button
                type="button"
                onClick={onGoHome}
                aria-label={t.nav.home}
                title={t.nav.home}
                className="thai-chamfer-sm flex h-9 cursor-pointer items-center gap-1.5 border border-[#D4AF37]/45 bg-[#0B0E17]/92 px-2.5 text-xs font-medium whitespace-nowrap text-[#FFFDF7]/90 shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-colors hover:border-[#F4D06F] hover:text-[#FFF275] sm:px-3"
              >
                <HomeSimpleDoor
                  width={15}
                  height={15}
                  className="text-[#F4D06F]"
                />
                <span className="hidden sm:inline">{keepThaiPhrases(t.nav.home)}</span>
              </button>

              <button
                type="button"
                onClick={onOpenHowToPlay}
                aria-label={t.nav.guide}
                title={t.nav.guide}
                className="thai-chamfer-sm flex h-9 cursor-pointer items-center gap-1.5 border border-[#D4AF37]/45 bg-[#0B0E17]/92 px-2.5 text-xs font-medium whitespace-nowrap text-[#F4D06F] shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-colors hover:border-[#FFF275] hover:text-[#FFF275] sm:px-3"
              >
                <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none">
                  <path
                    d="M2 5 L7 3.5 L13 5 L18 3.5 L18 15 L13 16.5 L7 15 L2 16.5 Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <line
                    x1="7"
                    y1="3.5"
                    x2="7"
                    y2="15"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                  <line
                    x1="13"
                    y1="5"
                    x2="13"
                    y2="16.5"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                </svg>
                <span className="hidden min-[420px]:inline">{keepThaiPhrases(t.nav.guide)}</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="pointer-events-auto flex items-center gap-2 sm:gap-2.5">
        <button
          type="button"
          onClick={onOpenInvite}
          aria-label={t.nav.invite}
          title={t.nav.invite}
          className="thai-chamfer-sm flex h-9 cursor-pointer items-center gap-1.5 border border-[#D4AF37]/45 bg-[#0B0E17]/92 px-2.5 text-xs font-medium whitespace-nowrap text-[#F4D06F] shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-colors hover:border-[#FFF275] hover:text-[#FFF275] sm:px-3"
        >
          <ShareAndroid width={15} height={15} strokeWidth={1.8} />
          <span className="hidden md:inline">{keepThaiPhrases(t.nav.invite)}</span>
        </button>

        <div
          role="group"
          aria-label="Language switcher"
          className="thai-chamfer-sm flex h-9 items-center border border-[#D4AF37]/55 bg-[#0B0E17]/92 p-1 shadow-[0_14px_34px_rgba(0,0,0,0.75)] sm:h-auto"
        >
          <button
            type="button"
            onClick={() => setLocale('th')}
            className={`h-full cursor-pointer px-2 text-xs font-semibold tracking-wider whitespace-nowrap transition-all sm:px-2.5 sm:py-1.5 ${
              locale === 'th'
                ? 'bg-[#D4AF37] text-[#0B0E17] shadow-[0_0_12px_rgba(244,208,111,0.35)]'
                : 'text-[#FFFDF7]/65 hover:text-[#FFF275]'
            }`}
          >
            ไทย
          </button>
          <button
            type="button"
            onClick={() => setLocale('en')}
            className={`h-full cursor-pointer px-2 text-xs font-semibold tracking-wider whitespace-nowrap transition-all sm:px-2.5 sm:py-1.5 ${
              locale === 'en'
                ? 'bg-[#D4AF37] text-[#0B0E17] shadow-[0_0_12px_rgba(244,208,111,0.35)]'
                : 'text-[#FFFDF7]/65 hover:text-[#FFF275]'
            }`}
          >
            EN
          </button>
        </div>

        <AudioVolumeController />
      </div>
    </header>
  );
};
