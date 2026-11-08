---
title: Độ phức tạp thuật toán — đếm phép, Big-O và ước lượng từ giới hạn đề
date: 2026-11-02 17:00:00
description: Đếm phép của từng vòng lặp, định nghĩa Big-O, quy tắc 10^8 phép mỗi giây và cách đọc ngược độ phức tạp cần tìm từ giới hạn đề.
tags: [complexity, big-o, analysis, cpp, python]
tree: [co-ban, nen-tang]
---

## Bài toán dẫn đường

Ba tình huống thật trên máy chấm, cùng nói về "quy mô phép tính":

- **Tìm max của mảng $10^6$ phần tử.** Quét một vòng, so từng phần tử với max hiện tại: cỡ $10^6$ phép. Xong trong vài phần nghìn giây — chạy ngay, không cần nghĩ thêm.
- **Đếm số cặp $(i < j)$ có $a_i = a_j$ trong mảng $10^6$ phần tử.** Hai vòng lồng nhau tốn $\frac{n(n-1)}{2} \approx 5 \cdot 10^{11}$ phép — gần một tiếng rưỡi trên C++ và hơn nửa ngày trên Python. Duyệt trâu đã chết ngay từ đầu; bài này buộc phải sắp xếp hoặc dùng bảng đếm để hạ xuống $O(n \log n)$.
- **Sàng số nguyên tố tới $10^8$** ([bài sàng](/posts/prime-sieve/) có cài đặt đầy đủ). Sàng Eratosthenes là $O(n \log \log n)$ — tốt về mặt tiệm cận — nhưng sống hay chết phụ thuộc từng chi phí nhỏ: mảng `int` đánh dấu tốn 400 MB là vượt bộ nhớ, mảng một byte chạy được trong khoảng một giây, còn Python thuần thì quá chậm.

Ba tình huống không khác nhau ở "độ khó" của đề, mà ở **bậc tăng trưởng số phép so với tốc độ máy**. Cái thước để đo gồm ba vạch: đếm phép, Big-O, và đổi số phép thành thời gian; cuối cùng là kỹ năng dùng ngược — đọc giới hạn đề để đoán trước độ phức tạp cần tìm. Hai phần cuối lo chỗ Big-O bỏ qua: bộ nhớ và hằng số.

## Đếm phép

Đơn vị đo thô nhất nhưng đúng nhất: **một phép** = một lệnh đơn — gán, so sánh, cộng/trừ/nhân, truy cập mảng. Chia và lấy dư cũng đếm một phép trong mô hình này, dù trên CPU thật chúng đắt hơn hẳn (xem mục Hằng số thực hành).

Ba quy tắc đủ dùng cho hầu hết code thi:

1. **Vòng lặp chạy $k$ lần thì thân vòng thực hiện $k$ lần**; khung vòng (khởi tạo, so sánh biên, tăng biến) tốn thêm cỡ $2k + 2$.
2. **Lồng nhau thì nhân**: hai vòng $n \times n$ cho $n^2$ lần thân vòng trong. Vòng trong có biên phụ thuộc vòng ngoài thì lấy tổng, ví dụ $\sum_{i=0}^{n-1}(n - i - 1) = \frac{n(n-1)}{2}$.
3. **Tuần tự thì cộng**: đoạn này $5n$, đoạn kia $n^2$ — cộng lại $n^2 + 5n$; khi $n$ lớn, bậc cao nuốt bậc thấp.

Tính tay toàn bộ một hàm 10 dòng — tính tổng các phần tử, cộng thêm tổng các tích từng cặp:

```cpp
#include <bits/stdc++.h>

using namespace std;

typedef long long i64;
const i64 MOD = 1e9 + 7;
const int INF = 1e9 + 7;

i64 tong_hop(const vector<int>& a) {
    int n = (int)a.size();             // 1 phép
    i64 s = 0;                   // 1 phép
    for (int i = 0; i < n; ++i)        // khung: 1 + (n+1) + n
        s += a[i];                     // 3n: truy cập + cộng + gán
    for (int i = 0; i < n; ++i)        // khung: 1 + (n+1) + n
        for (int j = 0; j < n; ++j)    // khung, tính trên từng i
            s += a[i] * a[j];          // 5n²: 2 truy cập + nhân + cộng + gán
    return s;
}

void solve() {
    // demo: a = {1, 2, 3} -> tổng 6 cộng tổng tích từng cặp (1+2+3)^2 = 36
    cout << tong_hop({1, 2, 3}) << '\n';
}

int main() {
    ios_base::sync_with_stdio(0); cin.tie(NULL);

    int t = 1; //cin >> t;
    while (t--) {
        solve();
    }

    return 0;
}
```

