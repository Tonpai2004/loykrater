export type ShareChannelId =
  | 'line'
  | 'facebook'
  | 'messenger'
  | 'whatsapp'
  | 'telegram'
  | 'x'
  | 'email';

export interface SharePayload {
  url: string;
  title: string;
  // Invite line that ends where the link should follow ("…ร่วมกันลอยได้ที่ <url>")
  text: string;
}

export type ShareLaunch =
  | { kind: 'open'; href: string; copyFirst?: boolean }
  | { kind: 'copy' };

const X_TEXT_LIMIT = 200;
const FACEBOOK_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID?.trim() ?? '';

export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(pointer: coarse)').matches ?? false;
}

// LINE / Facebook / Instagram / TikTok in-app browsers: file sharing and downloads are often blocked there
export function isInAppBrowser(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /\bLine\/|FBAN|FBAV|FB_IAB|Instagram|musical_ly|BytedanceWebview/i.test(
    navigator.userAgent
  );
}

export function canUseNativeShare(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
}

export function canShareImageFile(file: File): boolean {
  if (typeof navigator === 'undefined' || typeof navigator.canShare !== 'function') {
    return false;
  }
  try {
    return navigator.canShare({ files: [file] });
  } catch {
    return false;
  }
}

function truncate(text: string, limit: number): string {
  return text.length > limit ? `${text.slice(0, limit - 1).trimEnd()}…` : text;
}

// Where each button sends the visitor. Messenger has no web share URL without a Facebook App ID,
// so desktop falls back to copying the link for pasting into a chat.
export function resolveShareLaunch(
  channel: ShareChannelId,
  { url, title, text }: SharePayload
): ShareLaunch {
  const u = encodeURIComponent(url);
  const touch = isTouchDevice();

  switch (channel) {
    case 'line':
      return {
        kind: 'open',
        href: touch
          ? `https://line.me/R/share?text=${encodeURIComponent(`${text} ${url}`)}`
          : `https://social-plugins.line.me/lineit/share?url=${u}&text=${encodeURIComponent(text)}`,
      };
    case 'facebook':
      return { kind: 'open', href: `https://www.facebook.com/sharer/sharer.php?u=${u}` };
    case 'messenger':
      if (touch) {
        return { kind: 'open', href: `fb-messenger://share/?link=${u}`, copyFirst: true };
      }
      if (FACEBOOK_APP_ID) {
        return {
          kind: 'open',
          href: `https://www.facebook.com/dialog/send?app_id=${encodeURIComponent(FACEBOOK_APP_ID)}&link=${u}&redirect_uri=${u}`,
        };
      }
      return { kind: 'copy' };
    case 'whatsapp':
      return { kind: 'open', href: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}` };
    case 'telegram':
      return {
        kind: 'open',
        href: `https://t.me/share/url?url=${u}&text=${encodeURIComponent(text)}`,
      };
    case 'x':
      return {
        kind: 'open',
        href: `https://x.com/intent/tweet?text=${encodeURIComponent(truncate(text, X_TEXT_LIMIT))}&url=${u}`,
      };
    case 'email':
      return {
        kind: 'open',
        href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text} ${url}`)}`,
      };
  }
}

export function openShareTarget(href: string): void {
  if (typeof window === 'undefined') return;

  // App schemes and mailto must replace the location; web intents open in a popup on desktop, a tab on phones
  if (!/^https?:/i.test(href)) {
    window.location.href = href;
    return;
  }

  if (isTouchDevice()) {
    window.open(href, '_blank', 'noopener,noreferrer');
    return;
  }

  const width = 600;
  const height = 640;
  const left = Math.max(0, window.screenX + (window.outerWidth - width) / 2);
  const top = Math.max(0, window.screenY + (window.outerHeight - height) / 2);
  // "noopener" would make window.open return null, so detach the opener by hand to detect blocked popups
  const popup = window.open(
    href,
    'loykrater-share',
    `width=${width},height=${height},left=${left},top=${top}`
  );
  if (popup) {
    popup.opener = null;
  } else {
    window.open(href, '_blank', 'noopener,noreferrer');
  }
}

export async function copyText(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Clipboard API blocked (insecure context or in-app browser), use the legacy path below
  }

  if (typeof document === 'undefined') return false;
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand('copy');
    document.body.removeChild(textarea);
    return copied;
  } catch {
    return false;
  }
}

export function downloadBlob(blob: Blob, filename: string): void {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(objectUrl), 4000);
}
