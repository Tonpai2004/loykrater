'use client';

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { motion } from 'framer-motion';
import { SoundHigh, SoundLow, SoundOff } from 'iconoir-react';
import { useLanguage } from '@/contexts/LanguageContext';

const AUDIO_SRC = '/audio/loy-krathong.mp3';
const STORAGE_KEY = 'loikratur_audio_prefs_v1';
const DEFAULT_VOLUME = 0.45;

interface StoredAudioPrefs {
  isMuted: boolean;
  volume: number;
}

function loadAudioPrefs(): StoredAudioPrefs {
  if (typeof window === 'undefined') {
    return { isMuted: true, volume: DEFAULT_VOLUME };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { isMuted: true, volume: DEFAULT_VOLUME };
    }
    const parsed = JSON.parse(raw) as Partial<StoredAudioPrefs>;
    const volume =
      typeof parsed.volume === 'number' && !Number.isNaN(parsed.volume)
        ? Math.max(0, Math.min(1, parsed.volume))
        : DEFAULT_VOLUME;
    const isMuted =
      typeof parsed.isMuted === 'boolean' ? parsed.isMuted : true;
    return { isMuted, volume };
  } catch {
    return { isMuted: true, volume: DEFAULT_VOLUME };
  }
}

function saveAudioPrefs(prefs: StoredAudioPrefs) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore storage quota errors
  }
}

const SERVER_PREFS: StoredAudioPrefs = {
  isMuted: true,
  volume: DEFAULT_VOLUME,
};
let cachedPrefs: StoredAudioPrefs | null = null;
const prefListeners = new Set<() => void>();

function readPrefsSnapshot(): StoredAudioPrefs {
  if (!cachedPrefs) cachedPrefs = loadAudioPrefs();
  return cachedPrefs;
}

function writePrefs(next: StoredAudioPrefs) {
  cachedPrefs = next;
  saveAudioPrefs(next);
  prefListeners.forEach((notify) => notify());
}

function subscribePrefs(notify: () => void) {
  prefListeners.add(notify);
  return () => {
    prefListeners.delete(notify);
  };
}

