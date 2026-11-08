import { getCollection, type CollectionEntry } from 'astro:content';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeMathjax from 'rehype-mathjax';

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

export type RelatedPost = {
  p: CollectionEntry<'posts'>;
  /** tag trùng với bài hiện tại — "vì sao liên quan" */
  sharedTags: string[];
  /** được link trực tiếp từ nội dung bài hiện tại */
  linked: boolean;
};

export function getRelatedPosts(
  post: CollectionEntry<'posts'>,
  posts: CollectionEntry<'posts'>[],
  n = 4
): RelatedPost[] {
  const others = posts.filter((p) => p.id !== post.id);
  if (!others.length) return [];

  // IDF: tag xuất hiện ở càng ít bài thì càng "đặc trưng", trọng số càng cao.
  const df = new Map<string, number>();
  for (const p of posts) {
    for (const t of p.data.tags) df.set(t, (df.get(t) ?? 0) + 1);
  }
  const weight = (t: string) => Math.log(posts.length / (df.get(t) ?? 1));

  const myTags = new Set(post.data.tags);
  const myTree = new Set((post.data.tree as string[] | undefined) ?? []);
  // Bài được link trực tiếp từ nội dung ([...](/posts/...)) — tín hiệu liên quan
  // mạnh nhất vì do chính tác giả chọn (cp-algorithms dùng đúng cách này).
  const linked = new Set<string>();
  for (const m of (post.body ?? '').matchAll(/\]\(\/posts\/([^/#?)\s]+)/g)) linked.add(m[1]);

  const scored = others.map((p) => {
    let score = 0;
    const sharedTags: string[] = [];
    for (const t of p.data.tags)
      if (myTags.has(t)) {
        score += weight(t);
        sharedTags.push(t);
      }
    // Cùng nhánh trên cây tri thức: thưởng nhẹ, không lấn tag hiếm
    let treeOverlap = 0;
    for (const seg of (p.data.tree as string[] | undefined) ?? [])
      if (myTree.has(seg)) treeOverlap++;
    score += Math.min(treeOverlap, 2) * 0.5;
    const isLinked = linked.has(p.id);
    if (isLinked) score += 2;
    return { p, score, sharedTags, linked: isLinked };
  });

  const top = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || b.p.data.date.getTime() - a.p.data.date.getTime())
    .slice(0, n);

  // Fallback (học cnblogs — luôn có gì đó thay thế): không có liên quan thật thì
  // lấy bài mới nhất cùng nhánh, rồi tới bài mới nhất chung.
  if (top.length < n) {
    const inTop = new Set(top.map((s) => s.p.id));
    const byBranch = others
      .filter(
        (p) =>
          !inTop.has(p.id) &&
          (((p.data.tree as string[] | undefined) ?? [])[0] ?? null) ===
            ((post.data.tree as string[] | undefined) ?? [])[0]
      )
      .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
    for (const p of byBranch) {
      if (top.length >= n) break;
      top.push({ p, score: 0, sharedTags: [], linked: false });
      inTop.add(p.id);
    }
    if (top.length < n) {
      const rest = others
        .filter((p) => !inTop.has(p.id))
        .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
      for (const p of rest) {
        if (top.length >= n) break;
        top.push({ p, score: 0, sharedTags: [], linked: false });
      }
    }
  }

  return top.map(({ p, sharedTags, linked: l }) => ({ p, sharedTags, linked: l }));
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

// Render công thức $..$ trong chuỗi một dòng (title/description của post).
// LUÔN render server-side — kể cả khi MATH_CLIENT=1 — vì MathJax auto-render
// không nhất quán xử lý title/desc trên list pages (PostCard template).
// Trả về null nếu chuỗi không chứa "$" — caller giữ nguyên đường text thuần.
let inlineMathRenderer: any = null;
export async function renderInlineMath(text: string): Promise<string | null> {
  if (!text || !text.includes('$')) return null;
  const engine = (process.env.MATH_ENGINE || 'mathjax').toLowerCase();
  if (!inlineMathRenderer) {
    const remarkDfrac = () => {
      const walk = (node: any) => {
        if (
          node &&
          (node.type === 'math' || node.type === 'inlineMath') &&
          typeof node.value === 'string'
        ) {
          node.value = node.value.replace(/\\frac/g, '\\dfrac');
        }
        if (node && Array.isArray(node.children)) node.children.forEach(walk);
      };
      return (tree: any) => walk(tree);
    };
    const proc = unified({
      remarkPlugins: [remarkMath, remarkDfrac],
      rehypePlugins: [engine === 'mathjax' ? rehypeMathjax : rehypeKatex],
    });
    inlineMathRenderer = await proc.createRenderer({});
  }
  const { code } = await inlineMathRenderer.render(text);
  return code.replace(/^<p>/, '').replace(/<\/p>\s*$/, '');
}
