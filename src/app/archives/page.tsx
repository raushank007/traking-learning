import Link from 'next/link';
import { Metadata } from 'next';
import { getAllPosts } from '../../lib/markdown';

// SEO Metadata for the Archive Page
export const metadata: Metadata = {
  title: "Timeline Archive | Raushan's Dev Blog",
  description: 'A complete chronological archive of all my daily learning logs, system design notes, and algorithm practice.',
};

// Safely format "2026-02" into "February 2026" without timezone parsing bugs
function formatMonthYear(yyyyMm: string) {
  if (yyyyMm === 'Unknown') return 'Undated';
  const [year, month] = yyyyMm.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default async function ArchivesPage() {
  const posts = getAllPosts();

  // Group posts by Year-Month (e.g., "2026-02": [post1, post2])
  const groupedPosts = posts.reduce((acc, post) => {
    const dateStr = post.meta.date || 'Unknown';
    // Extract just the YYYY-MM part from "YYYY-MM-DD"
    const yearMonth = dateStr !== 'Unknown' ? dateStr.substring(0, 7) : 'Unknown';

    if (!acc[yearMonth]) acc[yearMonth] = [];
    acc[yearMonth].push(post);
    return acc;
  }, {} as Record<string, typeof posts>);

  // Sort the groups so the newest months appear first
  const sortedMonths = Object.keys(groupedPosts).sort((a, b) => b.localeCompare(a));

  return (
    <div className="max-w-4xl mx-auto py-8">

      {/* Page Header */}
      <header className="mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
          Timeline Archive
        </h1>
        <p className="text-lg text-slate-500">
          Everything I've learned, organized chronologically by month.
        </p>
      </header>

      {/* Timeline List */}
      <div className="space-y-16">
        {sortedMonths.map((month) => (
          <section key={month} className="relative">

            {/* Sticky Month Header */}
            <h2 className="text-2xl font-bold text-slate-900 mb-6 sticky top-0 bg-slate-50/90 backdrop-blur-md py-4 z-10 border-b border-slate-200">
              {formatMonthYear(month)}
            </h2>

            <div className="space-y-2">
              {groupedPosts[month].map(({ slug, meta }) => (
                <Link
                  key={slug}
                  href={`/${slug}`}
                  // Modern hover effects: subtle white background, soft shadow, and border reveal
                  className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 -mx-4 rounded-2xl hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all"
                >
                  <div className="flex flex-col">
                    <span className="text-lg font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                      {meta.title || slug}
                    </span>

                    {/* Tags */}
                    {meta.tags && (
                      <div className="flex gap-2 mt-2">
                        {meta.tags.map(tag => (
                          <span key={tag} className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Exact Date aligned to the right on desktop */}
                  <span className="text-sm font-medium text-slate-400 whitespace-nowrap mt-3 sm:mt-0">
                    {meta.date}
                  </span>
                </Link>
              ))}
            </div>

          </section>
        ))}

        {posts.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            No archives found.
          </div>
        )}
      </div>

    </div>
  );
}