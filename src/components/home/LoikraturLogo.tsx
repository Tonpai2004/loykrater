'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const LoikraturLogo: React.FC = () => {
  return (
    <div className="flex flex-col items-center text-center">
      {/* Traditional Thai Geometric Emblem (ตราสัญลักษณ์ประทีปคู่สายชลและจันทรา) */}
      <motion.div
        initial={{ scale: 0.88, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative mb-4 flex h-32 w-32 items-center justify-center sm:h-36 sm:w-36"
      >
        {/* Outer soft golden aura */}
        <motion.div
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.35, 0.6, 0.35],
          }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="pointer-events-none absolute inset-0 rounded-full bg-radial from-[#F4D06F]/35 via-[#FF8C42]/12 to-transparent blur-xl"
        />

        <svg
          viewBox="0 0 180 180"
          className="relative h-full w-full drop-shadow-[0_10px_28px_rgba(244,208,111,0.3)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="goldFrameGrad" x1="0" y1="0" x2="180" y2="180" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFF275" />
              <stop offset="50%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#FF8C42" />
            </linearGradient>
            <linearGradient id="lotusPinkGrad" x1="90" y1="75" x2="90" y2="128" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FF99C8" />
              <stop offset="100%" stopColor="#B83B2A" />
            </linearGradient>
            <linearGradient id="leafGreenGrad" x1="50" y1="110" x2="130" y2="135" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#52B788" />
              <stop offset="100%" stopColor="#1B4332" />
            </linearGradient>
            <radialGradient id="moonGlowGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFDF7" stopOpacity="0.95" />
              <stop offset="65%" stopColor="#F4D06F" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#F4D06F" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Outer Thai Yomum Octagonal Brass Frame */}
          <polygon
            points="54,10 126,10 170,54 170,126 126,170 54,170 10,126 10,54"
            fill="#0B0E17"
            fillOpacity="0.78"
            stroke="url(#goldFrameGrad)"
            strokeWidth="2.2"
          />
          <polygon
            points="58,17 122,17 163,58 163,122 122,163 58,163 17,122 17,58"
            stroke="#D4AF37"
            strokeOpacity="0.45"
            strokeWidth="1"
            strokeDasharray="3 3"
          />

          {/* Corner Thai Diamond Ornaments */}
          <rect x="86" y="6" width="8" height="8" transform="rotate(45 90 10)" fill="#F4D06F" />
          <rect x="86" y="166" width="8" height="8" transform="rotate(45 90 170)" fill="#F4D06F" />
          <rect x="6" y="86" width="8" height="8" transform="rotate(45 10 90)" fill="#F4D06F" />
          <rect x="166" y="86" width="8" height="8" transform="rotate(45 170 90)" fill="#F4D06F" />

          {/* Full Moon at the top */}
          <circle cx="90" cy="48" r="24" fill="url(#moonGlowGrad)" />
          <circle cx="90" cy="48" r="14" fill="#FFFDF7" fillOpacity="0.92" />

          {/* Small floating sky lanterns flanking the moon */}
          <g opacity="0.88">
            <path d="M46 42 L54 42 L56 54 L44 54 Z" fill="#FF8C42" stroke="#FFF275" strokeWidth="0.9" />
            <circle cx="50" cy="54" r="2.2" fill="#FFF275" />
            <path d="M126 38 L134 38 L136 50 L124 50 Z" fill="#FF8C42" stroke="#FFF275" strokeWidth="0.9" />
            <circle cx="130" cy="50" r="2.2" fill="#FFF275" />
          </g>

          {/* Candle & Flame in Center */}
          <rect x="87.5" y="74" width="5" height="18" rx="1.5" fill="#F4D06F" />
          <path
            d="M90 56 C94 64, 95 70, 90 74 C85 70, 86 64, 90 56 Z"
            fill="#FFF275"
          />
          <path
            d="M90 60 C92.5 65, 93 69, 90 72 C87 69, 87.5 65, 90 60 Z"
            fill="#FF8C42"
          />

          {/* Three Incense Sticks */}
          <line x1="84" y1="77" x2="88" y2="92" stroke="#D4AF37" strokeWidth="1.1" />
          <line x1="90" y1="76" x2="90" y2="92" stroke="#D4AF37" strokeWidth="1.1" />
          <line x1="96" y1="77" x2="92" y2="92" stroke="#D4AF37" strokeWidth="1.1" />

          {/* Geometric Lotus Petals (กลีบบัวสัตตบงกช) */}
          <path d="M90 79 L104 106 L76 106 Z" fill="url(#lotusPinkGrad)" stroke="#FFF275" strokeWidth="1" />
          <path d="M73 84 L92 108 L62 108 Z" fill="#FF99C8" fillOpacity="0.9" stroke="#F4D06F" strokeWidth="0.9" />
          <path d="M107 84 L118 108 L88 108 Z" fill="#FF99C8" fillOpacity="0.9" stroke="#F4D06F" strokeWidth="0.9" />
          <path d="M58 92 L78 111 L50 111 Z" fill="#E0AAFF" fillOpacity="0.85" stroke="#D4AF37" strokeWidth="0.8" />
          <path d="M122 92 L130 111 L102 111 Z" fill="#E0AAFF" fillOpacity="0.85" stroke="#D4AF37" strokeWidth="0.8" />

          {/* Banana Leaf Krathong Base (ฐานกลีบใบตอง) */}
          <path d="M44 110 L136 110 L126 126 L54 126 Z" fill="url(#leafGreenGrad)" stroke="#F4D06F" strokeWidth="1.3" />
          <path d="M54 110 L63 122 L72 110 L81 122 L90 110 L99 122 L108 110 L117 122 L126 110" stroke="#FFF275" strokeWidth="0.9" strokeOpacity="0.7" />

          {/* Golden River Ripples Below */}
          <path d="M36 135 Q90 142 144 135" stroke="#F4D06F" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M48 144 Q90 150 132 144" stroke="#D4AF37" strokeWidth="1.2" strokeOpacity="0.75" strokeLinecap="round" />
          <path d="M64 152 Q90 156 116 152" stroke="#F4D06F" strokeWidth="1" strokeOpacity="0.5" strokeLinecap="round" />
        </svg>
      </motion.div>

      {/* Ornamental Tag */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.5 }}
        className="mb-2 inline-flex items-center gap-2.5 border border-[#D4AF37]/45 bg-[#0B0E17]/80 px-4 py-1 backdrop-blur-md"
      >
        <span className="h-1.5 w-1.5 rotate-45 bg-[#F4D06F]" />
        <span className="h-1.5 w-1.5 rotate-45 bg-[#F4D06F]" />
      </motion.div>

      {/* Main Title */}
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.55 }}
        className="font-display bg-gradient-to-b from-[#FFFDF7] via-[#FFF275] to-[#D4AF37] bg-clip-text text-5xl font-semibold tracking-wide text-transparent drop-shadow-[0_6px_24px_rgba(244,208,111,0.28)] sm:text-6xl md:text-7xl"
      >
        ลอยกะเธอ
      </motion.h1>

      {/* English Editorial Subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.28, duration: 0.5 }}
        className="font-editorial mt-1 text-sm tracking-[0.3em] text-[#F4D06F]/85 uppercase sm:text-base"
      >
        LOIKRATUR • WATERFRONT &amp; SKY SANCTUARY
      </motion.p>

      {/* Poetic Description */}
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5 }}
        className="font-heading mt-3 max-w-lg text-xs leading-relaxed text-[#FFFDF7]/85 sm:text-sm"
      >
        ร่วมประดิษฐ์กระทงใบตองและโคมลอย จารึกคำอธิษฐานลงบนกระดาษสา
        <br className="hidden sm:inline" />
        แล้วหยิบปล่อยสู่สายชลและผืนฟ้าคืนเพ็ญด้วยมือของคุณเอง
      </motion.p>
    </div>
  );
};
