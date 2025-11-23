import { Metadata } from 'next';

const appUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

const frame = {
  version: 'next',
  imageUrl: `${appUrl}/api/og`,
  button: {
    title: 'Play DigBase',
    action: {
      type: 'launch_frame',
      name: 'DigBase',
      url: appUrl,
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: '#16a34a',
    },
  },
};

export const metadata: Metadata = {
  title: 'DigBase - Daily Mining Game',
  description: 'Find the hidden gem on a 7x7 grid. Play once daily!',
  openGraph: {
    title: 'DigBase - Daily Mining Game',
    description: 'Dig to find the gem! Watch out for bombs.',
    images: [`${appUrl}/og-image.png`],
  },
  other: {
    'fc:frame': JSON.stringify(frame),
  },
};

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-900 to-green-700 flex items-center justify-center p-4">
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">💎 DigBase</h1>
        <p className="text-xl mb-8">Open this in Farcaster to play!</p>
        <div className="bg-white/10 backdrop-blur p-6 rounded-lg max-w-md">
          <p className="mb-4">🎮 Find the hidden gem on a 7x7 grid</p>
          <p className="mb-4">💣 Avoid 3 random bombs (-10% points)</p>
          <p className="mb-4">⭐ Start with 500 points, -10 per dig</p>
          <p className="mb-4">✅ Daily check-ins with countdown</p>
          <p>📅 Play once per day (or buy extra plays!)</p>
        </div>
      </div>
    </main>
  );
}
