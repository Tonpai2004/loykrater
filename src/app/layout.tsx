import type { Metadata, Viewport } from "next";
import {
  Bai_Jamjuree,
  Charm,
  Cormorant_Garamond,
  Pridi,
} from "next/font/google";
import { LanguageProvider } from "@/contexts/LanguageContext";
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

const SITE_TITLE = "ลอยกะใคร อ๋อ ลอยกระทง";
const SITE_DESCRIPTION =
  "ประดิษฐ์กระทงใบตองและโคมลอย จารึกคำอธิษฐาน แล้วใช้นิ้วมือหยิบปล่อยลงสายน้ำผ่านกล้องเว็บแคม ลอยกระทงออนไลน์คืนวันเพ็ญเดือน ๑๒ ไปพร้อมคนที่คุณรัก";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://loykrater.vercel.app"
  ),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  applicationName: "ลอย กะ เธอ",
  keywords: [
    "ลอย กะ เธอ",
    "Loy Kra Ter",
    "ลอยกระทงออนไลน์",
    "ลอยกระทง",
    "ปล่อยโคมลอย",
    "Loy Krathong online",
  ],
  openGraph: {
    type: "website",
    url: "/",
    locale: "th_TH",
    alternateLocale: ["en_US"],
    siteName: "ลอย กะ เธอ",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0D1321",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="th"
      className={`${baiJamjureeFont.variable} ${charmFont.variable} ${pridiFont.variable} ${cormorantFont.variable} h-full antialiased`}
    >
      <body className="flex h-full flex-col overscroll-none bg-[#0D1321] text-[#FFFDF7] [-webkit-tap-highlight-color:transparent]">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
