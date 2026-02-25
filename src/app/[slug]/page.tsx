import { getPostBySlug, getAllSlugs } from '../../lib/markdown';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  const slugs = getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

// 1. Update the type to Promise<{ slug: string }>
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const resolvedParams = await params; // 2. Await the params
    const { meta } = getPostBySlug(resolvedParams.slug);
    return {
      title: `${meta.title || 'Documentation'} | My Dev Site`,
    };
  } catch (error) {
    return { title: 'Page Not Found' };
  }
}

// 1. Update the type here as well
export default async function MarkdownPage({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const resolvedParams = await params; // 2. Await the params
    const { content, meta } = getPostBySlug(resolvedParams.slug);

    return (
      <article className="prose prose-blue max-w-4xl mx-auto">
        {meta.title && <h1>{meta.title}</h1>}
        <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
          {content}
        </ReactMarkdown>
      </article>
    );
  } catch (error) {
    // If we land here, it means getPostBySlug failed (file not found or typo)
    console.error("Markdown parsing error:", error);
    notFound();
  }
}