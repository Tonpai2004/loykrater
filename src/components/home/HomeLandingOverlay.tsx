'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LoikraturLogo } from '@/components/home/LoikraturLogo';

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
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-none flex flex-1 flex-col items-center justify-center px-4 py-6"
    >
      <div className="pointer-events-auto relative flex w-full max-w-xl flex-col items-center">
        {/* Subtle dark radial backdrop behind the hero so text is crisp while keeping the river open */}
        <div className="pointer-events-none absolute -inset-10 -z-10 rounded-full bg-radial from-[#0B0E17]/75 via-[#0B0E17]/35 to-transparent blur-2xl" />

        <LoikraturLogo />

        {/* Ornamental Divider */}
        <motion.div
          initial={{ scaleX: 0.4, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.38, duration: 0.5 }}
          className="my-5 flex w-64 items-center gap-3 sm:w-80"
        >
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-[#F4D06F]" />
          <span className="h-2 w-2 rotate-45 border border-[#F4D06F] bg-[#D4AF37]/40" />
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#D4AF37]/60 to-[#F4D06F]" />
        </motion.div>

        {/* Primary Action: Enter the Pier */}
        <motion.button
          type="button"
          onClick={onEnterPier}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42, duration: 0.5 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="thai-chamfer group relative w-full max-w-md cursor-pointer overflow-hidden border-2 border-[#FFF275] bg-gradient-to-r from-[#F4D06F] via-[#FF8C42] to-[#F4D06F] px-7 py-4 text-[#0D1321] shadow-[0_12px_36px_rgba(244,208,111,0.38)] transition-all hover:shadow-[0_16px_46px_rgba(244,208,111,0.55)]"
        >
          <span className="pointer-events-none absolute inset-1 border border-[#0D1321]/25" />
          <div className="relative flex items-center justify-center gap-3">
            {/* Lotus & Water Icon */}
            <svg
              viewBox="0 0 28 28"
              className="h-6 w-6 shrink-0 transition-transform duration-300 group-hover:scale-110"
              fill="none"
            >
              <path
                d="M14 4 L18 14 L10 14 Z"
                fill="#0D1321"
              />
              <path
                d="M9 7 L14 15 L6 15 Z"
                fill="#0D1321"
                fillOpacity="0.8"
              />
              <path
                d="M19 7 L22 15 L14 15 Z"
                fill="#0D1321"
                fillOpacity="0.8"
              />
              <path
                d="M4 16 L24 16 L21 20 L7 20 Z"
                fill="#0D1321"
              />
              <path
                d="M4 23 Q14 25.5 24 23"
                stroke="#0D1321"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <div className="text-left">
              <div className="font-display text-lg font-semibold tracking-wide sm:text-xl">
                เข้าสู่ท่าน้ำเพื่อลอยกระทง
              </div>
              <div className="font-heading text-[11px] font-medium text-[#0D1321]/80">
                ประดิษฐ์กระทง • ปล่อยโคมลอย • อธิษฐานจิต (๑–๕ ชิ้น)
              </div>
            </div>
          </div>
        </motion.button>

        {/* Secondary Samut Khoi Menu Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-3.5 grid w-full max-w-md grid-cols-1 gap-3 sm:grid-cols-2"
        >
          {/* Samut Khoi 1: How to Play + Mini Tutorial */}
          <button
            type="button"
            onClick={onOpenHowToPlay}
            className="thai-chamfer-sm group relative flex cursor-pointer items-center gap-3 border border-[#D4AF37]/65 bg-[#0B0E17]/88 px-4 py-3 text-left backdrop-blur-md transition-all hover:border-[#FFF275] hover:bg-[#141A2E]/95 hover:shadow-[0_8px_24px_rgba(212,175,55,0.22)]"
          >
            {/* Folding Samut Khoi Book SVG */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#D4AF37]/50 bg-[#F5EFE4]/10 text-[#F4D06F] transition-transform group-hover:scale-105">
              <svg viewBox="0 0 28 28" className="h-5 w-5" fill="none">
                <path
                  d="M3 7 L10 5 L18 7 L25 5 L25 21 L18 23 L10 21 L3 23 Z"
                  stroke="#F4D06F"
                  strokeWidth="1.7"
                  strokeLinejoin="round"
                />
                <line x1="10" y1="5" x2="10" y2="21" stroke="#D4AF37" strokeWidth="1.3" />
                <line x1="18" y1="7" x2="18" y2="23" stroke="#D4AF37" strokeWidth="1.3" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-display text-sm font-medium text-[#FFF275] group-hover:text-[#FFFDF7]">
                สมุดข่อยวิธีการเล่น
              </div>
              <div className="font-heading truncate text-[11px] text-[#FFFDF7]/70">
                คู่มือละเอียด • อุปกรณ์ • ทดลองเล่น
              </div>
            </div>
          </button>

          {/* Samut Khoi 2: Loy Krathong Lore & Wisdom (Coming Soon) */}
          <button
            type="button"
            onClick={onOpenLore}
            className="thai-chamfer-sm group relative flex cursor-pointer items-center gap-3 border border-[#D4AF37]/50 bg-[#0B0E17]/82 px-4 py-3 text-left backdrop-blur-md transition-all hover:border-[#F4D06F] hover:bg-[#141A2E]/95 hover:shadow-[0_8px_24px_rgba(212,175,55,0.18)]"
          >
            {/* Traditional Scroll / Chronicle SVG */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#D4AF37]/40 bg-[#F5EFE4]/10 text-[#F4D06F] transition-transform group-hover:scale-105">
              <svg viewBox="0 0 28 28" className="h-5 w-5" fill="none">
                <rect
                  x="5"
                  y="5"
                  width="18"
                  height="18"
                  rx="1.5"
                  stroke="#F4D06F"
                  strokeWidth="1.6"
                />
                <line x1="9" y1="10" x2="19" y2="10" stroke="#D4AF37" strokeWidth="1.4" />
                <line x1="9" y1="14" x2="19" y2="14" stroke="#D4AF37" strokeWidth="1.4" />
                <line x1="9" y1="18" x2="15" y2="18" stroke="#D4AF37" strokeWidth="1.4" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <div className=" flex items-center gap-1.5">
                <span className="font-display truncate text-sm font-medium text-[#F4D06F] group-hover:text-[#FFF275]">
                  สมุดข่อยสาระประเพณี
                </span>
              </div>
              <div className="font-heading flex items-center gap-1.5 text-[11px] text-[#FFFDF7]/65">
                <span className="inline-block border border-[#FF8C42]/60 bg-[#FF8C42]/20 px-1.5 py-0.2 text-[9px] font-semibold text-[#FFF275]">
                  เร็วๆ นี้
                </span>
                <span className="truncate">ตำนานลอยกระทง</span>
              </div>
            </div>
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};
