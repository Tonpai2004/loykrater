'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AudioVolumeController } from '@/components/AudioVolumeController';
import { GameState } from '@/types/krathong';

interface TopBarControlsProps {
  gameState: GameState;
  onGoHome: () => void;
  onOpenHowToPlay: () => void;
}

export const TopBarControls: React.FC<TopBarControlsProps> = ({
  gameState,
  onGoHome,
  onOpenHowToPlay,
}) => {
  const isAtPier = gameState !== 'HOME';

  return (
    <header className="flex w-full items-start justify-between gap-3">
      {/* Left Navigation (Visible only when at the pier so the Home page remains clean) */}
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
                className="thai-chamfer-sm flex cursor-pointer items-center gap-1.5 border border-[#D4AF37]/45 bg-[#0B0E17]/88 px-3 py-2 text-xs font-medium text-[#FFFDF7]/90 shadow-[0_8px_24px_rgba(0,0,0,0.5)] backdrop-blur-md transition-colors hover:border-[#F4D06F] hover:text-[#FFF275]"
              >
                <span className="h-1.5 w-1.5 rotate-45 bg-[#F4D06F]" />
                <span>หน้าแรก</span>
              </button>

              <button
                type="button"
                onClick={onOpenHowToPlay}
                className="thai-chamfer-sm flex cursor-pointer items-center gap-1.5 border border-[#D4AF37]/45 bg-[#0B0E17]/88 px-3 py-2 text-xs font-medium text-[#F4D06F] shadow-[0_8px_24px_rgba(0,0,0,0.5)] backdrop-blur-md transition-colors hover:border-[#FFF275] hover:text-[#FFF275]"
              >
                <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none">
                  <path
                    d="M2 5 L7 3.5 L13 5 L18 3.5 L18 15 L13 16.5 L7 15 L2 16.5 Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <line x1="7" y1="3.5" x2="7" y2="15" stroke="currentColor" strokeWidth="1.2" />
                  <line x1="13" y1="5" x2="13" y2="16.5" stroke="currentColor" strokeWidth="1.2" />
                </svg>
                <span>สมุดข่อยวิธีเล่น</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right Audio Volume Controller */}
      <AudioVolumeController />
    </header>
  );
};
