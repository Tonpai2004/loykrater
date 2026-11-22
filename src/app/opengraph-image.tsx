import { ImageResponse } from 'next/og';

export const alt = 'ลอย กะ เธอ (Loy Kra Ter) ลอยกระทงออนไลน์ด้วยนิ้วมือของคุณ';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const TITLE_TH = 'ลอย กะ เธอ';
const BRAND = 'LOY KRA TER';
// Kept free of stacked Thai marks: the OG renderer has no mark positioning, so ิ้-style stacks would collide
const TAGLINE_TH = 'ลอยกระทงออนไลน์ คืนเพ็ญเดือน ๑๒';
const TAGLINE_EN = 'Float a Krathong online with your own hands';
const PILL = 'Webcam hand tracking • Krathong & Sky Lantern';

// Fetch only the glyphs we draw; Google serves TTF to non-browser clients, which ImageResponse needs
async function loadGoogleFont(family: string, weight: number, text: string) {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}:wght@${weight}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(cssUrl)).text();
  const source = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/);
  if (!source) throw new Error(`No TTF for ${family}`);
  const response = await fetch(source[1]);
  if (!response.ok) throw new Error(`Font download failed for ${family}`);
  return response.arrayBuffer();
}

// Cached so the image is prerendered at build time instead of fetching fonts on every crawler hit
async function loadFonts() {
  'use cache';
  try {
    const [pridi, bai] = await Promise.all([
      loadGoogleFont('Pridi', 600, `${TITLE_TH}${TAGLINE_TH}`),
      loadGoogleFont('Bai Jamjuree', 500, `${BRAND}${TAGLINE_EN}${PILL}`),
    ]);
    return [
      { name: 'Pridi', data: pridi, weight: 600 as const, style: 'normal' as const },
      { name: 'Bai Jamjuree', data: bai, weight: 500 as const, style: 'normal' as const },
    ];
  } catch {
    // Offline build: fall back to the built-in Latin font and an English-only layout
    return null;
  }
}

const STARS: [number, number, number][] = [
  [690, 70, 4], [760, 128, 3], [612, 182, 3], [1110, 92, 4], [1046, 54, 3],
  [835, 60, 3], [1150, 196, 3], [700, 236, 2], [980, 260, 2], [560, 96, 2],
];

