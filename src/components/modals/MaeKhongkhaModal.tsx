'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  ShareAndroid,
  RefreshDouble,
  Check,
  SendDiagonal,
  Xmark,
} from 'iconoir-react';
import { KrathongConfig, OfferingSlotConfig, RitualMode } from '@/types/krathong';
import { getActiveOfferings, THAI_NUMERALS } from '@/components/RiverCanvas';
import { useLanguage } from '@/contexts/LanguageContext';

interface MaeKhongkhaModalProps {
  isOpen: boolean;
  config: KrathongConfig;
  releasedCount: number;
  onPlayAgain: () => void;
  onDismiss: () => void;
  onOpenShare: () => void;
}

const GUESTBOOK_STORAGE_KEY = 'loykrater_guestbook_v1';

function resolveRitualMode(slots: OfferingSlotConfig[]): RitualMode {
  const hasKrathong = slots.some((s) => s.itemType === 'krathong');
  const hasLantern = slots.some((s) => s.itemType === 'lantern');
  if (hasKrathong && hasLantern) return 'both';
  if (hasLantern) return 'lantern-only';
  return 'krathong-only';
}

function GoddessMaeKhongkhaIllustration() {
  return (
    <div className="relative mx-auto flex size-36 items-center justify-center sm:size-48 md:size-56">
      <svg
        viewBox="0 0 240 230"
        className="relative z-10 h-full w-full overflow-visible"
      >
        <path
          d="M34,205 L34,96 Q34,20 120,8 Q206,20 206,96 L206,205"
          fill="none"
          stroke="#D4AF37"
          strokeWidth="1"
          opacity="0.45"
        />
        <path
          d="M42,205 L42,98 Q42,28 120,16 Q198,28 198,98 L198,205"
          fill="none"
          stroke="#D4AF37"
          strokeWidth="0.6"
          strokeDasharray="3 3"
          opacity="0.35"
        />

        <circle cx="120" cy="92" r="56" fill="#D4AF37" opacity="0.14" />
        <circle cx="120" cy="92" r="42" fill="#FFF275" opacity="0.18" />

        <polygon points="120,16 130,42 110,42" fill="#D4AF37" opacity="0.5" />
        <polygon points="66,42 92,52 78,68" fill="#FF99C8" opacity="0.35" />
        <polygon points="174,42 148,52 162,68" fill="#FF99C8" opacity="0.35" />

        <path
          d="M84,68 Q58,109 54,174 L186,174 Q182,109 156,68 Z"
          fill="#0F1429"
        />
        <path
          d="M120,64 L186,174 L152,174 Q156,114 120,64 Z"
          fill="#161C38"
        />

        <polygon points="96,62 144,62 136,46 104,46" fill="#D4AF37" />
        <polygon points="104,46 136,46 128,30 112,30" fill="#B83B2A" />
        <polygon points="120,10 128,30 112,30" fill="#FFF275" />
        <polygon points="120,20 124,29 120,38 116,29" fill="#FF99C8" />
        <polygon points="92,66 76,58 86,80" fill="#D4AF37" />
        <polygon points="148,66 164,58 154,80" fill="#D4AF37" />

        <path
          d="M94,64 Q94,108 120,114 Q146,108 146,64 Z"
          fill="#F5E1C8"
        />
        <path
          d="M120,64 L146,64 Q146,108 120,114 Z"
          fill="#E8CBA8"
          opacity="0.65"
        />

        <path
          d="M101,78 Q108,74 114,78"
          stroke="#1C1815"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M126,78 Q132,74 139,78"
          stroke="#1C1815"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M102,84 Q108,88 114,84"
          stroke="#1C1815"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M126,84 Q132,88 138,84"
          stroke="#1C1815"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M114,98 Q120,102 126,98"
          stroke="#B83B2A"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />

        <polygon points="91,86 95,96 91,106 87,96" fill="#D4AF37" />
        <polygon points="149,86 153,96 149,106 145,96" fill="#D4AF37" />

        <rect x="112" y="110" width="16" height="14" rx="4" fill="#E8CBA8" />
        <path
          d="M72,174 Q82,122 120,122 Q158,122 168,174 Z"
          fill="#F5E1C8"
        />

        <polygon points="104,122 136,122 128,134 112,134" fill="#D4AF37" />
        <polygon points="120,125 124,130 120,135 116,130" fill="#B83B2A" />

        <polygon points="80,174 102,122 158,174" fill="#2D6A4F" />
        <polygon points="88,174 106,123 164,174" fill="#B83B2A" />
        <polygon points="106,123 116,125 148,174 134,174" fill="#D4AF37" />

        <polygon points="120,130 130,146 120,158 110,146" fill="#FF99C8" />
        <polygon points="120,134 125,146 120,154 115,146" fill="#FFF275" />
        <polygon points="107,162 118,142 120,162" fill="#F5E1C8" />
        <polygon points="133,162 122,142 120,162" fill="#E8CBA8" />

        <ellipse cx="120" cy="180" rx="84" ry="14" fill="#131936" />
        <ellipse
          cx="120"
          cy="178"
          rx="68"
          ry="9"
          fill="#2D6A4F"
          opacity="0.55"
        />
        <ellipse
          cx="120"
          cy="176"
          rx="50"
          ry="6"
          fill="#D4AF37"
          opacity="0.5"
        />

        <line
          x1="24"
          y1="205"
          x2="216"
          y2="205"
          stroke="#D4AF37"
          strokeWidth="1"
          opacity="0.5"
        />
      </svg>
    </div>
  );
}

