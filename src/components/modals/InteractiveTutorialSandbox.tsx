'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RefreshDouble } from 'iconoir-react';
import { RitualItemType } from '@/types/krathong';

export const InteractiveTutorialSandbox: React.FC = () => {
  const [practiceType, setPracticeType] = useState<RitualItemType>('krathong');
  const [isGrabbed, setIsGrabbed] = useState<boolean>(false);
  const [isReleased, setIsReleased] = useState<boolean>(false);
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 50, y: 30 });
  const stageRef = useRef<HTMLDivElement | null>(null);

  const getInitialPos = useCallback((type: RitualItemType) => {
    return type === 'krathong' ? { x: 50, y: 28 } : { x: 50, y: 74 };
  }, []);

  const getTargetPos = useCallback((type: RitualItemType) => {
    return type === 'krathong' ? { x: 50, y: 75 } : { x: 50, y: 24 };
  }, []);

  const handleSelectType = (type: RitualItemType) => {
    setPracticeType(type);
    setIsGrabbed(false);
    setIsReleased(false);
    setPos(getInitialPos(type));
  };

  const handleReset = () => {
    setIsGrabbed(false);
    setIsReleased(false);
    setPos(getInitialPos(practiceType));
  };

  const target = getTargetPos(practiceType);
  const distanceToTarget = Math.hypot(pos.x - target.x, pos.y - target.y);
  const isInsideTarget = distanceToTarget <= 18;

  const updatePointerPos = (clientX: number, clientY: number) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const xPct = Math.max(12, Math.min(88, ((clientX - rect.left) / rect.width) * 100));
    const yPct = Math.max(14, Math.min(86, ((clientY - rect.top) / rect.height) * 100));
    setPos({ x: xPct, y: yPct });
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isReleased) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsGrabbed(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isGrabbed || isReleased) return;
    updatePointerPos(e.clientX, e.clientY);
  };

  const handlePointerUp = () => {
    if (!isGrabbed || isReleased) return;
    setIsGrabbed(false);
    if (isInsideTarget) {
      setIsReleased(true);
      setPos(target);
    } else {
      // Snap back to initial position if released outside target
      setPos(getInitialPos(practiceType));
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#B89047]/35 pb-2.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSelectType('krathong')}
            className={`cursor-pointer border px-3 py-1.5 text-xs font-semibold transition-all ${
              practiceType === 'krathong'
                ? 'border-[#1C1815] bg-[#1C1815] text-[#F4D06F]'
                : 'border-[#B89047]/50 bg-[#FFFDF7]/70 text-[#4A3B2C] hover:border-[#1C1815]'
            }`}
          >
            ๑. ฝึกหยิบลอยกระทง (ลงน้ำ)
          </button>
          <button
            type="button"
            onClick={() => handleSelectType('lantern')}
            className={`cursor-pointer border px-3 py-1.5 text-xs font-semibold transition-all ${
              practiceType === 'lantern'
                ? 'border-[#1C1815] bg-[#1C1815] text-[#FF8C42]'
                : 'border-[#B89047]/50 bg-[#FFFDF7]/70 text-[#4A3B2C] hover:border-[#1C1815]'
            }`}
          >
            ๒. ฝึกหยิบปล่อยโคมลอย (ขึ้นฟ้า)
          </button>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex cursor-pointer items-center gap-1.5 border border-[#8C6D3F] bg-[#FFFDF7] px-2.5 py-1 text-xs font-medium text-[#1C1815] hover:bg-[#EFE6D4]"
        >
          <RefreshDouble width={13} height={13} />
          เริ่มฝึกใหม่
        </button>
      </div>

      {/* Step Status Banner */}
      <div className="flex items-center justify-between border border-[#B89047]/45 bg-[#FFFDF7]/90 px-3.5 py-2 text-xs">
        <div className="flex items-center gap-2 font-medium text-[#1C1815]">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center bg-[#1C1815] text-[11px] font-bold text-[#F4D06F]">
            {isReleased ? '✓' : isInsideTarget && isGrabbed ? '๓' : isGrabbed ? '๒' : '๑'}
          </span>
          <span>
            {isReleased
              ? practiceType === 'krathong'
                ? 'สำเร็จ! กระทงลอยลงสู่สายน้ำเรียบร้อยแล้ว (เมื่อเล่นจริงต้องปล่อยนิ้วในวงแสงเช่นนี้)'
                : 'สำเร็จ! โคมลอยพุ่งขึ้นสู่ท้องฟ้าเรียบร้อยแล้ว (เมื่อปล่อยนิ้วในวงแสงโคมจึงจะลอยขึ้น)'
              : isGrabbed && isInsideTarget
                ? 'อยู่ในจุดวางแล้ว! ปล่อยนิ้ว / คลายมือ ตอนนี้เพื่อปล่อยลอยได้เลย!'
                : isGrabbed
                  ? practiceType === 'krathong'
                    ? 'กำลังหยิบอยู่! ลากลงไปยัง "วงแสงสีทองบนผืนน้ำ" ด้านล่าง (อย่าเพิ่งปล่อยมือ)'
                    : 'กำลังหยิบอยู่! ลากขึ้นไปยัง "วงแสงสีส้มบนท้องฟ้า" ด้านบน (อย่าเพิ่งปล่อยมือ)'
                  : 'กดค้างที่เครื่องสักการะ (จำลองการจีบนิ้วหยิบ) แล้วลากไปยังวงแสงเป้าหมาย'}
          </span>
        </div>
      </div>

      {/* Interactive Mini River & Sky Stage */}
      <div
        ref={stageRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative h-64 w-full overflow-hidden border-2 border-[#8C6D3F] bg-gradient-to-b from-[#0D1321] via-[#1A1B41] to-[#102538] select-none touch-none sm:h-72"
      >
        {/* Night Sky Stars & Moon */}
        <div className="pointer-events-none absolute top-3 right-6 h-10 w-10 rounded-full bg-[#FFFDF7]/90 shadow-[0_0_24px_#F4D06F]" />
        <div className="pointer-events-none absolute top-4 left-8 text-[10px] tracking-widest text-[#F4D06F]/70 uppercase">
          น่านฟ้าคืนเพ็ญ (โซนปล่อยโคมลอย)
        </div>

        {/* Horizon Water Divider */}
        <div className="pointer-events-none absolute inset-x-0 top-[54%] border-t border-dashed border-[#D4AF37]/35" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[46%] bg-gradient-to-b from-[#0E2438]/75 to-[#071320]/95" />
        <div className="pointer-events-none absolute bottom-3 left-4 text-[10px] tracking-widest text-[#F4D06F]/70 uppercase">
          ผืนน้ำเจ้าพระยา (โซนวางกระทง)
        </div>

        {/* Target Drop Ring */}
        {!isReleased && (
          <div
            style={{
              left: `${target.x}%`,
              top: `${target.y}%`,
            }}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
          >
            <div
              className={`flex h-24 w-36 flex-col items-center justify-center rounded-full border-2 border-dashed transition-all duration-200 ${
                isInsideTarget && isGrabbed
                  ? 'scale-110 border-[#52B788] bg-[#52B788]/25 shadow-[0_0_28px_rgba(82,183,136,0.6)]'
                  : practiceType === 'krathong'
                    ? 'border-[#F4D06F]/80 bg-[#F4D06F]/10'
                    : 'border-[#FF8C42]/80 bg-[#FF8C42]/10'
              }`}
            >
              <span className="px-2 text-center text-[11px] font-semibold text-[#FFF275] drop-shadow">
                {isInsideTarget && isGrabbed
                  ? 'ปล่อยมือตรงนี้เลย!'
                  : practiceType === 'krathong'
                    ? 'จุดวางกระทงลงน้ำ'
                    : 'จุดปล่อยโคมขึ้นฟ้า'}
              </span>
              <span className="text-[9px] text-[#FFFDF7]/75">
                (ลากมาทับแล้วปล่อยนิ้ว)
              </span>
            </div>
          </div>
        )}

        {/* Draggable Practice Offering Item */}
        <motion.div
          onPointerDown={handlePointerDown}
          animate={
            isReleased
              ? practiceType === 'krathong'
                ? {
                    left: ['50%', '62%', '74%'],
                    top: ['75%', '71%', '66%'],
                    scale: [1, 0.88, 0.76],
                  }
                : {
                    left: ['50%', '45%', '40%'],
                    top: ['24%', '15%', '8%'],
                    scale: [1, 0.85, 0.7],
                  }
              : {
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  scale: isGrabbed ? 1.12 : 1,
                }
          }
          transition={
            isReleased
              ? { duration: 4, ease: 'easeInOut' }
              : { type: 'spring', stiffness: 320, damping: 26 }
          }
          className={`absolute -translate-x-1/2 -translate-y-1/2 ${
            isReleased ? 'cursor-default' : isGrabbed ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          {/* Spotlight Beacon when waiting to be grabbed */}
          {!isReleased && (
            <div
              className={`pointer-events-none absolute -inset-4 rounded-full border-2 transition-all ${
                isGrabbed
                  ? 'border-[#FFF275] bg-[#FFF275]/20 shadow-[0_0_24px_#FFF275]'
                  : 'animate-pulse border-[#F4D06F]/85 bg-[#F4D06F]/15'
              }`}
            />
          )}

          {/* SVG representation of Krathong or Sky Lantern */}
          {practiceType === 'krathong' ? (
            <div className="relative flex flex-col items-center">
              <svg viewBox="0 0 90 70" className="h-16 w-20 drop-shadow-[0_6px_14px_rgba(0,0,0,0.6)]">
                {/* Flame & Candle */}
                <rect x="43" y="16" width="4" height="14" fill="#F4D06F" />
                <path d="M45 4 C48 10, 49 14, 45 17 C41 14, 42 10, 45 4 Z" fill="#FFF275" />
                {/* Lotus Petals */}
                <path d="M45 20 L57 42 L33 42 Z" fill="#FF99C8" stroke="#FFF275" strokeWidth="1" />
                <path d="M33 24 L46 43 L22 43 Z" fill="#FF8C42" stroke="#F4D06F" strokeWidth="0.8" />
                <path d="M57 24 L68 43 L44 43 Z" fill="#FF8C42" stroke="#F4D06F" strokeWidth="0.8" />
                {/* Banana Leaf Base */}
                <path d="M16 42 L74 42 L66 56 L24 56 Z" fill="#2D6A4F" stroke="#F4D06F" strokeWidth="1.2" />
              </svg>
              {!isReleased && (
                <span className="mt-0.5 bg-[#0D1321]/90 px-2 py-0.5 text-[10px] font-semibold text-[#FFF275] border border-[#D4AF37]/50">
                  {isGrabbed ? 'กำลังหยิบกระทง' : 'กดค้างเพื่อหยิบกระทง'}
                </span>
              )}
            </div>
          ) : (
            <div className="relative flex flex-col items-center">
              <svg viewBox="0 0 80 80" className="h-16 w-16 drop-shadow-[0_6px_16px_rgba(255,140,66,0.5)]">
                {/* Sky Lantern Body */}
                <path
                  d="M24 14 L56 14 L62 56 L18 56 Z"
                  fill="#FF8C42"
                  stroke="#FFF275"
                  strokeWidth="1.4"
                />
                <path d="M32 14 L30 56 M48 14 L50 56" stroke="#FFF275" strokeWidth="0.8" strokeOpacity="0.6" />
                {/* Inner Flame Glow */}
                <circle cx="40" cy="56" r="6" fill="#FFF275" />
                <circle cx="40" cy="42" r="10" fill="#FFF275" fillOpacity="0.45" />
              </svg>
              {!isReleased && (
                <span className="mt-0.5 bg-[#0D1321]/90 px-2 py-0.5 text-[10px] font-semibold text-[#FFF275] border border-[#FF8C42]/60">
                  {isGrabbed ? 'กำลังหยิบโคมลอย' : 'กดค้างเพื่อหยิบโคมลอย'}
                </span>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
