// src/app/category/[category]/page.tsx
import { getAllPosts } from '@/lib/markdown';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  // Define the core categories to generate static pages for
  const categories = ['coding', 'hld', 'lld', 'general'];
  return categories.map((category) => ({ category }));
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const resolvedParams = await params;
  const targetCategory = resolvedParams.category.toLowerCase();

  const allPosts = getAllPosts();

  // Filter posts by category. If a post has no category, treat it as "general"
  const categoryPosts = allPosts.filter(post => {
    const postCategory = (post.meta.category || 'general').toLowerCase();
    return postCategory === targetCategory;
  });

  if (categoryPosts.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <h1 className="text-3xl font-bold text-slate-800 mb-4">No posts found</h1>
        <p className="text-slate-500">There are currently no logs in the "{targetCategory}" category.</p>
        <Link href="/" className="text-blue-600 hover:underline mt-4 inline-block">← Back to Home</Link>
      </div>
    );
  }

  // Format the category name for display (e.g., "hld" -> "HLD", "coding" -> "Coding")
  const displayCategory = targetCategory === 'hld' || targetCategory === 'lld'
    ? targetCategory.toUpperCase()
    : targetCategory.charAt(0).toUpperCase() + targetCategory.slice(1);

  return (
    <div className="max-w-4xl mx-auto py-8">
      <header className="mb-12 pb-8 border-b border-slate-200">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">
          {displayCategory} Logs
        </h1>
        <p className="text-slate-500">Showing {categoryPosts.length} posts in this category.</p>
      </header>

      <div className="space-y-6">
        {categoryPosts.map(({ slug, meta }) => (
          <Link
            key={slug}
            href={`/${slug}`}
            className="block p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all"
          >
            <h2 className="text-2xl font-bold text-slate-800 mb-2">{meta.title}</h2>
            <div className="flex gap-2 mb-3 items-center">
              <span className="text-xs font-black text-slate-700 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded">
                {meta.category || 'General'}
              </span>
              {meta.tags && meta.tags.map(tag => (
                <span key={tag} className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  #{tag}
                </span>
              ))}
            </div>
            <p className="text-slate-600 text-sm">{meta.summary}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}