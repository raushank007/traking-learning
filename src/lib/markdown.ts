import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const contentDirectory = path.join(process.cwd(), 'content');

// Define a type for your frontmatter to keep TypeScript happy
export interface PostMeta {
  title: string;
  date: string;
  tags?: string[];
  summary?: string;
}

// 1. Helper to calculate reading time (~200 words per minute)
export function calculateReadingTime(text: string): string {
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return `${minutes} min read`;
}

// 2. Fetch a single post and its metadata by slug
export function getPostBySlug(slug: string) {
  const realSlug = slug.replace(/\.md$/, '');
  const fullPath = path.join(contentDirectory, `${realSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  const { data, content } = matter(fileContents);

  // Calculate the reading time from the raw markdown content
  const readingTime = calculateReadingTime(content);

  return {
    slug: realSlug,
    meta: data as PostMeta,
    content,
    readingTime, // Exported to keep the Next.js build happy
  };
}

// 3. Fetch all posts for feeds and sidebars
export function getAllPosts() {
  const files = fs.readdirSync(contentDirectory);

  // Safety filter to prevent hidden files from crashing the parser
  const mdFiles = files.filter(file => file.endsWith('.md'));

  const posts = mdFiles.map((file) => {
    const slug = file.replace(/\.md$/, '');
    // Extract readingTime along with meta
    const { meta, readingTime } = getPostBySlug(slug);
    return {
      slug,
      meta,
      readingTime,
    };
  });

  // Sort posts chronologically (newest first)
  return posts.sort((a, b) => {
    if (a.meta.date < b.meta.date) return 1;
    if (a.meta.date > b.meta.date) return -1;
    return 0;
  });
}

// 4. Utility specifically for Next.js static routing (generateStaticParams)
export function getAllSlugs() {
  const files = fs.readdirSync(contentDirectory);

  // Safety filter here as well
  const mdFiles = files.filter(file => file.endsWith('.md'));

  return mdFiles.map((file) => file.replace(/\.md$/, ''));
}

// 5. Get a list of all unique tags across all markdown files
export function getAllTags(): string[] {
  const posts = getAllPosts();
  const tags = new Set<string>();

  posts.forEach((post) => {
    if (post.meta.tags) {
      post.meta.tags.forEach((tag) => tags.add(tag.toLowerCase()));
    }
  });

  return Array.from(tags);
}

// 6. Filter posts by a specific tag
export function getPostsByTag(tag: string) {
  const posts = getAllPosts();
  return posts.filter((post) => {
    if (!post.meta.tags) return false;
    // Map tags to lowercase to ensure case-insensitive matching
    const lowerCaseTags = post.meta.tags.map((t) => t.toLowerCase());
    return lowerCaseTags.includes(tag.toLowerCase());
  });
}