export const MaeKhongkhaModal: React.FC<MaeKhongkhaModalProps> = ({
  isOpen,
  config,
  releasedCount,
  onPlayAgain,
  onDismiss,
  onOpenShare,
}) => {
  const { locale, t } = useLanguage();
  const isEn = locale === 'en';
  const [rating, setRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState<string>('');
  const [reviewSubmitted, setReviewSubmitted] = useState<boolean>(false);

  const slots = getActiveOfferings(config);
  const ritualMode = resolveRitualMode(slots);

  const deityTitle =
    ritualMode === 'lantern-only'
      ? t.blessingModal.deityLantern
      : ritualMode === 'both'
        ? t.blessingModal.deityBoth
        : t.blessingModal.deityKrathong;

  const blessingQuote =
    ritualMode === 'lantern-only'
      ? t.blessingModal.blessingLantern
      : ritualMode === 'both'
        ? t.blessingModal.blessingBoth
        : t.blessingModal.blessingKrathong;

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    try {
      confetti({
        particleCount: 42,
        spread: 75,
        origin: { y: 0.62 },
        colors: ['#D4AF37', '#FFF275', '#FF99C8', '#F5EFE4'],
        scalar: 0.9,
      });
    } catch {
      // Ignore confetti errors in restricted environments
    }

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onDismiss]);

  const activeNames = Array.from(
    new Set(
      slots.map((s) => s.authorName.trim()).filter((n) => n.length > 0)
    )
  );
  const hasAnyAuthor = activeNames.length > 0;
  const namesDisplay = hasAnyAuthor ? activeNames.join(', ') : '';

  const inscribedSlots = slots
    .map((slot, index) => ({ slot, index }))
    .filter(
      ({ slot }) =>
        slot.hideWish ||
        slot.wishText.trim().length > 0 ||
        slot.authorName.trim().length > 0
    );

  const handleSubmitGuestbook = () => {
    setReviewSubmitted(true);
    if (typeof window === 'undefined') return;
    try {
      const existingRaw = window.localStorage.getItem(GUESTBOOK_STORAGE_KEY);
      const existing = existingRaw ? (JSON.parse(existingRaw) as unknown[]) : [];
      const nextEntries = [
        ...(Array.isArray(existing) ? existing.slice(-19) : []),
        {
          rating,
          comment: reviewText.trim().slice(0, 140),
          createdAt: Date.now(),
        },
      ];
      window.localStorage.setItem(
        GUESTBOOK_STORAGE_KEY,
        JSON.stringify(nextEntries)
      );
    } catch {
      // Ignore storage errors
    }
  };

  const handlePlayAgainClick = () => {
    setReviewSubmitted(false);
    setReviewText('');
    setRating(5);
    onPlayAgain();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onDismiss}
          className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-[#060810]/85 p-2.5 backdrop-blur-md sm:p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex w-full max-w-3xl flex-col items-center overflow-hidden pb-3 [zoom:var(--ui-zoom,1)]"
          >
            <button
              type="button"
              onClick={onDismiss}
              aria-label={t.blessingModal.closeBtn}
              className="absolute top-2.5 right-2.5 z-20 flex h-9 w-9 cursor-pointer items-center justify-center border border-[#D4AF37]/50 bg-[#080B14]/90 text-[#FFFDF7]/85 backdrop-blur-sm transition-colors hover:border-[#FFF275] hover:text-[#FFF275] md:hidden"
            >
              <Xmark width={18} height={18} strokeWidth={1.8} />
            </button>

            <motion.div
              initial={{ opacity: 0, y: 420, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 400, scale: 0.93 }}
              transition={{
                type: 'spring',
                stiffness: 58,
                damping: 15,
                mass: 1.15,
              }}
              className="thai-chamfer relative z-10 grid max-h-[calc(100dvh-2.5rem)] w-full grid-cols-1 overflow-y-auto border border-[#D4AF37]/60 bg-[#0E1222] shadow-[0_30px_90px_rgba(0,0,0,0.92),0_18px_50px_rgba(244,208,111,0.22)] sm:max-h-[calc(min(90dvh,48rem)/var(--ui-zoom,1))] md:grid-cols-12"
            >
              <div className="relative flex flex-col items-center justify-between gap-2 border-b border-[#D4AF37]/30 bg-[#080B14] p-4 text-center text-[#FFFDF7] sm:p-6 md:col-span-5 md:border-r md:border-b-0">
                <div className="font-heading flex w-full items-center justify-between gap-2 pr-11 text-[10px] tracking-wider whitespace-nowrap text-[#F4D06F]/85 md:pr-0">
                  <span>
                    {isEn ? '12th Lunar Full Moon' : '๑๕ ค่ำ เดือน ๑๒'}
                  </span>
                  <span>
                    {isEn ? 'Chao Phraya Sanctuary' : 'คุ้งน้ำพระนคร'}
                  </span>
                </div>

                <GoddessMaeKhongkhaIllustration />

                <div className="w-full border-t border-[#D4AF37]/25 pt-3">
                  <p className="font-display text-sm text-[#F4D06F]">
                    {deityTitle}
                  </p>
                  <p className="font-wish mt-1 text-xs text-pretty text-[#FFFDF7]/80">
                    {blessingQuote}
                  </p>
                  <p className="font-heading mt-1.5 text-[10px] text-[#D4AF37]/80">
                    {isEn
                      ? `(${releasedCount} offering${releasedCount > 1 ? 's' : ''} received)`
                      : `(รับเครื่องสักการะครบทั้ง ${releasedCount} ชิ้นแล้ว)`}
                  </p>
                </div>
              </div>

              <div
                style={{
                  background:
                    'linear-gradient(160deg, rgba(24, 30, 58, 0.98) 0%, rgba(13, 17, 34, 0.99) 100%)',
                }}
                className="relative flex flex-col justify-between bg-[#141932] p-4 text-left text-[#FFFDF7] sm:p-7 md:col-span-7"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 border-b border-[#D4AF37]/30 pb-3">
                    <div>
                      <p className="font-heading text-[11px] font-medium tracking-wider text-[#F4D06F]">
                        {t.blessingModal.headerTag}
                      </p>
                      <h2 className="font-display mt-0.5 text-lg leading-snug font-normal text-balance text-[#FFF275] sm:text-2xl">
                        {isEn
                          ? '“The Sacred Waters Have Received Your Wishes”'
                          : '“แม่รับคำพรของพวกเจ้าไว้ในสายชลแล้วหนา”'}
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={onDismiss}
                      title={t.blessingModal.closeBtn}
                      aria-label={t.blessingModal.closeBtn}
                      className="hidden h-9 w-9 shrink-0 cursor-pointer items-center justify-center border border-[#D4AF37]/40 bg-[#080B14] text-[#FFFDF7]/80 transition-colors hover:border-[#FFF275] hover:text-[#FFF275] md:flex"
                    >
                      <Xmark width={18} height={18} strokeWidth={1.8} />
                    </button>
                  </div>

                  <p className="font-heading mt-3 text-xs leading-relaxed text-pretty text-[#FFFDF7]/90">
                    {isEn ? (
                      <>
                        Blessings
                        {hasAnyAuthor ? (
                          <>
                            {' '}
                            upon{' '}
                            <strong className="font-semibold text-[#FFF275]">
                              {namesDisplay}
                            </strong>
                          </>
                        ) : null}{' '}
                        for offering {releasedCount} light
                        {releasedCount > 1 ? 's' : ''} to the river and sky
                        tonight. May every wish shine bright as the full moon
                        and bring lasting peace and prosperity.
                      </>
                    ) : (
                      <>
                        ขอบใจยิ่งนักหนา
                        {hasAnyAuthor ? (
                          <>
                            {' '}
                            <strong className="font-semibold text-[#FFF275]">
                              {namesDisplay}
                            </strong>
                          </>
                        ) : null}{' '}
                        ที่มาร่วมลอยประทีปและโคมทองในค่ำคืนนี้
                        ขอความปรารถนาอันงามทั้ง {releasedCount}{' '}
                        ชิ้นจงสัมฤทธิ์ผลดั่งแสงจันทร์วันเพ็ญ
                        ไร้โรคาพยาธิและร่มเย็นเป็นสุขทุกทิวาราตรีเทอญ
                      </>
                    )}
                  </p>

                  {inscribedSlots.length > 0 && (
                    <div className="mt-3.5 max-h-36 space-y-2 overflow-y-auto border border-[#D4AF37]/35 border-l-2 border-l-[#F4D06F] bg-[#080B14]/90 py-2.5 pr-3 pl-3.5">
                      <p className="font-heading text-[10px] tracking-wider text-[#F4D06F]">
                        {isEn
                          ? `Inscribed Wishes (${inscribedSlots.length})`
                          : `ถ้อยคำอธิษฐานที่จารึกไว้ในคืนเพ็ญ (${inscribedSlots.length} ชิ้น)`}
                      </p>
                      {inscribedSlots.map(({ slot, index }, listIdx) => {
                        const cleanAuthor = slot.authorName.trim();
                        const cleanWish = slot.wishText.trim();
                        return (
                          <div
                            key={slot.id}
                            className={
                              listIdx > 0
                                ? 'border-t border-dashed border-[#D4AF37]/20 pt-1.5'
                                : ''
                            }
                          >
                            <span className="font-heading text-[11px] text-[#F4D06F]">
                              {isEn ? `#${index + 1}` : THAI_NUMERALS[index]} (
                              {slot.itemType === 'lantern'
                                ? isEn
                                  ? 'Sky Lantern'
                                  : 'โคมลอย'
                                : isEn
                                  ? 'Krathong'
                                  : 'กระทง'}
                              {cleanAuthor ? ` • ${cleanAuthor}` : ''}
                              )
                              {slot.hideWish || cleanWish ? ':' : ''}
                            </span>
                            {slot.hideWish ? (
                              <p className="font-wish text-sm text-[#FFF275]/80 italic">
                                {t.blessingModal.privateWishNotice}
                              </p>
                            ) : cleanWish ? (
                              <p className="font-wish text-sm text-[#FFFDF7]">
                                “{cleanWish}”
                              </p>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="mt-4 border border-[#D4AF37]/35 bg-[#080B14]/90 p-3.5">
                    {!reviewSubmitted ? (
                      <>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-heading text-xs font-medium whitespace-nowrap text-[#F4D06F]">
                            {isEn
                              ? 'Pavilion Guestbook'
                              : 'สมุดเยี่ยมชมศาลาท่าน้ำ'}
                          </span>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => {
                              const active = star <= rating;
                              return (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setRating(star)}
                                  className="cursor-pointer p-0.5 transition-transform hover:scale-115"
                                >
                                  <svg viewBox="0 0 20 20" className="h-4 w-4">
                                    <polygon
                                      points="10,1 12.6,6.8 19,7.5 14.2,11.8 15.5,18 10,14.8 4.5,18 5.8,11.8 1,7.5 7.4,6.8"
                                      fill={active ? '#F4D06F' : '#141932'}
                                      stroke="#F4D06F"
                                      strokeWidth="1.4"
                                    />
                                  </svg>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="mt-2.5 flex flex-col gap-2 min-[480px]:flex-row min-[480px]:items-end">
                          <textarea
                            rows={2}
                            maxLength={140}
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            placeholder={
                              isEn
                                ? 'Share your impression at the waterfront pavilion...'
                                : 'เขียนถ้อยคำติชมหรือความประทับใจฝากไว้ ณ ศาลาท่าน้ำ...'
                            }
                            className="font-wish flex-1 resize-none border border-[#D4AF37]/45 bg-[#12172B] px-3 py-2 text-base text-[#FFFDF7] placeholder-[#FFFDF7]/45 transition-colors focus:border-[#FFF275] focus:bg-[#171E38] focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleSubmitGuestbook}
                            className="thai-chamfer-sm font-heading flex shrink-0 cursor-pointer items-center justify-center gap-1.5 border border-[#D4AF37]/60 bg-[#B83B2A] px-4 py-2.5 text-xs font-medium whitespace-nowrap text-[#FFFDF7] transition-colors hover:bg-[#D4AF37] hover:text-[#0B0E17]"
                          >
                            <SendDiagonal
                              width={14}
                              height={14}
                              strokeWidth={2}
                            />
                            <span>{isEn ? 'Sign Guestbook' : 'ลงนามรีวิว'}</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-2.5 border border-[#52B788]/40 bg-[#1B4332]/40 p-3 text-[#FFF275]"
                      >
                        <Check
                          width={18}
                          height={18}
                          strokeWidth={2.2}
                          className="mt-0.5 shrink-0 text-[#52B788]"
                        />
                        <div>
                          <p className="font-heading text-xs font-semibold">
                            {isEn
                              ? `Inscribed in the Pavilion Guestbook (${rating}/5)`
                              : `ขึ้นทะเบียนคำชมในสมุดศาลาท่าพระนคร (${rating}/5 ดาว) เรียบร้อยแล้ว`}
                          </p>
                          {reviewText.trim() && (
                            <p className="font-wish mt-0.5 text-sm text-[#FFFDF7]">
                              “{reviewText.trim()}”
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2 border-t border-[#D4AF37]/25 pt-3.5 min-[480px]:grid-cols-2 sm:mt-5 sm:gap-2.5 sm:pt-4">
                  <button
                    type="button"
                    onClick={onOpenShare}
                    className="thai-chamfer-sm font-heading flex cursor-pointer items-center justify-center gap-2 border border-[#D4AF37]/50 bg-[#080B14] px-3 py-2.5 text-xs font-medium whitespace-nowrap text-[#FFF275] transition-colors hover:border-[#FFF275] hover:bg-[#12172B]"
                  >
                    <ShareAndroid width={15} height={15} strokeWidth={1.8} />
                    <span>{isEn ? 'Invite Friends' : 'ชวนเพื่อนมาลอย'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePlayAgainClick}
                    className="thai-chamfer-sm font-heading flex cursor-pointer items-center justify-center gap-2 border border-[#FFF275]/60 bg-[#D4AF37] px-3 py-2.5 text-xs font-semibold whitespace-nowrap text-[#0B0E17] transition-colors hover:bg-[#FFF275]"
                  >
                    <RefreshDouble width={16} height={16} strokeWidth={2} />
                    <span>{t.blessingModal.playAgainBtn}</span>
                  </button>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scaleX: 0.35 }}
              animate={{
                opacity: [0, 0.85, 0.35],
                scaleX: [0.4, 1.15, 0.98],
              }}
              exit={{ opacity: 0, scaleX: 0.4 }}
              transition={{ duration: 1.1, ease: 'easeOut' }}
              className="pointer-events-none h-2.5 w-4/5 rounded-full border border-[#FFF275]/60 bg-[#D4AF37]/25 blur-[1px]"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
