'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PeaceHand,
  RefreshDouble,
  Eye,
  EyeClosed,
  ColorPicker,
  Xmark,
  Check,
} from 'iconoir-react';
import {
  BaseStyle,
  ColorOption,
  KrathongConfig,
  OfferingCount,
  OfferingSlotConfig,
  RitualItemType,
} from '@/types/krathong';
import { getActiveOfferings } from '@/components/RiverCanvas';
import {
  BILINGUAL_WISH_COUPLETS,
  COLOR_NAMES_EN,
} from '@/constants/translations';
import { useLanguage } from '@/contexts/LanguageContext';
import { keepThaiPhrases } from '@/lib/thaiText';

interface CustomizationPanelProps {
  config: KrathongConfig;
  onChange: (updated: KrathongConfig) => void;
  onStartInteract: () => void;
}

type ColorFieldKey = 'baseColor' | 'flowerColor' | 'candleColor';

interface EyeDropperResult {
  sRGBHex: string;
}

interface EyeDropperInstance {
  open: () => Promise<EyeDropperResult>;
}

declare global {
  interface Window {
    EyeDropper?: new () => EyeDropperInstance;
  }
}

const SPRING_TRANSITION = {
  type: 'spring' as const,
  stiffness: 100,
  damping: 16,
};

const OFFERING_COUNTS: OfferingCount[] = [1, 2, 3, 4, 5];
const ITEM_TYPE_OPTIONS: RitualItemType[] = ['krathong', 'lantern'];
const BASE_STYLES: BaseStyle[] = [
  'classic-lotus',
  'layered-star',
  'royal-pleat',
];

const LEAF_COLORS: ColorOption[] = [
  { label: 'เขียวใบตองสด', value: '#2D6A4F', accent: '#40916C' },
  { label: 'เขียวยอดตองอ่อน', value: '#40916C', accent: '#52B788' },
  { label: 'เขียวไพรพฤกษา', value: '#52B788', accent: '#74C69D' },
  { label: 'กลีบบัวแห้งโบราณ', value: '#B5838D', accent: '#E5989B' },
];

const FLOWER_COLORS: ColorOption[] = [
  { label: 'ชมพูบัวหลวง', value: '#FF99C8', accent: '#FFF275' },
  { label: 'เหลืองดาวเรือง', value: '#F4D06F', accent: '#FF8C42' },
  { label: 'ส้มชาดมงคล', value: '#FF8C42', accent: '#FFF275' },
  { label: 'ม่วงดอกรัก', value: '#E0AAFF', accent: '#FF99C8' },
];

const CANDLE_COLORS: ColorOption[] = [
  { label: 'ทองขี้ผึ้งแท้', value: '#F4D06F', accent: '#FFF275' },
  { label: 'ส้มเปลวเทียน', value: '#FF8C42', accent: '#F4D06F' },
  { label: 'เหลืองนวลตา', value: '#FFF275', accent: '#FFFFFF' },
  { label: 'ชมพูเทียนอบ', value: '#FF99C8', accent: '#FFF275' },
];

const ALL_THAI_COLOR_PAIRS: ColorOption[] = [
  { label: 'เขียวใบตองสด', value: '#2D6A4F', accent: '#52B788' },
  { label: 'เขียวยอดตองอ่อน', value: '#40916C', accent: '#74C69D' },
  { label: 'เขียวไพรพฤกษา', value: '#52B788', accent: '#95D5B2' },
  { label: 'เขียวมรกตสยาม', value: '#1B4332', accent: '#40916C' },
  { label: 'เขียวหยกส่องแสง', value: '#2A9D8F', accent: '#A8DADC' },
  { label: 'ครามหม้อห้อม', value: '#264653', accent: '#457B9D' },
  { label: 'ฟ้าครามพระนคร', value: '#457B9D', accent: '#A8DADC' },
  { label: 'ม่วงดอกรัก', value: '#E0AAFF', accent: '#FF99C8' },
  { label: 'ม่วงเม็ดมะปราง', value: '#9D4EDD', accent: '#E0AAFF' },
  { label: 'ชมพูบัวหลวง', value: '#FF99C8', accent: '#FFF275' },
  { label: 'ชมพูกลีบบัวแห้ง', value: '#B5838D', accent: '#FFB5A7' },
  { label: 'แดงชาดจุฬามณี', value: '#E63946', accent: '#F4D06F' },
  { label: 'ส้มชาดมงคล', value: '#FF8C42', accent: '#FFF275' },
  { label: 'เหลืองดาวเรือง', value: '#F4D06F', accent: '#FF8C42' },
  { label: 'เหลืองนวลจันทร์', value: '#FFF275', accent: '#FFFFFF' },
  { label: 'ขาวมุกสังข์ทอง', value: '#F8F9FA', accent: '#F4D06F' },
];

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean.padEnd(6, '0');
  const num = parseInt(full, 16);
  const r = ((num >> 16) & 255) / 255;
  const g = ((num >> 8) & 255) / 255;
  const b = (num & 255) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hslToHex(h: number, s: number, l: number): string {
  const sNorm = Math.max(0, Math.min(100, s)) / 100;
  const lNorm = Math.max(0, Math.min(100, l)) / 100;
  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;

  let rPrime = 0;
  let gPrime = 0;
  let bPrime = 0;

  if (h >= 0 && h < 60) {
    rPrime = c;
    gPrime = x;
  } else if (h >= 60 && h < 120) {
    rPrime = x;
    gPrime = c;
  } else if (h >= 120 && h < 180) {
    gPrime = c;
    bPrime = x;
  } else if (h >= 180 && h < 240) {
    gPrime = x;
    bPrime = c;
  } else if (h >= 240 && h < 300) {
    rPrime = x;
    bPrime = c;
  } else {
    rPrime = c;
    bPrime = x;
  }

  const toHex = (n: number) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, '0')
      .toUpperCase();

  return `#${toHex(rPrime)}${toHex(gPrime)}${toHex(bPrime)}`;
}

