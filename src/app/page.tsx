'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { CustomizationPanel } from '@/components/CustomizationPanel';
import { HandTrackerHUD } from '@/components/HandTrackerHUD';
import { HomeLandingOverlay } from '@/components/home/HomeLandingOverlay';
import { TopBarControls } from '@/components/navigation/TopBarControls';
import {
  buildStageItems,
  getActiveOfferings,
  RiverCanvas,
} from '@/components/RiverCanvas';
import {
  BLESSING_MODAL_DELAY_MS,
  DEFAULT_KRATHONG_CONFIG,
  FLOAT_LIFESPAN_MS,
} from '@/constants/krathongDefaults';
import { localizeWish } from '@/constants/translations';
import { useLanguage } from '@/contexts/LanguageContext';
import { useConsentPending } from '@/lib/consentStore';
import { useHandTracking } from '@/hooks/useHandTracking';
import {
  publishKrathong,
  subscribeToGlobalRiver,
} from '@/lib/firebase';
import {
  getRiverSpotTargets,
  getSkyLanternTargets,
} from '@/lib/canvasRenderer';
import {
  FloatingKrathong,
  GameState,
  KrathongConfig,
  OfferingSlotConfig,
  StageItem,
} from '@/types/krathong';

// Modals render nothing until opened, so they load after hydration instead of weighing on first paint
const MaeKhongkhaModal = dynamic(
  () => import('@/components/modals/MaeKhongkhaModal').then((m) => m.MaeKhongkhaModal),
  { ssr: false }
);
const HowToPlayModal = dynamic(
  () => import('@/components/modals/HowToPlayModal').then((m) => m.HowToPlayModal),
  { ssr: false }
);
const LoyKrathongLoreModal = dynamic(
  () => import('@/components/modals/LoyKrathongLoreModal').then((m) => m.LoyKrathongLoreModal),
  { ssr: false }
);
const ShareInviteSheet = dynamic(
  () => import('@/components/modals/ShareInviteSheet').then((m) => m.ShareInviteSheet),
  { ssr: false }
);
const WelcomeConsentModal = dynamic(
  () => import('@/components/modals/WelcomeConsentModal').then((m) => m.WelcomeConsentModal),
  { ssr: false }
);

const NO_OFFERINGS: OfferingSlotConfig[] = [];

