import { getPostBySlug, getAllSlugs } from '../../lib/markdown';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import remarkMath from 'remark-math';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import rehypeRaw from 'rehype-raw';
import rehypeKatex from 'rehype-katex';

// Stylesheets
import 'highlight.js/styles/github-dark.css';
import 'katex/dist/katex.min.css';

import { notFound } from 'next/navigation';
import { Metadata } from 'next';

// Components
import Mermaid from '@/components/Mermaid';

// --- HELPER FUNCTION ---
function calculateMinutes(start?: string, end?: string): number {
  if (!start || !end) return 0;

  const [startHr, startMin] = start.split(':').map(Number);
  const [endHr, endMin] = end.split(':').map(Number);

  let diff = (endHr * 60 + endMin) - (startHr * 60 + startMin);

  if (diff < 0) diff += 24 * 60;

  return diff || 0;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const { meta } = getPostBySlug(resolvedParams.slug);

    return {
      title: `${meta.title} | The Grand Line Logbook`,
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

    const totalMinutes = meta.sessions
      ? meta.sessions.reduce((acc, session) => acc + calculateMinutes(session.startTime, session.endTime), 0)
      : 0;

    const formattedTime = totalMinutes >= 60
      ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`
      : `${totalMinutes} mins`;

    return (
      // Changed max-w-7xl back to max-w-4xl for a centered, focused reading experience
      <div className="w-full max-w-4xl mx-auto py-8">

        <article className="prose prose-slate prose-headings:font-pirate prose-headings:font-normal prose-headings:tracking-wide prose-a:text-red-600 hover:prose-a:text-red-700 prose-strong:text-slate-800 prose-code:before:content-none prose-code:after:content-none max-w-none w-full">

          <header className="mb-10 pb-8 border-b border-amber-200/80">
            {meta.tags && (
              <div className="flex gap-2 mb-6 flex-wrap">
                {meta.tags.map(tag => (
                  <span key={tag} className="text-[10px] font-bold text-amber-800 bg-amber-200/50 px-2 py-1 rounded-sm uppercase tracking-widest border border-amber-200">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {meta.title && (
              <h1 className="mb-4 text-4xl md:text-6xl font-pirate tracking-widest text-slate-900 drop-shadow-sm">
                {meta.title}
              </h1>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-amber-700/80 font-semibold mt-8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-red-500 to-amber-400 flex items-center justify-center text-white font-bold shadow-sm border-2 border-white shrink-0">
                  R
                </div>
                <span className="text-slate-800">Raushan</span>
              </div>

              <span className="hidden sm:inline opacity-50">&bull;</span>
              <time dateTime={meta.date} className="flex items-center gap-1.5">
                <span className="text-base grayscale opacity-60">📅</span> {meta.date}
              </time>

              {readingTime && (
                <>
                  <span className="hidden sm:inline opacity-50">&bull;</span>
                  <span className="flex items-center gap-1.5">
                    <span className="text-base grayscale opacity-60">📖</span> {readingTime}
                  </span>
                </>
              )}

              {totalMinutes > 0 && (
                <>
                  <span className="hidden sm:inline opacity-50">&bull;</span>
                  <div className="flex items-center gap-1.5 bg-red-50 text-red-700 px-3 py-1 rounded-md font-bold shadow-sm border border-red-200/60">
                    <span>⏳</span>
                    {formattedTime} total
                    <span className="text-red-500/70 font-medium ml-1">
                      ({meta.sessions?.length} {meta.sessions?.length === 1 ? 'session' : 'sessions'})
                    </span>
                  </div>
                </>
              )}
            </div>
          </header>

          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
            rehypePlugins={[rehypeRaw, rehypeHighlight, rehypeSlug, rehypeKatex]}
            components={{
              code({ className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '');

                if (match && match[1] === 'mermaid') {
                  return <Mermaid chart={String(children).replace(/\n$/, '')} />;
                }

                // If it has a language or was highlighted, it's a block of code
                if (className?.includes('hljs') || match) {
                  return <code className={className} {...props}>{children}</code>;
                }

                // IntelliJ/GitHub styled inline code interceptor
                return (
                  <code
                    className="bg-slate-200/80 text-slate-800 px-1.5 py-0.5 rounded-md font-mono text-[0.85em] font-semibold border border-slate-300/60 shadow-sm"
                    {...props}
                  >
                    {children}
                  </code>
                );
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