export const AudioVolumeController: React.FC = () => {
  const { t } = useLanguage();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { volume, isMuted } = useSyncExternalStore(
    subscribePrefs,
    readPrefsSnapshot,
    () => SERVER_PREFS
  );
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const userMutedRef = useRef<boolean>(isMuted);

  useEffect(() => {
    const initialPrefs = loadAudioPrefs();
    userMutedRef.current = initialPrefs.isMuted;

    const audio = new Audio(AUDIO_SRC);
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = initialPrefs.volume;
    audio.muted = initialPrefs.isMuted;
    audioRef.current = audio;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    if (!initialPrefs.isMuted && initialPrefs.volume > 0.005) {
      audio.play().catch(() => {});
    }

    const unlockAudioOnFirstGesture = () => {
      if (!audioRef.current || userMutedRef.current) return;
      if (audioRef.current.paused) {
        audioRef.current.play().catch(() => {});
      }
    };

    window.addEventListener('pointerdown', unlockAudioOnFirstGesture, {
      passive: true,
    });
    window.addEventListener('keydown', unlockAudioOnFirstGesture, {
      passive: true,
    });

    return () => {
      window.removeEventListener('pointerdown', unlockAudioOnFirstGesture);
      window.removeEventListener('keydown', unlockAudioOnFirstGesture);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  const handleToggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted || audio.paused || volume <= 0.005) {
      const restoredVol = volume <= 0.005 ? DEFAULT_VOLUME : volume;
      userMutedRef.current = false;
      writePrefs({ isMuted: false, volume: restoredVol });

      audio.muted = false;
      audio.volume = restoredVol;
      audio.play().catch(() => {});
    } else {
      userMutedRef.current = true;
      writePrefs({ isMuted: true, volume });

      audio.muted = true;
      audio.pause();
    }
  }, [isMuted, volume]);

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const nextVol = parseFloat(e.target.value);
      const audio = audioRef.current;
      if (!audio) {
        writePrefs({ isMuted: nextVol <= 0.005, volume: nextVol });
        return;
      }

      audio.volume = nextVol;
      if (nextVol <= 0.005) {
        userMutedRef.current = true;
        writePrefs({ isMuted: true, volume: 0 });
        audio.muted = true;
        audio.pause();
      } else {
        userMutedRef.current = false;
        writePrefs({ isMuted: false, volume: nextVol });
        audio.muted = false;
        if (audio.paused) {
          audio.play().catch(() => {});
        }
      }
    },
    []
  );

  const effectiveMuted = isMuted || volume <= 0.005 || !isPlaying;
  const volumePercent = isMuted ? 0 : Math.round(volume * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 16 }}
      className="thai-chamfer-sm pointer-events-auto relative flex items-center gap-3 border border-[#D4AF37]/55 bg-[#0B0E17]/92 p-0 text-[#FFFDF7] shadow-[0_14px_34px_rgba(0,0,0,0.75)] backdrop-blur-md sm:px-3.5 sm:py-2"
    >
      <span className="pointer-events-none absolute top-1.5 left-1.5 hidden h-1.5 w-1.5 border-t border-l border-[#D4AF37]/75 sm:block" />
      <span className="pointer-events-none absolute top-1.5 right-1.5 hidden h-1.5 w-1.5 border-t border-r border-[#D4AF37]/75 sm:block" />
      <span className="pointer-events-none absolute bottom-1.5 left-1.5 hidden h-1.5 w-1.5 border-b border-l border-[#D4AF37]/75 sm:block" />
      <span className="pointer-events-none absolute right-1.5 bottom-1.5 hidden h-1.5 w-1.5 border-r border-b border-[#D4AF37]/75 sm:block" />

      <button
        type="button"
        onClick={handleToggleMute}
        title={isMuted ? t.nav.unmute : t.nav.mute}
        aria-label={isMuted ? t.nav.unmute : t.nav.mute}
        className={`flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center border transition-all ${
          isMuted
            ? 'border-[#D4AF37]/35 bg-[#12172B] text-[#FFFDF7]/60 hover:border-[#FFF275] hover:text-[#FFF275]'
            : 'border-[#FFF275]/70 bg-[#D4AF37] text-[#0B0E17] shadow-[0_0_16px_rgba(244,208,111,0.35)] hover:bg-[#FFF275]'
        }`}
      >
        {isMuted ? (
          <SoundOff width={18} height={18} strokeWidth={2} />
        ) : volume < 0.45 ? (
          <SoundLow width={18} height={18} strokeWidth={2} />
        ) : (
          <SoundHigh width={18} height={18} strokeWidth={2} />
        )}
      </button>

      <div className="hidden flex-col gap-1 pr-1 sm:flex">
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="flex h-3 items-end gap-[2px]">
              {[0, 1, 2].map((barIdx) => (
                <motion.span
                  key={barIdx}
                  animate={
                    effectiveMuted
                      ? { height: 3, opacity: 0.35 }
                      : {
                          height: [4, 11, 5, 10, 4],
                          opacity: 0.95,
                        }
                  }
                  transition={
                    effectiveMuted
                      ? { duration: 0.2 }
                      : {
                          duration: 1.1 + barIdx * 0.2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }
                  }
                  className="w-[2px] bg-[#F4D06F]"
                />
              ))}
            </span>

            <span className="font-heading text-[11px] font-medium tracking-wide whitespace-nowrap text-[#F4D06F]">
              {isMuted ? t.nav.soundOff : t.nav.soundOn}
            </span>
          </div>

          <span className="font-heading min-w-[28px] text-right text-[10px] text-[#FFF275]/85">
            {volumePercent}%
          </span>
        </div>

        <div className="relative flex items-center">
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            aria-label={t.nav.volume}
            style={{
              background: `linear-gradient(to right, #F4D06F 0%, #D4AF37 ${volumePercent}%, rgba(255, 253, 247, 0.16) ${volumePercent}%, rgba(255, 253, 247, 0.16) 100%)`,
            }}
            className="h-1.5 w-24 cursor-pointer appearance-none rounded-none outline-none sm:w-28 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rotate-45 [&::-moz-range-thumb]:rounded-none [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-[#0B0E17] [&::-moz-range-thumb]:bg-[#FFF275] [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rotate-45 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-[#0B0E17] [&::-webkit-slider-thumb]:bg-[#FFF275] [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(255,242,117,0.8)]"
          />
        </div>
      </div>
    </motion.div>
  );
};