Bảng tính tay:

| Phần | Số phép |
|---|---|
| hai lệnh khởi tạo | $2$ |
| khung vòng 1 | $2n + 2$ |
| thân vòng 1 — $n$ lần $\times$ 3 phép | $3n$ |
| khung vòng 2 | $2n + 2$ |
| khung vòng trong — $n$ lần $\times\, (2n+2)$ | $2n^2 + 2n$ |
| thân vòng trong — $n^2$ lần $\times$ 5 phép | $5n^2$ |
| **tổng** | $7n^2 + 9n + 6$ |

Với $n = 1000$: đúng $7.009.006$ phép. Điểm mấu chốt không phải con số tuyệt đối mà là **tốc độ tăng**: nhân $n$ với 2 thì hạng $n^2$ chiếm lĩnh và số phép gần như gấp bốn; nhân $n$ với 10 thì số phép gấp trăm. Chính bậc tăng trưởng — chứ không phải hệ số 7 hay 9 — quyết định thuật toán sống hay chết.

## Ký hiệu Big-O

Định nghĩa: $f(n) = O(g(n))$ nếu tồn tại hằng số $c > 0$, $n_0$ sao cho $f(n) \le c \cdot g(n)$ với mọi $n \ge n_0$.

Đọc tự nhiên: **bỏ hằng nhân, bỏ các hạng bậc thấp, giữ lại đúng bậc tăng trưởng**. Ví dụ ngay từ bảng trên: $7n^2 + 9n + 6 = O(n^2)$ vì với mọi $n \ge 1$,

7n^2 + 9n + 6 \;\le\; 7n^2 + 9n^2 + 6n^2 \;=\; 22n^2.

Ngược lại, $n^2 \ne O(n)$: với bất kì hằng $c$ cố định, chọn $n > c$ thì $n^2 > c \cdot n$ — không tồn tại cặp $(c, n_0)$ thỏa định nghĩa. Trong lập trình thi đấu, Big-O thường được dùng như cận chặt (ký hiệu $\Theta$ của lí thuyết): nói "merge sort là $O(n \log n)$" nghĩa là nó vừa không chậm hơn, cũng không có dư giả về bậc.

Bảng các mức quen thuộc, từ rẻ nhất lên đắt nhất, mỗi mức kèm một thuật toán thật:

| Mức | Ví dụ thuật toán thật |
|---|---|
| $O(1)$ | truy vấn min của đoạn bất kì sau khi dựng sparse table |
| $O(\log n)$ | chặt nhị phân trên mảng đã sắp xếp |
| $O(\sqrt n)$ | kiểm tra nguyên tố bằng thử chia tới $\sqrt n$ |
| $O(n)$ | tìm min mảng bằng một vòng quét |
| $O(n \log n)$ | merge sort, heapsort |
| $O(n^2)$ | duyệt mọi cặp $(i, j)$ |
| $O(n^3)$ | nhân hai ma trận $n \times n$ |
| $O(2^n)$ | duyệt mọi tập con của tập $n$ phần tử |
| $O(n!)$ | duyệt mọi hoán vị của $n$ phần tử |

Vì sao các mức đúng như vậy:

- **Chặt nhị phân $O(\log n)$**: mỗi bước khoảng tìm kiếm giảm một nửa; sau $k$ bước khoảng còn $\le n / 2^k$, hết khi $2^k \ge n$.
- **Thử chia $O(\sqrt n)$**: nếu $n$ có ước $d > \sqrt n$ thì $n/d < \sqrt n$ cũng là ước — chỉ cần thử tới $\sqrt n$.
- **Merge sort $O(n \log n)$**: tách đôi $\log_2 n$ tầng, mỗi tầng gộp với tổng $O(n)$ phép.
- **Nhân ma trận $O(n^3)$**: $n^2$ ô kết quả, mỗi ô là tổng của $n$ tích.
- **Tập con $O(2^n)$**: mỗi phần tử có đúng hai lựa chọn (lấy/không lấy), các lựa chọn độc lập.
- **Hoán vị $O(n!)$**: chọn phần tử đầu $n$ cách, phần thứ hai $n-1$ cách, tiếp tục như vậy.

