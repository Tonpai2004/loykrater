'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import {
  FloatingKrathong,
  GameState,
  HandGestureState,
  KrathongConfig,
  NormalizedPoint,
  OfferingCount,
  OfferingSlotConfig,
  StageItem,
} from '@/types/krathong';
import {
  drawIllustratedHands,
  drawInteractiveSkyLantern,
  drawNightSkyAndMoon,
  drawProceduralKrathong,
  drawRiverSurface,
  drawStageItemBeacon,
  drawTargetSpotlights,
  getViewScale,
  RIVER_DROP_ZONE_MIN_Y,
  RIVER_HORIZON_RATIO,
  getRiverSpotTargets,
  getSkyLanternTargets,
  isPortraitView,
  SPOT_HIT_RADIUS_RATIO,
  SparkParticle,
} from '@/lib/canvasRenderer';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  AMBIENT_CYCLE_MS,
  DEFAULT_SLOT_PRESETS,
  FLOAT_LIFESPAN_MS,
  THAI_NUMERALS,
} from '@/constants/krathongDefaults';

export { FLOAT_LIFESPAN_MS, THAI_NUMERALS };

interface RiverCanvasProps {
  gameState: GameState;
  activeConfig: KrathongConfig;
  floatingKrathongs: FloatingKrathong[];
  gestureRef: React.RefObject<HandGestureState>;
  isPaused?: boolean;
  onReleaseItem: (
    item: StageItem,
    spawnXRatio: number,
    spawnYRatio: number
  ) => void;
  onProgressChange?: (releasedCount: number, totalCount: number) => void;
  onAllItemsReleased: (totalCount: number) => void;
}

const GRAB_HIT_RADIUS_RATIO = 0.135;
const WISH_TAG_VISIBLE_MS = 5500;
const WISH_TAG_FADE_END_MS = 7500;
const SPRING_STIFFNESS = 100;
const SPRING_DAMPING = 15;

