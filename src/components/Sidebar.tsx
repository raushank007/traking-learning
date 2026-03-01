"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CategoryAccordion from './CategoryAccordion';
import SearchBar from './SearchBar';

interface SidebarProps {
  posts: any[];
}

export default function Sidebar({ posts }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);

  // 🌟 NEW: Auto-close sidebar on mobile devices on initial load
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  }, []);

  // 🌟 NEW: Close sidebar automatically when a link is clicked on mobile
  const handleMobileClick = () => {
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  const pinnedPosts = posts.filter(post => post.meta.pinned);
  const recentLogs = posts.filter(post => !post.meta.pinned).slice(0, 15);

  return (
    <>
      {/* 🧭 TOGGLE BUTTON
          Moved to bottom-right on mobile for thumbs, stays bottom-left on desktop
      */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 md:left-6 md:right-auto z-50 w-14 h-14 bg-white/90 backdrop-blur-md border-2 border-amber-300/80 rounded-full shadow-xl flex items-center justify-center text-2xl hover:scale-110 hover:border-red-400 transition-all duration-300"
      >
        <span className={`transition-transform duration-500 ${isOpen ? 'rotate-180 grayscale opacity-50' : 'rotate-0'}`}>
          🧭
        </span>
      </button>

      {/* 🗺️ RESPONSIVE SIDEBAR
          Mobile: fixed overlay (covers screen). Desktop: sticky block (pushes content).
      */}
      <aside className={`
        fixed md:sticky top-0 left-0 h-screen z-40
        bg-amber-50/95 md:bg-amber-50/50 backdrop-blur-xl
        border-amber-200/80 transition-all duration-300 ease-in-out
        overflow-hidden shadow-2xl md:shadow-[4px_0_24px_rgba(0,0,0,0.02)]
        ${isOpen ? 'w-[100vw] sm:w-80 md:w-72 border-r' : 'w-0 border-none'}
      `}>

        {/* Inner container stays fixed width so text doesn't squish during animation */}
        <div className="w-[100vw] sm:w-80 md:w-72 h-full overflow-y-auto p-6 relative pb-24">

          {/* Close Button (Top Right of Sidebar) - Only visible on Mobile */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-6 right-6 text-2xl text-amber-700/50 hover:text-red-600 transition-colors md:hidden"
          >
            ✕
          </button>

          <Link href="/" onClick={handleMobileClick} className="block mb-8 group w-fit">
            <h1 className="font-pirate text-5xl tracking-widest text-slate-900 group-hover:text-red-600 transition-colors drop-shadow-sm">
              Grand Line
            </h1>
            <p className="text-xs font-bold text-amber-700/80 uppercase tracking-widest mt-1 ml-1">
              System Design Logbook
            </p>
          </Link>

          <SearchBar posts={posts} />

          {pinnedPosts.length > 0 && (
            <div className="mb-8 p-5 bg-gradient-to-br from-amber-100/60 to-orange-50 rounded-2xl border border-amber-200/80 shadow-sm relative overflow-hidden">
              <h3 className="text-xs font-black uppercase tracking-widest text-red-700 mb-4 flex items-center gap-2 relative z-10">
                <span className="text-base">💎</span> Treasured Logs
              </h3>
              <div className="space-y-2 relative z-10">
                {pinnedPosts.map(({ slug, meta }) => (
                  <Link key={slug} href={`/${slug}`} onClick={handleMobileClick} className="flex flex-col p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-amber-100 hover:border-amber-400 hover:shadow-md transition-all group">
                    <span className="text-sm font-bold text-slate-800 group-hover:text-red-700 line-clamp-1">{meta.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mb-8 space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-widest text-amber-700/60 mb-4 ml-2 mt-4 flex items-center gap-2">
              <span className="text-base">🧭</span> Log Pose
            </h3>
            <Link href="/" onClick={handleMobileClick} className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-700 rounded-lg hover:bg-amber-200/50 transition-all">
              <span className="text-base grayscale opacity-70">🗺️</span> Home Feed
            </Link>
            <Link href="/dashboard" onClick={handleMobileClick} className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-700 rounded-lg hover:bg-red-100/50 transition-all">
              <span className="text-base grayscale opacity-70">📜</span> Bounty Board
            </Link>
            <Link href="/archives" onClick={handleMobileClick} className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-700 rounded-lg hover:bg-sky-100/50 transition-all">
              <span className="text-base grayscale opacity-70">⏳</span> History Poneglyphs
            </Link>
          </div>

          <div className="mb-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-amber-700/60 mb-4 ml-2 flex items-center gap-2">
              <span className="text-base">🏝️</span> Islands Conquered
            </h3>
            {/* Pass the click handler down so categories close the sidebar too! */}
            <CategoryAccordion posts={posts} onLinkClick={handleMobileClick} />
          </div>

          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-widest text-amber-700/60 mb-4 ml-2">Recent Logs</h3>
            {recentLogs.map(({ slug, meta }) => (
              <Link key={slug} href={`/${slug}`} onClick={handleMobileClick} className="block px-3 py-2.5 rounded-lg hover:bg-amber-200/50 transition-all group">
                <div className="text-sm font-medium text-slate-700 group-hover:text-red-600 line-clamp-1">{meta.title}</div>
              </Link>
            ))}
          </div>

        </div>
      </aside>
    </>
  );
}