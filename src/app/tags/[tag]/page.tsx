import Link from 'next/link';
import { getPostsByTag, getAllTags } from '../../../lib/markdown'; // Using relative path
import { notFound } from 'next/navigation';

// Tell Next.js to pre-build all tag pages at compile time
export async function generateStaticParams() {
  const tags = getAllTags();
  return tags.map((tag) => ({ tag }));
}

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  // Await the params (Next.js 15 requirement)
  const resolvedParams = await params;
  const decodedTag = decodeURIComponent(resolvedParams.tag);

  const posts = getPostsByTag(decodedTag);

  if (posts.length === 0) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <header className="mb-12 border-b border-gray-200 pb-8">
        <Link href="/" className="text-sm font-medium text-blue-600 hover:underline mb-4 inline-block">
          &larr; Back to all logs
        </Link>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2 capitalize">
          Logs tagged: {decodedTag}
        </h1>
        <p className="text-lg text-gray-600">
          Found {posts.length} {posts.length === 1 ? 'entry' : 'entries'}.
        </p>
      </header>

      <div className="space-y-8">
        {posts.map(({ slug, meta }) => (
          <article
            key={slug}
            className="group relative bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="text-sm text-gray-500 mb-3">
              <time dateTime={meta.date}>{meta.date}</time>
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
          </article>
        ))}
      </div>
    </div>
  );
}