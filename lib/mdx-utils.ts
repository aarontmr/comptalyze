import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface ArticleMetadata {
  title: string;
  description: string;
  category: string;
  readTime: string;
  date: string;
  keywords?: string[];
  author?: string;
  faq?: Array<{
    question: string;
    answer: string;
  }>;
}

export interface Article {
  slug: string;
  metadata: ArticleMetadata;
  content: string;
}

const articlesDirectory = path.join(process.cwd(), 'content', 'blog');

export function getAllArticleSlugs(): string[] {
  try {
    const fileNames = fs.readdirSync(articlesDirectory);
    return fileNames
      .filter(fileName => fileName.endsWith('.mdx'))
      .map(fileName => fileName.replace(/\.mdx$/, ''));
  } catch {
    return [];
  }
}

export function getArticleBySlug(slug: string): Article | null {
  try {
    const fullPath = path.join(articlesDirectory, `${slug}.mdx`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      slug,
      metadata: data as ArticleMetadata,
      content,
    };
  } catch {
    return null;
  }
}

export function getAllArticles(): Article[] {
  const slugs = getAllArticleSlugs();
  return slugs
    .map(slug => getArticleBySlug(slug))
    .filter((article): article is Article => article !== null)
    .sort((a, b) => {
      return new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime();
    });
}

export interface Heading {
  id: string;
  text: string;
  level: number;
}

export function extractHeadings(content: string): Heading[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const headings: Heading[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

    headings.push({ id, text, level });
  }

  return headings;
}




