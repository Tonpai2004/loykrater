import {
  HandGestureState,
  KrathongConfig,
  NormalizedPoint,
  StageItem,
  TrackedHand,
} from '@/types/krathong';

export const RIVER_HORIZON_RATIO = 0.45;
export const RIVER_DROP_ZONE_MIN_Y = 0.54;
export const RIVER_DROP_ZONE_MAX_Y = 0.92;

export const RIVER_SPOT_TARGETS: NormalizedPoint[] = [
  { x: 0.16, y: 0.72 },
  { x: 0.33, y: 0.8 },
  { x: 0.5, y: 0.76 },
  { x: 0.67, y: 0.81 },
  { x: 0.84, y: 0.73 },
];

export const SKY_LANTERN_TARGETS: NormalizedPoint[] = [
  { x: 0.24, y: 0.22 },
  { x: 0.42, y: 0.19 },
  { x: 0.58, y: 0.19 },
  { x: 0.76, y: 0.22 },
];

export const SPOT_HIT_RADIUS_RATIO = 0.095;

export interface SparkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  color: string;
}

export interface RenderKrathongParams {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  scale: number;
  config: KrathongConfig;
  time: number;
  isHighlighted?: boolean;
  showWishTag?: boolean;
  opacity?: number;
  ownerLabel?: string;
  wishOverride?: string;
}

interface SkyLantern {
  seedX: number;
  seedY: number;
  speedY: number;
  swaySpeed: number;
  scale: number;
}

const SKY_LANTERNS: SkyLantern[] = [
  { seedX: 0.12, seedY: 0.85, speedY: 0.000018, swaySpeed: 0.0012, scale: 0.65 },
  { seedX: 0.27, seedY: 0.45, speedY: 0.000012, swaySpeed: 0.0009, scale: 0.45 },
  { seedX: 0.44, seedY: 0.72, speedY: 0.000022, swaySpeed: 0.0015, scale: 0.85 },
  { seedX: 0.61, seedY: 0.35, speedY: 0.000014, swaySpeed: 0.0011, scale: 0.52 },
  { seedX: 0.86, seedY: 0.68, speedY: 0.000019, swaySpeed: 0.0013, scale: 0.72 },
  { seedX: 0.93, seedY: 0.28, speedY: 0.000011, swaySpeed: 0.0008, scale: 0.4 },
];

