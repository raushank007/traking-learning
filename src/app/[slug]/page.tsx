import { getPostBySlug, getAllSlugs } from '../../lib/markdown';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import GithubSlugger from 'github-slugger';
import 'highlight.js/styles/github-dark.css';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export async function generateStaticParams() {
  const slugs = getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const resolvedParams = await params;
    const { meta } = getPostBySlug(resolvedParams.slug);
    return {
      title: `${meta.title || 'Documentation'} | Daily Log`,
    };
  } catch (error) {
    return { title: 'Page Not Found' };
  }
}

export default async function MarkdownPage({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const resolvedParams = await params;
    const { content, meta } = getPostBySlug(resolvedParams.slug);

    // 1. Initialize the slugger
    const slugger = new GithubSlugger();

    // 2. Extract Headings (Level 1 and 2) to build the Table of Contents
    const headings = Array.from(content.matchAll(/^(#{1,2})\s+(.+)$/gm)).map((match) => {
      const level = match[1].length;
      // Strip markdown syntax like ** out of the display text
      const rawText = match[2].replace(/\*\*/g, '').trim();
      // Generate the URL-safe slug
      const slug = slugger.slug(rawText);
      return { level, text: rawText, slug };
    });

    return (
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12 items-start">

        {/* Main Markdown Content Area */}
        <article className="prose prose-blue max-w-3xl flex-1 w-full">
          {meta.title && <h1 className="mb-2">{meta.title}</h1>}
          {meta.date && <p className="text-gray-500 mt-0 mb-8">{meta.date}</p>}

          {/* Add rehypeSlug to the plugins array */}
          <ReactMarkdown rehypePlugins={[rehypeHighlight, rehypeSlug]}>
            {content}
          </ReactMarkdown>
        </article>

        {/* Table of Contents Sidebar */}
        {headings.length > 0 && (
          <aside className="w-full lg:w-72 shrink-0 lg:sticky lg:top-8">
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
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
                      className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
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