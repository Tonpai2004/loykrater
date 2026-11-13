'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  VideoCamera,
  VideoCameraOff,
  Undo,
  SendDiagonal,
  RefreshDouble,
  Sparks,
} from 'iconoir-react';
import { GameState, HandGestureState } from '@/types/krathong';

interface HandTrackerHUDProps {
  gameState: GameState;
  videoRef: React.RefObject<HTMLVideoElement | null>;
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
  const detectedHandCount = gestureState.hands?.length ?? 0;

  return (
    <div className="pointer-events-none flex w-full flex-col justify-between gap-4 sm:flex-row sm:items-end">
      {gameState === 'INTERACT' && (
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={SPRING_TRANSITION}
          className="thai-chamfer pointer-events-auto relative w-52 border border-[#D4AF37]/45 bg-[#0B0E17]/95 p-2 shadow-[0_16px_42px_rgba(0,0,0,0.75)] backdrop-blur-md sm:w-60"
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
              <div className="font-heading absolute inset-0 flex flex-col items-center justify-center p-2 text-center text-[11px] text-[#FFFDF7]/75">
                <VideoCameraOff
                  width={20}
                  height={20}
                  strokeWidth={1.6}
                  className="mb-1 text-[#D4AF37]"
                />
                ใช้เมาส์หรือนิ้วลากประทีปไปยังวงแสงได้
              </div>
            )}

            {cameraEnabled && gestureState.error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#070910]/95 p-2 text-center">
                <p className="font-heading mb-1.5 line-clamp-2 text-[10px] text-[#FF99C8]">
                  {gestureState.error}
                </p>
                <button
                  type="button"
                  onClick={onRetryCamera}
                  className="font-heading flex items-center gap-1 border border-[#D4AF37]/40 bg-[#D4AF37]/15 px-2.5 py-1 text-[10px] text-[#FFF275]"
                >
                  <RefreshDouble width={12} height={12} />
                  ลองเปิดกล้องใหม่
                </button>
              </div>
            )}

            <div className="absolute top-1.5 left-1.5 flex items-center gap-1.5 border border-[#D4AF37]/30 bg-[#070910]/90 px-2 py-0.5 text-[10px]">
              <span
                className={`h-1.5 w-1.5 rotate-45 ${
                  gestureState.isPinching
                    ? 'animate-ping bg-[#FFF275]'
                    : gestureState.isTracking
                    ? 'bg-[#52B788]'
                    : 'bg-white/40'
                }`}
              />
              <span className="font-heading text-[#FFFDF7]">
                {gestureState.isPinching
                  ? 'กำลังจีบนิ้วประคองเครื่องลอย'
                  : gestureState.isTracking
                  ? `ตรวจพบหัตถา ${detectedHandCount} ข้าง`
                  : cameraEnabled
                  ? 'ยกมือขึ้นหน้ากระจกฉาย...'
                  : 'โหมดเมาส์ / สัมผัส'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 pb-0.5 text-[11px] text-[#FFFDF7]">
            <span className="font-heading text-[11px] text-[#F4D06F]">
              ส่งคำพรแล้ว {releasedCount} / {totalCount} ชิ้น
            </span>
            <button
              type="button"
              onClick={onToggleCamera}
              className="font-heading flex items-center gap-1 border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] text-[#FFFDF7]/85 transition-colors hover:border-[#D4AF37]/50"
            >
              {cameraEnabled ? (
                <>
                  <VideoCameraOff width={12} height={12} className="text-[#B83B2A]" />
                  <span>ปิดกล้อง</span>
                </>
              ) : (
                <>
                  <VideoCamera width={12} height={12} className="text-[#D4AF37]" />
                  <span>เปิดกล้อง</span>
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
          className="pointer-events-auto flex flex-wrap items-center gap-2.5 self-end"
        >
          <div className="font-wish hidden border border-[#D4AF37]/35 bg-[#0B0E17]/90 px-4 py-2 text-sm text-[#FFF275] backdrop-blur-md md:block">
            “จีบนิ้วงามประคองกระทงลงวงน้ำ หรือส่งโคมทองล่องสู่ฟากฟ้าคราม” ({releasedCount}/{totalCount})
          </div>

          <button
            type="button"
            onClick={onBackToCustomize}
            className="thai-chamfer-sm font-heading flex items-center gap-1.5 border border-[#D4AF37]/40 bg-[#0B0E17]/90 px-4 py-2.5 text-xs font-medium text-[#FFFDF7] transition-colors hover:border-[#D4AF37]"
          >
            <Undo width={15} height={15} className="text-[#D4AF37]" />
            <span>หวนคืนลานลอยประทีป</span>
          </button>

          <button
            type="button"
            onClick={onQuickLaunch}
            className="thai-chamfer-sm font-heading flex items-center gap-2 bg-[#D4AF37] px-5 py-2.5 text-xs font-semibold text-[#0B0E17] transition-colors hover:bg-[#FFF275]"
          >
            <SendDiagonal width={15} height={15} strokeWidth={2} />
            <span>ลอยส่งคำพรทั้งหมดบัดเดี๋ยวนี้</span>
          </button>
        </motion.div>
      )}

      {gameState === 'FLOATING' && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRING_TRANSITION}
          className="thai-chamfer pointer-events-auto mx-auto flex flex-col items-center gap-5 border border-[#D4AF37]/45 bg-[#0B0E17]/95 px-6 py-4 text-center shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-md sm:flex-row sm:text-left"
        >
          <div>
            <p className="font-heading text-[11px] tracking-wider text-[#F4D06F]">
              เสร็จสิ้นพิธีลอยประทีป • ณ ท่าพระนคร
            </p>
            <h3 className="font-display text-base font-normal text-[#FFFDF7]">
              ประทีปน้อยลอยล่องลับคุ้งน้ำและผืนฟ้าแล้ว
            </h3>
            <p className="font-wish text-sm text-[#FFF275]/85">
              “สายน้ำไหลไปไม่ไหลกลับ ขอคำพรของเจ้าจงประดับไว้ในใจจันทร์”
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onOpenBlessingModal}
              className="thai-chamfer-sm font-heading flex items-center gap-1.5 border border-[#D4AF37]/50 bg-[#141932] px-4 py-2.5 text-xs font-medium text-[#FFF275] transition-colors hover:bg-[#D4AF37]/20"
            >
              <Sparks width={15} height={15} className="text-[#D4AF37]" />
              <span>เปิดสาส์นอวยพรพระแม่คงคา</span>
            </button>

            <button
              type="button"
              onClick={onCreateAnother}
              className="thai-chamfer-sm font-heading bg-[#B83B2A] px-5 py-2.5 text-xs font-medium text-[#FFFDF7] transition-colors hover:bg-[#D4AF37] hover:text-[#0B0E17]"
            >
              พับกระทงลอยอีกรอบ
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
