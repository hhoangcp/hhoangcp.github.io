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

export function sortPosts(posts: CollectionEntry<'posts'>[]): CollectionEntry<'posts'>[] {
  return [...posts]
    .filter((p) => !p.data.draft)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export async function getAllPosts(): Promise<CollectionEntry<'posts'>[]> {
  const posts = await getCollection('posts');
  return sortPosts(posts);
}

export function getAllTags(posts: CollectionEntry<'posts'>[]): [string, number][] {
  const map = new Map<string, number>();
  for (const p of posts) for (const t of p.data.tags) map.set(t, (map.get(t) ?? 0) + 1);
  return [...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}
