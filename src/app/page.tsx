import Link from 'next/link';
import { getAllPosts } from '../lib/markdown';

export default async function Home() {
  const posts = getAllPosts();

  return (
    <div className="max-w-4xl mx-auto py-8">

      {/* ☠️ PIRATE THEMED HEADER */}
      <header className="mb-12 border-b border-amber-200/80 pb-8">
        <h1 className="font-pirate text-5xl md:text-6xl text-slate-900 tracking-widest mb-4 drop-shadow-sm">
          The Captain's Log
        </h1>
        <p className="text-lg text-amber-700/80 font-medium flex items-center gap-2">
          <span className="text-xl grayscale opacity-70">🗺️</span>
          Charting my course through system design and code.
        </p>
      </header>

      <div className="space-y-8">
        {posts.map(({ slug, meta }) => (
          <article
            key={slug}
            // 🌟 THEME UPDATE: Parchment card styling with Luffy Red hover state
            className="group relative bg-white/60 backdrop-blur-sm rounded-2xl border border-amber-200/60 p-6 shadow-sm hover:shadow-md hover:border-red-300 transition-all duration-300"
          >
            <div className="flex flex-wrap items-center gap-4 text-sm text-amber-700/60 mb-3 font-medium">
              <time dateTime={meta.date} className="flex items-center gap-1.5">
                <span className="text-xs grayscale opacity-50">⏳</span>
                {meta.date}
              </time>

              {/* Display tags if they exist */}
              {meta.tags && meta.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {meta.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-amber-200/50 border border-amber-300/50 text-amber-900"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <h2 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-red-600 transition-colors">
              <Link href={`/${slug}`}>
                <span className="absolute inset-0"></span>
                {meta.title || slug}
              </Link>
            </h2>

            {meta.summary && (
              <p className="text-amber-900/70 leading-relaxed font-medium">
                {meta.summary}
              </p>
            )}

            <div className="mt-4 flex items-center gap-2 text-sm font-bold text-red-600 group-hover:text-red-700 transition-colors">
              Inspect Log <span aria-hidden="true" className="ml-1 transition-transform group-hover:translate-x-1">&rarr;</span>
            </div>
          </article>
        ))}

        {posts.length === 0 && (
          <div className="text-center py-16 px-6 text-amber-700/70 bg-amber-50/50 rounded-2xl border-2 border-dashed border-amber-200/80">
            <span className="text-4xl block mb-4 grayscale opacity-50">🏝️</span>
            <p className="font-bold text-lg mb-2">Uncharted Waters!</p>
            <p className="text-sm">No logs found in the Grand Line. Create your first markdown file in the content directory to begin the journey.</p>
          </div>
        )}
      </div>
    </div>
  );
}