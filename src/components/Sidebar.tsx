"use client";

import { useState } from 'react';
import Link from 'next/link';
import CategoryAccordion from './CategoryAccordion';
import SearchBar from './SearchBar';

// Define the shape of the props coming from layout.tsx
interface SidebarProps {
  posts: any[];
}

export default function Sidebar({ posts }: SidebarProps) {
  // State to control visibility
  const [isOpen, setIsOpen] = useState(true);

  const pinnedPosts = posts.filter(post => post.meta.pinned);
  const recentLogs = posts.filter(post => !post.meta.pinned).slice(0, 15);

  return (
    <>
      {/* 🧭 FLOATING TOGGLE BUTTON */}
      {/* This button stays fixed to the bottom left so you can always open/close the logbook */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 z-50 w-12 h-12 bg-white/90 backdrop-blur-md border-2 border-amber-300/80 rounded-full shadow-lg flex items-center justify-center text-xl hover:scale-110 hover:border-red-400 transition-all duration-300 group"
        title={isOpen ? "Hide Logbook" : "Open Logbook"}
      >
        <span className={`transition-transform duration-500 ${isOpen ? 'rotate-180 grayscale opacity-50' : 'rotate-0'}`}>
          🧭
        </span>
      </button>

      {/* 🗺️ THE SIDEBAR CONTAINER */}
      {/* Changes width from w-72 to w-0 to create a smooth sliding layout animation */}
      <aside className={`sticky top-0 h-screen flex-shrink-0 bg-amber-50/50 border-r border-amber-200/80 transition-all duration-300 ease-in-out z-40 overflow-hidden shadow-[4px_0_24px_rgba(0,0,0,0.02)] ${isOpen ? 'w-full md:w-72 border-r' : 'w-0 border-none'}`}>

        {/* INNER CONTENT WRAPPER */}
        {/* We keep this strictly w-72 so the text doesn't squish awkwardly while it is animating closed */}
        <div className="w-72 h-full overflow-y-auto p-6 relative">

          {/* Close Button (Top Right of Sidebar) */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-6 right-6 text-amber-700/50 hover:text-red-600 transition-colors md:hidden"
          >
            ✕
          </button>

          {/* ☠️ PIRATE THEMED LOGO */}
          <Link href="/" className="block mb-8 group">
            <h1 className="font-pirate text-5xl tracking-widest text-slate-900 group-hover:text-red-600 transition-colors drop-shadow-sm">
              Grand Line
            </h1>
            <p className="text-xs font-bold text-amber-700/80 uppercase tracking-widest mt-1 ml-1">
              System Design Logbook
            </p>
          </Link>

          {/* Search Bar */}
          <SearchBar posts={posts} />

          {/* 💎 Treasured Logs (Pinned Posts) */}
          {pinnedPosts.length > 0 && (
            <div className="mb-8 p-5 bg-gradient-to-br from-amber-100/60 to-orange-50 rounded-2xl border border-amber-200/80 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-100 rounded-full blur-2xl -mr-10 -mt-10 opacity-60 pointer-events-none"></div>
              <h3 className="text-xs font-black uppercase tracking-widest text-red-700 mb-4 flex items-center gap-2 relative z-10">
                <span className="text-base">💎</span> Treasured Logs
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
            <CategoryAccordion posts={posts} />
          </div>

          {/* Standard Recent Logs */}
          <div className="space-y-1 pb-12">
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
    </>
  );
}