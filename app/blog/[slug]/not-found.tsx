import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0e0f12' }}>
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-300 mb-6">
          Article non trouvé
        </h2>
        <p className="text-gray-400 mb-8">
          Désolé, cet article n'existe pas ou a été déplacé.
        </p>
        <Link
          href="/blog"
          className="inline-block px-6 py-3 rounded-xl text-white font-semibold transition-all hover:scale-105"
          style={{ 
            background: 'linear-gradient(135deg, #00D084, #2E6CF6)',
            boxShadow: '0 4px 20px rgba(0, 208, 132, 0.3)'
          }}
        >
          Retour au blog
        </Link>
      </div>
    </div>
  );
}
