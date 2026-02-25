import Link from 'next/link';
import { getAllPosts } from '../lib/markdown';

export default async function Home() {
  const posts = getAllPosts();

  return (
    <div className="max-w-4xl mx-auto py-8">
      <header className="mb-12 border-b border-gray-200 pb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
          Daily Learning Log
        </h1>
        <p className="text-lg text-gray-600">
          Tracking my progress, notes, and code snippets day by day.
        </p>
      </header>

      <div className="space-y-8">
        {posts.map(({ slug, meta }) => (
          <article
            key={slug}
            className="group relative bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
              <time dateTime={meta.date}>{meta.date}</time>

              {/* Display tags if they exist in the markdown frontmatter */}
              {meta.tags && meta.tags.length > 0 && (
                <div className="flex gap-2">
                  {meta.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
              <Link href={`/${slug}`}>
                <span className="absolute inset-0"></span>
                {meta.title || slug}
              </Link>
            </h2>

            {meta.summary && (
              <p className="text-gray-600 leading-relaxed">
                {meta.summary}
              </p>
            )}

            <div className="mt-4 flex items-center text-sm font-medium text-blue-600">
              Read notes <span aria-hidden="true" className="ml-1">&rarr;</span>
            </div>
          </article>
        ))}

        {posts.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            No learning logs found. Create your first markdown file in the content directory!
          </div>
        )}
      </div>
    </div>
  );
}