// Dãy số trang hiển thị dùng chung cho Pagination.astro (server) và trang
// tìm kiếm (client). Kết quả: danh sách số trang hoặc dấu '…' (ellipsis).
// Luôn hiện 1 và trang cuối; cửa sổ ±2 quanh trang hiện tại; khi nhiều
// trang thì tiền tố/hậu tố liên tục dài hơn 4 số được thay bằng '…'.
export function paginationItems(page: number, lastPage: number): (number | 'ellipsis')[] {
  lastPage = Math.max(1, lastPage);
  page = Math.min(Math.max(1, page), lastPage);
  const numbers = new Set<number>([1, lastPage]);
  const half = 2; // nửa cửa sổ quanh trang hiện tại
  for (let n = page - half; n <= page + half; n++) numbers.add(Math.min(Math.max(n, 1), lastPage));
  let arr = [...numbers].sort((a, b) => a - b);

  if (lastPage >= 10) {
    // Giới hạn chuỗi liên tục từ 1
    let k = 0;
    while (k < arr.length && arr[k] === k + 1) k++;
    if (k > 4) arr = [1, ...arr.slice(k - 3)];
    // Giới hạn chuỗi liên tục kết thúc ở lastPage
    let m = arr.length;
    while (m > 0 && arr[m - 1] === lastPage - (arr.length - m)) m--;
    if (arr.length - m > 4) arr = [...arr.slice(0, arr.length - (arr.length - m) + 3), lastPage];
  }

  const items: (number | 'ellipsis')[] = [];
  for (const n of arr) {
    const prev = items[items.length - 1];
    if (typeof prev === 'number' && n - prev > 1) items.push('ellipsis');
    items.push(n);
  }
  return items;
}
