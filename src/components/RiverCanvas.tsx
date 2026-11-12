'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import {
  FloatingKrathong,
  GameState,
  HandGestureState,
  KrathongConfig,
  NormalizedPoint,
  StageItem,
} from '@/types/krathong';
import {
  drawIllustratedHands,
  drawInteractiveSkyLantern,
  drawNightSkyAndMoon,
  drawProceduralKrathong,
  drawRiverSurface,
  drawTargetSpotlights,
  RIVER_DROP_ZONE_MIN_Y,
  RIVER_HORIZON_RATIO,
  RIVER_SPOT_TARGETS,
  SKY_LANTERN_TARGETS,
  SPOT_HIT_RADIUS_RATIO,
  SparkParticle,
} from '@/lib/canvasRenderer';

interface RiverCanvasProps {
  gameState: GameState;
  activeConfig: KrathongConfig;
  floatingKrathongs: FloatingKrathong[];
  gestureRef: React.RefObject<HandGestureState>;
  onReleaseItem: (
    item: StageItem,
    spawnXRatio: number,
    spawnYRatio: number
  ) => void;
  onProgressChange?: (releasedCount: number, totalCount: number) => void;
  onAllItemsReleased: (totalCount: number) => void;
}

const GRAB_HIT_RADIUS_RATIO = 0.135;
const FLOAT_CYCLE_DURATION_MS = 52000;
const SPRING_STIFFNESS = 100;
const SPRING_DAMPING = 15;

