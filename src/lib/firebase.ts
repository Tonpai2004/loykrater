import type { FirebaseApp } from 'firebase/app';
import type { Database } from 'firebase/database';
import {
  BaseStyle,
  FloatingKrathong,
  KrathongConfig,
  RitualItemType,
} from '@/types/krathong';
import { moderatePublicText, takePublishSlot } from '@/lib/moderation';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const KRATHONGS_NODE = 'global_river_krathongs';
const MAX_ACTIVE_KRATHONGS = 35;
const FALLBACK_CHANNEL_NAME = 'loi_krathong_multiplayer_bus';

const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
const VALID_BASE_STYLES: readonly BaseStyle[] = [
  'classic-lotus',
  'layered-star',
  'royal-pleat',
];

const INITIAL_COMMUNITY_KRATHONGS: Omit<
  FloatingKrathong,
  'id' | 'createdAt'
>[] = [
  {
    itemType: 'krathong',
    spawnXRatio: 0.14,
    spawnYRatio: 0.84,
    config: {
      baseColor: '#2D6A4F',
      flowerColor: '#FF99C8',
      candleColor: '#F4D06F',
      baseStyle: 'classic-lotus',
      wishText: '',
      authorName: '',
      hideWish: true,
    },
  },
  {
    itemType: 'krathong',
    spawnXRatio: 0.28,
    spawnYRatio: 0.79,
    config: {
      baseColor: '#40916C',
      flowerColor: '#F4D06F',
      candleColor: '#FF8C42',
      baseStyle: 'royal-pleat',
      wishText: '',
      authorName: '',
      hideWish: true,
    },
  },
  {
    itemType: 'krathong',
    spawnXRatio: 0.42,
    spawnYRatio: 0.86,
    config: {
      baseColor: '#52B788',
      flowerColor: '#FFF275',
      candleColor: '#F4D06F',
      baseStyle: 'layered-star',
      wishText: '',
      authorName: '',
      hideWish: true,
    },
  },
  {
    itemType: 'lantern',
    spawnXRatio: 0.32,
    spawnYRatio: 0.29,
    config: {
      baseColor: '#2D6A4F',
      flowerColor: '#FF8C42',
      candleColor: '#F4D06F',
      baseStyle: 'layered-star',
      wishText: '',
      authorName: '',
      hideWish: true,
    },
  },
  {
    itemType: 'krathong',
    spawnXRatio: 0.58,
    spawnYRatio: 0.82,
    config: {
      baseColor: '#B5838D',
      flowerColor: '#E0AAFF',
      candleColor: '#FFF275',
      baseStyle: 'classic-lotus',
      wishText: '',
      authorName: '',
      hideWish: true,
    },
  },
  {
    itemType: 'krathong',
    spawnXRatio: 0.72,
    spawnYRatio: 0.87,
    config: {
      baseColor: '#2D6A4F',
      flowerColor: '#FF8C42',
      candleColor: '#F4D06F',
      baseStyle: 'royal-pleat',
      wishText: '',
      authorName: '',
      hideWish: true,
    },
  },
  {
    itemType: 'krathong',
    spawnXRatio: 0.85,
    spawnYRatio: 0.8,
    config: {
      baseColor: '#40916C',
      flowerColor: '#FF99C8',
      candleColor: '#FFF275',
      baseStyle: 'layered-star',
      wishText: '',
      authorName: '',
      hideWish: true,
    },
  },
  {
    itemType: 'lantern',
    spawnXRatio: 0.68,
    spawnYRatio: 0.27,
    config: {
      baseColor: '#40916C',
      flowerColor: '#F4D06F',
      candleColor: '#FFF275',
      baseStyle: 'royal-pleat',
      wishText: '',
      authorName: '',
      hideWish: true,
    },
  },
  {
    itemType: 'krathong',
    spawnXRatio: 0.2,
    spawnYRatio: 0.76,
    config: {
      baseColor: '#52B788',
      flowerColor: '#F4D06F',
      candleColor: '#FF8C42',
      baseStyle: 'classic-lotus',
      wishText: '',
      authorName: '',
      hideWish: true,
    },
  },
  {
    itemType: 'krathong',
    spawnXRatio: 0.36,
    spawnYRatio: 0.88,
    config: {
      baseColor: '#2D6A4F',
      flowerColor: '#E0AAFF',
      candleColor: '#F4D06F',
      baseStyle: 'royal-pleat',
      wishText: '',
      authorName: '',
      hideWish: true,
    },
  },
  {
    itemType: 'krathong',
    spawnXRatio: 0.5,
    spawnYRatio: 0.77,
    config: {
      baseColor: '#40916C',
      flowerColor: '#FFF275',
      candleColor: '#FF99C8',
      baseStyle: 'layered-star',
      wishText: '',
      authorName: '',
      hideWish: true,
    },
  },
  {
    itemType: 'krathong',
    spawnXRatio: 0.65,
    spawnYRatio: 0.83,
    config: {
      baseColor: '#B5838D',
      flowerColor: '#FF99C8',
      candleColor: '#F4D06F',
      baseStyle: 'classic-lotus',
      wishText: '',
      authorName: '',
      hideWish: true,
    },
  },
  {
    itemType: 'lantern',
    spawnXRatio: 0.52,
    spawnYRatio: 0.31,
    config: {
      baseColor: '#B5838D',
      flowerColor: '#FFF275',
      candleColor: '#FF8C42',
      baseStyle: 'classic-lotus',
      wishText: '',
      authorName: '',
      hideWish: true,
    },
  },
  {
    itemType: 'krathong',
    spawnXRatio: 0.79,
    spawnYRatio: 0.85,
    config: {
      baseColor: '#2D6A4F',
      flowerColor: '#F4D06F',
      candleColor: '#FFF275',
      baseStyle: 'royal-pleat',
      wishText: '',
      authorName: '',
      hideWish: true,
    },
  },
  {
    itemType: 'krathong',
    spawnXRatio: 0.11,
    spawnYRatio: 0.78,
    config: {
      baseColor: '#40916C',
      flowerColor: '#FF8C42',
      candleColor: '#F4D06F',
      baseStyle: 'layered-star',
      wishText: '',
      authorName: '',
      hideWish: true,
    },
  },
  {
    itemType: 'krathong',
    spawnXRatio: 0.9,
    spawnYRatio: 0.84,
    config: {
      baseColor: '#52B788',
      flowerColor: '#E0AAFF',
      candleColor: '#FFF275',
      baseStyle: 'classic-lotus',
      wishText: '',
      authorName: '',
      hideWish: true,
    },
  },
];

