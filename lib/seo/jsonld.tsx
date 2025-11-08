/**
 * Helpers pour générer les JSON-LD Schema.org
 * Optimisation SEO pour Comptalyze Blog
 */

export interface ArticleJsonLdProps {
  headline: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
  slug: string;
  keywords?: string[];
  category?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * Génère le JSON-LD pour un article de blog
 */
export function articleJsonLd({
  headline,
  description,
  datePublished,
  dateModified,
  authorName = 'Comptalyze',
  slug,
  keywords = [],
  category,
}: ArticleJsonLdProps) {
  const url = `https://www.comptalyze.com/blog/${slug}`;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    author: {
      '@type': 'Organization',
      name: authorName,
      url: 'https://www.comptalyze.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Comptalyze',
      url: 'https://www.comptalyze.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.comptalyze.com/logo.png',
        width: 250,
        height: 60,
      },
    },
    datePublished,
    dateModified: dateModified || datePublished,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    url,
    image: {
      '@type': 'ImageObject',
      url: 'https://www.comptalyze.com/logo.png',
      width: 1200,
      height: 630,
    },
    keywords: keywords.join(', '),
    articleSection: category,
    inLanguage: 'fr-FR',
  };
}

/**
 * Génère le JSON-LD pour une FAQ
 */
export function faqJsonLd(faqItems: FAQItem[]) {
  if (!faqItems || faqItems.length === 0) {
    return null;
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

/**
 * Génère le JSON-LD pour un fil d'Ariane (Breadcrumb)
 */
export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Composant React pour injecter le JSON-LD dans le head
 */
export function JsonLd({ data }: { data: Record<string, unknown> | null }) {
  if (!data) return null;
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

