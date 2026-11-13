import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

// Home-screen icon: the glowing full moon on the night-sky indigo
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(180deg, #1A1B41 0%, #0D1321 100%)',
        }}
      >
        <div
          style={{
            width: 150,
            height: 150,
            borderRadius: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background:
              'radial-gradient(circle, rgba(255,242,117,0.55) 40%, rgba(244,208,111,0.18) 62%, rgba(244,208,111,0) 72%)',
          }}
        >
          <div
            style={{
              width: 92,
              height: 92,
              borderRadius: 9999,
              background:
                'radial-gradient(circle at 40% 36%, #FFFDE8 0%, #FFF275 45%, #F4C542 100%)',
              boxShadow: '0 0 28px rgba(255, 242, 117, 0.75)',
            }}
          />
        </div>
      </div>
    ),
    size
  );
}
