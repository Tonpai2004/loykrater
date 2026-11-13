'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Xmark } from 'iconoir-react';

interface LoyKrathongLoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UPCOMING_SCROLLS = [
  {
    numeral: '๑',
    title: 'ปฐมบทแห่งวันเพ็ญเดือนสิบสอง',
    desc: 'รากเหง้าและพัฒนาการของประเพณีลอยประทีปโคมไฟ ตั้งแต่ยุคโบราณจวบจนสมัยรัตนโกสินทร์',
  },
  {
    numeral: '๒',
    title: 'คติความเชื่อเรื่องพระแม่คงคา',
    desc: 'ความกตัญญูต่อสายน้ำผู้หล่อเลี้ยงชีวิต การขอขมาลาโทษ และการลอยทุกข์โศกให้ไหลลับไปกับสายชล',
  },
  {
    numeral: '๓',
    title: 'โคมลอยยี่เป็งและประทีปบูชาฟากฟ้า',
    desc: 'ธรรมเนียมการปล่อยโคมไฟขึ้นสู่นภากาศเพื่อบูชาพระเกตุแก้วจุฬามณีบนสวรรค์ชั้นดาวดึงส์',
  },
  {
    numeral: '๔',
    title: 'ภูมิปัญญางานใบตองและดอกไม้สดไทย',
    desc: 'ความหมายอันเป็นมงคลของกลีบบัวสัตตบงกช ดอกดาวเรือง ดอกรัก และธูปเทียนเครื่องสักการะ',
  },
];

export const LoyKrathongLoreModal: React.FC<LoyKrathongLoreModalProps> = ({
  isOpen,
  onClose,
}) => {
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
          <motion.div
            initial={{ opacity: 0, y: 40, scaleY: 0.88 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: 30, scaleY: 0.92 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="saa-paper-card thai-chamfer relative flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden border-2 border-[#D4AF37] shadow-[0_28px_80px_rgba(0,0,0,0.85)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-[#8C6D3F] bg-[#1C1815] px-4 py-3 text-[#F5EFE4] sm:px-6">
              <div className="flex items-center gap-2.5">
                <span className="h-2.5 w-2.5 rotate-45 border border-[#FFF275] bg-[#D4AF37]" />
                <div>
                  <h2 className="font-display text-base font-semibold tracking-wide text-[#F4D06F] sm:text-lg">
                    สมุดข่อยคลังความรู้ • ตำนานประเพณีลอยกระทง
                  </h2>
                  <p className="font-heading text-[11px] text-[#F5EFE4]/75">
                    บันทึกประวัติศาสตร์ คติธรรม และภูมิปัญญาแห่งสายน้ำและโคมไฟ
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

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-7">
              {/* Coming Soon Centerpiece Banner */}
              <div className="mb-5 flex flex-col items-center border-2 border-dashed border-[#B89047] bg-[#FFFDF7]/85 px-5 py-6 text-center">
                {/* Ancient Scroll Illustration */}
                <div className="mb-3 flex h-16 w-16 items-center justify-center border border-[#D4AF37] bg-[#1C1815] text-[#F4D06F]">
                  <svg viewBox="0 0 40 40" className="h-9 w-9" fill="none">
                    <path
                      d="M6 10 L15 7 L25 10 L34 7 L34 30 L25 33 L15 30 L6 33 Z"
                      stroke="#F4D06F"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                    <line x1="15" y1="7" x2="15" y2="30" stroke="#D4AF37" strokeWidth="1.2" />
                    <line x1="25" y1="10" x2="25" y2="33" stroke="#D4AF37" strokeWidth="1.2" />
                  </svg>
                </div>

                <span className="mb-2 inline-block border border-[#B83B2A] bg-[#B83B2A] px-3 py-0.5 text-xs font-semibold tracking-wider text-[#FFFDF7]">
                  กำลังจารึกเนื้อหา • เร็วๆ นี้
                </span>

                <h3 className="font-display text-lg font-semibold text-[#1C1815] sm:text-xl">
                  หอสมุดข่อยประเพณีลอยกระทงกำลังอยู่ระหว่างการจัดทำ
                </h3>
                <p className="font-heading mt-1.5 max-w-md text-xs leading-relaxed text-[#4A3B2C] sm:text-sm">
                  ทีมงานกำลังรวบรวมเรื่องราวประวัติศาสตร์ ภาพประกอบ และเกร็ดความรู้เกี่ยวกับวันลอยกระทงและโคมยี่เป็ง เพื่อนำมาจัดแสดงในรูปแบบสมุดข่อยดิจิทัลเร็วๆ นี้
                </p>
              </div>

              {/* Preview of Upcoming Chapters */}
              <div className="mb-2 flex items-center gap-2">
                <span className="h-2 w-2 rotate-45 bg-[#B83B2A]" />
                <span className="font-display text-xs font-semibold tracking-wider text-[#1C1815] uppercase sm:text-sm">
                  หัวข้อเนื้อหาที่กำลังจะเปิดให้อ่าน
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {UPCOMING_SCROLLS.map((scroll) => (
                  <div
                    key={scroll.numeral}
                    className="border border-[#B89047]/55 bg-[#FFFDF7]/75 p-3.5 opacity-90"
                  >
                    <div className="flex items-center justify-between">
                      <span className="bg-[#1C1815] px-2 py-0.5 text-[10px] font-bold text-[#F4D06F]">
                        ผูกที่ {scroll.numeral}
                      </span>
                      <span className="text-[10px] font-medium text-[#B83B2A]">
                        เร็วๆ นี้
                      </span>
                    </div>
                    <h4 className="font-display mt-2 text-sm font-semibold text-[#1C1815]">
                      {scroll.title}
                    </h4>
                    <p className="font-heading mt-1 text-xs leading-relaxed text-[#5C4938]">
                      {scroll.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end border-t-2 border-[#8C6D3F] bg-[#EBE0CC] px-4 py-3 sm:px-6">
              <button
                type="button"
                onClick={onClose}
                className="thai-chamfer-sm cursor-pointer border border-[#1C1815] bg-[#1C1815] px-5 py-2 text-xs font-semibold text-[#F4D06F] transition-colors hover:bg-[#2E2620]"
              >
                ปิดสมุดข่อย
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
