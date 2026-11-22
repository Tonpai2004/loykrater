export type GameState = 'HOME' | 'CUSTOMIZE' | 'INTERACT' | 'FLOATING';

export type BaseStyle = 'classic-lotus' | 'layered-star' | 'royal-pleat';

export type RitualItemType = 'krathong' | 'lantern';

export type RitualMode = 'krathong-only' | 'lantern-only' | 'both';

export type OfferingCount = 1 | 2 | 3 | 4 | 5;

export interface OfferingSlotConfig {
  id: string;
  itemType: RitualItemType;
  baseColor: string;
  flowerColor: string;
  candleColor: string;
  baseStyle: BaseStyle;
  wishText: string;
  authorName: string;
  hideWish?: boolean;
}

export interface KrathongConfig {
  baseColor: string;
  flowerColor: string;
  candleColor: string;
  baseStyle: BaseStyle;
  wishText: string;
  authorName: string;
  hideWish?: boolean;
  offeringCount?: OfferingCount;
  selectedSlotIndex?: number;
  offerings?: OfferingSlotConfig[];
}

export interface FloatingKrathong {
  id: string;
  itemType?: RitualItemType;
  config: KrathongConfig;
  spawnXRatio: number;
  spawnYRatio: number;
  createdAt: number;
  isLocal?: boolean;
  isAmbient?: boolean;
}

export interface StageItem {
  id: string;
  itemType: RitualItemType;
  ownerName: string;
  wishText: string;
  config: KrathongConfig;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  scale: number;
  released: boolean;
  grabbedByHandIndex: number | null;
  grabbedByPointerId: number | null;
}

export interface NormalizedPoint {
  x: number;
  y: number;
}

export interface TrackedHand {
  handIndex: number;
  isPinching: boolean;
  cursor: NormalizedPoint;
  thumbTip: NormalizedPoint;
  indexTip: NormalizedPoint;
  landmarks: NormalizedPoint[];
}

export interface HandGestureState {
  isReady: boolean;
  isTracking: boolean;
  isPinching: boolean;
  cursor: NormalizedPoint | null;
  thumbTip: NormalizedPoint | null;
  indexTip: NormalizedPoint | null;
  pinchDistance: number;
  hands: TrackedHand[];
  error: string | null;
}

export interface ColorOption {
  label: string;
  value: string;
  accent: string;
}
