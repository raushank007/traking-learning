import Link from 'next/link';
import { getAllPosts } from '../lib/markdown';

export default function Sidebar() {
  const posts = getAllPosts();

  return (
    <nav className="w-64 bg-gray-50 border-r border-gray-200 h-screen p-4 overflow-y-auto hidden md:block">
      <h2 className="text-lg font-bold mb-6 text-gray-800 tracking-tight">Daily Learning</h2>
      <ul className="space-y-4">
        {posts.map(({ slug, meta }) => (
          <li key={slug} className="flex flex-col">
            <Link
              href={`/${slug}`}
              className="text-gray-700 font-medium hover:text-blue-600 transition-colors"
            >
              {meta.title || slug}
            </Link>
            {meta.date && (
              <span className="text-xs text-gray-500 mt-1">{meta.date}</span>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}