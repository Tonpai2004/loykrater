import type { Metadata } from 'next';
import Link from 'next/link';
import { LORE_CONTENT } from '@/constants/loreContent';
import { getCanonicalSiteUrl } from '@/lib/siteUrl';

// Crawlable, server-rendered edition of the lore manuscript that the home page shows in a modal
const lore = LORE_CONTENT.th;

const PAGE_PATH = '/loy-krathong';
const PAGE_TITLE = 'ประวัติวันลอยกระทง ที่มา ความหมาย และตำนานพระแม่คงคา';
const PAGE_DESCRIPTION =
  'ประวัติวันลอยกระทง ที่มาของประเพณีคืนวันเพ็ญเดือน ๑๒ ความเชื่อเรื่องการขอขมาพระแม่คงคา ลอยกระทงในแผ่นดินสยาม เพลงรำวงวันลอยกระทง จนถึงลอยกระทงออนไลน์ในยุคปัจจุบัน';
const PUBLISHED_AT = '2026-11-22';

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: PAGE_PATH },
  openGraph: {
    type: 'article',
    url: PAGE_PATH,
    locale: 'th_TH',
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
};

function ArticleStructuredData() {
  const siteUrl = getCanonicalSiteUrl();
  const pageUrl = `${siteUrl}${PAGE_PATH}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: PAGE_TITLE,
        description: PAGE_DESCRIPTION,
        inLanguage: 'th-TH',
        datePublished: PUBLISHED_AT,
        dateModified: PUBLISHED_AT,
        image: `${siteUrl}/opengraph-image`,
        mainEntityOfPage: pageUrl,
        author: { '@type': 'Organization', name: 'ลอย กะ เธอ', url: siteUrl },
        publisher: { '@type': 'Organization', name: 'ลอย กะ เธอ', url: siteUrl },
        about: { '@type': 'Thing', name: 'ลอยกระทง', alternateName: 'Loy Krathong' },
        isPartOf: { '@id': `${siteUrl}/#website` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'ลอยกระทงออนไลน์', item: siteUrl },
          { '@type': 'ListItem', position: 2, name: 'ประวัติวันลอยกระทง', item: pageUrl },
        ],
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
      }}
    />
  );
}

function Divider() {
  return (
    <div className="mx-auto mt-3 flex w-40 items-center gap-2.5" aria-hidden="true">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#C5A059]/70" />
      <span className="h-1.5 w-1.5 rotate-45 bg-[#F4D06F]" />
      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#C5A059]/70" />
    </div>
  );
}

function FloatCta({ label }: { label: string }) {
  return (
    <Link
      href="/"
      className="thai-chamfer inline-flex items-center justify-center border-2 border-[#FFF275] bg-gradient-to-r from-[#F4D06F] via-[#FF8C42] to-[#F4D06F] px-6 py-3 font-display text-base font-semibold tracking-wide text-[#0D1321] shadow-[0_12px_36px_rgba(244,208,111,0.38)] transition-shadow hover:shadow-[0_16px_46px_rgba(244,208,111,0.55)]"
    >
      {label}
    </Link>
  );
}

