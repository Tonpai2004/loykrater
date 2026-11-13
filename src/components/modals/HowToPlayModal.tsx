'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Xmark, NavArrowLeft, NavArrowRight } from 'iconoir-react';
import { InteractiveTutorialSandbox } from '@/components/modals/InteractiveTutorialSandbox';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnterPier?: () => void;
}

type ChapterId = 'equipment' | 'customize' | 'gestures' | 'tutorial';

interface ChapterMeta {
  id: ChapterId;
  numeral: string;
  title: string;
  subtitle: string;
}

const CHAPTERS: ChapterMeta[] = [
  {
    id: 'equipment',
    numeral: '๑',
    title: 'อุปกรณ์ที่ใช้เล่น',
    subtitle: 'กล้อง • เมาส์ • ระบบเสียง',
  },
  {
    id: 'customize',
    numeral: '๒',
    title: 'การแต่งกระทงและโคม',
    subtitle: 'ปรับแต่ง ๑–๕ ชิ้น & คำพร',
  },
  {
    id: 'gestures',
    numeral: '๓',
    title: 'วิธีหยิบและปล่อยลอย',
    subtitle: 'ท่าทางมือ & จุดวางเป้าหมาย',
  },
  {
    id: 'tutorial',
    numeral: '๔',
    title: 'ลานทดลองฝึกเล่น',
    subtitle: 'ซ้อมหยิบและปล่อยลอยจริง',
  },
];

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({
  isOpen,
  onClose,
  onEnterPier,
}) => {
  const [activeChapter, setActiveChapter] = useState<ChapterId>('equipment');

  const currentIdx = CHAPTERS.findIndex((c) => c.id === activeChapter);

  const handlePrev = () => {
    if (currentIdx > 0) {
      setActiveChapter(CHAPTERS[currentIdx - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIdx < CHAPTERS.length - 1) {
      setActiveChapter(CHAPTERS[currentIdx + 1].id);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#060911]/85 p-3 backdrop-blur-md sm:p-6"
          onClick={onClose}
        >
          {/* Samut Khoi (สมุดข่อยโบราณ) Unfolding Container */}
          <motion.div
            initial={{ opacity: 0, y: 40, scaleY: 0.88 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: 30, scaleY: 0.92 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="saa-paper-card thai-chamfer relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden border-2 border-[#D4AF37] shadow-[0_28px_80px_rgba(0,0,0,0.85)]"
          >
            {/* Top Golden Samut Khoi Spine Bar */}
            <div className="flex items-center justify-between border-b-2 border-[#8C6D3F] bg-[#1C1815] px-4 py-3 text-[#F5EFE4] sm:px-6">
              <div className="flex items-center gap-2.5">
                <span className="h-2.5 w-2.5 rotate-45 border border-[#FFF275] bg-[#D4AF37]" />
                <div>
                  <h2 className="font-display text-base font-semibold tracking-wide text-[#F4D06F] sm:text-lg">
                    สมุดข่อยแนะนำวิธีการเล่น • ลอยกะเธอ
                  </h2>
                  <p className="font-heading text-[11px] text-[#F5EFE4]/75">
                    ตำราคู่มือการประดิษฐ์เครื่องสักการะ อุปกรณ์ และการหยิบปล่อยสู่สายน้ำและฟากฟ้า
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 cursor-pointer items-center justify-center border border-[#D4AF37]/50 bg-[#2A241F] text-[#F4D06F] transition-colors hover:border-[#FFF275] hover:bg-[#3B322B]"
                aria-label="ปิดสมุดข่อย"
              >
                <Xmark width={18} height={18} />
              </button>
            </div>

            {/* Chapter Tabs (สารบัญสมุดข่อย ๔ บท) */}
            <div className="grid grid-cols-2 border-b border-[#B89047]/50 bg-[#EBE0CC] sm:grid-cols-4">
              {CHAPTERS.map((chap) => {
                const isSelected = chap.id === activeChapter;
                return (
                  <button
                    key={chap.id}
                    type="button"
                    onClick={() => setActiveChapter(chap.id)}
                    className={`cursor-pointer border-r border-b border-[#B89047]/40 px-3 py-2.5 text-left transition-all last:border-r-0 sm:border-b-0 ${
                      isSelected
                        ? 'bg-[#F5EFE4] shadow-[inset_0_-3px_0_#B83B2A]'
                        : 'bg-[#E5D8C0]/75 hover:bg-[#EFE6D4]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center text-xs font-bold ${
                          isSelected
                            ? 'bg-[#B83B2A] text-[#FFFDF7]'
                            : 'bg-[#1C1815]/15 text-[#1C1815]'
                        }`}
                      >
                        {chap.numeral}
                      </span>
                      <div className="min-w-0">
                        <div
                          className={`font-display truncate text-xs font-semibold sm:text-sm ${
                            isSelected ? 'text-[#B83B2A]' : 'text-[#1C1815]'
                          }`}
                        >
                          {chap.title}
                        </div>
                        <div className="font-heading truncate text-[10px] text-[#5C4938]">
                          {chap.subtitle}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Scrollable Manuscript Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {/* CHAPTER 1: EQUIPMENT */}
              {activeChapter === 'equipment' && (
                <div className="space-y-4">
                  <div className="border-l-4 border-[#B83B2A] bg-[#FFFDF7]/75 px-4 py-2.5">
                    <h3 className="font-display text-base font-semibold text-[#1C1815]">
                      บทที่ ๑ : อุปกรณ์ที่ใช้ในการร่วมพิธีลอยประทีป
                    </h3>
                    <p className="font-heading text-xs text-[#4A3B2C]">
                      สามารถเลือกเล่นได้ทั้งแบบใช้กล้องตรวจจับมือ (AI Hand Tracking) เพื่อความสมจริง หรือใช้เมาส์/หน้าจอสัมผัสได้ทุกอุปกรณ์
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
                    {/* Equipment 1: Webcam */}
                    <div className="flex flex-col justify-between border border-[#B89047]/60 bg-[#FFFDF7]/90 p-3.5 shadow-sm">
                      <div>
                        <div className="mb-2.5 flex h-24 items-center justify-center border border-[#D4AF37]/40 bg-[#0D1321] p-2">
                          <svg viewBox="0 0 140 80" className="h-full w-full" fill="none">
                            {/* Webcam body */}
                            <rect x="14" y="24" width="34" height="26" rx="4" fill="#1A1B41" stroke="#F4D06F" strokeWidth="1.5" />
                            <circle cx="31" cy="37" r="7" fill="#0D1321" stroke="#FFF275" strokeWidth="1.5" />
                            <path d="M22 50 L40 50 L44 58 L18 58 Z" fill="#D4AF37" />
                            {/* Scanning Rays */}
                            <path d="M48 32 L95 14 M48 37 L95 37 M48 42 L95 60" stroke="#F4D06F" strokeWidth="1" strokeDasharray="3 3" />
                            {/* Hand Silhouette */}
                            <circle cx="108" cy="37" r="18" fill="#F4D06F" fillOpacity="0.18" stroke="#FFF275" strokeWidth="1.2" />
                            <path d="M104 46 L104 32 M108 46 L108 28 M112 46 L112 31 M100 42 L100 36" stroke="#FFF275" strokeWidth="2.2" strokeLinecap="round" />
                          </svg>
                        </div>
                        <div className="mb-1 inline-block bg-[#2D6A4F] px-2 py-0.5 text-[10px] font-semibold text-[#FFFDF7]">
                          แนะนำเพื่อความสมจริง
                        </div>
                        <h4 className="font-display text-sm font-semibold text-[#1C1815]">
                          ๑. กล้องเว็บแคม (Webcam)
                        </h4>
                        <p className="font-heading mt-1 text-xs leading-relaxed text-[#4A3B2C]">
                          ใช้ระบบ AI ตรวจจับมือแบบเรียลไทม์ รองรับการเล่นพร้อมกันหลายมือ (สูงสุด ๔ มือในจอเดียว) สามารถหยิบกระทงและโคมลอยพร้อมกับคนข้างๆ ได้ทันที
                        </p>
                      </div>
                      <div className="mt-2.5 border-t border-[#B89047]/30 pt-2 text-[11px] font-medium text-[#7A5C38]">
                        ระยะที่เหมาะสม: ห่างจากกล้องประมาณ ๔๐–๘๐ ซม. ในที่ที่มีแสงสว่างเพียงพอ
                      </div>
                    </div>

                    {/* Equipment 2: Mouse / Touch */}
                    <div className="flex flex-col justify-between border border-[#B89047]/60 bg-[#FFFDF7]/90 p-3.5 shadow-sm">
                      <div>
                        <div className="mb-2.5 flex h-24 items-center justify-center border border-[#D4AF37]/40 bg-[#0D1321] p-2">
                          <svg viewBox="0 0 140 80" className="h-full w-full" fill="none">
                            {/* Mouse icon */}
                            <rect x="26" y="16" width="30" height="48" rx="15" fill="#1A1B41" stroke="#F4D06F" strokeWidth="1.6" />
                            <line x1="41" y1="16" x2="41" y2="34" stroke="#FFF275" strokeWidth="1.4" />
                            {/* Drag path */}
                            <path d="M62 40 C76 40, 82 26, 98 26" stroke="#FF8C42" strokeWidth="1.6" strokeDasharray="4 3" />
                            <circle cx="106" cy="26" r="12" fill="#FF8C42" fillOpacity="0.25" stroke="#FFF275" strokeWidth="1.4" />
                            <circle cx="106" cy="26" r="4" fill="#FFF275" />
                          </svg>
                        </div>
                        <div className="mb-1 inline-block bg-[#8C6D3F] px-2 py-0.5 text-[10px] font-semibold text-[#FFFDF7]">
                          ใช้งานได้ทุกอุปกรณ์
                        </div>
                        <h4 className="font-display text-sm font-semibold text-[#1C1815]">
                          ๒. เมาส์ หรือ หน้าจอสัมผัส
                        </h4>
                        <p className="font-heading mt-1 text-xs leading-relaxed text-[#4A3B2C]">
                          หากไม่สะดวกเปิดกล้อง สามารถใช้เมาส์คลิกค้าง หรือใช้นิ้วแตะลากกระทงและโคมลอยไปยังจุดวางได้โดยตรง หรือกดปุ่ม <strong>&ldquo;ลอยทั้งหมดทันที&rdquo;</strong>
                        </p>
                      </div>
                      <div className="mt-2.5 border-t border-[#B89047]/30 pt-2 text-[11px] font-medium text-[#7A5C38]">
                        รองรับทั้งคอมพิวเตอร์ แท็บเล็ต และสมาร์ตโฟน
                      </div>
                    </div>

                    {/* Equipment 3: Audio */}
                    <div className="flex flex-col justify-between border border-[#B89047]/60 bg-[#FFFDF7]/90 p-3.5 shadow-sm">
                      <div>
                        <div className="mb-2.5 flex h-24 items-center justify-center border border-[#D4AF37]/40 bg-[#0D1321] p-2">
                          <svg viewBox="0 0 140 80" className="h-full w-full" fill="none">
                            {/* Traditional Ranat / Sound Wave */}
                            <polygon points="44,32 56,32 68,20 68,60 56,48 44,48" fill="#F4D06F" />
                            <path d="M78 28 Q88 40 78 52" stroke="#FFF275" strokeWidth="2" strokeLinecap="round" />
                            <path d="M86 20 Q102 40 86 60" stroke="#FF8C42" strokeWidth="1.8" strokeLinecap="round" />
                          </svg>
                        </div>
                        <div className="mb-1 inline-block bg-[#B83B2A] px-2 py-0.5 text-[10px] font-semibold text-[#FFFDF7]">
                          เพิ่มอรรถรสยามค่ำคืน
                        </div>
                        <h4 className="font-display text-sm font-semibold text-[#1C1815]">
                          ๓. ลำโพง หรือ หูฟัง
                        </h4>
                        <p className="font-heading mt-1 text-xs leading-relaxed text-[#4A3B2C]">
                          มุมขวาบนของจอมีปุ่มควบคุมเสียงเพลงบรรเลงลอยกระทง สามารถคลิกเปิด/ปิดเสียงในคลิกเดียว หรือเลื่อนปรับระดับความดังได้ตามต้องการ
                        </p>
                      </div>
                      <div className="mt-2.5 border-t border-[#B89047]/30 pt-2 text-[11px] font-medium text-[#7A5C38]">
                        ค่าเริ่มต้นจะปิดเสียงไว้เพื่อไม่ให้รบกวน สามารถกดเปิดได้ทันที
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CHAPTER 2: CUSTOMIZE */}
              {activeChapter === 'customize' && (
                <div className="space-y-4">
                  <div className="border-l-4 border-[#B83B2A] bg-[#FFFDF7]/75 px-4 py-2.5">
                    <h3 className="font-display text-base font-semibold text-[#1C1815]">
                      บทที่ ๒ : การประดิษฐ์กระทง โคมลอย และจารึกคำอธิษฐาน
                    </h3>
                    <p className="font-heading text-xs text-[#4A3B2C]">
                      ออกแบบเครื่องสักการะได้อิสระสูงสุดถึง ๕ ชิ้นในรอบเดียว โดยปรับแต่งแยกแต่ละชิ้นได้ทั้งหมด
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                    {/* Step 1: Count & Slot Selection */}
                    <div className="border border-[#B89047]/60 bg-[#FFFDF7]/90 p-3.5">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center bg-[#1C1815] text-xs font-bold text-[#F4D06F]">
                          ๑
                        </span>
                        <h4 className="font-display text-sm font-semibold text-[#1C1815]">
                          ระบุจำนวนเครื่องสักการะ (๑ – ๕ ชิ้น)
                        </h4>
                      </div>
                      <p className="font-heading mt-2 text-xs leading-relaxed text-[#4A3B2C]">
                        เลือกจำนวนกระทงหรือโคมลอยที่ต้องการ (ตั้งแต่ ๑ ถึง ๕ ชิ้น) จากนั้นกดที่แถบหมายเลข <strong>๑, ๒, ๓, ๔, ๕</strong> เพื่อสลับปรับแต่งสี รูปทรง และคำอวยพรของแต่ละชิ้นแยกกันได้เลย
                      </p>
                    </div>

                    {/* Step 2: Krathong vs Sky Lantern */}
                    <div className="border border-[#B89047]/60 bg-[#FFFDF7]/90 p-3.5">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center bg-[#1C1815] text-xs font-bold text-[#F4D06F]">
                          ๒
                        </span>
                        <h4 className="font-display text-sm font-semibold text-[#1C1815]">
                          เลือกรูปแบบ: กระทงลอยน้ำ หรือ โคมลอยฟ้า
                        </h4>
                      </div>
                      <p className="font-heading mt-2 text-xs leading-relaxed text-[#4A3B2C]">
                        แต่ละชิ้นสามารถเลือกได้ว่าจะเป็น <strong>&ldquo;ล่องนาวาฝากแม่คงคา (กระทงลอยน้ำ)&rdquo;</strong> หรือ <strong>&ldquo;ลอยโคมทองท่องเวหา (โคมลอยขึ้นฟ้า)&rdquo;</strong> ผสมกันในเซ็ตเดียวได้ตามใจชอบ
                      </p>
                    </div>

                    {/* Step 3: Colors & Extended Color Modal */}
                    <div className="border border-[#B89047]/60 bg-[#FFFDF7]/90 p-3.5">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center bg-[#1C1815] text-xs font-bold text-[#F4D06F]">
                          ๓
                        </span>
                        <h4 className="font-display text-sm font-semibold text-[#1C1815]">
                          เลือกทรงกลีบ และถาดผสมสีเพิ่มเติม
                        </h4>
                      </div>
                      <p className="font-heading mt-2 text-xs leading-relaxed text-[#4A3B2C]">
                        เลือกทรงกลีบใบตอง ๓ แบบ และเลือกสีฐาน สีบุปผา สีธูปเทียน หากต้องการสีพิเศษ สามารถกด <strong>ปุ่มวงล้อสีรุ้ง</strong> ท้ายแถวเพื่อเปิดถาดคู่สีไทย ๑๖ เฉด หลอดไล่เฉดสี และ <strong>หลอดดูดสี (Eyedropper)</strong>
                      </p>
                    </div>

                    {/* Step 4: Wish Couplets, Privacy & Submerge Book */}
                    <div className="border border-[#B89047]/60 bg-[#FFFDF7]/90 p-3.5">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center bg-[#1C1815] text-xs font-bold text-[#F4D06F]">
                          ๔
                        </span>
                        <h4 className="font-display text-sm font-semibold text-[#1C1815]">
                          สุ่มกลอนมงคล • ซ่อนคำพร • พับตำราชมวิว
                        </h4>
                      </div>
                      <p className="font-heading mt-2 text-xs leading-relaxed text-[#4A3B2C]">
                        พิมพ์คำอธิษฐานเองหรือกด <strong>&ldquo;สุ่มกลอน&rdquo;</strong> คล้องจอง ๒๔ บท หากไม่อยากให้ผู้อื่นเห็นคำพรบนผิวน้ำให้กด <strong>&ldquo;ซ่อนคำอวยพร&rdquo;</strong> และสามารถกดพับตำราลงน้ำชั่วคราวเพื่อชมวิวท่าน้ำชัดๆ ก่อนเริ่มลอย
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* CHAPTER 3: GESTURES & RELEASE */}
              {activeChapter === 'gestures' && (
                <div className="space-y-4">
                  <div className="border-l-4 border-[#B83B2A] bg-[#FFFDF7]/75 px-4 py-2.5">
                    <h3 className="font-display text-base font-semibold text-[#1C1815]">
                      บทที่ ๓ : ท่าทางมือในการหยิบ และการวางปล่อยลงสู่เป้าหมาย
                    </h3>
                    <p className="font-heading text-xs text-[#4A3B2C]">
                      เครื่องสักการะของคุณจะมีวงแสงสีทองส่องสว่างชัดเจน แยกจากกระทงฉากหลังที่ลอยจางๆ ในน้ำ
                    </p>
                  </div>

                  {/* 3-Step Visual Diagram */}
                  <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
                    {/* Gesture Step 1 */}
                    <div className="border border-[#B89047]/60 bg-[#FFFDF7]/90 p-3.5">
                      <div className="mb-2.5 flex h-28 items-center justify-center border border-[#D4AF37]/40 bg-[#0D1321] p-2">
                        <svg viewBox="0 0 120 90" className="h-full w-full" fill="none">
                          <circle cx="60" cy="45" r="26" stroke="#F4D06F" strokeWidth="1.2" strokeDasharray="4 4" />
                          {/* Open palm fingers */}
                          <line x1="48" y1="56" x2="44" y2="28" stroke="#FFF275" strokeWidth="3.5" strokeLinecap="round" />
                          <line x1="55" y1="55" x2="55" y2="22" stroke="#FFF275" strokeWidth="3.5" strokeLinecap="round" />
                          <line x1="63" y1="55" x2="65" y2="24" stroke="#FFF275" strokeWidth="3.5" strokeLinecap="round" />
                          <line x1="70" y1="57" x2="75" y2="32" stroke="#FFF275" strokeWidth="3.5" strokeLinecap="round" />
                          <line x1="42" y1="52" x2="32" y2="40" stroke="#F4D06F" strokeWidth="3.5" strokeLinecap="round" />
                          <circle cx="58" cy="56" r="10" fill="#F4D06F" fillOpacity="0.4" />
                        </svg>
                      </div>
                      <h4 className="font-display text-sm font-semibold text-[#1C1815]">
                        ขั้นที่ ๑ : แบมือเล็งตำแหน่ง
                      </h4>
                      <p className="font-heading mt-1 text-xs leading-relaxed text-[#4A3B2C]">
                        ยกมือขึ้นหน้ากล้อง จะเห็นรูปมือสีทองเคลื่อนที่ตามมือของคุณ เลื่อนมือไปวางทับเครื่องสักการะที่มีวงแสงคำว่า <strong>&ldquo;หยิบชิ้นนี้&rdquo;</strong>
                      </p>
                    </div>

                    {/* Gesture Step 2 */}
                    <div className="border border-[#B89047]/60 bg-[#FFFDF7]/90 p-3.5">
                      <div className="mb-2.5 flex h-28 items-center justify-center border border-[#D4AF37]/40 bg-[#0D1321] p-2">
                        <svg viewBox="0 0 120 90" className="h-full w-full" fill="none">
                          {/* Pinching thumb + index */}
                          <circle cx="56" cy="36" r="12" fill="#52B788" fillOpacity="0.3" stroke="#52B788" strokeWidth="1.6" />
                          <circle cx="56" cy="36" r="4.5" fill="#FFF275" />
                          <path d="M40 62 Q44 45 55 37" stroke="#FFF275" strokeWidth="4" strokeLinecap="round" />
                          <path d="M68 62 Q66 42 57 37" stroke="#FFF275" strokeWidth="4" strokeLinecap="round" />
                          <path d="M74 62 L78 42 M80 64 L85 48" stroke="#F4D06F" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.7" />
                        </svg>
                      </div>
                      <h4 className="font-display text-sm font-semibold text-[#1C1815]">
                        ขั้นที่ ๒ : จีบนิ้วค้างเพื่อหยิบและลาก
                      </h4>
                      <p className="font-heading mt-1 text-xs leading-relaxed text-[#4A3B2C]">
                        <strong>จีบนิ้วโป้งแตะนิ้วชี้ค้างไว้</strong> (หรือคลิกเมาส์ค้าง) เพื่อหยิบเครื่องสักการะ แล้วลากไปยังวงแสงเป้าหมายโดยยังไม่ต้องปล่อยนิ้ว
                      </p>
                    </div>

                    {/* Gesture Step 3 */}
                    <div className="border border-[#B89047]/60 bg-[#FFFDF7]/90 p-3.5">
                      <div className="mb-2.5 flex h-28 items-center justify-center border border-[#D4AF37]/40 bg-[#0D1321] p-2">
                        <svg viewBox="0 0 120 90" className="h-full w-full" fill="none">
                          {/* Sky Target */}
                          <ellipse cx="60" cy="24" rx="34" ry="11" fill="#FF8C42" fillOpacity="0.2" stroke="#FF8C42" strokeWidth="1.4" strokeDasharray="3 3" />
                          <text x="60" y="27" textAnchor="middle" fill="#FFF275" fontSize="8">โซนฟ้า: โคมลอย</text>
                          {/* Water Target */}
                          <ellipse cx="60" cy="66" rx="38" ry="12" fill="#F4D06F" fillOpacity="0.2" stroke="#F4D06F" strokeWidth="1.4" strokeDasharray="3 3" />
                          <text x="60" y="69" textAnchor="middle" fill="#FFF275" fontSize="8">โซนน้ำ: กระทง</text>
                        </svg>
                      </div>
                      <h4 className="font-display text-sm font-semibold text-[#1C1815]">
                        ขั้นที่ ๓ : คลายนิ้วปล่อยในวงแสง
                      </h4>
                      <p className="font-heading mt-1 text-xs leading-relaxed text-[#4A3B2C]">
                        เมื่อลากเข้าสู่วงแสงเป้าหมายแล้ว <strong>ต้องแบมือคลายนิ้วออก (หรือปล่อยเมาส์)</strong> เครื่องสักการะจึงจะถูกปล่อยลอยออกไปอย่างสมบูรณ์
                      </p>
                    </div>
                  </div>

                  {/* Important Note on Multi-Offering Timer */}
                  <div className="border border-[#D4AF37] bg-[#1C1815] p-3.5 text-[#F5EFE4]">
                    <div className="font-display text-xs font-semibold text-[#F4D06F] sm:text-sm">
                      การลอยพร้อมกันหลายชิ้น และการรับพรจากพระแม่คงคา
                    </div>
                    <p className="font-heading mt-1 text-xs leading-relaxed text-[#F5EFE4]/85">
                      หากเลือกเล่นหลายชิ้น (๒–๕ ชิ้น) ชิ้นที่ปล่อยลงน้ำหรือขึ้นฟ้าไปก่อนจะลอยรอกลางสายน้ำอย่างสวยงาม และเมื่อปล่อย <strong>ชิ้นสุดท้ายในเซ็ตครบแล้ว</strong> เครื่องสักการะทุกชิ้นจะเริ่มลอยเคียงคู่กันไปพร้อมกัน จากนั้นพระแม่คงคาและจันทรเทพจะเสด็จขึ้นมาประทานพรให้แก่ทุกท่าน
                    </p>
                  </div>
                </div>
              )}

              {/* CHAPTER 4: INTERACTIVE MINI-TUTORIAL */}
              {activeChapter === 'tutorial' && (
                <div className="space-y-3">
                  <div className="border-l-4 border-[#B83B2A] bg-[#FFFDF7]/75 px-4 py-2">
                    <h3 className="font-display text-base font-semibold text-[#1C1815]">
                      บทที่ ๔ : ลานทดลองฝึกหยิบและปล่อยลอย
                    </h3>
                    <p className="font-heading text-xs text-[#4A3B2C]">
                      ลองกดค้างที่กระทงหรือโคมลอยด้านล่าง ลากไปยังวงแสงเป้าหมาย แล้วปล่อยมือเพื่อซ้อมความคุ้นเคยก่อนเข้าสู่ท่าน้ำจริง
                    </p>
                  </div>

                  <InteractiveTutorialSandbox />
                </div>
              )}
            </div>

            {/* Bottom Samut Khoi Navigation Footer */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t-2 border-[#8C6D3F] bg-[#EBE0CC] px-4 py-3 sm:px-6">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentIdx === 0}
                  className="inline-flex cursor-pointer items-center gap-1 border border-[#8C6D3F] bg-[#FFFDF7] px-3 py-1.5 text-xs font-semibold text-[#1C1815] transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <NavArrowLeft width={15} height={15} />
                  บทก่อนหน้า
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={currentIdx === CHAPTERS.length - 1}
                  className="inline-flex cursor-pointer items-center gap-1 border border-[#8C6D3F] bg-[#FFFDF7] px-3 py-1.5 text-xs font-semibold text-[#1C1815] transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
                >
                  บทถัดไป
                  <NavArrowRight width={15} height={15} />
                </button>
              </div>

              <div className="flex items-center gap-2">
                {onEnterPier && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onEnterPier();
                    }}
                    className="thai-chamfer-sm cursor-pointer border border-[#1C1815] bg-[#1C1815] px-4 py-2 text-xs font-semibold text-[#F4D06F] transition-colors hover:bg-[#2E2620]"
                  >
                    เข้าใจแล้ว • เข้าสู่ท่าน้ำเพื่อลอยกระทง
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
