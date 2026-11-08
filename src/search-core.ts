import { foldVN } from './vn-fold';

// Lõi search dùng chung: trang /search/ và dropdown instant ở header.
// Chạy client-side trên index JSON tĩnh, ranking theo field (title > tags >
// description > category > nội dung) + thưởng prefix — mô phỏng relevance
// của DMOJ/FTS mà không cần server, theo nghiên cứu VNOJ/CF/AtCoder Problems.

export type SearchDoc = {
  title: string;
  titleF: string;
  description: string;
  descF: string;
  tags: string[];
  tagsF: string[];
  category: string[];
  catF: string[];
  url: string;
  date: string;
  /** index nhẹ: vài trăm ký tự đầu bài (không bắt buộc) */
  head?: string;
  headF?: string;
  /** index đầy đủ (không bắt buộc) */
  body?: string;
  bodyF?: string;
};

export const SEARCH_W = { title: 10, tags: 8, desc: 3, cat: 2, body: 1, prefix: 5 };

export function searchTokens(q: string): string[] {
  return foldVN(q).split(/\s+/).filter(Boolean);
}

/** Mọi từ phải match (AND) — như AtCoder Problems; trả null nếu có từ lạc. */
export function scoreDoc(p: SearchDoc, tokens: string[]): number | null {
  let score = 0;
  for (const w of tokens) {
    let hit = false;
    if (p.titleF.includes(w)) {
      hit = true;
      score += SEARCH_W.title;
      if (p.titleF.startsWith(w)) score += SEARCH_W.prefix;
    }
    if (p.tagsF.some((t) => t.includes(w))) {
      hit = true;
      score += SEARCH_W.tags;
    }
    if (p.descF.includes(w)) {
      hit = true;
      score += SEARCH_W.desc;
    }
    if (p.catF.some((c) => c.includes(w))) {
      hit = true;
      score += SEARCH_W.cat;
    }
    const bf = p.bodyF ?? p.headF ?? '';
    if (bf && bf.includes(w)) {
      hit = true;
      score += SEARCH_W.body;
    }
    if (!hit) return null;
  }
  return score;
}

export function searchDocs(docs: SearchDoc[], tokens: string[]): { p: SearchDoc; score: number }[] {
  if (!tokens.length) return [];
  return docs
    .map((p) => {
      const score = scoreDoc(p, tokens);
      return score === null ? null : { p, score };
    })
    .filter((x): x is { p: SearchDoc; score: number } => x !== null)
    .sort(
      (a, b) => b.score - a.score || new Date(b.p.date).getTime() - new Date(a.p.date).getTime()
    );
}

export function escapeReg(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Regex không phân biệt dấu: query không dấu vẫn highlight được chữ có dấu
const FOLD_CLASS: Record<string, string> = {
  a: 'aàáảãạăằắẳẵặâầấẩẫậ',
  d: 'dđ',
  e: 'eèéẻẽẹêềếểễệ',
  i: 'iìíỉĩị',
  o: 'oòóỏõọôồốổỗộơờớởỡợ',
  u: 'uùúủũụưừứửữự',
  y: 'yỳýỷỹỵ',
};

export function foldReg(word: string) {
  return word
    .split('')
    .map((ch) => {
      const cls = FOLD_CLASS[ch];
      return cls ? '[' + cls + ']' : escapeReg(ch);
    })
    .join('');
}

export function highlightTokens(escaped: string, tokens: string[]): string {
  if (!tokens.length) return escaped;
  const re = new RegExp('(' + tokens.map(foldReg).join('|') + ')', 'giu');
  return escaped.replace(re, '<mark>$1</mark>');
}
