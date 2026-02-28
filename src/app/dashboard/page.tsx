import { getAllPosts } from '@/lib/markdown';
import Link from 'next/link';

export default function DashboardPage() {
  const posts = getAllPosts();

  // 1. Calculate Categories (Ensuring our 4 main buckets exist)
  const categoryCounts: Record<string, number> = {
    coding: 0,
    hld: 0,
    lld: 0,
    general: 0,
  };

  // 2. Calculate Tags and Dates
  const tagCounts: Record<string, number> = {};
  const dateCounts: Record<string, number> = {};

  posts.forEach(post => {
    // Count Categories
    const cat = (post.meta.category || 'general').toLowerCase();
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

    // Count Tags
    post.meta.tags?.forEach(tag => {
      const normalizedTag = tag.toLowerCase();
      tagCounts[normalizedTag] = (tagCounts[normalizedTag] || 0) + 1;
    });

    // Count Dates
    if (post.meta.date) {
      dateCounts[post.meta.date] = (dateCounts[post.meta.date] || 0) + 1;
    }
  });

  // Sort data for display
  const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 12); // Show top 12 tags
  const sortedDates = Object.entries(dateCounts).sort((a, b) => b[0].localeCompare(a[0]));

  // Visual mapping for categories
  const categoryMeta: Record<string, { label: string, icon: string, color: string }> = {
    coding: { label: 'Coding / LeetCode', icon: '💻', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    hld: { label: 'High-Level Design', icon: '🏗️', color: 'text-blue-600 bg-blue-50 border-blue-200' },
    lld: { label: 'Low-Level Design', icon: '⚙️', color: 'text-purple-600 bg-purple-50 border-purple-200' },
    general: { label: 'General / Notes', icon: '📝', color: 'text-slate-600 bg-slate-50 border-slate-200' },
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
          Progress Dashboard
        </h1>
        <p className="text-lg text-slate-500">
          Total logs tracked: <strong className="text-blue-600">{posts.length}</strong>
        </p>
      </header>

      {/* 🌟 NEW: MAIN CATEGORY OVERVIEW 🌟 */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          📊 Main Categories
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(categoryCounts).map(([catKey, count]) => {
            const meta = categoryMeta[catKey] || categoryMeta.general;
            return (
              <Link
                key={catKey}
                href={`/category/${catKey}`}
                className={`p-6 rounded-2xl border flex flex-col items-start justify-between hover:shadow-md transition-all group ${meta.color}`}
              >
                <div className="text-3xl mb-4 opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-transform">
                  {meta.icon}
                </div>
                <div>
                  <div className="text-4xl font-black mb-1">{count}</div>
                  <div className="text-xs font-bold uppercase tracking-widest opacity-80">
                    {meta.label}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

        {/* Top Tags Analytics */}
        <section>
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            🏷️ Top Topics & Tags
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {sortedTags.map(([tag, count]) => (
              <div key={tag} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center hover:border-blue-300 transition-colors">
                <span className="text-2xl font-black text-slate-800 mb-1">{count}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate w-full px-2">#{tag}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Date / Activity Analytics */}
        <section>
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            📅 Activity Timeline
          </h2>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <ul className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
              {sortedDates.map(([date, count]) => (
                <li key={date}>
                  <Link
                    href={`/date/${date}`}
                    className="flex justify-between items-center p-4 hover:bg-slate-50 transition-colors group"
                  >
                    <span className="font-medium text-slate-700 group-hover:text-blue-600">{date}</span>
                    <span className="bg-slate-100 text-slate-600 py-1 px-3 rounded-full text-xs font-bold">
                      {count} {count === 1 ? 'log' : 'logs'}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

      </div>
    </div>
  );
}