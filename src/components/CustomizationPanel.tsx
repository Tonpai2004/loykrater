'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PeaceHand, Sparks, RefreshDouble } from 'iconoir-react';
import {
  BaseStyle,
  ColorOption,
  KrathongConfig,
  OfferingCount,
  OfferingSlotConfig,
  RitualItemType,
} from '@/types/krathong';
import { getActiveOfferings, THAI_NUMERALS } from '@/components/RiverCanvas';

interface CustomizationPanelProps {
  config: KrathongConfig;
  onChange: (updated: KrathongConfig) => void;
  onStartInteract: () => void;
}

const SPRING_TRANSITION = {
  type: 'spring' as const,
  stiffness: 100,
  damping: 16,
};

const PHRA_NAKHON_WISH_COUPLETS: string[] = [
  'ฝากทุกข์โศกลอยลับไปกับน้ำ ให้คืนค่ำมีแต่สุขทุกแห่งหน',
  'สิบห้าค่ำเดือนสิบสองน้ำนองตลิ่ง ขอพรพริ้งสมหวังดั่งใจหมาย',
  'จันทร์เพ็ญส่องต้องผิวน้ำงามจับตา ขอชีวาร่มเย็นเป็นสุขศรี',
  'ลอยประทีปทองส่องทางสว่างไสว คิดสิ่งใดสมถวิลสิ้นหมองศรี',
  'สายน้ำไหลพัดพาความเศร้าหมอง ให้เรืองรองดั่งทองทาบนภาลัย',
  'โคมทองลอยลิ่วล่องสู่ฟากฟ้า ปรารถนาสิ่งใดได้สมหมาย',
  'ลอยกระทงเคียงกันชมจันทร์ฉาย ให้มิตรภาพมิรู้คลายดั่งสายชล',
  'ขอขมาพระแม่คงคาด้วยใจภักดิ์ ให้ประจักษ์พบพานแต่สิ่งดี',
];

const OFFERING_COUNTS: OfferingCount[] = [1, 2, 3, 4, 5];

const ITEM_TYPE_OPTIONS: {
  id: RitualItemType;
  numeral: string;
  label: string;
  sub: string;
}[] = [
  {
    id: 'krathong',
    numeral: '๑',
    label: 'ล่องนาวาฝากแม่คงคา',
    sub: 'กระทงลอยสายน้ำ',
  },
  {
    id: 'lantern',
    numeral: '๒',
    label: 'ลอยโคมทองท่องเวหา',
    sub: 'โคมลอยปล่อยขึ้นฟ้า',
  },
];

const BASE_STYLES: { id: BaseStyle; label: string; sub: string }[] = [
  { id: 'classic-lotus', label: 'กลีบบัวซ้อน', sub: 'สัตตบงกช' },
  { id: 'layered-star', label: 'ดาวเรขาคณิต', sub: 'ดารารัศมี' },
  { id: 'royal-pleat', label: 'จีบพุ่มชาววัง', sub: 'พุ่มทองพระนคร' },
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
  { label: 'เหลืองนวลจันทร์', value: '#FFF275', accent: '#F4D06F' },
  { label: 'ม่วงดอกรัก', value: '#E0AAFF', accent: '#FF99C8' },
];

