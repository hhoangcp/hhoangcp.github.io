// Bỏ dấu tiếng Việt — dùng chung cho index (build) và query (client).
// "Thuật toán" -> "thuat toan", "Đồ thị" -> "do thi".
// Note: đ/Đ không decompose qua NFD nên phải thay tay; hầu hết ký tự
// precomposed sau fold giữ nguyên độ dài (cần cho snippet).
export function foldVN(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase();
}
