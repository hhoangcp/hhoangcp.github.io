import type { APIRoute } from 'astro';
import { getAllPosts, stripMarkdown } from '../../utils';

export const GET: APIRoute = async () => {
  const posts = await getAllPosts();
  const index = posts.map((p) => ({
    title: p.data.title,
    description: p.data.description ?? '',
    tags: p.data.tags,
    category: p.data.category,
    url: `/posts/${p.id}/`,
    date: p.data.date.toISOString(),
    body: stripMarkdown(p.body ?? ''),
  }));
  return new Response(JSON.stringify(index), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
};