function hexToRgba(hex: string, alpha: number): string {
  const sanitized = hex.replace('#', '');
  const bigint = parseInt(
    sanitized.length === 3
      ? sanitized
          .split('')
          .map((c) => c + c)
          .join('')
      : sanitized,
    16
  );
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const krathongSpriteCache = new Map<string, HTMLCanvasElement>();
const lanternSpriteCache = new Map<string, HTMLCanvasElement>();
const wishWidthCache = new Map<string, number>();

const CANVAS_STARS = Array.from({ length: 34 }, (_, i) => ({
  rx: ((i * 37.3 + 11) % 96) / 100 + 0.02,
  ry: ((i * 61.7 + 7) % 38) / 100 + 0.03,
  size: i % 4 === 0 ? 3.2 : i % 2 === 0 ? 2.2 : 1.6,
  speed: 0.0018 + (i % 4) * 0.0005,
  phase: i * 1.7,
}));

function getOrCreateKrathongSprite(config: KrathongConfig): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;

  const key = `${config.baseStyle}|${config.baseColor}|${config.flowerColor}|${config.candleColor}`;
  const cached = krathongSpriteCache.get(key);
  if (cached) return cached;

  const sprite = document.createElement('canvas');
  const scale = 2;
  const w = 148;
  const h = 112;
  sprite.width = w * scale;
  sprite.height = h * scale;

  const sCtx = sprite.getContext('2d');
  if (!sCtx) return null;

  sCtx.scale(scale, scale);
  sCtx.translate(w / 2, 72);

  sCtx.fillStyle = 'rgba(13, 19, 33, 0.38)';
  sCtx.beginPath();
  sCtx.ellipse(0, 18, 54, 18, 0, 0, Math.PI * 2);
  sCtx.fill();

  sCtx.fillStyle = '#1B4332';
  sCtx.beginPath();
  sCtx.ellipse(0, 15, 53, 18, 0, 0, Math.PI * 2);
  sCtx.fill();

  sCtx.fillStyle = config.baseColor;
  sCtx.beginPath();
  sCtx.ellipse(0, 10, 51, 17, 0, 0, Math.PI * 2);
  sCtx.fill();

  sCtx.fillStyle = 'rgba(255, 242, 117, 0.22)';
  sCtx.beginPath();
  sCtx.ellipse(0, 8, 44, 13, 0, 0, Math.PI * 2);
  sCtx.fill();

  const petalCount =
    config.baseStyle === 'layered-star'
      ? 14
      : config.baseStyle === 'royal-pleat'
      ? 12
      : 10;

  for (let ring = 0; ring < 2; ring++) {
    const ringRadiusX = ring === 0 ? 48 : 35;
    const ringRadiusY = ring === 0 ? 17 : 12;
    const petalHeight = ring === 0 ? 30 : 23;

    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2 + ring * (Math.PI / petalCount);
      const px = Math.cos(angle) * ringRadiusX;
      const py = Math.sin(angle) * ringRadiusY;

      sCtx.save();
      sCtx.translate(px, py);
      sCtx.rotate(Math.cos(angle) * 0.24);

      sCtx.fillStyle = 'rgba(13, 19, 33, 0.26)';
      sCtx.beginPath();
      sCtx.moveTo(-12, 7);
      sCtx.lineTo(0, -petalHeight + 2);
      sCtx.lineTo(12, 7);
      sCtx.closePath();
      sCtx.fill();

      sCtx.fillStyle = ring === 0 ? config.baseColor : '#40916C';
      sCtx.beginPath();
      if (config.baseStyle === 'layered-star') {
        sCtx.moveTo(-11, 5);
        sCtx.lineTo(0, -petalHeight);
        sCtx.lineTo(11, 5);
      } else if (config.baseStyle === 'royal-pleat') {
        sCtx.moveTo(-12, 5);
        sCtx.lineTo(-9, -petalHeight * 0.65);
        sCtx.lineTo(0, -petalHeight);
        sCtx.lineTo(9, -petalHeight * 0.65);
        sCtx.lineTo(12, 5);
      } else {
        sCtx.moveTo(-12, 5);
        sCtx.quadraticCurveTo(-10, -petalHeight * 0.55, 0, -petalHeight);
        sCtx.quadraticCurveTo(10, -petalHeight * 0.55, 12, 5);
      }
      sCtx.closePath();
      sCtx.fill();

      sCtx.fillStyle = 'rgba(255, 242, 117, 0.16)';
      sCtx.beginPath();
      sCtx.moveTo(0, -petalHeight);
      if (config.baseStyle === 'layered-star') {
        sCtx.lineTo(11, 5);
      } else if (config.baseStyle === 'royal-pleat') {
        sCtx.lineTo(9, -petalHeight * 0.65);
        sCtx.lineTo(12, 5);
      } else {
        sCtx.quadraticCurveTo(10, -petalHeight * 0.55, 12, 5);
      }
      sCtx.lineTo(0, 5);
      sCtx.closePath();
      sCtx.fill();

      sCtx.fillStyle = 'rgba(244, 208, 111, 0.34)';
      sCtx.beginPath();
      sCtx.moveTo(0, -petalHeight * 0.88);
      sCtx.lineTo(4.5, -petalHeight * 0.35);
      sCtx.lineTo(0, -petalHeight * 0.18);
      sCtx.lineTo(-4.5, -petalHeight * 0.35);
      sCtx.closePath();
      sCtx.fill();

      sCtx.restore();
    }
  }

  const flowerCount = 7;
  for (let i = 0; i < flowerCount; i++) {
    const angle = (i / flowerCount) * Math.PI * 2 + 0.25;
    const fx = Math.cos(angle) * 26;
    const fy = Math.sin(angle) * 9 - 4;

    sCtx.save();
    sCtx.translate(fx, fy);

    for (let p = 0; p < 5; p++) {
      const pAngle = (p / 5) * Math.PI * 2;
      sCtx.save();
      sCtx.rotate(pAngle);

      sCtx.fillStyle = config.flowerColor;
      sCtx.beginPath();
      sCtx.moveTo(0, 0);
      sCtx.lineTo(-4.5, -6);
      sCtx.lineTo(0, -11);
      sCtx.lineTo(4.5, -6);
      sCtx.closePath();
      sCtx.fill();

      sCtx.fillStyle = 'rgba(255, 255, 255, 0.28)';
      sCtx.beginPath();
      sCtx.moveTo(0, -3);
      sCtx.lineTo(3, -6);
      sCtx.lineTo(0, -10);
      sCtx.closePath();
      sCtx.fill();

      sCtx.restore();
    }

    sCtx.fillStyle = '#F4D06F';
    sCtx.beginPath();
    sCtx.moveTo(0, -4);
    sCtx.lineTo(4, 0);
    sCtx.lineTo(0, 4);
    sCtx.lineTo(-4, 0);
    sCtx.closePath();
    sCtx.fill();
    sCtx.restore();
  }

  const incenseOffsets = [-7, 0, 7];
  incenseOffsets.forEach((offsetX) => {
    sCtx.fillStyle = '#8D5B4C';
    sCtx.beginPath();
    sCtx.moveTo(offsetX * 0.45 - 1, -7);
    sCtx.lineTo(offsetX * 0.45 + 1, -7);
    sCtx.lineTo(offsetX + 0.8, -46);
    sCtx.lineTo(offsetX - 0.8, -46);
    sCtx.closePath();
    sCtx.fill();

    sCtx.fillStyle = '#FF8C42';
    sCtx.beginPath();
    sCtx.arc(offsetX, -46, 2, 0, Math.PI * 2);
    sCtx.fill();
  });

  sCtx.fillStyle = config.candleColor;
  sCtx.beginPath();
  sCtx.roundRect(-5, -40, 10, 33, 3);
  sCtx.fill();

  sCtx.fillStyle = 'rgba(255, 255, 255, 0.32)';
  sCtx.beginPath();
  sCtx.roundRect(-5, -40, 5, 33, 3);
  sCtx.fill();

  if (krathongSpriteCache.size > 40) {
    const firstKey = krathongSpriteCache.keys().next().value;
    if (firstKey) krathongSpriteCache.delete(firstKey);
  }
  krathongSpriteCache.set(key, sprite);
  return sprite;
}

