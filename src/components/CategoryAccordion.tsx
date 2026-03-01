"use client";

import { useState } from 'react';
import Link from 'next/link';
import { PostMeta } from '@/lib/markdown';

// Define the shape of the data we expect
interface Post {
  slug: string;
  meta: PostMeta;
}

export default function CategoryAccordion({ posts }: { posts: Post[] }) {
  // State to track which category is currently open
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  // 🌟 THEME UPDATE: Swapped to One Piece Icons
  const categories = [
    { id: 'coding', label: 'Coding', icon: '🏴‍☠️' },
    { id: 'hld', label: 'HLD', icon: '🏰' },
    { id: 'lld', label: 'LLD', icon: '⚔️' },
    { id: 'general', label: 'General', icon: '📜' }
  ];

  return (
    <div className="mb-10 space-y-1">


      {categories.map(cat => {
        // Find all posts for this specific category
        const catPosts = posts.filter(p => (p.meta.category || 'general').toLowerCase() === cat.id);
        // Only grab the 5 most recent to keep the sidebar clean
        const recentCatPosts = catPosts.slice(0, 5);
        const isOpen = openCategory === cat.id;

        return (
          <div key={cat.id} className="flex flex-col group">

            {/* The Clickable Header */}
            <button
              onClick={() => setOpenCategory(isOpen ? null : cat.id)}
              className={`flex items-center justify-between px-3 py-2.5 text-sm font-semibold rounded-lg transition-all w-full text-left ${
                isOpen
                  ? 'bg-amber-200/60 text-red-700'
                  : 'text-slate-700 hover:bg-amber-200/40 hover:text-red-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`text-base transition-all ${isOpen ? '' : 'grayscale opacity-70 group-hover:grayscale-0'}`}>
                  {cat.icon}
                </span>
                {cat.label}
              </div>
              <span className={`text-[10px] text-amber-600/70 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>

            {/* The Expanded List of Links */}
            {isOpen && (
              <div className="ml-6 mt-1 mb-2 pl-3 border-l-2 border-amber-200/80 space-y-1">
                {recentCatPosts.length === 0 ? (
                  <div className="text-xs text-amber-700/50 py-1 pl-2 font-medium">Uncharted waters...</div>
                ) : (
                  recentCatPosts.map(post => (
                    <Link
                      key={post.slug}
                      href={`/${post.slug}`}
                      className="block text-xs font-medium text-slate-600 hover:text-red-600 py-1.5 pl-2 truncate hover:bg-red-50/50 rounded transition-colors"
                      title={post.meta.title}
                    >
                      {post.meta.title}
                    </Link>
                  ))
                )}

                {/* Link to view the full category page if there are more than 5 posts */}
                <Link
                  href={`/category/${cat.id}`}
                  className="block text-[10px] font-bold uppercase tracking-wider text-amber-600 hover:text-red-600 mt-2 py-1.5 pl-2 transition-colors"
                >
                  View all {catPosts.length} logs →
                </Link>
              </div>
            )}

          </div>
        )
      })}
    </div>
  );
}