const CANDLE_COLORS: ColorOption[] = [
  { label: 'ทองขี้ผึ้งแท้', value: '#F4D06F', accent: '#FFF275' },
  { label: 'ส้มเปลวเทียน', value: '#FF8C42', accent: '#F4D06F' },
  { label: 'เหลืองนวลตา', value: '#FFF275', accent: '#FFFFFF' },
  { label: 'ชมพูเทียนอบ', value: '#FF99C8', accent: '#FFF275' },
];

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
  const currentCount: OfferingCount = config.offeringCount ?? 1;
  const slots = getActiveOfferings(config);
  const selectedIdx = Math.min(
    slots.length - 1,
    Math.max(0, config.selectedSlotIndex ?? 0)
  );
  const currentSlot = slots[selectedIdx];
  const [poemIdx, setPoemIdx] = useState<number>(0);

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
    });
  };

  const handleCyclePoem = () => {
    const nextIdx = (poemIdx + 1) % PHRA_NAKHON_WISH_COUPLETS.length;
    setPoemIdx(nextIdx);
    updateCurrentSlot('wishText', PHRA_NAKHON_WISH_COUPLETS[nextIdx]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 28 }}
      transition={SPRING_TRANSITION}
      className="pointer-events-auto mx-auto flex w-full max-w-5xl flex-col items-stretch gap-4 lg:flex-row lg:items-stretch"
    >
      {/* Left: Black-Gold Lacquer Craft Atelier Tray */}
      <div className="thai-chamfer relative flex flex-1 flex-col justify-between border border-[#D4AF37]/45 bg-[#0E1222]/95 p-4 text-[#FFFDF7] shadow-[0_22px_55px_rgba(4,6,14,0.88)] backdrop-blur-xl sm:p-5">
        <span className="pointer-events-none absolute top-2.5 left-3 h-2.5 w-2.5 border-t border-l border-[#D4AF37]/70" />
        <span className="pointer-events-none absolute top-2.5 right-3 h-2.5 w-2.5 border-t border-r border-[#D4AF37]/70" />
        <span className="pointer-events-none absolute bottom-2.5 left-3 h-2.5 w-2.5 border-b border-l border-[#D4AF37]/70" />
        <span className="pointer-events-none absolute right-3 bottom-2.5 h-2.5 w-2.5 border-r border-b border-[#D4AF37]/70" />

        {/* Header Row: Phra Nakhon Atelier + Offering Quantity Selector (1-5) */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D4AF37]/25 pb-3">
          <div>
            <p className="font-heading text-[11px] tracking-wider text-[#F4D06F]">
              โรงพับใบตองและโคมประทีป • ศาลาท่าน้ำพระนคร
            </p>
            <h2 className="font-display text-lg font-normal tracking-wide text-[#FFFDF7] sm:text-xl">
              ประดิษฐ์เครื่องลอยคืนวันเพ็ญ
            </h2>
          </div>

          {/* Quantity Selector: 1 to 5 Offerings */}
          <div className="flex items-center gap-2">
            <span className="font-heading text-xs text-[#F4D06F]">
              จำนวนเครื่องลอย:
            </span>
            <div className="flex items-center border border-[#D4AF37]/45 bg-[#080B14] p-0.5">
              {OFFERING_COUNTS.map((num) => {
                const active = currentCount === num;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleSelectCount(num)}
                    className={`font-heading min-w-[32px] px-2.5 py-1 text-xs transition-colors ${
                      active
                        ? 'bg-[#D4AF37] font-semibold text-[#0B0E17]'
                        : 'text-[#FFFDF7]/70 hover:text-[#FFF275]'
                    }`}
                  >
                    {THAI_NUMERALS[num - 1]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Per-Item Slot Selector Tabs (ชิ้นที่ ๑ .. ชิ้นที่ ๕) */}
        {currentCount > 1 && (
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <span className="font-heading mr-1 text-[11px] text-[#FFFDF7]/70">
              เลือกปรับแต่งรายชิ้น:
            </span>
            {slots.map((slot, idx) => {
              const isSelected = idx === selectedIdx;
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => handleSelectSlot(idx)}
                  className={`font-heading flex items-center gap-1.5 border px-2.5 py-1 text-xs transition-colors ${
                    isSelected
                      ? 'border-[#FFF275] bg-[#D4AF37]/25 font-semibold text-[#FFF275]'
                      : 'border-[#D4AF37]/30 bg-[#080B14]/80 text-[#FFFDF7]/70 hover:border-[#D4AF37]/60'
                  }`}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: slot.flowerColor }}
                  />
                  <span>
                    ชิ้นที่ {THAI_NUMERALS[idx]} (
                    {slot.itemType === 'lantern' ? 'โคมลอย' : 'กระทง'})
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Row 1: Offering Type for the Currently Selected Item */}
        <div className="mt-2.5 grid grid-cols-2 border border-[#D4AF37]/30 bg-[#080B14]/90">
          {ITEM_TYPE_OPTIONS.map((opt, idx) => {
            const active = currentSlot.itemType === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => updateCurrentSlot('itemType', opt.id)}
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
                    ประเภทที่ {opt.numeral} (สำหรับชิ้นที่{' '}
                    {THAI_NUMERALS[selectedIdx]})
                  </span>
                  {active && (
                    <span className="h-1.5 w-1.5 rotate-45 bg-[#FFF275]" />
                  )}
                </div>
                <span className="font-heading mt-0.5 text-xs font-medium">
                  {opt.label}
                </span>
                <span className="font-wish text-[11px] text-[#FFFDF7]/60">
                  {opt.sub}
                </span>
              </button>
            );
          })}
        </div>

        {/* Row 2: Banana Leaf Fold Architecture for Current Item */}
        <div className="mt-2.5 grid grid-cols-3 gap-2">
          {BASE_STYLES.map((style) => {
            const isSelected = currentSlot.baseStyle === style.id;
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => updateCurrentSlot('baseStyle', style.id)}
                className={`flex items-center gap-2.5 border px-2.5 py-2 text-left transition-all ${
                  isSelected
                    ? 'border-[#F4D06F] bg-[#D4AF37]/18 text-[#FFF275]'
                    : 'border-white/15 bg-[#080B14]/80 text-[#FFFDF7]/80 hover:border-[#D4AF37]/45'
                }`}
              >
                <StyleCollageThumbnail
                  style={style.id}
                  baseColor={currentSlot.baseColor}
                  flowerColor={currentSlot.flowerColor}
                />
                <div className="min-w-0">
                  <div className="font-heading truncate text-xs font-medium">
                    {style.label}
                  </div>
                  <div className="font-wish truncate text-[11px] text-[#F4D06F]/85">
                    ทรง{style.sub}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Row 3: Unified Pigment Palette Bar for Current Item */}
        <div className="mt-2.5 grid grid-cols-1 gap-2.5 border-t border-[#D4AF37]/25 pt-2.5 sm:grid-cols-3">
          <div className="flex items-center justify-between gap-2 bg-[#080B14]/70 px-3 py-2 sm:flex-col sm:items-start">
            <span className="font-heading text-[11px] text-[#F4D06F]">
              ๐๑ สีใบตองและขอบโคม
            </span>
            <div className="flex items-center gap-2.5">
              {LEAF_COLORS.map((color) => {
                const active = currentSlot.baseColor === color.value;
                return (
                  <button
                    key={color.value}
                    type="button"
                    title={color.label}
                    onClick={() => updateCurrentSlot('baseColor', color.value)}
                    className={`h-5 w-5 transition-transform ${
                      active
                        ? 'scale-115 ring-2 ring-[#FFF275] ring-offset-2 ring-offset-[#080B14]'
                        : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: color.value }}
                  />
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 bg-[#080B14]/70 px-3 py-2 sm:flex-col sm:items-start">
            <span className="font-heading text-[11px] text-[#F4D06F]">
              ๐๒ สีบุปผาและลวดลาย
            </span>
            <div className="flex items-center gap-2">
              {FLOWER_COLORS.map((color) => {
                const active = currentSlot.flowerColor === color.value;
                return (
                  <button
                    key={color.value}
                    type="button"
                    title={color.label}
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
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 bg-[#080B14]/70 px-3 py-2 sm:flex-col sm:items-start">
            <span className="font-heading text-[11px] text-[#F4D06F]">
              ๐๓ สีขี้ผึ้งเทียนและแสงโคม
            </span>
            <div className="flex items-center gap-2.5">
              {CANDLE_COLORS.map((color) => {
                const active = currentSlot.candleColor === color.value;
                return (
                  <button
                    key={color.value}
                    type="button"
                    title={color.label}
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
            </div>
          </div>
        </div>
      </div>

      {/* Right: Royal Indigo & Gold-Leaf Wish Inscription Box for Current Item */}
      <div
        style={{
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
                สมุดข่อยจารึกคำพร • ชิ้นที่ {THAI_NUMERALS[selectedIdx]} จาก{' '}
                {THAI_NUMERALS[currentCount - 1]} ชิ้น
              </p>
              <h3 className="font-display text-lg font-normal text-[#FFFDF7]">
                ฝากถ้อยคำคล้องจองล่องธารา
              </h3>
            </div>

            <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-[#D4AF37]/70 bg-[#B83B2A] text-[#FFF275] shadow-sm">
              <Sparks width={16} height={16} strokeWidth={1.8} />
            </div>
          </div>

          {currentCount > 1 && (
            <div className="mb-2.5 flex items-center justify-between border border-[#D4AF37]/30 bg-[#080B16]/80 px-2.5 py-1.5 text-xs">
              <span className="font-heading text-[#F4D06F]">
                กำลังเขียนคำพรของ:
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
                    #{THAI_NUMERALS[idx]}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="border border-[#D4AF37]/35 bg-[#080B16]/95 p-3.5">
            <div className="mb-2 flex items-center justify-between gap-2">
              <label className="font-heading text-xs font-medium text-[#F4D06F]">
                ถ้อยคำอธิษฐาน (ชิ้นที่ {THAI_NUMERALS[selectedIdx]} •{' '}
                {currentSlot.itemType === 'lantern' ? 'โคมลอย' : 'กระทง'})
              </label>
              <button
                type="button"
                onClick={handleCyclePoem}
                className="font-heading flex items-center gap-1 border border-[#D4AF37]/40 bg-[#141932] px-2 py-0.5 text-[10px] text-[#FFF275] transition-colors hover:border-[#FFF275] hover:bg-[#D4AF37]/20"
              >
                <RefreshDouble width={11} height={11} />
                <span>สุ่มกลอนคำพรพระนคร</span>
              </button>
            </div>

            <input
              type="text"
              maxLength={70}
              value={currentSlot.wishText}
              onChange={(e) => updateCurrentSlot('wishText', e.target.value)}
              placeholder="จารึกคำอธิษฐานหรือกดสุ่มบทกลอนด้านบน..."
              className="font-wish w-full border border-[#D4AF37]/45 bg-[#12172B] px-3 py-2 text-base text-[#FFFDF7] placeholder-[#FFFDF7]/45 transition-colors focus:border-[#FFF275] focus:bg-[#171E38] focus:outline-none"
            />

            <div className="mt-3 flex items-center gap-2.5">
              <span className="font-heading shrink-0 text-xs text-[#F4D06F]/90">
                นามผู้ฝากคำพร:
              </span>
              <input
                type="text"
                maxLength={24}
                value={currentSlot.authorName}
                onChange={(e) =>
                  updateCurrentSlot('authorName', e.target.value)
                }
                placeholder={`ระบุชื่อเจ้าของชิ้นที่ ${THAI_NUMERALS[selectedIdx]}...`}
                className="font-heading flex-1 border border-[#D4AF37]/35 bg-[#12172B] px-3 py-1.5 text-xs text-[#FFF275] placeholder-[#FFFDF7]/45 transition-colors focus:border-[#FFF275] focus:bg-[#171E38] focus:outline-none"
              />
            </div>
          </div>
        </div>

        <motion.button
          type="button"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          transition={SPRING_TRANSITION}
          onClick={onStartInteract}
          className="thai-chamfer-sm font-heading group mt-4 flex w-full items-center justify-between border border-[#FFF275]/60 bg-[#D4AF37] px-4 py-3 text-xs font-semibold tracking-wide text-[#0B0E17] shadow-[0_8px_24px_rgba(212,175,55,0.35)] transition-colors hover:bg-[#FFF275]"
        >
          <span className="flex items-center gap-2">
            <PeaceHand
              width={18}
              height={18}
              strokeWidth={2}
              className="text-[#0B0E17] transition-transform duration-300 group-hover:rotate-12"
            />
            <span>
              เยื้องย่างสู่ท่าน้ำ — อัญเชิญเครื่องลอยทั้ง{' '}
              {THAI_NUMERALS[currentCount - 1]} ชิ้น
            </span>
          </span>
          <span className="font-display text-xs font-medium text-[#0B0E17]">
            เชิญลอย →
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
};
