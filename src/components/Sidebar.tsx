import Link from 'next/link';
import { getAllPosts } from '@/lib/markdown';
import CategoryAccordion from './CategoryAccordion'; // <-- Import the new component
import SearchBar from './SearchBar';

export default function Sidebar() {
  const allPosts = getAllPosts();

  const pinnedPosts = allPosts.filter(post => post.meta.pinned);
  const recentLogs = allPosts.filter(post => !post.meta.pinned).slice(0, 15);

  return (
    <aside className="w-72 border-r border-slate-200 h-screen overflow-y-auto bg-slate-50 flex flex-col hidden md:flex fixed z-40 shadow-sm">
      <div className="p-6">

        <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-8">Garden.</h1>

        {/* 🌟 NEW SEARCH BAR TRIGGER 🌟 */}
         <SearchBar posts={allPosts} />
        {/* Highlighted Pinned Posts */}
        {pinnedPosts.length > 0 && (
          <div className="mb-8 p-5 bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-2xl border border-blue-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100 rounded-full blur-2xl -mr-10 -mt-10 opacity-60 pointer-events-none"></div>
            <h3 className="text-xs font-black uppercase tracking-widest text-blue-700 mb-4 flex items-center gap-2 relative z-10">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
              Core Roadmaps
            </h3>
            <div className="space-y-2 relative z-10">
              {pinnedPosts.map(({ slug, meta }) => (
                <Link key={slug} href={`/${slug}`} className="flex flex-col p-3 bg-white rounded-xl border border-blue-100 hover:border-blue-400 hover:shadow-md transition-all group">
                  <span className="text-sm font-bold text-slate-800 group-hover:text-blue-700 line-clamp-1">{meta.title}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{meta.tags?.[1] || meta.tags?.[0] || 'Roadmap'}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Standard Menu */}
        <div className="mb-6 space-y-1">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 ml-2 mt-4">Menu</h3>
          <Link href="/" className="flex items-center px-3 py-2.5 text-sm font-semibold text-slate-600 rounded-lg hover:bg-slate-200/50 hover:text-slate-900 transition-all">Home Feed</Link>
          <Link href="/dashboard" className="flex items-center px-3 py-2.5 text-sm font-semibold text-slate-600 rounded-lg hover:bg-slate-200/50 hover:text-slate-900 transition-all">Analytics Dashboard</Link>
          <Link href="/archives" className="flex items-center px-3 py-2.5 text-sm font-semibold text-slate-600 rounded-lg hover:bg-slate-200/50 hover:text-slate-900 transition-all">Timeline Archive</Link>
        </div>

        {/* 🌟 NEW COLLAPSIBLE CATEGORIES COMPONENT 🌟 */}
        <CategoryAccordion posts={allPosts} />

        {/* Standard Recent Logs */}
        <div className="space-y-1">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 ml-2">Recent Logs</h3>
          {recentLogs.map(({ slug, meta }) => (
            <Link key={slug} href={`/${slug}`} className="block px-3 py-2.5 rounded-lg hover:bg-slate-200/50 transition-all group">
              <div className="text-sm font-medium text-slate-700 group-hover:text-blue-600 line-clamp-1">{meta.title}</div>
              <div className="text-xs text-slate-400 mt-1">{meta.date}</div>
            </Link>
          ))}
        </div>

      </div>
    </aside>
  );
}