export default function LoiKrathongPage() {
  const [gameState, setGameState] = useState<GameState>('HOME');
  const [krathongConfig, setKrathongConfig] = useState<KrathongConfig>(
    DEFAULT_KRATHONG_CONFIG
  );
  const [floatingKrathongs, setFloatingKrathongs] = useState<
    FloatingKrathong[]
  >([]);
  const [cameraEnabled, setCameraEnabled] = useState<boolean>(true);
  const [releasedCount, setReleasedCount] = useState<number>(0);
  const [totalRoundCount, setTotalRoundCount] = useState<number>(1);
  const [isBlessingModalOpen, setIsBlessingModalOpen] =
    useState<boolean>(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState<boolean>(false);
  const [isLoreModalOpen, setIsLoreModalOpen] = useState<boolean>(false);
  const [isPracticeActive, setIsPracticeActive] = useState<boolean>(false);
  // 'blessing' shares the round just floated; 'invite' is a general invitation from the top bar
  const [shareSource, setShareSource] = useState<'invite' | 'blessing' | null>(null);

  const { locale } = useLanguage();

  const displayConfig = useMemo<KrathongConfig>(
    () => ({
      ...krathongConfig,
      wishText: localizeWish(krathongConfig.wishText, locale),
      offerings: getActiveOfferings(krathongConfig).map((slot) => ({
        ...slot,
        wishText: localizeWish(slot.wishText, locale),
      })),
    }),
    [krathongConfig, locale]
  );
  const shareOfferings = useMemo(
    () => (shareSource === 'blessing' ? getActiveOfferings(displayConfig) : NO_OFFERINGS),
    [shareSource, displayConfig]
  );
  const closeShareSheet = useCallback(() => setShareSource(null), []);

  const blessingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gameStateRef = useRef<GameState>(gameState);
  const localRoundIdsRef = useRef<Set<string>>(new Set());

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

  const shouldTrackHand =
    cameraEnabled && (gameState === 'INTERACT' || isPracticeActive);
  const { videoRef, gestureState, gestureRef, retryCamera } = useHandTracking({
    enabled: shouldTrackHand,
  });

  useEffect(() => {
    const unsubscribe = subscribeToGlobalRiver((incomingItems) => {
      const now = Date.now();
      const inInteract = gameStateRef.current === 'INTERACT';
      const localIds = localRoundIdsRef.current;

      setFloatingKrathongs((prev) => {
        const localMap = new Map<string, FloatingKrathong>();
        for (const item of prev) {
          if (item.isLocal) {
            localMap.set(item.id, item);
          }
        }

        const merged = incomingItems
          .map((item) => {
            const existingLocal = localMap.get(item.id);
            if (existingLocal) {
              localMap.delete(item.id);
              return existingLocal;
            }
            if (localIds.has(item.id)) {
              return { ...item, isLocal: true, isAmbient: false };
            }
            return item;
          })
          .filter((item) => {
            if (item.isAmbient) return true;
            if (item.isLocal && inInteract) return true;
            return now - item.createdAt < FLOAT_LIFESPAN_MS;
          });

        for (const remainingLocal of localMap.values()) {
          if (inInteract || now - remainingLocal.createdAt < FLOAT_LIFESPAN_MS) {
            merged.push(remainingLocal);
          }
        }

        return merged;
      });
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const cycleInterval = setInterval(() => {
      const now = Date.now();
      const inInteract = gameStateRef.current === 'INTERACT';
      setFloatingKrathongs((prev) => {
        const hasExpired = prev.some(
          (item) =>
            !item.isAmbient &&
            !(item.isLocal && inInteract) &&
            now - item.createdAt >= FLOAT_LIFESPAN_MS
        );
        if (!hasExpired) return prev;
        return prev.filter(
          (item) =>
            item.isAmbient ||
            (item.isLocal && inInteract) ||
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

      localRoundIdsRef.current.add(published.id);

      setFloatingKrathongs((prev) => {
        if (prev.some((existing) => existing.id === published.id)) {
          return prev.map((existing) =>
            existing.id === published.id
              ? { ...existing, isLocal: true, isAmbient: false }
              : existing
          );
        }
        return [...prev, published];
      });
    },
    []
  );

  const handleProgressChange = useCallback(
    (released: number, total: number) => {
      setReleasedCount(released);
      setTotalRoundCount(total);
    },
    []
  );

  const handleAllItemsReleased = useCallback(
    (totalCount: number) => {
      const roundEndNow = Date.now();
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
    const items = buildStageItems(displayConfig);
    setGameState('FLOATING');
    setReleasedCount(items.length);
    setTotalRoundCount(items.length);

    const skyTargets = getSkyLanternTargets(
      window.innerWidth,
      window.innerHeight
    );
    const riverTargets = getRiverSpotTargets(
      window.innerWidth,
      window.innerHeight
    );

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.itemType === 'lantern') {
        const spot = skyTargets[i % skyTargets.length];
        await handleReleaseItem(item, spot.x, spot.y);
      } else {
        const spot = riverTargets[(i + 1) % riverTargets.length];
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
  }, [displayConfig, handleReleaseItem, scheduleBlessingModal]);

  const handlePlayAgain = useCallback(() => {
    if (blessingTimerRef.current) {
      clearTimeout(blessingTimerRef.current);
    }
    localRoundIdsRef.current.clear();
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

  const isConsentOpen = useConsentPending();
  const isAnyModalOpen =
    isHowToPlayOpen || isLoreModalOpen || isBlessingModalOpen || isConsentOpen;

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-[#0D1321] select-none">
      <RiverCanvas
        gameState={gameState}
        activeConfig={displayConfig}
        floatingKrathongs={floatingKrathongs}
        gestureRef={gestureRef}
        isPaused={isAnyModalOpen}
        onReleaseItem={handleReleaseItem}
        onProgressChange={handleProgressChange}
        onAllItemsReleased={handleAllItemsReleased}
      />

      <div className="pointer-events-none relative z-10 flex h-full w-full flex-col gap-3 [zoom:var(--ui-zoom,1)] pt-[max(0.75rem,env(safe-area-inset-top))] pr-[max(0.75rem,env(safe-area-inset-right))] pb-[max(0.75rem,env(safe-area-inset-bottom))] pl-[max(0.75rem,env(safe-area-inset-left))] sm:pt-[max(1.25rem,env(safe-area-inset-top))] sm:pr-[max(1.5rem,env(safe-area-inset-right))] sm:pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:pl-[max(1.5rem,env(safe-area-inset-left))]">
        <TopBarControls
          gameState={gameState}
          onGoHome={handleGoHome}
          onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
          onOpenInvite={() => setShareSource('invite')}
        />

        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain">
          <div className="flex min-h-full flex-col">
            {/* initial={false}: the home copy is server-rendered visible and enters via the CSS .lk-enter animation */}
            <AnimatePresence mode="wait" initial={false}>
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
              <section className="flex flex-1 flex-col justify-end gap-3 sm:gap-4">
                <AnimatePresence mode="wait">
                  {gameState === 'CUSTOMIZE' && (
                    <CustomizationPanel
                      key="customize-panel"
                      config={displayConfig}
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
        </div>
      </div>

      <HowToPlayModal
        isOpen={isHowToPlayOpen}
        onClose={() => setIsHowToPlayOpen(false)}
        onEnterPier={() => setGameState('CUSTOMIZE')}
        videoRef={videoRef}
        gestureState={gestureState}
        gestureRef={gestureRef}
        cameraEnabled={cameraEnabled}
        onToggleCamera={() => setCameraEnabled((prev) => !prev)}
        onPracticeActiveChange={setIsPracticeActive}
      />

      <LoyKrathongLoreModal
        isOpen={isLoreModalOpen}
        onClose={() => setIsLoreModalOpen(false)}
      />

      <MaeKhongkhaModal
        isOpen={isBlessingModalOpen}
        config={displayConfig}
        releasedCount={totalRoundCount}
        onPlayAgain={handlePlayAgain}
        onDismiss={() => setIsBlessingModalOpen(false)}
        onOpenShare={() => setShareSource('blessing')}
      />

      <ShareInviteSheet
        isOpen={shareSource !== null}
        offerings={shareOfferings}
        onClose={closeShareSheet}
      />

      <WelcomeConsentModal isOpen={isConsentOpen} />
    </main>
  );
}
