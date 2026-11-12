import type { Metadata } from "next";
import {
  Bai_Jamjuree,
  Charm,
  Cormorant_Garamond,
  Pridi,
} from "next/font/google";
import "./globals.css";

const baiJamjureeFont = Bai_Jamjuree({
  variable: "--font-heading",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600"],
});

const charmFont = Charm({
  variable: "--font-mali",
  subsets: ["thai", "latin"],
  weight: ["400", "700"],
});

const pridiFont = Pridi({
  variable: "--font-display",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600"],
});

const cormorantFont = Cormorant_Garamond({
  variable: "--font-editorial",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: "ลอยกะเธอ — Loikratur | Nocturnal Water & Sky Ritual",
  description:
    "ลอยกะเธอ (Loikratur) — ร่วมพับกระทงและปล่อยโคมลอยคอลลาจเรขาคณิต จารึกคำอธิษฐานลงบนกระดาษสา และล่องสู่สายน้ำยามค่ำคืนไปพร้อมกัน",
  keywords: [
    "ลอยกะเธอ",
    "Loikratur",
    "ลอยกระทงออนไลน์",
    "ปล่อยโคมลอย",
    "Interactive Loy Krathong",
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="th"
      className={`${baiJamjureeFont.variable} ${charmFont.variable} ${pridiFont.variable} ${cormorantFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0D1321] text-[#FFFDF7]">
        {children}
      </body>
    </html>
  );
}
