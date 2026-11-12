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
import { KrathongConfig } from '@/types/krathong';

interface MaeKhongkhaModalProps {
  isOpen: boolean;
  config: KrathongConfig;
  releasedCount: number;
  onPlayAgain: () => void;
  onDismiss: () => void;
}

const SPRING_TRANSITION = {
  type: 'spring' as const,
  stiffness: 100,
  damping: 16,
};

function GoddessMaeKhongkhaIllustration() {
  return (
    <div className="relative mx-auto flex h-56 w-56 items-center justify-center">
      {/* Subtle architectural Thai Lotus Arch (ซุ้มเรือนแก้วเส้นทองมินิมอล) */}
      <svg
        viewBox="0 0 240 230"
        className="relative z-10 h-full w-full overflow-visible"
      >
        {/* Outer Arch Frame */}
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

        {/* Celestial Moon Disc */}
        <circle cx="120" cy="92" r="56" fill="#D4AF37" opacity="0.14" />
        <circle cx="120" cy="92" r="42" fill="#FFF275" opacity="0.18" />

        {/* Radiating Geometric Halo Petals */}
        <polygon points="120,16 130,42 110,42" fill="#D4AF37" opacity="0.5" />
        <polygon points="66,42 92,52 78,68" fill="#FF99C8" opacity="0.35" />
        <polygon points="174,42 148,52 162,68" fill="#FF99C8" opacity="0.35" />

        {/* Flowing Midnight Silk Hair */}
        <path
          d="M84,68 Q58,109 54,174 L186,174 Q182,109 156,68 Z"
          fill="#0F1429"
        />
        <path
          d="M120,64 L186,174 L152,174 Q156,114 120,64 Z"
          fill="#161C38"
        />

        {/* Golden Thai Chada / Lotus Crown */}
        <polygon points="96,62 144,62 136,46 104,46" fill="#D4AF37" />
        <polygon points="104,46 136,46 128,30 112,30" fill="#B83B2A" />
        <polygon points="120,10 128,30 112,30" fill="#FFF275" />
        <polygon points="120,20 124,29 120,38 116,29" fill="#FF99C8" />
        <polygon points="92,66 76,58 86,80" fill="#D4AF37" />
        <polygon points="148,66 164,58 154,80" fill="#D4AF37" />

        {/* Serene 2D Paper-Cut Face */}
        <path
          d="M94,64 Q94,108 120,114 Q146,108 146,64 Z"
          fill="#F5E1C8"
        />
        <path
          d="M120,64 L146,64 Q146,108 120,114 Z"
          fill="#E8CBA8"
          opacity="0.65"
        />

        {/* Gentle Closed Blessing Eyes & Brows */}
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

        {/* Golden Earrings */}
        <polygon points="91,86 95,96 91,106 87,96" fill="#D4AF37" />
        <polygon points="149,86 153,96 149,106 145,96" fill="#D4AF37" />

        {/* Neck & Shoulders */}
        <rect x="112" y="110" width="16" height="14" rx="4" fill="#E8CBA8" />
        <path
          d="M72,174 Q82,122 120,122 Q158,122 168,174 Z"
          fill="#F5E1C8"
        />

        {/* Royal Necklace */}
        <polygon points="104,122 136,122 128,134 112,134" fill="#D4AF37" />
        <polygon points="120,125 124,130 120,135 116,130" fill="#B83B2A" />

        {/* Emerald & Vermilion-Gold Diagonal Sabai */}
        <polygon points="80,174 102,122 158,174" fill="#2D6A4F" />
        <polygon points="88,174 106,123 164,174" fill="#B83B2A" />
        <polygon points="106,123 116,125 148,174 134,174" fill="#D4AF37" />

        {/* Sacred Lotus in Her Hands */}
        <polygon points="120,130 130,146 120,158 110,146" fill="#FF99C8" />
        <polygon points="120,134 125,146 120,154 115,146" fill="#FFF275" />
        <polygon points="107,162 118,142 120,162" fill="#F5E1C8" />
        <polygon points="133,162 122,142 120,162" fill="#E8CBA8" />

        {/* Rising Water Ripples */}
        <ellipse cx="120" cy="180" rx="84" ry="14" fill="#131936" />
        <ellipse cx="120" cy="178" rx="68" ry="9" fill="#2D6A4F" opacity="0.55" />
        <ellipse cx="120" cy="176" rx="50" ry="6" fill="#D4AF37" opacity="0.5" />

        <line x1="24" y1="205" x2="216" y2="205" stroke="#D4AF37" strokeWidth="1" opacity="0.5" />
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
}) => {
  const [rating, setRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState<string>('');
  const [reviewSubmitted, setReviewSubmitted] = useState<boolean>(false);
  const [shareCopied, setShareCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;
    try {
      confetti({
        particleCount: 42,
        spread: 75,
        origin: { y: 0.62 },
        colors: ['#D4AF37', '#FFF275', '#FF99C8', '#F5EFE4'],
        scalar: 0.9,
      });
    } catch {
      // Ignore if canvas-confetti fails in restricted environments
    }
  }, [isOpen]);

  const handleShare = async () => {
    const names =
      config.playerCount === 2 && config.partnerName?.trim()
        ? `${config.authorName || 'เรา'} & ${config.partnerName}`
        : config.authorName || 'ลอยกะเธอ';

    const shareText = `คืนเพ็ญเดือนสิบสอง ณ ท่าน้ำพระนคร "${names}" ได้ฝากคำพรลอยกะเธอ (Loikratur): “${config.wishText}” ขอเชิญมาร่วมลอยกระทงและปล่อยโคมทองด้วยกันเถิดหนา`;
    const shareUrl =
      typeof window !== 'undefined' ? window.location.href : '';

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'ลอยกะเธอ — มหรสพสายน้ำคืนเพ็ญ',
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch {
        // Fallback to clipboard copy
      }
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 3000);
    }
  };

  const namesDisplay =
    config.playerCount === 2
      ? `${config.authorName.trim() || 'ผู้ฝากคำพร'} และ ${
          config.partnerName?.trim() || 'คู่ขวัญเคียงกาย'
        }`
      : config.authorName.trim() || 'ผู้ฝากคำพร ณ ท่าน้ำพระนคร';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-[#060810]/85 p-4 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={SPRING_TRANSITION}
            className="thai-chamfer relative grid max-h-[92vh] w-full max-w-3xl grid-cols-1 overflow-y-auto border border-[#D4AF37]/60 bg-[#0E1222] shadow-[0_30px_90px_rgba(0,0,0,0.92)] md:grid-cols-12"
          >
            {/* Left Panel (5 cols): Nocturnal Shrine Art Print */}
            <div className="relative flex flex-col items-center justify-between border-b border-[#D4AF37]/30 bg-[#080B14] p-6 text-center text-[#FFFDF7] md:col-span-5 md:border-r md:border-b-0">
              <div className="font-heading flex w-full items-center justify-between text-[10px] tracking-wider text-[#F4D06F]/85">
                <span>๑๕ ค่ำ เดือน ๑๒</span>
                <span>คุ้งน้ำพระนคร</span>
              </div>

              <GoddessMaeKhongkhaIllustration />

              <div className="w-full border-t border-[#D4AF37]/25 pt-3">
                <p className="font-display text-sm text-[#F4D06F]">
                  พระแม่คงคาเทวี • ศาลท่าน้ำพระนคร
                </p>
                <p className="font-wish mt-1 text-xs text-[#FFFDF7]/80">
                  “อันความทุกข์โศกเศร้าให้ไหลลับ ไปพร้อมกับสายชลคนทั้งหลาย”
                </p>
                <p className="font-heading mt-1.5 text-[10px] text-[#D4AF37]/80">
                  (รับเครื่องสักการะครบทั้ง {releasedCount} ชิ้นแล้ว)
                </p>
              </div>
            </div>

            {/* Right Panel (7 cols): Royal Indigo & Gold-Leaf Blessing Postcard & Guestbook */}
            <div
              style={{
                background:
                  'linear-gradient(160deg, rgba(24, 30, 58, 0.98) 0%, rgba(13, 17, 34, 0.99) 100%)',
              }}
              className="relative flex flex-col justify-between bg-[#141932] p-6 text-left text-[#FFFDF7] sm:p-7 md:col-span-7"
            >
              <div>
                <div className="flex items-start justify-between gap-2 border-b border-[#D4AF37]/30 pb-3">
                  <div>
                    <p className="font-heading text-[11px] font-medium tracking-wider text-[#F4D06F]">
                      สารอวยพรจากคุ้งน้ำเจ้าพระยา • คืนเพ็ญเดือนสิบสอง
                    </p>
                    <h2 className="font-display mt-0.5 text-xl font-normal text-[#FFF275] sm:text-2xl">
                      “แม่รับคำพรของเจ้าไว้ในสายชลแล้วหนา”
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={onDismiss}
                    title="ชมสายน้ำต่อ"
                    className="flex h-8 w-8 items-center justify-center border border-[#D4AF37]/40 bg-[#080B14] text-[#FFFDF7]/80 transition-colors hover:border-[#FFF275] hover:text-[#FFF275]"
                  >
                    <Xmark width={18} height={18} strokeWidth={1.8} />
                  </button>
                </div>

                {/* Poetic Blessing Message */}
                <p className="font-heading mt-3 text-xs leading-relaxed text-[#FFFDF7]/90">
                  ขอบใจยิ่งนักหนา{' '}
                  <strong className="font-semibold text-[#FFF275]">
                    {namesDisplay}
                  </strong>{' '}
                  ที่มาร่วมลอยประทีปและโคมทองในค่ำคืนนี้
                  ขอความปรารถนาอันงามของเจ้าจงสัมฤทธิ์ผลดั่งแสงจันทร์วันเพ็ญ
                  ไร้โรคาพยาธิและร่มเย็นเป็นสุขทุกทิวาราตรีเทอญ
                </p>

                {/* Inscribed Wishes in Framed Box */}
                <div className="mt-3.5 border border-[#D4AF37]/35 border-l-2 border-l-[#F4D06F] bg-[#080B14]/90 py-2.5 pl-3.5 pr-3">
                  <p className="font-heading text-[10px] tracking-wider text-[#F4D06F]">
                    ถ้อยคำอธิษฐานที่จารึกไว้ในคืนเพ็ญ
                  </p>
                  <p className="font-wish mt-0.5 text-base text-[#FFFDF7]">
                    “{config.wishText || 'ฝากทุกข์โศกลอยลับไปกับน้ำ ให้คืนค่ำมีแต่สุขทุกแห่งหน'}”
                  </p>
                  {config.playerCount === 2 &&
                    config.partnerWishText?.trim() && (
                      <p className="font-wish mt-1 border-t border-dashed border-[#D4AF37]/25 pt-1 text-base text-[#FF99C8]">
                        “{config.partnerWishText}”
                      </p>
                    )}
                </div>

                {/* Handwritten Guestbook / Review Input Box */}
                <div className="mt-4 border border-[#D4AF37]/35 bg-[#080B14]/90 p-3.5">
                  {!reviewSubmitted ? (
                    <>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-heading text-xs font-medium text-[#F4D06F]">
                          สมุดเยี่ยมชมศาลาท่าน้ำ (ฝากถ้อยคำรีวิว)
                        </span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => {
                            const active = star <= rating;
                            return (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className="p-0.5 transition-transform hover:scale-115"
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

                      <div className="mt-2.5 flex flex-col gap-2 sm:flex-row sm:items-end">
                        <textarea
                          rows={2}
                          maxLength={140}
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          placeholder="เขียนถ้อยคำติชมหรือความประทับใจฝากไว้ ณ ศาลาท่าน้ำ..."
                          className="font-wish flex-1 resize-none border border-[#D4AF37]/45 bg-[#12172B] px-3 py-2 text-base text-[#FFFDF7] placeholder-[#FFFDF7]/45 transition-colors focus:border-[#FFF275] focus:bg-[#171E38] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setReviewSubmitted(true)}
                          className="thai-chamfer-sm font-heading flex shrink-0 items-center justify-center gap-1.5 border border-[#D4AF37]/60 bg-[#B83B2A] px-4 py-2.5 text-xs font-medium text-[#FFFDF7] transition-colors hover:bg-[#D4AF37] hover:text-[#0B0E17]"
                        >
                          <SendDiagonal width={14} height={14} strokeWidth={2} />
                          <span>ลงนามรีวิว</span>
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
                          ขึ้นทะเบียนคำชมในสมุดศาลาท่าน้ำ ({rating}/5 ดาว) เรียบร้อยแล้ว
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

              {/* Footer Actions */}
              <div className="mt-5 grid grid-cols-1 gap-2.5 border-t border-[#D4AF37]/25 pt-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleShare}
                  className="thai-chamfer-sm font-heading flex items-center justify-center gap-2 border border-[#D4AF37]/50 bg-[#080B14] px-4 py-2.5 text-xs font-medium text-[#FFF275] transition-colors hover:border-[#FFF275] hover:bg-[#12172B]"
                >
                  <ShareAndroid width={15} height={15} strokeWidth={1.8} />
                  <span>
                    {shareCopied
                      ? 'คัดลอกสาส์นเชิญเรียบร้อยแล้ว'
                      : 'ส่งสาส์นชวนหวานใจมาร่วมลอย'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={onPlayAgain}
                  className="thai-chamfer-sm font-heading flex items-center justify-center gap-2 border border-[#FFF275]/60 bg-[#D4AF37] px-4 py-2.5 text-xs font-semibold text-[#0B0E17] transition-colors hover:bg-[#FFF275]"
                >
                  <RefreshDouble width={16} height={16} strokeWidth={2} />
                  <span>หวนคืนท่าน้ำ — ลอยอีกรอบ</span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
