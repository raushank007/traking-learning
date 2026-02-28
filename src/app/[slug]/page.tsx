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

// --- NEW HELPER FUNCTION ---
function calculateMinutes(start?: string, end?: string): number {
  if (!start || !end) return 0;

  const [startHr, startMin] = start.split(':').map(Number);
  const [endHr, endMin] = end.split(':').map(Number);

  let diff = (endHr * 60 + endMin) - (startHr * 60 + startMin);

  // Handles the edge case if you study past midnight (e.g., 23:30 to 01:00)
  if (diff < 0) diff += 24 * 60;

  return diff || 0;
}

export async function generateStaticParams() {
  const slugs = getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  // ... (keep your existing generateMetadata exactly the same) ...
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
    const { content, meta, readingTime } = getPostBySlug(resolvedParams.slug);

    // 1. Automatically calculate total minutes using our new helper
    const totalMinutes = meta.sessions
      ? meta.sessions.reduce((acc, session) => acc + calculateMinutes(session.startTime, session.endTime), 0)
      : 0;

    // 2. Format it beautifully (e.g., "1h 30m" instead of "90 mins")
    const formattedTime = totalMinutes >= 60
      ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`
      : `${totalMinutes} mins`;

    const slugger = new GithubSlugger();
    const headings = Array.from(content.matchAll(/^(#{1,2})\s+(.+)$/gm)).map((match) => {
      const level = match[1].length;
      const rawText = match[2].replace(/\*\*/g, '').trim();
      const slug = slugger.slug(rawText);
      return { level, text: rawText, slug };
    });

    return (
      <div className="w-full max-w-7xl mx-auto">
        <article className="prose prose-slate prose-blue max-w-none w-full">

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

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 font-medium mt-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold shadow-sm">
                  R
                </div>
                <span className="text-slate-700">Raushan</span>
              </div>

              <span className="hidden sm:inline">&bull;</span>
              <time dateTime={meta.date}>Started: {meta.date}</time>

              {readingTime && (
                <>
                  <span className="hidden sm:inline">&bull;</span>
                  <span>{readingTime}</span>
                </>
              )}

              {/* AUTOMATIC TIME TRACKER */}
              {totalMinutes > 0 && (
                <>
                  <span className="hidden sm:inline">&bull;</span>
                  <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md font-bold shadow-sm border border-blue-100">
                    <span>⏱️</span>
                    {formattedTime} total
                    <span className="text-blue-400 font-normal ml-1">
                      ({meta.sessions?.length} {meta.sessions?.length === 1 ? 'session' : 'sessions'})
                    </span>
                  </div>
                </>
              )}
            </div>
          </header>

          <ReactMarkdown
            rehypePlugins={[rehypeHighlight, rehypeSlug]}
            components={{
              code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                if (match && match[1] === 'mermaid') {
                  return <Mermaid chart={String(children).replace(/\n$/, '')} />;
                }
                return <code className={className} {...props}>{children}</code>;
              }
            }}
          >
            {content}
          </ReactMarkdown>
        </article>
      </div>
    );
  } catch (error) {
    console.error("Markdown parsing error:", error);
    notFound();
  }
}