'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  // Generate structured data for breadcrumbs (SEO)
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Accueil',
        item: 'https://comptalyze.com',
      },
      ...items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 2,
        name: item.label,
        ...(item.href && { item: `https://comptalyze.com${item.href}` }),
      })),
    ],
  };

  return (
    <>
      {/* Structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Visual breadcrumb */}
      <nav aria-label="Fil d'Ariane" className="mb-6">
        <ol className="flex items-center gap-2 text-sm flex-wrap">
          {/* Home */}
          <li>
            <Link
              href="/"
              className="flex items-center gap-1 text-gray-400 hover:text-[#00D084] transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Accueil</span>
            </Link>
          </li>

          {/* Breadcrumb items */}
          {items.map((item, index) => (
            <li key={index} className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-gray-600" />
              {item.href ? (
                <Link
                  href={item.href}
                  className="text-gray-400 hover:text-[#00D084] transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-white font-medium">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

