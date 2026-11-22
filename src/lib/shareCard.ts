import QRCode from 'qrcode';
import {
  drawInteractiveSkyLantern,
  drawNightSkyAndMoon,
  drawProceduralKrathong,
  drawRiverSurface,
} from '@/lib/canvasRenderer';
import { getDisplayHost } from '@/lib/siteUrl';
import { DEFAULT_SLOT_PRESETS } from '@/constants/krathongDefaults';
import { Locale } from '@/constants/translations';
import { KrathongConfig, OfferingSlotConfig } from '@/types/krathong';

// 9:16 portrait, the native size for Instagram / Facebook / TikTok / LINE stories
export const STORY_CARD_WIDTH = 1080;
export const STORY_CARD_HEIGHT = 1920;

export interface StoryCardLabels {
  brand: string;
  dateLine: string;
  wishLabel: string;
  inviteHeadline: string;
  inviteSub: string;
  privateWish: string;
  moreWishes: (count: number) => string;
  cta: string;
  ctaSub: string;
}

export interface StoryCardContent {
  locale: Locale;
  // Empty → a general invitation card featuring the default offerings
  offerings: OfferingSlotConfig[];
  url: string;
  labels: StoryCardLabels;
}

const INK = '#1C1815';
const PAPER = '#F5EFE4';
const LACQUER = '#080B14';
const BRASS = '#D4AF37';
const WARM_GOLD = '#F4D06F';
const SOFT_YELLOW = '#FFF275';
const VERMILION = '#B83B2A';

// A calm, flattering frame of the 60fps scene (stars, lanterns and candle flicker are time-driven)
const SCENE_FRAME_TIME = 41_800;
const FONT_LOAD_TIMEOUT_MS = 2500;

const FRAME = { inset: 36, chamfer: 26 };
const SCENE = { x: 84, y: 244, w: 912, h: 856, chamfer: 22 };
const SLIP = { x: 120, y: 1140, w: 840, h: 318, chamfer: 16 };
const FOOTER = { y: 1500, qrSize: 224 };

// Normalised positions inside the scene window, per offering count (moon sits near 0.77, 0.18)
const KRATHONG_LAYOUTS: [number, number][][] = [
  [[0.5, 0.75]],
  [
    [0.32, 0.72],
    [0.66, 0.8],
  ],
  [
    [0.22, 0.71],
    [0.5, 0.81],
    [0.78, 0.71],
  ],
  [
    [0.18, 0.7],
    [0.4, 0.81],
    [0.62, 0.7],
    [0.84, 0.81],
  ],
  [
    [0.13, 0.71],
    [0.32, 0.82],
    [0.5, 0.7],
    [0.68, 0.82],
    [0.87, 0.71],
  ],
];
const KRATHONG_SCALES = [2.3, 1.85, 1.5, 1.25, 1.05];

const LANTERN_LAYOUTS: [number, number][][] = [
  [[0.36, 0.21]],
  [
    [0.28, 0.25],
    [0.52, 0.14],
  ],
  [
    [0.2, 0.27],
    [0.42, 0.14],
    [0.58, 0.3],
  ],
  [
    [0.14, 0.16],
    [0.32, 0.29],
    [0.48, 0.13],
    [0.6, 0.31],
  ],
  [
    [0.12, 0.15],
    [0.28, 0.3],
    [0.44, 0.13],
    [0.58, 0.3],
    [0.93, 0.34],
  ],
];
const LANTERN_SCALES = [1.5, 1.3, 1.12, 1.0, 0.92];

interface CardFonts {
  display: string;
  heading: string;
  wish: string;
  editorial: string;
}

function readFontFamily(variable: string, fallback: string): string {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim();
  return value ? `${value}, ${fallback}` : fallback;
}

function resolveFonts(): CardFonts {
  return {
    display: readFontFamily('--font-display', 'serif'),
    heading: readFontFamily('--font-heading', 'sans-serif'),
    wish: readFontFamily('--font-mali', 'cursive'),
    editorial: readFontFamily('--font-editorial', 'Georgia, serif'),
  };
}

// next/font only downloads a face once text needs it; canvas text doesn't trigger that, so ask explicitly
async function ensureFontsLoaded(fonts: CardFonts, sample: string): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts) return;
  const specs = [
    `400 40px ${fonts.display}`,
    `600 40px ${fonts.display}`,
    `400 40px ${fonts.heading}`,
    `600 40px ${fonts.heading}`,
    `400 40px ${fonts.wish}`,
    `600 40px ${fonts.editorial}`,
  ];
  const loads = Promise.all(
    specs.map((spec) => document.fonts.load(spec, sample).catch(() => []))
  );
  await Promise.race([
    loads,
    new Promise((resolve) => setTimeout(resolve, FONT_LOAD_TIMEOUT_MS)),
  ]);
}

function chamferPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  c: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + c, y);
  ctx.lineTo(x + w - c, y);
  ctx.lineTo(x + w, y + c);
  ctx.lineTo(x + w, y + h - c);
  ctx.lineTo(x + w - c, y + h);
  ctx.lineTo(x + c, y + h);
  ctx.lineTo(x, y + h - c);
  ctx.lineTo(x, y + c);
  ctx.closePath();
}

function drawDiamond(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string
): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.lineTo(x + r, y);
  ctx.lineTo(x, y + r);
  ctx.lineTo(x - r, y);
  ctx.closePath();
  ctx.fill();
}

// Deterministic film grain so every export of the same card looks identical
function drawGrain(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  let seed = 20251105;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  for (let i = 0; i < 14000; i++) {
    const light = random() > 0.5;
    ctx.fillStyle = light
      ? `rgba(255, 253, 247, ${0.018 + random() * 0.03})`
      : `rgba(0, 0, 0, ${0.04 + random() * 0.05})`;
    const size = 1 + random() * 1.6;
    ctx.fillRect(random() * width, random() * height, size, size);
  }
}

function segmentText(text: string, locale: Locale): string[] {
  const Segmenter = (Intl as typeof Intl & { Segmenter?: typeof Intl.Segmenter }).Segmenter;
  if (Segmenter) {
    const segmenter = new Segmenter(locale === 'th' ? 'th' : 'en', {
      granularity: 'word',
    });
    return Array.from(segmenter.segment(text), (part) => part.segment);
  }
  // Thai has no spaces between words; without Intl.Segmenter fall back to breaking anywhere
  return /[฀-๿]/.test(text) ? Array.from(text) : text.split(/(\s+)/);
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
  locale: Locale
): string[] {
  const lines: string[] = [];
  let current = '';

  for (const segment of segmentText(text, locale)) {
    const candidate = current + segment;
    if (ctx.measureText(candidate.trim()).width <= maxWidth || !current.trim()) {
      current = candidate;
      continue;
    }
    lines.push(current.trim());
    current = segment.trimStart();
    if (lines.length === maxLines) break;
  }
  if (lines.length < maxLines && current.trim()) lines.push(current.trim());

  const consumed = lines.join('').replace(/\s/g, '').length;
  if (consumed < text.replace(/\s/g, '').length && lines.length > 0) {
    let last = lines[lines.length - 1];
    while (last.length > 1 && ctx.measureText(`${last}…`).width > maxWidth) {
      last = last.slice(0, -1);
    }
    lines[lines.length - 1] = `${last.trimEnd()}…`;
  }
  return lines;
}

// Letter-spaced caps for Latin labels; Thai is drawn plainly because spacing detaches its vowel and tone marks
function drawSpacedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  y: number,
  spacing: number
): number {
  if (/[\u0E00-\u0E7F]/.test(text)) {
    ctx.textAlign = 'center';
    ctx.fillText(text, centerX, y);
    return ctx.measureText(text).width;
  }
  const chars = Array.from(text);
  const widths = chars.map((ch) => ctx.measureText(ch).width);
  const total =
    widths.reduce((sum, w) => sum + w, 0) + spacing * Math.max(0, chars.length - 1);
  let x = centerX - total / 2;
  ctx.textAlign = 'left';
  chars.forEach((ch, i) => {
    ctx.fillText(ch, x, y);
    x += widths[i] + spacing;
  });
  return total;
}

function slotToConfig(slot: OfferingSlotConfig): KrathongConfig {
  return {
    baseColor: slot.baseColor,
    flowerColor: slot.flowerColor,
    candleColor: slot.candleColor,
    baseStyle: slot.baseStyle,
    wishText: slot.wishText,
    authorName: slot.authorName,
    hideWish: slot.hideWish,
  };
}

