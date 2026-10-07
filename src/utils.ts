import { getCollection, type CollectionEntry } from 'astro:content';

export function formatDate(d: Date): string {
  return d.toLocaleDateString('vi-VN', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateLong(d: Date): string {
  return d.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function capitalize(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function sortPosts(posts: CollectionEntry<'posts'>[]): CollectionEntry<'posts'>[] {
  return [...posts]
    .filter((p) => !p.data.draft)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export async function getAllPosts(): Promise<CollectionEntry<'posts'>[]> {
  const posts = await getCollection('posts');
  return sortPosts(posts);
}

export type TaxItem = { slug: string; name: string; count: number };

export function prettyTag(s: string): string {
  return s.replace(/[-_]+/g, ' ').trim();
}

export function getAllTags(posts: CollectionEntry<'posts'>[]): TaxItem[] {
  const map = new Map<string, { name: string; count: number }>();
  for (const p of posts)
    for (const t of p.data.tags) {
      const slug = slugify(t);
      const e = map.get(slug);
      if (e) e.count++;
      else map.set(slug, { name: t, count: 1 });
    }
  return [...map.entries()]
    .map(([slug, v]) => ({ slug, name: v.name, count: v.count }))
    .sort((a, b) => b.count - a.count || a.slug.localeCompare(b.slug));
}

export function getAllCategories(posts: CollectionEntry<'posts'>[]): TaxItem[] {
  const map = new Map<string, { name: string; count: number }>();
  for (const p of posts)
    for (const c of p.data.category) {
      const slug = slugify(c);
      const e = map.get(slug);
      if (e) e.count++;
      else map.set(slug, { name: c, count: 1 });
    }
  return [...map.entries()]
    .map(([slug, v]) => ({ slug, name: v.name, count: v.count }))
    .sort((a, b) => b.count - a.count || a.slug.localeCompare(b.slug));
}

export function stripMarkdown(body: string): string {
  return body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/~~~[\s\S]*?~~~/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/\$[^$]*\$/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/[*_~>#|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getAdjacentPosts(
  post: CollectionEntry<'posts'>,
  posts: CollectionEntry<'posts'>[]
): { prev: CollectionEntry<'posts'> | null; next: CollectionEntry<'posts'> | null } {
  const i = posts.findIndex((p) => p.id === post.id);
  if (i === -1) return { prev: null, next: null };
  return { prev: posts[i + 1] ?? null, next: posts[i - 1] ?? null };
}

export function getRelatedPosts(
  post: CollectionEntry<'posts'>,
  posts: CollectionEntry<'posts'>[],
  n = 3
): CollectionEntry<'posts'>[] {
  const tags = new Set(post.data.tags);
  const scored = posts
    .filter((p) => p.id !== post.id)
    .map((p) => ({ p, score: p.data.tags.filter((t) => tags.has(t)).length }))
    .sort((a, b) => b.score - a.score || b.p.data.date.getTime() - a.p.data.date.getTime());
  const related = scored.filter((s) => s.score > 0).map((s) => s.p);
  if (related.length >= n) return related.slice(0, n);
  for (const s of scored) {
    if (s.score > 0) continue;
    related.push(s.p);
    if (related.length >= n) break;
  }
  return related.slice(0, n);
}

export function groupPostsByYear(
  posts: CollectionEntry<'posts'>[]
): { year: number; posts: CollectionEntry<'posts'>[] }[] {
  const map = new Map<number, CollectionEntry<'posts'>[]>();
  for (const p of posts) {
    const y = p.data.date.getFullYear();
    const arr = map.get(y);
    if (arr) arr.push(p);
    else map.set(y, [p]);
  }
  return [...map.entries()]
    .map(([year, ps]) => ({ year, posts: ps }))
    .sort((a, b) => b.year - a.year);
}
