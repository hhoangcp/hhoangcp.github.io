import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeMathjax from 'rehype-mathjax';
import icon from 'astro-icon';

// Moi phan so dung \dfrac (displaystyle): tu/mau tach ro, tranh chat ep
// kieu textstyle mac dinh cua KaTeX. Ap dung cho moi bai viet.
const remarkDfrac = () => {
  const walk = (node) => {
    if (node && (node.type === 'math' || node.type === 'inlineMath') && typeof node.value === 'string') {
      node.value = node.value.replace(/\\frac/g, '\\dfrac');
    }
    if (node && Array.isArray(node.children)) node.children.forEach(walk);
  };
  return (tree) => walk(tree);
};

export default defineConfig({
  site: 'https://hhoangcp.github.io',
  base: '/',
  trailingSlash: 'ignore',
  integrations: [mdx(), sitemap(), icon()],
  markdown: {
    syntaxHighlight: 'shiki',
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: true,
    },
    remarkPlugins: [remarkMath, remarkDfrac],
    rehypePlugins: [rehypeMathjax],
  },
});