function drawBackdrop(ctx: CanvasRenderingContext2D): void {
  const W = STORY_CARD_WIDTH;
  const H = STORY_CARD_HEIGHT;

  const base = ctx.createLinearGradient(0, 0, 0, H);
  base.addColorStop(0, '#0E1222');
  base.addColorStop(0.55, LACQUER);
  base.addColorStop(1, '#05070D');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, W, H);

  const halo = ctx.createRadialGradient(W * 0.5, H * 0.34, 40, W * 0.5, H * 0.34, W * 0.95);
  halo.addColorStop(0, 'rgba(244, 208, 111, 0.12)');
  halo.addColorStop(1, 'rgba(244, 208, 111, 0)');
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, W, H);

  // Outer lacquer-and-brass frame with a fine inner rule (the site's .thai-chamfer motif)
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.75)';
  chamferPath(ctx, FRAME.inset, FRAME.inset, W - FRAME.inset * 2, H - FRAME.inset * 2, FRAME.chamfer);
  ctx.stroke();

  const inner = FRAME.inset + 12;
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.32)';
  chamferPath(ctx, inner, inner, W - inner * 2, H - inner * 2, FRAME.chamfer - 6);
  ctx.stroke();

  const corner = FRAME.inset + FRAME.chamfer / 2;
  [
    [corner, corner],
    [W - corner, corner],
    [corner, H - corner],
    [W - corner, H - corner],
  ].forEach(([x, y]) => drawDiamond(ctx, x, y, 7, BRASS));
}

function drawHeader(ctx: CanvasRenderingContext2D, fonts: CardFonts, labels: StoryCardLabels): void {
  const cx = STORY_CARD_WIDTH / 2;

  ctx.fillStyle = WARM_GOLD;
  ctx.font = `600 38px ${fonts.editorial}`;
  ctx.textBaseline = 'alphabetic';
  const brandWidth = drawSpacedText(ctx, labels.brand, cx, 146, 14);

  const gap = 30;
  const ruleLength = 150;
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.6)';
  ctx.lineWidth = 1.5;
  [-1, 1].forEach((dir) => {
    const start = cx + dir * (brandWidth / 2 + gap);
    ctx.beginPath();
    ctx.moveTo(start, 133);
    ctx.lineTo(start + dir * ruleLength, 133);
    ctx.stroke();
    drawDiamond(ctx, start + dir * (ruleLength + 10), 133, 5, BRASS);
  });

  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(244, 208, 111, 0.82)';
  ctx.font = `400 30px ${fonts.heading}`;
  ctx.fillText(labels.dateLine, cx, 202);
}

function drawScene(ctx: CanvasRenderingContext2D, offerings: OfferingSlotConfig[]): void {
  const { x, y, w, h, chamfer } = SCENE;

  ctx.save();
  chamferPath(ctx, x, y, w, h, chamfer);
  ctx.clip();
  ctx.translate(x, y);

  drawNightSkyAndMoon(ctx, w, h, SCENE_FRAME_TIME);
  drawRiverSurface(ctx, w, h, SCENE_FRAME_TIME);

  const lanterns = offerings.filter((slot) => slot.itemType === 'lantern').slice(0, 5);
  const krathongs = offerings.filter((slot) => slot.itemType !== 'lantern').slice(0, 5);

  lanterns.forEach((slot, i) => {
    const [nx, ny] = LANTERN_LAYOUTS[lanterns.length - 1][i];
    drawInteractiveSkyLantern({
      ctx,
      x: nx * w,
      y: ny * h,
      scale: LANTERN_SCALES[lanterns.length - 1],
      config: slotToConfig(slot),
      time: SCENE_FRAME_TIME,
      showWishTag: false,
    });
  });

  // Paint back-to-front so nearer krathongs overlap farther ones
  krathongs
    .map((slot, i) => ({ slot, pos: KRATHONG_LAYOUTS[krathongs.length - 1][i] }))
    .sort((a, b) => a.pos[1] - b.pos[1])
    .forEach(({ slot, pos }) => {
      drawProceduralKrathong({
        ctx,
        x: pos[0] * w,
        y: pos[1] * h,
        scale: KRATHONG_SCALES[krathongs.length - 1],
        config: slotToConfig(slot),
        time: SCENE_FRAME_TIME,
        showWishTag: false,
      });
    });

  const vignette = ctx.createRadialGradient(w / 2, h * 0.5, h * 0.3, w / 2, h * 0.5, h * 0.78);
  vignette.addColorStop(0, 'rgba(5, 7, 13, 0)');
  vignette.addColorStop(1, 'rgba(5, 7, 13, 0.55)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();

  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.85)';
  chamferPath(ctx, x, y, w, h, chamfer);
  ctx.stroke();

  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(255, 242, 117, 0.25)';
  chamferPath(ctx, x + 10, y + 10, w - 20, h - 20, chamfer - 5);
  ctx.stroke();
}

