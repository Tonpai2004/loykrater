'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  VideoCamera,
  VideoCameraOff,
  Undo,
  SendDiagonal,
  RefreshDouble,
} from 'iconoir-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { GameState, HandGestureState } from '@/types/krathong';

interface HandTrackerHUDProps {
  gameState: GameState;
  videoRef: React.RefCallback<HTMLVideoElement>;
  gestureState: HandGestureState;
  cameraEnabled: boolean;
  releasedCount: number;
  totalCount: number;
  onToggleCamera: () => void;
  onRetryCamera: () => void;
  onBackToCustomize: () => void;
  onQuickLaunch: () => void;
  onCreateAnother: () => void;
  onOpenBlessingModal: () => void;
}

const SPRING_TRANSITION = {
  type: 'spring' as const,
  stiffness: 100,
  damping: 16,
};

export const HandTrackerHUD: React.FC<HandTrackerHUDProps> = ({
  gameState,
  videoRef,
  gestureState,
  cameraEnabled,
  releasedCount,
  totalCount,
  onToggleCamera,
  onRetryCamera,
  onBackToCustomize,
  onQuickLaunch,
  onCreateAnother,
  onOpenBlessingModal,
}) => {
  const { t } = useLanguage();
  const detectedHandCount = gestureState.hands?.length ?? 0;

  return (
    <div className="pointer-events-none flex w-full shrink-0 flex-row items-end justify-between gap-2 sm:gap-4">
      {gameState === 'INTERACT' && (
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={SPRING_TRANSITION}
          className="thai-chamfer pointer-events-auto relative w-[clamp(8.5rem,min(26dvh,40vw),15rem)] shrink-0 border border-[#D4AF37]/45 bg-[#0B0E17]/95 p-1.5 shadow-[0_16px_42px_rgba(0,0,0,0.75)] backdrop-blur-md sm:p-2"
        >
          <div className="relative aspect-video w-full overflow-hidden border border-[#D4AF37]/25 bg-[#070910]">
            <video
              ref={videoRef}
              playsInline
              muted
              className={`h-full w-full -scale-x-100 object-cover transition-opacity ${
                cameraEnabled && gestureState.isReady ? 'opacity-90' : 'opacity-20'
              }`}
            />

            {!cameraEnabled && (
              <div className="font-heading absolute inset-0 flex flex-col items-center justify-center p-1.5 text-center text-[10px] leading-snug text-[#FFFDF7]/75 sm:p-2 sm:text-[11px]">
                <VideoCameraOff
                  width={20}
                  height={20}
                  strokeWidth={1.6}
                  className="mb-1 text-[#D4AF37]"
                />
                {t.hud.mouseFallbackHint}
              </div>
            )}

            {cameraEnabled && gestureState.error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#070910]/95 px-2 pt-6 pb-2 text-center">
                <p
                  title={gestureState.error}
                  className="font-heading mb-1.5 line-clamp-2 text-[10px] text-balance text-[#FF99C8]"
                >
                  {t.hud.cameraError}
                </p>
                <button
                  type="button"
                  onClick={onRetryCamera}
                  className="font-heading flex cursor-pointer items-center gap-1 border border-[#D4AF37]/40 bg-[#D4AF37]/15 px-2.5 py-1 text-[10px] whitespace-nowrap text-[#FFF275]"
                >
                  <RefreshDouble width={12} height={12} />
                  {t.hud.retryCamera}
                </button>
              </div>
            )}

            <div className="absolute top-1 left-1 flex max-w-[calc(100%-0.5rem)] items-center gap-1.5 border border-[#D4AF37]/30 bg-[#070910]/90 px-1.5 py-0.5 text-[9px] whitespace-nowrap sm:top-1.5 sm:left-1.5 sm:px-2 sm:text-[10px]">
              <span
                className={`h-1.5 w-1.5 rotate-45 ${
                  gestureState.isPinching
                    ? 'animate-ping bg-[#FFF275]'
                    : gestureState.isTracking
                    ? 'bg-[#52B788]'
                    : 'bg-white/40'
                }`}
              />
              <span className="font-heading truncate text-[#FFFDF7]">
                {gestureState.isPinching
                  ? t.hud.pinching
                  : gestureState.isTracking
                  ? t.hud.handsDetected(detectedHandCount)
                  : cameraEnabled
                  ? t.hud.searchingHand
                  : t.hud.camOff}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-1.5 pt-1.5 pb-0.5 text-[11px] text-[#FFFDF7] sm:pt-2">
            <span className="font-heading text-[10px] whitespace-nowrap text-[#F4D06F] sm:text-[11px]">
              {t.hud.releasedProgress(releasedCount, totalCount)}
            </span>
            <button
              type="button"
              onClick={onToggleCamera}
              aria-label={cameraEnabled ? t.hud.camToggleOff : t.hud.camToggleOn}
              className="font-heading flex shrink-0 cursor-pointer items-center gap-1 border border-white/15 bg-white/5 px-1.5 py-1 text-[10px] whitespace-nowrap text-[#FFFDF7]/85 transition-colors hover:border-[#D4AF37]/50 sm:px-2 sm:py-0.5"
            >
              {cameraEnabled ? (
                <>
                  <VideoCameraOff width={12} height={12} className="text-[#B83B2A]" />
                  <span className="hidden sm:inline">{t.hud.camToggleOff}</span>
                </>
              ) : (
                <>
                  <VideoCamera width={12} height={12} className="text-[#D4AF37]" />
                  <span className="hidden sm:inline">{t.hud.camToggleOn}</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}

      {gameState === 'INTERACT' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRING_TRANSITION}
          className="pointer-events-auto flex flex-col items-stretch gap-2 self-end sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-2.5"
        >
          <div className="font-heading hidden border border-[#D4AF37]/35 bg-[#0B0E17]/90 px-4 py-2 text-xs whitespace-nowrap text-[#FFF275] backdrop-blur-md xl:block">
            {t.hud.interactInstruction} ({releasedCount}/{totalCount})
          </div>

          <button
            type="button"
            onClick={onBackToCustomize}
            className="thai-chamfer-sm font-heading flex cursor-pointer items-center justify-center gap-1.5 border border-[#D4AF37]/40 bg-[#0B0E17]/90 px-4 py-2.5 text-xs font-medium whitespace-nowrap text-[#FFFDF7] transition-colors hover:border-[#D4AF37]"
          >
            <Undo width={15} height={15} className="text-[#D4AF37]" />
            <span>{t.hud.backToCustomize}</span>
          </button>

          <button
            type="button"
            onClick={onQuickLaunch}
            className="thai-chamfer-sm font-heading flex cursor-pointer items-center justify-center gap-2 bg-[#D4AF37] px-5 py-2.5 text-xs font-semibold whitespace-nowrap text-[#0B0E17] transition-colors hover:bg-[#FFF275]"
          >
            <SendDiagonal width={15} height={15} strokeWidth={2} />
            <span>{t.hud.quickLaunchAll}</span>
          </button>
        </motion.div>
      )}

      {gameState === 'FLOATING' && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRING_TRANSITION}
          className="thai-chamfer pointer-events-auto mx-auto flex w-full max-w-md flex-col items-center gap-3 border border-[#D4AF37]/45 bg-[#0B0E17]/95 px-4 py-3.5 text-center shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-md sm:w-auto sm:max-w-none sm:gap-5 sm:px-6 sm:py-4 md:flex-row md:text-left"
        >
          <div>
            <h3 className="font-display text-[15px] font-normal text-balance text-[#FFFDF7] sm:text-base">
              {t.hud.floatingTitle}
            </h3>
            <p className="font-heading mt-0.5 text-xs text-balance text-[#FFF275]/85">
              {t.hud.floatingSub}
            </p>
          </div>

          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center sm:gap-2.5">
            <button
              type="button"
              onClick={onOpenBlessingModal}
              className="thai-chamfer-sm font-heading flex cursor-pointer items-center justify-center gap-1.5 border border-[#D4AF37]/50 bg-[#141932] px-3 py-2.5 text-xs font-medium whitespace-nowrap text-[#FFF275] sm:px-4 transition-colors hover:bg-[#D4AF37]/20"
            >
              <span>{t.hud.receiveBlessingBtn}</span>
            </button>

            <button
              type="button"
              onClick={onCreateAnother}
              className="thai-chamfer-sm font-heading cursor-pointer bg-[#B83B2A] px-3 py-2.5 text-xs font-medium whitespace-nowrap text-[#FFFDF7] sm:px-5 transition-colors hover:bg-[#D4AF37] hover:text-[#0B0E17]"
            >
              {t.hud.createAnotherBtn}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
