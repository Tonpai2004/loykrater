'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { SoundHigh, SoundLow, SoundOff } from 'iconoir-react';

const AUDIO_SRC = '/audio/loy-krathong.mp3';
const DEFAULT_VOLUME = 0.45;

export const AudioVolumeController: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [volume, setVolume] = useState<number>(DEFAULT_VOLUME);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const userMutedRef = useRef<boolean>(false);

  useEffect(() => {
    const audio = new Audio(AUDIO_SRC);
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = DEFAULT_VOLUME;
    audioRef.current = audio;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    // Attempt autoplay on mount
    audio.play().catch(() => {
      // Browser blocked unmuted autoplay; will start on first user interaction
    });

    const unlockAudioOnFirstGesture = () => {
      if (!audioRef.current || userMutedRef.current) return;
      if (audioRef.current.paused) {
        audioRef.current.play().catch(() => {
          // Ignore if still blocked
        });
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

    if (isMuted || audio.paused || volume === 0) {
      const restoredVol = volume === 0 ? DEFAULT_VOLUME : volume;
      userMutedRef.current = false;
      setIsMuted(false);
      setVolume(restoredVol);
      audio.muted = false;
      audio.volume = restoredVol;
      audio.play().catch(() => {
        // Ignore play error
      });
    } else {
      userMutedRef.current = true;
      setIsMuted(true);
      audio.muted = true;
    }
  }, [isMuted, volume]);

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const nextVol = parseFloat(e.target.value);
      setVolume(nextVol);

      const audio = audioRef.current;
      if (!audio) return;

      audio.volume = nextVol;
      if (nextVol <= 0.005) {
        userMutedRef.current = true;
        setIsMuted(true);
        audio.muted = true;
      } else {
        userMutedRef.current = false;
        setIsMuted(false);
        audio.muted = false;
        if (audio.paused) {
          audio.play().catch(() => {
            // Ignore play error
          });
        }
      }
    },
    []
  );

  const effectiveMuted = isMuted || volume <= 0.005 || !isPlaying;
  const volumePercent = effectiveMuted ? 0 : Math.round(volume * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 16 }}
      className="thai-chamfer-sm pointer-events-auto relative flex items-center gap-3 border border-[#D4AF37]/55 bg-[#0B0E17]/92 px-3.5 py-2 text-[#FFFDF7] shadow-[0_14px_34px_rgba(0,0,0,0.75)] backdrop-blur-md"
    >
      {/* Decorative Phra Nakhon Gold Corner Accents */}
      <span className="pointer-events-none absolute top-1.5 left-1.5 h-1.5 w-1.5 border-t border-l border-[#D4AF37]/75" />
      <span className="pointer-events-none absolute top-1.5 right-1.5 h-1.5 w-1.5 border-t border-r border-[#D4AF37]/75" />
      <span className="pointer-events-none absolute bottom-1.5 left-1.5 h-1.5 w-1.5 border-b border-l border-[#D4AF37]/75" />
      <span className="pointer-events-none absolute right-1.5 bottom-1.5 h-1.5 w-1.5 border-r border-b border-[#D4AF37]/75" />

      {/* One-Click Mute / Unmute Seal Button */}
      <button
        type="button"
        onClick={handleToggleMute}
        title={effectiveMuted ? 'เปิดเสียงเพลงบรรเลง' : 'ปิดเสียงเพลงบรรเลง'}
        aria-label={effectiveMuted ? 'เปิดเสียงเพลงบรรเลง' : 'ปิดเสียงเพลงบรรเลง'}
        className={`flex h-9 w-9 shrink-0 items-center justify-center border transition-all ${
          effectiveMuted
            ? 'border-[#D4AF37]/35 bg-[#12172B] text-[#FFFDF7]/60 hover:border-[#FFF275] hover:text-[#FFF275]'
            : 'border-[#FFF275]/70 bg-[#D4AF37] text-[#0B0E17] shadow-[0_0_16px_rgba(244,208,111,0.35)] hover:bg-[#FFF275]'
        }`}
      >
        {effectiveMuted ? (
          <SoundOff width={18} height={18} strokeWidth={2} />
        ) : volume < 0.45 ? (
          <SoundLow width={18} height={18} strokeWidth={2} />
        ) : (
          <SoundHigh width={18} height={18} strokeWidth={2} />
        )}
      </button>

      {/* Label + Animated Chime Equalizer + Gold-Leaf Volume Slider */}
      <div className="flex flex-col gap-1 pr-1">
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5">
            {/* Animated Golden Equalizer Bars */}
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

            <span className="font-heading text-[11px] font-medium tracking-wide text-[#F4D06F]">
              {effectiveMuted ? 'งดเสียงมโหรี' : 'มโหรีคืนเพ็ญ'}
            </span>
          </div>

          <span className="font-heading min-w-[28px] text-right text-[10px] text-[#FFF275]/85">
            {volumePercent}%
          </span>
        </div>

        {/* Custom Gold-Leaf Volume Slider */}
        <div className="relative flex items-center">
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={effectiveMuted ? 0 : volume}
            onChange={handleVolumeChange}
            aria-label="ระดับเสียงเพลงวันเพ็ญ"
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
