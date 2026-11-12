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
    spawnXRatio: 0.22,
    spawnYRatio: 0.78,
    config: {
      baseColor: '#2D6A4F',
      flowerColor: '#FF99C8',
      candleColor: '#F4D06F',
      baseStyle: 'classic-lotus',
      wishText: 'จันทร์กระจ่างกลางนภา ณ ท่าน้ำ ขอความงามความสุขจงอยู่คู่ใจ',
      authorName: 'แม่หญิงจันทร์วาด',
    },
  },
  {
    itemType: 'krathong',
    spawnXRatio: 0.54,
    spawnYRatio: 0.82,
    config: {
      baseColor: '#40916C',
      flowerColor: '#F4D06F',
      candleColor: '#FF8C42',
      baseStyle: 'royal-pleat',
      wishText: 'ฝากทุกข์โศกลอยลับไปกับสายชล ให้แย้มยลแต่สิ่งดีตลอดปี',
      authorName: 'คุณชายพุฒิภัทร',
    },
  },
  {
    itemType: 'lantern',
    spawnXRatio: 0.48,
    spawnYRatio: 0.26,
    config: {
      baseColor: '#2D6A4F',
      flowerColor: '#FF8C42',
      candleColor: '#F4D06F',
      baseStyle: 'layered-star',
      wishText: 'โคมทองลอยลิ่วล่องสู่ฟากฟ้า ขอสัญญาเคียงคู่เธอไม่เสื่อมคลาย',
      authorName: 'โกศล & พิกุลแก้ว',
    },
  },
  {
    itemType: 'krathong',
    spawnXRatio: 0.76,
    spawnYRatio: 0.79,
    config: {
      baseColor: '#2D6A4F',
      flowerColor: '#FFF275',
      candleColor: '#F4D06F',
      baseStyle: 'layered-star',
      wishText: 'สิบห้าค่ำเดือนสิบสองน้ำนองตลิ่ง ขอพักพิงพบกัลยาณมิตรไมตรี',
      authorName: 'บุหลัน พระนคร',
    },
  },
];

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
      wishText: config.wishText.trim() || 'ขอให้พบเจอแต่ความสุขความเจริญ',
      authorName: config.authorName.trim() || 'ผู้ร่วมลอยกะเธอ',
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

export function subscribeToGlobalRiver(
  onUpdate: (krathongs: FloatingKrathong[]) => void
): () => void {
  const db = getFirebaseDatabase();

  if (!db) {
    const now = Date.now();
    let fallbackList: FloatingKrathong[] = INITIAL_COMMUNITY_KRATHONGS.map((item, idx) => ({
      ...item,
      id: `seed-${idx}`,
      createdAt: now - (idx + 1) * 9000,
    }));

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
        fallbackList = [...fallbackList.slice(-(MAX_ACTIVE_KRATHONGS - 1)), event.data];
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
    const rawData = snapshot.val() as Record<string, Omit<FloatingKrathong, 'id'>> | null;
    if (!rawData) {
      onUpdate([]);
      return;
    }

    const parsed: FloatingKrathong[] = Object.entries(rawData)
      .map(([id, value]) => ({
        id,
        itemType: value.itemType ?? 'krathong',
        config: value.config,
        spawnXRatio: value.spawnXRatio ?? 0.5,
        spawnYRatio: value.spawnYRatio ?? (value.itemType === 'lantern' ? 0.25 : 0.78),
        createdAt: value.createdAt ?? Date.now(),
      }))
      .sort((a, b) => a.createdAt - b.createdAt);

    onUpdate(parsed);
  });

  return () => unsubscribe();
}
