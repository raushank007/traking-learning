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

// --- HELPER FUNCTION ---
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

    // 1. Automatically calculate total minutes using our new helper
    const totalMinutes = meta.sessions
      ? meta.sessions.reduce((acc, session) => acc + calculateMinutes(session.startTime, session.endTime), 0)
      : 0;

    // 2. Format it beautifully
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
        {/* 🌟 THEME UPDATE:
            Changed prose-blue to custom modifiers.
            prose-headings:font-pirate makes all your markdown ## headers use the custom font!
            prose-a:text-red-600 makes your markdown links red.
        */}
        <article className="prose prose-slate prose-headings:font-pirate prose-headings:font-normal prose-headings:tracking-wide prose-a:text-red-600 hover:prose-a:text-red-700 prose-strong:text-slate-800 max-w-none w-full">

          {/* UPGRADED PIRATE HEADER */}
          <header className="mb-10 pb-8 border-b border-amber-200/80">
            {meta.tags && (
              <div className="flex gap-2 mb-6">
                {meta.tags.map(tag => (
                  <span key={tag} className="text-[10px] font-bold text-amber-800 bg-amber-200/50 px-2 py-1 rounded-sm uppercase tracking-widest border border-amber-200">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Title using font-pirate */}
            {meta.title && (
              <h1 className="mb-4 text-4xl md:text-6xl font-pirate tracking-widest text-slate-900 drop-shadow-sm">
                {meta.title}
              </h1>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-amber-700/80 font-semibold mt-8">
              <div className="flex items-center gap-2">
                {/* Strawhat Avatar (Red to Gold) */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-red-500 to-amber-400 flex items-center justify-center text-white font-bold shadow-sm border-2 border-white">
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

              {/* AUTOMATIC TIME TRACKER - Red Themed */}
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

          {/* Render the actual Markdown content */}
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