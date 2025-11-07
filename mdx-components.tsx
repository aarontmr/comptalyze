import type { MDXComponents } from 'mdx/types';
import Link from 'next/link';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children, ...props }) => (
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 mt-8" {...props}>
        {children}
      </h1>
    ),
    h2: ({ children, ...props }) => (
      <h2 
        className="text-3xl font-bold text-white mt-12 mb-6 scroll-mt-20" 
        {...props}
      >
        {children}
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3 
        className="text-2xl font-bold text-white mt-10 mb-4 scroll-mt-20" 
        {...props}
      >
        {children}
      </h3>
    ),
    p: ({ children, ...props }) => (
      <p className="text-gray-300 mb-6 leading-relaxed" {...props}>
        {children}
      </p>
    ),
    ul: ({ children, ...props }) => (
      <ul className="space-y-3 my-6 text-gray-300" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }) => (
      <ol className="space-y-3 my-6 text-gray-300 list-decimal list-inside" {...props}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }) => (
      <li className="flex items-start gap-3" {...props}>
        <span style={{ color: '#00D084' }}>•</span>
        <span className="flex-1">{children}</span>
      </li>
    ),
    a: ({ children, href, ...props }) => (
      <Link 
        href={href || '#'} 
        className="text-[#00D084] hover:text-[#00F0A0] transition-colors underline"
        {...props}
      >
        {children}
      </Link>
    ),
    strong: ({ children, ...props }) => (
      <strong className="font-semibold text-white" {...props}>
        {children}
      </strong>
    ),
    blockquote: ({ children, ...props }) => (
      <blockquote 
        className="border-l-4 pl-6 py-4 my-6 italic text-gray-400"
        style={{ borderColor: '#00D084' }}
        {...props}
      >
        {children}
      </blockquote>
    ),
    code: ({ children, ...props }) => (
      <code 
        className="px-2 py-1 rounded text-sm font-mono"
        style={{ backgroundColor: '#1a1d24', color: '#00D084' }}
        {...props}
      >
        {children}
      </code>
    ),
    pre: ({ children, ...props }) => (
      <pre 
        className="p-4 rounded-xl overflow-x-auto my-6"
        style={{ backgroundColor: '#1a1d24', border: '1px solid #2d3441' }}
        {...props}
      >
        {children}
      </pre>
    ),
    ...components,
  };
}




