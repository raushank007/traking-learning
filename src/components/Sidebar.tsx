import Link from 'next/link';
import { getAllPosts } from '../lib/markdown';

export default function Sidebar() {
  const posts = getAllPosts();

  return (
    <nav className="w-72 shrink-0 bg-slate-50/50 backdrop-blur-xl border-r border-slate-200 h-screen p-6 overflow-y-auto">
      {/* Removed hidden md:block, added shrink-0 to the nav above */}

      {/* Brand / Logo Area */}
      <div className="mb-10">
        <Link href="/" className="text-xl font-black tracking-tighter text-slate-900 hover:opacity-80 transition-opacity">
          Garden.
        </Link>
      </div>

      {/* Main Navigation Links */}
      <div className="mb-10 space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 ml-2">Menu</h3>
        <Link
          href="/"
          className="flex items-center px-3 py-2 text-sm font-semibold text-slate-600 rounded-lg hover:bg-slate-200/50 hover:text-slate-900 transition-all"
        >
          Home Feed
        </Link>
        <Link
          href="/archives"
          className="flex items-center px-3 py-2 text-sm font-semibold text-slate-600 rounded-lg hover:bg-slate-200/50 hover:text-slate-900 transition-all"
        >
          Timeline Archive
        </Link>
      </div>

      {/* Recent Posts Section */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 ml-2">Recent Logs</h3>
        <ul className="space-y-1">
          {posts.slice(0, 5).map(({ slug, meta }) => (
            <li key={slug}>
              <Link
                href={`/${slug}`}
                className="block px-3 py-2 text-sm font-medium text-slate-500 rounded-lg hover:bg-white hover:text-blue-600 hover:shadow-sm transition-all"
              >
                <span className="block truncate">{meta.title || slug}</span>
                {meta.date && <span className="text-[10px] text-slate-400 uppercase tracking-wider">{meta.date}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}