function StyleCollageThumbnail({
  style,
  baseColor,
  flowerColor,
}: {
  style: BaseStyle;
  baseColor: string;
  flowerColor: string;
}) {
  return (
    <svg viewBox="0 0 52 32" className="h-7 w-12 shrink-0 overflow-visible">
      <line
        x1="6"
        y1="28"
        x2="46"
        y2="28"
        stroke="#D4AF37"
        strokeWidth="0.75"
        opacity="0.5"
      />
      {style === 'classic-lotus' && (
        <>
          <path d="M8 27 Q14 9 20 27 Z" fill={baseColor} />
          <path d="M32 27 Q38 9 44 27 Z" fill={baseColor} />
          <path d="M15 27 Q26 4 37 27 Z" fill={baseColor} />
          <path
            d="M26 6 Q32 16 37 27 L26 27 Z"
            fill="#FFF275"
            opacity="0.22"
          />
        </>
      )}
      {style === 'layered-star' && (
        <>
          <polygon points="7,27 15,10 23,27" fill={baseColor} />
          <polygon points="29,27 37,10 45,27" fill={baseColor} />
          <polygon points="16,27 26,4 36,27" fill={baseColor} />
          <polygon
            points="26,4 36,27 26,27"
            fill="#FFF275"
            opacity="0.24"
          />
        </>
      )}
      {style === 'royal-pleat' && (
        <>
          <polygon
            points="8,27 11,14 16,9 21,14 24,27"
            fill={baseColor}
          />
          <polygon
            points="28,27 31,14 36,9 41,14 44,27"
            fill={baseColor}
          />
          <polygon
            points="15,27 19,11 26,5 33,11 37,27"
            fill={baseColor}
          />
          <polygon
            points="26,5 33,11 37,27 26,27"
            fill="#FFF275"
            opacity="0.22"
          />
        </>
      )}
      <polygon points="26,16 30.5,22 26,27 21.5,22" fill={flowerColor} />
      <polygon points="26,19 28,22 26,25 24,22" fill="#F4D06F" />
    </svg>
  );
}

