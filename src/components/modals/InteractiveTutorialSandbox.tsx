'use client';

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { RefreshDouble, VideoCamera, VideoCameraOff } from 'iconoir-react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  drawIllustratedHands,
  drawInteractiveSkyLantern,
  drawProceduralKrathong,
} from '@/lib/canvasRenderer';
import {
  HandGestureState,
  KrathongConfig,
  RitualItemType,
} from '@/types/krathong';
import { keepThaiPhrases } from '@/lib/thaiText';

interface InteractiveTutorialSandboxProps {
  videoRef: React.RefCallback<HTMLVideoElement>;
  gestureState: HandGestureState;
  gestureRef: React.RefObject<HandGestureState>;
  cameraEnabled: boolean;
  onToggleCamera: () => void;
}

const PRACTICE_CONFIG: KrathongConfig = {
  baseColor: '#2D6A4F',
  flowerColor: '#FF99C8',
  candleColor: '#F4D06F',
  baseStyle: 'classic-lotus',
  wishText: '',
  authorName: '',
  hideWish: true,
};

export const InteractiveTutorialSandbox: React.FC<
  InteractiveTutorialSandboxProps
> = ({
  videoRef,
  gestureState,
  gestureRef,
  cameraEnabled,
  onToggleCamera,
}) => {
  const { t } = useLanguage();
  const pt = t.howToPlay.practiceSection;
  const handLabels = useMemo(
    () => t.numerals.map((n) => `${t.canvas.handLabel} ${n}`),
    [t]
  );

  const [practiceType, setPracticeType] = useState<RitualItemType>('krathong');
  const [uiPhase, setUiPhase] = useState<
    'idle' | 'grabbed' | 'inTarget' | 'released'
  >('idle');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const practiceTypeRef = useRef<RitualItemType>(practiceType);

  const itemStateRef = useRef<{
    x: number;
    y: number;
    grabbedByHand: number | null;
    grabbedByPointer: number | null;
    released: boolean;
    releaseTime: number;
  }>({
    x: 0.32,
    y: 0.42,
    grabbedByHand: null,
    grabbedByPointer: null,
    released: false,
    releaseTime: 0,
  });

  useEffect(() => {
    practiceTypeRef.current = practiceType;
  }, [practiceType]);

  const getSpawnPos = useCallback((type: RitualItemType) => {
    return type === 'krathong'
      ? { x: 0.3, y: 0.34 }
      : { x: 0.3, y: 0.72 };
  }, []);

  const getTargetPos = useCallback((type: RitualItemType) => {
    return type === 'krathong'
      ? { x: 0.68, y: 0.74 }
      : { x: 0.68, y: 0.25 };
  }, []);

  const resetSandbox = useCallback(
    (nextType: RitualItemType) => {
      const start = getSpawnPos(nextType);
      itemStateRef.current = {
        x: start.x,
        y: start.y,
        grabbedByHand: null,
        grabbedByPointer: null,
        released: false,
        releaseTime: 0,
      };
      setUiPhase('idle');
    },
    [getSpawnPos]
  );

  const handleSelectType = (type: RitualItemType) => {
    setPracticeType(type);
    resetSandbox(type);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;

    const renderLoop = (time: number) => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      const propScale = Math.max(0.55, Math.min(1, width / 560, height / 300));
      const type = practiceTypeRef.current;
      const state = itemStateRef.current;
      const target = getTargetPos(type);
      const spawn = getSpawnPos(type);
      const gesture = gestureRef.current;

      if (!state.released && state.grabbedByPointer === null) {
        const hands = gesture.hands ?? [];

        if (state.grabbedByHand !== null) {
          const activeHand = hands.find(
            (h) => h.handIndex === state.grabbedByHand
          );
          if (activeHand && activeHand.isPinching) {
            state.x += (activeHand.cursor.x - state.x) * 0.35;
            state.y += (activeHand.cursor.y - state.y) * 0.35;
          } else {
            const distToTarget = Math.hypot(
              state.x - target.x,
              state.y - target.y
            );
            state.grabbedByHand = null;
            if (distToTarget < 0.16) {
              state.released = true;
              state.releaseTime = performance.now();
              state.x = target.x;
              state.y = target.y;
            }
          }
        } else {
          for (const hand of hands) {
            if (hand.isPinching) {
              const dist = Math.hypot(
                hand.cursor.x - state.x,
                hand.cursor.y - state.y
              );
              if (dist < 0.16) {
                state.grabbedByHand = hand.handIndex;
                break;
              }
            }
          }
        }
      }

      const isGrabbed =
        state.grabbedByHand !== null || state.grabbedByPointer !== null;
      if (!isGrabbed && !state.released) {
        state.x += (spawn.x - state.x) * 0.12;
        state.y += (spawn.y - state.y) * 0.12;
      }

      if (state.released) {
        const elapsed = (performance.now() - state.releaseTime) / 1000;
        if (type === 'krathong') {
          state.x =
            target.x + Math.sin(elapsed * 1.4) * 0.04 + elapsed * 0.018;
          state.y = Math.max(0.56, target.y - elapsed * 0.02);
        } else {
          state.x = target.x + Math.sin(elapsed * 1.2) * 0.03;
          state.y = Math.max(0.1, target.y - elapsed * 0.035);
        }
      }

      const distToTarget = Math.hypot(state.x - target.x, state.y - target.y);
      const isInTarget = distToTarget < 0.16;

      const nextPhase: 'idle' | 'grabbed' | 'inTarget' | 'released' =
        state.released
          ? 'released'
          : isGrabbed && isInTarget
            ? 'inTarget'
            : isGrabbed
              ? 'grabbed'
              : 'idle';
      setUiPhase((prev) => (prev === nextPhase ? prev : nextPhase));

      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#090D18');
      skyGrad.addColorStop(0.52, '#141830');
      skyGrad.addColorStop(0.53, '#0B1D2E');
      skyGrad.addColorStop(1, '#06101B');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      const horizonY = height * 0.52;
      ctx.strokeStyle = 'rgba(197, 160, 89, 0.32)';
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      ctx.lineTo(width, horizonY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = 'rgba(244, 208, 111, 0.16)';
      ctx.lineWidth = 1.2;
      for (let r = 0; r < 4; r++) {
        const ry = horizonY + 26 + r * 28;
        const sway = Math.sin(time * 0.0015 + r) * 12;
        ctx.beginPath();
        ctx.moveTo(width * 0.15 + sway, ry);
        ctx.lineTo(width * 0.85 + sway, ry);
        ctx.stroke();
      }

      if (!state.released) {
        const tx = target.x * width;
        const ty = target.y * height;
        const pulse = 0.5 + 0.5 * Math.sin(time * 0.004);
        const rx = (type === 'krathong' ? 68 : 58) * propScale;
        const ry = (type === 'krathong' ? 28 : 34) * propScale;

        ctx.save();
        ctx.translate(tx, ty);

        ctx.fillStyle =
          isGrabbed && isInTarget
            ? 'rgba(82, 183, 136, 0.28)'
            : type === 'krathong'
              ? `rgba(244, 208, 111, ${0.1 + pulse * 0.08})`
              : `rgba(255, 140, 66, ${0.1 + pulse * 0.08})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle =
          isGrabbed && isInTarget
            ? '#52B788'
            : type === 'krathong'
              ? '#F4D06F'
              : '#FF8C42';
        ctx.lineWidth = isGrabbed && isInTarget ? 2.6 : 1.8;
        ctx.setLineDash([8, 5]);
        ctx.beginPath();
        ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.font = '500 11px "Bai Jamjuree", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = isGrabbed && isInTarget ? '#FFF275' : '#F4D06F';
        ctx.fillText(
          isGrabbed && isInTarget
            ? pt.targetReleaseHere
            : type === 'krathong'
              ? pt.targetKrathong
              : pt.targetLantern,
          0,
          4
        );
        ctx.restore();
      }

      const ix = state.x * width;
      const iy = state.y * height;
      const itemScale = (isGrabbed ? 0.88 : 0.78) * propScale;

      if (!state.released) {
        ctx.save();
        ctx.strokeStyle = isGrabbed
          ? 'rgba(255, 242, 117, 0.9)'
          : 'rgba(197, 160, 89, 0.65)';
        ctx.lineWidth = isGrabbed ? 2.2 : 1.4;
        ctx.beginPath();
        ctx.arc(ix, iy - 6 * propScale, 42 * propScale, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      if (type === 'lantern') {
        drawInteractiveSkyLantern({
          ctx,
          x: ix,
          y: iy,
          scale: itemScale,
          config: PRACTICE_CONFIG,
          time,
          showWishTag: false,
          opacity: 1,
        });
      } else {
        drawProceduralKrathong({
          ctx,
          x: ix,
          y: iy,
          scale: itemScale,
          config: PRACTICE_CONFIG,
          time,
          showWishTag: false,
          opacity: 1,
        });
      }

      drawIllustratedHands(ctx, width, height, gesture, handLabels);

      ctx.restore();
      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [gestureRef, getSpawnPos, getTargetPos, pt, handLabels]);

  const getNormalizedPointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: Math.max(0.08, Math.min(0.92, (e.clientX - rect.left) / rect.width)),
      y: Math.max(0.1, Math.min(0.9, (e.clientY - rect.top) / rect.height)),
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const state = itemStateRef.current;
    if (state.released) return;
    const ptPos = getNormalizedPointer(e);
    const dist = Math.hypot(ptPos.x - state.x, ptPos.y - state.y);
    if (dist < 0.18) {
      e.currentTarget.setPointerCapture(e.pointerId);
      state.grabbedByPointer = e.pointerId;
      state.x = ptPos.x;
      state.y = ptPos.y;
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const state = itemStateRef.current;
    if (state.grabbedByPointer !== e.pointerId || state.released) return;
    const ptPos = getNormalizedPointer(e);
    state.x = ptPos.x;
    state.y = ptPos.y;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const state = itemStateRef.current;
    if (state.grabbedByPointer !== e.pointerId) return;
    state.grabbedByPointer = null;
    const target = getTargetPos(practiceTypeRef.current);
    const dist = Math.hypot(state.x - target.x, state.y - target.y);
    if (dist < 0.16) {
      state.released = true;
      state.releaseTime = performance.now();
      state.x = target.x;
      state.y = target.y;
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2 border-b border-[#C5A059]/30 pb-3 sm:flex sm:items-center sm:justify-between">
        <div className="col-span-2 grid grid-cols-2 gap-2 sm:flex sm:items-center">
          <button
            type="button"
            onClick={() => handleSelectType('krathong')}
            className={`h-9 cursor-pointer truncate border px-2 text-xs font-medium whitespace-nowrap transition-all sm:px-3.5 sm:tracking-wide ${
              practiceType === 'krathong'
                ? 'border-[#E6C77B] bg-[#C5A059]/20 text-[#FFF275]'
                : 'border-[#C5A059]/35 bg-transparent text-[#E6DEC8]/70 hover:border-[#C5A059]'
            }`}
          >
            {pt.modeKrathong}
          </button>
          <button
            type="button"
            onClick={() => handleSelectType('lantern')}
            className={`h-9 cursor-pointer truncate border px-2 text-xs font-medium whitespace-nowrap transition-all sm:px-3.5 sm:tracking-wide ${
              practiceType === 'lantern'
                ? 'border-[#FF8C42] bg-[#FF8C42]/20 text-[#FFF275]'
                : 'border-[#C5A059]/35 bg-transparent text-[#E6DEC8]/70 hover:border-[#C5A059]'
            }`}
          >
            {pt.modeLantern}
          </button>
        </div>

        <div className="col-span-2 grid grid-cols-2 gap-2 sm:flex sm:items-center">
          <button
            type="button"
            onClick={onToggleCamera}
            className="inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 border border-[#C5A059]/50 bg-[#1A1510] px-3 text-xs whitespace-nowrap text-[#F4D06F] transition-colors hover:border-[#FFF275]"
          >
            {cameraEnabled ? (
              <VideoCamera width={14} height={14} />
            ) : (
              <VideoCameraOff width={14} height={14} />
            )}
            <span>{cameraEnabled ? pt.toggleCamOff : pt.toggleCamOn}</span>
          </button>

          <button
            type="button"
            onClick={() => resetSandbox(practiceType)}
            className="inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 border border-[#C5A059]/50 bg-[#1A1510] px-3 text-xs whitespace-nowrap text-[#E6DEC8] transition-colors hover:border-[#FFF275] hover:text-[#FFF275]"
          >
            <RefreshDouble width={13} height={13} />
            <span>{keepThaiPhrases(pt.resetBtn)}</span>
          </button>
        </div>
      </div>

      <div className="flex min-h-[3.25rem] items-center border border-[#C5A059]/40 bg-[#16120E] px-3 py-2 text-xs text-[#F5EFE4] sm:px-3.5">
        <div className="flex items-center gap-2.5">
          <span className="h-2 w-2 shrink-0 rotate-45 bg-[#F4D06F]" />
          <span className="font-heading leading-snug text-pretty">
            {keepThaiPhrases(
              uiPhase === 'released'
                ? practiceType === 'krathong'
                  ? pt.statusSuccessKrathong
                  : pt.statusSuccessLantern
                : uiPhase === 'inTarget'
                  ? pt.statusStep3
                  : uiPhase === 'grabbed'
                    ? practiceType === 'krathong'
                      ? pt.statusStep2Krathong
                      : pt.statusStep2Lantern
                    : pt.statusStep1
            )}
          </span>
        </div>
      </div>

      <div className="relative h-[clamp(14rem,38dvh,18rem)] w-full overflow-hidden border border-[#C5A059]/60 bg-[#090D18]">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="h-full w-full cursor-grab touch-none active:cursor-grabbing"
        />

        <div className="pointer-events-none absolute top-2 left-2.5 max-w-[calc(100%-8.5rem)] truncate text-[10px] tracking-[0.08em] text-[#F4D06F]/70 uppercase sm:top-2.5 sm:left-3 sm:max-w-[calc(100%-10rem)]">
          {pt.skyZoneLabel}
        </div>
        <div className="pointer-events-none absolute bottom-2 left-2.5 max-w-[calc(100%-1.25rem)] truncate text-[10px] tracking-[0.08em] text-[#F4D06F]/70 uppercase sm:bottom-2.5 sm:left-3">
          {pt.waterZoneLabel}
        </div>

        <div className="pointer-events-none absolute top-2 right-2 flex flex-col items-end gap-1 sm:top-2.5 sm:right-2.5">
          <div className="relative aspect-[4/3] w-28 overflow-hidden border border-[#C5A059]/65 bg-[#06080F]/90 shadow-lg sm:w-32">
            <video
              ref={videoRef}
              playsInline
              muted
              className={`h-full w-full -scale-x-100 object-cover transition-opacity ${
                cameraEnabled && gestureState.isReady
                  ? 'opacity-90'
                  : 'opacity-20'
              }`}
            />
            <div className="absolute inset-x-0 bottom-0 truncate bg-[#06080F]/85 px-1.5 py-0.5 text-center text-[9px] text-[#F4D06F]">
              {cameraEnabled
                ? gestureState.isTracking
                  ? gestureState.isPinching
                    ? pt.itemGrabbing
                    : pt.itemHoldHint
                  : '...'
                : pt.toggleCamOff}
            </div>
          </div>
        </div>
      </div>

      <p className="font-heading text-[11px] leading-snug text-pretty text-[#C5A059]/85">
        {keepThaiPhrases(
          cameraEnabled
            ? gestureState.isReady
              ? pt.camActive
              : pt.camWaiting
            : pt.camOff
        )}
      </p>
    </div>
  );
};