function sanitizeHexColor(value: unknown, fallback: string): string {
  return typeof value === 'string' && HEX_COLOR_REGEX.test(value)
    ? value
    : fallback;
}

function sanitizeBaseStyle(value: unknown): BaseStyle {
  return typeof value === 'string' &&
    (VALID_BASE_STYLES as readonly string[]).includes(value)
    ? (value as BaseStyle)
    : 'classic-lotus';
}

function clampRatio(value: unknown, min: number, max: number, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.max(min, Math.min(max, value));
}

function sanitizeFloatingKrathong(
  id: string,
  raw: unknown
): FloatingKrathong | null {
  if (!raw || typeof raw !== 'object') return null;

  const record = raw as Record<string, unknown>;
  const rawConfig =
    record.config && typeof record.config === 'object'
      ? (record.config as Record<string, unknown>)
      : null;

  if (!rawConfig) return null;

  const itemType: RitualItemType =
    record.itemType === 'lantern' ? 'lantern' : 'krathong';
  const hideWish = Boolean(rawConfig.hideWish);
  const wishText = hideWish
    ? ''
    : typeof rawConfig.wishText === 'string'
      ? moderatePublicText(rawConfig.wishText).slice(0, 70)
      : '';
  const authorName =
    typeof rawConfig.authorName === 'string'
      ? moderatePublicText(rawConfig.authorName).slice(0, 24)
      : '';

  const defaultY = itemType === 'lantern' ? 0.25 : 0.78;
  const minY = itemType === 'lantern' ? 0.14 : 0.58;
  const maxY = itemType === 'lantern' ? 0.4 : 0.9;

  return {
    id,
    itemType,
    config: {
      baseColor: sanitizeHexColor(rawConfig.baseColor, '#2D6A4F'),
      flowerColor: sanitizeHexColor(rawConfig.flowerColor, '#FF99C8'),
      candleColor: sanitizeHexColor(rawConfig.candleColor, '#F4D06F'),
      baseStyle: sanitizeBaseStyle(rawConfig.baseStyle),
      wishText,
      authorName,
      hideWish,
    },
    spawnXRatio: clampRatio(record.spawnXRatio, 0.08, 0.92, 0.5),
    spawnYRatio: clampRatio(record.spawnYRatio, minY, maxY, defaultY),
    createdAt:
      typeof record.createdAt === 'number' && Number.isFinite(record.createdAt)
        ? record.createdAt
        : Date.now(),
    isAmbient: false,
  };
}

