import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getArticleBySlug, getAllArticleSlugs, extractHeadings, getAllArticles } from '@/lib/mdx-utils';
import TableOfContents from '@/app/components/TableOfContents';
import Breadcrumb from '@/app/components/Breadcrumb';
import RelatedArticles from '@/app/components/RelatedArticles';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const slugs = getAllArticleSlugs();
  return slugs.map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return {
      title: 'Article non trouvé',
    };
  }

  const canonicalUrl = `https://comptalyze.com/blog/${slug}`;

  return {
    title: `${article.metadata.title} | Comptalyze`,
    description: article.metadata.description,
    keywords: article.metadata.keywords || [],
    authors: article.metadata.author ? [{ name: article.metadata.author }] : [],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: article.metadata.title,
      description: article.metadata.description,
      type: 'article',
      publishedTime: article.metadata.date,
      url: canonicalUrl,
      siteName: 'Comptalyze',
      locale: 'fr_FR',
      images: [
        {
          url: 'https://comptalyze.com/logo.png',
          width: 1200,
          height: 630,
          alt: article.metadata.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.metadata.title,
      description: article.metadata.description,
      site: '@comptalyze',
      creator: '@comptalyze',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const headings = extractHeadings(article.content);
  
  // Get related articles (same category, exclude current)
  const allArticles = getAllArticles();
  const relatedArticles = allArticles
    .filter(a => a.slug !== slug && a.metadata.category === article.metadata.category)
    .slice(0, 2);
  
  // If less than 2 in same category, add other articles
  if (relatedArticles.length < 2) {
    const otherArticles = allArticles
      .filter(a => a.slug !== slug && !relatedArticles.find(r => r.slug === a.slug))
      .slice(0, 2 - relatedArticles.length);
    relatedArticles.push(...otherArticles);
  }

  // Import dynamically the MDX content
  let MDXContent;
  try {
    MDXContent = (await import(`@/content/blog/${slug}.mdx`)).default;
  } catch {
    notFound();
  }

  // Structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.metadata.title,
    description: article.metadata.description,
    author: {
      '@type': 'Organization',
      name: article.metadata.author || 'Comptalyze',
      url: 'https://comptalyze.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Comptalyze',
      logo: {
        '@type': 'ImageObject',
        url: 'https://comptalyze.com/logo.png',
      },
    },
    datePublished: article.metadata.date,
    dateModified: article.metadata.date,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://comptalyze.com/blog/${slug}`,
    },
    keywords: article.metadata.keywords?.join(', '),
    articleSection: article.metadata.category,
  };

  // FAQ structured data if this is the URSSAF article
  const faqStructuredData = slug === 'declaration-urssaf-micro-entrepreneur-2025' ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Dois-je déclarer les acomptes ou le CA total ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Vous déclarez le chiffre d\'affaires encaissé, c\'est-à-dire les sommes effectivement reçues, y compris les acomptes.',
        },
      },
      {
        '@type': 'Question',
        name: 'Peut-on modifier une déclaration après validation ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Non, une fois validée, la déclaration ne peut plus être modifiée. En cas d\'erreur, contactez votre URSSAF pour régulariser.',
        },
      },
      {
        '@type': 'Question',
        name: 'Les cotisations sont-elles déductibles ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Non, en micro-entreprise les cotisations sociales ne sont pas déductibles. L\'abattement forfaitaire appliqué couvre toutes vos charges.',
        },
      },
    ],
  } : null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0e0f12' }}>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {faqStructuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
        />
      )}
      {/* Header */}
      <header className="border-b" style={{ borderColor: '#1f232b' }}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Link href="/blog" className="text-lg font-semibold text-white hover:opacity-80 transition-opacity">
            ← Retour au blog
          </Link>
        </div>
      </header>

      {/* Article avec TOC */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-12">
          {/* Contenu principal */}
          <article className="min-w-0">
            {/* Breadcrumb */}
            <Breadcrumb
              items={[
                { label: 'Blog', href: '/blog' },
                { label: article.metadata.title },
              ]}
            />

            {/* En-tête de l'article */}
            <header className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <span 
                  className="px-3 py-1 rounded-full text-sm font-medium" 
                  style={{ 
                    backgroundColor: 'rgba(0, 208, 132, 0.1)', 
                    color: '#00D084' 
                  }}
                >
                  {article.metadata.category}
                </span>
                <span className="text-sm text-gray-500">{article.metadata.readTime}</span>
                <span className="text-sm text-gray-500">•</span>
                <time className="text-sm text-gray-500">
                  {new Date(article.metadata.date).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </time>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                {article.metadata.title}
              </h1>
              
              <p className="text-xl text-gray-300 leading-relaxed">
                {article.metadata.description}
              </p>
            </header>

            {/* Contenu MDX */}
            <div className="prose prose-invert max-w-none">
              <MDXContent />
            </div>

            {/* Articles recommandés */}
            {relatedArticles.length > 0 && (
              <RelatedArticles
                articles={relatedArticles.map(a => ({
                  slug: a.slug,
                  title: a.metadata.title,
                  description: a.metadata.description,
                  category: a.metadata.category,
                  readTime: a.metadata.readTime,
                }))}
                currentSlug={slug}
              />
            )}

            {/* Liens de navigation */}
            <div className="mt-16 pt-8 border-t" style={{ borderColor: '#2d3441' }}>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-[#00D084] hover:text-[#00F0A0] transition-colors"
              >
                ← Voir tous les articles
              </Link>
            </div>
          </article>

          {/* Table des matières (desktop seulement) */}
          <aside className="hidden lg:block">
            <TableOfContents headings={headings} />
          </aside>
        </div>
      </div>
    </div>
  );
}

