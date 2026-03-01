import Link from 'next/link';
import { getAllPosts } from '@/lib/markdown';
import CategoryAccordion from './CategoryAccordion';
import SearchBar from './SearchBar';

export default function Sidebar() {
  const allPosts = getAllPosts();

  const pinnedPosts = allPosts.filter(post => post.meta.pinned);
  const recentLogs = allPosts.filter(post => !post.meta.pinned).slice(0, 15);

  return (
    // THEME UPDATE: Swapped slate-50/200 for amber-50/200 to match the parchment vibe
    <aside className="w-72 border-r border-amber-200/80 h-screen overflow-y-auto bg-amber-50/50 flex flex-col hidden md:flex fixed z-40 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      <div className="p-6">

        {/* ☠️ PIRATE THEMED LOGO */}
        <Link href="/" className="block mb-8 group">
          <h1 className="font-pirate text-5xl tracking-widest text-slate-900 group-hover:text-red-600 transition-colors drop-shadow-sm">
            Grand Line
          </h1>
          <p className="text-xs font-bold text-amber-700/80 uppercase tracking-widest mt-1 ml-1">
            System Design Logbook
          </p>
        </Link>

        {/* Search Bar - Finding the One Piece */}
         <SearchBar posts={allPosts} />

        {/* 💎 Treasured Logs (Pinned Posts) */}
        {pinnedPosts.length > 0 && (
          <div className="mb-8 p-5 bg-gradient-to-br from-amber-100/60 to-orange-50 rounded-2xl border border-amber-200/80 shadow-sm relative overflow-hidden">
            {/* Red glow effect in the corner */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-100 rounded-full blur-2xl -mr-10 -mt-10 opacity-60 pointer-events-none"></div>

            <h3 className="text-xs font-black uppercase tracking-widest text-red-700 mb-4 flex items-center gap-2 relative z-10">
              <span className="text-base">💎</span>
              Treasured Logs
            </h3>

            <div className="space-y-2 relative z-10">
              {pinnedPosts.map(({ slug, meta }) => (
                <Link key={slug} href={`/${slug}`} className="flex flex-col p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-amber-100 hover:border-amber-400 hover:shadow-md transition-all group">
                  <span className="text-sm font-bold text-slate-800 group-hover:text-red-700 line-clamp-1">{meta.title}</span>
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mt-1">{meta.tags?.[1] || meta.tags?.[0] || 'Roadmap'}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 🧭 Log Pose (Menu) */}
        <div className="mb-8 space-y-1">
          <h3 className="text-xs font-bold uppercase tracking-widest text-amber-700/60 mb-4 ml-2 mt-4 flex items-center gap-2">
            <span className="text-base">🧭</span> Log Pose
          </h3>
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-700 rounded-lg hover:bg-amber-200/50 hover:text-slate-900 transition-all">
            <span className="text-base grayscale opacity-70 group-hover:grayscale-0">🗺️</span> Home Feed
          </Link>
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-700 rounded-lg hover:bg-red-100/50 hover:text-slate-900 transition-all">
            <span className="text-base grayscale opacity-70">📜</span> Bounty Board
          </Link>
          <Link href="/archives" className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-700 rounded-lg hover:bg-sky-100/50 hover:text-slate-900 transition-all">
            <span className="text-base grayscale opacity-70">⏳</span> History Poneglyphs
          </Link>
        </div>

        {/* 🏝️ Islands Conquered (Categories) */}
        <div className="mb-8">
          <h3 className="text-xs font-bold uppercase tracking-widest text-amber-700/60 mb-4 ml-2 flex items-center gap-2">
            <span className="text-base">🏝️</span> Islands Conquered
          </h3>
          <CategoryAccordion posts={allPosts} />
        </div>

        {/* Standard Recent Logs */}
        <div className="space-y-1">
          <h3 className="text-xs font-bold uppercase tracking-widest text-amber-700/60 mb-4 ml-2">Recent Logs</h3>
          {recentLogs.map(({ slug, meta }) => (
            <Link key={slug} href={`/${slug}`} className="block px-3 py-2.5 rounded-lg hover:bg-amber-200/50 transition-all group">
              <div className="text-sm font-medium text-slate-700 group-hover:text-red-600 line-clamp-1">{meta.title}</div>
              <div className="text-xs text-amber-600/70 mt-1">{meta.date}</div>
            </Link>
          ))}
        </div>

      </div>
    </aside>
  );
}