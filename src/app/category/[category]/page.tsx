import { getAllPosts } from '@/lib/markdown';
import Link from 'next/link';

export async function generateStaticParams() {
  // Define the core categories to generate static pages for
  const categories = ['coding', 'hld', 'lld', 'general'];
  return categories.map((category) => ({ category }));
}

// 🌟 THEME UPDATE: Helper to grab the correct One Piece icon and title
const getCategoryTheme = (category: string) => {
  switch (category) {
    case 'coding': return { title: 'Pirate Code (LeetCode)', icon: '🏴‍☠️' };
    case 'hld': return { title: 'Fortresses (HLD)', icon: '🏰' };
    case 'lld': return { title: 'Swordsmanship (LLD)', icon: '⚔️' };
    default: return { title: 'Poneglyphs (General)', icon: '📜' };
  }
};

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const resolvedParams = await params;
  const targetCategory = resolvedParams.category.toLowerCase();

  const allPosts = getAllPosts();

  // Filter posts by category. If a post has no category, treat it as "general"
  const categoryPosts = allPosts.filter(post => {
    const postCategory = (post.meta.category || 'general').toLowerCase();
    return postCategory === targetCategory;
  });

  const theme = getCategoryTheme(targetCategory);

  // 🏝️ EMPTY STATE (Uncharted Waters)
  if (categoryPosts.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <div className="text-center py-16 px-6 text-amber-700/70 bg-amber-50/50 rounded-2xl border-2 border-dashed border-amber-200/80">
          <span className="text-5xl block mb-4 grayscale opacity-50">🏝️</span>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Uncharted Waters</h1>
          <p className="text-amber-900/60 font-medium">There are currently no logs charted in the "{theme.title}" category.</p>
          <Link href="/" className="text-red-600 hover:text-red-700 font-bold hover:underline mt-6 inline-block transition-colors">
            ← Sail Back Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">

      {/* ☠️ PIRATE THEMED HEADER */}
      <header className="mb-12 pb-8 border-b border-amber-200/80">
        <h1 className="flex items-center gap-4 text-4xl md:text-6xl font-pirate tracking-widest text-slate-900 mb-4 drop-shadow-sm">
          <span className="text-4xl md:text-5xl">{theme.icon}</span>
          {theme.title}
        </h1>
        <p className="text-lg text-amber-700/80 font-medium">
          Showing <strong className="text-red-600">{categoryPosts.length}</strong> charted logs in this territory.
        </p>
      </header>

      <div className="space-y-6">
        {categoryPosts.map(({ slug, meta }) => (
          <Link
            key={slug}
            href={`/${slug}`}
            // 🌟 THEME UPDATE: Parchment card styling with Luffy Red hover state
            className="group block p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-amber-200/60 shadow-sm hover:shadow-md hover:border-red-300 transition-all duration-300"
          >
            <h2 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-red-600 transition-colors">
              {meta.title}
            </h2>

            <div className="flex gap-2 mb-4 items-center flex-wrap">
              {/* Gold/Amber Category Badge */}
              <span className="text-[10px] font-black text-amber-900 bg-amber-200/60 border border-amber-300/50 px-2 py-1 rounded uppercase tracking-widest">
                {meta.category || 'General'}
              </span>

              {/* Thematic Tags */}
              {meta.tags && meta.tags.map(tag => (
                <span key={tag} className="text-[10px] font-bold text-amber-600/70 uppercase tracking-wider group-hover:text-amber-600 transition-colors">
                  #{tag}
                </span>
              ))}
            </div>

            <p className="text-amber-900/70 text-sm font-medium leading-relaxed">
              {meta.summary || "No summary charted for this log."}
            </p>

            <div className="mt-4 flex items-center gap-2 text-sm font-bold text-red-600 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
              Read Logbook <span aria-hidden="true">&rarr;</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}