export function buildStageItems(config: KrathongConfig): StageItem[] {
  const mode = config.ritualMode ?? 'both';
  const players = config.playerCount ?? 1;

  const p1Name = config.authorName.trim() || 'ผู้ลอยคนที่ 1';
  const p1Wish =
    config.wishText.trim() || 'ขอให้มีความสุขสมหวัง สุขภาพแข็งแรงตลอดปี';
  const p2Name = config.partnerName?.trim() || 'คนพิเศษของเธอ';
  const p2Wish =
    config.partnerWishText?.trim() ||
    config.wishText.trim() ||
    'ขอให้เราสองคนพบเจอแต่ความสุขและรอยยิ้ม';

  const partnerConfig: KrathongConfig = {
    ...config,
    authorName: p2Name,
    wishText: p2Wish,
  };

  const rawItems: Omit<
    StageItem,
    'x' | 'y' | 'targetX' | 'targetY' | 'vx' | 'vy' | 'scale' | 'released' | 'grabbedByHandIndex' | 'grabbedByPointerId'
  >[] = [];

  if (mode === 'krathong-only') {
    rawItems.push({
      id: 'stage-krathong-1',
      itemType: 'krathong',
      ownerName: p1Name,
      wishText: p1Wish,
      config,
    });
    if (players === 2) {
      rawItems.push({
        id: 'stage-krathong-2',
        itemType: 'krathong',
        ownerName: p2Name,
        wishText: p2Wish,
        config: partnerConfig,
      });
    }
  } else if (mode === 'lantern-only') {
    rawItems.push({
      id: 'stage-lantern-1',
      itemType: 'lantern',
      ownerName: p1Name,
      wishText: p1Wish,
      config,
    });
    if (players === 2) {
      rawItems.push({
        id: 'stage-lantern-2',
        itemType: 'lantern',
        ownerName: p2Name,
        wishText: p2Wish,
        config: partnerConfig,
      });
    }
  } else {
    // mode === 'both'
    if (players === 1) {
      rawItems.push({
        id: 'stage-krathong-1',
        itemType: 'krathong',
        ownerName: p1Name,
        wishText: p1Wish,
        config,
      });
      rawItems.push({
        id: 'stage-lantern-1',
        itemType: 'lantern',
        ownerName: p1Name,
        wishText: p1Wish,
        config,
      });
    } else {
      // 2 players + both: 2 Krathongs + 1 Couple Sky Lantern (3 items total)
      rawItems.push({
        id: 'stage-krathong-1',
        itemType: 'krathong',
        ownerName: p1Name,
        wishText: p1Wish,
        config,
      });
      rawItems.push({
        id: 'stage-lantern-couple',
        itemType: 'lantern',
        ownerName: `${p1Name} & ${p2Name}`,
        wishText: p1Wish,
        config,
      });
      rawItems.push({
        id: 'stage-krathong-2',
        itemType: 'krathong',
        ownerName: p2Name,
        wishText: p2Wish,
        config: partnerConfig,
      });
    }
  }

  const total = rawItems.length;
  return rawItems.map((item, idx) => {
    const xPos =
      total === 1
        ? 0.5
        : total === 2
        ? idx === 0
          ? 0.36
          : 0.64
        : idx === 0
        ? 0.27
        : idx === 1
        ? 0.5
        : 0.73;

    const yPos = item.itemType === 'lantern' ? 0.41 : 0.49;

    return {
      ...item,
      x: xPos,
      y: yPos,
      targetX: xPos,
      targetY: yPos,
      vx: 0,
      vy: 0,
      scale: 1.04,
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
  onReleaseItem,
  onProgressChange,
  onAllItemsReleased,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageItemsRef = useRef<StageItem[]>([]);
  const roundCompletedRef = useRef<boolean>(false);
  const sparksRef = useRef<SparkParticle[]>([]);

  const latestPropsRef = useRef({
    gameState,
    activeConfig,
    floatingKrathongs,
    onReleaseItem,
    onProgressChange,
    onAllItemsReleased,
  });

  useEffect(() => {
    latestPropsRef.current = {
      gameState,
      activeConfig,
      floatingKrathongs,
      onReleaseItem,
      onProgressChange,
      onAllItemsReleased,
    };
  }, [
    gameState,
    activeConfig,
    floatingKrathongs,
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
    (item: StageItem, spawnX: number, spawnY: number, width: number, height: number) => {
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

  // Initialize stage items whenever entering INTERACT mode
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

      const width = window.innerWidth;
      const height = window.innerHeight;
      const {
        gameState: currentMode,
        activeConfig: currentConfig,
        floatingKrathongs: riverItems,
      } = latestPropsRef.current;
      const handState = gestureRef.current;

      drawNightSkyAndMoon(ctx, width, height, time);
      drawRiverSurface(ctx, width, height, time);

      // Multi-hand interaction in INTERACT mode
      if (currentMode === 'INTERACT') {
        const activeHands = handState.hands;
        const stageItems = stageItemsRef.current;

        // Release any item whose grabbing hand disappeared
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
              !item.released && item.grabbedByHandIndex === trackedHand.handIndex
          );

          if (trackedHand.isPinching) {
            let activeItem = grabbedItem;

            if (!activeItem) {
              // Find closest available item to pinch
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

              // Auto-release Sky Lantern when dragged into any glowing sky target circle!
              if (activeItem.itemType === 'lantern') {
                const skySpot = findNearestSpot(
                  { x: activeItem.x, y: activeItem.y },
                  SKY_LANTERN_TARGETS,
                  SPOT_HIT_RADIUS_RATIO * 1.15
                );
                if (skySpot) {
                  completeSingleItemRelease(
                    activeItem,
                    skySpot.x,
                    skySpot.y,
                    width,
                    height
                  );
                }
              }
            }
          } else if (grabbedItem) {
            // Hand un-pinched -> check if inside target spot or drop zone
            grabbedItem.grabbedByHandIndex = null;

            if (grabbedItem.itemType === 'krathong') {
              const riverSpot = findNearestSpot(
                { x: grabbedItem.x, y: grabbedItem.y },
                RIVER_SPOT_TARGETS,
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
                SKY_LANTERN_TARGETS,
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

        // Update spring physics for all stage items
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
            item.grabbedByHandIndex !== null || item.grabbedByPointerId !== null;
          const targetScale = isGrabbed ? 1.15 : 1.02;
          item.scale += (targetScale - item.scale) * Math.min(1, dt * 10);
        });
      }

      // Render released floating Krathongs (on the river) and Sky Lanterns (in the sky)
      const now = Date.now();
      const computedFloating = riverItems
        .map((item, idx) => {
          const elapsed = Math.max(0, (now - item.createdAt) % FLOAT_CYCLE_DURATION_MS);
          const progress = elapsed / FLOAT_CYCLE_DURATION_MS;
          const isLantern = item.itemType === 'lantern';

          if (isLantern) {
            const topLimitY = 0.04;
            const currentYRatio =
              item.spawnYRatio -
              (item.spawnYRatio - topLimitY) * Math.pow(progress, 0.82);
            const horizontalSway =
              Math.sin(time * 0.0008 + idx * 1.7) * 0.045 +
              progress * 0.06 * (idx % 2 === 0 ? 1 : -1);
            const currentXRatio = Math.max(
              0.06,
              Math.min(0.94, item.spawnXRatio + horizontalSway)
            );
            const perspectiveScale = Math.max(
              0.28,
              0.96 * Math.pow(1 - progress * 0.72, 1.05)
            );
            const fadeOut = progress > 0.88 ? (1 - progress) / 0.12 : 1;

            return {
              item,
              x: currentXRatio * width,
              y: currentYRatio * height,
              scale: perspectiveScale,
              opacity: Math.max(0, Math.min(1, fadeOut)),
            };
          }

          const horizonLimitY = RIVER_HORIZON_RATIO + 0.045;
          const currentYRatio =
            item.spawnYRatio -
            (item.spawnYRatio - horizonLimitY) * Math.pow(progress, 0.78);

          const horizontalDrift =
            Math.sin(time * 0.00065 + idx * 1.9) * 0.055 * (1 - progress * 0.5) +
            progress * 0.08 * (idx % 2 === 0 ? 1 : -1);

          const currentXRatio = Math.max(
            0.06,
            Math.min(0.94, item.spawnXRatio + horizontalDrift)
          );

          const perspectiveScale = Math.max(
            0.24,
            1.02 * Math.pow(1 - progress * 0.78, 1.15)
          );
          const fadeOut = progress > 0.88 ? (1 - progress) / 0.12 : 1;

          return {
            item,
            x: currentXRatio * width,
            y: currentYRatio * height,
            scale: perspectiveScale,
            opacity: Math.max(0, Math.min(1, fadeOut)),
          };
        })
        .sort((a, b) => a.y - b.y);

      computedFloating.forEach(({ item, x, y, scale, opacity }) => {
        if (item.itemType === 'lantern') {
          drawInteractiveSkyLantern({
            ctx,
            x,
            y,
            scale,
            config: item.config,
            time,
            showWishTag: true,
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
            showWishTag: true,
            opacity,
          });
        }

        if (sparksRef.current.length < 60 && Math.random() < 0.07 * scale) {
          sparksRef.current.push({
            x: x + (Math.random() - 0.5) * 10 * scale,
            y: item.itemType === 'lantern' ? y + 28 * scale : y - 50 * scale,
            vx: (Math.random() - 0.5) * 0.45,
            vy: item.itemType === 'lantern' ? 0.5 + Math.random() * 0.6 : -0.65 - Math.random() * 1.0,
            size: (1.4 + Math.random() * 1.5) * scale,
            alpha: 0.85 * opacity,
            decay: 0.02,
            color: '#FFF275',
          });
        }
      });

      // CUSTOMIZE mode live preview
      if (currentMode === 'CUSTOMIZE') {
        const mode = currentConfig.ritualMode ?? 'both';
        if (mode === 'krathong-only') {
          drawProceduralKrathong({
            ctx,
            x: width * 0.5,
            y: height * 0.29,
            scale: 1.2,
            config: currentConfig,
            time,
            showWishTag: true,
          });
        } else if (mode === 'lantern-only') {
          drawInteractiveSkyLantern({
            ctx,
            x: width * 0.5,
            y: height * 0.26,
            scale: 1.15,
            config: currentConfig,
            time,
            showWishTag: true,
          });
        } else {
          drawProceduralKrathong({
            ctx,
            x: width * 0.38,
            y: height * 0.3,
            scale: 1.08,
            config: currentConfig,
            time,
            showWishTag: true,
          });
          drawInteractiveSkyLantern({
            ctx,
            x: width * 0.62,
            y: height * 0.25,
            scale: 1.04,
            config: currentConfig,
            time,
            showWishTag: true,
            ownerLabel:
              currentConfig.playerCount === 2 && currentConfig.partnerName?.trim()
                ? `${currentConfig.authorName || 'เรา'} & ${currentConfig.partnerName}`
                : currentConfig.authorName,
          });
        }
      }

      // INTERACT mode: draw glowing circular target spots + un-released stage items
      if (currentMode === 'INTERACT') {
        const stageItems = stageItemsRef.current;
        drawTargetSpotlights(ctx, width, height, stageItems, time);

        stageItems.forEach((item) => {
          if (item.released) return;
          const ix = item.x * width;
          const iy = item.y * height;
          const isGrabbed =
            item.grabbedByHandIndex !== null || item.grabbedByPointerId !== null;

          if (item.itemType === 'lantern') {
            drawInteractiveSkyLantern({
              ctx,
              x: ix,
              y: iy,
              scale: item.scale,
              config: item.config,
              time,
              isHighlighted: isGrabbed,
              showWishTag: true,
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
              isHighlighted: isGrabbed,
              showWishTag: true,
              ownerLabel: item.ownerName,
              wishOverride: item.wishText,
            });
          }
        });
      }

      // Update & draw celebration sparks
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

      // Draw 2D Illustrated Hands on top when in INTERACT mode
      if (currentMode === 'INTERACT') {
        drawIllustratedHands(ctx, width, height, handState);
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

    // Auto-release Sky Lantern when dragged into sky target circle
    if (grabbedItem.itemType === 'lantern') {
      const skySpot = findNearestSpot(
        { x: grabbedItem.targetX, y: grabbedItem.targetY },
        SKY_LANTERN_TARGETS,
        SPOT_HIT_RADIUS_RATIO * 1.15
      );
      if (skySpot) {
        completeSingleItemRelease(
          grabbedItem,
          skySpot.x,
          skySpot.y,
          window.innerWidth,
          window.innerHeight
        );
      }
    }
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
        RIVER_SPOT_TARGETS,
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
        SKY_LANTERN_TARGETS,
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
      className="fixed inset-0 h-full w-full touch-none select-none"
    />
  );
};
