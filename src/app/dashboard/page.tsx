import { getAllSlugs, getPostBySlug } from '@/lib/markdown';
import Link from 'next/link';

// Helper: Calculate minutes between 24-hour times (e.g., "14:30" to "16:00")
function calculateStudyMinutes(start?: string, end?: string): number {
  if (!start || !end) return 0;
  const [startHr, startMin] = start.split(':').map(Number);
  const [endHr, endMin] = end.split(':').map(Number);
  let diff = (endHr * 60 + endMin) - (startHr * 60 + startMin);

  // Handles studying past midnight (e.g., 23:30 to 01:00)
  if (diff < 0) diff += 24 * 60;
  return diff || 0;
}

// Helper: Format minutes into "Xh Ym"
function formatTime(totalMinutes: number): string {
  if (!totalMinutes || totalMinutes === 0) return '0 mins';
  return totalMinutes >= 60
    ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`
    : `${totalMinutes} mins`;
}

export default function DashboardPage() {
  // Use getPostBySlug to ensure we load the full content and readingTime for calculations
  const slugs = getAllSlugs();
  const posts = slugs.map(slug => getPostBySlug(slug));

  // 1. Initialize Global Totals
  let globalStudyMins = 0;
  let globalReadMins = 0;

  // 2. Initialize Category Stats
  const categoryStats: Record<string, { count: number; studyMins: number; readMins: number }> = {
    coding: { count: 0, studyMins: 0, readMins: 0 },
    hld: { count: 0, studyMins: 0, readMins: 0 },
    lld: { count: 0, studyMins: 0, readMins: 0 },
    general: { count: 0, studyMins: 0, readMins: 0 },
  };

  // 3. Initialize Tag and Date Analytics
  const tagCounts: Record<string, number> = {};
  const dateCounts: Record<string, number> = {};

  // 4. Process all posts to calculate stats
  posts.forEach(post => {
    // A. Determine Category
    const cat = (post.meta.category || 'general').toLowerCase();
    if (!categoryStats[cat]) categoryStats[cat] = { count: 0, studyMins: 0, readMins: 0 };
    categoryStats[cat].count += 1;

    // B. Calculate Study Time (from sessions array)
    const postStudyMins = post.meta.sessions
      ? post.meta.sessions.reduce((acc, s) => acc + calculateStudyMinutes(s.startTime, s.endTime), 0)
      : 0;

    globalStudyMins += postStudyMins;
    categoryStats[cat].studyMins += postStudyMins;

    // C. Calculate Reading Time
    let postReadMins = 0;
    if (post.readingTime) {
      // If readingTime is "5 min read", extract the integer
      postReadMins = parseInt(post.readingTime) || 0;
    } else if (post.content) {
      // Fallback: calculate word count (roughly 200 words per minute reading speed)
      postReadMins = Math.ceil(post.content.split(/\s+/).length / 200);
    }

    globalReadMins += postReadMins;
    categoryStats[cat].readMins += postReadMins;

    // D. Track Tags
    post.meta.tags?.forEach(tag => {
      const normalizedTag = tag.toLowerCase();
      tagCounts[normalizedTag] = (tagCounts[normalizedTag] || 0) + 1;
    });

    // E. Track Dates
    if (post.meta.date) {
      dateCounts[post.meta.date] = (dateCounts[post.meta.date] || 0) + 1;
    }
  });

  // Sort data for display
  const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 12);
  const sortedDates = Object.entries(dateCounts).sort((a, b) => b[0].localeCompare(a[0]));

  // Visual mapping for categories
  const categoryMeta: Record<string, { label: string, icon: string, color: string }> = {
    coding: { label: 'Coding / LeetCode', icon: '💻', color: 'border-emerald-200 hover:border-emerald-400' },
    hld: { label: 'High-Level Design', icon: '🏗️', color: 'border-blue-200 hover:border-blue-400' },
    lld: { label: 'Low-Level Design', icon: '⚙️', color: 'border-purple-200 hover:border-purple-400' },
    general: { label: 'General / Notes', icon: '📝', color: 'border-slate-200 hover:border-slate-400' },
  };

  return (
    <div className="max-w-5xl mx-auto py-8">

      {/* 🌟 GLOBAL STATS HEADER 🌟 */}
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-8">
          Progress Dashboard
        </h1>

        <div className="flex flex-wrap gap-4">
          <div className="bg-white border border-slate-200 px-5 py-4 rounded-xl shadow-sm flex-1 min-w-[200px]">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Logs</div>
            <div className="text-3xl font-black text-slate-800">{posts.length}</div>
          </div>

          <div className="bg-blue-50 border border-blue-200 px-5 py-4 rounded-xl shadow-sm flex-1 min-w-[200px]">
            <div className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span>⏱️</span> Total Study Time
            </div>
            <div className="text-3xl font-black text-blue-800">{formatTime(globalStudyMins)}</div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 px-5 py-4 rounded-xl shadow-sm flex-1 min-w-[200px]">
            <div className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span>📖</span> Total Read Time
            </div>
            <div className="text-3xl font-black text-emerald-800">{formatTime(globalReadMins)}</div>
          </div>
        </div>
      </header>

      {/* 🌟 DETAILED CATEGORY CARDS 🌟 */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          📊 Category Breakdown
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(categoryStats).map(([catKey, stats]) => {
            const meta = categoryMeta[catKey] || categoryMeta.general;

            return (
              <Link
                key={catKey}
                href={`/category/${catKey}`}
                className={`bg-white p-5 rounded-2xl border flex flex-col hover:shadow-md transition-all group ${meta.color}`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl group-hover:scale-110 transition-transform">{meta.icon}</span>
                  <span className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {meta.label}
                  </span>
                </div>

                <div className="space-y-3 mt-auto">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Logs</span>
                    <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">{stats.count}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Study Time</span>
                    <span className="font-bold text-blue-600">{formatTime(stats.studyMins)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-t border-slate-100 pt-3">
                    <span className="text-slate-500 font-medium">Read Time</span>
                    <span className="font-bold text-emerald-600">{formatTime(stats.readMins)}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* TOP TAGS & ACTIVITY TIMELINE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
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

        <section>
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            📅 Activity Timeline
          </h2>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <ul className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
              {sortedDates.map(([date, count]) => (
                <li key={date}>
                  <Link href={`/date/${date}`} className="flex justify-between items-center p-4 hover:bg-slate-50 transition-colors group">
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