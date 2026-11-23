'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Xmark, NavArrowLeft, NavArrowRight } from 'iconoir-react';
import { InteractiveTutorialSandbox } from '@/components/modals/InteractiveTutorialSandbox';
import { useLanguage } from '@/contexts/LanguageContext';
import { HandGestureState } from '@/types/krathong';
import { keepThaiPhrases } from '@/lib/thaiText';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnterPier?: () => void;
  videoRef: React.RefCallback<HTMLVideoElement>;
  gestureState: HandGestureState;
  gestureRef: React.RefObject<HandGestureState>;
  cameraEnabled: boolean;
  onToggleCamera: () => void;
  onPracticeActiveChange?: (active: boolean) => void;
}

type FolioId = 'gestures' | 'practice' | 'craft';

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({
  isOpen,
  onClose,
  onEnterPier,
  videoRef,
  gestureState,
  gestureRef,
  cameraEnabled,
  onToggleCamera,
  onPracticeActiveChange,
}) => {
  const { t } = useLanguage();
  const hp = t.howToPlay;

  const [activeFolio, setActiveFolio] = useState<FolioId>('gestures');

  useEffect(() => {
    onPracticeActiveChange?.(isOpen && activeFolio === 'practice');
  }, [isOpen, activeFolio, onPracticeActiveChange]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const folios: {
    id: FolioId;
    num: string;
    title: string;
    short: string;
    sub: string;
  }[] = [
    {
      id: 'gestures',
      num: hp.tabs.gestures.num,
      title: hp.tabs.gestures.title,
      short: hp.tabs.gestures.short,
      sub: hp.tabs.gestures.sub,
    },
    {
      id: 'practice',
      num: hp.tabs.practice.num,
      title: hp.tabs.practice.title,
      short: hp.tabs.practice.short,
      sub: hp.tabs.practice.sub,
    },
    {
      id: 'craft',
      num: hp.tabs.craft.num,
      title: hp.tabs.craft.title,
      short: hp.tabs.craft.short,
      sub: hp.tabs.craft.sub,
    },
  ];

  const currentIdx = folios.findIndex((f) => f.id === activeFolio);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#05060B]/88 p-2.5 backdrop-blur-md sm:p-6 [@media(max-height:500px)]:p-2!"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 32, scaleY: 0.92 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: 24, scaleY: 0.94 }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="thai-chamfer relative flex h-[calc(100dvh-1.25rem)] w-full max-w-3xl flex-col overflow-hidden border border-[#C5A059] bg-[#0D0B09] text-[#F5EFE4] shadow-[0_32px_90px_rgba(0,0,0,0.92)] [zoom:var(--ui-zoom,1)] sm:h-[calc(min(90dvh,56rem)/var(--ui-zoom,1))] lg:max-w-4xl [@media(max-height:500px)]:h-[calc(100dvh-1rem)]!"
          >
            <div className="pointer-events-none absolute inset-1.5 border border-[#C5A059]/30" />

            <div className="relative flex items-center justify-between gap-3 border-b border-[#C5A059]/45 bg-gradient-to-r from-[#14100C] via-[#1C1610] to-[#14100C] px-4 py-3 sm:px-7 sm:py-4 [@media(max-height:500px)]:py-1.5!">
              <div className="flex min-w-0 items-center gap-3.5">
                <div className="hidden h-9 w-9 shrink-0 items-center justify-center border border-[#C5A059]/70 bg-[#0D0B09] sm:flex">
                  <span className="h-2.5 w-2.5 rotate-45 bg-[#E6C77B]" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-display truncate text-base font-medium tracking-wider text-[#F4D06F] sm:text-lg">
                    <span className="md:hidden">
                      {keepThaiPhrases(hp.manuscriptHeaderShort)}
                    </span>
                    <span className="hidden md:inline">
                      {keepThaiPhrases(hp.manuscriptHeader)}
                    </span>
                  </h2>
                  <p className="font-editorial hidden truncate text-xs tracking-[0.22em] text-[#C5A059]/80 uppercase sm:block">
                    {hp.manuscriptSub}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center border border-[#C5A059]/45 bg-[#16120E] text-[#E6C77B] transition-colors hover:border-[#FFF275] hover:text-[#FFF275]"
                aria-label="Close"
              >
                <Xmark width={18} height={18} />
              </button>
            </div>

            <div className="grid grid-cols-3 border-b border-[#C5A059]/40 bg-[#120E0B]">
              {folios.map((folio) => {
                const isSelected = folio.id === activeFolio;
                return (
                  <button
                    key={folio.id}
                    type="button"
                    onClick={() => setActiveFolio(folio.id)}
                    className={`min-w-0 cursor-pointer border-r border-[#C5A059]/25 px-2 py-2.5 text-center transition-all last:border-r-0 sm:px-4 sm:py-3 md:px-5 md:text-left [@media(max-height:500px)]:py-1.5! ${
                      isSelected
                        ? 'bg-[#1D1711] shadow-[inset_0_-2px_0_#F4D06F]'
                        : 'bg-transparent opacity-65 hover:bg-[#17120E] hover:opacity-95'
                    }`}
                  >
                    <div className="flex items-baseline justify-center gap-1.5 md:justify-start md:gap-2">
                      <span className="font-editorial text-sm font-semibold text-[#F4D06F]">
                        {folio.num}.
                      </span>
                      <span className="font-display truncate text-[13px] font-medium tracking-wide whitespace-nowrap text-[#FFFDF7] sm:text-sm">
                        <span className="md:hidden">{keepThaiPhrases(folio.short)}</span>
                        <span className="hidden md:inline">{keepThaiPhrases(folio.title)}</span>
                      </span>
                    </div>
                    <div className="font-heading mt-0.5 hidden truncate pl-4 text-[10px] text-[#C5A059] md:block">
                      {folio.sub}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4 sm:px-8 sm:py-6 [&>*]:my-auto [@media(max-height:500px)]:py-3!">
              {activeFolio === 'gestures' && (
                <div className="space-y-6">
                  <div className="border-b border-[#C5A059]/30 pb-4">
                    <h3 className="font-display text-base font-medium tracking-wide text-balance text-[#F4D06F] sm:text-lg">
                      {keepThaiPhrases(hp.gesturesSection.introTitle)}
                    </h3>
                    <p className="font-heading mt-1.5 text-xs leading-relaxed text-[#E6DEC8]/85 sm:text-sm">
                      {keepThaiPhrases(hp.gesturesSection.introDesc)}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4 lg:gap-5">
                    <div className="flex items-center gap-3 border border-[#C5A059]/35 bg-[#13100C] p-3 sm:gap-4 sm:p-4 md:flex-col md:items-stretch md:gap-0">
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center border-r border-[#C5A059]/25 pr-3 sm:h-24 sm:w-28 sm:pr-4 md:mb-3 md:h-28 md:w-auto md:border-r-0 md:border-b md:pr-0 md:pb-3 lg:h-32">
                        <svg
                          viewBox="0 0 130 100"
                          className="h-full w-full"
                          fill="none"
                        >
                          <circle
                            cx="65"
                            cy="50"
                            r="34"
                            stroke="#C5A059"
                            strokeOpacity="0.4"
                            strokeWidth="1"
                            strokeDasharray="3 3"
                          />
                          <path
                            d="M52 68 L47 34 M59 66 L59 26 M67 66 L69 29 M74 68 L80 38 M46 62 L35 48"
                            stroke="#F4D06F"
                            strokeWidth="2.4"
                            strokeLinecap="round"
                          />
                          <polygon
                            points="48,64 74,64 70,78 52,78"
                            stroke="#E6C77B"
                            strokeWidth="1.6"
                            fill="#C5A059"
                            fillOpacity="0.15"
                          />
                          <circle cx="47" cy="34" r="2.5" fill="#FFF275" />
                          <circle cx="59" cy="26" r="2.5" fill="#FFF275" />
                          <circle cx="69" cy="29" r="2.5" fill="#FFF275" />
                          <circle cx="80" cy="38" r="2.5" fill="#FFF275" />
                          <circle cx="35" cy="48" r="2.5" fill="#FFF275" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-display text-sm font-medium whitespace-nowrap text-[#FFF275]">
                          {keepThaiPhrases(hp.gesturesSection.step1Title)}
                        </h4>
                        <p className="font-editorial text-[11px] tracking-[0.18em] text-[#C5A059] uppercase">
                          {keepThaiPhrases(hp.gesturesSection.step1Tag)}
                        </p>
                        <p className="font-heading mt-1 text-xs leading-relaxed text-[#E6DEC8]/80 sm:mt-1.5">
                          {keepThaiPhrases(hp.gesturesSection.step1Desc)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 border border-[#C5A059]/35 bg-[#13100C] p-3 sm:gap-4 sm:p-4 md:flex-col md:items-stretch md:gap-0">
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center border-r border-[#C5A059]/25 pr-3 sm:h-24 sm:w-28 sm:pr-4 md:mb-3 md:h-28 md:w-auto md:border-r-0 md:border-b md:pr-0 md:pb-3 lg:h-32">
                        <svg
                          viewBox="0 0 130 100"
                          className="h-full w-full"
                          fill="none"
                        >
                          <circle
                            cx="60"
                            cy="38"
                            r="16"
                            fill="#F4D06F"
                            fillOpacity="0.18"
                            stroke="#FFF275"
                            strokeWidth="1.4"
                          />
                          <circle cx="60" cy="38" r="4" fill="#FFF275" />
                          <path
                            d="M44 70 Q46 48 59 39"
                            stroke="#FFF275"
                            strokeWidth="2.8"
                            strokeLinecap="round"
                          />
                          <path
                            d="M70 70 Q69 48 61 39"
                            stroke="#FFF275"
                            strokeWidth="2.8"
                            strokeLinecap="round"
                          />
                          <path
                            d="M75 70 L79 36 M80 72 L86 42 M85 74 L92 50"
                            stroke="#C5A059"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                          <path
                            d="M32 45 L32 72 M27 66 L32 72 L37 66"
                            stroke="#FF8C42"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-display text-sm font-medium whitespace-nowrap text-[#FFF275]">
                          {keepThaiPhrases(hp.gesturesSection.step2Title)}
                        </h4>
                        <p className="font-editorial text-[11px] tracking-[0.18em] text-[#C5A059] uppercase">
                          {keepThaiPhrases(hp.gesturesSection.step2Tag)}
                        </p>
                        <p className="font-heading mt-1 text-xs leading-relaxed text-[#E6DEC8]/80 sm:mt-1.5">
                          {keepThaiPhrases(hp.gesturesSection.step2Desc)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 border border-[#C5A059]/35 bg-[#13100C] p-3 sm:gap-4 sm:p-4 md:flex-col md:items-stretch md:gap-0">
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center border-r border-[#C5A059]/25 pr-3 sm:h-24 sm:w-28 sm:pr-4 md:mb-3 md:h-28 md:w-auto md:border-r-0 md:border-b md:pr-0 md:pb-3 lg:h-32">
                        <svg
                          viewBox="0 0 130 100"
                          className="h-full w-full"
                          fill="none"
                        >
                          <ellipse
                            cx="65"
                            cy="64"
                            rx="44"
                            ry="16"
                            fill="#F4D06F"
                            fillOpacity="0.12"
                            stroke="#F4D06F"
                            strokeWidth="1.5"
                            strokeDasharray="5 4"
                          />
                          <path
                            d="M52 44 L40 28 M40 28 L46 28 M40 28 L40 34"
                            stroke="#FFF275"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                          />
                          <path
                            d="M78 44 L90 28 M90 28 L84 28 M90 28 L90 34"
                            stroke="#FFF275"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                          />
                          <path
                            d="M65 44 L73 60 L57 60 Z"
                            fill="#FF99C8"
                            stroke="#FFF275"
                            strokeWidth="1"
                          />
                          <path
                            d="M48 60 L82 60 L77 68 L53 68 Z"
                            fill="#2D6A4F"
                            stroke="#F4D06F"
                            strokeWidth="1.2"
                          />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-display text-sm font-medium whitespace-nowrap text-[#FFF275]">
                          {keepThaiPhrases(hp.gesturesSection.step3Title)}
                        </h4>
                        <p className="font-editorial text-[11px] tracking-[0.18em] text-[#C5A059] uppercase">
                          {keepThaiPhrases(hp.gesturesSection.step3Tag)}
                        </p>
                        <p className="font-heading mt-1 text-xs leading-relaxed text-[#E6DEC8]/80 sm:mt-1.5">
                          {keepThaiPhrases(hp.gesturesSection.step3Desc)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#C5A059]/30 pt-4">
                    <p className="font-heading text-xs text-[#C5A059]">
                      {keepThaiPhrases(hp.gesturesSection.distanceNote)}
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveFolio('practice')}
                      className="w-full cursor-pointer border border-[#F4D06F] bg-[#C5A059]/15 px-4 py-2 text-xs font-medium tracking-wide whitespace-nowrap text-[#FFF275] transition-colors hover:bg-[#C5A059]/30 sm:w-auto"
                    >
                      {hp.tabs.practice.title} &rarr;
                    </button>
                  </div>
                </div>
              )}

              {activeFolio === 'practice' && (
                <div className="space-y-4">
                  <div className="border-b border-[#C5A059]/30 pb-3">
                    <h3 className="font-display text-base font-medium tracking-wide text-balance text-[#F4D06F] sm:text-lg">
                      {keepThaiPhrases(hp.practiceSection.title)}
                    </h3>
                    <p className="font-heading mt-1 text-xs leading-relaxed text-[#E6DEC8]/85">
                      {keepThaiPhrases(hp.practiceSection.subtitle)}
                    </p>
                  </div>

                  <InteractiveTutorialSandbox
                    videoRef={videoRef}
                    gestureState={gestureState}
                    gestureRef={gestureRef}
                    cameraEnabled={cameraEnabled}
                    onToggleCamera={onToggleCamera}
                  />
                </div>
              )}

              {activeFolio === 'craft' && (
                <div className="space-y-5">
                  <div className="border-b border-[#C5A059]/30 pb-3">
                    <h3 className="font-display text-base font-medium tracking-wide text-balance text-[#F4D06F] sm:text-lg">
                      {keepThaiPhrases(hp.craftSection.introTitle)}
                    </h3>
                  </div>

                  <div className="divide-y divide-[#C5A059]/25 border border-[#C5A059]/35 bg-[#13100C]">
                    <div className="flex items-start gap-3.5 p-3.5 sm:gap-5 sm:p-4">
                      <span className="font-editorial w-7 shrink-0 text-center text-2xl leading-none font-semibold text-[#F4D06F]">
                        {hp.tabs.gestures.num}
                      </span>
                      <div>
                        <h4 className="font-display text-sm font-medium text-balance text-[#FFF275] sm:text-base">
                          {keepThaiPhrases(hp.craftSection.item1Title)}
                        </h4>
                        <p className="font-heading mt-1 text-xs leading-relaxed text-[#E6DEC8]/80 sm:text-sm">
                          {keepThaiPhrases(hp.craftSection.item1Desc)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5 p-3.5 sm:gap-5 sm:p-4">
                      <span className="font-editorial w-7 shrink-0 text-center text-2xl leading-none font-semibold text-[#F4D06F]">
                        {hp.tabs.practice.num}
                      </span>
                      <div>
                        <h4 className="font-display text-sm font-medium text-balance text-[#FFF275] sm:text-base">
                          {keepThaiPhrases(hp.craftSection.item2Title)}
                        </h4>
                        <p className="font-heading mt-1 text-xs leading-relaxed text-[#E6DEC8]/80 sm:text-sm">
                          {keepThaiPhrases(hp.craftSection.item2Desc)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5 p-3.5 sm:gap-5 sm:p-4">
                      <span className="font-editorial w-7 shrink-0 text-center text-2xl leading-none font-semibold text-[#F4D06F]">
                        {hp.tabs.craft.num}
                      </span>
                      <div>
                        <h4 className="font-display text-sm font-medium text-balance text-[#FFF275] sm:text-base">
                          {keepThaiPhrases(hp.craftSection.item3Title)}
                        </h4>
                        <p className="font-heading mt-1 text-xs leading-relaxed text-[#E6DEC8]/80 sm:text-sm">
                          {keepThaiPhrases(hp.craftSection.item3Desc)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-[#C5A059]/45 bg-[#14100C] px-3 py-2.5 sm:gap-3 sm:px-7 sm:py-3.5 [@media(max-height:500px)]:py-1.5!">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    currentIdx > 0 && setActiveFolio(folios[currentIdx - 1].id)
                  }
                  disabled={currentIdx === 0}
                  aria-label={hp.footerPrev}
                  className="inline-flex h-9 cursor-pointer items-center gap-1.5 border border-[#C5A059]/45 bg-[#1C1610] px-2.5 text-xs whitespace-nowrap text-[#E6DEC8] transition-opacity hover:border-[#F4D06F] disabled:cursor-not-allowed disabled:opacity-35 sm:px-3.5"
                >
                  <NavArrowLeft width={14} height={14} />
                  <span className="hidden sm:inline">{keepThaiPhrases(hp.footerPrev)}</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    currentIdx < folios.length - 1 &&
                    setActiveFolio(folios[currentIdx + 1].id)
                  }
                  disabled={currentIdx === folios.length - 1}
                  aria-label={hp.footerNext}
                  className="inline-flex h-9 cursor-pointer items-center gap-1.5 border border-[#C5A059]/45 bg-[#1C1610] px-2.5 text-xs whitespace-nowrap text-[#E6DEC8] transition-opacity hover:border-[#F4D06F] disabled:cursor-not-allowed disabled:opacity-35 sm:px-3.5"
                >
                  <span className="hidden sm:inline">{keepThaiPhrases(hp.footerNext)}</span>
                  <NavArrowRight width={14} height={14} />
                </button>
              </div>

              {onEnterPier && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEnterPier();
                  }}
                  className="thai-chamfer-sm h-9 cursor-pointer truncate border border-[#FFF275] bg-gradient-to-r from-[#F4D06F] to-[#D4AF37] px-4 text-xs font-semibold tracking-wide whitespace-nowrap text-[#0D0B09] transition-all hover:brightness-110 sm:px-5"
                >
                  {hp.footerEnterPier}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
