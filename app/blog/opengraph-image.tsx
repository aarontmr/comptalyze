import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Blog Comptalyze';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 60,
          background: 'linear-gradient(135deg, #0e0f12 0%, #1a1d24 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          padding: '80px',
        }}
      >
        <div
          style={{
            fontSize: 80,
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #00D084, #2E6CF6)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            marginBottom: 20,
          }}
        >
          Blog Comptalyze
        </div>
        <div
          style={{
            fontSize: 40,
            color: '#9ca3af',
            textAlign: 'center',
          }}
        >
          Guides et conseils pour micro-entrepreneurs
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}



