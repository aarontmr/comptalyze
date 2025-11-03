import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-2 text-sm mb-6">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={index} className="flex items-center gap-2">
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-gray-400 hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'text-white font-medium' : 'text-gray-400'}>
                {item.label}
              </span>
            )}
            {!isLast && <ChevronRight className="w-4 h-4 text-gray-500" />}
          </div>
        );
      })}
    </nav>
  );
}