Các mức cách nhau **rất xa**: với $n = 40$, duyệt mọi cặp là $1600$ phép — tức thời; duyệt mọi tập con là $2^{40} \approx 10^{12}$ phép — chết với mọi giới hạn thời gian thông thường. Mỗi nấc lên thang là một lần $n$ tối đa chấp nhận được giảm hẳn một bậc độ lớn.

## Từ số phép tới thời gian

Đổi số phép thành thời gian chỉ cần một con số: **máy chấm thực hiện cỡ $10^8$ tới $10^9$ phép đơn giản mỗi giây** với C++ biên dịch tối ưu. Khi ước lượng, lấy $10^8$ — con số an toàn, chừa chỗ cho hằng số xấu.

Python là câu chuyện khác: CPython thông dịch từng dòng, mỗi "phép" phải đi qua máy ảo — chậm hơn C++ khoảng **50–100 lần**, chỉ đạt cỡ $10^7$ phép mỗi giây.

Bảng ước lượng thời gian theo $n$ (C++ tính với $10^8$ phép/giây, Python với $10^7$; $\log_2 n$ làm tròn 17/20/23/27 tương ứng $n = 10^5/10^6/10^7/10^8$):

| Mức | $n = 10^5$ | $n = 10^6$ | $n = 10^7$ | $n = 10^8$ |
|---|---|---|---|---|
| $O(n)$ — C++ | 1 ms | 10 ms | 0,1 s | ~1 s |
| $O(n)$ — Python | 10 ms | 0,1 s | ~1 s | ~10 s |
| $O(n \log n)$ — C++ | ~20 ms | ~0,2 s | ~2 s | ~27 s |
| $O(n \log n)$ — Python | ~0,2 s | ~2 s | ~20 s | ~4,5 phút |
| $O(n^2)$ — C++ | ~2 phút | ~3 giờ | ~12 ngày | ~3 năm |
| $O(n^2)$ — Python | ~17 phút | ~1 ngày | ~4 tháng | ~30 năm |

Cách đọc: cùng một thuật toán $O(n \log n)$ với $n = 10^7$, C++ mất ~2 s — đã chết với giới hạn thời gian 1 giây, Python mất ~20 s — chết chắc. Muốn Python sống phải trông vào PyPy hoặc viết lại phần nóng.

Hai lưu ý:

- "Phép đơn giản" nghĩa là phép số học nguyên trên dữ liệu nằm trong cache. Phép chia/lấy dư, gọi hàm qua con trỏ ảo, truy cập bộ nhớ nhảy loạn (cache miss) đều đắt hơn nhiều lần — bảng trên là thước đo sơ bộ, không phải cam kết.
- Giới hạn thời gian 1 giây là mặc định của phần lớn đề. Đề cho rộng 2–5 giây thường là dấu hiệu thuật toán chuẩn có hằng số lớn (như $O(n \sqrt n)$).

## Đọc ngược từ giới hạn đề

Kỹ năng ngược: chưa đọc kỹ đề, chỉ nhìn **giới hạn** — biết ngay lớp thuật toán cần tìm. Lí do nó hoạt động: người ra đề chọn giới hạn **sau khi** đã chọn thuật toán chuẩn; giới hạn phải đủ lớn để giải ngây thơ không kịp, đủ nhỏ để giải chuẩn chạy thoải mái (thường chừa biên độ chục lần). Giới hạn vì thế là vân tay của độ phức tạp chuẩn.

Bảng đối chiếu, kèm con số kiểm chứng theo mốc $10^8$ phép mỗi giây:

| Giới hạn đề | Độ phức tạp cần tìm | Con số kiểm chứng |
|---|---|---|
| $n \le 10$ | $O(n!)$ hoặc $O(2^n \cdot n)$ | $10! \approx 3{,}6 \cdot 10^6$ |
| $n \le 20$ | $O(2^n)$ hoặc $O(2^n \cdot n)$ | $2^{20} \approx 10^6$; $20 \cdot 2^{20} \approx 2 \cdot 10^7$ |
| $n \le 500$ | $O(n^3)$ | $500^3 = 1{,}25 \cdot 10^8$ — sát, cần hằng nhỏ |
| $n \le 5000$ | $O(n^2)$ | $5000^2 = 2{,}5 \cdot 10^7$ — dư giả |
| $n \le 10^5$ | $O(n \log n)$ | $10^5 \cdot 17 \approx 2 \cdot 10^6$ |
| $n \le 10^6$ | $O(n)$, hoặc $O(n \log n)$ với hằng nhỏ | $10^6 \cdot 20 = 2 \cdot 10^7$ |
| $n \le 10^9$ (quy mô **giá trị**) | $O(\log n)$, $O(\sqrt n)$ hoặc $O(1)$ mỗi truy vấn | $\sqrt{10^9} \approx 3 \cdot 10^4$; $\log_2 10^9 \approx 30$ |

