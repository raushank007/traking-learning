import Link from 'next/link';
import { Metadata } from 'next';
import { getAllPosts } from '../../lib/markdown';

export const metadata: Metadata = {
  // THEME UPDATE: Renamed SEO Title
  title: "History Poneglyphs | The Grand Line Logbook",
  description: 'A complete chronological archive of all my daily learning logs.',
};

function formatMonthYear(yyyyMm: string) {
  if (yyyyMm === 'Unknown') return 'Uncharted';
  const [year, month] = yyyyMm.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default async function ArchivesPage() {
  const posts = getAllPosts();

  const groupedPosts = posts.reduce((acc, post) => {
    const dateStr = post.meta.date || 'Unknown';
    const yearMonth = dateStr !== 'Unknown' ? dateStr.substring(0, 7) : 'Unknown';
    if (!acc[yearMonth]) acc[yearMonth] = [];
    acc[yearMonth].push(post);
    return acc;
  }, {} as Record<string, typeof posts>);

  const sortedMonths = Object.keys(groupedPosts).sort((a, b) => b.localeCompare(a));

  return (
    <div className="max-w-4xl mx-auto py-8">

      {/* ☠️ PIRATE THEMED HEADER */}
      <header className="mb-16">
        <h1 className="font-pirate text-5xl md:text-6xl tracking-widest text-slate-900 mb-4 drop-shadow-sm">
          History Poneglyphs
        </h1>
        <p className="text-lg text-amber-700/80 font-medium">
          The complete chronological record of the journey.
        </p>
      </header>

      <div className="space-y-16">
        {sortedMonths.map((month) => (
          <section key={month} className="relative">

            {/* STICKY MONTH HEADER (Parchment Vibe) */}
            <h2 className="font-pirate text-3xl tracking-wider text-amber-900 mb-6 sticky top-0 bg-amber-50/95 backdrop-blur-md py-4 z-10 border-b border-amber-200/80 flex items-center gap-3">
              <span className="text-2xl grayscale opacity-70">📜</span>
              {formatMonthYear(month)}
            </h2>

            <div className="space-y-3">
              {groupedPosts[month].map(({ slug, meta }) => (
                <Link
                  key={slug}
                  href={`/${slug}`}
                  // Updated to look like individual logbook entries
                  className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white/60 backdrop-blur-sm rounded-xl border border-amber-200/60 hover:bg-white/95 hover:shadow-md hover:border-red-300 transition-all duration-300"
                >
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-slate-800 group-hover:text-red-600 transition-colors">
                      {meta.title || slug}
                    </span>

                    <div className="flex gap-2 mt-3 items-center">
                      {/* CATEGORY BADGE (Gold/Amber) */}
                      <span className="text-[10px] font-black text-amber-900 uppercase tracking-widest bg-amber-200/60 border border-amber-300/50 px-2 py-1 rounded">
                        {meta.category || 'General'}
                      </span>

                      {/* TAGS */}
                      {meta.tags && meta.tags.map(tag => (
                        <span key={tag} className="text-[10px] font-bold text-amber-600/70 uppercase tracking-wider group-hover:text-amber-600 transition-colors">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* DATE PANEL */}
                  <div className="flex flex-col items-start sm:items-end mt-4 sm:mt-0">
                    <span className="text-sm font-bold text-amber-700/60 whitespace-nowrap flex items-center gap-1.5">
                      <span className="text-xs grayscale opacity-50 group-hover:opacity-100 transition-opacity">⏳</span>
                      {meta.date}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

          </section>
        ))}
      </div>
    </div>
  );
}