function getOrCreateLanternSprite(config: KrathongConfig): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;

  const key = `lantern|${config.baseStyle}|${config.baseColor}|${config.flowerColor}|${config.candleColor}`;
  const cached = lanternSpriteCache.get(key);
  if (cached) return cached;

  const sprite = document.createElement('canvas');
  const scale = 2;
  const w = 136;
  const h = 156;
  sprite.width = w * scale;
  sprite.height = h * scale;

  const sCtx = sprite.getContext('2d');
  if (!sCtx) return null;

  sCtx.scale(scale, scale);
  sCtx.translate(w / 2, 78);

  // Outer warm glow halo
  sCtx.fillStyle = 'rgba(244, 208, 111, 0.16)';
  sCtx.beginPath();
  sCtx.arc(0, -6, 52, 0, Math.PI * 2);
  sCtx.fill();

  // Main paper lantern silhouette (Lanna Khom Loi shape)
  sCtx.fillStyle = '#FF8C42';
  sCtx.beginPath();
  sCtx.moveTo(-24, -48);
  sCtx.lineTo(24, -48);
  sCtx.lineTo(36, -12);
  sCtx.lineTo(24, 34);
  sCtx.lineTo(-24, 34);
  sCtx.lineTo(-36, -12);
  sCtx.closePath();
  sCtx.fill();

  // Cel-shaded lit right half
  sCtx.fillStyle = config.candleColor;
  sCtx.beginPath();
  sCtx.moveTo(0, -48);
  sCtx.lineTo(24, -48);
  sCtx.lineTo(36, -12);
  sCtx.lineTo(24, 34);
  sCtx.lineTo(0, 34);
  sCtx.closePath();
  sCtx.fill();

  // Inner bright core panel
  sCtx.fillStyle = 'rgba(255, 242, 117, 0.48)';
  sCtx.beginPath();
  sCtx.moveTo(-14, -44);
  sCtx.lineTo(14, -44);
  sCtx.lineTo(22, -12);
  sCtx.lineTo(14, 30);
  sCtx.lineTo(-14, 30);
  sCtx.lineTo(-22, -12);
  sCtx.closePath();
  sCtx.fill();

  // Top & bottom decorative paper-cut bands using baseColor
  sCtx.fillStyle = config.baseColor;
  sCtx.beginPath();
  sCtx.moveTo(-25, -48);
  sCtx.lineTo(25, -48);
  sCtx.lineTo(28, -39);
  sCtx.lineTo(-28, -39);
  sCtx.closePath();
  sCtx.fill();

  sCtx.beginPath();
  sCtx.moveTo(-26, 26);
  sCtx.lineTo(26, 26);
  sCtx.lineTo(24, 34);
  sCtx.lineTo(-24, 34);
  sCtx.closePath();
  sCtx.fill();

  // Center Lanna geometric flower emblem on the lantern paper
  sCtx.save();
  sCtx.translate(0, -10);
  const emblemPetals = config.baseStyle === 'layered-star' ? 8 : 6;
  for (let i = 0; i < emblemPetals; i++) {
    sCtx.save();
    sCtx.rotate((i / emblemPetals) * Math.PI * 2);
    sCtx.fillStyle = config.flowerColor;
    sCtx.beginPath();
    sCtx.moveTo(0, 0);
    sCtx.lineTo(-4.5, -9);
    sCtx.lineTo(0, -16);
    sCtx.lineTo(4.5, -9);
    sCtx.closePath();
    sCtx.fill();
    sCtx.restore();
  }
  sCtx.fillStyle = '#FFF275';
  sCtx.beginPath();
  sCtx.moveTo(0, -5);
  sCtx.lineTo(5, 0);
  sCtx.lineTo(0, 5);
  sCtx.lineTo(-5, 0);
  sCtx.closePath();
  sCtx.fill();
  sCtx.restore();

  // Hanging paper tassels at the bottom corners
  [-18, 18].forEach((tx) => {
    sCtx.fillStyle = config.flowerColor;
    sCtx.beginPath();
    sCtx.moveTo(tx - 2.5, 34);
    sCtx.lineTo(tx + 2.5, 34);
    sCtx.lineTo(tx + 4, 48);
    sCtx.lineTo(tx, 44);
    sCtx.lineTo(tx - 4, 48);
    sCtx.closePath();
    sCtx.fill();
  });

  // Bamboo rim at bottom opening
  sCtx.strokeStyle = '#8D5B4C';
  sCtx.lineWidth = 2.4;
  sCtx.beginPath();
  sCtx.ellipse(0, 34, 24, 5, 0, 0, Math.PI * 2);
  sCtx.stroke();

  if (lanternSpriteCache.size > 40) {
    const firstKey = lanternSpriteCache.keys().next().value;
    if (firstKey) lanternSpriteCache.delete(firstKey);
  }
  lanternSpriteCache.set(key, sprite);
  return sprite;
}

