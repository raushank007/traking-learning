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

  // 🌟 NEW: Roadmap Tracking Variables
  let totalRoadmapTopics = 0;
  let completedRoadmapTopics = 0;

  // We initialize the stats including your new custom categories!
  const categoryStats: Record<string, { count: number; studyMins: number; readMins: number }> = {
    coding: { count: 0, studyMins: 0, readMins: 0 },
    hld: { count: 0, studyMins: 0, readMins: 0 },
    lld: { count: 0, studyMins: 0, readMins: 0 },
    springboot: { count: 0, studyMins: 0, readMins: 0 },
    java: { count: 0, studyMins: 0, readMins: 0 },
    general: { count: 0, studyMins: 0, readMins: 0 },
  };

  const tagCounts: Record<string, number> = {};
  const dateCounts: Record<string, number> = {};

  posts.forEach(post => {
    // 🌟 NEW: If it's a roadmap file, scan its checkboxes and SKIP standard stats!
    if (post.meta.isRoadmap) {
      const pendingCount = [...post.content.matchAll(/-\s+\[ \]\s+/g)].length;
      const completedCount = [...post.content.matchAll(/-\s+\[[xX]\]\s+/g)].length;
      totalRoadmapTopics += (pendingCount + completedCount);
      completedRoadmapTopics += completedCount;
      return; // Stop here so master files don't bloat your log counts
    }

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

  // Calculate Progress Percentage for the Fleet Readiness bar
  const progressPercentage = totalRoadmapTopics === 0 ? 0 : Math.round((completedRoadmapTopics / totalRoadmapTopics) * 100);

  // 🌟 THEME UPDATE: One Piece Visual Mapping with your new categories
  const categoryMeta: Record<string, { label: string, icon: string, color: string, textColor: string }> = {
    coding: { label: 'Pirate Code (LeetCode)', icon: '🏴‍☠️', color: 'border-red-300 hover:border-red-500', textColor: 'text-red-700' },
    hld: { label: 'Fortresses (HLD)', icon: '🏰', color: 'border-amber-400 hover:border-amber-600', textColor: 'text-amber-800' },
    lld: { label: 'Swordsmanship (LLD)', icon: '⚔️', color: 'border-emerald-300 hover:border-emerald-500', textColor: 'text-emerald-700' },
    springboot: { label: 'Thousand Sunny (Spring Boot)', icon: '🚢', color: 'border-orange-300 hover:border-orange-500', textColor: 'text-orange-700' },
    java: { label: 'Sniper King (Java)', icon: '🔫', color: 'border-indigo-300 hover:border-indigo-500', textColor: 'text-indigo-700' },
    general: { label: 'Poneglyphs (Notes)', icon: '📜', color: 'border-sky-300 hover:border-sky-500', textColor: 'text-sky-700' },
  };

  return (
    <div className="max-w-5xl mx-auto py-8">

      {/* ☠️ PIRATE THEMED HEADER */}
      <header className="mb-12">
        <h1 className="font-pirate text-5xl md:text-6xl tracking-widest text-slate-900 mb-8 drop-shadow-sm">
          The Bounty Board
        </h1>

        <div className="flex flex-wrap gap-4 mb-6">
          {/* Total Logs Card */}
          <div className="bg-white/80 backdrop-blur-sm border border-amber-300 px-5 py-4 rounded-xl shadow-sm flex-1 min-w-[200px]">
            <div className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-1 flex items-center gap-2">
              <span>🗺️</span> Charted Logs
            </div>
            {/* Display count of non-roadmap files only */}
            <div className="text-3xl font-black text-slate-800">{posts.filter(p => !p.meta.isRoadmap).length}</div>
          </div>

          {/* Study Time Card */}
          <div className="bg-red-50/90 border border-red-300 px-5 py-4 rounded-xl shadow-sm flex-1 min-w-[200px]">
            <div className="text-xs font-bold text-red-700 uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <span>⏱️</span> Time at Sea (Study)
            </div>
            <div className="text-3xl font-black text-red-800">{formatTime(globalStudyMins)}</div>
          </div>

          {/* Read Time Card */}
          <div className="bg-amber-100/70 border border-amber-400 px-5 py-4 rounded-xl shadow-sm flex-1 min-w-[200px]">
            <div className="text-xs font-bold text-amber-800 uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <span>📖</span> Poneglyph Translation
            </div>
            <div className="text-3xl font-black text-amber-900">{formatTime(globalReadMins)}</div>
          </div>
        </div>

        {/* 🌟 GRAND FLEET READINESS (Roadmap Tracker) */}
        {totalRoadmapTopics > 0 && (
          <Link href="/roadmap" className="block bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] bg-amber-50/90 border-2 border-amber-400 p-6 rounded-2xl shadow-sm hover:shadow-lg hover:border-red-500 transition-all duration-300 group">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-4 gap-2">
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <span className="text-2xl group-hover:rotate-45 transition-transform duration-500">🧭</span>
                  Grand Fleet Readiness
                </h3>
                <p className="text-sm font-bold text-amber-800/80 mt-1 uppercase tracking-widest">
                  {completedRoadmapTopics} of {totalRoadmapTopics} Islands Conquered
                </p>
              </div>
              <span className="text-4xl md:text-5xl font-pirate text-red-600 drop-shadow-sm group-hover:scale-110 transition-transform origin-right">{progressPercentage}%</span>
            </div>
            {/* Thematic Progress Bar */}
            <div className="w-full h-4 bg-amber-200/50 rounded-full overflow-hidden border border-amber-300/80 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 transition-all duration-1000 ease-out relative"
                style={{ width: `${progressPercentage}%` }}
              >
                {/* Small shine effect on the progress bar */}
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/20"></div>
              </div>
            </div>
          </Link>
        )}
      </header>

      {/* 🗺️ CREW SPECIALTIES (Category Cards) */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <span>📊</span> Crew Specialties Breakdown
        </h2>
        {/* Adjusted to grid-cols-2 or 3 to fit 6 categories nicely */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Object.entries(categoryStats).map(([catKey, stats]) => {
            // Only render categories that actually have posts, to keep it clean
            if (stats.count === 0) return null;

            const meta = categoryMeta[catKey] || categoryMeta.general;

            return (
              <Link
                key={catKey}
                href={`/category/${catKey}`}
                // Applied the parchment background to make them look like Wanted Posters
                className={`bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] bg-[#fef3c7]/60 p-5 rounded-2xl border-2 flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group ${meta.color}`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl group-hover:scale-125 group-hover:rotate-6 transition-transform duration-300 drop-shadow-sm">{meta.icon}</span>
                  <span className={`font-bold transition-colors line-clamp-1 ${meta.textColor}`}>
                    {meta.label}
                  </span>
                </div>

                <div className="space-y-3 mt-auto bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-amber-200/60 shadow-sm">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-700 font-bold">Bounties</span>
                    <span className="font-black text-slate-900 bg-amber-200/80 px-2.5 py-0.5 rounded shadow-sm">{stats.count}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600 font-medium">Training</span>
                    <span className="font-bold text-red-600">{formatTime(stats.studyMins)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-t border-amber-200/80 pt-3">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <section>
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span>🏷️</span> Wanted Posters (Top Tags)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {sortedTags.map(([tag, count]) => (
              <div key={tag} className="bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] bg-amber-50/80 p-4 rounded-xl border-2 border-amber-200 shadow-sm flex flex-col items-center justify-center text-center hover:border-red-400 hover:bg-red-50/50 transition-colors group">
                <span className="text-3xl font-black text-slate-800 mb-1 group-hover:text-red-600 transition-colors drop-shadow-sm">{count}</span>
                <span className="text-[10px] font-black text-amber-800/80 uppercase tracking-widest truncate w-full px-2">#{tag}</span>
              </div>
            ))}
            {sortedTags.length === 0 && (
              <div className="col-span-full text-center p-6 text-amber-700/60 font-medium border-2 border-dashed border-amber-200 rounded-xl">
                No bounties issued yet.
              </div>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span>📅</span> Captain's Logbook
          </h2>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border-2 border-amber-200 shadow-sm overflow-hidden">
            <ul className="divide-y-2 divide-amber-100 max-h-[400px] overflow-y-auto">
              {sortedDates.map(([date, count]) => (
                <li key={date}>
                  <Link href={`/date/${date}`} className="flex justify-between items-center p-5 hover:bg-amber-100/50 transition-colors group">
                    <span className="font-bold text-slate-700 group-hover:text-red-600 flex items-center gap-2">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-sm">⚓</span>
                      {date}
                    </span>
                    <span className="bg-amber-200/60 border border-amber-300/50 text-amber-900 py-1 px-3 rounded-full text-xs font-black shadow-sm">
                      {count} {count === 1 ? 'log' : 'logs'}
                    </span>
                  </Link>
                </li>
              ))}
              {sortedDates.length === 0 && (
                <li className="p-8 text-center text-amber-700/60 font-medium">
                  The logbook is empty. Set sail!
                </li>
              )}
            </ul>
          </div>
        </section>
      </div>

    </div>
  );
}