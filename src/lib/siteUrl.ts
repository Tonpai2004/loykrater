const LOCAL_FALLBACK_URL = 'http://localhost:3000';

// Public address used in share links, QR codes and OG metadata.
// Order: explicit NEXT_PUBLIC_SITE_URL → the page the visitor is on → Vercel production domain → localhost
export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, '');

  if (typeof window !== 'undefined') return window.location.origin;

  const vercelProduction = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelProduction) return `https://${vercelProduction}`;

  return LOCAL_FALLBACK_URL;
}

// "https://loykrater.vercel.app/" → "loykrater.vercel.app" for printing on cards
export function getDisplayHost(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/+$/, '');
}