function SceneArt() {
  const horizon = 360;
  return (
    <svg
      width="1200"
      height="630"
      viewBox="0 0 1200 630"
      style={{ position: 'absolute', top: 0, left: 0 }}
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0D1321" />
          <stop offset="1" stopColor="#1A1B41" />
        </linearGradient>
        <linearGradient id="fade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#080B14" stopOpacity="0.92" />
          <stop offset="0.52" stopColor="#080B14" stopOpacity="0.55" />
          <stop offset="0.75" stopColor="#080B14" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width="1200" height="630" fill="url(#sky)" />

      {STARS.map(([x, y, r], i) => (
        <polygon
          key={i}
          points={`${x},${y - r} ${x + r},${y} ${x},${y + r} ${x - r},${y}`}
          fill="#FFF275"
          opacity="0.75"
        />
      ))}

      {/* Full moon */}
      <circle cx="930" cy="150" r="190" fill="#F4D06F" opacity="0.05" />
      <circle cx="930" cy="150" r="128" fill="#F4D06F" opacity="0.1" />
      <circle cx="930" cy="150" r="74" fill="#F4D06F" />
      <circle cx="920" cy="141" r="61" fill="#FFF275" />

      {/* Sky lanterns */}
      {[
        [742, 196, 1],
        [1092, 270, 0.8],
        [640, 118, 0.62],
      ].map(([x, y, s], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
          <circle cx="0" cy="6" r="46" fill="#FF8C42" opacity="0.14" />
          <path d="M-22,-30 L22,-30 L28,22 L-28,22 Z" fill="#FF8C42" />
          <path d="M-22,-30 L0,-30 L-6,22 L-28,22 Z" fill="#F4D06F" opacity="0.55" />
          <rect x="-18" y="22" width="36" height="5" fill="#B83B2A" />
          <circle cx="0" cy="34" r="5" fill="#FFF275" />
        </g>
      ))}

      {/* Far bank & temple silhouette */}
      <path
        d={`M0,${horizon} L170,${horizon - 22} L380,${horizon - 8} L620,${horizon - 26} L850,${horizon - 10} L1060,${horizon - 24} L1200,${horizon - 14} L1200,${horizon + 4} L0,${horizon + 4} Z`}
        fill="#12152E"
      />
      <path
        d={`M1010,${horizon - 22} L1030,${horizon - 70} L1040,${horizon - 70} L1050,${horizon - 128} L1060,${horizon - 70} L1070,${horizon - 70} L1090,${horizon - 22} Z`}
        fill="#12152E"
      />

      {/* River bands */}
      <rect x="0" y={horizon} width="1200" height={630 - horizon} fill="#1A1B41" />
      <path d={`M0,${horizon + 60} Q300,${horizon + 46} 600,${horizon + 62} T1200,${horizon + 56} L1200,630 L0,630 Z`} fill="#16193A" />
      <path d={`M0,${horizon + 130} Q300,${horizon + 112} 600,${horizon + 134} T1200,${horizon + 122} L1200,630 L0,630 Z`} fill="#121631" />
      <path d={`M0,${horizon + 205} Q300,${horizon + 188} 600,${horizon + 210} T1200,${horizon + 196} L1200,630 L0,630 Z`} fill="#0D1321" />

      {/* Moon reflection */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const w = 26 + i * 12;
        return (
          <rect
            key={i}
            x={930 - w + (i % 2 === 0 ? 8 : -10)}
            y={horizon + 14 + i * 30}
            width={w * 2}
            height={5 + i * 0.6}
            rx="3"
            fill={i % 2 === 0 ? '#F4D06F' : '#FF8C42'}
            opacity={i % 2 === 0 ? 0.24 : 0.16}
          />
        );
      })}

      {/* Krathong */}
      <g transform="translate(820 500) scale(1.55)">
        <ellipse cx="0" cy="22" rx="92" ry="22" fill="#F4D06F" opacity="0.16" />
        <circle cx="0" cy="-52" r="44" fill="#FFF275" opacity="0.16" />
        <path d="M-74,0 L74,0 L54,26 L-54,26 Z" fill="#1B4332" />
        <path d="M-74,0 L-52,-16 L-30,0 L-8,-16 L14,0 L36,-16 L58,0 L74,0 Z" fill="#2D6A4F" />
        <path d="M-54,26 L-40,0 L-26,26 M-14,26 L0,0 L14,26 M26,26 L40,0 L54,26" fill="none" stroke="#52B788" strokeWidth="2.5" />
        <path d="M-46,-6 L-30,-40 L-16,-6 Z" fill="#FF99C8" />
        <path d="M16,-6 L30,-40 L46,-6 Z" fill="#FF99C8" />
        <path d="M-22,-6 L0,-50 L22,-6 Z" fill="#FFB8D9" />
        <path d="M-10,-6 L0,-30 L10,-6 Z" fill="#FFF275" />
        <rect x="-3" y="-46" width="6" height="18" fill="#F5EFE4" />
        <path d="M0,-74 L7,-56 L0,-46 L-7,-56 Z" fill="#FF8C42" />
        <path d="M0,-68 L4,-56 L0,-49 L-4,-56 Z" fill="#FFF275" />
      </g>
      <g transform="translate(1060 560) scale(0.85)" opacity="0.85">
        <circle cx="0" cy="-52" r="40" fill="#FFF275" opacity="0.14" />
        <path d="M-74,0 L74,0 L54,26 L-54,26 Z" fill="#2D6A4F" />
        <path d="M-46,-6 L-30,-40 L-16,-6 Z" fill="#E0AAFF" />
        <path d="M16,-6 L30,-40 L46,-6 Z" fill="#E0AAFF" />
        <path d="M-22,-6 L0,-50 L22,-6 Z" fill="#F4D06F" />
        <path d="M0,-72 L7,-56 L0,-46 L-7,-56 Z" fill="#FF8C42" />
      </g>

      {/* Legibility fade behind the text column */}
      <rect width="1200" height="630" fill="url(#fade)" />

      {/* Chamfered lacquer-and-brass frame */}
      <polygon
        points="46,22 1154,22 1178,46 1178,584 1154,608 46,608 22,584 22,46"
        fill="none"
        stroke="#D4AF37"
        strokeWidth="2.5"
        opacity="0.8"
      />
      <polygon
        points="52,34 1148,34 1166,52 1166,578 1148,596 52,596 34,578 34,52"
        fill="none"
        stroke="#D4AF37"
        strokeWidth="1"
        opacity="0.35"
      />
    </svg>
  );
}

export default async function OpengraphImage() {
  const fonts = await loadFonts();

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          background: '#0D1321',
        }}
      >
        <SceneArt />

        <div
          style={{
            position: 'absolute',
            left: 86,
            top: 92,
            display: 'flex',
            flexDirection: 'column',
            width: 600,
            fontFamily: fonts ? 'Bai Jamjuree' : undefined,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 46, height: 2, background: '#D4AF37' }} />
            <div style={{ fontSize: 26, letterSpacing: 10, color: '#F4D06F', fontWeight: 500 }}>
              {BRAND}
            </div>
          </div>

          <div
            style={{
              marginTop: 18,
              fontSize: fonts ? 116 : 92,
              lineHeight: 1.25,
              color: '#FFF275',
              fontFamily: fonts ? 'Pridi' : undefined,
              fontWeight: 600,
              textShadow: '0 0 36px rgba(255, 242, 117, 0.35)',
            }}
          >
            {fonts ? TITLE_TH : BRAND}
          </div>

          {fonts && (
            <div
              style={{
                marginTop: 6,
                fontSize: 36,
                color: '#FFFDF7',
                fontFamily: 'Pridi',
                fontWeight: 600,
              }}
            >
              {TAGLINE_TH}
            </div>
          )}

          <div style={{ marginTop: 10, fontSize: 28, color: 'rgba(255, 253, 247, 0.78)' }}>
            {TAGLINE_EN}
          </div>

          <div
            style={{
              marginTop: 40,
              display: 'flex',
              alignSelf: 'flex-start',
              padding: '12px 22px',
              border: '1.5px solid rgba(212, 175, 55, 0.7)',
              background: 'rgba(212, 175, 55, 0.12)',
              color: '#F4D06F',
              fontSize: 22,
            }}
          >
            {PILL}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: fonts ?? undefined }
  );
}
