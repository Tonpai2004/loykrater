import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  push,
  set,
  onValue,
  query,
  orderByChild,
  limitToLast,
  Database,
} from 'firebase/database';
import { FloatingKrathong, KrathongConfig, RitualItemType } from '@/types/krathong';

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

const INITIAL_COMMUNITY_KRATHONGS: Omit<FloatingKrathong, 'id' | 'createdAt'>[] = [
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

export function createAmbientFloatingItem(seq: number): FloatingKrathong {
  const template =
    INITIAL_COMMUNITY_KRATHONGS[seq % INITIAL_COMMUNITY_KRATHONGS.length];
  const jitterX = (((seq * 37) % 23) - 11) * 0.011;
  const jitterY = (((seq * 29) % 13) - 6) * 0.008;

  const spawnXRatio = Math.max(
    0.08,
    Math.min(0.92, template.spawnXRatio + jitterX)
  );
  const spawnYRatio =
    template.itemType === 'lantern'
      ? Math.max(0.2, Math.min(0.35, template.spawnYRatio + jitterY))
      : Math.max(0.72, Math.min(0.89, template.spawnYRatio + jitterY));

  return {
    ...template,
    id: `ambient-${Date.now()}-${seq}`,
    spawnXRatio,
    spawnYRatio,
    createdAt: Date.now(),
  };
}

export function isFirebaseConfigured(): boolean {
  const url = firebaseConfig.databaseURL;
  if (!url) return false;
  if (url.includes('your_project_id')) return false;
  return url.startsWith('https://');
}

function getFirebaseDatabase(): Database | null {
  if (!isFirebaseConfigured()) return null;

  try {
    const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    return getDatabase(app);
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
      ? Math.max(0.14, Math.min(0.4, spawnYRatio))
      : Math.max(0.58, Math.min(0.9, spawnYRatio));

  const payload: Omit<FloatingKrathong, 'id'> = {
    itemType,
    config: {
      ...config,
      hideWish: config.hideWish ?? false,
      wishText: config.hideWish
        ? ''
        : config.wishText.trim() || 'ขอให้พบเจอแต่ความสุขความเจริญ',
      authorName: config.authorName.trim() || 'ผู้ร่วมลอย กะ เธอ',
    },
    spawnXRatio: Math.max(0.08, Math.min(0.92, spawnXRatio)),
    spawnYRatio: clampedY,
    createdAt: Date.now(),
  };

  const db = getFirebaseDatabase();
  if (!db) {
    const localKrathong: FloatingKrathong = {
      ...payload,
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      isLocal: true,
    };

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel(FALLBACK_CHANNEL_NAME);
      channel.postMessage(localKrathong);
      channel.close();
    }

    return localKrathong;
  }

  const riverRef = ref(db, KRATHONGS_NODE);
  const newItemRef = push(riverRef);
  await set(newItemRef, payload);

  return {
    ...payload,
    id: newItemRef.key ?? `fb-${Date.now()}`,
    isLocal: true,
  };
}

export function createInitialAmbientKrathongs(): FloatingKrathong[] {
  const now = Date.now();
  return INITIAL_COMMUNITY_KRATHONGS.map((item, idx) => ({
    ...item,
    id: `seed-${idx}`,
    createdAt: now - idx * 2375,
  }));
}

export function subscribeToGlobalRiver(
  onUpdate: (krathongs: FloatingKrathong[]) => void
): () => void {
  const db = getFirebaseDatabase();
  const ambientSeeds = createInitialAmbientKrathongs();

  if (!db) {
    let fallbackList: FloatingKrathong[] = [...ambientSeeds];

    queueMicrotask(() => {
      onUpdate(fallbackList);
    });

    const channel =
      typeof window !== 'undefined' && 'BroadcastChannel' in window
        ? new BroadcastChannel(FALLBACK_CHANNEL_NAME)
        : null;

    if (channel) {
      channel.onmessage = (event: MessageEvent<FloatingKrathong>) => {
        if (!event.data?.id) return;
        fallbackList = [
          ...fallbackList.slice(-(MAX_ACTIVE_KRATHONGS - 1)),
          event.data,
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

  const recentKrathongsQuery = query(
    ref(db, KRATHONGS_NODE),
    orderByChild('createdAt'),
    limitToLast(MAX_ACTIVE_KRATHONGS)
  );

  const unsubscribe = onValue(recentKrathongsQuery, (snapshot) => {
    const rawData = snapshot.val() as Record<
      string,
      Omit<FloatingKrathong, 'id'>
    > | null;
    if (!rawData) {
      onUpdate(ambientSeeds);
      return;
    }

    const parsed: FloatingKrathong[] = Object.entries(rawData)
      .map(([id, value]) => ({
        id,
        itemType: value.itemType ?? 'krathong',
        config: value.config,
        spawnXRatio: value.spawnXRatio ?? 0.5,
        spawnYRatio:
          value.spawnYRatio ?? (value.itemType === 'lantern' ? 0.25 : 0.78),
        createdAt: value.createdAt ?? Date.now(),
      }))
      .sort((a, b) => a.createdAt - b.createdAt);

    onUpdate([...ambientSeeds, ...parsed]);
  });

  return () => unsubscribe();
}
