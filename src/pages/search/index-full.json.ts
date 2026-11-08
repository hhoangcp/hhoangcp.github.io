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

// Index đầy đủ: meta + toàn bộ nội dung (có sẵn bản bỏ dấu).
// Chỉ được fetch khi người dùng bật "Tìm cả trong nội dung".

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
      body,
      bodyF: foldVN(body),
    };
  });
  return new Response(JSON.stringify(index), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
};
