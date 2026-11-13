'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { CustomizationPanel } from '@/components/CustomizationPanel';
import { HandTrackerHUD } from '@/components/HandTrackerHUD';
import { HomeLandingOverlay } from '@/components/home/HomeLandingOverlay';
import { MaeKhongkhaModal } from '@/components/modals/MaeKhongkhaModal';
import { HowToPlayModal } from '@/components/modals/HowToPlayModal';
import { LoyKrathongLoreModal } from '@/components/modals/LoyKrathongLoreModal';
import { TopBarControls } from '@/components/navigation/TopBarControls';
import {
  buildStageItems,
  RiverCanvas,
} from '@/components/RiverCanvas';
import {
  BLESSING_MODAL_DELAY_MS,
  DEFAULT_KRATHONG_CONFIG,
  FLOAT_LIFESPAN_MS,
} from '@/constants/krathongDefaults';
import { useHandTracking } from '@/hooks/useHandTracking';
import {
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

export default function LoiKrathongPage() {
  const [gameState, setGameState] = useState<GameState>('HOME');
  const [krathongConfig, setKrathongConfig] = useState<KrathongConfig>(
    DEFAULT_KRATHONG_CONFIG
  );
  const [floatingKrathongs, setFloatingKrathongs] = useState<FloatingKrathong[]>([]);
  const [cameraEnabled, setCameraEnabled] = useState<boolean>(true);
  const [releasedCount, setReleasedCount] = useState<number>(0);
  const [totalRoundCount, setTotalRoundCount] = useState<number>(1);
  const [isBlessingModalOpen, setIsBlessingModalOpen] = useState<boolean>(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState<boolean>(false);
  const [isLoreModalOpen, setIsLoreModalOpen] = useState<boolean>(false);

  const blessingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gameStateRef = useRef<GameState>(gameState);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

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
        items.filter(
          (item) => !item.isLocal || now - item.createdAt < FLOAT_LIFESPAN_MS
        )
      );
    });
    return () => unsubscribe();
  }, []);

  // Prune only expired player-released (isLocal) items; ambient background items cycle seamlessly inside the 60fps canvas
  useEffect(() => {
    const cycleInterval = setInterval(() => {
      const now = Date.now();
      const inInteract = gameStateRef.current === 'INTERACT';
      setFloatingKrathongs((prev) => {
        const hasExpiredLocal = prev.some(
          (item) =>
            item.isLocal &&
            !inInteract &&
            now - item.createdAt >= FLOAT_LIFESPAN_MS
        );
        if (!hasExpiredLocal) return prev;
        return prev.filter(
          (item) =>
            !item.isLocal ||
            inInteract ||
            now - item.createdAt < FLOAT_LIFESPAN_MS
        );
      });
    }, 2000);

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
      const roundEndNow = Date.now();
      // Start the float & fade-out timer for ALL items in the set simultaneously once the last item is released
      setFloatingKrathongs((prev) =>
        prev.map((item) =>
          item.isLocal ? { ...item, createdAt: roundEndNow } : item
        )
      );
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

    const roundEndNow = Date.now();
    setFloatingKrathongs((prev) =>
      prev.map((item) =>
        item.isLocal ? { ...item, createdAt: roundEndNow } : item
      )
    );
    scheduleBlessingModal();
  }, [krathongConfig, handleReleaseItem, scheduleBlessingModal]);

  const handlePlayAgain = useCallback(() => {
    if (blessingTimerRef.current) {
      clearTimeout(blessingTimerRef.current);
    }
    setFloatingKrathongs((prev) =>
      prev.map((item) => (item.isLocal ? { ...item, isLocal: false } : item))
    );
    setIsBlessingModalOpen(false);
    setGameState('CUSTOMIZE');
  }, []);

  const handleGoHome = useCallback(() => {
    if (blessingTimerRef.current) {
      clearTimeout(blessingTimerRef.current);
    }
    setIsBlessingModalOpen(false);
    setGameState('HOME');
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

      <div className="pointer-events-none relative z-10 flex h-full w-full flex-col justify-between p-4 sm:p-6">
        <TopBarControls
          gameState={gameState}
          onGoHome={handleGoHome}
          onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
        />

        <AnimatePresence mode="wait">
          {gameState === 'HOME' && (
            <HomeLandingOverlay
              key="home-landing"
              onEnterPier={() => setGameState('CUSTOMIZE')}
              onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
              onOpenLore={() => setIsLoreModalOpen(true)}
            />
          )}
        </AnimatePresence>

        {gameState !== 'HOME' && (
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
        )}
      </div>

      {/* Samut Khoi Modals & Blessing Modal */}
      <HowToPlayModal
        isOpen={isHowToPlayOpen}
        onClose={() => setIsHowToPlayOpen(false)}
        onEnterPier={() => setGameState('CUSTOMIZE')}
      />

      <LoyKrathongLoreModal
        isOpen={isLoreModalOpen}
        onClose={() => setIsLoreModalOpen(false)}
      />

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
