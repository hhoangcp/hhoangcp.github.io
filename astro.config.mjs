import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeMathjax from 'rehype-mathjax';
import { toHtml } from 'hast-util-to-html';
import { unified } from '@astrojs/markdown-remark';
import icon from 'astro-icon';

// Cờ chọn engine render công thức (đọc lúc build):
//   MATH_ENGINE=mathjax (mặc định) | katex
//   MATH_CLIENT=1 (client-side) | 0 (server-side)
// Mặc định mỗi engine: mathjax → client-side (HTML nhỏ, MathJax tex-svg.js
// render ở trình duyệt), katex → server-side (rehype-katex).
const MATH_ENGINE = (process.env.MATH_ENGINE || 'mathjax').toLowerCase();
const MATH_CLIENT = (process.env.MATH_CLIENT ?? (MATH_ENGINE === 'mathjax' ? '1' : '0')) === '1';

// Moi phan so dung \dfrac (displaystyle): tu/mau tach ro, tranh chat ep
// kieu textstyle mac dinh cua KaTeX. Ap dung cho moi bai viet.
const remarkDfrac = () => {
  const walk = (node) => {
    if (
      node &&
      (node.type === 'math' || node.type === 'inlineMath') &&
      typeof node.value === 'string'
    ) {
      node.value = node.value.replace(/\\frac/g, '\\dfrac');
    }
    if (node && Array.isArray(node.children)) node.children.forEach(walk);
  };
  return (tree) => walk(tree);
};

// Luu HTML cua heading h2-h4 vao data.astro.frontmatter
// de TOC hien dung cong thuc. O phase nay heading
// chua duoc gan id (Astro gan id o plugin sau cung) nen TOC se match theo
// thu tu va do sau heading thay vi theo slug.
const rehypeTocHtml = () => (tree, file) => {
  const out = [];
  const visit = (node) => {
    if (node.type === 'element' && /^h[2-4]$/.test(node.tagName)) {
      out.push({ depth: Number(node.tagName[1]), html: toHtml(node.children) });
    }
    if (node && Array.isArray(node.children)) node.children.forEach(visit);
  };
  visit(tree);
  const astro = (file.data.astro = file.data.astro || {});
  astro.frontmatter = astro.frontmatter || {};
  astro.frontmatter.tocHtml = out;
};

// Bọc mọi <table> cấp gốc trong <div class="table-wrap"> để bảng rộng cuộn ngang
// (overflow-x trên chính thẻ table không có tác dụng theo spec CSS).
const rehypeTableWrap = () => (tree) => {
  if (!Array.isArray(tree.children)) return;
  tree.children = tree.children.flatMap((node) =>
    node.type === 'element' && node.tagName === 'table'
      ? [
          {
            type: 'element',
            tagName: 'div',
            properties: { className: ['table-wrap'] },
            children: [node],
          },
        ]
      : [node]
  );
};