Vài điểm nhấn:

- $n \le 20$ là dấu hiệu kinh điển của **QHĐ trạng thái bit** hoặc duyệt subset; $n \le 10$ thì ngay cả duyệt hoán vị toàn bộ vẫn ổn.
- Hàng cuối khác bản chất: **số phần tử có thể vẫn ít**, nhưng giá trị của số quá lớn để quét từng đơn vị — câu chuyện chuyển sang số học: lũy thừa nhanh $O(\log)$, đếm ước $O(\sqrt n)$, hoặc công thức đóng $O(1)$.
- Đây là **heuristic**, không phải luật: thuật toán có hằng số lớn ($O(n \sqrt n)$ của Mo, $O(n \log^2 n)$ của segment tree trên cây) sống ở $n$ thấp hơn hẳn mức bảng; ngược lại khi tự ra đề, chọn $n$ sao cho thuật toán chuẩn chạy trong khoảng $10^7$–$10^8$ phép là vừa đẹp.

## Độ phức tạp bộ nhớ

Bộ nhớ đổi bằng số thẳng hơn thời gian: giới hạn cứng trên máy chấm thường là **256 MB** $\approx 2{,}56 \cdot 10^8$ byte.

Quy đổi cơ bản: mảng `int` $10^6$ phần tử chiếm $4 \cdot 10^6$ byte = **4 MB**; `long long` thì gấp đôi, 8 MB.

| Kiểu ô | Số byte | 256 MB chứa được |
|---|---|---|
| `int`, `float` | 4 | $6{,}4 \cdot 10^7$ |
| `long long`, `double`, `pair<int,int>` | 8 | $3{,}2 \cdot 10^7$ |
| `bool`, `char` | 1 | $2{,}56 \cdot 10^8$ |
| `vector<bool>` (nén bit) | $\tfrac{1}{8}$ | $\approx 2 \cdot 10^9$ |

Số phận của sàng tới $10^8$ ở đầu bài nằm trong bảng này: mảng `int` đánh dấu là 400 MB — chết; mảng một byte là 100 MB — sống; `vector<bool>` chỉ ~12 MB.

Độ phức tạp bộ nhớ của thuật toán đếm tương tự như đếm phép: theo ô nhớ **lớn nhất còn sống cùng lúc** — "thuật toán $O(n)$ bộ nhớ" giữ mảng cỡ $n$. Hai nguồn hay bị quên:

- **Ngăn xếp đệ quy**: mỗi tầng gọi giữ biến cục bộ, đệ quy sâu $n$ là $O(n)$ bộ nhớ ẩn dù không khai báo mảng nào; ngăn xếp mặc định của nhiều hệ thống chỉ vài MB nên DFS sâu dễ tràn.
- **`vector<vector<int>>`**: mỗi dòng là một vector riêng với 24 byte tiền tố (ba con trỏ trên máy 64-bit) cộng chi phí quản lí mỗi lần cấp phát. Bảng $10^6$ dòng rỗng đã tốn 24 MB trước khi chứa dữ liệu; bảng $n \times m$ bị xé thành $n$ vùng rời nên quét theo cột gây cache miss liên tục. Ma trận lớn nên nằm trên **một mảng phẳng** với chỉ số `i * m + j`.

## Hằng số thực hành

Big-O bỏ hằng số khi so sánh thuật toán; khi thi, hằng số quyết định AC hay TLE:

- **Đọc/ghi input.** `cin`/`cout` kể cả sau khi tắt đồng bộ vẫn chậm hơn hẳn `scanf`, và còn kém xa `fread` đọc nguyên khối — [bài HLD](/posts/hld/) có bàn chi tiết kèm cài đặt bộ đọc đệm. Input vài MB đọc bằng `cin` có thể tốn riêng nó ~1 giây.
- **Phép chia và lấy dư.** CPU thực hiện phép chia nguyên chậm hơn cộng/nhân vài chục lần. Trong vòng trong cùng nên hoãn phép mod (cộng dồn rồi mod một lần), hoặc với modul nhỏ thay `%` bằng trừ có điều kiện.
- **Builtin bit.** `__builtin_popcount(x)` (đếm bit 1), `__builtin_ctz(x)` (đếm bit 0 cuối), `__builtin_clz(x)` (đếm bit 0 đầu) biên dịch về một lệnh máy — nhanh hơn vòng đếm bit tay cả chục lần; bản 64-bit có hậu tố `ll`. Python có `int.bit_count()`.

