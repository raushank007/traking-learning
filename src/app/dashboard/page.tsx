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
  const slugs = getAllSlugs();
  const posts = slugs.map(slug => getPostBySlug(slug));

  let globalStudyMins = 0;
  let globalReadMins = 0;

  const categoryStats: Record<string, { count: number; studyMins: number; readMins: number }> = {
    coding: { count: 0, studyMins: 0, readMins: 0 },
    hld: { count: 0, studyMins: 0, readMins: 0 },
    lld: { count: 0, studyMins: 0, readMins: 0 },
    general: { count: 0, studyMins: 0, readMins: 0 },
  };

  const tagCounts: Record<string, number> = {};
  const dateCounts: Record<string, number> = {};

  posts.forEach(post => {
    const cat = (post.meta.category || 'general').toLowerCase();
    if (!categoryStats[cat]) categoryStats[cat] = { count: 0, studyMins: 0, readMins: 0 };
    categoryStats[cat].count += 1;

    const postStudyMins = post.meta.sessions
      ? post.meta.sessions.reduce((acc, s) => acc + calculateStudyMinutes(s.startTime, s.endTime), 0)
      : 0;

    globalStudyMins += postStudyMins;
    categoryStats[cat].studyMins += postStudyMins;

    let postReadMins = 0;
    if (post.readingTime) {
      postReadMins = parseInt(post.readingTime) || 0;
    } else if (post.content) {
      postReadMins = Math.ceil(post.content.split(/\s+/).length / 200);
    }

    globalReadMins += postReadMins;
    categoryStats[cat].readMins += postReadMins;

    post.meta.tags?.forEach(tag => {
      const normalizedTag = tag.toLowerCase();
      tagCounts[normalizedTag] = (tagCounts[normalizedTag] || 0) + 1;
    });

    if (post.meta.date) {
      dateCounts[post.meta.date] = (dateCounts[post.meta.date] || 0) + 1;
    }
  });

  const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 12);
  const sortedDates = Object.entries(dateCounts).sort((a, b) => b[0].localeCompare(a[0]));

  // 🌟 THEME UPDATE: One Piece Visual Mapping
  const categoryMeta: Record<string, { label: string, icon: string, color: string, textColor: string }> = {
    coding: { label: 'Pirate Code (LeetCode)', icon: '🏴‍☠️', color: 'border-red-200 hover:border-red-400', textColor: 'text-red-700' },
    hld: { label: 'Fortresses (HLD)', icon: '🏰', color: 'border-amber-300 hover:border-amber-500', textColor: 'text-amber-700' },
    lld: { label: 'Swordsmanship (LLD)', icon: '⚔️', color: 'border-emerald-200 hover:border-emerald-400', textColor: 'text-emerald-700' },
    general: { label: 'Poneglyphs (Notes)', icon: '📜', color: 'border-sky-200 hover:border-sky-400', textColor: 'text-sky-700' },
  };

  return (
    <div className="max-w-5xl mx-auto py-8">

      {/* ☠️ PIRATE THEMED HEADER */}
      <header className="mb-12">
        <h1 className="font-pirate text-5xl md:text-6xl tracking-widest text-slate-900 mb-8 drop-shadow-sm">
          The Bounty Board
        </h1>

        <div className="flex flex-wrap gap-4">
          {/* Total Logs Card */}
          <div className="bg-white/80 backdrop-blur-sm border border-amber-200 px-5 py-4 rounded-xl shadow-sm flex-1 min-w-[200px]">
            <div className="text-xs font-bold text-amber-600/70 uppercase tracking-widest mb-1 flex items-center gap-2">
              <span>🗺️</span> Charted Logs
            </div>
            <div className="text-3xl font-black text-slate-800">{posts.length}</div>
          </div>

          {/* Study Time Card */}
          <div className="bg-red-50/80 border border-red-200 px-5 py-4 rounded-xl shadow-sm flex-1 min-w-[200px]">
            <div className="text-xs font-bold text-red-600 uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <span>⏱️</span> Time at Sea (Study)
            </div>
            <div className="text-3xl font-black text-red-800">{formatTime(globalStudyMins)}</div>
          </div>

          {/* Read Time Card */}
          <div className="bg-amber-100/50 border border-amber-300 px-5 py-4 rounded-xl shadow-sm flex-1 min-w-[200px]">
            <div className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <span>📖</span> Translation Time (Read)
            </div>
            <div className="text-3xl font-black text-amber-900">{formatTime(globalReadMins)}</div>
          </div>
        </div>
      </header>

      {/* 🗺️ WANTED POSTERS (Category Cards) */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <span>📊</span> Crew Specialties Breakdown
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(categoryStats).map(([catKey, stats]) => {
            const meta = categoryMeta[catKey] || categoryMeta.general;

            return (
              <Link
                key={catKey}
                href={`/category/${catKey}`}
                // Applied the parchment background to make them look like posters
                className={`bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] bg-amber-50/30 p-5 rounded-2xl border-2 flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group ${meta.color}`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl group-hover:scale-125 transition-transform duration-300">{meta.icon}</span>
                  <span className={`font-bold transition-colors line-clamp-1 ${meta.textColor}`}>
                    {meta.label}
                  </span>
                </div>

                <div className="space-y-3 mt-auto bg-white/60 p-3 rounded-xl border border-amber-100/50">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600 font-medium">Bounties</span>
                    <span className="font-bold text-slate-800 bg-amber-200/50 px-2 py-0.5 rounded">{stats.count}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600 font-medium">Training</span>
                    <span className="font-bold text-red-600">{formatTime(stats.studyMins)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-t border-amber-200/50 pt-3">
                    <span className="text-slate-600 font-medium">Reading</span>
                    <span className="font-bold text-amber-700">{formatTime(stats.readMins)}</span>
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
            <span>🏷️</span> Highest Bounties (Top Tags)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {sortedTags.map(([tag, count]) => (
              <div key={tag} className="bg-white/80 backdrop-blur-sm p-3 rounded-xl border border-amber-200 shadow-sm flex flex-col items-center justify-center text-center hover:border-red-300 transition-colors group">
                <span className="text-2xl font-black text-slate-800 mb-1 group-hover:text-red-600 transition-colors">{count}</span>
                <span className="text-[10px] font-bold text-amber-700/70 uppercase tracking-widest truncate w-full px-2">#{tag}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span>📅</span> Captain's Logbook
          </h2>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-amber-200 shadow-sm overflow-hidden">
            <ul className="divide-y divide-amber-100 max-h-[400px] overflow-y-auto">
              {sortedDates.map(([date, count]) => (
                <li key={date}>
                  <Link href={`/date/${date}`} className="flex justify-between items-center p-4 hover:bg-amber-100/50 transition-colors group">
                    <span className="font-medium text-slate-700 group-hover:text-red-600">{date}</span>
                    <span className="bg-amber-200/50 text-amber-800 py-1 px-3 rounded-full text-xs font-bold">
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