'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

export const LoyKraTerLogo: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center text-center">
      <motion.div
        className="lk-enter [--lk-enter-dur:0.7s] [--lk-enter-scale:0.88] relative mb-[clamp(0.25rem,1.5dvh,0.75rem)] flex size-[clamp(4.5rem,15dvh,9rem)] items-center justify-center [@media(max-height:440px)]:hidden"
      >
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
            <linearGradient
              id="goldFrameGrad"
              x1="0"
              y1="0"
              x2="180"
              y2="180"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#FFF275" />
              <stop offset="50%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#FF8C42" />
            </linearGradient>
            <linearGradient
              id="lotusPinkGrad"
              x1="90"
              y1="75"
              x2="90"
              y2="128"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#FF99C8" />
              <stop offset="100%" stopColor="#B83B2A" />
            </linearGradient>
            <linearGradient
              id="leafGreenGrad"
              x1="50"
              y1="110"
              x2="130"
              y2="135"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#52B788" />
              <stop offset="100%" stopColor="#1B4332" />
            </linearGradient>
            <radialGradient id="moonGlowGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFDF7" stopOpacity="0.95" />
              <stop offset="65%" stopColor="#F4D06F" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#F4D06F" stopOpacity="0" />
            </radialGradient>
          </defs>

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

          <rect
            x="86"
            y="6"
            width="8"
            height="8"
            transform="rotate(45 90 10)"
            fill="#F4D06F"
          />
          <rect
            x="86"
            y="166"
            width="8"
            height="8"
            transform="rotate(45 90 170)"
            fill="#F4D06F"
          />
          <rect
            x="6"
            y="86"
            width="8"
            height="8"
            transform="rotate(45 10 90)"
            fill="#F4D06F"
          />
          <rect
            x="166"
            y="86"
            width="8"
            height="8"
            transform="rotate(45 170 90)"
            fill="#F4D06F"
          />

          <circle cx="90" cy="48" r="24" fill="url(#moonGlowGrad)" />
          <circle cx="90" cy="48" r="14" fill="#FFFDF7" fillOpacity="0.92" />

          <g opacity="0.88">
            <path
              d="M46 42 L54 42 L56 54 L44 54 Z"
              fill="#FF8C42"
              stroke="#FFF275"
              strokeWidth="0.9"
            />
            <circle cx="50" cy="54" r="2.2" fill="#FFF275" />
            <path
              d="M126 38 L134 38 L136 50 L124 50 Z"
              fill="#FF8C42"
              stroke="#FFF275"
              strokeWidth="0.9"
            />
            <circle cx="130" cy="50" r="2.2" fill="#FFF275" />
          </g>

          <rect
            x="87.5"
            y="74"
            width="5"
            height="18"
            rx="1.5"
            fill="#F4D06F"
          />
          <path
            d="M90 56 C94 64, 95 70, 90 74 C85 70, 86 64, 90 56 Z"
            fill="#FFF275"
          />
          <path
            d="M90 60 C92.5 65, 93 69, 90 72 C87 69, 87.5 65, 90 60 Z"
            fill="#FF8C42"
          />

          <line
            x1="84"
            y1="77"
            x2="88"
            y2="92"
            stroke="#D4AF37"
            strokeWidth="1.1"
          />
          <line
            x1="90"
            y1="76"
            x2="90"
            y2="92"
            stroke="#D4AF37"
            strokeWidth="1.1"
          />
          <line
            x1="96"
            y1="77"
            x2="92"
            y2="92"
            stroke="#D4AF37"
            strokeWidth="1.1"
          />

          <path
            d="M90 79 L104 106 L76 106 Z"
            fill="url(#lotusPinkGrad)"
            stroke="#FFF275"
            strokeWidth="1"
          />
          <path
            d="M73 84 L92 108 L62 108 Z"
            fill="#FF99C8"
            fillOpacity="0.9"
            stroke="#F4D06F"
            strokeWidth="0.9"
          />
          <path
            d="M107 84 L118 108 L88 108 Z"
            fill="#FF99C8"
            fillOpacity="0.9"
            stroke="#F4D06F"
            strokeWidth="0.9"
          />
          <path
            d="M58 92 L78 111 L50 111 Z"
            fill="#E0AAFF"
            fillOpacity="0.85"
            stroke="#D4AF37"
            strokeWidth="0.8"
          />
          <path
            d="M122 92 L130 111 L102 111 Z"
            fill="#E0AAFF"
            fillOpacity="0.85"
            stroke="#D4AF37"
            strokeWidth="0.8"
          />

          <path
            d="M44 110 L136 110 L126 126 L54 126 Z"
            fill="url(#leafGreenGrad)"
            stroke="#F4D06F"
            strokeWidth="1.3"
          />
          <path
            d="M54 110 L63 122 L72 110 L81 122 L90 110 L99 122 L108 110 L117 122 L126 110"
            stroke="#FFF275"
            strokeWidth="0.9"
            strokeOpacity="0.7"
          />

          <path
            d="M36 135 Q90 142 144 135"
            stroke="#F4D06F"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M48 144 Q90 150 132 144"
            stroke="#D4AF37"
            strokeWidth="1.2"
            strokeOpacity="0.75"
            strokeLinecap="round"
          />
          <path
            d="M64 152 Q90 156 116 152"
            stroke="#F4D06F"
            strokeWidth="1"
            strokeOpacity="0.5"
            strokeLinecap="round"
          />
        </svg>
      </motion.div>

      <motion.h1
        className="lk-enter [--lk-enter-delay:0.16s] [--lk-enter-dur:0.55s] [--lk-enter-y:12px] font-display bg-gradient-to-b from-[#FFFDF7] via-[#FFF275] to-[#D4AF37] bg-clip-text pl-[0.22em] text-[clamp(1.75rem,min(7.5vw,9dvh),4.5rem)] leading-tight font-semibold tracking-[0.22em] whitespace-nowrap text-transparent drop-shadow-[0_6px_24px_rgba(244,208,111,0.28)] [word-spacing:0.3em]"
      >
        {t.home.title}
      </motion.h1>

      <motion.p
        className="lk-enter [--lk-enter-delay:0.24s] font-editorial mt-1 pl-[0.26em] text-[clamp(0.6rem,2.6vw,1rem)] tracking-[0.26em] whitespace-nowrap text-[#F4D06F]/85 uppercase"
      >
        {t.home.subtitle}
      </motion.p>

      <motion.p
        className="lk-enter [--lk-enter-delay:0.32s] [--lk-enter-y:8px] font-heading mt-[clamp(0.5rem,1.6dvh,0.75rem)] max-w-[34rem] text-[13px] leading-relaxed text-balance text-[#FFFDF7]/85 sm:text-sm [@media(max-height:440px)]:hidden"
      >
        {t.home.descriptionLine1} {t.home.descriptionLine2}
      </motion.p>
    </div>
  );
};