function drawWishSlipTag(
  ctx: CanvasRenderingContext2D,
  wishText: string,
  authorName: string,
  slipY: number
): void {
  const truncatedWish =
    wishText.length > 34 ? `${wishText.slice(0, 34)}...` : wishText;
  const authorLabel = authorName.trim() || 'ลอยกะเธอ • Loikratur';

  let textWidth = wishWidthCache.get(truncatedWish);
  if (textWidth === undefined) {
    ctx.font = '400 13.5px Charm, cursive, serif';
    textWidth = Math.max(ctx.measureText(truncatedWish).width, 108);
    wishWidthCache.set(truncatedWish, textWidth);
  }

  const slipW = textWidth + 38;
  const slipH = 44;
  const halfW = slipW / 2;
  const cut = 7;

  // Royal Indigo & Gold-Leaf slip with Thai chamfered corners
  ctx.fillStyle = 'rgba(16, 20, 42, 0.92)';
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.7)';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(-halfW + cut, slipY);
  ctx.lineTo(halfW - cut, slipY);
  ctx.lineTo(halfW, slipY + cut);
  ctx.lineTo(halfW, slipY + slipH - cut);
  ctx.lineTo(halfW - cut, slipY + slipH);
  ctx.lineTo(-halfW + cut, slipY + slipH);
  ctx.lineTo(-halfW, slipY + slipH - cut);
  ctx.lineTo(-halfW, slipY + cut);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Gold & Vermilion top eyelet seal
  ctx.fillStyle = '#F4D06F';
  ctx.beginPath();
  ctx.moveTo(0, slipY - 4);
  ctx.lineTo(4, slipY);
  ctx.lineTo(0, slipY + 4);
  ctx.lineTo(-4, slipY);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#F4D06F';
  ctx.font = '600 10.5px "Bai Jamjuree", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(authorLabel, 0, slipY + 16);

  ctx.fillStyle = '#FFFDF7';
  ctx.font = '400 13.5px Charm, cursive, serif';
  ctx.fillText(`“${truncatedWish}”`, 0, slipY + 34);
}

