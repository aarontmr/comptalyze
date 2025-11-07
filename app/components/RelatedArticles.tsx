'use client';

import Link from 'next/link';
import { FileText } from 'lucide-react';

interface RelatedArticle {
  slug: string;
  title: string;
  category: string;
  readTime: string;
}

interface RelatedArticlesProps {
  currentSlug: string;
  articles: RelatedArticle[];
}

export default function RelatedArticles({ currentSlug, articles }: RelatedArticlesProps) {
  // Filter out current article and limit to 3
  const relatedArticles = articles
    .filter((article) => article.slug !== currentSlug)
    .slice(0, 3);

  if (relatedArticles.length === 0) return null;

  return (
    <section 
      className="mt-16 p-8 rounded-2xl"
      style={{ 
        backgroundColor: '#1a1d24', 
        border: '1px solid #2d3441' 
      }}
    >
      <h2 className="text-2xl font-bold text-white mb-6">
        📚 Articles recommandés
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {relatedArticles.map((article) => (
          <Link
            key={article.slug}
            href={`/blog/${article.slug}`}
            className="block p-6 rounded-xl transition-all hover:scale-[1.02]"
            style={{
              backgroundColor: '#0e0f12',
              border: '1px solid #2d3441',
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div 
                className="p-2 rounded-lg"
                style={{ background: 'linear-gradient(135deg, #00D084, #2E6CF6)' }}
              >
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div>
                <span 
                  className="text-xs px-2 py-1 rounded-full"
                  style={{ 
                    backgroundColor: 'rgba(0, 208, 132, 0.1)', 
                    color: '#00D084' 
                  }}
                >
                  {article.category}
                </span>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
              {article.title}
            </h3>
            <p className="text-sm text-gray-400">{article.readTime}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