// Gập code block dài trong <details class="code-fold">: bài viết gọn hơn,
// người đọc không muốn xem code có thể bỏ qua (kiểu thu nhỏ/mở rộng cnblog).
// Lưu ý: plugin chạy SAU rehype-shiki của Astro nên <pre> đã mang class
// astro-code và attribute data-language — lấy ngôn ngữ từ đó.
const CODE_FOLD_MIN_LINES = 15;
const CODE_FOLD_LANG = { cpp: 'C++', python: 'Python', java: 'Java', js: 'JS' };
const rehypeCodeFold = () => (tree) => {
  if (!Array.isArray(tree.children)) return;
  tree.children = tree.children.flatMap((node) => {
    if (node?.type !== 'element' || node.tagName !== 'pre') return [node];
    // Thứ tự pipeline khác nhau giữa build (shiki chạy trước user plugin —
    // lấy ngôn ngữ từ data-language trên pre) và dev (user plugin trước
    // shiki — lấy từ class language-* trên code). Nhận diện cả hai.
    const rawClass = node.properties?.class ?? node.properties?.className;
    const preClasses =
      typeof rawClass === 'string'
        ? rawClass.split(/\s+/)
        : Array.isArray(rawClass)
          ? rawClass
          : [];
    let lang = '';
    if (preClasses.includes('astro-code')) {
      lang = String(node.properties?.dataLanguage || '');
    } else {
      const code = (node.children || []).find((c) => c?.type === 'element' && c.tagName === 'code');
      const codeRaw = code?.properties?.class ?? code?.properties?.className;
      const codeClasses =
        typeof codeRaw === 'string' ? codeRaw.split(/\s+/) : Array.isArray(codeRaw) ? codeRaw : [];
      lang = codeClasses.find((c) => c.startsWith('language-'))?.slice('language-'.length) || '';
    }
    if (!lang || lang === 'math') return [node];
    let text = '';
    const walk = (n) => {
      if (n.type === 'text') text += n.value;
      if (Array.isArray(n.children)) n.children.forEach(walk);
    };
    walk(node);
    const lines = text.replace(/\n+$/, '').split('\n').length;
    if (lines < CODE_FOLD_MIN_LINES) return [node];
    const label = CODE_FOLD_LANG[lang] || (lang ? lang.toUpperCase() : 'Code');
    // Hiện 5 dòng đầu + mờ dần + nút mở rộng — người đọc không cần code
    // có thể lướt qua, cần thì bấm mở cả block.
    return [
      {
        type: 'element',
        tagName: 'div',
        properties: { className: ['code-fold'] },
        children: [
          node,
          {
            type: 'element',
            tagName: 'div',
            properties: { className: ['code-fold-fade'] },
            children: [],
          },
          {
            type: 'element',
            tagName: 'button',
            properties: {
              className: ['code-fold-btn'],
              type: 'button',
              dataLines: String(lines),
              ariaLabel: `Mở rộng code ${label}`,
            },
            children: [{ type: 'text', value: `Mở rộng code ${label} — ${lines} dòng` }],
          },
        ],
      },
    ];
  });
};

// Chế độ client-side: không có rehype math, remark-rehype xuất math thành
// <code class="language-math"> (MathJax/auto-render bỏ qua thẻ code). Plugin
// này unwrap về text thô "$..$" / "$$..$$" để engine bên trình duyệt nhận diện.
const rehypeMathRaw = () => (tree) => {
  const textOf = (node) => {
    let s = '';
    const walk = (n) => {
      if (n.type === 'text') s += n.value;
      if (Array.isArray(n.children)) n.children.forEach(walk);
    };
    walk(node);
    return s;
  };
  const isMathCode = (node, display) =>
    node?.type === 'element' &&
    node.tagName === 'code' &&
    Array.isArray(node.properties?.className) &&
    node.properties.className.includes('language-math') &&
    (display ? node.properties.className.includes('math-display') : true);
  const transform = (node) => {
    if (!Array.isArray(node.children)) return;
    node.children = node.children.flatMap((child) => {
      if (child.type === 'element' && child.tagName === 'pre') {
        const code = child.children?.[0];
        if (isMathCode(code, true)) {
          return [{ type: 'text', value: `$$${textOf(code)}$$` }];
        }
      }
      if (isMathCode(child, false)) {
        return [{ type: 'text', value: `$${textOf(child)}$` }];
      }
      return [child];
    });
    node.children.forEach(transform);
  };
  transform(tree);
};

const processor = unified({
  remarkPlugins: [remarkMath, remarkDfrac],
  rehypePlugins: [
    ...(MATH_CLIENT ? [] : MATH_ENGINE === 'katex' ? [rehypeKatex] : [rehypeMathjax]),
    ...(MATH_CLIENT ? [rehypeMathRaw] : []),
    rehypeTocHtml,
    rehypeTableWrap,
    rehypeCodeFold,
  ],
});

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
    processor,
  },
});
