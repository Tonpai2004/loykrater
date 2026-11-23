'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavArrowLeft, NavArrowRight, Xmark } from 'iconoir-react';
import { LORE_CONTENT, LoreChapterId } from '@/constants/loreContent';
import { useLanguage } from '@/contexts/LanguageContext';
import { keepThaiPhrases } from '@/lib/thaiText';

interface LoyKrathongLoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoyKrathongLoreModal: React.FC<LoyKrathongLoreModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { locale } = useLanguage();
  const lr = LORE_CONTENT[locale];

  const [activeId, setActiveId] = useState<LoreChapterId>('origins');
  const bodyRef = useRef<HTMLDivElement | null>(null);

  const currentIdx = Math.max(
    0,
    lr.chapters.findIndex((chapter) => chapter.id === activeId)
  );
  const chapter = lr.chapters[currentIdx];

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [activeId]);

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
                    <span className="md:hidden">{keepThaiPhrases(lr.headerShort)}</span>
                    <span className="hidden md:inline">{keepThaiPhrases(lr.header)}</span>
                  </h2>
                  <p className="font-editorial hidden truncate text-xs tracking-[0.22em] text-[#C5A059]/80 uppercase sm:block">
                    {lr.sub}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center border border-[#C5A059]/45 bg-[#16120E] text-[#E6C77B] transition-colors hover:border-[#FFF275] hover:text-[#FFF275]"
                aria-label={lr.closeBtn}
              >
                <Xmark width={18} height={18} />
              </button>
            </div>

            <div
              role="tablist"
              className="grid border-b border-[#C5A059]/40 bg-[#120E0B]"
              style={{
                gridTemplateColumns: `repeat(${lr.chapters.length}, minmax(0, 1fr))`,
              }}
            >
              {lr.chapters.map((folio) => {
                const isSelected = folio.id === chapter.id;
                return (
                  <button
                    key={folio.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    title={folio.title}
                    onClick={() => setActiveId(folio.id)}
                    className={`min-w-0 cursor-pointer border-r border-[#C5A059]/25 px-1 py-2.5 text-center transition-all last:border-r-0 sm:px-2 sm:py-3 [@media(max-height:500px)]:flex [@media(max-height:500px)]:items-baseline [@media(max-height:500px)]:justify-center [@media(max-height:500px)]:gap-1.5 [@media(max-height:500px)]:py-1.5! ${
                      isSelected
                        ? 'bg-[#1D1711] shadow-[inset_0_-2px_0_#F4D06F]'
                        : 'bg-transparent opacity-65 hover:bg-[#17120E] hover:opacity-95'
                    }`}
                  >
                    <span className="font-editorial block text-sm leading-none font-semibold text-[#F4D06F]">
                      {folio.num}
                    </span>
                    <span className="font-display mt-1 block truncate text-xs font-medium whitespace-nowrap text-[#FFFDF7] sm:text-[13px] [@media(max-height:500px)]:mt-0!">
                      {folio.short}
                    </span>
                  </button>
                );
              })}
            </div>

            <div
              ref={bodyRef}
              className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-5 sm:px-8 sm:py-7 [&>*]:my-auto [@media(max-height:500px)]:py-3!"
            >
              <AnimatePresence mode="wait">
                <motion.article
                  key={`${locale}-${chapter.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="mx-auto w-full max-w-2xl"
                >
                  <header className="text-center">
                    <p
                      className={`font-editorial text-[11px] text-[#C5A059] ${
                        locale === 'en'
                          ? 'tracking-[0.3em] uppercase'
                          : 'font-heading tracking-wide'
                      }`}
                    >
                      {keepThaiPhrases(chapter.sub)}
                    </p>
                    <h3 className="font-display mt-1.5 text-xl font-medium tracking-wide text-balance text-[#F4D06F] sm:text-2xl">
                      {keepThaiPhrases(chapter.title)}
                    </h3>
                    <div className="mx-auto mt-3 flex w-40 items-center gap-2.5">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#C5A059]/70" />
                      <span className="h-1.5 w-1.5 rotate-45 bg-[#F4D06F]" />
                      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#C5A059]/70" />
                    </div>
                  </header>

                  <p className="font-display mt-5 border-l-2 border-[#C5A059]/70 pl-4 text-sm leading-relaxed text-pretty text-[#F5EFE4]/90 sm:text-[15px]">
                    {keepThaiPhrases(chapter.lede)}
                  </p>

                  <div className="mt-6 space-y-5">
                    {chapter.sections.map((section) => (
                      <section key={section.heading}>
                        <h4 className="font-display flex items-baseline gap-2.5 text-[15px] font-medium text-[#FFF275] sm:text-base">
                          <span className="h-1.5 w-1.5 shrink-0 translate-y-[-2px] rotate-45 bg-[#C5A059]" />
                          <span className="text-balance">
                            {keepThaiPhrases(section.heading)}
                          </span>
                        </h4>
                        <p className="font-heading mt-1.5 pl-4 text-[13px] leading-[1.85] text-pretty text-[#E6DEC8]/85 sm:text-sm">
                          {keepThaiPhrases(section.body)}
                        </p>
                      </section>
                    ))}
                  </div>

                  {chapter.note && (
                    <aside className="mt-7 border border-dashed border-[#C5A059]/50 bg-[#13100C] px-4 py-3.5">
                      <p
                        className={`font-editorial text-[11px] text-[#F4D06F] ${
                          locale === 'en'
                            ? 'tracking-[0.24em] uppercase'
                            : 'font-heading tracking-wide'
                        }`}
                      >
                        {keepThaiPhrases(chapter.note.label)}
                      </p>
                      <p className="font-heading mt-1 text-xs leading-relaxed text-pretty text-[#E6DEC8]/80 sm:text-[13px]">
                        {keepThaiPhrases(chapter.note.text)}
                      </p>
                    </aside>
                  )}
                </motion.article>
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-[#C5A059]/45 bg-[#14100C] px-3 py-2.5 sm:gap-3 sm:px-7 sm:py-3.5 [@media(max-height:500px)]:py-1.5!">
              <button
                type="button"
                onClick={() =>
                  currentIdx > 0 && setActiveId(lr.chapters[currentIdx - 1].id)
                }
                disabled={currentIdx === 0}
                aria-label={lr.prevBtn}
                className="inline-flex h-9 cursor-pointer items-center gap-1.5 border border-[#C5A059]/45 bg-[#1C1610] px-2.5 text-xs whitespace-nowrap text-[#E6DEC8] transition-opacity hover:border-[#F4D06F] disabled:cursor-not-allowed disabled:opacity-35 sm:px-3.5"
              >
                <NavArrowLeft width={14} height={14} />
                <span className="hidden sm:inline">{keepThaiPhrases(lr.prevBtn)}</span>
              </button>

              <span
                className={`text-[#C5A059] ${
                  locale === 'en'
                    ? 'font-editorial text-xs tracking-[0.2em]'
                    : 'font-heading text-[13px] tracking-wider'
                }`}
              >
                {chapter.num} / {lr.chapters[lr.chapters.length - 1].num}
              </span>

              {currentIdx < lr.chapters.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setActiveId(lr.chapters[currentIdx + 1].id)}
                  aria-label={lr.nextBtn}
                  className="inline-flex h-9 cursor-pointer items-center gap-1.5 border border-[#C5A059]/45 bg-[#1C1610] px-2.5 text-xs whitespace-nowrap text-[#E6DEC8] transition-colors hover:border-[#F4D06F] sm:px-3.5"
                >
                  <span className="hidden sm:inline">{keepThaiPhrases(lr.nextBtn)}</span>
                  <NavArrowRight width={14} height={14} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="thai-chamfer-sm h-9 cursor-pointer border border-[#C5A059] bg-[#1C1610] px-4 text-xs font-medium tracking-wide whitespace-nowrap text-[#F4D06F] transition-colors hover:border-[#FFF275] hover:text-[#FFF275] sm:px-5"
                >
                  {keepThaiPhrases(lr.closeBtn)}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
