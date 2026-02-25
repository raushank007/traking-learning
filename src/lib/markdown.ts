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

export function getPostBySlug(slug: string) {
  const realSlug = slug.replace(/\.md$/, '');
  const fullPath = path.join(contentDirectory, `${realSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  const { data, content } = matter(fileContents);

  return {
    slug: realSlug,
    meta: data as PostMeta,
    content,
  };
}

export function getAllPosts() {
  const files = fs.readdirSync(contentDirectory);

  const posts = files.map((file) => {
    const slug = file.replace(/\.md$/, '');
    const { meta } = getPostBySlug(slug);
    return {
      slug,
      meta,
    };
  });

  // Sort posts chronologically (newest first)
  return posts.sort((a, b) => {
    if (a.meta.date < b.meta.date) return 1;
    if (a.meta.date > b.meta.date) return -1;
    return 0;
  });
}

// Keep this utility specifically for Next.js static routing
export function getAllSlugs() {
  const files = fs.readdirSync(contentDirectory);
  return files.map((file) => file.replace(/\.md$/, ''));
}

// 1. Get a list of all unique tags across all markdown files
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

// 2. Filter posts by a specific tag
export function getPostsByTag(tag: string) {
  const posts = getAllPosts();
  return posts.filter((post) => {
    if (!post.meta.tags) return false;
    // Map tags to lowercase to ensure case-insensitive matching
    const lowerCaseTags = post.meta.tags.map((t) => t.toLowerCase());
    return lowerCaseTags.includes(tag.toLowerCase());
  });
}