export const CustomizationPanel: React.FC<CustomizationPanelProps> = ({
  config,
  onChange,
  onStartInteract,
}) => {
  const { locale, t } = useLanguage();
  const ct = t.customize;
  const numerals = t.numerals;
  const wishCouplets = BILINGUAL_WISH_COUPLETS[locale];
  const colorName = (color: ColorOption) =>
    locale === 'en' ? COLOR_NAMES_EN[color.value] ?? color.label : color.label;
  const itemName = (type: RitualItemType) =>
    type === 'lantern' ? ct.itemLantern : ct.itemKrathong;

  const currentCount: OfferingCount = config.offeringCount ?? 1;
  const slots = getActiveOfferings(config);
  const selectedIdx = Math.min(
    slots.length - 1,
    Math.max(0, config.selectedSlotIndex ?? 0)
  );
  const currentSlot = slots[selectedIdx];
  const [poemIdx, setPoemIdx] = useState<number>(-1);

  const [activeColorModal, setActiveColorModal] =
    useState<ColorFieldKey | null>(null);
  const [isBookSubmerged, setIsBookSubmerged] = useState<boolean>(false);
  const nativeColorInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!activeColorModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveColorModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeColorModal]);

  const handleSelectCount = (newCount: OfferingCount) => {
    const nextConfig: KrathongConfig = {
      ...config,
      offeringCount: newCount,
      selectedSlotIndex: Math.min(selectedIdx, newCount - 1),
    };
    const nextSlots = getActiveOfferings(nextConfig);
    onChange({
      ...nextConfig,
      offerings: nextSlots,
    });
  };

  const handleSelectSlot = (idx: number) => {
    const targetSlot = slots[idx];
    if (!targetSlot) return;
    onChange({
      ...config,
      selectedSlotIndex: idx,
      offerings: slots,
      baseColor: targetSlot.baseColor,
      flowerColor: targetSlot.flowerColor,
      candleColor: targetSlot.candleColor,
      baseStyle: targetSlot.baseStyle,
      wishText: targetSlot.wishText,
      authorName: targetSlot.authorName,
      hideWish: targetSlot.hideWish ?? false,
    });
  };

  const updateCurrentSlot = <K extends keyof OfferingSlotConfig>(
    key: K,
    value: OfferingSlotConfig[K]
  ) => {
    const updatedSlots = slots.map((s, idx) =>
      idx === selectedIdx ? { ...s, [key]: value } : s
    );
    const active = updatedSlots[selectedIdx];
    onChange({
      ...config,
      offerings: updatedSlots,
      selectedSlotIndex: selectedIdx,
      baseColor: active.baseColor,
      flowerColor: active.flowerColor,
      candleColor: active.candleColor,
      baseStyle: active.baseStyle,
      wishText: active.wishText,
      authorName: active.authorName,
      hideWish: active.hideWish ?? false,
    });
  };

  const handleCyclePoem = () => {
    const currentIndexInCouplets = wishCouplets.indexOf(
      currentSlot.wishText.trim()
    );
    const baseIdx =
      currentIndexInCouplets >= 0 ? currentIndexInCouplets : poemIdx;
    const nextIdx = (baseIdx + 1) % wishCouplets.length;
    setPoemIdx(nextIdx);
    updateCurrentSlot('wishText', wishCouplets[nextIdx]);
  };

  const modalColorValue = activeColorModal
    ? currentSlot[activeColorModal]
    : '#F4D06F';
  const modalHsl = hexToHsl(modalColorValue);
  const modalColorPair = ALL_THAI_COLOR_PAIRS.find(
    (pair) => pair.value.toUpperCase() === modalColorValue.toUpperCase()
  );

  const handleHueGradientChange = (newHue: number) => {
    if (!activeColorModal) return;
    const nextS = Math.max(65, modalHsl.s);
    const nextL = Math.max(30, Math.min(78, modalHsl.l));
    updateCurrentSlot(activeColorModal, hslToHex(newHue, nextS, nextL));
  };

  const handleLightnessGradientChange = (newLightness: number) => {
    if (!activeColorModal) return;
    const nextS = Math.max(60, modalHsl.s);
    updateCurrentSlot(
      activeColorModal,
      hslToHex(modalHsl.h, nextS, newLightness)
    );
  };

  const handleEyedropperPick = async () => {
    if (!activeColorModal) return;
    if (typeof window !== 'undefined' && window.EyeDropper) {
      try {
        const dropper = new window.EyeDropper();
        const result = await dropper.open();
        if (result?.sRGBHex) {
          updateCurrentSlot(activeColorModal, result.sRGBHex.toUpperCase());
        }
        return;
      } catch {
        return;
      }
    }
    nativeColorInputRef.current?.click();
  };

  const isCustomBaseColor = !LEAF_COLORS.some(
    (c) => c.value.toUpperCase() === currentSlot.baseColor.toUpperCase()
  );
  const isCustomFlowerColor = !FLOWER_COLORS.some(
    (c) => c.value.toUpperCase() === currentSlot.flowerColor.toUpperCase()
  );
  const isCustomCandleColor = !CANDLE_COLORS.some(
    (c) => c.value.toUpperCase() === currentSlot.candleColor.toUpperCase()
  );

  const RAINBOW_SWATCH_GRADIENT =
    'conic-gradient(from 0deg, #FF595E, #FFCA3A, #8AC926, #00BBF9, #9D4EDD, #FF595E)';

  return (
    <>
      <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center">
        <AnimatePresence>
          {!isBookSubmerged && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.25 }}
              className="pointer-events-auto mb-2 flex items-center justify-end self-end"
            >
              <button
                type="button"
                onClick={() => setIsBookSubmerged(true)}
                className="thai-chamfer-sm font-heading flex items-center gap-2 border border-[#D4AF37]/55 bg-[#0B0E17]/90 px-3.5 py-1.5 text-xs text-[#FFF275] shadow-[0_8px_22px_rgba(0,0,0,0.65)] backdrop-blur-md transition-colors hover:border-[#FFF275] hover:bg-[#141932]"
              >
                <Eye width={14} height={14} strokeWidth={2} />
                <span>{keepThaiPhrases(ct.submergeBtn)}</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div
          style={{ perspective: '1600px' }}
          className={`relative w-full overflow-hidden transition-all duration-700 ${
            isBookSubmerged
              ? 'pointer-events-none max-h-[84px] pb-2'
              : 'pointer-events-auto max-h-[960px] pb-1'
          }`}
        >
          <motion.div
            initial={false}
            animate={
              isBookSubmerged
                ? {
                    y: [0, 6, 260],
                    scale: [1, 0.94, 0.72],
                    opacity: [1, 0.95, 0],
                  }
                : {
                    y: [260, 6, 0],
                    scale: [0.72, 0.94, 1],
                    opacity: [0, 0.95, 1],
                  }
            }
            transition={{
              duration: 0.95,
              times: isBookSubmerged ? [0, 0.44, 1] : [0, 0.5, 1],
              ease: 'easeInOut',
            }}
            style={{ transformStyle: 'preserve-3d' }}
            className="mx-auto flex w-full flex-col items-stretch gap-4 lg:flex-row lg:items-stretch"
          >
            <motion.div
              initial={false}
              animate={
                isBookSubmerged
                  ? {
                      rotateY: [0, 82, 85],
                      x: [0, 26, 34],
                    }
                  : {
                      rotateY: [85, 76, 0],
                      x: [34, 22, 0],
                    }
              }
              transition={{
                duration: 0.95,
                times: isBookSubmerged ? [0, 0.45, 1] : [0, 0.48, 1],
                ease: 'easeInOut',
              }}
              style={{ transformOrigin: 'right center' }}
              className="thai-chamfer relative flex flex-1 flex-col justify-between border border-[#D4AF37]/45 bg-[#0E1222]/95 p-4 text-[#FFFDF7] shadow-[0_22px_55px_rgba(4,6,14,0.88)] backdrop-blur-xl sm:p-5"
            >
              <span className="pointer-events-none absolute top-2.5 left-3 h-2.5 w-2.5 border-t border-l border-[#D4AF37]/70" />
              <span className="pointer-events-none absolute top-2.5 right-3 h-2.5 w-2.5 border-t border-r border-[#D4AF37]/70" />
              <span className="pointer-events-none absolute bottom-2.5 left-3 h-2.5 w-2.5 border-b border-l border-[#D4AF37]/70" />
              <span className="pointer-events-none absolute right-3 bottom-2.5 h-2.5 w-2.5 border-r border-b border-[#D4AF37]/70" />

              <div className="flex flex-col gap-2.5 border-b border-[#D4AF37]/25 pb-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-heading truncate text-[11px] tracking-wider text-[#F4D06F]">
                    {ct.atelierTag}
                  </p>
                  <h2 className="font-display text-lg font-normal tracking-wide whitespace-nowrap text-[#FFFDF7] sm:text-xl">
                    {keepThaiPhrases(ct.atelierTitle)}
                  </h2>
                </div>

                <div className="flex items-center justify-between gap-2 sm:justify-end">
                  <span className="font-heading text-xs whitespace-nowrap text-[#F4D06F]">
                    {keepThaiPhrases(ct.countLabel)}
                  </span>
                  <div className="flex items-center border border-[#D4AF37]/45 bg-[#080B14] p-0.5">
                    {OFFERING_COUNTS.map((num) => {
                      const active = currentCount === num;
                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={() => handleSelectCount(num)}
                          className={`font-heading h-8 min-w-9 px-2.5 text-xs transition-colors sm:h-7 sm:min-w-8 ${
                            active
                              ? 'bg-[#D4AF37] font-semibold text-[#0B0E17]'
                              : 'text-[#FFFDF7]/70 hover:text-[#FFF275]'
                          }`}
                        >
                          {numerals[num - 1]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {currentCount > 1 && (
                <div className="mt-2.5 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2.5">
                  <span className="font-heading shrink-0 text-[11px] whitespace-nowrap text-[#FFFDF7]/70">
                    {keepThaiPhrases(ct.selectSlotLabel)}
                  </span>
                  <div
                    className="grid flex-1 gap-1.5"
                    style={{
                      gridTemplateColumns: `repeat(${currentCount}, minmax(0, 1fr))`,
                    }}
                  >
                    {slots.map((slot, idx) => {
                      const isSelected = idx === selectedIdx;
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => handleSelectSlot(idx)}
                          aria-label={`${ct.slotLabel(numerals[idx])} (${itemName(slot.itemType)})`}
                          className={`font-heading flex h-8 min-w-0 items-center justify-center gap-1 border px-1.5 text-xs whitespace-nowrap transition-colors ${
                            isSelected
                              ? 'border-[#FFF275] bg-[#D4AF37]/25 font-semibold text-[#FFF275]'
                              : 'border-[#D4AF37]/30 bg-[#080B14]/80 text-[#FFFDF7]/70 hover:border-[#D4AF37]/60'
                          }`}
                        >
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: slot.flowerColor }}
                          />
                          <span>{numerals[idx]}</span>
                          <span className="hidden truncate sm:inline lg:hidden xl:inline">
                            {itemName(slot.itemType)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mt-2.5 grid grid-cols-2 border border-[#D4AF37]/30 bg-[#080B14]/90">
                {ITEM_TYPE_OPTIONS.map((typeId, idx) => {
                  const active = currentSlot.itemType === typeId;
                  const opt = ct.types[typeId];
                  return (
                    <button
                      key={typeId}
                      type="button"
                      onClick={() => updateCurrentSlot('itemType', typeId)}
                      className={`relative flex flex-col items-start px-3.5 py-2 text-left transition-colors ${
                        idx > 0 ? 'border-l border-[#D4AF37]/25' : ''
                      } ${
                        active
                          ? 'bg-[#D4AF37]/22 text-[#FFF275]'
                          : 'text-[#FFFDF7]/75 hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="flex w-full items-baseline justify-between">
                        <span className="font-display text-xs text-[#F4D06F]">
                          {keepThaiPhrases(ct.typeLabel(numerals[idx]))}
                        </span>
                        {active && (
                          <span className="h-1.5 w-1.5 rotate-45 bg-[#FFF275]" />
                        )}
                      </div>
                      <span className="font-heading mt-0.5 text-xs font-medium">
                        {keepThaiPhrases(opt.label)}
                      </span>
                      <span className="font-wish text-[11px] text-[#FFFDF7]/60">
                        {keepThaiPhrases(opt.sub)}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-2.5 grid grid-cols-3 gap-2">
                {BASE_STYLES.map((styleId) => {
                  const isSelected = currentSlot.baseStyle === styleId;
                  const style = ct.styles[styleId];
                  return (
                    <button
                      key={styleId}
                      type="button"
                      onClick={() => updateCurrentSlot('baseStyle', styleId)}
                      className={`flex min-w-0 flex-col items-center gap-1 border px-1.5 py-2 text-center transition-all sm:flex-row sm:gap-2.5 sm:px-2.5 sm:text-left ${
                        isSelected
                          ? 'border-[#F4D06F] bg-[#D4AF37]/18 text-[#FFF275]'
                          : 'border-white/15 bg-[#080B14]/80 text-[#FFFDF7]/80 hover:border-[#D4AF37]/45'
                      }`}
                    >
                      <StyleCollageThumbnail
                        style={styleId}
                        baseColor={currentSlot.baseColor}
                        flowerColor={currentSlot.flowerColor}
                      />
                      <div className="w-full min-w-0">
                        <div className="font-heading truncate text-xs font-medium">
                          {style.label}
                        </div>
                        <div className="font-wish truncate text-[11px] text-[#F4D06F]/85">
                          {style.sub}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-2.5 grid grid-cols-1 gap-2.5 border-t border-[#D4AF37]/25 pt-2.5 sm:grid-cols-3">
                <div className="flex items-center justify-between gap-2 bg-[#080B14]/70 px-3 py-2 sm:flex-col sm:items-start">
                  <span className="font-heading text-[11px] text-[#F4D06F]">
                    {keepThaiPhrases(ct.colorFields.baseColor.title)}
                  </span>
                  <div className="flex flex-nowrap items-center gap-2 xl:gap-2.5">
                    {LEAF_COLORS.map((color) => {
                      const active =
                        currentSlot.baseColor.toUpperCase() ===
                        color.value.toUpperCase();
                      return (
                        <button
                          key={color.value}
                          type="button"
                          title={colorName(color)}
                          onClick={() =>
                            updateCurrentSlot('baseColor', color.value)
                          }
                          className={`h-5 w-5 transition-transform ${
                            active
                              ? 'scale-115 ring-2 ring-[#FFF275] ring-offset-2 ring-offset-[#080B14]'
                              : 'opacity-80 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: color.value }}
                        />
                      );
                    })}
                    <button
                      type="button"
                      title={ct.moreColorsTitle}
                      aria-label={ct.colorFields.baseColor.moreAria}
                      onClick={() => setActiveColorModal('baseColor')}
                      style={{ background: RAINBOW_SWATCH_GRADIENT }}
                      className={`h-5 w-5 border border-[#FFFDF7]/90 shadow-[0_0_8px_rgba(255,242,117,0.35)] transition-transform ${
                        isCustomBaseColor
                          ? 'scale-115 ring-2 ring-[#FFF275] ring-offset-2 ring-offset-[#080B14]'
                          : 'opacity-90 hover:scale-110 hover:opacity-100'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 bg-[#080B14]/70 px-3 py-2 sm:flex-col sm:items-start">
                  <span className="font-heading text-[11px] text-[#F4D06F]">
                    {keepThaiPhrases(ct.colorFields.flowerColor.title)}
                  </span>
                  <div className="flex flex-nowrap items-center gap-2 xl:gap-2.5">
                    {FLOWER_COLORS.map((color) => {
                      const active =
                        currentSlot.flowerColor.toUpperCase() ===
                        color.value.toUpperCase();
                      return (
                        <button
                          key={color.value}
                          type="button"
                          title={colorName(color)}
                          onClick={() =>
                            updateCurrentSlot('flowerColor', color.value)
                          }
                          className={`h-5 w-5 rounded-full transition-transform ${
                            active
                              ? 'scale-115 ring-2 ring-[#FFF275] ring-offset-2 ring-offset-[#080B14]'
                              : 'opacity-80 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: color.value }}
                        />
                      );
                    })}
                    <button
                      type="button"
                      title={ct.moreColorsTitle}
                      aria-label={ct.colorFields.flowerColor.moreAria}
                      onClick={() => setActiveColorModal('flowerColor')}
                      style={{ background: RAINBOW_SWATCH_GRADIENT }}
                      className={`h-5 w-5 rounded-full border border-[#FFFDF7]/90 shadow-[0_0_8px_rgba(255,242,117,0.35)] transition-transform ${
                        isCustomFlowerColor
                          ? 'scale-115 ring-2 ring-[#FFF275] ring-offset-2 ring-offset-[#080B14]'
                          : 'opacity-90 hover:scale-110 hover:opacity-100'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 bg-[#080B14]/70 px-3 py-2 sm:flex-col sm:items-start">
                  <span className="font-heading text-[11px] text-[#F4D06F]">
                    {keepThaiPhrases(ct.colorFields.candleColor.title)}
                  </span>
                  <div className="flex flex-nowrap items-center gap-2 xl:gap-2.5">
                    {CANDLE_COLORS.map((color) => {
                      const active =
                        currentSlot.candleColor.toUpperCase() ===
                        color.value.toUpperCase();
                      return (
                        <button
                          key={color.value}
                          type="button"
                          title={colorName(color)}
                          onClick={() =>
                            updateCurrentSlot('candleColor', color.value)
                          }
                          className={`h-5 w-3.5 transition-transform ${
                            active
                              ? 'scale-115 ring-2 ring-[#FFF275] ring-offset-2 ring-offset-[#080B14]'
                              : 'opacity-80 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: color.value }}
                        />
                      );
                    })}
                    <button
                      type="button"
                      title={ct.moreColorsTitle}
                      aria-label={ct.colorFields.candleColor.moreAria}
                      onClick={() => setActiveColorModal('candleColor')}
                      style={{ background: RAINBOW_SWATCH_GRADIENT }}
                      className={`h-5 w-3.5 border border-[#FFFDF7]/90 shadow-[0_0_8px_rgba(255,242,117,0.35)] transition-transform ${
                        isCustomCandleColor
                          ? 'scale-115 ring-2 ring-[#FFF275] ring-offset-2 ring-offset-[#080B14]'
                          : 'opacity-90 hover:scale-110 hover:opacity-100'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={false}
              animate={
                isBookSubmerged
                  ? {
                      rotateY: [0, -82, -85],
                      x: [0, -26, -34],
                    }
                  : {
                      rotateY: [-85, -76, 0],
                      x: [-34, -22, 0],
                    }
              }
              transition={{
                duration: 0.95,
                times: isBookSubmerged ? [0, 0.45, 1] : [0, 0.48, 1],
                ease: 'easeInOut',
              }}
              style={{
                transformOrigin: 'left center',
                background:
                  'linear-gradient(165deg, rgba(24, 29, 56, 0.97) 0%, rgba(12, 16, 33, 0.98) 100%)',
              }}
              className="thai-chamfer relative flex w-full flex-col justify-between border border-[#D4AF37]/65 bg-[#141932] p-5 text-[#FFFDF7] shadow-[0_22px_55px_rgba(4,6,14,0.92)] backdrop-blur-xl lg:w-[410px]"
            >
              <span className="pointer-events-none absolute top-2.5 left-3 h-2.5 w-2.5 border-t border-l border-[#D4AF37]/80" />
              <span className="pointer-events-none absolute top-2.5 right-3 h-2.5 w-2.5 border-t border-r border-[#D4AF37]/80" />
              <span className="pointer-events-none absolute bottom-2.5 left-3 h-2.5 w-2.5 border-b border-l border-[#D4AF37]/80" />
              <span className="pointer-events-none absolute right-3 bottom-2.5 h-2.5 w-2.5 border-r border-b border-[#D4AF37]/80" />

              <div>
                <div className="mb-3 flex items-center justify-between border-b border-[#D4AF37]/30 pb-2.5">
                  <div>
                    <p className="font-heading text-[11px] tracking-wider text-[#F4D06F]">
                      {keepThaiPhrases(ct.wishBookTag)}
                    </p>
                    <h3 className="font-display text-lg font-normal text-[#FFFDF7]">
                      {keepThaiPhrases(ct.wishBookTitle)}
                    </h3>
                  </div>
                </div>

                {currentCount > 1 && (
                  <div className="mb-2.5 flex items-center justify-between border border-[#D4AF37]/30 bg-[#080B16]/80 px-2.5 py-1.5 text-xs">
                    <span className="font-heading text-[#F4D06F]">
                      {keepThaiPhrases(ct.writingForSlot)}
                    </span>
                    <div className="flex items-center gap-1">
                      {slots.map((s, idx) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => handleSelectSlot(idx)}
                          className={`font-heading px-2 py-0.5 text-[11px] transition-colors ${
                            idx === selectedIdx
                              ? 'bg-[#D4AF37] font-semibold text-[#0B0E17]'
                              : 'bg-[#141932] text-[#FFFDF7]/70 hover:text-[#FFF275]'
                          }`}
                        >
                          {numerals[idx]}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border border-[#D4AF37]/35 bg-[#080B16]/95 p-3.5">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <label className="font-heading text-xs font-medium whitespace-nowrap text-[#F4D06F]">
                      {keepThaiPhrases(ct.wishLabel(itemName(currentSlot.itemType)))}
                    </label>
                    <button
                      type="button"
                      onClick={handleCyclePoem}
                      className="font-heading flex shrink-0 items-center gap-1 border border-[#D4AF37]/40 bg-[#141932] px-2 py-1 text-[10px] whitespace-nowrap text-[#FFF275] transition-colors hover:border-[#FFF275] hover:bg-[#D4AF37]/20"
                    >
                      <RefreshDouble width={11} height={11} />
                      <span>{keepThaiPhrases(ct.randomPoemBtn)}</span>
                    </button>
                  </div>

                  <input
                    type="text"
                    maxLength={70}
                    value={currentSlot.wishText}
                    onChange={(e) =>
                      updateCurrentSlot('wishText', e.target.value)
                    }
                    placeholder={ct.wishPlaceholder}
                    className="font-wish w-full border border-[#D4AF37]/45 bg-[#12172B] px-3 py-2 text-base text-[#FFFDF7] placeholder-[#FFFDF7]/45 transition-colors focus:border-[#FFF275] focus:bg-[#171E38] focus:outline-none"
                  />

                  <div className="mt-3 flex items-center gap-2.5">
                    <span className="font-heading shrink-0 text-xs text-[#F4D06F]/90">
                      {keepThaiPhrases(ct.authorLabel)}
                    </span>
                    <input
                      type="text"
                      maxLength={24}
                      value={currentSlot.authorName}
                      onChange={(e) =>
                        updateCurrentSlot('authorName', e.target.value)
                      }
                      placeholder={ct.authorPlaceholder}
                      className="font-heading flex-1 border border-[#D4AF37]/35 bg-[#12172B] px-3 py-1.5 text-base text-[#FFF275] sm:text-xs placeholder-[#FFFDF7]/45 transition-colors focus:border-[#FFF275] focus:bg-[#171E38] focus:outline-none"
                    />
                  </div>

                  <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-[#D4AF37]/25 pt-2.5">
                    <span className="font-heading text-[11px] text-[#FFFDF7]/75">
                      {keepThaiPhrases(
                        currentSlot.hideWish ? ct.hideWishOnNote : ct.hideWishOffNote
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateCurrentSlot(
                          'hideWish',
                          !(currentSlot.hideWish ?? false)
                        )
                      }
                      className={`font-heading flex items-center gap-1.5 border px-2.5 py-1 text-[11px] transition-colors ${
                        currentSlot.hideWish
                          ? 'border-[#FFF275] bg-[#D4AF37]/25 font-semibold text-[#FFF275]'
                          : 'border-[#D4AF37]/40 bg-[#12172B] text-[#FFFDF7]/80 hover:border-[#FFF275] hover:text-[#FFF275]'
                      }`}
                    >
                      {currentSlot.hideWish ? (
                        <>
                          <EyeClosed width={13} height={13} strokeWidth={2} />
                          <span>{keepThaiPhrases(ct.hideWishOnBtn)}</span>
                        </>
                      ) : (
                        <>
                          <Eye width={13} height={13} strokeWidth={2} />
                          <span>{keepThaiPhrases(ct.hideWishOffBtn)}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <motion.button
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={SPRING_TRANSITION}
                onClick={onStartInteract}
                className="thai-chamfer-sm font-heading group mt-4 flex w-full items-center justify-center gap-3 border border-[#FFF275]/60 bg-[#D4AF37] px-4 py-3 text-xs font-semibold tracking-wide text-[#0B0E17] shadow-[0_8px_24px_rgba(212,175,55,0.35)] transition-colors hover:bg-[#FFF275] min-[480px]:justify-between"
              >
                <span className="flex items-center gap-2">
                  <PeaceHand
                    width={18}
                    height={18}
                    strokeWidth={2}
                    className="text-[#0B0E17] transition-transform duration-300 group-hover:rotate-12"
                  />
                  <span className="whitespace-nowrap">
                    {keepThaiPhrases(ct.startInteractBtn(numerals[currentCount - 1]))}
                  </span>
                </span>
                <span className="font-display hidden text-xs font-medium whitespace-nowrap text-[#0B0E17] min-[480px]:inline">
                  {keepThaiPhrases(ct.startInteractCta)}
                </span>
              </motion.button>
            </motion.div>
          </motion.div>

          <AnimatePresence>
            {isBookSubmerged && (
              <motion.div
                initial={{ opacity: 0, scaleX: 0.4 }}
                animate={{ opacity: 1, scaleX: 1 }}
                exit={{ opacity: 0, scaleX: 0.5 }}
                transition={{ duration: 0.55 }}
                className="pointer-events-auto absolute inset-x-0 bottom-1 flex flex-col items-center justify-center"
              >
                <div className="relative flex items-center justify-center">
                  <motion.div
                    animate={{
                      scaleX: [1, 1.35, 1],
                      opacity: [0.65, 0.25, 0.65],
                    }}
                    transition={{
                      duration: 2.8,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="pointer-events-none absolute -bottom-2 h-6 w-[min(20rem,90vw)] rounded-full border border-[#FFF275]/55 bg-[#D4AF37]/15 blur-[1px]"
                  />

                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsBookSubmerged(false)}
                      className="thai-chamfer-sm font-heading flex items-center gap-2 border border-[#FFF275]/80 bg-[#0B0E17]/95 px-3 py-2.5 text-xs font-semibold whitespace-nowrap text-[#FFF275] shadow-[0_0_26px_rgba(244,208,111,0.45)] backdrop-blur-md transition-all hover:bg-[#141932] sm:px-4"
                    >
                      <span>{keepThaiPhrases(ct.emergeBtn)}</span>
                    </button>

                    <button
                      type="button"
                      onClick={onStartInteract}
                      className="thai-chamfer-sm font-heading flex items-center gap-1.5 border border-[#FFF275]/70 bg-[#D4AF37] px-3 py-2.5 text-xs font-semibold whitespace-nowrap text-[#0B0E17] shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-colors hover:bg-[#FFF275] sm:px-4"
                    >
                      <PeaceHand width={15} height={15} strokeWidth={2} />
                      <span>{keepThaiPhrases(ct.launchNowBtn)}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {activeColorModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveColorModal(null)}
            className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-[#060810]/75 p-3 backdrop-blur-sm sm:p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={SPRING_TRANSITION}
              onClick={(e) => e.stopPropagation()}
              className="thai-chamfer relative max-h-[calc((100dvh-1.5rem)/var(--ui-zoom,1))] w-full max-w-md overflow-y-auto border border-[#D4AF37]/65 bg-[#0E1222] p-4 text-[#FFFDF7] shadow-[0_26px_70px_rgba(0,0,0,0.92)] [zoom:var(--ui-zoom,1)] sm:p-5"
            >
              <div className="flex items-start justify-between gap-2 border-b border-[#D4AF37]/30 pb-3">
                <div>
                  <p className="font-heading text-[11px] tracking-wider text-[#F4D06F]">
                    {keepThaiPhrases(ct.colorModalTag)}
                  </p>
                  <h3 className="font-display text-lg font-normal text-[#FFFDF7]">
                    {keepThaiPhrases(ct.colorFields[activeColorModal].title)}
                  </h3>
                  <p className="font-heading text-[11px] text-[#FFFDF7]/65">
                    {keepThaiPhrases(ct.colorFields[activeColorModal].sub)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveColorModal(null)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center border border-[#D4AF37]/40 bg-[#080B14] text-[#FFFDF7]/75 transition-colors hover:border-[#FFF275] hover:text-[#FFF275]"
                >
                  <Xmark width={17} height={17} />
                </button>
              </div>

              <div className="mt-3.5">
                <p className="font-heading mb-2 text-xs font-medium text-[#F4D06F]">
                  {keepThaiPhrases(ct.colorModalPresets)}
                </p>
                <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-4 sm:gap-2">
                  {ALL_THAI_COLOR_PAIRS.map((pair) => {
                    const isSelected =
                      modalColorValue.toUpperCase() ===
                      pair.value.toUpperCase();
                    return (
                      <button
                        key={pair.value}
                        type="button"
                        onClick={() =>
                          updateCurrentSlot(activeColorModal, pair.value)
                        }
                        title={colorName(pair)}
                        aria-label={colorName(pair)}
                        className={`flex aspect-square items-center justify-center gap-2 border p-1 text-left transition-all sm:aspect-auto sm:justify-start sm:p-1.5 ${
                          isSelected
                            ? 'border-[#FFF275] bg-[#D4AF37]/22 text-[#FFF275]'
                            : 'border-[#D4AF37]/25 bg-[#080B14]/90 text-[#FFFDF7]/80 hover:border-[#D4AF37]/60'
                        }`}
                      >
                        <span className="relative flex size-full shrink-0 overflow-hidden border border-white/20 sm:size-5">
                          <span
                            className="h-full w-2/3"
                            style={{ backgroundColor: pair.value }}
                          />
                          <span
                            className="h-full w-1/3"
                            style={{ backgroundColor: pair.accent }}
                          />
                        </span>
                        <span className="font-heading hidden truncate text-[10px] sm:inline">
                          {colorName(pair)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 space-y-3 border-t border-[#D4AF37]/25 pt-3.5">
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-heading text-xs text-[#F4D06F]">
                      {keepThaiPhrases(ct.colorModalHue)}
                    </span>
                    <span className="font-heading text-[10px] text-[#FFFDF7]/65">
                      {modalHsl.h}°
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={360}
                    step={1}
                    value={modalHsl.h}
                    onChange={(e) =>
                      handleHueGradientChange(parseInt(e.target.value, 10))
                    }
                    style={{
                      background:
                        'linear-gradient(to right, #FF0000 0%, #FFFF00 17%, #00FF00 33%, #00FFFF 50%, #0000FF 67%, #FF00FF 83%, #FF0000 100%)',
                    }}
                    className="h-3 w-full cursor-pointer appearance-none border border-[#D4AF37]/50 outline-none [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-none [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-[#0B0E17] [&::-moz-range-thumb]:bg-[#FFFDF7] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-[#0B0E17] [&::-webkit-slider-thumb]:bg-[#FFFDF7] [&::-webkit-slider-thumb]:shadow-[0_0_6px_rgba(0,0,0,0.85)]"
                  />
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-heading text-xs text-[#F4D06F]">
                      {keepThaiPhrases(ct.colorModalTone)}
                    </span>
                    <span className="font-heading text-[10px] text-[#FFFDF7]/65">
                      {modalHsl.l}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={18}
                    max={88}
                    step={1}
                    value={modalHsl.l}
                    onChange={(e) =>
                      handleLightnessGradientChange(
                        parseInt(e.target.value, 10)
                      )
                    }
                    style={{
                      background: `linear-gradient(to right, #0B0E17 0%, hsl(${modalHsl.h}, 82%, 50%) 50%, #FFFDF7 100%)`,
                    }}
                    className="h-3 w-full cursor-pointer appearance-none border border-[#D4AF37]/50 outline-none [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-none [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-[#0B0E17] [&::-moz-range-thumb]:bg-[#FFFDF7] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-[#0B0E17] [&::-webkit-slider-thumb]:bg-[#FFFDF7] [&::-webkit-slider-thumb]:shadow-[0_0_6px_rgba(0,0,0,0.85)]"
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5 border-t border-[#D4AF37]/25 pt-3.5">
                <div className="flex items-center gap-2.5">
                  <div
                    className="h-8 w-8 border border-[#FFF275] shadow-inner"
                    style={{ backgroundColor: modalColorValue }}
                  />
                  <div>
                    <p className="font-heading text-[10px] text-[#FFFDF7]/65">
                      {keepThaiPhrases(ct.colorModalCurrent)}
                    </p>
                    <p className="font-heading text-xs font-semibold text-[#FFF275]">
                      {modalColorValue.toUpperCase()}
                      {modalColorPair && (
                        <span className="ml-1.5 font-normal text-[#FFFDF7]/70">
                          {keepThaiPhrases(colorName(modalColorPair))}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="grid w-full grid-cols-2 gap-2 min-[400px]:flex min-[400px]:w-auto min-[400px]:items-center">
                  <input
                    ref={nativeColorInputRef}
                    type="color"
                    value={modalColorValue}
                    onChange={(e) =>
                      updateCurrentSlot(
                        activeColorModal,
                        e.target.value.toUpperCase()
                      )
                    }
                    className="sr-only"
                  />

                  <button
                    type="button"
                    onClick={handleEyedropperPick}
                    className="font-heading flex items-center justify-center gap-1.5 border border-[#D4AF37]/60 bg-[#141932] px-3 py-2 text-xs whitespace-nowrap text-[#FFF275] transition-colors hover:border-[#FFF275] hover:bg-[#D4AF37]/20"
                  >
                    <ColorPicker width={14} height={14} strokeWidth={2} />
                    <span>{keepThaiPhrases(ct.colorModalEyedropper)}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveColorModal(null)}
                    className="font-heading flex items-center justify-center gap-1.5 border border-[#FFF275]/60 bg-[#D4AF37] px-3.5 py-2 text-xs font-semibold whitespace-nowrap text-[#0B0E17] transition-colors hover:bg-[#FFF275]"
                  >
                    <Check width={14} height={14} strokeWidth={2.2} />
                    <span>{keepThaiPhrases(ct.colorModalDone)}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
