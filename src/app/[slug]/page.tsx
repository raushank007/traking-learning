import { getPostBySlug, getAllSlugs } from '../../lib/markdown';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import GithubSlugger from 'github-slugger';
import 'highlight.js/styles/github-dark.css';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import Mermaid from '@/components/Mermaid';

// 1. Pre-render all markdown pages at build time
export async function generateStaticParams() {
  const slugs = getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

// 2. DYNAMIC SEO UPGRADE: Generates rich preview cards for Twitter/LinkedIn
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const { meta } = getPostBySlug(resolvedParams.slug);

    return {
      title: `${meta.title} | Raushan's Dev Blog`,
      description: meta.summary || 'A technical deep dive and notes.',
      openGraph: {
        title: meta.title,
        description: meta.summary,
        type: 'article',
        authors: ['Raushan'],
      },
      twitter: {
        card: 'summary_large_image',
        title: meta.title,
        description: meta.summary,
      }
    };
  } catch (error) {
    return { title: 'Not Found' };
  }
}

export default async function MarkdownPage({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const resolvedParams = await params;

    // Extract content, metadata, and the newly added readingTime
    const { content, meta, readingTime } = getPostBySlug(resolvedParams.slug);

    // Initialize the slugger for the Table of Contents
    const slugger = new GithubSlugger();

    // Extract Headings (Level 1 and 2) to build the TOC
    const headings = Array.from(content.matchAll(/^(#{1,2})\s+(.+)$/gm)).map((match) => {
      const level = match[1].length;
      const rawText = match[2].replace(/\*\*/g, '').trim();
      const slug = slugger.slug(rawText);
      return { level, text: rawText, slug };
    });

    return (
      // Standard desktop-first layout: Article on the left, TOC on the right
      <div className="max-w-6xl mx-auto flex gap-12 items-start">

        {/* Main Markdown Content Area */}
        <article className="prose prose-slate prose-blue max-w-3xl flex-1 w-full min-w-0">

          {/* UPGRADED PUBLIC HEADER */}
          <header className="mb-10 pb-8 border-b border-slate-200">
            {meta.tags && (
              <div className="flex gap-2 mb-4">
                {meta.tags.map(tag => (
                  <span key={tag} className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {meta.title && <h1 className="mb-4 text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900">{meta.title}</h1>}

            <div className="flex items-center gap-4 text-sm text-slate-500 font-medium mt-6">
              <div className="flex items-center gap-2">
                {/* Author Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold shadow-sm">
                  R
                </div>
                <span className="text-slate-700">Raushan</span>
              </div>
              <span>&bull;</span>
              <time dateTime={meta.date}>{meta.date}</time>

              {/* Optional fallback in case readingTime wasn't added to markdown.ts yet */}
              {readingTime && (
                <>
                  <span>&bull;</span>
                  <span>{readingTime}</span>
                </>
              )}
            </div>
          </header>

          {/* Render the actual Markdown content with syntax highlighting and anchor links */}
          <ReactMarkdown
            rehypePlugins={[rehypeHighlight, rehypeSlug]}
            components={{
              code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');

                if (match && match[1] === 'mermaid') {
                  return <Mermaid chart={String(children).replace(/\n$/, '')} />;
                }

                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              }
            }}
          >
            {content}
          </ReactMarkdown>
        </article>

        {/* Table of Contents Sidebar */}
        {headings.length > 0 && (
          <aside className="w-72 shrink-0 sticky top-8">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                Topics in this log
              </h3>
              <ul className="space-y-3 text-sm">
                {headings.map((h, i) => (
                  <li
                    key={i}
                    // Indent h2 tags slightly for visual hierarchy
                    style={{ marginLeft: `${(h.level - 1) * 1}rem` }}
                  >
                    <Link
                      href={`#${h.slug}`}
                      className="text-slate-600 hover:text-blue-600 font-medium transition-colors block"
                    >
                      {h.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        )}

      </div>
    );
  } catch (error) {
    console.error("Markdown parsing error:", error);
    notFound();
  }
}