Hai tình huống (a) và (c) đầu bài — cùng "một vòng quét" nhưng một bên thả giây, một bên gánh từng byte — chính là khoảng cách giữa bậc tăng trưởng và hằng số: Big-O chọn hướng đi đúng, hằng số quyết định có về đích kịp hay không.

## Cài đặt

Hàm `dem_phep` đếm **đúng** số phép của `tong_hop` theo đúng mô hình ở mục Đếm phép — không đo thời gian thật, chỉ cộng các số đã tính tay. Chạy với $n = 1000$ trả về $7.009.006$, khớp bảng tính tay.

**C++**

```cpp
#include <bits/stdc++.h>

using namespace std;

typedef long long i64;
const i64 MOD = 1e9 + 7;
const int INF = 1e9 + 7;

// đếm đúng số phép của hàm tong_hop theo mô hình ở mục Đếm phép
i64 dem_phep(int n) {
    i64 dem = 0;
    dem += 2;                        // hai lệnh khởi tạo n, s
    dem += (2 * n + 2) + 3 * n;      // vòng đơn: khung + thân
    dem += 2 * n + 2;                // khung vòng ngoài
    for (int i = 0; i < n; ++i)
        dem += (2 * n + 2) + 5 * n;  // khung vòng trong + thân, tính trên từng i
    return dem;                      // 7n² + 9n + 6
}

void solve() {
    // demo như bài: n = 1000 -> 7.009.006 phép, khớp bảng tính tay 7n^2 + 9n + 6
    cout << dem_phep(1000) << '\n';
}

int main() {
    ios_base::sync_with_stdio(0); cin.tie(NULL);

    int t = 1; //cin >> t;
    while (t--) {
        solve();
    }

    return 0;
}
```

**Python**

```python
def dem_phep(n: int) -> int:
    """Đếm đúng số phép của hàm tong_hop theo mô hình ở mục Đếm phép."""
    dem = 0
    dem += 2  # hai lệnh khởi tạo n, s
    dem += (2 * n + 2) + 3 * n  # vòng đơn: khung + thân
    dem += 2 * n + 2  # khung vòng ngoài
    for i in range(n):
        dem += (2 * n + 2) + 5 * n  # khung vòng trong + thân, tính trên từng i
    return dem  # 7n² + 9n + 6
```

## Bài tập luyện

- [Weird Algorithm (CSES 1068)](https://cses.fi/problemset/task/1068): mô phỏng thẳng chuỗi $3n+1$ — mỗi bước $O(1)$, cần tin (và kiểm tra) rằng chuỗi ngắn trong thực tế, dưới 600 bước với $n \le 10^6$.
- [Trailing Zeros (CSES 1618)](https://cses.fi/problemset/task/1618): đếm số chữ số 0 cuối của $n!$ với $n \le 10^9$ — cần $O(\log n)$ bằng đếm lũy thừa ước 5, $\sum_{k \ge 1} \lfloor n/5^k \rfloor$.
- [Two Knights (CSES 1072)](https://cses.fi/problemset/task/1072): đếm cách đặt hai mã không tấn công nhau trên bàn $k \times k$ với mọi $k$ — cần công thức $O(1)$ mỗi $k$: tổng cặp trừ $4(k-1)(k-2)$.
- [Number Spiral (CSES 1071)](https://cses.fi/problemset/task/1071): giá trị tại ô $(y, x)$ của xoắn ốc với toạ độ tới $10^9$ — cần $O(1)$ mỗi truy vấn theo lớp vỏ $\min(x, y)$.
- [Maximum Subarray Sum (CSES 1643)](https://cses.fi/problemset/task/1643): đoạn con có tổng lớn nhất — cần Kadane $O(n)$ một vòng quét; duyệt mọi đoạn bằng tổng tiền tố là $O(n^2) \approx 4 \cdot 10^{10}$ phép với $n = 2 \cdot 10^5$.

## Nguồn

- <https://oj.chuyentin.pro/wiki/do-phuc-tap-thoi-gian/>
- <https://oj.chuyentin.pro/wiki/do-phuc-tap-khong-gian/>
- <https://oj.chuyentin.pro/wiki/uoc-luong-gioi-han/>
- <https://cses.fi/problemset/>
