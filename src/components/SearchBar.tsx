"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { PostMeta } from '@/lib/markdown';

interface Post {
  slug: string;
  meta: PostMeta;
}

export default function SearchBar({ posts }: { posts: Post[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle Ctrl+K / Cmd+K shortcut and Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    } else {
      setQuery(''); // Clear search when closed
    }
  }, [isOpen]);

  // Filter posts based on query (searching title, category, tags, and summary)
  const searchResults = query.trim() === '' ? [] : posts.filter(post => {
    const searchString = `
      ${post.meta.title}
      ${post.meta.category || 'general'}
      ${post.meta.tags?.join(' ') || ''}
      ${post.meta.summary || ''}
    `.toLowerCase();

    return searchString.includes(query.toLowerCase());
  }).slice(0, 8); // Limit to top 8 results

  return (
    <>
      {/* 🧭 PIRATE THEMED SEARCH TRIGGER */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full mb-6 flex items-center justify-between px-3 py-2 text-sm text-amber-700/70 bg-white/50 border border-amber-200/80 rounded-lg hover:border-red-400 hover:text-red-700 hover:bg-red-50/30 transition-all shadow-sm group"
      >
        <div className="flex items-center gap-2">
          <span className="text-base grayscale opacity-70 group-hover:grayscale-0 transition-all">🔭</span>
          <span className="font-medium">Search Logbook...</span>
        </div>
        <kbd className="hidden sm:inline-block text-[10px] font-mono bg-amber-100/50 px-1.5 py-0.5 rounded border border-amber-200/80 text-amber-700/70 group-hover:bg-red-100 group-hover:text-red-700 group-hover:border-red-200 transition-colors">
          Ctrl K
        </kbd>
      </button>

      {/* 🗺️ SEARCH MODAL OVERLAY */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 sm:pt-32 bg-amber-950/40 backdrop-blur-sm p-4">

          {/* Click outside to close */}
          <div className="absolute inset-0" onClick={() => setIsOpen(false)}></div>

          {/* Modal Container (Parchment vibe) */}
          <div className="relative w-full max-w-2xl bg-[#fef3c7] bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] rounded-2xl shadow-2xl border-2 border-amber-200/80 overflow-hidden flex flex-col max-h-[70vh] animate-in fade-in zoom-in-95 duration-200">

            {/* Search Input Area */}
            <div className="flex items-center px-4 border-b border-amber-200/60 bg-white/40">
              <span className="text-xl mr-3">🧭</span>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search islands, patterns, or tags..."
                className="w-full py-5 text-lg font-medium text-slate-900 bg-transparent border-none outline-none placeholder:text-amber-700/50"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-amber-700/70 hover:text-red-700 bg-amber-200/50 hover:bg-red-100 rounded-md text-xs font-bold px-2 transition-colors border border-amber-300/50"
              >
                ESC
              </button>
            </div>

            {/* Search Results Area */}
            {query.trim() !== '' && (
              <div className="overflow-y-auto p-2 bg-amber-50/50">
                {searchResults.length === 0 ? (
                  <div className="p-8 text-center text-amber-700/70 font-medium">
                    <span className="text-3xl block mb-2 opacity-50">🏴‍☠️</span>
                    No uncharted logs found for "<span className="text-red-600 font-bold">{query}</span>"
                  </div>
                ) : (
                  <ul className="space-y-1">
                    {searchResults.map((post) => (
                      <li key={post.slug}>
                        <Link
                          href={`/${post.slug}`}
                          onClick={() => setIsOpen(false)}
                          className="flex flex-col p-3 rounded-xl hover:bg-white/80 hover:shadow-sm border border-transparent hover:border-amber-300 transition-all group"
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-slate-800 group-hover:text-red-600 transition-colors">
                              {post.meta.title}
                            </span>
                            <span className="text-[10px] font-black text-amber-900 bg-amber-200/60 border border-amber-300/50 px-2 py-0.5 rounded uppercase tracking-wider">
                              {post.meta.category || 'General'}
                            </span>
                          </div>
                          <div className="text-xs text-amber-700/70 font-medium line-clamp-1">
                            {post.meta.summary || `Charted on ${post.meta.date}`}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}