export function isFirebaseConfigured(): boolean {
  const url = firebaseConfig.databaseURL;
  if (!url) return false;
  if (url.includes('your_project_id')) return false;
  return url.startsWith('https://');
}

type FirebaseDatabaseSdk = typeof import('firebase/database');

// The SDK is imported on first use so it stays out of the first-paint bundle
let firebaseSdkPromise: Promise<
  [typeof import('firebase/app'), FirebaseDatabaseSdk]
> | null = null;

async function getFirebaseDatabase(): Promise<{
  db: Database;
  sdk: FirebaseDatabaseSdk;
} | null> {
  if (!isFirebaseConfigured()) return null;

  try {
    firebaseSdkPromise ??= Promise.all([
      import('firebase/app'),
      import('firebase/database'),
    ]);
    const [{ initializeApp, getApps, getApp }, sdk] = await firebaseSdkPromise;
    // Skip the long-polling handshake: it loads an iframe with a deprecated unload listener
    // and several uncacheable requests before upgrading to a WebSocket anyway
    sdk.forceWebSockets();
    const app: FirebaseApp =
      getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    return { db: sdk.getDatabase(app), sdk };
  } catch {
    return null;
  }
}

export async function publishKrathong(
  config: KrathongConfig,
  spawnXRatio: number,
  spawnYRatio: number,
  itemType: RitualItemType = 'krathong'
): Promise<FloatingKrathong> {
  const clampedY =
    itemType === 'lantern'
      ? clampRatio(spawnYRatio, 0.14, 0.4, 0.25)
      : clampRatio(spawnYRatio, 0.58, 0.9, 0.78);

  const hideWish = Boolean(config.hideWish);
  const sanitizedConfig: KrathongConfig = {
    baseColor: sanitizeHexColor(config.baseColor, '#2D6A4F'),
    flowerColor: sanitizeHexColor(config.flowerColor, '#FF99C8'),
    candleColor: sanitizeHexColor(config.candleColor, '#F4D06F'),
    baseStyle: sanitizeBaseStyle(config.baseStyle),
    hideWish,
    wishText: hideWish ? '' : moderatePublicText(config.wishText).slice(0, 70),
    authorName: moderatePublicText(config.authorName).slice(0, 24),
  };

  const payload: Omit<FloatingKrathong, 'id'> = {
    itemType,
    config: sanitizedConfig,
    spawnXRatio: clampRatio(spawnXRatio, 0.08, 0.92, 0.5),
    spawnYRatio: clampedY,
    createdAt: Date.now(),
  };

  const firebase = await getFirebaseDatabase();
  if (!firebase) {
    const id = `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const localKrathong: FloatingKrathong = {
      ...payload,
      id,
      isLocal: true,
      isAmbient: false,
    };

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel(FALLBACK_CHANNEL_NAME);
      channel.postMessage({
        ...payload,
        id,
        isLocal: false,
        isAmbient: false,
      });
      channel.close();
    }

    return localKrathong;
  }

  const { db, sdk: { ref, push, set, serverTimestamp } } = firebase;

  // Over the per-device limit the offering still floats here, it just isn't shared
  if (!takePublishSlot()) {
    return {
      ...payload,
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      isLocal: true,
      isAmbient: false,
    };
  }

  const newItemRef = push(ref(db, KRATHONGS_NODE));
  // Server clock stamps the record (the rules require createdAt === now). Don't await the ack:
  // offline or rejected writes must not stall the round, the offering already floats locally.
  set(newItemRef, { ...payload, createdAt: serverTimestamp() }).catch((error: unknown) => {
    console.warn('[loykrater] Could not share this offering to the river', error);
  });

  return {
    ...payload,
    id: newItemRef.key ?? `fb-${Date.now()}`,
    isLocal: true,
    isAmbient: false,
  };
}

export function createInitialAmbientKrathongs(): FloatingKrathong[] {
  const now = Date.now();
  return INITIAL_COMMUNITY_KRATHONGS.map((item, idx) => ({
    ...item,
    id: `seed-${idx}`,
    createdAt: now - idx * 2375,
    isLocal: false,
    isAmbient: true,
  }));
}

function subscribeToFallbackRiver(
  onUpdate: (krathongs: FloatingKrathong[]) => void,
  ambientSeeds: FloatingKrathong[]
): () => void {
  let fallbackList: FloatingKrathong[] = [...ambientSeeds];

  queueMicrotask(() => {
    onUpdate(fallbackList);
  });

  const channel =
    typeof window !== 'undefined' && 'BroadcastChannel' in window
      ? new BroadcastChannel(FALLBACK_CHANNEL_NAME)
      : null;

  if (channel) {
    channel.onmessage = (event: MessageEvent<unknown>) => {
      const raw = event.data as Record<string, unknown> | null;
      const rawId = typeof raw?.id === 'string' ? raw.id : null;
      if (!rawId) return;

      const sanitized = sanitizeFloatingKrathong(rawId, raw);
      if (!sanitized) return;

      fallbackList = [
        ...fallbackList.filter((item) => item.id !== sanitized.id).slice(-(MAX_ACTIVE_KRATHONGS - 1)),
        sanitized,
      ];
      queueMicrotask(() => {
        onUpdate(fallbackList);
      });
    };
  }

  return () => {
    channel?.close();
  };
}

function subscribeToFirebaseRiver(
  { db, sdk: { ref, onValue, query, orderByChild, limitToLast } }: {
    db: Database;
    sdk: FirebaseDatabaseSdk;
  },
  onUpdate: (krathongs: FloatingKrathong[]) => void,
  ambientSeeds: FloatingKrathong[]
): () => void {
  const recentKrathongsQuery = query(
    ref(db, KRATHONGS_NODE),
    orderByChild('createdAt'),
    limitToLast(MAX_ACTIVE_KRATHONGS)
  );

  // Records carry server time; shift them onto this device's clock so the lifespan
  // checks (Date.now() - createdAt) hold even when the device clock is off
  let serverTimeOffsetMs = 0;
  let latestRaw: Record<string, unknown> | null = null;

  const emit = () => {
    if (!latestRaw || typeof latestRaw !== 'object') {
      onUpdate(ambientSeeds);
      return;
    }

    const parsed: FloatingKrathong[] = Object.entries(latestRaw)
      .map(([id, value]) => sanitizeFloatingKrathong(id, value))
      .filter((item): item is FloatingKrathong => item !== null)
      .map((item) => ({ ...item, createdAt: item.createdAt - serverTimeOffsetMs }))
      .sort((a, b) => a.createdAt - b.createdAt);

    onUpdate([...ambientSeeds, ...parsed]);
  };

  const unsubscribeOffset = onValue(ref(db, '.info/serverTimeOffset'), (snapshot) => {
    const offset = snapshot.val();
    serverTimeOffsetMs = typeof offset === 'number' && Number.isFinite(offset) ? offset : 0;
    if (latestRaw) emit();
  });

  const unsubscribeRiver = onValue(recentKrathongsQuery, (snapshot) => {
    latestRaw = snapshot.val() as Record<string, unknown> | null;
    emit();
  });

  return () => {
    unsubscribeOffset();
    unsubscribeRiver();
  };
}

export function subscribeToGlobalRiver(
  onUpdate: (krathongs: FloatingKrathong[]) => void
): () => void {
  const ambientSeeds = createInitialAmbientKrathongs();

  if (!isFirebaseConfigured()) {
    return subscribeToFallbackRiver(onUpdate, ambientSeeds);
  }

  let cancelled = false;
  let cleanup: (() => void) | null = null;

  getFirebaseDatabase().then((firebase) => {
    if (cancelled) return;
    cleanup = firebase
      ? subscribeToFirebaseRiver(firebase, onUpdate, ambientSeeds)
      : subscribeToFallbackRiver(onUpdate, ambientSeeds);
  });

  return () => {
    cancelled = true;
    cleanup?.();
  };
}
