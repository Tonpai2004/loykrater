'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CustomizationPanel } from '@/components/CustomizationPanel';
import { HandTrackerHUD } from '@/components/HandTrackerHUD';
import { MaeKhongkhaModal } from '@/components/MaeKhongkhaModal';
import { buildStageItems, RiverCanvas } from '@/components/RiverCanvas';
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

const SPRING_TRANSITION = {
  type: 'spring' as const,
  stiffness: 100,
  damping: 16,
};

function ThaiGlobalOctagramSeal() {
  return (
    <svg viewBox="0 0 40 40" className="h-10 w-10 shrink-0 overflow-visible">
      <rect
        x="7"
        y="7"
        width="26"
        height="26"
        fill="none"
        stroke="#D4AF37"
        strokeWidth="1"
      />
      <rect
        x="7"
        y="7"
        width="26"
        height="26"
        transform="rotate(45 20 20)"
        fill="#0B0E17"
        stroke="#D4AF37"
        strokeWidth="1"
      />
      <polygon points="20,9 24,20 20,31 16,20" fill="#B83B2A" />
      <polygon points="9,20 20,16 31,20 20,24" fill="#D4AF37" opacity="0.85" />
      <circle cx="20" cy="20" r="2.5" fill="#FFF275" />
    </svg>
  );
}

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

  const scheduleBlessingModal = useCallback(() => {
    if (blessingTimerRef.current) {
      clearTimeout(blessingTimerRef.current);
    }
    blessingTimerRef.current = setTimeout(() => {
      setIsBlessingModalOpen(true);
    }, 3200);
  }, []);

  const shouldTrackHand = gameState === 'INTERACT' && cameraEnabled;
  const { videoRef, gestureState, gestureRef, retryCamera } = useHandTracking({
    enabled: shouldTrackHand,
  });

  useEffect(() => {
    const unsubscribe = subscribeToGlobalRiver((items) => {
      setFloatingKrathongs(items);
    });
    return () => unsubscribe();
  }, []);

  const handleReleaseItem = useCallback(
    async (item: StageItem, spawnXRatio: number, spawnYRatio: number) => {
      const itemConfig: KrathongConfig = {
        ...item.config,
        authorName: item.ownerName,
        wishText: item.wishText,
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

      <div className="pointer-events-none relative z-10 flex h-full w-full flex-col justify-between p-4 sm:p-6">
        {/* Editorial Phra Nakhon Masthead */}
        <header className="flex flex-wrap items-start justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SPRING_TRANSITION}
            className="pointer-events-auto flex items-center gap-3.5 border-l-2 border-[#D4AF37] bg-[#0B0E17]/75 px-4 py-2 backdrop-blur-md"
          >
            <ThaiGlobalOctagramSeal />
            <div>
              <p className="font-heading text-[11px] tracking-wider text-[#F4D06F]">
                มหรสพสายน้ำและฟากฟ้ายามราตรี • คืนเพ็ญเดือนสิบสอง ณ ท่าน้ำพระนคร
              </p>
              <div className="flex flex-wrap items-baseline gap-2.5">
                <h1 className="font-display text-2xl font-normal tracking-wide text-[#FFFDF7] sm:text-3xl">
                  ลอยกะเธอ
                </h1>
                <span className="font-editorial text-base italic text-[#D4AF37]">
                  / Loikratur
                </span>
              </div>
              <p className="font-wish text-xs text-[#FFF275]/85">
                “จันทร์เอ๋ยจันทร์ฉาย แสงพราวพรายเหนือสายชล อธิษฐานใต้แสงกมล บันดาลดลลงกลางใจ”
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SPRING_TRANSITION}
            className="thai-chamfer-sm pointer-events-auto flex items-center gap-3 border border-[#D4AF37]/45 bg-[#0B0E17]/90 px-4 py-2.5 backdrop-blur-md"
          >
            <div className="text-right">
              <p className="font-heading text-[10px] tracking-wider text-[#F4D06F]">
                ดวงประทีปล่องธาราและเวหา
              </p>
              <p className="font-wish text-sm text-[#FFFDF7]/90">
                ลอยเคียงจันทร์อยู่{' '}
                <strong className="font-display text-base font-medium text-[#FFF275]">
                  {floatingKrathongs.length}
                </strong>{' '}
                ดวง
              </p>
            </div>
          </motion.div>
        </header>

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