function drawPaperSlip(ctx: CanvasRenderingContext2D): void {
  const { x, y, w, h, chamfer } = SLIP;

  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 14;
  ctx.fillStyle = PAPER;
  chamferPath(ctx, x, y, w, h, chamfer);
  ctx.fill();
  ctx.restore();

  // Mulberry-paper fibre dots and a soft top sheen, mirroring .saa-paper-card
  ctx.save();
  chamferPath(ctx, x, y, w, h, chamfer);
  ctx.clip();
  ctx.fillStyle = 'rgba(184, 59, 42, 0.05)';
  for (let px = x + 9; px < x + w; px += 18) {
    for (let py = y + 9; py < y + h; py += 18) {
      ctx.fillRect(px, py, 1.6, 1.6);
    }
  }
  const sheen = ctx.createLinearGradient(0, y, 0, y + h);
  sheen.addColorStop(0, 'rgba(255, 253, 247, 0.55)');
  sheen.addColorStop(1, 'rgba(235, 224, 204, 0.5)');
  ctx.fillStyle = sheen;
  ctx.fillRect(x, y, w, h);
  ctx.restore();

  ctx.lineWidth = 1.5;
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.9)';
  chamferPath(ctx, x + 10, y + 10, w - 20, h - 20, chamfer - 4);
  ctx.stroke();
}

function drawWishContent(
  ctx: CanvasRenderingContext2D,
  fonts: CardFonts,
  content: StoryCardContent
): void {
  const { labels, locale, offerings } = content;
  const cx = SLIP.x + SLIP.w / 2;
  const textWidth = SLIP.w - 150;

  ctx.textAlign = 'center';
  ctx.fillStyle = VERMILION;
  ctx.font = `600 24px ${fonts.heading}`;

  if (offerings.length === 0) {
    drawSpacedText(ctx, labels.wishLabel, cx, SLIP.y + 62, 3);
    ctx.textAlign = 'center';
    ctx.fillStyle = INK;
    ctx.font = `600 58px ${fonts.display}`;
    const headline = wrapText(ctx, labels.inviteHeadline, textWidth, 2, locale);
    ctx.font = `400 28px ${fonts.heading}`;
    const sub = wrapText(ctx, labels.inviteSub, textWidth, 2, locale);

    // Centre headline + sub line(s) in the space under the label
    const blockHeight = headline.length * 70 + 14 + sub.length * 40;
    const regionTop = SLIP.y + 92;
    const regionHeight = SLIP.h - 92 - 24;
    const blockTop = regionTop + Math.max(0, (regionHeight - blockHeight) / 2);

    ctx.fillStyle = INK;
    ctx.font = `600 58px ${fonts.display}`;
    headline.forEach((line, i) => ctx.fillText(line, cx, blockTop + 54 + i * 70));
    ctx.fillStyle = 'rgba(28, 24, 21, 0.72)';
    ctx.font = `400 28px ${fonts.heading}`;
    const subTop = blockTop + headline.length * 70 + 14 + 30;
    sub.forEach((line, i) => ctx.fillText(line, cx, subTop + i * 40));
    return;
  }

  const visible = offerings.filter((slot) => !slot.hideWish && slot.wishText.trim());
  const featured = visible[0];
  const names = Array.from(
    new Set(offerings.map((slot) => slot.authorName.trim()).filter(Boolean))
  ).join(', ');

  drawSpacedText(ctx, labels.wishLabel, cx, SLIP.y + 62, 3);
  ctx.textAlign = 'center';

  let lines: string[];
  let lineHeight: number;
  if (featured) {
    ctx.fillStyle = INK;
    ctx.font = `400 56px ${fonts.wish}`;
    lineHeight = 74;
    lines = wrapText(ctx, `“${featured.wishText.trim()}”`, textWidth, 2, locale);
  } else {
    ctx.fillStyle = 'rgba(28, 24, 21, 0.62)';
    ctx.font = `italic 400 40px ${fonts.wish}`;
    lineHeight = 56;
    lines = wrapText(ctx, labels.privateWish, textWidth, 2, locale);
  }

  const hasFooterLine = Boolean(names) || visible.length > 1;
  const blockHeight = lines.length * lineHeight;
  const available = SLIP.h - 92 - (hasFooterLine ? 58 : 18);
  const top = SLIP.y + 92 + Math.max(0, (available - blockHeight) / 2) + lineHeight * 0.78;
  lines.forEach((line, i) => ctx.fillText(line, cx, top + i * lineHeight));

  if (hasFooterLine) {
    const parts: string[] = [];
    if (names) parts.push(`— ${names}`);
    if (visible.length > 1) parts.push(labels.moreWishes(visible.length - 1));
    ctx.fillStyle = 'rgba(28, 24, 21, 0.7)';
    ctx.font = `500 28px ${fonts.heading}`;
    const footerLine = wrapText(ctx, parts.join('  ·  '), textWidth, 1, locale)[0];
    ctx.fillText(footerLine, cx, SLIP.y + SLIP.h - 40);
  }

}

