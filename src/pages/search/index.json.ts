import type { APIRoute } from 'astro';
import { getAllPosts, stripMarkdown } from '../../utils';
import { foldVN } from '../../vn-fold';
import { TREE_BRANCHES } from '../../data/tree';

// Nhánh cấp 1 trên cây tri thức — thay cho category cũ, dùng cho facet tìm kiếm
const branchOf = (tree: string[] | undefined): string[] => {
  const slug = Array.isArray(tree) ? tree[0] : undefined;
  if (!slug) return [];
  const b = TREE_BRANCHES.find((x) => x.slug === slug);
  return [b ? b.title : slug.replace(/[-_]+/g, ' ')];
};

// Index nhẹ: mọi field meta + phần đầu nội dung (đủ cho snippet gần đầu bài).
// Tìm sâu trong toàn bộ nội dung dùng /search/index-full.json (bật bằng
// checkbox "Tìm cả trong nội dung" trên trang search).
const HEAD = 400;

export const GET: APIRoute = async () => {
  const posts = await getAllPosts();
  const index = posts.map((p) => {
    const body = stripMarkdown(p.body ?? '');
    return {
      title: p.data.title,
      titleF: foldVN(p.data.title),
      description: p.data.description ?? '',
      descF: foldVN(p.data.description ?? ''),
      tags: p.data.tags,
      tagsF: p.data.tags.map(foldVN),
      category: branchOf(p.data.tree),
      catF: branchOf(p.data.tree).map(foldVN),
      url: `/posts/${p.id}/`,
      date: p.data.date.toISOString(),
      head: body.slice(0, HEAD),
      headF: foldVN(body.slice(0, HEAD)),
    };
  });
  return new Response(JSON.stringify(index), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
};