export default function LoyKrathongHistoryPage() {
  return (
    // body is overflow:hidden for the full-screen river, so the article scrolls inside <main>
    <main className="min-h-0 w-full flex-1 overflow-y-auto overscroll-contain bg-[#0D0B09] px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(3rem,env(safe-area-inset-bottom))] text-[#F5EFE4] sm:px-8">
      <ArticleStructuredData />

      <article className="mx-auto w-full max-w-2xl">
        <nav aria-label="breadcrumb" className="font-heading text-xs text-[#C5A059]">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="underline-offset-4 hover:text-[#F4D06F] hover:underline">
                ลอย กะ เธอ · ลอยกระทงออนไลน์
              </Link>
            </li>
            <li aria-hidden="true">›</li>
            <li aria-current="page" className="text-[#E6DEC8]/80">
              ประวัติวันลอยกระทง
            </li>
          </ol>
        </nav>

        <header className="mt-8 text-center">
          <p className="font-editorial text-[11px] tracking-[0.3em] text-[#C5A059] uppercase">
            {lore.sub}
          </p>
          <h1 className="font-display mt-2 text-2xl font-semibold tracking-wide text-balance text-[#F4D06F] sm:text-3xl">
            {PAGE_TITLE}
          </h1>
          <Divider />
          <p className="font-heading mt-5 text-sm leading-[1.85] text-pretty text-[#E6DEC8]/85 sm:text-[15px]">
            {PAGE_DESCRIPTION} เรียบเรียงจาก{lore.headerShort}ของ ลอย กะ เธอ
            เว็บลอยกระทงออนไลน์ที่ให้คุณประดิษฐ์กระทงและโคมลอย แล้วใช้นิ้วมือหยิบปล่อยลงสายน้ำผ่านกล้อง
          </p>
          <div className="mt-6">
            <FloatCta label="ไปลอยกระทงออนไลน์" />
          </div>
        </header>

        <nav
          aria-label="สารบัญ"
          className="mt-10 border border-[#C5A059]/45 bg-[#13100C] px-5 py-4"
        >
          <h2 className="font-display text-sm font-medium tracking-wide text-[#F4D06F]">
            สารบัญ
          </h2>
          <ol className="font-heading mt-2 space-y-1.5 text-[13px] text-[#E6DEC8]/85 sm:text-sm">
            {lore.chapters.map((chapter) => (
              <li key={chapter.id}>
                <a
                  href={`#${chapter.id}`}
                  className="underline-offset-4 hover:text-[#FFF275] hover:underline"
                >
                  {chapter.num}. {chapter.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {lore.chapters.map((chapter) => (
          <section key={chapter.id} id={chapter.id} className="mt-14 scroll-mt-6">
            <header className="text-center">
              <p className="font-heading text-[11px] tracking-wide text-[#C5A059]">
                {chapter.sub}
              </p>
              <h2 className="font-display mt-1.5 text-xl font-medium tracking-wide text-balance text-[#F4D06F] sm:text-2xl">
                {chapter.title}
              </h2>
              <Divider />
            </header>

            <p className="font-display mt-5 border-l-2 border-[#C5A059]/70 pl-4 text-sm leading-relaxed text-pretty text-[#F5EFE4]/90 sm:text-[15px]">
              {chapter.lede}
            </p>

            <div className="mt-6 space-y-5">
              {chapter.sections.map((section) => (
                <section key={section.heading}>
                  <h3 className="font-display flex items-baseline gap-2.5 text-[15px] font-medium text-[#FFF275] sm:text-base">
                    <span
                      aria-hidden="true"
                      className="h-1.5 w-1.5 shrink-0 translate-y-[-2px] rotate-45 bg-[#C5A059]"
                    />
                    <span className="text-balance">{section.heading}</span>
                  </h3>
                  <p className="font-heading mt-1.5 pl-4 text-[13px] leading-[1.85] text-pretty text-[#E6DEC8]/85 sm:text-sm">
                    {section.body}
                  </p>
                </section>
              ))}
            </div>

            {chapter.note && (
              <aside className="mt-7 border border-dashed border-[#C5A059]/50 bg-[#13100C] px-4 py-3.5">
                <p className="font-heading text-[11px] tracking-wide text-[#F4D06F]">
                  {chapter.note.label}
                </p>
                <p className="font-heading mt-1 text-xs leading-relaxed text-pretty text-[#E6DEC8]/80 sm:text-[13px]">
                  {chapter.note.text}
                </p>
              </aside>
            )}
          </section>
        ))}

        <footer className="mt-16 border-t border-[#C5A059]/45 pt-8 text-center">
          <p className="font-display text-lg font-medium text-[#F4D06F]">
            ถึงคราวลอยกระทงของคุณแล้ว
          </p>
          <p className="font-heading mt-2 text-[13px] leading-relaxed text-[#E6DEC8]/80 sm:text-sm">
            ประดิษฐ์กระทงใบตองหรือโคมลอย จารึกคำอธิษฐาน แล้วลอยไปพร้อมคนที่คุณรัก
          </p>
          <div className="mt-5">
            <FloatCta label="เริ่มลอยกระทงออนไลน์" />
          </div>
        </footer>
      </article>
    </main>
  );
}