function getStableItemSeed(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function getActiveOfferings(
  config: KrathongConfig
): OfferingSlotConfig[] {
  const count: OfferingCount = config.offeringCount ?? 1;
  const existing = config.offerings ?? [];
  const result: OfferingSlotConfig[] = [];

  for (let i = 0; i < count; i++) {
    if (existing[i]) {
      result.push(existing[i]);
    } else if (i === 0) {
      result.push({
        id: 'slot-1',
        itemType: 'krathong',
        baseColor: config.baseColor,
        flowerColor: config.flowerColor,
        candleColor: config.candleColor,
        baseStyle: config.baseStyle,
        wishText: config.wishText,
        authorName: config.authorName,
        hideWish: config.hideWish ?? false,
      });
    } else {
      const preset = DEFAULT_SLOT_PRESETS[i % DEFAULT_SLOT_PRESETS.length];
      result.push({
        id: `slot-${i + 1}`,
        ...preset,
        hideWish: false,
      });
    }
  }

  return result;
}

function getHorizontalRatio(index: number, total: number): number {
  if (total <= 1) return 0.5;
  if (total === 2) return index === 0 ? 0.36 : 0.64;
  if (total === 3) return 0.26 + index * 0.24;
  if (total === 4) return 0.2 + index * 0.2;
  return 0.16 + index * 0.17;
}

export function buildStageItems(config: KrathongConfig): StageItem[] {
  const slots = getActiveOfferings(config);
  const total = slots.length;

  return slots.map((slot, idx) => {
    const xPos = getHorizontalRatio(idx, total);
    const portrait =
      typeof window !== 'undefined' &&
      isPortraitView(window.innerWidth, window.innerHeight);
    const yPos =
      portrait && total >= 4
        ? idx % 2 === 0
          ? 0.4
          : 0.53
        : slot.itemType === 'lantern'
          ? 0.41
          : 0.49;
    const ownerName = slot.authorName.trim();
    const wishText = slot.wishText.trim();

    const itemConfig: KrathongConfig = {
      ...config,
      baseColor: slot.baseColor,
      flowerColor: slot.flowerColor,
      candleColor: slot.candleColor,
      baseStyle: slot.baseStyle,
      wishText,
      authorName: ownerName,
      hideWish: slot.hideWish ?? false,
    };

    return {
      id: `stage-${idx + 1}-${slot.itemType}`,
      itemType: slot.itemType,
      ownerName,
      wishText,
      config: itemConfig,
      x: xPos,
      y: yPos,
      targetX: xPos,
      targetY: yPos,
      vx: 0,
      vy: 0,
      scale: total >= 4 ? 0.98 : 1.12,
      released: false,
      grabbedByHandIndex: null,
      grabbedByPointerId: null,
    };
  });
}

function findNearestSpot(
  point: NormalizedPoint,
  spots: NormalizedPoint[],
  maxRadius: number
): NormalizedPoint | null {
  let bestSpot: NormalizedPoint | null = null;
  let bestDist = maxRadius;
  for (const spot of spots) {
    const d = Math.hypot(point.x - spot.x, point.y - spot.y);
    if (d <= bestDist) {
      bestDist = d;
      bestSpot = spot;
    }
  }
  return bestSpot;
}

export const RiverCanvas: React.FC<RiverCanvasProps> = ({
  gameState,
  activeConfig,
  floatingKrathongs,
  gestureRef,
  isPaused = false,
  onReleaseItem,
  onProgressChange,
  onAllItemsReleased,
}) => {
  const { t } = useLanguage();
  const canvasLabelsRef = useRef(t.canvas);
  const handLabelsRef = useRef<string[]>([]);

  useEffect(() => {
    canvasLabelsRef.current = t.canvas;
    handLabelsRef.current = t.numerals.map(
      (n) => `${t.canvas.handLabel} ${n}`
    );
  }, [t]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageItemsRef = useRef<StageItem[]>([]);
  const roundCompletedRef = useRef<boolean>(false);
  const sparksRef = useRef<SparkParticle[]>([]);

  const latestPropsRef = useRef({
    gameState,
    activeConfig,
    floatingKrathongs,
    isPaused,
    onReleaseItem,
    onProgressChange,
    onAllItemsReleased,
  });

  useEffect(() => {
    latestPropsRef.current = {
      gameState,
      activeConfig,
      floatingKrathongs,
      isPaused,
      onReleaseItem,
      onProgressChange,
      onAllItemsReleased,
    };
  }, [
    gameState,
    activeConfig,
    floatingKrathongs,
    isPaused,
    onReleaseItem,
    onProgressChange,
    onAllItemsReleased,
  ]);

  const spawnCelebrationSparks = useCallback((x: number, y: number) => {
    const colors = ['#F4D06F', '#FF8C42', '#FFF275', '#FF99C8'];
    for (let i = 0; i < 32; i++) {
      const angle = (Math.PI * 2 * i) / 32 + (Math.random() - 0.5) * 0.3;
      const speed = 1.1 + Math.random() * 3.5;
      sparksRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        size: 2 + Math.random() * 2.5,
        alpha: 1,
        decay: 0.015 + Math.random() * 0.012,
        color: colors[i % colors.length],
      });
    }
  }, []);

  const completeSingleItemRelease = useCallback(
    (
      item: StageItem,
      spawnX: number,
      spawnY: number,
      width: number,
      height: number
    ) => {
      if (item.released) return;
      item.released = true;
      item.grabbedByHandIndex = null;
      item.grabbedByPointerId = null;

      spawnCelebrationSparks(spawnX * width, spawnY * height);
      latestPropsRef.current.onReleaseItem(item, spawnX, spawnY);

      const allItems = stageItemsRef.current;
      const releasedCount = allItems.filter((i) => i.released).length;
      latestPropsRef.current.onProgressChange?.(releasedCount, allItems.length);

      if (releasedCount === allItems.length && !roundCompletedRef.current) {
        roundCompletedRef.current = true;
        latestPropsRef.current.onAllItemsReleased(allItems.length);
      }
    },
    [spawnCelebrationSparks]
  );

  useEffect(() => {
    if (gameState === 'INTERACT') {
      const items = buildStageItems(activeConfig);
      stageItemsRef.current = items;
      roundCompletedRef.current = false;
      onProgressChange?.(0, items.length);
    }
  }, [gameState, activeConfig, onProgressChange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const renderLoop = (time: number) => {
      const dt = Math.min(0.032, Math.max(0.008, (time - lastTime) / 1000));
      lastTime = time;

      const {
        gameState: currentMode,
        activeConfig: currentConfig,
        floatingKrathongs: riverItems,
        isPaused: paused,
      } = latestPropsRef.current;

      if (paused || (typeof document !== 'undefined' && document.hidden)) {
        animationFrameId = requestAnimationFrame(renderLoop);
        return;
      }

      const width = window.innerWidth;
      const height = window.innerHeight;
      const viewScale = getViewScale(width, height);
      const handState = gestureRef.current;

      drawNightSkyAndMoon(ctx, width, height, time);
      drawRiverSurface(ctx, width, height, time);

      if (currentMode === 'INTERACT') {
        const activeHands = handState.hands;
        const stageItems = stageItemsRef.current;

        stageItems.forEach((item) => {
          if (
            !item.released &&
            item.grabbedByHandIndex !== null &&
            !activeHands.some((h) => h.handIndex === item.grabbedByHandIndex)
          ) {
            item.grabbedByHandIndex = null;
          }
        });

        activeHands.forEach((trackedHand) => {
          const grabbedItem = stageItems.find(
            (item) =>
              !item.released &&
              item.grabbedByHandIndex === trackedHand.handIndex
          );

          if (trackedHand.isPinching) {
            let activeItem = grabbedItem;

            if (!activeItem) {
              let closestDist = GRAB_HIT_RADIUS_RATIO;
              for (const candidate of stageItems) {
                if (
                  candidate.released ||
                  candidate.grabbedByHandIndex !== null ||
                  candidate.grabbedByPointerId !== null
                ) {
                  continue;
                }
                const d = Math.hypot(
                  trackedHand.cursor.x - candidate.x,
                  trackedHand.cursor.y - candidate.y
                );
                if (d < closestDist) {
                  closestDist = d;
                  activeItem = candidate;
                }
              }
              if (activeItem) {
                activeItem.grabbedByHandIndex = trackedHand.handIndex;
              }
            }

            if (activeItem) {
              activeItem.targetX = Math.max(
                0.08,
                Math.min(0.92, trackedHand.cursor.x)
              );
              activeItem.targetY = Math.max(
                0.1,
                Math.min(0.9, trackedHand.cursor.y)
              );
            }
          } else if (grabbedItem) {
            grabbedItem.grabbedByHandIndex = null;

            if (grabbedItem.itemType === 'krathong') {
              const riverSpot = findNearestSpot(
                { x: grabbedItem.x, y: grabbedItem.y },
                getRiverSpotTargets(width, height),
                SPOT_HIT_RADIUS_RATIO * 1.45
              );
              if (riverSpot) {
                completeSingleItemRelease(
                  grabbedItem,
                  riverSpot.x,
                  riverSpot.y,
                  width,
                  height
                );
              } else if (grabbedItem.y >= RIVER_DROP_ZONE_MIN_Y) {
                completeSingleItemRelease(
                  grabbedItem,
                  grabbedItem.x,
                  grabbedItem.y,
                  width,
                  height
                );
              }
            } else if (grabbedItem.itemType === 'lantern') {
              const skySpot = findNearestSpot(
                { x: grabbedItem.x, y: grabbedItem.y },
                getSkyLanternTargets(width, height),
                SPOT_HIT_RADIUS_RATIO * 1.45
              );
              if (skySpot) {
                completeSingleItemRelease(
                  grabbedItem,
                  skySpot.x,
                  skySpot.y,
                  width,
                  height
                );
              } else if (grabbedItem.y <= RIVER_HORIZON_RATIO) {
                completeSingleItemRelease(
                  grabbedItem,
                  grabbedItem.x,
                  grabbedItem.y,
                  width,
                  height
                );
              }
            }
          }
        });

        const baseScale = (stageItems.length >= 4 ? 0.98 : 1.12) * viewScale;
        stageItems.forEach((item) => {
          if (item.released) return;
          const ax =
            SPRING_STIFFNESS * (item.targetX - item.x) -
            SPRING_DAMPING * item.vx;
          const ay =
            SPRING_STIFFNESS * (item.targetY - item.y) -
            SPRING_DAMPING * item.vy;
          item.vx += ax * dt;
          item.vy += ay * dt;
          item.x += item.vx * dt;
          item.y += item.vy * dt;

          const isGrabbed =
            item.grabbedByHandIndex !== null ||
            item.grabbedByPointerId !== null;
          const targetScale = isGrabbed ? baseScale * 1.14 : baseScale;
          item.scale += (targetScale - item.scale) * Math.min(1, dt * 10);
        });
      }

      const now = Date.now();
      const activeRiverItems = riverItems.filter((item) => {
        if (item.isAmbient) return true;
        if (item.isLocal && currentMode === 'INTERACT') return true;
        const age = now - item.createdAt;
        return age >= 0 && age < FLOAT_LIFESPAN_MS;
      });

      const computedFloating = activeRiverItems
        .map((item) => {
          const isAmbient = Boolean(item.isAmbient);
          const isLocal = Boolean(item.isLocal);
          const seed = getStableItemSeed(item.id);
          const driftDir = seed % 2 === 0 ? 1 : -1;
          const phaseOffset = (seed % 100) * 0.17;
          const isLantern = item.itemType === 'lantern';

          let elapsed: number;
          let progress: number;
          let finalOpacity: number;

          if (isAmbient) {
            elapsed =
              (((now - item.createdAt) % AMBIENT_CYCLE_MS) + AMBIENT_CYCLE_MS) %
              AMBIENT_CYCLE_MS;
            progress = elapsed / AMBIENT_CYCLE_MS;

            const fadeIn =
              progress < 0.16
                ? Math.sin((progress / 0.16) * (Math.PI / 2))
                : 1;
            const fadeOut =
              progress > 0.78
                ? Math.cos(((progress - 0.78) / 0.22) * (Math.PI / 2))
                : 1;
            const maxAmbientOpacity =
              currentMode === 'INTERACT' ? 0.2 : 0.34;
            finalOpacity = Math.max(
              0,
              Math.min(maxAmbientOpacity, maxAmbientOpacity * fadeIn * fadeOut)
            );
          } else {
            const rawElapsed = Math.max(0, now - item.createdAt);
            elapsed =
              isLocal && currentMode === 'INTERACT'
                ? Math.min(1600, rawElapsed)
                : rawElapsed;
            progress = Math.min(1, elapsed / FLOAT_LIFESPAN_MS);

            const lifeFadeOut =
              progress > 0.78
                ? Math.cos(((progress - 0.78) / 0.22) * (Math.PI / 2))
                : 1;
            const peakOpacity = isLocal ? 1 : 0.92;
            finalOpacity = Math.max(0, Math.min(peakOpacity, peakOpacity * lifeFadeOut));
          }

          let wishTagOpacity = 0;
          if (!isAmbient && !item.config.hideWish) {
            if (isLocal && currentMode === 'INTERACT') {
              wishTagOpacity = 0.9;
            } else if (elapsed <= WISH_TAG_VISIBLE_MS) {
              wishTagOpacity = 1;
            } else if (elapsed < WISH_TAG_FADE_END_MS) {
              wishTagOpacity =
                1 -
                (elapsed - WISH_TAG_VISIBLE_MS) /
                  (WISH_TAG_FADE_END_MS - WISH_TAG_VISIBLE_MS);
            }
          }

          const scaleMultiplier = isAmbient ? 0.72 : isLocal ? 1 : 0.94;

          if (isLantern) {
            const topLimitY = 0.04;
            const currentYRatio =
              item.spawnYRatio -
              (item.spawnYRatio - topLimitY) * Math.pow(progress, 0.82);
            const horizontalSway =
              Math.sin(time * 0.0007 + phaseOffset) * 0.038 +
              progress * 0.055 * driftDir;
            const currentXRatio = Math.max(
              0.06,
              Math.min(0.94, item.spawnXRatio + horizontalSway)
            );
            const perspectiveScale =
              Math.max(0.26, 0.94 * Math.pow(1 - progress * 0.68, 1.05)) *
              scaleMultiplier;

            return {
              item,
              x: currentXRatio * width,
              y: currentYRatio * height,
              scale: perspectiveScale * viewScale,
              opacity: finalOpacity,
              wishTagOpacity,
            };
          }

          const horizonLimitY = RIVER_HORIZON_RATIO + 0.045;
          const currentYRatio =
            item.spawnYRatio -
            (item.spawnYRatio - horizonLimitY) * Math.pow(progress, 0.78);

          const horizontalDrift =
            Math.sin(time * 0.00055 + phaseOffset) *
              0.045 *
              (1 - progress * 0.5) +
            progress * 0.075 * driftDir;

          const currentXRatio = Math.max(
            0.06,
            Math.min(0.94, item.spawnXRatio + horizontalDrift)
          );

          const perspectiveScale =
            Math.max(0.24, 0.96 * Math.pow(1 - progress * 0.72, 1.1)) *
            scaleMultiplier;

          return {
            item,
            x: currentXRatio * width,
            y: currentYRatio * height,
            scale: perspectiveScale * viewScale,
            opacity: finalOpacity,
            wishTagOpacity,
          };
        })
        .sort((a, b) => a.y - b.y);

      computedFloating.forEach(
        ({ item, x, y, scale, opacity, wishTagOpacity }) => {
          if (opacity <= 0.01) return;

          if (item.itemType === 'lantern') {
            drawInteractiveSkyLantern({
              ctx,
              x,
              y,
              scale,
              config: item.config,
              time,
              showWishTag: !item.config.hideWish && wishTagOpacity > 0.01,
              wishTagOpacity,
              opacity,
            });
          } else {
            drawProceduralKrathong({
              ctx,
              x,
              y,
              scale,
              config: item.config,
              time,
              showWishTag: !item.config.hideWish && wishTagOpacity > 0.01,
              wishTagOpacity,
              opacity,
            });
          }

          if (
            item.isLocal &&
            sparksRef.current.length < 60 &&
            Math.random() < 0.07 * scale
          ) {
            sparksRef.current.push({
              x: x + (Math.random() - 0.5) * 10 * scale,
              y: item.itemType === 'lantern' ? y + 28 * scale : y - 50 * scale,
              vx: (Math.random() - 0.5) * 0.45,
              vy:
                item.itemType === 'lantern'
                  ? 0.5 + Math.random() * 0.6
                  : -0.65 - Math.random() * 1.0,
              size: (1.4 + Math.random() * 1.5) * scale,
              alpha: 0.85 * opacity,
              decay: 0.02,
              color: '#FFF275',
            });
          }
        }
      );

      if (currentMode === 'CUSTOMIZE') {
        const slots = getActiveOfferings(currentConfig);
        const total = slots.length;
        const selectedIdx = Math.min(
          total - 1,
          Math.max(0, currentConfig.selectedSlotIndex ?? 0)
        );

        slots.forEach((slot, idx) => {
          const isSelected = idx === selectedIdx;
          const xRatio = getHorizontalRatio(idx, total);
          const yRatio = slot.itemType === 'lantern' ? 0.25 : 0.3;
          const baseScale =
            total === 1
              ? 1.18
              : total === 2
                ? 1.02
                : total === 3
                  ? 0.92
                  : 0.82;
          const finalScale =
            (isSelected ? baseScale * 1.12 : baseScale * 0.9) * viewScale;

          const slotConfig: KrathongConfig = {
            ...currentConfig,
            baseColor: slot.baseColor,
            flowerColor: slot.flowerColor,
            candleColor: slot.candleColor,
            baseStyle: slot.baseStyle,
            wishText: slot.wishText.trim(),
            authorName: slot.authorName.trim(),
            hideWish: slot.hideWish ?? false,
          };

          if (slot.itemType === 'lantern') {
            drawInteractiveSkyLantern({
              ctx,
              x: width * xRatio,
              y: height * yRatio,
              scale: finalScale,
              config: slotConfig,
              time,
              isHighlighted: isSelected,
              showWishTag: (isSelected || total <= 3) && !slot.hideWish,
              opacity: isSelected ? 1 : 0.82,
            });
          } else {
            drawProceduralKrathong({
              ctx,
              x: width * xRatio,
              y: height * yRatio,
              scale: finalScale,
              config: slotConfig,
              time,
              isHighlighted: isSelected,
              showWishTag: (isSelected || total <= 3) && !slot.hideWish,
              opacity: isSelected ? 1 : 0.82,
            });
          }
        });
      }

      if (currentMode === 'INTERACT') {
        const stageItems = stageItemsRef.current;
        const roomy = width / Math.max(1, stageItems.length) >= 150;
        drawTargetSpotlights(
          ctx,
          width,
          height,
          stageItems,
          time,
          canvasLabelsRef.current
        );

        stageItems.forEach((item) => {
          if (item.released) return;
          const ix = item.x * width;
          const iy = item.y * height;
          const isGrabbed =
            item.grabbedByHandIndex !== null ||
            item.grabbedByPointerId !== null;

          drawStageItemBeacon(
            ctx,
            ix,
            iy,
            item.scale,
            isGrabbed,
            time,
            canvasLabelsRef.current,
            roomy
          );

          if (item.itemType === 'lantern') {
            drawInteractiveSkyLantern({
              ctx,
              x: ix,
              y: iy,
              scale: item.scale,
              config: item.config,
              time,
              isHighlighted: true,
              showWishTag: !item.config.hideWish && (roomy || isGrabbed),
              ownerLabel: item.ownerName,
              wishOverride: item.wishText,
            });
          } else {
            drawProceduralKrathong({
              ctx,
              x: ix,
              y: iy,
              scale: item.scale,
              config: item.config,
              time,
              isHighlighted: true,
              showWishTag: !item.config.hideWish && (roomy || isGrabbed),
              ownerLabel: item.ownerName,
              wishOverride: item.wishText,
            });
          }
        });
      }

      for (let i = sparksRef.current.length - 1; i >= 0; i--) {
        const p = sparksRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          sparksRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, p.size), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (currentMode === 'INTERACT') {
        drawIllustratedHands(
          ctx,
          width,
          height,
          handState,
          handLabelsRef.current
        );
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [gestureRef, completeSingleItemRelease]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (gameState !== 'INTERACT') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const normX = (e.clientX - rect.left) / rect.width;
    const normY = (e.clientY - rect.top) / rect.height;

    let closestIdx = -1;
    let bestDist = GRAB_HIT_RADIUS_RATIO * 1.25;

    for (let i = 0; i < stageItemsRef.current.length; i++) {
      const item = stageItemsRef.current[i];
      if (
        item.released ||
        item.grabbedByPointerId !== null ||
        item.grabbedByHandIndex !== null
      ) {
        continue;
      }
      const d = Math.hypot(normX - item.x, normY - item.y);
      if (d < bestDist) {
        bestDist = d;
        closestIdx = i;
      }
    }

    if (closestIdx !== -1) {
      stageItemsRef.current[closestIdx].grabbedByPointerId = e.pointerId;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (gameState !== 'INTERACT') return;
    const grabbedItem = stageItemsRef.current.find(
      (item) => !item.released && item.grabbedByPointerId === e.pointerId
    );
    if (!grabbedItem) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const normX = (e.clientX - rect.left) / rect.width;
    const normY = (e.clientY - rect.top) / rect.height;

    grabbedItem.targetX = Math.max(0.08, Math.min(0.92, normX));
    grabbedItem.targetY = Math.max(0.08, Math.min(0.9, normY));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const grabbedItem = stageItemsRef.current.find(
      (item) => !item.released && item.grabbedByPointerId === e.pointerId
    );
    if (!grabbedItem) return;

    grabbedItem.grabbedByPointerId = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    if (grabbedItem.itemType === 'krathong') {
      const riverSpot = findNearestSpot(
        { x: grabbedItem.x, y: grabbedItem.y },
        getRiverSpotTargets(window.innerWidth, window.innerHeight),
        SPOT_HIT_RADIUS_RATIO * 1.45
      );
      if (riverSpot) {
        completeSingleItemRelease(
          grabbedItem,
          riverSpot.x,
          riverSpot.y,
          window.innerWidth,
          window.innerHeight
        );
      } else if (grabbedItem.y >= RIVER_DROP_ZONE_MIN_Y) {
        completeSingleItemRelease(
          grabbedItem,
          grabbedItem.x,
          grabbedItem.y,
          window.innerWidth,
          window.innerHeight
        );
      }
    } else if (grabbedItem.itemType === 'lantern') {
      const skySpot = findNearestSpot(
        { x: grabbedItem.x, y: grabbedItem.y },
        getSkyLanternTargets(window.innerWidth, window.innerHeight),
        SPOT_HIT_RADIUS_RATIO * 1.45
      );
      if (skySpot) {
        completeSingleItemRelease(
          grabbedItem,
          skySpot.x,
          skySpot.y,
          window.innerWidth,
          window.innerHeight
        );
      } else if (grabbedItem.y <= RIVER_HORIZON_RATIO) {
        completeSingleItemRelease(
          grabbedItem,
          grabbedItem.x,
          grabbedItem.y,
          window.innerWidth,
          window.innerHeight
        );
      }
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onLostPointerCapture={handlePointerUp}
      className="fixed inset-0 h-full w-full touch-none select-none"
    />
  );
};
