---
title: Tổng tiền tố hai chiều — truy vấn hình chữ nhật trong O(1)
date: 2026-11-03 09:00:00
description: Dựng bảng tổng tiền tố hai chiều bằng bao hàm trừ cộng để trả mỗi truy vấn đếm hình chữ nhật trong O(1), kèm cài đặt C++ và Python.
tags: [prefix-sum, 2d, rectangle-query, cpp, python]
tree: [co-ban, sap-xep-hai-con-tro]
---

## Đề bài

**[Forest Queries (CSES 1652)](https://cses.fi/problemset/task/1652).** Cho lưới $n \times n$ ô, mỗi ô trống ('.') hoặc có một cây ('*'). Có $q$ truy vấn, mỗi truy vấn gồm bốn số $y_1$, $x_1$, $y_2$, $x_2$ — hãy đếm số cây nằm trong hình chữ nhật ô từ hàng $y_1$ tới hàng $y_2$ và từ cột $x_1$ tới cột $x_2$.

Giới hạn: $1 \le n \le 1000$, $1 \le q \le 2 \cdot 10^5$, $1 \le y_1 \le y_2 \le n$, $1 \le x_1 \le x_2 \le n$.

<div class="io" data-io="Input"><pre>4 3
.*..
*.**
**..
****
2 2 3 4
3 1 3 1
1 1 2 2</pre></div>

<div class="io" data-io="Output"><pre>3
1
2</pre></div>

Duyệt từng ô của hình chữ nhật cho mỗi truy vấn tốn $O((y_2 - y_1 + 1)(x_2 - x_1 + 1))$ — với $n = 1000$ và $q = 2 \cdot 10^5$, tệ nhất là $2 \cdot 10^{11}$ lượt xét ô. Lối thoát là trả tiền trước: dựng **một** bảng $O(n^2)$ sao cho mỗi truy vấn chỉ còn bốn ô tra và ba phép cộng trừ.

## Dựng bảng hai chiều

Ở [Sắp xếp, hai con trỏ và cửa sổ trượt](/posts/sorting-two-pointers/), mảng `pre` với `pre[i+1] = pre[i] + a[i]` đã trả tổng đoạn liên tiếp `pre[r+1] - pre[l]` trong $O(1)$. Đẩy ý tưởng đó lên lưới: đặt

$$
P[y][x] = \sum_{r=1}^{y} \sum_{c=1}^{x} a[r][c],
$$

tức $P[y][x]$ là tổng các ô của hình chữ nhật góc trên trái $(1..y,\, 1..x)$ — bảng như vậy gọi là **bảng tổng tích luỹ** (summed-area table). Hai ô kề nhau của $P$ che hai hình chữ nhật gần trùng nhau, nên giá trị này tính từ giá trị kia trong $O(1)$:

$$
P[y][x] = a[y][x] + P[y-1][x] + P[y][x-1] - P[y-1][x-1] \qquad (y, x \ge 1)
$$

**Chứng minh bằng đếm vùng.** Hạng tử $P[y-1][x]$ che **vùng trên** — hình $(1..y{-}1,\, 1..x)$; $P[y][x-1]$ che **vùng trái** — hình $(1..y,\, 1..x{-}1)$. Cộng hai tổng lại rồi đếm số lần mỗi ô xuất hiện:

- ô thuộc cả hai vùng — đúng khối góc trên trái $(1..y{-}1,\, 1..x{-}1)$ — bị đếm **hai lần**, trừ $P[y-1][x-1]$ một lần để về một;
- ô $(y, x)$ nằm ngoài cả hai vùng (vùng trên dừng ở hàng $y-1$, vùng trái dừng ở cột $x-1$) — **bị sót**, bù bằng $a[y][x]$;
- ô còn lại thuộc đúng một trong hai vùng, đếm đúng một lần.

Hợp của hai vùng cùng ô $(y, x)$ đúng là hình $(1..y,\, 1..x)$, nên vế phải cộng gộp lại thành $P[y][x]$. 

Xét lưới $3 \times 3$ mẫu:

```
1 2 3
4 5 6
7 8 9
```

Khi tính $P[2][2]$, bốn hạng tử của công thức che bốn vùng (`U` là ô thuộc vùng, `C` là ô hiện tại):

```
+P[1][2]    +P[2][1]    -P[1][1]    +a[2][2]
vùng trên   vùng trái   giao 2 lần  bị sót
 U U .       U . .       U . .       . . .
 . . .       U . .       . . .       . C .
 . . .       . . .       . . .       . . .
```

P[2][2] = 5 + 3 + 5 - 1 = 12 = 1 + 2 + 4 + 5.

Chạy hết lưới thu được bảng $P$ đầy đủ — hàng 0 và cột 0 là đệm $0$:

```
0   0   0   0
0   1   3   6
0   5  12  21
0  12  27  45
```

## Truy vấn hình chữ nhật trong $O(1)$

Với hình chữ nhật $(r_1..r_2) \times (c_1..c_2)$:

$$
\operatorname{ans} = P[r_2][c_2] - P[r_1-1][c_2] - P[r_2][c_1-1] + P[r_1-1][c_1-1]
$$

**Chứng minh bằng tách theo hàng.** Với mỗi hàng $y$, tổng các ô từ cột 1 tới cột $c$ của riêng hàng đó là một tổng tiền tố 1D theo cột, bằng $P[y][c] - P[y-1][c]$. Đáp án là tổng đoạn $(c_1..c_2)$ của từng hàng từ $r_1$ tới $r_2$:

$$
\operatorname{ans} = \sum_{y=r_1}^{r_2} \Big( \big(P[y][c_2] - P[y-1][c_2]\big) - \big(P[y][c_1-1] - P[y-1][c_1-1]\big) \Big)
$$

Mỗi nhóm là dãy số hạng trù nhau theo $y$, chỉ còn hai đầu: $\sum_{y=r_1}^{r_2} \big(P[y][c] - P[y-1][c]\big) = P[r_2][c] - P[r_1-1][c]$. Thay vào chính là công thức trên. 

**Đại số vùng** — cùng một công thức, nhìn theo hệ số $+1/-1$ của mỗi ô. Trên lưới $4 \times 4$, truy vấn $R = (3..4) \times (3..4)$, bốn hình chữ nhật của bốn hạng tử (`#` là ô bị che, `R` là ô thuộc truy vấn):

```
+P[4][4]    -P[2][4]    -P[4][2]    +P[2][2]
 # # # #     # # # #     # # . .     # # . .
 # # # #     # # # #     # # . .     # # . .
 # # R R     . . R R     # # . .     . . . .
 # # R R     . . R R     # # . .     . . . .
```

Đếm theo vùng: ô trong $R$ chỉ bị hình đầu tiên che → hệ số $+1$. Dải trên $(1..2) \times (3..4)$: hình một và hai → $+1 - 1 = 0$. Dải trái $(3..4) \times (1..2)$: hình một và ba → $+1 - 1 = 0$. Góc $(1..2) \times (1..2)$: cả bốn hình → $+1 - 1 - 1 + 1 = 0$. Ô ngoài cả bốn hình: $0$. Tổng có trọng số đúng bằng tổng các ô trong $R$.

Trên lưới $3 \times 3$ mẫu, truy vấn $(2..3) \times (2..3)$:

$$
\operatorname{ans} = P[3][3] - P[1][3] - P[3][1] + P[1][1] = 45 - 6 - 12 + 1 = 28 = 5 + 6 + 8 + 9.
$$

## Chi tiết cài đặt

- **Đánh số từ 1.** Hàng 0 và cột 0 của bảng là đệm $0$, nên khi $r_1 = 1$ hay $c_1 = 1$ công thức truy vấn vẫn dùng $P[0][\cdot]$ hợp pháp — không cần nhánh biên riêng.
- **Kiểu dữ liệu.** Forest Queries chỉ đếm cây nên `int` đủ dùng, nhưng tổng quát: lưới $1000 \times 1000$ ô giá trị tới $10^9$ cho $P$ tới $10^{15}$ — tràn số nguyên 32 bit. Dùng `long long` cho bảng.
- **Đọc lưới ký tự.** Mỗi hàng của lưới là một xâu; ô $(y, x)$ ứng ký tự `grid[y-1][x-1]`. Đổi '*' thành 1, '.' thành 0 khi dựng bảng giá trị là toàn bộ phần "parsing": đây chính là prefix trên lưới boolean.

## Biến thể

- **Prefix XOR hai chiều.** Thay mọi phép cộng, trừ bằng XOR ($\oplus$):

$$
  X[y][x] = a[y][x] \oplus X[y-1][x] \oplus X[y][x-1]
$$

  Hạng tử góc **biến mất** vì $\oplus$ tự nghịch: mỗi ô chỉ đóng góp theo parity số lần xuất hiện, và khối giao $(1..y{-}1,\, 1..x{-}1)$ xuất hiện trong cả hai vùng nên parity chẵn — triệt tiêu ($t \oplus t = 0$). Đây chính là vai trò của dấu trừ ở bản cộng. Tương tự, XOR của hình chữ nhật truy vấn là XOR của **bốn góc**:

$$
  X_{\operatorname{ans}} = X[r_2][c_2] \oplus X[r_1-1][c_2] \oplus X[r_2][c_1-1] \oplus X[r_1-1][c_1-1]
$$

- **Lưới boolean / đếm theo điều kiện.** Forest Queries là prefix của lưới 0/1. Mọi bài "đếm số ô thoả tính chất trong hình chữ nhật" đều đưa về khuôn này: hàm chuyển mỗi ô thành 0/1, phần còn lại giữ nguyên.
- **Tiền tố hiệu hai chiều.** Phép "nghịch đảo" của prefix: cộng $v$ vào **cả hình chữ nhật** $(r_1..r_2) \times (c_1..c_2)$ trong $O(1)$ bằng bốn điểm

$$
  D[r_1][c_1] {+}{=} v, \qquad D[r_2{+}1][c_1] {-}{=} v, \qquad D[r_1][c_2{+}1] {-}{=} v, \qquad D[r_2{+}1][c_2{+}1] {+}{=} v,
$$

  rồi một lượt prefix hai chiều của $D$ cho giá trị từng ô — đổi vai: cập nhật hình chữ nhật $O(1)$, truy vấn **điểm** $O(1)$ sau lần dựng. Khi cập nhật và truy vấn hình chữ nhật đan xen nhau, cấu trúc động là [Fenwick 2D](/posts/fenwick-tree/).

## Độ phức tạp

Dựng bảng: $O(n^2)$ thời gian và bộ nhớ. Mỗi truy vấn: $O(1)$, không phụ thuộc kích thước hình chữ nhật. Với Forest Queries đó là $10^6$ phép dựng cộng $2 \cdot 10^5$ phép trả lời, so với $2 \cdot 10^{11}$ lượt duyệt ô của cách duyệt trâu từng truy vấn.

## Cài đặt

Hàm thuần nhận lưới (danh sách xâu) và danh sách truy vấn, trả danh sách kết quả.

**C++**

```cpp
#include <bits/stdc++.h>

using namespace std;

typedef long long i64;
const i64 MOD = 1e9 + 7;
const int INF = 1e9 + 7;

// Dựng bảng tổng tiền tố hai chiều từ lưới giá trị a đánh số từ 1
// (hàng 0 và cột 0 là ô đệm 0); P[y][x] = tổng ô của hình (1..y, 1..x)
vector<vector<i64>> build_prefix2(const vector<vector<int>>& a) {
    int n = (int)a.size() - 1, m = (int)a[0].size() - 1;
    vector<vector<i64>> P(n + 1, vector<i64>(m + 1, 0));
    for (int y = 1; y <= n; ++y)
        for (int x = 1; x <= m; ++x)
            P[y][x] = a[y][x] + P[y - 1][x] + P[y][x - 1] - P[y - 1][x - 1];
    return P;
}

// Tổng ô của hình chữ nhật (r1..r2) x (c1..c2), với 1 <= r1 <= r2, 1 <= c1 <= c2
i64 rect_query(const vector<vector<i64>>& P, int r1, int c1, int r2, int c2) {
    return P[r2][c2] - P[r1 - 1][c2] - P[r2][c1 - 1] + P[r1 - 1][c1 - 1];
}

// Forest Queries: lưới gồm '.' (trống) và '*' (có cây); mỗi truy vấn
// (y1, x1, y2, x2) hỏi số cây trong hình chữ nhật tương ứng
vector<i64> solve_forest_queries(const vector<string>& grid, const vector<array<int, 4>>& queries) {
    int n = (int)grid.size();
    vector<vector<int>> a(n + 1, vector<int>(n + 1, 0));
    for (int y = 1; y <= n; ++y)
        for (int x = 1; x <= n; ++x)
            a[y][x] = (grid[y - 1][x - 1] == '*'); // ô có cây mang giá trị 1

    vector<vector<i64>> P = build_prefix2(a);
    vector<i64> res;
    res.reserve(queries.size());
    for (const auto& [y1, x1, y2, x2] : queries)
        res.push_back(rect_query(P, y1, x1, y2, x2));
    return res;
}

void solve() {
    // Forest Queries: n q, lưới n hàng, q truy vấn (y1 x1 y2 x2)
    int n, q;
    cin >> n >> q;
    vector<string> grid(n);
    for (string& row : grid) cin >> row;
    vector<array<int, 4>> queries(q);
    for (auto& [y1, x1, y2, x2] : queries) cin >> y1 >> x1 >> y2 >> x2;
    for (i64 ans : solve_forest_queries(grid, queries)) cout << ans << '\n';
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
def build_prefix2(a: list[list[int]]) -> list[list[int]]:
    """Dựng bảng tổng tiền tố hai chiều từ lưới a đánh số từ 1
    (hàng 0 và cột 0 là ô đệm 0); P[y][x] = tổng ô của hình (1..y, 1..x)."""
    n, m = len(a) - 1, len(a[0]) - 1
    P = [[0] * (m + 1) for _ in range(n + 1)]
    for y in range(1, n + 1):
        for x in range(1, m + 1):
            P[y][x] = a[y][x] + P[y - 1][x] + P[y][x - 1] - P[y - 1][x - 1]
    return P


def rect_query(P: list[list[int]], r1: int, c1: int, r2: int, c2: int) -> int:
    """Tổng ô của hình chữ nhật (r1..r2) x (c1..c2)."""
    return P[r2][c2] - P[r1 - 1][c2] - P[r2][c1 - 1] + P[r1 - 1][c1 - 1]


def solve_forest_queries(
    grid: list[str], queries: list[tuple[int, int, int, int]]
) -> list[int]:
    """Forest Queries: đếm số cây ('*') trong từng hình chữ nhật truy vấn."""
    n = len(grid)
    a = [[0] * (n + 1) for _ in range(n + 1)]
    for y in range(1, n + 1):
        for x in range(1, n + 1):
            a[y][x] = 1 if grid[y - 1][x - 1] == "*" else 0  # ô có cây = 1

    P = build_prefix2(a)
    return [rect_query(P, y1, x1, y2, x2) for y1, x1, y2, x2 in queries]
```

## Bài tập luyện

- [Forest Queries (CSES 1652)](https://cses.fi/problemset/task/1652): bài anchor — dựng bảng tĩnh rồi trả $q$ truy vấn hình chữ nhật.
- [Forest Queries II (CSES 1739)](https://cses.fi/problemset/task/1739): thêm thao tác đổi giá trị một ô giữa hai truy vấn — prefix tĩnh không đủ, cần [Fenwick 2D](/posts/fenwick-tree/).
- [Prefix Sum Queries (CSES 2166)](https://cses.fi/problemset/task/2166): bản một chiều có cập nhật — Fenwick 1D vừa giữ tổng tiền tố vừa sửa được một phần tử.
- [Subarray Sums I (CSES 1660)](https://cses.fi/problemset/task/1660): đếm đoạn con có tổng đúng bằng $x$ — prefix 1D kết hợp hai con trỏ.

## Nguồn

- <https://oj.chuyentin.pro/wiki/mang-va-xau/>
- <https://cses.fi/problemset/>
- <https://en.wikipedia.org/wiki/Summed-area_table>
