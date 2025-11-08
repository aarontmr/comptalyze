import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getArticleBySlug, getAllArticleSlugs, extractHeadings, getAllArticles } from '@/lib/mdx-utils';
import TableOfContents from '@/app/components/TableOfContents';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import RelatedArticles from '@/app/components/RelatedArticles';
import { articleJsonLd, faqJsonLd, breadcrumbJsonLd, JsonLd } from '@/lib/seo/jsonld';
import { getRelatedArticleSlugs } from '@/lib/seo/related-articles';

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

  const canonicalUrl = `https://www.comptalyze.com/blog/${slug}`;

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
  
  // Get related articles using SEO mapping
  const allArticles = getAllArticles();
  const relatedSlugs = getRelatedArticleSlugs(slug, 3);
  const relatedArticles = relatedSlugs
    .map(relatedSlug => allArticles.find(a => a.slug === relatedSlug))
    .filter((a): a is typeof allArticles[0] => a !== undefined);

  // Import dynamically the MDX content
  let MDXContent;
  try {
    MDXContent = (await import(`@/content/blog/${slug}.mdx`)).default;
  } catch {
    notFound();
  }

  // Extract FAQ from article metadata (we'll add this to article frontmatter)
  const faqItems = (article.metadata as { faq?: Array<{ question: string; answer: string }> }).faq || [];
  
  // Generate JSON-LD structured data
  const articleStructuredData = articleJsonLd({
    headline: article.metadata.title,
    description: article.metadata.description,
    datePublished: article.metadata.date,
    dateModified: article.metadata.date,
    authorName: article.metadata.author || 'Comptalyze',
    slug,
    keywords: article.metadata.keywords,
    category: article.metadata.category,
  });

  const faqStructuredData = faqItems.length > 0 ? faqJsonLd(faqItems) : null;
  
  const breadcrumbStructuredData = breadcrumbJsonLd([
    { name: 'Accueil', url: 'https://www.comptalyze.com' },
    { name: 'Blog', url: 'https://www.comptalyze.com/blog' },
    { name: article.metadata.title, url: `https://www.comptalyze.com/blog/${slug}` },
  ]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0e0f12' }}>
      {/* Structured Data JSON-LD */}
      <JsonLd data={articleStructuredData} />
      <JsonLd data={faqStructuredData} />
      <JsonLd data={breadcrumbStructuredData} />
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
            <Breadcrumbs
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