function drawQrBlock(
  ctx: CanvasRenderingContext2D,
  url: string,
  x: number,
  y: number,
  size: number
): void {
  ctx.fillStyle = PAPER;
  chamferPath(ctx, x, y, size, size, 12);
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = BRASS;
  chamferPath(ctx, x - 8, y - 8, size + 16, size + 16, 16);
  ctx.stroke();

  const qr = QRCode.create(url, { errorCorrectionLevel: 'M' });
  const count = qr.modules.size;
  const padding = 16;
  const cell = (size - padding * 2) / count;
  ctx.fillStyle = INK;
  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (qr.modules.get(row, col)) {
        // Slight overdraw avoids hairline gaps between modules when scaled
        ctx.fillRect(
          x + padding + col * cell,
          y + padding + row * cell,
          cell + 0.6,
          cell + 0.6
        );
      }
    }
  }
}

function drawFooter(
  ctx: CanvasRenderingContext2D,
  fonts: CardFonts,
  content: StoryCardContent
): void {
  const { labels, url, locale } = content;
  const qrX = SLIP.x + 8;
  const qrY = FOOTER.y + 8;
  drawQrBlock(ctx, url, qrX, qrY, FOOTER.qrSize);

  const textX = qrX + FOOTER.qrSize + 48;
  const textWidth = SLIP.x + SLIP.w - textX;

  ctx.textAlign = 'left';
  ctx.fillStyle = SOFT_YELLOW;
  ctx.font = `600 46px ${fonts.display}`;
  const ctaLines = wrapText(ctx, labels.cta, textWidth, 2, locale);
  ctaLines.forEach((line, i) => ctx.fillText(line, textX, qrY + 52 + i * 58));

  let cursorY = qrY + 52 + (ctaLines.length - 1) * 58 + 50;
  ctx.fillStyle = 'rgba(255, 253, 247, 0.72)';
  ctx.font = `400 27px ${fonts.heading}`;
  wrapText(ctx, labels.ctaSub, textWidth, 2, locale).forEach((line) => {
    ctx.fillText(line, textX, cursorY);
    cursorY += 38;
  });

  // Link pill
  const host = getDisplayHost(url);
  ctx.font = `600 28px ${fonts.heading}`;
  const pillY = qrY + FOOTER.qrSize - 54;
  const pillWidth = Math.min(textWidth, ctx.measureText(host).width + 76);
  ctx.fillStyle = 'rgba(212, 175, 55, 0.14)';
  chamferPath(ctx, textX, pillY, pillWidth, 54, 10);
  ctx.fill();
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.7)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.strokeStyle = WARM_GOLD;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(textX + 22, pillY + 36);
  ctx.lineTo(textX + 36, pillY + 22);
  ctx.moveTo(textX + 26, pillY + 21);
  ctx.lineTo(textX + 37, pillY + 21);
  ctx.lineTo(textX + 37, pillY + 32);
  ctx.stroke();

  ctx.fillStyle = WARM_GOLD;
  ctx.fillText(
    wrapText(ctx, host, pillWidth - 64, 1, 'en')[0] ?? host,
    textX + 52,
    pillY + 37
  );
}

export async function renderStoryCard(content: StoryCardContent): Promise<Blob> {
  const offerings =
    content.offerings.length > 0
      ? content.offerings
      : DEFAULT_SLOT_PRESETS.slice(0, 3).map((preset, i) => ({
          ...preset,
          id: `invite-${i}`,
        }));

  const fonts = resolveFonts();
  const sample = [
    content.labels.brand,
    content.labels.dateLine,
    content.labels.inviteHeadline,
    content.labels.cta,
    ...content.offerings.map((slot) => slot.wishText),
    'ลอยกระทงAa',
  ].join(' ');
  await ensureFontsLoaded(fonts, sample);

  const canvas = document.createElement('canvas');
  canvas.width = STORY_CARD_WIDTH;
  canvas.height = STORY_CARD_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D is unavailable');

  drawBackdrop(ctx);
  drawHeader(ctx, fonts, content.labels);
  drawScene(ctx, offerings);
  // Grain goes under the paper slip and QR so the code stays crisp for scanners
  drawGrain(ctx, STORY_CARD_WIDTH, STORY_CARD_HEIGHT);
  drawPaperSlip(ctx);
  drawWishContent(ctx, fonts, content);
  drawFooter(ctx, fonts, content);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Card export failed'))),
      'image/png'
    );
  });
}