function drawCelShadedLantern(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  time: number,
  index: number
): void {
  const tilt = Math.sin(time * 0.0015 + index * 1.7) * 0.08;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);
  ctx.scale(scale, scale);

  ctx.fillStyle = 'rgba(244, 208, 111, 0.14)';
  ctx.beginPath();
  ctx.arc(0, 2, 26, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FF8C42';
  ctx.beginPath();
  ctx.moveTo(-10, -16);
  ctx.lineTo(10, -16);
  ctx.lineTo(14, -2);
  ctx.lineTo(9, 15);
  ctx.lineTo(-9, 15);
  ctx.lineTo(-14, -2);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#F4D06F';
  ctx.beginPath();
  ctx.moveTo(0, -16);
  ctx.lineTo(10, -16);
  ctx.lineTo(14, -2);
  ctx.lineTo(9, 15);
  ctx.lineTo(0, 15);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#FFF275';
  ctx.beginPath();
  ctx.moveTo(0, 6);
  ctx.lineTo(5, 12);
  ctx.lineTo(0, 17);
  ctx.lineTo(-5, 12);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawPaperCutTempleSilhouette(
  ctx: CanvasRenderingContext2D,
  baseX: number,
  horizonY: number
): void {
  ctx.save();
  ctx.translate(baseX, horizonY);
  ctx.fillStyle = '#11152C';

  ctx.beginPath();
  ctx.moveTo(-48, 0);
  ctx.lineTo(-34, -18);
  ctx.lineTo(-16, -18);
  ctx.lineTo(0, -78);
  ctx.lineTo(16, -18);
  ctx.lineTo(34, -18);
  ctx.lineTo(48, 0);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#191E3D';
  ctx.beginPath();
  ctx.moveTo(0, -78);
  ctx.lineTo(16, -18);
  ctx.lineTo(0, -18);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#F4D06F';
  ctx.beginPath();
  ctx.moveTo(0, -86);
  ctx.lineTo(3.5, -79);
  ctx.lineTo(0, -72);
  ctx.lineTo(-3.5, -79);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

export function drawNightSkyAndMoon(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number
): void {
  const horizonY = height * RIVER_HORIZON_RATIO;

  ctx.fillStyle = '#0D1321';
  ctx.fillRect(0, 0, width, horizonY + 4);

  ctx.fillStyle = '#131832';
  ctx.beginPath();
  ctx.moveTo(0, horizonY * 0.32);
  ctx.lineTo(width * 0.28, horizonY * 0.22);
  ctx.lineTo(width * 0.62, horizonY * 0.36);
  ctx.lineTo(width, horizonY * 0.25);
  ctx.lineTo(width, horizonY + 4);
  ctx.lineTo(0, horizonY + 4);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#1A1B41';
  ctx.beginPath();
  ctx.moveTo(0, horizonY * 0.58);
  ctx.lineTo(width * 0.22, horizonY * 0.48);
  ctx.lineTo(width * 0.54, horizonY * 0.64);
  ctx.lineTo(width * 0.84, horizonY * 0.5);
  ctx.lineTo(width, horizonY * 0.56);
  ctx.lineTo(width, horizonY + 4);
  ctx.lineTo(0, horizonY + 4);
  ctx.closePath();
  ctx.fill();

  for (let i = 0; i < CANVAS_STARS.length; i++) {
    const star = CANVAS_STARS[i];
    const twinkle = 0.35 + 0.65 * Math.abs(Math.sin(time * star.speed + star.phase));
    const sx = star.rx * width;
    const sy = star.ry * height;
    const r = star.size * twinkle;

    ctx.fillStyle = `rgba(255, 242, 117, ${twinkle * 0.85})`;
    ctx.beginPath();
    ctx.moveTo(sx, sy - r);
    ctx.lineTo(sx + r, sy);
    ctx.lineTo(sx, sy + r);
    ctx.lineTo(sx - r, sy);
    ctx.closePath();
    ctx.fill();
  }

  const moonX = width * 0.77;
  const moonY = horizonY * 0.4;
  const moonRadius = Math.max(14, Math.min(width, height) * 0.072);

  ctx.fillStyle = 'rgba(244, 208, 111, 0.06)';
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonRadius * 2.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(244, 208, 111, 0.13)';
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonRadius * 1.75, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#F4D06F';
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFF275';
  ctx.beginPath();
  ctx.arc(
    moonX - moonRadius * 0.14,
    moonY - moonRadius * 0.12,
    moonRadius * 0.82,
    0,
    Math.PI * 2
  );
  ctx.fill();

  SKY_LANTERNS.forEach((lantern, idx) => {
    const progressY = (lantern.seedY - time * lantern.speedY) % 1;
    const wrappedY = progressY < 0 ? progressY + 1 : progressY;
    const ly = wrappedY * (horizonY * 0.92);
    const lx =
      lantern.seedX * width +
      Math.sin(time * lantern.swaySpeed + idx * 2.1) * 28 * lantern.scale;

    drawCelShadedLantern(ctx, lx, ly, lantern.scale, time, idx);
  });

  drawPaperCutTempleSilhouette(ctx, width * 0.18, horizonY);

  ctx.fillStyle = '#12152E';
  ctx.beginPath();
  ctx.moveTo(0, horizonY);
  ctx.lineTo(width * 0.14, horizonY - 22);
  ctx.lineTo(width * 0.31, horizonY - 8);
  ctx.lineTo(width * 0.52, horizonY - 26);
  ctx.lineTo(width * 0.71, horizonY - 10);
  ctx.lineTo(width * 0.89, horizonY - 24);
  ctx.lineTo(width, horizonY - 14);
  ctx.lineTo(width, horizonY + 4);
  ctx.lineTo(0, horizonY + 4);
  ctx.closePath();
  ctx.fill();
}

export function drawRiverSurface(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number
): void {
  const horizonY = height * RIVER_HORIZON_RATIO;
  const riverHeight = height - horizonY;

  ctx.fillStyle = '#1A1B41';
  ctx.fillRect(0, horizonY, width, riverHeight);

  const paperWaveBands = [
    { ratio: 0.22, color: '#16193A', amp: 6 },
    { ratio: 0.48, color: '#121631', amp: 9 },
    { ratio: 0.74, color: '#0D1321', amp: 12 },
  ];

  paperWaveBands.forEach((band, idx) => {
    const bandY = horizonY + riverHeight * band.ratio;
    ctx.fillStyle = band.color;
    ctx.beginPath();
    ctx.moveTo(0, bandY);
    for (let x = 0; x <= width; x += 48) {
      const waveY =
        bandY +
        Math.sin(x * 0.006 + time * 0.0012 * (idx % 2 === 0 ? 1 : -1) + idx) * band.amp;
      ctx.lineTo(x, waveY);
    }
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();
  });

  const moonX = width * 0.77;
  const reflectionSlices = 14;
  for (let i = 0; i < reflectionSlices; i++) {
    const progress = i / reflectionSlices;
    const sliceY = horizonY + 12 + Math.pow(progress, 1.35) * (riverHeight * 0.8);
    const waveShift = Math.sin(time * 0.002 + i * 0.9) * (10 + progress * 26);
    const sliceWidth = Math.max(
      6,
      (22 + progress * 84) * (0.88 + 0.12 * Math.sin(time * 0.003 + i))
    );
    const sliceHeight = Math.max(2, 2.5 + progress * 3.2);

    ctx.fillStyle =
      i % 2 === 0 ? 'rgba(244, 208, 111, 0.22)' : 'rgba(255, 140, 66, 0.14)';
    ctx.beginPath();
    ctx.roundRect(
      moonX + waveShift - sliceWidth,
      sliceY - sliceHeight,
      sliceWidth * 2,
      sliceHeight * 2,
      sliceHeight
    );
    ctx.fill();
  }
}

export function drawProceduralKrathong({
  ctx,
  x,
  y,
  scale,
  config,
  time,
  isHighlighted = false,
  showWishTag = true,
  opacity = 1,
  ownerLabel,
  wishOverride,
}: RenderKrathongParams): void {
  if (scale <= 0.02 || opacity <= 0.01) return;

  const bobOffset = Math.sin(time * 0.0028 + x * 0.018) * 5 * scale;
  const tiltAngle = Math.cos(time * 0.002 + x * 0.012) * 0.032;

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.translate(x, y + bobOffset);
  ctx.rotate(tiltAngle);
  ctx.scale(scale, scale);

  ctx.fillStyle = 'rgba(244, 208, 111, 0.14)';
  ctx.beginPath();
  ctx.ellipse(0, 20, 82, 26, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255, 140, 66, 0.18)';
  ctx.beginPath();
  ctx.ellipse(0, 18, 58, 19, 0, 0, Math.PI * 2);
  ctx.fill();

  if (isHighlighted) {
    ctx.fillStyle = 'rgba(255, 242, 117, 0.2)';
    ctx.beginPath();
    ctx.ellipse(0, 10, 76, 30, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  const sprite = getOrCreateKrathongSprite(config);
  if (sprite) {
    ctx.drawImage(sprite, -74, -72, 148, 112);
  }

  const flickerX = Math.sin(time * 0.012 + x) * 2.2;
  const flickerScale = Math.max(0.6, 0.94 + Math.sin(time * 0.018 + y) * 0.1);

  ctx.fillStyle = 'rgba(244, 208, 111, 0.18)';
  ctx.beginPath();
  ctx.arc(0, -52, Math.max(6, 32 * flickerScale), 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FF8C42';
  ctx.beginPath();
  ctx.moveTo(0, -40);
  ctx.lineTo(-9 * flickerScale, -51);
  ctx.lineTo(flickerX, -67 * flickerScale);
  ctx.lineTo(9 * flickerScale, -51);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#F4D06F';
  ctx.beginPath();
  ctx.moveTo(0, -41);
  ctx.lineTo(-6 * flickerScale, -50);
  ctx.lineTo(flickerX * 0.7, -62 * flickerScale);
  ctx.lineTo(6 * flickerScale, -50);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#FFF275';
  ctx.beginPath();
  ctx.moveTo(0, -42);
  ctx.lineTo(-3.5 * flickerScale, -49);
  ctx.lineTo(flickerX * 0.4, -56 * flickerScale);
  ctx.lineTo(3.5 * flickerScale, -49);
  ctx.closePath();
  ctx.fill();

  const effectiveWish = wishOverride ?? config.wishText;
  const effectiveAuthor = ownerLabel ?? config.authorName;

  if (showWishTag && effectiveWish.trim().length > 0 && scale > 0.34) {
    drawWishSlipTag(ctx, effectiveWish, effectiveAuthor, -114);
  }

  ctx.restore();
}

export function drawInteractiveSkyLantern({
  ctx,
  x,
  y,
  scale,
  config,
  time,
  isHighlighted = false,
  showWishTag = true,
  opacity = 1,
  ownerLabel,
  wishOverride,
}: RenderKrathongParams): void {
  if (scale <= 0.02 || opacity <= 0.01) return;

  const floatOffset = Math.sin(time * 0.0024 + x * 0.015) * 6 * scale;
  const swayAngle = Math.sin(time * 0.0018 + y * 0.012) * 0.055;

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.translate(x, y + floatOffset);
  ctx.rotate(swayAngle);
  ctx.scale(scale, scale);

  if (isHighlighted) {
    ctx.fillStyle = 'rgba(255, 242, 117, 0.16)';
    ctx.beginPath();
    ctx.arc(0, -6, 66, 0, Math.PI * 2);
    ctx.fill();
  }

  const sprite = getOrCreateLanternSprite(config);
  if (sprite) {
    ctx.drawImage(sprite, -68, -78, 136, 156);
  }

  // Animated burner flame at bottom opening (y = 34)
  const flickerScale = Math.max(0.65, 0.95 + Math.sin(time * 0.02 + x) * 0.12);
  ctx.fillStyle = 'rgba(255, 140, 66, 0.28)';
  ctx.beginPath();
  ctx.arc(0, 30, Math.max(5, 20 * flickerScale), 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FF8C42';
  ctx.beginPath();
  ctx.moveTo(0, 16 * flickerScale);
  ctx.lineTo(8 * flickerScale, 30);
  ctx.lineTo(0, 38);
  ctx.lineTo(-8 * flickerScale, 30);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#FFF275';
  ctx.beginPath();
  ctx.moveTo(0, 21 * flickerScale);
  ctx.lineTo(4.5 * flickerScale, 30);
  ctx.lineTo(0, 36);
  ctx.lineTo(-4.5 * flickerScale, 30);
  ctx.closePath();
  ctx.fill();

  const effectiveWish = wishOverride ?? config.wishText;
  const effectiveAuthor = ownerLabel ?? config.authorName;

  if (showWishTag && effectiveWish.trim().length > 0 && scale > 0.34) {
    drawWishSlipTag(ctx, effectiveWish, effectiveAuthor, -104);
  }

  ctx.restore();
}

export function drawTargetSpotlights(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  stageItems: StageItem[],
  time: number
): void {
  const unReleasedKrathongs = stageItems.filter(
    (item) => !item.released && item.itemType === 'krathong'
  );
  const unReleasedLanterns = stageItems.filter(
    (item) => !item.released && item.itemType === 'lantern'
  );

  const pulse = 0.5 + 0.5 * Math.sin(time * 0.004);

  // 1. Draw glowing circular sky release spots for Sky Lanterns
  if (unReleasedLanterns.length > 0) {
    SKY_LANTERN_TARGETS.forEach((spot, idx) => {
      const sx = spot.x * width;
      const sy = spot.y * height;
      const isHovered = unReleasedLanterns.some(
        (item) => Math.hypot(item.x - spot.x, item.y - spot.y) < SPOT_HIT_RADIUS_RATIO * 1.15
      );

      const baseRadius = Math.max(36, Math.min(width, height) * 0.068);
      const r = baseRadius * (isHovered ? 1.14 : 0.96 + pulse * 0.08);

      ctx.save();
      ctx.translate(sx, sy);

      // Soft outer celestial aura circle
      ctx.fillStyle = isHovered
        ? `rgba(255, 242, 117, ${0.24 + pulse * 0.12})`
        : `rgba(244, 208, 111, ${0.09 + pulse * 0.05})`;
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.32, 0, Math.PI * 2);
      ctx.fill();

      // Inner soft circle
      ctx.fillStyle = isHovered
        ? 'rgba(255, 140, 66, 0.22)'
        : 'rgba(244, 208, 111, 0.08)';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.88, 0, Math.PI * 2);
      ctx.fill();

      // Glowing circular ring
      ctx.strokeStyle = isHovered
        ? '#FFF275'
        : `rgba(244, 208, 111, ${0.38 + pulse * 0.25})`;
      ctx.lineWidth = isHovered ? 2.6 : 1.5;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // 4 cardinal star diamonds around the sky circle
      for (let d = 0; d < 4; d++) {
        const angle = (d / 4) * Math.PI * 2 + time * 0.0008;
        const dx = Math.cos(angle) * r;
        const dy = Math.sin(angle) * r;
        ctx.fillStyle = isHovered ? '#FFF275' : '#F4D06F';
        ctx.beginPath();
        ctx.moveTo(dx, dy - 4);
        ctx.lineTo(dx + 4, dy);
        ctx.lineTo(dx, dy + 4);
        ctx.lineTo(dx - 4, dy);
        ctx.closePath();
        ctx.fill();
      }

      if (idx === 1 || isHovered) {
        ctx.font = '500 12px "Bai Jamjuree", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = isHovered ? '#FFF275' : 'rgba(244, 208, 111, 0.88)';
        ctx.fillText(
          isHovered
            ? '— ส่งโคมทองลอยลิ่วสู่ฟากฟ้าราตรี —'
            : 'วงแสงเวหา • ลานปล่อยโคมประทีป',
          0,
          r + 20
        );
      }

      ctx.restore();
    });
  }

  // 2. Draw glowing circular water-lily spots on the river for Krathongs
  if (unReleasedKrathongs.length > 0) {
    RIVER_SPOT_TARGETS.forEach((spot, idx) => {
      const sx = spot.x * width;
      const sy = spot.y * height;
      const isHovered = unReleasedKrathongs.some(
        (item) => Math.hypot(item.x - spot.x, item.y - spot.y) < SPOT_HIT_RADIUS_RATIO * 1.2
      );

      const rx = Math.max(44, Math.min(width, height) * 0.078) * (isHovered ? 1.15 : 1);
      const ry = rx * 0.44;
      const ripplePulse = ( (time * 0.0008 + idx * 0.25) % 1 );

      ctx.save();
      ctx.translate(sx, sy);

      // Soft glowing water halo
      ctx.fillStyle = isHovered
        ? `rgba(255, 242, 117, ${0.26 + pulse * 0.12})`
        : `rgba(244, 208, 111, ${0.1 + pulse * 0.06})`;
      ctx.beginPath();
      ctx.ellipse(0, 0, rx * 1.25, ry * 1.25, 0, 0, Math.PI * 2);
      ctx.fill();

      // Expanding water ripple ring
      ctx.strokeStyle = isHovered
        ? `rgba(255, 242, 117, ${0.85 * (1 - ripplePulse)})`
        : `rgba(244, 208, 111, ${0.45 * (1 - ripplePulse)})`;
      ctx.lineWidth = isHovered ? 2.4 : 1.5;
      ctx.beginPath();
      ctx.ellipse(
        0,
        0,
        rx * (0.7 + ripplePulse * 0.65),
        ry * (0.7 + ripplePulse * 0.65),
        0,
        0,
        Math.PI * 2
      );
      ctx.stroke();

      // Core target ring
      ctx.strokeStyle = isHovered
        ? '#FFF275'
        : `rgba(255, 153, 200, ${0.42 + pulse * 0.25})`;
      ctx.lineWidth = isHovered ? 2.5 : 1.6;
      ctx.setLineDash([10, 6]);
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Center lotus-light diamond
      ctx.fillStyle = isHovered ? '#FFF275' : '#FF99C8';
      ctx.beginPath();
      ctx.moveTo(0, -5);
      ctx.lineTo(8, 0);
      ctx.lineTo(0, 5);
      ctx.lineTo(-8, 0);
      ctx.closePath();
      ctx.fill();

      if (isHovered || idx === 1) {
        ctx.font = '500 12px "Bai Jamjuree", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = isHovered ? '#FFF275' : 'rgba(244, 208, 111, 0.88)';
        ctx.fillText(
          isHovered
            ? '— คลายนิ้วส่งกระทงล่องสู่คุ้งน้ำพระนคร —'
            : 'วงแสงจันทรา • ท่าน้ำวางกระทง',
          0,
          ry + 20
        );
      }

      ctx.restore();
    });
  }
}

const FINGER_CHAINS: number[][] = [
  [1, 2, 3, 4],     // Thumb
  [5, 6, 7, 8],     // Index
  [9, 10, 11, 12],  // Middle
  [13, 14, 15, 16], // Ring
  [17, 18, 19, 20], // Pinky
];

const HAND_PALETTES = [
  { skin: '#FFE5B4', accent: '#F4D06F', joint: '#FF99C8', label: 'มือที่ ๑' },
  { skin: '#FFD6E8', accent: '#FF99C8', joint: '#FF8C42', label: 'มือที่ ๒' },
  { skin: '#D8F3DC', accent: '#52B788', joint: '#F4D06F', label: 'มือที่ ๓' },
  { skin: '#EDE0D4', accent: '#E0AAFF', joint: '#FF99C8', label: 'มือที่ ๔' },
  { skin: '#FFF3B0', accent: '#FF8C42', joint: '#F4D06F', label: 'มือที่ ๕' },
];

function drawSingleIllustratedHand(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  hand: TrackedHand,
  totalHands: number
): void {
  const palette = HAND_PALETTES[hand.handIndex % HAND_PALETTES.length];
  const primarySkin = palette.skin;
  const accentColor = palette.accent;
  const jointColor = palette.joint;

  ctx.save();

  if (hand.landmarks && hand.landmarks.length >= 21) {
    const pts = hand.landmarks.map((lm) => ({
      x: lm.x * width,
      y: lm.y * height,
    }));

    const wrist = pts[0];
    const palmCenter = {
      x: (pts[0].x + pts[5].x + pts[9].x + pts[13].x + pts[17].x) / 5,
      y: (pts[0].y + pts[5].y + pts[9].y + pts[13].y + pts[17].y) / 5,
    };

    // Soft magical aura behind palm
    ctx.fillStyle = hand.isPinching
      ? 'rgba(255, 242, 117, 0.22)'
      : hexToRgba(accentColor, 0.14);
    ctx.beginPath();
    ctx.arc(palmCenter.x, palmCenter.y, 44, 0, Math.PI * 2);
    ctx.fill();

    // 2D Paper-cut Palm Polygon
    ctx.fillStyle = hexToRgba(primarySkin, 0.82);
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    ctx.lineTo(pts[1].x, pts[1].y);
    ctx.lineTo(pts[2].x, pts[2].y);
    ctx.lineTo(pts[5].x, pts[5].y);
    ctx.lineTo(pts[9].x, pts[9].y);
    ctx.lineTo(pts[13].x, pts[13].y);
    ctx.lineTo(pts[17].x, pts[17].y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Decorative Thai lotus-diamond motif on back of palm
    ctx.fillStyle = hexToRgba(jointColor, 0.55);
    ctx.beginPath();
    ctx.moveTo(palmCenter.x, palmCenter.y - 7);
    ctx.lineTo(palmCenter.x + 6, palmCenter.y);
    ctx.lineTo(palmCenter.x, palmCenter.y + 7);
    ctx.lineTo(palmCenter.x - 6, palmCenter.y);
    ctx.closePath();
    ctx.fill();

    // Draw 5 articulated 2D fingers
    FINGER_CHAINS.forEach((chain, fingerIdx) => {
      const baseWidth = fingerIdx === 0 ? 13 : fingerIdx === 4 ? 9.5 : 11.5;

      for (let i = 0; i < chain.length - 1; i++) {
        const pA = pts[chain[i]];
        const pB = pts[chain[i + 1]];

        ctx.strokeStyle = hexToRgba(primarySkin, 0.9);
        ctx.lineWidth = Math.max(5, baseWidth - i * 2.2);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(pA.x, pA.y);
        ctx.lineTo(pB.x, pB.y);
        ctx.stroke();

        // Subtle golden edge highlight along finger segment
        ctx.strokeStyle = hexToRgba(accentColor, 0.65);
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(pA.x, pA.y);
        ctx.lineTo(pB.x, pB.y);
        ctx.stroke();
      }

      // Fingertip pad + golden nail accent
      const tip = pts[chain[chain.length - 1]];
      const isPinchFinger = fingerIdx === 0 || fingerIdx === 1;

      ctx.fillStyle =
        hand.isPinching && isPinchFinger ? '#FFF275' : primarySkin;
      ctx.beginPath();
      ctx.arc(tip.x, tip.y, isPinchFinger ? 6.5 : 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle =
        hand.isPinching && isPinchFinger ? '#FF8C42' : accentColor;
      ctx.beginPath();
      ctx.arc(tip.x, tip.y, 2.6, 0, Math.PI * 2);
      ctx.fill();
    });

    // Golden wrist bangle (กำไลข้อมือทอง)
    ctx.fillStyle = '#F4D06F';
    ctx.beginPath();
    ctx.arc(wrist.x, wrist.y, 6, 0, Math.PI * 2);
    ctx.fill();

    if (totalHands > 1) {
      ctx.font = '600 11px "Bai Jamjuree", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = accentColor;
      ctx.fillText(palette.label, wrist.x, wrist.y + 20);
    }
  }

  // Pinch cursor spark between thumb & index finger
  const cx = hand.cursor.x * width;
  const cy = hand.cursor.y * height;

  if (hand.isPinching) {
    ctx.fillStyle = 'rgba(255, 242, 117, 0.35)';
    ctx.beginPath();
    ctx.arc(cx, cy, 20, 0, Math.PI * 2);
    ctx.fill();

    // 4-point star spark at pinch point
    ctx.fillStyle = '#FFF275';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 11);
    ctx.lineTo(cx + 4, cy - 4);
    ctx.lineTo(cx + 11, cy);
    ctx.lineTo(cx + 4, cy + 4);
    ctx.lineTo(cx, cy + 11);
    ctx.lineTo(cx - 4, cy + 4);
    ctx.lineTo(cx - 11, cy);
    ctx.lineTo(cx - 4, cy - 4);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.strokeStyle = hexToRgba(accentColor, 0.75);
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

export function drawIllustratedHands(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  gestureState: HandGestureState
): void {
  if (!gestureState.isTracking || !gestureState.hands.length) return;

  gestureState.hands.forEach((hand) => {
    drawSingleIllustratedHand(
      ctx,
      width,
      height,
      hand,
      gestureState.hands.length
    );
  });
}
