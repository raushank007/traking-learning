import Link from 'next/link';
import { Metadata } from 'next';
import { getAllPosts } from '../../lib/markdown';

export const metadata: Metadata = {
  title: "Timeline Archive | Raushan's Dev Blog",
  description: 'A complete chronological archive of all my daily learning logs.',
};

function formatMonthYear(yyyyMm: string) {
  if (yyyyMm === 'Unknown') return 'Undated';
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
      <header className="mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
          Timeline Archive
        </h1>
        <p className="text-lg text-slate-500">Everything organized chronologically.</p>
      </header>

      <div className="space-y-16">
        {sortedMonths.map((month) => (
          <section key={month} className="relative">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 sticky top-0 bg-slate-50/90 backdrop-blur-md py-4 z-10 border-b border-slate-200">
              {formatMonthYear(month)}
            </h2>

            <div className="space-y-3">
              {groupedPosts[month].map(({ slug, meta }) => (
                <Link
                  key={slug}
                  href={`/${slug}`}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white rounded-xl border border-slate-200 hover:shadow-md hover:border-blue-300 transition-all"
                >
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                      {meta.title || slug}
                    </span>

                    <div className="flex gap-2 mt-3 items-center">
                      {/* CATEGORY BADGE */}
                      <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded">
                        {meta.category || 'General'}
                      </span>

                      {/* TAGS */}
                      {meta.tags && meta.tags.map(tag => (
                        <span key={tag} className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* DATE PANEL (Time removed) */}
                  <div className="flex flex-col items-start sm:items-end mt-4 sm:mt-0">
                    <span className="text-sm font-bold text-slate-500 whitespace-nowrap">
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