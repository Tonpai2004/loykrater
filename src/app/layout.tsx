import type { Metadata, Viewport } from "next";
import {
  Bai_Jamjuree,
  Charm,
  Cormorant_Garamond,
  Pridi,
} from "next/font/google";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { getCanonicalSiteUrl } from "@/lib/siteUrl";
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
  // Wish handwriting isn't on the landing screen; loads on first use instead of competing with first paint
  preload: false,
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
  // Only the small English subtitle uses it above the fold; swaps in from the metric-matched fallback
  preload: false,
});

const SITE_NAME = "ลอย กะ เธอ";
// Keep in sync with translations.th.meta.title — LanguageProvider re-applies that string on the client
const SITE_TITLE = "ลอยกะใคร อ๋อ ลอยกระทง | ลอยกระทงออนไลน์ ลอย กะ เธอ";
const SITE_DESCRIPTION =
  "ประดิษฐ์กระทงใบตองและโคมลอย จารึกคำอธิษฐาน แล้วใช้นิ้วมือหยิบปล่อยลงสายน้ำผ่านกล้องเว็บแคม ลอยกระทงออนไลน์คืนวันเพ็ญเดือน ๑๒ ไปพร้อมคนที่คุณรัก";

export const metadata: Metadata = {
  metadataBase: new URL(getCanonicalSiteUrl()),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "ลอย กะ เธอ",
    "ลอยกะเธอ",
    "Loy Kra Ter",
    "ลอยกระทงออนไลน์",
    "ลอยกระทงออนไลน์ 2569",
    "ลอยกระทง 2569",
    "ลอยกระทง",
    "เว็บลอยกระทง",
    "ลอยโคมออนไลน์",
    "ปล่อยโคมลอย",
    "ประวัติวันลอยกระทง",
    "Loy Krathong online",
    "virtual Loy Krathong",
  ],
  category: "entertainment",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    url: "/",
    locale: "th_TH",
    alternateLocale: ["en_US"],
    siteName: SITE_NAME,
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

// Site-wide structured data: the site itself and the browser-based Loy Krathong experience it hosts
function StructuredData() {
  const siteUrl = getCanonicalSiteUrl();
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: SITE_NAME,
        alternateName: ["Loy Kra Ter", "ลอยกะเธอ", "ลอยกระทงออนไลน์"],
        description: SITE_DESCRIPTION,
        inLanguage: ["th-TH", "en-US"],
      },
      {
        "@type": "WebApplication",
        "@id": `${siteUrl}/#app`,
        url: siteUrl,
        name: `${SITE_NAME} (Loy Kra Ter) ลอยกระทงออนไลน์`,
        description: SITE_DESCRIPTION,
        applicationCategory: "EntertainmentApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript. Webcam optional for hand tracking.",
        inLanguage: ["th-TH", "en-US"],
        isAccessibleForFree: true,
        image: `${siteUrl}/opengraph-image`,
        offers: { "@type": "Offer", price: "0", priceCurrency: "THB" },
        isPartOf: { "@id": `${siteUrl}/#website` },
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="th"
      className={`${baiJamjureeFont.variable} ${charmFont.variable} ${pridiFont.variable} ${cormorantFont.variable} h-full antialiased`}
    >
      <body className="flex h-full flex-col overscroll-none bg-[#0D1321] text-[#FFFDF7] [-webkit-tap-highlight-color:transparent]">
        <StructuredData />
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
