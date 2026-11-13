'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { CustomizationPanel } from '@/components/CustomizationPanel';
import { HandTrackerHUD } from '@/components/HandTrackerHUD';
import { MaeKhongkhaModal } from '@/components/MaeKhongkhaModal';
import {
  buildStageItems,
  FLOAT_LIFESPAN_MS,
  RiverCanvas,
} from '@/components/RiverCanvas';
import { useHandTracking } from '@/hooks/useHandTracking';
import {
  createAmbientFloatingItem,
  publishKrathong,
  subscribeToGlobalRiver,
} from '@/lib/firebase';
import {
  RIVER_SPOT_TARGETS,
  SKY_LANTERN_TARGETS,
} from '@/lib/canvasRenderer';
import {
  FloatingKrathong,
  GameState,
  KrathongConfig,
  StageItem,
} from '@/types/krathong';

const DEFAULT_KRATHONG_CONFIG: KrathongConfig = {
  baseColor: '#2D6A4F',
  flowerColor: '#FF99C8',
  candleColor: '#F4D06F',
  baseStyle: 'classic-lotus',
  wishText: 'ฝากทุกข์โศกลอยลับไปกับน้ำ ให้คืนค่ำมีแต่สุขทุกแห่งหน',
  authorName: '',
  offeringCount: 1,
  selectedSlotIndex: 0,
};

const MIN_AMBIENT_ITEMS = 5;
const BLESSING_MODAL_DELAY_MS = 7800;

export default function LoiKrathongPage() {
  const [gameState, setGameState] = useState<GameState>('CUSTOMIZE');
  const [krathongConfig, setKrathongConfig] = useState<KrathongConfig>(
    DEFAULT_KRATHONG_CONFIG
  );
  const [floatingKrathongs, setFloatingKrathongs] = useState<FloatingKrathong[]>([]);
  const [cameraEnabled, setCameraEnabled] = useState<boolean>(true);
  const [releasedCount, setReleasedCount] = useState<number>(0);
  const [totalRoundCount, setTotalRoundCount] = useState<number>(1);
  const [isBlessingModalOpen, setIsBlessingModalOpen] = useState<boolean>(false);
  const blessingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ambientSeqRef = useRef<number>(4);

  const scheduleBlessingModal = useCallback(() => {
    if (blessingTimerRef.current) {
      clearTimeout(blessingTimerRef.current);
    }
    blessingTimerRef.current = setTimeout(() => {
      setIsBlessingModalOpen(true);
    }, BLESSING_MODAL_DELAY_MS);
  }, []);

  const shouldTrackHand = gameState === 'INTERACT' && cameraEnabled;
  const { videoRef, gestureState, gestureRef, retryCamera } = useHandTracking({
    enabled: shouldTrackHand,
  });

  useEffect(() => {
    const unsubscribe = subscribeToGlobalRiver((items) => {
      const now = Date.now();
      setFloatingKrathongs(
        items.filter((item) => now - item.createdAt < FLOAT_LIFESPAN_MS)
      );
    });
    return () => unsubscribe();
  }, []);

  // Prune expired floating items after their 24s lifespan AND gently spawn new ambient background items
  useEffect(() => {
    const cycleInterval = setInterval(() => {
      const now = Date.now();
      setFloatingKrathongs((prev) => {
        const active = prev.filter(
          (item) => now - item.createdAt < FLOAT_LIFESPAN_MS
        );

        if (active.length < MIN_AMBIENT_ITEMS) {
          ambientSeqRef.current += 1;
          const nextAmbient = createAmbientFloatingItem(ambientSeqRef.current);
          return [...active, nextAmbient];
        }

        return active.length === prev.length ? prev : active;
      });
    }, 3400);

    return () => clearInterval(cycleInterval);
  }, []);

  const handleReleaseItem = useCallback(
    async (item: StageItem, spawnXRatio: number, spawnYRatio: number) => {
      const itemConfig: KrathongConfig = {
        ...item.config,
        authorName: item.ownerName,
        wishText: item.wishText,
        hideWish: item.config.hideWish ?? false,
      };

      const published = await publishKrathong(
        itemConfig,
        spawnXRatio,
        spawnYRatio,
        item.itemType
      );

      setFloatingKrathongs((prev) => {
        if (prev.some((existing) => existing.id === published.id)) return prev;
        return [...prev, published];
      });
    },
    []
  );

  const handleProgressChange = useCallback((released: number, total: number) => {
    setReleasedCount(released);
    setTotalRoundCount(total);
  }, []);

  const handleAllItemsReleased = useCallback(
    (totalCount: number) => {
      setReleasedCount(totalCount);
      setTotalRoundCount(totalCount);
      setGameState('FLOATING');
      scheduleBlessingModal();
    },
    [scheduleBlessingModal]
  );

  const handleQuickLaunch = useCallback(async () => {
    const items = buildStageItems(krathongConfig);
    setGameState('FLOATING');
    setReleasedCount(items.length);
    setTotalRoundCount(items.length);

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.itemType === 'lantern') {
        const spot = SKY_LANTERN_TARGETS[i % SKY_LANTERN_TARGETS.length];
        await handleReleaseItem(item, spot.x, spot.y);
      } else {
        const spot = RIVER_SPOT_TARGETS[(i + 1) % RIVER_SPOT_TARGETS.length];
        await handleReleaseItem(item, spot.x, spot.y);
      }
    }

    scheduleBlessingModal();
  }, [krathongConfig, handleReleaseItem, scheduleBlessingModal]);

  const handlePlayAgain = useCallback(() => {
    if (blessingTimerRef.current) {
      clearTimeout(blessingTimerRef.current);
    }
    setIsBlessingModalOpen(false);
    setGameState('CUSTOMIZE');
  }, []);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[#0D1321] select-none">
      <RiverCanvas
        gameState={gameState}
        activeConfig={krathongConfig}
        floatingKrathongs={floatingKrathongs}
        gestureRef={gestureRef}
        onReleaseItem={handleReleaseItem}
        onProgressChange={handleProgressChange}
        onAllItemsReleased={handleAllItemsReleased}
      />

      <div className="pointer-events-none relative z-10 flex h-full w-full flex-col justify-end p-4 sm:p-6">
        <section className="flex flex-col justify-end gap-4">
          <AnimatePresence mode="wait">
            {gameState === 'CUSTOMIZE' && (
              <CustomizationPanel
                key="customize-panel"
                config={krathongConfig}
                onChange={setKrathongConfig}
                onStartInteract={() => {
                  setIsBlessingModalOpen(false);
                  setGameState('INTERACT');
                }}
              />
            )}
          </AnimatePresence>

          <HandTrackerHUD
            gameState={gameState}
            videoRef={videoRef}
            gestureState={gestureState}
            cameraEnabled={cameraEnabled}
            releasedCount={releasedCount}
            totalCount={totalRoundCount}
            onToggleCamera={() => setCameraEnabled((prev) => !prev)}
            onRetryCamera={retryCamera}
            onBackToCustomize={() => setGameState('CUSTOMIZE')}
            onQuickLaunch={handleQuickLaunch}
            onCreateAnother={handlePlayAgain}
            onOpenBlessingModal={() => setIsBlessingModalOpen(true)}
          />
        </section>
      </div>

      <MaeKhongkhaModal
        isOpen={isBlessingModalOpen}
        config={krathongConfig}
        releasedCount={totalRoundCount}
        onPlayAgain={handlePlayAgain}
        onDismiss={() => setIsBlessingModalOpen(false)}
      />
    </main>
  );
}
