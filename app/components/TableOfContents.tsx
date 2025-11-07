'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  headings: Heading[];
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -66% 0px' }
    );

    const headingElements = headings
      .map(({ id }) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    headingElements.forEach((el) => observer.observe(el));

    return () => {
      headingElements.forEach((el) => observer.unobserve(el));
    };
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="sticky top-24 hidden lg:block">
      <div 
        className="p-6 rounded-2xl"
        style={{ 
          backgroundColor: '#1a1d24', 
          border: '1px solid #2d3441',
          maxHeight: 'calc(100vh - 200px)',
          overflowY: 'auto'
        }}
      >
        <h2 className="text-lg font-bold text-white mb-4">📋 Sommaire</h2>
        <ul className="space-y-2">
          {headings.map((heading) => (
            <li
              key={heading.id}
              style={{
                marginLeft: heading.level === 3 ? '1rem' : '0',
              }}
            >
              <Link
                href={`#${heading.id}`}
                className={`block text-sm transition-colors hover:text-[#00D084] ${
                  activeId === heading.id
                    ? 'text-[#00D084] font-semibold'
                    : 'text-gray-400'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(heading.id)?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                  });
                }}
              >
                {heading.text}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}




