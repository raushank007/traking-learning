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
      {/* Search Trigger Button in Sidebar */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full mb-6 flex items-center justify-between px-3 py-2 text-sm text-slate-400 bg-white border border-slate-200 rounded-lg hover:border-blue-400 hover:text-slate-600 transition-all shadow-sm"
      >
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <span>Search...</span>
        </div>
        <kbd className="hidden sm:inline-block text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-slate-500">
          Ctrl K
        </kbd>
      </button>

      {/* Search Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 sm:pt-32 bg-slate-900/50 backdrop-blur-sm p-4">

          {/* Click outside to close */}
          <div className="absolute inset-0" onClick={() => setIsOpen(false)}></div>

          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[70vh] animate-in fade-in zoom-in-95 duration-200">

            {/* Search Input Area */}
            <div className="flex items-center px-4 border-b border-slate-100">
              <svg className="text-blue-500 mr-3" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search topics, patterns, or tags..."
                className="w-full py-5 text-lg text-slate-900 bg-transparent border-none outline-none placeholder:text-slate-400"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button onClick={() => setIsOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-md text-xs font-bold px-2">
                ESC
              </button>
            </div>

            {/* Search Results Area */}
            {query.trim() !== '' && (
              <div className="overflow-y-auto p-2 bg-slate-50/50">
                {searchResults.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    No results found for "<span className="text-slate-900 font-medium">{query}</span>"
                  </div>
                ) : (
                  <ul className="space-y-1">
                    {searchResults.map((post) => (
                      <li key={post.slug}>
                        <Link
                          href={`/${post.slug}`}
                          onClick={() => setIsOpen(false)}
                          className="flex flex-col p-3 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all group"
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                              {post.meta.title}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider">
                              {post.meta.category || 'General'}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 line-clamp-1">
                            {post.meta.summary || `Posted on ${post.meta.date}`}
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