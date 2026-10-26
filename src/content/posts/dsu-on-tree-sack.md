---
title: Small-to-large và DSU on tree (Sack) — đếm màu trên cây con
date: 2026-10-27 01:40:00
description: So sánh small-to-large và DSU on tree (Sack) cho bài đếm màu trên cây con; code C++ và Python, độ phức tạp O(n log n).
tags: [dsu-on-tree, tree, cses, cpp, python]
category: [Kỹ thuật]
---

## Đề bài

Cho cây $n$ đỉnh, gốc tại đỉnh $1$, mỗi đỉnh có một màu. Với mỗi đỉnh $v$, đếm số màu khác nhau trong cây con gốc $v$. Giới hạn $n \le 2 \cdot 10^5$, màu là số nguyên từ $1$ đến $2 \cdot 10^5$.

<div class="io" data-io="Input"><pre>9
1 2 3 4 1 2 4 3 1
1 2
1 3
1 4
2 5
3 6
3 7
6 8
7 9</pre></div>

<div class="io" data-io="Output"><pre>4 2 4 1 1 2 2 1 1</pre></div>

_Ảnh minh hoạ:_

<div class="diagram diagram-narrow">
<svg viewBox="0 0 500 380" width="100%" role="img" aria-label="Cây trong đề bài: 9 đỉnh đánh số 1 đến 9, mỗi đỉnh tô một màu theo input"><line x1="210" y1="46" x2="70" y2="118" stroke="#9aa4b2" stroke-width="2"/><line x1="210" y1="46" x2="255" y2="118" stroke="#9aa4b2" stroke-width="2"/><line x1="210" y1="46" x2="390" y2="118" stroke="#9aa4b2" stroke-width="2"/><line x1="70" y1="118" x2="30" y2="188" stroke="#9aa4b2" stroke-width="2"/><line x1="255" y1="118" x2="335" y2="188" stroke="#9aa4b2" stroke-width="2"/><line x1="255" y1="118" x2="185" y2="188" stroke="#9aa4b2" stroke-width="2"/><line x1="335" y1="188" x2="395" y2="258" stroke="#9aa4b2" stroke-width="2"/><line x1="185" y1="188" x2="125" y2="258" stroke="#9aa4b2" stroke-width="2"/><circle cx="210" cy="46" r="20" fill="#3b82f6" stroke="#ffffff" stroke-width="2"/><text x="210" y="52" fill="#ffffff" font-size="16" font-weight="700" text-anchor="middle">1</text><circle cx="70" cy="118" r="20" fill="#f59e0b" stroke="#ffffff" stroke-width="2"/><text x="70" y="124" fill="#ffffff" font-size="16" font-weight="700" text-anchor="middle">2</text><circle cx="255" cy="118" r="20" fill="#10b981" stroke="#ffffff" stroke-width="2"/><text x="255" y="124" fill="#ffffff" font-size="16" font-weight="700" text-anchor="middle">3</text><circle cx="390" cy="118" r="20" fill="#8b5cf6" stroke="#ffffff" stroke-width="2"/><text x="390" y="124" fill="#ffffff" font-size="16" font-weight="700" text-anchor="middle">4</text><circle cx="30" cy="188" r="20" fill="#3b82f6" stroke="#ffffff" stroke-width="2"/><text x="30" y="194" fill="#ffffff" font-size="16" font-weight="700" text-anchor="middle">5</text><circle cx="335" cy="188" r="20" fill="#f59e0b" stroke="#ffffff" stroke-width="2"/><text x="335" y="194" fill="#ffffff" font-size="16" font-weight="700" text-anchor="middle">6</text><circle cx="185" cy="188" r="20" fill="#8b5cf6" stroke="#ffffff" stroke-width="2"/><text x="185" y="194" fill="#ffffff" font-size="16" font-weight="700" text-anchor="middle">7</text><circle cx="395" cy="258" r="20" fill="#10b981" stroke="#ffffff" stroke-width="2"/><text x="395" y="264" fill="#ffffff" font-size="16" font-weight="700" text-anchor="middle">8</text><circle cx="125" cy="258" r="20" fill="#3b82f6" stroke="#ffffff" stroke-width="2"/><text x="125" y="264" fill="#ffffff" font-size="16" font-weight="700" text-anchor="middle">9</text><text x="212" y="340" text-anchor="middle" font-family="inherit" font-size="19" fill="currentColor"><tspan fill="#3b82f6" font-size="21">&#9679;</tspan> = 1&#160;&#160;&#160;<tspan fill="#f59e0b" font-size="21">&#9679;</tspan> = 2&#160;&#160;&#160;<tspan fill="#10b981" font-size="21">&#9679;</tspan> = 3&#160;&#160;&#160;<tspan fill="#8b5cf6" font-size="21">&#9679;</tspan> = 4</text></svg>
</div>

## Thuật toán ngây thơ

Cách trực tiếp là với mỗi đỉnh lại DFS để gom màu trong cây con của nó vào một tập hợp. Đáng tiếc, mỗi đỉnh bị duyệt lại cho mọi tổ tiên; trên cây dạng xích, tổng số lần duyệt là $1 + 2 + \dots + n$, tức $O(n^2)$ — quá chậm với $n = 2 \cdot 10^5$.

**C++:**

```cpp
int n;
vector<vector<int>> g;
vector<int> col, ans, par;

// một lần DFS từ gốc để biết cha mỗi đỉnh
void dfs(int v, int p) {
    par[v] = p;
    for (int u : g[v])
        if (u != p) dfs(u, v);
}

// gom màu cây con gốc v (đi xuống, không quay lại cha p)
void collect(int v, int p, set<int> &s) {
    s.insert(col[v]);
    for (int u : g[v])
        if (u != p) collect(u, v, s);
}

vector<int> naive_solve() {
    dfs(1, 0);
    for (int v = 1; v <= n; v++) {
        set<int> s;
        collect(v, par[v], s);
        ans[v] = (int)s.size();
    }
    return ans;
}
```

**Python:**

```python
def naive_solve(n, color, adj):
    parent = [0] * (n + 1)
    ans = [0] * (n + 1)

    def dfs(v, p):
        parent[v] = p
        for u in adj[v]:
            if u != p:
                dfs(u, v)

    def collect(v, p, s):
        s.add(color[v - 1])
        for u in adj[v]:
            if u != p:
                collect(u, v, s)

    dfs(1, 0)
    for v in range(1, n + 1):
        s = set()
        collect(v, parent[v], s)
        ans[v] = len(s)
    return ans
```

## Cải tiến thứ nhất: small-to-large với `std::set`

### Ý tưởng

Ý tưởng gốc vẫn là "gộp tập nhỏ vào tập lớn": mỗi đỉnh giữ một tập màu trong cây con; khi quay về từ con, nếu tập con lớn hơn thì đổi vai trò (`swap` con trỏ) rồi chèn từng phần tử của tập nhỏ sang tập lớn. Mỗi màu chỉ "nhân đôi kích thước môi trường" tối đa $\log n$ lần, nên tổng số lần chèn là $O(n \log n)$.

### Cài đặt

Với `std::set` (cấu trúc có thứ tự), mỗi lần chèn tốn $O(\log n)$.

**C++:**

```cpp
int n;
vector<vector<int>> g;
vector<int> col, ans;
vector<set<int> *> bag;

void dfs(int v, int p) {
    auto *big = new set<int>();
    big->insert(col[v]);
    for (int u : g[v]) {
        if (u == p) continue;
        dfs(u, v);
        if (bag[u]->size() > big->size()) swap(big, bag[u]); // gộp tập nhỏ vào tập lớn
        for (int c : *bag[u]) big->insert(c);
        delete bag[u];
        bag[u] = nullptr;
    }
    bag[v] = big;
    ans[v] = (int)big->size();
}
```

### Độ phức tạp

- **Thời gian:** $O(n \log^2 n)$ — xác định, không rủi ro hash.
- **Bộ nhớ:** $O(n)$.

## Cải tiến thứ hai: cắt log của thao tác chèn

Log dư trong $O(n \log^2 n)$ nằm ở chính thao tác chèn. Có hai hướng bỏ nó: đổi sang cấu trúc có chèn trung bình $O(1)$ (2.1), hoặc không chèn lại phần lớn nhất nữa (2.2).

### 2.1 — `unordered_set`: ngắn gọn, nhanh nhưng không ổn định

#### Ý tưởng

C++ dùng `unordered_set`, Python dùng `set` — cả hai đều là **bảng băm**, chèn trung bình $O(1)$. (Đừng nhầm `set` Python với `std::set` C++: `std::set` là cây cân bằng có thứ tự.) Nhân với $O(n \log n)$ lần chuyển phần tử ⇒ **trung bình $O(n \log n)$**.

#### Cài đặt

**C++:**

```cpp
int n;
vector<vector<int>> g;
vector<int> col, ans;
vector<unordered_set<int> *> bag;

void dfs(int v, int p) {
    auto *big = new unordered_set<int>();
    big->insert(col[v]);
    for (int u : g[v]) {
        if (u == p) continue;
        dfs(u, v);
        if (bag[u]->size() > big->size()) swap(big, bag[u]); // gộp tập nhỏ vào tập lớn
        for (int c : *bag[u]) big->insert(c);
        delete bag[u];
        bag[u] = nullptr;
    }
    bag[v] = big;
    ans[v] = (int)big->size();
}
```

**Python:**

```python
def dfs_small_to_large(n, color, adj):
    ans = [0] * (n + 1)
    bag = [None] * (n + 1)

    def dfs(v, p):
        big = {color[v - 1]}
        for u in adj[v]:
            if u == p:
                continue
            dfs(u, v)
            small = bag[u]
            if len(small) > len(big):  # gộp tập nhỏ vào tập lớn
                big, small = small, big
            big.update(small)
            bag[u] = None
        bag[v] = big
        ans[v] = len(big)

    dfs(1, 0)
    return ans
```

Cách này **vẫn AC bình thường**, nhưng $O(n \log n)$ ở đây chỉ là **trung bình** — test cố tình tạo đụng độ hash có thể đẩy thời gian lên rất cao. Dùng được, đừng lạm dụng; cần chắc ăn thì chuyển sang 2.2.

#### Độ phức tạp

- **Thời gian:** trung bình $O(n \log n)$ — chèn $O(1)$ trung bình, nhưng không bảo đảm (hash hack).
- **Bộ nhớ:** $O(n)$.

### 2.2 — DSU on tree (Sack): xác định, đổi lại code dài hơn

Sack hiện thực hoá đúng ý "không chép lại phần lớn nhất": dùng **một mảng đếm chung**, giữ dữ liệu của con nặng và chỉ cộng lại các cây con nhẹ.

#### Ý tưởng: giữ dữ liệu con nặng

Ký hiệu $sz[v]$ là số đỉnh trong cây con gốc $v$. Với mỗi đỉnh không phải lá, gọi **con nặng** là con có $sz$ lớn nhất; cạnh nối đỉnh đó với con nặng gọi là **cạnh nặng**, các cạnh còn lại là **cạnh nhẹ** — đúng cách đánh dấu nặng–nhẹ quen thuộc trong heavy-light decomposition (phân chia nặng nhẹ).

<div class="diagram diagram-narrow">
<svg viewBox="0 0 500 375" width="100%" role="img" aria-label="Cây ví dụ: đỉnh 1 có ba con 2, 3, 4; đỉnh 3 là con nặng; đỉnh 2 và 4 là con nhẹ; trong đỉnh 3, hai con 6 và 7 có kích thước bằng nhau, chọn 6 làm con nặng"><line x1="210" y1="46" x2="70" y2="118" stroke="#9aa4b2" stroke-width="1.8" stroke-dasharray="6 4"/><line x1="210" y1="46" x2="255" y2="118" stroke="#2563eb" stroke-width="4.5"/><line x1="210" y1="46" x2="390" y2="118" stroke="#9aa4b2" stroke-width="1.8" stroke-dasharray="6 4"/><line x1="70" y1="118" x2="30" y2="188" stroke="#2563eb" stroke-width="4.5"/><line x1="255" y1="118" x2="335" y2="188" stroke="#2563eb" stroke-width="4.5"/><line x1="255" y1="118" x2="185" y2="188" stroke="#9aa4b2" stroke-width="1.8" stroke-dasharray="6 4"/><line x1="335" y1="188" x2="395" y2="258" stroke="#2563eb" stroke-width="4.5"/><line x1="185" y1="188" x2="125" y2="258" stroke="#2563eb" stroke-width="4.5"/><circle cx="210" cy="46" r="18" fill="#3b82f6" stroke="#ffffff" stroke-width="2"/><text x="210" y="51.5" fill="#ffffff" font-size="15" font-weight="600" text-anchor="middle">1</text><text x="210" y="80" fill="currentColor" font-size="16" font-style="italic" text-anchor="middle" opacity="0.75" style="paint-order:stroke;stroke:var(--bg,#fff);stroke-width:5;stroke-linejoin:round">sz=9</text><circle cx="70" cy="118" r="18" fill="#f59e0b" stroke="#ffffff" stroke-width="2"/><text x="70" y="123.5" fill="#ffffff" font-size="15" font-weight="600" text-anchor="middle">2</text><text x="70" y="152" fill="currentColor" font-size="16" font-style="italic" text-anchor="middle" opacity="0.75" style="paint-order:stroke;stroke:var(--bg,#fff);stroke-width:5;stroke-linejoin:round">sz=2</text><circle cx="255" cy="118" r="18" fill="#10b981" stroke="#ffffff" stroke-width="2"/><text x="255" y="123.5" fill="#ffffff" font-size="15" font-weight="600" text-anchor="middle">3</text><text x="255" y="152" fill="currentColor" font-size="16" font-style="italic" text-anchor="middle" opacity="0.75" style="paint-order:stroke;stroke:var(--bg,#fff);stroke-width:5;stroke-linejoin:round">sz=5</text><circle cx="390" cy="118" r="18" fill="#8b5cf6" stroke="#ffffff" stroke-width="2"/><text x="390" y="123.5" fill="#ffffff" font-size="15" font-weight="600" text-anchor="middle">4</text><text x="390" y="152" fill="currentColor" font-size="16" font-style="italic" text-anchor="middle" opacity="0.75" style="paint-order:stroke;stroke:var(--bg,#fff);stroke-width:5;stroke-linejoin:round">sz=1</text><circle cx="30" cy="188" r="18" fill="#3b82f6" stroke="#ffffff" stroke-width="2"/><text x="30" y="193.5" fill="#ffffff" font-size="15" font-weight="600" text-anchor="middle">5</text><text x="30" y="222" fill="currentColor" font-size="16" font-style="italic" text-anchor="middle" opacity="0.75" style="paint-order:stroke;stroke:var(--bg,#fff);stroke-width:5;stroke-linejoin:round">sz=1</text><circle cx="335" cy="188" r="18" fill="#f59e0b" stroke="#ffffff" stroke-width="2"/><text x="335" y="193.5" fill="#ffffff" font-size="15" font-weight="600" text-anchor="middle">6</text><text x="335" y="222" fill="currentColor" font-size="16" font-style="italic" text-anchor="middle" opacity="0.75" style="paint-order:stroke;stroke:var(--bg,#fff);stroke-width:5;stroke-linejoin:round">sz=2</text><circle cx="185" cy="188" r="18" fill="#8b5cf6" stroke="#ffffff" stroke-width="2"/><text x="185" y="193.5" fill="#ffffff" font-size="15" font-weight="600" text-anchor="middle">7</text><text x="185" y="222" fill="currentColor" font-size="16" font-style="italic" text-anchor="middle" opacity="0.75" style="paint-order:stroke;stroke:var(--bg,#fff);stroke-width:5;stroke-linejoin:round">sz=2</text><circle cx="395" cy="258" r="18" fill="#10b981" stroke="#ffffff" stroke-width="2"/><text x="395" y="263.5" fill="#ffffff" font-size="15" font-weight="600" text-anchor="middle">8</text><text x="395" y="292" fill="currentColor" font-size="16" font-style="italic" text-anchor="middle" opacity="0.75" style="paint-order:stroke;stroke:var(--bg,#fff);stroke-width:5;stroke-linejoin:round">sz=1</text><circle cx="125" cy="258" r="18" fill="#3b82f6" stroke="#ffffff" stroke-width="2"/><text x="125" y="263.5" fill="#ffffff" font-size="15" font-weight="600" text-anchor="middle">9</text><text x="125" y="292" fill="currentColor" font-size="16" font-style="italic" text-anchor="middle" opacity="0.75" style="paint-order:stroke;stroke:var(--bg,#fff);stroke-width:5;stroke-linejoin:round">sz=1</text><g font-family="inherit" font-size="17" fill="currentColor">
<line x1="195" y1="330" x2="230" y2="330" stroke="#2563eb" stroke-width="4.5"/>
<text x="238" y="335">cạnh nặng</text>
<line x1="195" y1="355" x2="230" y2="355" stroke="#9aa4b2" stroke-width="1.8" stroke-dasharray="6 4"/>
<text x="238" y="360">cạnh nhẹ</text>
</g></svg>
</div>

Với cây ví dụ: đỉnh 1 có ba con 2, 3, 4 với kích thước cây con lần lượt là 2, 5, 1 — nên 3 là con nặng, còn 2 và 4 là con nhẹ; cạnh 1–3 là cạnh nặng, các cạnh 1–2 và 1–4 là cạnh nhẹ.

Mỗi đỉnh không phải lá chọn đúng **một** con nặng — nếu nhiều con cùng kích thước lớn nhất (như 6 và 7 ở trên, cùng $sz = 2$) thì chọn **một** trong số đó, những con còn lại trở thành con nhẹ. Nhờ vậy, các cạnh nặng nối thành những **chuỗi rời nhau**, mỗi đỉnh thuộc đúng một chuỗi. Đi qua một cạnh nhẹ là **bắt đầu một chuỗi mới**: đỉnh nhẹ, nếu không phải lá, vẫn là đầu một chuỗi nặng trong cây con của nó. Việc chọn ai trong nhóm đồng hạng không ảnh hưởng gì, vì con nhẹ không bao giờ lớn hơn con nặng được chọn. Cụ thể:

Nếu $u$ là con nhẹ của $v$ thì $sz[u] \le \frac{sz[v]-1}{2}$.

_Chứng minh._ Gọi $h$ là con nặng của $v$. Theo cách chọn, $sz[h] \ge sz[u]$ — kể cả khi có nhiều con đồng hạng, con được chọn làm nặng luôn không nhỏ hơn $u$. Cây con của $v$ gồm chính $v$, cây con của $h$, cây con của $u$, và có thể thêm vài con khác, nên

$$
sz[v] \ge 1 + sz[u] + sz[h] \ge 1 + 2\,sz[u],
$$

suy ra $sz[u] \le \frac{sz[v]-1}{2} < \frac{sz[v]}{2}$. Nói cách khác, **qua một cạnh nhẹ, kích thước cây con giảm còn không quá một nửa** — đúng tính chất quen thuộc của heavy-light decomposition.

**Hệ quả.** Đi từ gốc xuống một đỉnh bất kỳ, cứ qua một cạnh nhẹ thì kích thước cây con ít nhất giảm một nửa, nên:

> Mỗi đỉnh chỉ nằm dưới không quá $O(\log n)$ cạnh nhẹ trên đường đi từ gốc tới nó.

#### Vì sao keep ở con nặng, xoá ở con nhẹ?

Cả thuật toán xoay quanh một mảng đếm dùng chung `cnt[]` (và biến `distinct` = số màu đang có mặt). Muốn kết quả đúng, trước mỗi lời gọi ta cần:

> **Bất biến:** `cnt` trống khi bắt đầu `dfs(v)`. Khi `dfs(v)` kết thúc, `cnt` chứa đúng các màu trong cây con $v$ nếu `keep = true`, và trống nếu `keep = false`.

**Xoá dữ liệu không có nghĩa là mất kết quả.** Ngay khi tính xong đỉnh $v$, ta đã ghi `ans[v]` — nói cách khác, ngay trước bước xoá, `cnt` chính là **kết quả hoàn chỉnh** của cây con $v$; nó chỉ bị dọn đi sau khi đã ghi vào `ans[v]` để nhường chỗ cho nhánh khác. Dữ liệu của con nhẹ cũng không "biến mất" khỏi cây: khi quay về cha, cha chỉ việc **duyệt lại đúng cây con đó** (đệ quy qua các con) để cộng màu trở lại vào `cnt` — trong ảnh động bên dưới, đó chính là lúc các đỉnh 2, 5 được cộng lại ở bước "về 1". Còn `keep` chỉ trả lời một câu hỏi duy nhất: _sau khi `dfs(v)` trả về, có giữ dữ liệu của $v$ trong `cnt` để cha dùng lại hay không?_ — hoàn toàn không liên quan tới `ans` đã lưu.

**Vì sao con nhẹ phải xoá (`keep = false`)?** Mọi lời gọi con dùng chung một `cnt`. Nếu giữ lại **đóng góp** của con nhẹ, khi tính đứa con kế tiếp `cnt` đã có sẵn màu của cây khác — phép đếm sai ngay. Vì thế con nhẹ luôn được gọi với `keep = false` để dọn sạch đóng góp trước khi sang nhánh khác. Cũng chính vì lý do này mà các con nhẹ phải chạy **trước** con nặng: nếu con nặng (giữ dữ liệu) chạy trước, dữ liệu của nó sẽ làm bẩn phép tính của các con nhẹ.

**Vì sao con nặng được giữ (`keep = true`)?** Con nặng là phần lớn nhất. Thay vì xoá rồi cộng lại toàn bộ phần đó, ta **tái sử dụng miễn phí** nó: giữ nguyên làm nền, chỉ cộng thêm các cây con nhẹ và đỉnh $v$ — vừa đúng, vừa rẻ nhất. Nếu xoá luôn con nặng, mỗi đỉnh sẽ bị cộng lại ở mọi tổ tiên, độ phức tạp quay về $O(n^2)$ trên cây xích.

<div class="diagram diagram-anim anim-landscape">
<svg viewBox="0 0 880 378" width="100%" role="img" aria-label="Ảnh động ngang mô phỏng DFS với Sack trên cây 9 đỉnh: cây bên trái, bảng cnt và mảng ans bên phải."><style>
.fr{opacity:0;animation-duration:47.60s;animation-iteration-count:infinite;animation-timing-function:linear}
.fr-1{animation-name:k1} .fr-2{animation-name:k2} .fr-3{animation-name:k3} .fr-4{animation-name:k4} .fr-5{animation-name:k5} .fr-6{animation-name:k6} .fr-7{animation-name:k7} .fr-8{animation-name:k8} .fr-9{animation-name:k9} .fr-10{animation-name:k10} .fr-11{animation-name:k11} .fr-12{animation-name:k12} .fr-13{animation-name:k13} .fr-14{animation-name:k14} .fr-15{animation-name:k15} .fr-16{animation-name:k16} .fr-17{animation-name:k17} .fr-18{animation-name:k18} .fr-19{animation-name:k19}
@keyframes k1{0.00%{opacity:0} 0.74%{opacity:1} 3.89%{opacity:1} 4.62%{opacity:0} 100.00%{opacity:0}}
@keyframes k2{0.00%{opacity:0} 4.62%{opacity:0} 5.36%{opacity:1} 8.51%{opacity:1} 9.24%{opacity:0} 100.00%{opacity:0}}
@keyframes k3{0.00%{opacity:0} 9.24%{opacity:0} 9.98%{opacity:1} 13.13%{opacity:1} 13.87%{opacity:0} 100.00%{opacity:0}}
@keyframes k4{0.00%{opacity:0} 13.87%{opacity:0} 14.60%{opacity:1} 17.75%{opacity:1} 18.49%{opacity:0} 100.00%{opacity:0}}
@keyframes k5{0.00%{opacity:0} 18.49%{opacity:0} 19.22%{opacity:1} 22.37%{opacity:1} 23.11%{opacity:0} 100.00%{opacity:0}}
@keyframes k6{0.00%{opacity:0} 23.11%{opacity:0} 23.84%{opacity:1} 27.00%{opacity:1} 27.73%{opacity:0} 100.00%{opacity:0}}
@keyframes k7{0.00%{opacity:0} 27.73%{opacity:0} 28.47%{opacity:1} 31.62%{opacity:1} 32.35%{opacity:0} 100.00%{opacity:0}}
@keyframes k8{0.00%{opacity:0} 32.35%{opacity:0} 33.09%{opacity:1} 36.24%{opacity:1} 36.97%{opacity:0} 100.00%{opacity:0}}
@keyframes k9{0.00%{opacity:0} 36.97%{opacity:0} 37.71%{opacity:1} 40.86%{opacity:1} 41.60%{opacity:0} 100.00%{opacity:0}}
@keyframes k10{0.00%{opacity:0} 41.60%{opacity:0} 42.33%{opacity:1} 45.48%{opacity:1} 46.22%{opacity:0} 100.00%{opacity:0}}
@keyframes k11{0.00%{opacity:0} 46.22%{opacity:0} 46.95%{opacity:1} 50.11%{opacity:1} 50.84%{opacity:0} 100.00%{opacity:0}}
@keyframes k12{0.00%{opacity:0} 50.84%{opacity:0} 51.58%{opacity:1} 54.73%{opacity:1} 55.46%{opacity:0} 100.00%{opacity:0}}
@keyframes k13{0.00%{opacity:0} 55.46%{opacity:0} 56.20%{opacity:1} 59.35%{opacity:1} 60.08%{opacity:0} 100.00%{opacity:0}}
@keyframes k14{0.00%{opacity:0} 60.08%{opacity:0} 60.82%{opacity:1} 63.97%{opacity:1} 64.71%{opacity:0} 100.00%{opacity:0}}
@keyframes k15{0.00%{opacity:0} 64.71%{opacity:0} 65.44%{opacity:1} 68.59%{opacity:1} 69.33%{opacity:0} 100.00%{opacity:0}}
@keyframes k16{0.00%{opacity:0} 69.33%{opacity:0} 70.06%{opacity:1} 73.21%{opacity:1} 73.95%{opacity:0} 100.00%{opacity:0}}
@keyframes k17{0.00%{opacity:0} 73.95%{opacity:0} 74.68%{opacity:1} 77.84%{opacity:1} 78.57%{opacity:0} 100.00%{opacity:0}}
@keyframes k18{0.00%{opacity:0} 78.57%{opacity:0} 79.31%{opacity:1} 82.46%{opacity:1} 83.19%{opacity:0} 100.00%{opacity:0}}
@keyframes k19{0.00%{opacity:0} 83.19%{opacity:0} 83.93%{opacity:1} 99.26%{opacity:1} 100.00%{opacity:0}}
@media (prefers-reduced-motion: reduce){.fr{animation:none} .fr-19{opacity:1}}
</style><g><line x1="210" y1="46" x2="70" y2="118" stroke="#9aa4b2" stroke-width="1.8" stroke-dasharray="6 4"/><line x1="210" y1="46" x2="255" y2="118" stroke="#2563eb" stroke-width="4.5"/><line x1="210" y1="46" x2="390" y2="118" stroke="#9aa4b2" stroke-width="1.8" stroke-dasharray="6 4"/><line x1="70" y1="118" x2="30" y2="188" stroke="#2563eb" stroke-width="4.5"/><line x1="255" y1="118" x2="335" y2="188" stroke="#2563eb" stroke-width="4.5"/><line x1="255" y1="118" x2="185" y2="188" stroke="#9aa4b2" stroke-width="1.8" stroke-dasharray="6 4"/><line x1="335" y1="188" x2="395" y2="258" stroke="#2563eb" stroke-width="4.5"/><line x1="185" y1="188" x2="125" y2="258" stroke="#2563eb" stroke-width="4.5"/><circle cx="210" cy="46" r="18" fill="#3b82f6" stroke="#ffffff" stroke-width="2"/><text x="210" y="51.5" fill="#ffffff" font-size="16" font-weight="700" text-anchor="middle">1</text><text x="210" y="80" fill="currentColor" font-size="15" font-style="italic" text-anchor="middle" opacity="0.75" style="paint-order:stroke;stroke:var(--bg,#fff);stroke-width:5;stroke-linejoin:round">sz=9</text><circle cx="70" cy="118" r="18" fill="#f59e0b" stroke="#ffffff" stroke-width="2"/><text x="70" y="123.5" fill="#ffffff" font-size="16" font-weight="700" text-anchor="middle">2</text><text x="70" y="152" fill="currentColor" font-size="15" font-style="italic" text-anchor="middle" opacity="0.75" style="paint-order:stroke;stroke:var(--bg,#fff);stroke-width:5;stroke-linejoin:round">sz=2</text><circle cx="255" cy="118" r="18" fill="#10b981" stroke="#ffffff" stroke-width="2"/><text x="255" y="123.5" fill="#ffffff" font-size="16" font-weight="700" text-anchor="middle">3</text><text x="255" y="152" fill="currentColor" font-size="15" font-style="italic" text-anchor="middle" opacity="0.75" style="paint-order:stroke;stroke:var(--bg,#fff);stroke-width:5;stroke-linejoin:round">sz=5</text><circle cx="390" cy="118" r="18" fill="#8b5cf6" stroke="#ffffff" stroke-width="2"/><text x="390" y="123.5" fill="#ffffff" font-size="16" font-weight="700" text-anchor="middle">4</text><text x="390" y="152" fill="currentColor" font-size="15" font-style="italic" text-anchor="middle" opacity="0.75" style="paint-order:stroke;stroke:var(--bg,#fff);stroke-width:5;stroke-linejoin:round">sz=1</text><circle cx="30" cy="188" r="18" fill="#3b82f6" stroke="#ffffff" stroke-width="2"/><text x="30" y="193.5" fill="#ffffff" font-size="16" font-weight="700" text-anchor="middle">5</text><text x="30" y="222" fill="currentColor" font-size="15" font-style="italic" text-anchor="middle" opacity="0.75" style="paint-order:stroke;stroke:var(--bg,#fff);stroke-width:5;stroke-linejoin:round">sz=1</text><circle cx="335" cy="188" r="18" fill="#f59e0b" stroke="#ffffff" stroke-width="2"/><text x="335" y="193.5" fill="#ffffff" font-size="16" font-weight="700" text-anchor="middle">6</text><text x="335" y="222" fill="currentColor" font-size="15" font-style="italic" text-anchor="middle" opacity="0.75" style="paint-order:stroke;stroke:var(--bg,#fff);stroke-width:5;stroke-linejoin:round">sz=2</text><circle cx="185" cy="188" r="18" fill="#8b5cf6" stroke="#ffffff" stroke-width="2"/><text x="185" y="193.5" fill="#ffffff" font-size="16" font-weight="700" text-anchor="middle">7</text><text x="185" y="222" fill="currentColor" font-size="15" font-style="italic" text-anchor="middle" opacity="0.75" style="paint-order:stroke;stroke:var(--bg,#fff);stroke-width:5;stroke-linejoin:round">sz=2</text><circle cx="395" cy="258" r="18" fill="#10b981" stroke="#ffffff" stroke-width="2"/><text x="395" y="263.5" fill="#ffffff" font-size="16" font-weight="700" text-anchor="middle">8</text><text x="395" y="292" fill="currentColor" font-size="15" font-style="italic" text-anchor="middle" opacity="0.75" style="paint-order:stroke;stroke:var(--bg,#fff);stroke-width:5;stroke-linejoin:round">sz=1</text><circle cx="125" cy="258" r="18" fill="#3b82f6" stroke="#ffffff" stroke-width="2"/><text x="125" y="263.5" fill="#ffffff" font-size="16" font-weight="700" text-anchor="middle">9</text><text x="125" y="292" fill="currentColor" font-size="15" font-style="italic" text-anchor="middle" opacity="0.75" style="paint-order:stroke;stroke:var(--bg,#fff);stroke-width:5;stroke-linejoin:round">sz=1</text><g font-family="inherit" font-size="17" fill="currentColor">
<line x1="162" y1="318" x2="197" y2="318" stroke="#2563eb" stroke-width="4.5"/>
<text x="205" y="323">cạnh nặng</text>
<line x1="162" y1="338" x2="197" y2="338" stroke="#9aa4b2" stroke-width="1.8" stroke-dasharray="6 4"/>
<text x="205" y="343">cạnh nhẹ</text>
<circle cx="178" cy="362" r="11" fill="none" stroke="currentColor" stroke-width="3"/>
<text x="195" y="367">đỉnh đang xét</text>
</g><g font-family="inherit" font-size="17" fill="currentColor"><circle cx="590" cy="25" r="11" fill="#3b82f6"/><text x="602" y="29">= 1</text><circle cx="640" cy="25" r="11" fill="#f59e0b"/><text x="652" y="29">= 2</text><circle cx="690" cy="25" r="11" fill="#10b981"/><text x="702" y="29">= 3</text><circle cx="740" cy="25" r="11" fill="#8b5cf6"/><text x="752" y="29">= 4</text></g><rect x="470" y="38" width="390" height="190" rx="12" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.35"/><text x="665" y="66" fill="currentColor" font-size="15.5" text-anchor="middle" opacity="0.8">cnt đang giữ (liệt kê theo đỉnh)</text></g><g class="fr fr-1"><circle cx="210" cy="46" r="24" fill="none" stroke="currentColor" stroke-width="3"/><text x="665" y="118" fill="currentColor" font-size="30" text-anchor="middle" opacity="0.4">∅</text><text x="665" y="152" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">cnt = ∅</text><text x="665" y="182" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">ans = [·, ·, ·, ·, ·, ·, ·, ·, ·]</text><text x="665" y="254" fill="currentColor" font-size="16" text-anchor="middle" font-weight="600">Bắt đầu tại 1: cnt = ∅</text><text x="665" y="278" fill="currentColor" font-size="14.5" text-anchor="middle" opacity="0.85">ba con — nặng 3, nhẹ 2 và 4</text></g><g class="fr fr-2"><circle cx="70" cy="118" r="24" fill="none" stroke="currentColor" stroke-width="3"/><text x="665" y="118" fill="currentColor" font-size="30" text-anchor="middle" opacity="0.4">∅</text><text x="665" y="152" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">cnt = ∅</text><text x="665" y="182" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">ans = [·, ·, ·, ·, ·, ·, ·, ·, ·]</text><text x="665" y="254" fill="currentColor" font-size="16" text-anchor="middle" font-weight="600">Xuống 2 (nhẹ, keep=false)</text></g><g class="fr fr-3"><circle cx="30" cy="188" r="24" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="665" cy="110" r="14" fill="#3b82f6" stroke="#ffffff" stroke-width="1.5"/><text x="665" y="115" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">5</text><text x="665" y="152" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">cnt = {1: 1}</text><text x="665" y="182" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">ans = [·, ·, ·, ·, 1, ·, ·, ·, ·]</text><text x="665" y="254" fill="currentColor" font-size="16" text-anchor="middle" font-weight="600">Xuống 5 (lá): cộng 5 → ans[5] = 1</text></g><g class="fr fr-4"><circle cx="70" cy="118" r="24" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="647" cy="110" r="14" fill="#3b82f6" stroke="#ffffff" stroke-width="1.5"/><text x="647" y="115" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">5</text><circle cx="683" cy="110" r="14" fill="#f59e0b" stroke="#ffffff" stroke-width="1.5"/><text x="683" y="115" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">2</text><text x="665" y="152" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">cnt = {1: 1; 2: 1}</text><text x="665" y="182" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">ans = [·, 2, ·, ·, 1, ·, ·, ·, ·]</text><text x="665" y="254" fill="currentColor" font-size="16" text-anchor="middle" font-weight="600">Lên 2: cộng 2 → ans[2] = 2</text></g><g class="fr fr-5"><circle cx="70" cy="118" r="24" fill="none" stroke="currentColor" stroke-width="3"/><text x="665" y="118" fill="currentColor" font-size="30" text-anchor="middle" opacity="0.4">∅</text><text x="665" y="152" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">cnt = ∅</text><text x="665" y="182" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">ans = [·, 2, ·, ·, 1, ·, ·, ·, ·]</text><text x="665" y="254" fill="currentColor" font-size="16" text-anchor="middle" font-weight="600">keep=false: xoá cây con 2 → cnt = ∅</text></g><g class="fr fr-6"><circle cx="390" cy="118" r="24" fill="none" stroke="currentColor" stroke-width="3"/><text x="665" y="118" fill="currentColor" font-size="30" text-anchor="middle" opacity="0.4">∅</text><text x="665" y="152" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">cnt = ∅</text><text x="665" y="182" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">ans = [·, 2, ·, ·, 1, ·, ·, ·, ·]</text><text x="665" y="254" fill="currentColor" font-size="16" text-anchor="middle" font-weight="600">Xuống 4 (nhẹ, keep=false)</text></g><g class="fr fr-7"><circle cx="390" cy="118" r="24" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="665" cy="110" r="14" fill="#8b5cf6" stroke="#ffffff" stroke-width="1.5"/><text x="665" y="115" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">4</text><text x="665" y="152" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">cnt = {4: 1}</text><text x="665" y="182" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">ans = [·, 2, ·, 1, 1, ·, ·, ·, ·]</text><text x="665" y="254" fill="currentColor" font-size="16" text-anchor="middle" font-weight="600">Cộng 4 → ans[4] = 1</text></g><g class="fr fr-8"><circle cx="390" cy="118" r="24" fill="none" stroke="currentColor" stroke-width="3"/><text x="665" y="118" fill="currentColor" font-size="30" text-anchor="middle" opacity="0.4">∅</text><text x="665" y="152" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">cnt = ∅</text><text x="665" y="182" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">ans = [·, 2, ·, 1, 1, ·, ·, ·, ·]</text><text x="665" y="254" fill="currentColor" font-size="16" text-anchor="middle" font-weight="600">keep=false: xoá → cnt = ∅</text></g><g class="fr fr-9"><circle cx="255" cy="118" r="24" fill="none" stroke="currentColor" stroke-width="3"/><text x="665" y="118" fill="currentColor" font-size="30" text-anchor="middle" opacity="0.4">∅</text><text x="665" y="152" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">cnt = ∅</text><text x="665" y="182" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">ans = [·, 2, ·, 1, 1, ·, ·, ·, ·]</text><text x="665" y="254" fill="currentColor" font-size="16" text-anchor="middle" font-weight="600">Xuống 3 — con nặng của 1</text><text x="665" y="278" fill="currentColor" font-size="14.5" text-anchor="middle" opacity="0.85">(6 và 7 hòa kích thước: chọn 6)</text></g><g class="fr fr-10"><circle cx="185" cy="188" r="24" fill="none" stroke="currentColor" stroke-width="3"/><text x="665" y="118" fill="currentColor" font-size="30" text-anchor="middle" opacity="0.4">∅</text><text x="665" y="152" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">cnt = ∅</text><text x="665" y="182" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">ans = [·, 2, ·, 1, 1, ·, ·, ·, ·]</text><text x="665" y="254" fill="currentColor" font-size="16" text-anchor="middle" font-weight="600">Xuống 7 (nhẹ)</text></g><g class="fr fr-11"><circle cx="125" cy="258" r="24" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="665" cy="110" r="14" fill="#3b82f6" stroke="#ffffff" stroke-width="1.5"/><text x="665" y="115" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">9</text><text x="665" y="152" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">cnt = {1: 1}</text><text x="665" y="182" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">ans = [·, 2, ·, 1, 1, ·, ·, ·, 1]</text><text x="665" y="254" fill="currentColor" font-size="16" text-anchor="middle" font-weight="600">Xuống 9 (lá): cộng 9 → ans[9] = 1</text></g><g class="fr fr-12"><circle cx="185" cy="188" r="24" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="647" cy="110" r="14" fill="#3b82f6" stroke="#ffffff" stroke-width="1.5"/><text x="647" y="115" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">9</text><circle cx="683" cy="110" r="14" fill="#8b5cf6" stroke="#ffffff" stroke-width="1.5"/><text x="683" y="115" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">7</text><text x="665" y="152" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">cnt = {1: 1; 4: 1}</text><text x="665" y="182" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">ans = [·, 2, ·, 1, 1, ·, 2, ·, 1]</text><text x="665" y="254" fill="currentColor" font-size="16" text-anchor="middle" font-weight="600">Lên 7: cộng 7 → ans[7] = 2</text></g><g class="fr fr-13"><circle cx="185" cy="188" r="24" fill="none" stroke="currentColor" stroke-width="3"/><text x="665" y="118" fill="currentColor" font-size="30" text-anchor="middle" opacity="0.4">∅</text><text x="665" y="152" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">cnt = ∅</text><text x="665" y="182" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">ans = [·, 2, ·, 1, 1, ·, 2, ·, 1]</text><text x="665" y="254" fill="currentColor" font-size="16" text-anchor="middle" font-weight="600">keep=false: xoá cây con 7 → cnt = ∅</text></g><g class="fr fr-14"><circle cx="335" cy="188" r="24" fill="none" stroke="currentColor" stroke-width="3"/><text x="665" y="118" fill="currentColor" font-size="30" text-anchor="middle" opacity="0.4">∅</text><text x="665" y="152" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">cnt = ∅</text><text x="665" y="182" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">ans = [·, 2, ·, 1, 1, ·, 2, ·, 1]</text><text x="665" y="254" fill="currentColor" font-size="16" text-anchor="middle" font-weight="600">Sang 6 — con nặng của 3</text></g><g class="fr fr-15"><circle cx="395" cy="258" r="24" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="665" cy="110" r="14" fill="#10b981" stroke="#ffffff" stroke-width="1.5"/><text x="665" y="115" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">8</text><text x="665" y="152" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">cnt = {3: 1}</text><text x="665" y="182" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">ans = [·, 2, ·, 1, 1, ·, 2, 1, 1]</text><text x="665" y="254" fill="currentColor" font-size="16" text-anchor="middle" font-weight="600">Xuống 8 (lá): cộng 8 → ans[8] = 1</text></g><g class="fr fr-16"><circle cx="335" cy="188" r="24" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="647" cy="110" r="14" fill="#10b981" stroke="#ffffff" stroke-width="1.5"/><text x="647" y="115" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">8</text><circle cx="683" cy="110" r="14" fill="#f59e0b" stroke="#ffffff" stroke-width="1.5"/><text x="683" y="115" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">6</text><text x="665" y="152" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">cnt = {2: 1; 3: 1}</text><text x="665" y="182" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">ans = [·, 2, ·, 1, 1, 2, 2, 1, 1]</text><text x="665" y="254" fill="currentColor" font-size="16" text-anchor="middle" font-weight="600">Lên 6: cộng 6 → ans[6] = 2</text></g><g class="fr fr-17"><circle cx="255" cy="118" r="24" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="593" cy="110" r="14" fill="#10b981" stroke="#ffffff" stroke-width="1.5"/><text x="593" y="115" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">8</text><circle cx="629" cy="110" r="14" fill="#f59e0b" stroke="#ffffff" stroke-width="1.5"/><text x="629" y="115" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">6</text><circle cx="665" cy="110" r="14" fill="#3b82f6" stroke="#ffffff" stroke-width="1.5"/><text x="665" y="115" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">9</text><circle cx="701" cy="110" r="14" fill="#8b5cf6" stroke="#ffffff" stroke-width="1.5"/><text x="701" y="115" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">7</text><circle cx="737" cy="110" r="14" fill="#10b981" stroke="#ffffff" stroke-width="1.5"/><text x="737" y="115" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">3</text><text x="665" y="152" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">cnt = {1: 1; 2: 1; 3: 2; 4: 1}</text><text x="665" y="182" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">ans = [·, 2, 4, 1, 1, 2, 2, 1, 1]</text><text x="665" y="254" fill="currentColor" font-size="16" text-anchor="middle" font-weight="600">Lên 3: cộng lại cây con nhẹ 7 (9, 7)</text><text x="665" y="278" fill="currentColor" font-size="14.5" text-anchor="middle" opacity="0.85">rồi cộng 3 → ans[3] = 4</text></g><g class="fr fr-18"><circle cx="210" cy="46" r="24" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="533" cy="110" r="14" fill="#10b981" stroke="#ffffff" stroke-width="1.5"/><text x="533" y="115" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">8</text><circle cx="566" cy="110" r="14" fill="#f59e0b" stroke="#ffffff" stroke-width="1.5"/><text x="566" y="115" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">6</text><circle cx="599" cy="110" r="14" fill="#3b82f6" stroke="#ffffff" stroke-width="1.5"/><text x="599" y="115" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">9</text><circle cx="632" cy="110" r="14" fill="#8b5cf6" stroke="#ffffff" stroke-width="1.5"/><text x="632" y="115" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">7</text><circle cx="665" cy="110" r="14" fill="#10b981" stroke="#ffffff" stroke-width="1.5"/><text x="665" y="115" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">3</text><circle cx="698" cy="110" r="14" fill="#f59e0b" stroke="#ffffff" stroke-width="1.5"/><text x="698" y="115" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">2</text><circle cx="731" cy="110" r="14" fill="#3b82f6" stroke="#ffffff" stroke-width="1.5"/><text x="731" y="115" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">5</text><circle cx="764" cy="110" r="14" fill="#8b5cf6" stroke="#ffffff" stroke-width="1.5"/><text x="764" y="115" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">4</text><circle cx="797" cy="110" r="14" fill="#3b82f6" stroke="#ffffff" stroke-width="1.5"/><text x="797" y="115" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">1</text><text x="665" y="152" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">cnt = {1: 3; 2: 2; 3: 2; 4: 2}</text><text x="665" y="182" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">ans = [4, 2, 4, 1, 1, 2, 2, 1, 1]</text><text x="665" y="254" fill="currentColor" font-size="16" text-anchor="middle" font-weight="600">Lên 1: cộng các con nhẹ (2, 5, 4)</text><text x="665" y="278" fill="currentColor" font-size="14.5" text-anchor="middle" opacity="0.85">rồi cộng 1 → ans[1] = 4</text></g><g class="fr fr-19"><circle cx="210" cy="46" r="24" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="533" cy="110" r="14" fill="#10b981" stroke="#ffffff" stroke-width="1.5"/><text x="533" y="115" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">8</text><circle cx="566" cy="110" r="14" fill="#f59e0b" stroke="#ffffff" stroke-width="1.5"/><text x="566" y="115" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">6</text><circle cx="599" cy="110" r="14" fill="#3b82f6" stroke="#ffffff" stroke-width="1.5"/><text x="599" y="115" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">9</text><circle cx="632" cy="110" r="14" fill="#8b5cf6" stroke="#ffffff" stroke-width="1.5"/><text x="632" y="115" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">7</text><circle cx="665" cy="110" r="14" fill="#10b981" stroke="#ffffff" stroke-width="1.5"/><text x="665" y="115" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">3</text><circle cx="698" cy="110" r="14" fill="#f59e0b" stroke="#ffffff" stroke-width="1.5"/><text x="698" y="115" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">2</text><circle cx="731" cy="110" r="14" fill="#3b82f6" stroke="#ffffff" stroke-width="1.5"/><text x="731" y="115" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">5</text><circle cx="764" cy="110" r="14" fill="#8b5cf6" stroke="#ffffff" stroke-width="1.5"/><text x="764" y="115" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">4</text><circle cx="797" cy="110" r="14" fill="#3b82f6" stroke="#ffffff" stroke-width="1.5"/><text x="797" y="115" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">1</text><text x="665" y="152" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">cnt = {1: 3; 2: 2; 3: 2; 4: 2}</text><text x="665" y="182" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">ans = [4, 2, 4, 1, 1, 2, 2, 1, 1]</text><text x="665" y="254" fill="currentColor" font-size="16" text-anchor="middle" font-weight="600">Kết: dfs(1, keep=true)</text><text x="665" y="278" fill="currentColor" font-size="14.5" text-anchor="middle" opacity="0.85">giữ nguyên toàn bộ</text></g></svg>
</div>

<div class="diagram diagram-anim anim-portrait">
<svg viewBox="0 0 420 700" width="100%" role="img" aria-label="Ảnh động dọc mô phỏng DFS với Sack trên cây 9 đỉnh: cây ở trên, bảng cnt và mảng ans ở dưới."><style>
.fr{opacity:0;animation-duration:47.60s;animation-iteration-count:infinite;animation-timing-function:linear}
.fr-1{animation-name:k1} .fr-2{animation-name:k2} .fr-3{animation-name:k3} .fr-4{animation-name:k4} .fr-5{animation-name:k5} .fr-6{animation-name:k6} .fr-7{animation-name:k7} .fr-8{animation-name:k8} .fr-9{animation-name:k9} .fr-10{animation-name:k10} .fr-11{animation-name:k11} .fr-12{animation-name:k12} .fr-13{animation-name:k13} .fr-14{animation-name:k14} .fr-15{animation-name:k15} .fr-16{animation-name:k16} .fr-17{animation-name:k17} .fr-18{animation-name:k18} .fr-19{animation-name:k19}
@keyframes k1{0.00%{opacity:0} 0.74%{opacity:1} 3.89%{opacity:1} 4.62%{opacity:0} 100.00%{opacity:0}}
@keyframes k2{0.00%{opacity:0} 4.62%{opacity:0} 5.36%{opacity:1} 8.51%{opacity:1} 9.24%{opacity:0} 100.00%{opacity:0}}
@keyframes k3{0.00%{opacity:0} 9.24%{opacity:0} 9.98%{opacity:1} 13.13%{opacity:1} 13.87%{opacity:0} 100.00%{opacity:0}}
@keyframes k4{0.00%{opacity:0} 13.87%{opacity:0} 14.60%{opacity:1} 17.75%{opacity:1} 18.49%{opacity:0} 100.00%{opacity:0}}
@keyframes k5{0.00%{opacity:0} 18.49%{opacity:0} 19.22%{opacity:1} 22.37%{opacity:1} 23.11%{opacity:0} 100.00%{opacity:0}}
@keyframes k6{0.00%{opacity:0} 23.11%{opacity:0} 23.84%{opacity:1} 27.00%{opacity:1} 27.73%{opacity:0} 100.00%{opacity:0}}
@keyframes k7{0.00%{opacity:0} 27.73%{opacity:0} 28.47%{opacity:1} 31.62%{opacity:1} 32.35%{opacity:0} 100.00%{opacity:0}}
@keyframes k8{0.00%{opacity:0} 32.35%{opacity:0} 33.09%{opacity:1} 36.24%{opacity:1} 36.97%{opacity:0} 100.00%{opacity:0}}
@keyframes k9{0.00%{opacity:0} 36.97%{opacity:0} 37.71%{opacity:1} 40.86%{opacity:1} 41.60%{opacity:0} 100.00%{opacity:0}}
@keyframes k10{0.00%{opacity:0} 41.60%{opacity:0} 42.33%{opacity:1} 45.48%{opacity:1} 46.22%{opacity:0} 100.00%{opacity:0}}
@keyframes k11{0.00%{opacity:0} 46.22%{opacity:0} 46.95%{opacity:1} 50.11%{opacity:1} 50.84%{opacity:0} 100.00%{opacity:0}}
@keyframes k12{0.00%{opacity:0} 50.84%{opacity:0} 51.58%{opacity:1} 54.73%{opacity:1} 55.46%{opacity:0} 100.00%{opacity:0}}
@keyframes k13{0.00%{opacity:0} 55.46%{opacity:0} 56.20%{opacity:1} 59.35%{opacity:1} 60.08%{opacity:0} 100.00%{opacity:0}}
@keyframes k14{0.00%{opacity:0} 60.08%{opacity:0} 60.82%{opacity:1} 63.97%{opacity:1} 64.71%{opacity:0} 100.00%{opacity:0}}
@keyframes k15{0.00%{opacity:0} 64.71%{opacity:0} 65.44%{opacity:1} 68.59%{opacity:1} 69.33%{opacity:0} 100.00%{opacity:0}}
@keyframes k16{0.00%{opacity:0} 69.33%{opacity:0} 70.06%{opacity:1} 73.21%{opacity:1} 73.95%{opacity:0} 100.00%{opacity:0}}
@keyframes k17{0.00%{opacity:0} 73.95%{opacity:0} 74.68%{opacity:1} 77.84%{opacity:1} 78.57%{opacity:0} 100.00%{opacity:0}}
@keyframes k18{0.00%{opacity:0} 78.57%{opacity:0} 79.31%{opacity:1} 82.46%{opacity:1} 83.19%{opacity:0} 100.00%{opacity:0}}
@keyframes k19{0.00%{opacity:0} 83.19%{opacity:0} 83.93%{opacity:1} 99.26%{opacity:1} 100.00%{opacity:0}}
@media (prefers-reduced-motion: reduce){.fr{animation:none} .fr-19{opacity:1}}
</style><g><line x1="210" y1="60" x2="65" y2="140" stroke="#9aa4b2" stroke-width="1.8" stroke-dasharray="6 4"/><line x1="210" y1="60" x2="250" y2="140" stroke="#2563eb" stroke-width="4.5"/><line x1="210" y1="60" x2="360" y2="140" stroke="#9aa4b2" stroke-width="1.8" stroke-dasharray="6 4"/><line x1="65" y1="140" x2="25" y2="210" stroke="#2563eb" stroke-width="4.5"/><line x1="250" y1="140" x2="170" y2="215" stroke="#2563eb" stroke-width="4.5"/><line x1="250" y1="140" x2="320" y2="215" stroke="#9aa4b2" stroke-width="1.8" stroke-dasharray="6 4"/><line x1="170" y1="215" x2="220" y2="290" stroke="#2563eb" stroke-width="4.5"/><line x1="320" y1="215" x2="270" y2="290" stroke="#2563eb" stroke-width="4.5"/><circle cx="210" cy="60" r="18" fill="#3b82f6" stroke="#ffffff" stroke-width="2"/><text x="210" y="65.5" fill="#ffffff" font-size="16" font-weight="700" text-anchor="middle">1</text><text x="210" y="94" fill="currentColor" font-size="15" font-style="italic" text-anchor="middle" opacity="0.75" style="paint-order:stroke;stroke:var(--bg,#fff);stroke-width:5;stroke-linejoin:round">sz=9</text><circle cx="65" cy="140" r="18" fill="#f59e0b" stroke="#ffffff" stroke-width="2"/><text x="65" y="145.5" fill="#ffffff" font-size="16" font-weight="700" text-anchor="middle">2</text><text x="65" y="174" fill="currentColor" font-size="15" font-style="italic" text-anchor="middle" opacity="0.75" style="paint-order:stroke;stroke:var(--bg,#fff);stroke-width:5;stroke-linejoin:round">sz=2</text><circle cx="250" cy="140" r="18" fill="#10b981" stroke="#ffffff" stroke-width="2"/><text x="250" y="145.5" fill="#ffffff" font-size="16" font-weight="700" text-anchor="middle">3</text><text x="250" y="174" fill="currentColor" font-size="15" font-style="italic" text-anchor="middle" opacity="0.75" style="paint-order:stroke;stroke:var(--bg,#fff);stroke-width:5;stroke-linejoin:round">sz=5</text><circle cx="360" cy="140" r="18" fill="#8b5cf6" stroke="#ffffff" stroke-width="2"/><text x="360" y="145.5" fill="#ffffff" font-size="16" font-weight="700" text-anchor="middle">4</text><text x="360" y="174" fill="currentColor" font-size="15" font-style="italic" text-anchor="middle" opacity="0.75" style="paint-order:stroke;stroke:var(--bg,#fff);stroke-width:5;stroke-linejoin:round">sz=1</text><circle cx="25" cy="210" r="18" fill="#3b82f6" stroke="#ffffff" stroke-width="2"/><text x="25" y="215.5" fill="#ffffff" font-size="16" font-weight="700" text-anchor="middle">5</text><text x="25" y="244" fill="currentColor" font-size="15" font-style="italic" text-anchor="middle" opacity="0.75" style="paint-order:stroke;stroke:var(--bg,#fff);stroke-width:5;stroke-linejoin:round">sz=1</text><circle cx="170" cy="215" r="18" fill="#f59e0b" stroke="#ffffff" stroke-width="2"/><text x="170" y="220.5" fill="#ffffff" font-size="16" font-weight="700" text-anchor="middle">6</text><text x="170" y="249" fill="currentColor" font-size="15" font-style="italic" text-anchor="middle" opacity="0.75" style="paint-order:stroke;stroke:var(--bg,#fff);stroke-width:5;stroke-linejoin:round">sz=2</text><circle cx="320" cy="215" r="18" fill="#8b5cf6" stroke="#ffffff" stroke-width="2"/><text x="320" y="220.5" fill="#ffffff" font-size="16" font-weight="700" text-anchor="middle">7</text><text x="320" y="249" fill="currentColor" font-size="15" font-style="italic" text-anchor="middle" opacity="0.75" style="paint-order:stroke;stroke:var(--bg,#fff);stroke-width:5;stroke-linejoin:round">sz=2</text><circle cx="220" cy="290" r="18" fill="#10b981" stroke="#ffffff" stroke-width="2"/><text x="220" y="295.5" fill="#ffffff" font-size="16" font-weight="700" text-anchor="middle">8</text><text x="220" y="324" fill="currentColor" font-size="15" font-style="italic" text-anchor="middle" opacity="0.75" style="paint-order:stroke;stroke:var(--bg,#fff);stroke-width:5;stroke-linejoin:round">sz=1</text><circle cx="270" cy="290" r="18" fill="#3b82f6" stroke="#ffffff" stroke-width="2"/><text x="270" y="295.5" fill="#ffffff" font-size="16" font-weight="700" text-anchor="middle">9</text><text x="270" y="324" fill="currentColor" font-size="15" font-style="italic" text-anchor="middle" opacity="0.75" style="paint-order:stroke;stroke:var(--bg,#fff);stroke-width:5;stroke-linejoin:round">sz=1</text><g font-family="inherit" font-size="17" fill="currentColor">
<line x1="157" y1="352" x2="192" y2="352" stroke="#2563eb" stroke-width="4.5"/>
<text x="200" y="357">cạnh nặng</text>
<line x1="157" y1="372" x2="192" y2="372" stroke="#9aa4b2" stroke-width="1.8" stroke-dasharray="6 4"/>
<text x="200" y="377">cạnh nhẹ</text>
<circle cx="173" cy="397" r="11" fill="none" stroke="currentColor" stroke-width="3"/>
<text x="190" y="402">đỉnh đang xét</text>
</g><g font-family="inherit" font-size="17" fill="currentColor"><circle cx="135" cy="385" r="11" fill="#3b82f6"/><text x="147" y="389">= 1</text><circle cx="185" cy="385" r="11" fill="#f59e0b"/><text x="197" y="389">= 2</text><circle cx="235" cy="385" r="11" fill="#10b981"/><text x="247" y="389">= 3</text><circle cx="285" cy="385" r="11" fill="#8b5cf6"/><text x="297" y="389">= 4</text></g><rect x="20" y="398" width="380" height="148" rx="12" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.35"/><text x="210" y="426" fill="currentColor" font-size="15.5" text-anchor="middle" opacity="0.8">cnt đang giữ (liệt kê theo đỉnh)</text></g><g class="fr fr-1"><circle cx="210" cy="60" r="24" fill="none" stroke="currentColor" stroke-width="3"/><text x="210" y="460" fill="currentColor" font-size="30" text-anchor="middle" opacity="0.4">∅</text><text x="210" y="492" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">cnt = ∅</text><text x="210" y="522" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">ans = [·, ·, ·, ·, ·, ·, ·, ·, ·]</text><text x="210" y="596" fill="currentColor" font-size="16" text-anchor="middle" font-weight="600">Bắt đầu tại 1: cnt = ∅</text><text x="210" y="620" fill="currentColor" font-size="14.5" text-anchor="middle" opacity="0.85">ba con — nặng 3, nhẹ 2 và 4</text></g><g class="fr fr-2"><circle cx="65" cy="140" r="24" fill="none" stroke="currentColor" stroke-width="3"/><text x="210" y="460" fill="currentColor" font-size="30" text-anchor="middle" opacity="0.4">∅</text><text x="210" y="492" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">cnt = ∅</text><text x="210" y="522" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">ans = [·, ·, ·, ·, ·, ·, ·, ·, ·]</text><text x="210" y="596" fill="currentColor" font-size="16" text-anchor="middle" font-weight="600">Xuống 2 (nhẹ, keep=false)</text></g><g class="fr fr-3"><circle cx="25" cy="210" r="24" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="210" cy="452" r="14" fill="#3b82f6" stroke="#ffffff" stroke-width="1.5"/><text x="210" y="457" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">5</text><text x="210" y="492" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">cnt = {1: 1}</text><text x="210" y="522" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">ans = [·, ·, ·, ·, 1, ·, ·, ·, ·]</text><text x="210" y="596" fill="currentColor" font-size="16" text-anchor="middle" font-weight="600">Xuống 5 (lá): cộng 5 → ans[5] = 1</text></g><g class="fr fr-4"><circle cx="65" cy="140" r="24" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="192" cy="452" r="14" fill="#3b82f6" stroke="#ffffff" stroke-width="1.5"/><text x="192" y="457" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">5</text><circle cx="228" cy="452" r="14" fill="#f59e0b" stroke="#ffffff" stroke-width="1.5"/><text x="228" y="457" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">2</text><text x="210" y="492" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">cnt = {1: 1; 2: 1}</text><text x="210" y="522" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">ans = [·, 2, ·, ·, 1, ·, ·, ·, ·]</text><text x="210" y="596" fill="currentColor" font-size="16" text-anchor="middle" font-weight="600">Lên 2: cộng 2 → ans[2] = 2</text></g><g class="fr fr-5"><circle cx="65" cy="140" r="24" fill="none" stroke="currentColor" stroke-width="3"/><text x="210" y="460" fill="currentColor" font-size="30" text-anchor="middle" opacity="0.4">∅</text><text x="210" y="492" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">cnt = ∅</text><text x="210" y="522" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">ans = [·, 2, ·, ·, 1, ·, ·, ·, ·]</text><text x="210" y="596" fill="currentColor" font-size="16" text-anchor="middle" font-weight="600">keep=false: xoá cây con 2 → cnt = ∅</text></g><g class="fr fr-6"><circle cx="360" cy="140" r="24" fill="none" stroke="currentColor" stroke-width="3"/><text x="210" y="460" fill="currentColor" font-size="30" text-anchor="middle" opacity="0.4">∅</text><text x="210" y="492" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">cnt = ∅</text><text x="210" y="522" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">ans = [·, 2, ·, ·, 1, ·, ·, ·, ·]</text><text x="210" y="596" fill="currentColor" font-size="16" text-anchor="middle" font-weight="600">Xuống 4 (nhẹ, keep=false)</text></g><g class="fr fr-7"><circle cx="360" cy="140" r="24" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="210" cy="452" r="14" fill="#8b5cf6" stroke="#ffffff" stroke-width="1.5"/><text x="210" y="457" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">4</text><text x="210" y="492" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">cnt = {4: 1}</text><text x="210" y="522" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">ans = [·, 2, ·, 1, 1, ·, ·, ·, ·]</text><text x="210" y="596" fill="currentColor" font-size="16" text-anchor="middle" font-weight="600">Cộng 4 → ans[4] = 1</text></g><g class="fr fr-8"><circle cx="360" cy="140" r="24" fill="none" stroke="currentColor" stroke-width="3"/><text x="210" y="460" fill="currentColor" font-size="30" text-anchor="middle" opacity="0.4">∅</text><text x="210" y="492" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">cnt = ∅</text><text x="210" y="522" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">ans = [·, 2, ·, 1, 1, ·, ·, ·, ·]</text><text x="210" y="596" fill="currentColor" font-size="16" text-anchor="middle" font-weight="600">keep=false: xoá → cnt = ∅</text></g><g class="fr fr-9"><circle cx="250" cy="140" r="24" fill="none" stroke="currentColor" stroke-width="3"/><text x="210" y="460" fill="currentColor" font-size="30" text-anchor="middle" opacity="0.4">∅</text><text x="210" y="492" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">cnt = ∅</text><text x="210" y="522" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">ans = [·, 2, ·, 1, 1, ·, ·, ·, ·]</text><text x="210" y="596" fill="currentColor" font-size="16" text-anchor="middle" font-weight="600">Xuống 3 — con nặng của 1</text><text x="210" y="620" fill="currentColor" font-size="14.5" text-anchor="middle" opacity="0.85">(6 và 7 hòa kích thước: chọn 6)</text></g><g class="fr fr-10"><circle cx="320" cy="215" r="24" fill="none" stroke="currentColor" stroke-width="3"/><text x="210" y="460" fill="currentColor" font-size="30" text-anchor="middle" opacity="0.4">∅</text><text x="210" y="492" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">cnt = ∅</text><text x="210" y="522" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">ans = [·, 2, ·, 1, 1, ·, ·, ·, ·]</text><text x="210" y="596" fill="currentColor" font-size="16" text-anchor="middle" font-weight="600">Xuống 7 (nhẹ)</text></g><g class="fr fr-11"><circle cx="270" cy="290" r="24" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="210" cy="452" r="14" fill="#3b82f6" stroke="#ffffff" stroke-width="1.5"/><text x="210" y="457" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">9</text><text x="210" y="492" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">cnt = {1: 1}</text><text x="210" y="522" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">ans = [·, 2, ·, 1, 1, ·, ·, ·, 1]</text><text x="210" y="596" fill="currentColor" font-size="16" text-anchor="middle" font-weight="600">Xuống 9 (lá): cộng 9 → ans[9] = 1</text></g><g class="fr fr-12"><circle cx="320" cy="215" r="24" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="192" cy="452" r="14" fill="#3b82f6" stroke="#ffffff" stroke-width="1.5"/><text x="192" y="457" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">9</text><circle cx="228" cy="452" r="14" fill="#8b5cf6" stroke="#ffffff" stroke-width="1.5"/><text x="228" y="457" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">7</text><text x="210" y="492" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">cnt = {1: 1; 4: 1}</text><text x="210" y="522" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">ans = [·, 2, ·, 1, 1, ·, 2, ·, 1]</text><text x="210" y="596" fill="currentColor" font-size="16" text-anchor="middle" font-weight="600">Lên 7: cộng 7 → ans[7] = 2</text></g><g class="fr fr-13"><circle cx="320" cy="215" r="24" fill="none" stroke="currentColor" stroke-width="3"/><text x="210" y="460" fill="currentColor" font-size="30" text-anchor="middle" opacity="0.4">∅</text><text x="210" y="492" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">cnt = ∅</text><text x="210" y="522" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">ans = [·, 2, ·, 1, 1, ·, 2, ·, 1]</text><text x="210" y="596" fill="currentColor" font-size="16" text-anchor="middle" font-weight="600">keep=false: xoá cây con 7 → cnt = ∅</text></g><g class="fr fr-14"><circle cx="170" cy="215" r="24" fill="none" stroke="currentColor" stroke-width="3"/><text x="210" y="460" fill="currentColor" font-size="30" text-anchor="middle" opacity="0.4">∅</text><text x="210" y="492" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">cnt = ∅</text><text x="210" y="522" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">ans = [·, 2, ·, 1, 1, ·, 2, ·, 1]</text><text x="210" y="596" fill="currentColor" font-size="16" text-anchor="middle" font-weight="600">Sang 6 — con nặng của 3</text></g><g class="fr fr-15"><circle cx="220" cy="290" r="24" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="210" cy="452" r="14" fill="#10b981" stroke="#ffffff" stroke-width="1.5"/><text x="210" y="457" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">8</text><text x="210" y="492" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">cnt = {3: 1}</text><text x="210" y="522" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">ans = [·, 2, ·, 1, 1, ·, 2, 1, 1]</text><text x="210" y="596" fill="currentColor" font-size="16" text-anchor="middle" font-weight="600">Xuống 8 (lá): cộng 8 → ans[8] = 1</text></g><g class="fr fr-16"><circle cx="170" cy="215" r="24" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="192" cy="452" r="14" fill="#10b981" stroke="#ffffff" stroke-width="1.5"/><text x="192" y="457" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">8</text><circle cx="228" cy="452" r="14" fill="#f59e0b" stroke="#ffffff" stroke-width="1.5"/><text x="228" y="457" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">6</text><text x="210" y="492" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">cnt = {2: 1; 3: 1}</text><text x="210" y="522" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">ans = [·, 2, ·, 1, 1, 2, 2, 1, 1]</text><text x="210" y="596" fill="currentColor" font-size="16" text-anchor="middle" font-weight="600">Lên 6: cộng 6 → ans[6] = 2</text></g><g class="fr fr-17"><circle cx="250" cy="140" r="24" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="138" cy="452" r="14" fill="#10b981" stroke="#ffffff" stroke-width="1.5"/><text x="138" y="457" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">8</text><circle cx="174" cy="452" r="14" fill="#f59e0b" stroke="#ffffff" stroke-width="1.5"/><text x="174" y="457" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">6</text><circle cx="210" cy="452" r="14" fill="#3b82f6" stroke="#ffffff" stroke-width="1.5"/><text x="210" y="457" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">9</text><circle cx="246" cy="452" r="14" fill="#8b5cf6" stroke="#ffffff" stroke-width="1.5"/><text x="246" y="457" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">7</text><circle cx="282" cy="452" r="14" fill="#10b981" stroke="#ffffff" stroke-width="1.5"/><text x="282" y="457" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">3</text><text x="210" y="492" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">cnt = {1: 1; 2: 1; 3: 2; 4: 1}</text><text x="210" y="522" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">ans = [·, 2, 4, 1, 1, 2, 2, 1, 1]</text><text x="210" y="596" fill="currentColor" font-size="16" text-anchor="middle" font-weight="600">Lên 3: cộng lại cây con nhẹ 7 (9, 7)</text><text x="210" y="620" fill="currentColor" font-size="14.5" text-anchor="middle" opacity="0.85">rồi cộng 3 → ans[3] = 4</text></g><g class="fr fr-18"><circle cx="210" cy="60" r="24" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="78" cy="452" r="14" fill="#10b981" stroke="#ffffff" stroke-width="1.5"/><text x="78" y="457" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">8</text><circle cx="111" cy="452" r="14" fill="#f59e0b" stroke="#ffffff" stroke-width="1.5"/><text x="111" y="457" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">6</text><circle cx="144" cy="452" r="14" fill="#3b82f6" stroke="#ffffff" stroke-width="1.5"/><text x="144" y="457" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">9</text><circle cx="177" cy="452" r="14" fill="#8b5cf6" stroke="#ffffff" stroke-width="1.5"/><text x="177" y="457" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">7</text><circle cx="210" cy="452" r="14" fill="#10b981" stroke="#ffffff" stroke-width="1.5"/><text x="210" y="457" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">3</text><circle cx="243" cy="452" r="14" fill="#f59e0b" stroke="#ffffff" stroke-width="1.5"/><text x="243" y="457" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">2</text><circle cx="276" cy="452" r="14" fill="#3b82f6" stroke="#ffffff" stroke-width="1.5"/><text x="276" y="457" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">5</text><circle cx="309" cy="452" r="14" fill="#8b5cf6" stroke="#ffffff" stroke-width="1.5"/><text x="309" y="457" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">4</text><circle cx="342" cy="452" r="14" fill="#3b82f6" stroke="#ffffff" stroke-width="1.5"/><text x="342" y="457" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">1</text><text x="210" y="492" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">cnt = {1: 3; 2: 2; 3: 2; 4: 2}</text><text x="210" y="522" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">ans = [4, 2, 4, 1, 1, 2, 2, 1, 1]</text><text x="210" y="596" fill="currentColor" font-size="16" text-anchor="middle" font-weight="600">Lên 1: cộng các con nhẹ (2, 5, 4)</text><text x="210" y="620" fill="currentColor" font-size="14.5" text-anchor="middle" opacity="0.85">rồi cộng 1 → ans[1] = 4</text></g><g class="fr fr-19"><circle cx="210" cy="60" r="24" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="78" cy="452" r="14" fill="#10b981" stroke="#ffffff" stroke-width="1.5"/><text x="78" y="457" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">8</text><circle cx="111" cy="452" r="14" fill="#f59e0b" stroke="#ffffff" stroke-width="1.5"/><text x="111" y="457" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">6</text><circle cx="144" cy="452" r="14" fill="#3b82f6" stroke="#ffffff" stroke-width="1.5"/><text x="144" y="457" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">9</text><circle cx="177" cy="452" r="14" fill="#8b5cf6" stroke="#ffffff" stroke-width="1.5"/><text x="177" y="457" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">7</text><circle cx="210" cy="452" r="14" fill="#10b981" stroke="#ffffff" stroke-width="1.5"/><text x="210" y="457" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">3</text><circle cx="243" cy="452" r="14" fill="#f59e0b" stroke="#ffffff" stroke-width="1.5"/><text x="243" y="457" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">2</text><circle cx="276" cy="452" r="14" fill="#3b82f6" stroke="#ffffff" stroke-width="1.5"/><text x="276" y="457" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">5</text><circle cx="309" cy="452" r="14" fill="#8b5cf6" stroke="#ffffff" stroke-width="1.5"/><text x="309" y="457" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">4</text><circle cx="342" cy="452" r="14" fill="#3b82f6" stroke="#ffffff" stroke-width="1.5"/><text x="342" y="457" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">1</text><text x="210" y="492" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">cnt = {1: 3; 2: 2; 3: 2; 4: 2}</text><text x="210" y="522" fill="currentColor" font-size="16" text-anchor="middle" opacity="0.75">ans = [4, 2, 4, 1, 1, 2, 2, 1, 1]</text><text x="210" y="596" fill="currentColor" font-size="16" text-anchor="middle" font-weight="600">Kết: dfs(1, keep=true)</text><text x="210" y="620" fill="currentColor" font-size="14.5" text-anchor="middle" opacity="0.85">giữ nguyên toàn bộ</text></g></svg>
</div>

Từ bất biến, tính đúng đắn suy ra theo quy nạp qua các bước:

1. Các con nhẹ chạy xong (mỗi lần `keep = false`) đều để `cnt` trống.
2. Con nặng chạy với `keep = true`, để lại đúng màu trong cây con của nó.
3. Cộng cây con các con nhẹ và màu của $v$ vào — lúc này `cnt` đúng bằng màu của cây con $v$, nên `ans[v]` chính xác.
4. Nếu `keep = false`, trừ đúng phần vừa cộng, đưa `cnt` về trống cho lời gọi cha.

**Vì sao $O(n \log n)$:** mỗi thao tác "cộng/xoá cả cây con" tại một đỉnh $v$ chỉ đụng tới các đỉnh nằm trong **cây con có gốc là một đỉnh con nhẹ của $v$**, hoặc đụng tới toàn bộ cây con $v$ khi chính $v$ là con nhẹ. Với một đỉnh $w$ bất kỳ, cả hai trường hợp đều ứng với một **cạnh nhẹ** trên đường từ gốc xuống $w$; đường này có không quá $\log n$ cạnh nhẹ (bổ đề ở trên), nên $w$ bị cộng/xoá $O(\log n)$ lần. Con nặng không bị xoá khi trả về, nên phần lớn nhất không bao giờ phải cộng lại. Cộng tất cả lại: $O(n \log n)$.

#### Thuật toán

Giữ mảng đếm `cnt[]` dùng chung và biến `distinct` — số màu đang có mặt. Với đỉnh $v$:

1. Đệ quy các con nhẹ với `keep = false`: tính xong thì xoá sạch dữ liệu của chúng khỏi `cnt`.
2. Đệ quy con nặng với `keep = true`: giữ nguyên dữ liệu của con nặng.
3. Cộng màu của các cây con nhẹ và màu của chính $v$ vào `cnt`.
4. Ghi `ans[v] = distinct`.
5. Nếu `keep = false`: xoá toàn bộ cây con $v$ khỏi `cnt`.

#### Cài đặt

**C++** — Sack đệ quy kiểu kinh điển; cộng/xoá cây con bằng cách đệ quy qua các con:

```cpp
int n, distinct = 0;
vector<vector<int>> g;
vector<int> col, sz, bigChild, cnt, ans;

// cộng/xoá toàn bộ màu trong cây con v (đệ quy qua các con)
void add(int v, int p, int delta) {
    int c = col[v];
    distinct -= (cnt[c] > 0);
    cnt[c] += delta;
    distinct += (cnt[c] > 0);
    for (int u : g[v])
        if (u != p) add(u, v, delta);
}

// một lượt DFS: kích thước cây con và con nặng
void getSize(int v, int p) {
    sz[v] = 1;
    for (int u : g[v]) {
        if (u == p) continue;
        getSize(u, v);
        sz[v] += sz[u];
        if (sz[u] > sz[bigChild[v]]) bigChild[v] = u;
    }
}

// Sack: con nhẹ chạy keep=false, con nặng chạy keep=true
void dfs(int v, int p, bool keep) {
    for (int u : g[v])
        if (u != p && u != bigChild[v]) dfs(u, v, false);
    if (bigChild[v]) dfs(bigChild[v], v, true);

    for (int u : g[v])
        if (u != p && u != bigChild[v]) add(u, v, +1);

    int c = col[v];
    distinct -= (cnt[c] > 0);
    ++cnt[c];
    distinct += (cnt[c] > 0);
    ans[v] = distinct;

    if (!keep) add(v, p, -1);
}
```

Trước khi chạy, chỉ cần gọi `getSize(1, 0)` để có `sz` và `bigChild`; khởi tạo `cnt` toàn $0$, `distinct = 0`, rồi gọi `dfs(1, 0, true)`. Vì màu không vượt quá $2 \cdot 10^5$, `cnt` là **mảng tĩnh** kích thước $2 \cdot 10^5 + 1$ — cộng/xoá $O(1)$ ổn định, không cần băm.

**Python** — cùng thuật toán với bản C++:

```python
def dfs_sack(n, color, adj):
    sz = [1] * (n + 1)
    sz[0] = 0
    big_child = [0] * (n + 1)
    parent = [0] * (n + 1)

    # một lượt DFS: kích thước cây con và con nặng
    def get_size(v, p):
        for u in adj[v]:
            if u == p:
                continue
            parent[u] = v
            get_size(u, v)
            sz[v] += sz[u]
            if sz[u] > sz[big_child[v]]:
                big_child[v] = u

    cnt = {}
    ans = [0] * (n + 1)
    distinct = 0

    # cộng/xoá một đỉnh vào bảng đếm
    def add_one(v, delta):
        nonlocal distinct
        c = color[v - 1]
        before = cnt.get(c, 0)
        cnt[c] = before + delta
        distinct += (before == 0) - (cnt[c] == 0)

    # cộng/xoá toàn bộ màu trong cây con v (đệ quy qua các con)
    def add_subtree(v, p, delta):
        add_one(v, delta)
        for u in adj[v]:
            if u != p:
                add_subtree(u, v, delta)

    # Sack: con nhẹ chạy keep=False, con nặng chạy keep=True
    def dfs(v, keep):
        p = parent[v]
        for u in adj[v]:
            if u != p and u != big_child[v]:
                dfs(u, False)
        if big_child[v]:
            dfs(big_child[v], True)
        for u in adj[v]:
            if u != p and u != big_child[v]:
                add_subtree(u, v, +1)
        add_one(v, +1)
        ans[v] = distinct
        if not keep:
            add_subtree(v, p, -1)

    get_size(1, 0)
    dfs(1, True)
    return ans
```

**Biến thể — cộng/xoá theo khoảng Euler.** Giữ nguyên khung heavy-light ở trên; chỉ thay các lời gọi `add(u, v, ±1)` đệ quy bằng vòng lặp trên một đoạn Euler. Cách đánh số tour trong **một** DFS:

- khi bước vào $v$: gán `st[v] = timer`, `ver[timer] = v`, rồi `timer++` — nghĩa là `ver[t]` chính là đỉnh được thăm thứ $t$;
- đệ quy các con (vẫn tính `sz` và con nặng như cũ);
- khi rời $v$: gán `ft[v] = timer`.

Vì con luôn được thăm ngay sau cha và thăm hết trước khi sang nhánh khác, các đỉnh thuộc cây con $v$ nằm **liền nhau** trong `ver`: đúng đoạn `ver[st[v] … ft[v])`. Nhờ vậy "cộng/xoá cây con" chỉ còn là vòng lặp trên đoạn — `dfs` của Sack giữ nguyên cấu trúc, chỉ thay hai chỗ gọi `add` bằng vòng lặp.

**C++ (biến thể Euler):**

```cpp
int n, distinct = 0;
int timer_ = 0;
vector<vector<int>> g;
vector<int> col, sz, bigChild, st, ft, ver, cnt, ans;

// một DFS: vừa tính sz/bigChild, vừa đánh số tour
void build(int v, int p) {
    st[v] = timer_;
    ver[timer_++] = v;
    sz[v] = 1;
    for (int u : g[v]) {
        if (u == p) continue;
        build(u, v);
        sz[v] += sz[u];
        if (sz[u] > sz[bigChild[v]]) bigChild[v] = u;
    }
    ft[v] = timer_;
}

// cộng/xoá một đỉnh vào bảng đếm
void add(int v, int delta) {
    int c = col[v];
    distinct -= (cnt[c] > 0);
    cnt[c] += delta;
    distinct += (cnt[c] > 0);
}

void dfs(int v, int p, bool keep) {
    for (int u : g[v])
        if (u != p && u != bigChild[v]) dfs(u, v, false);
    if (bigChild[v]) dfs(bigChild[v], v, true);

    for (int u : g[v])
        if (u != p && u != bigChild[v])
            for (int i = st[u]; i < ft[u]; ++i) add(ver[i], +1);

    add(v, +1);
    ans[v] = distinct;

    if (!keep)
        for (int i = st[v]; i < ft[v]; ++i) add(ver[i], -1);
}
```

Cách này không đổi độ phức tạp ($O(n \log n)$); đổi lại, bước cộng/xoá chạy bằng vòng lặp nên tránh được đệ quy sâu, và tiện khi cần duy trì thêm mảng thống kê phụ theo từng đỉnh.

**Python (biến thể Euler):** `tin[v]` là vị trí của $v$ trong tour nên cây con đúng bằng đoạn `order[tin[v] .. tin[v] + sz[v])`:

```python
def dfs_sack_euler(n, color, adj):
    parent = [0] * (n + 1)
    tin = [0] * (n + 1)
    sz = [1] * (n + 1)
    sz[0] = 0
    big_child = [0] * (n + 1)
    order = []
    timer = 0

    # một DFS: vừa tính sz/big_child, vừa đánh số tour
    def build(v, p):
        nonlocal timer
        tin[v] = timer
        timer += 1
        order.append(v)
        for u in adj[v]:
            if u == p:
                continue
            parent[u] = v
            build(u, v)
            sz[v] += sz[u]
            if sz[u] > sz[big_child[v]]:
                big_child[v] = u

    build(1, 0)

    cnt = {}
    ans = [0] * (n + 1)
    distinct = 0

    # cộng/xoá một đỉnh vào bảng đếm
    def add(v, delta):
        nonlocal distinct
        c = color[v - 1]
        before = cnt.get(c, 0)
        cnt[c] = before + delta
        distinct += (before == 0) - (cnt[c] == 0)

    def dfs(v, keep):
        p = parent[v]
        for u in adj[v]:
            if u != p and u != big_child[v]:
                dfs(u, False)
        if big_child[v]:
            dfs(big_child[v], True)
        for u in adj[v]:
            if u != p and u != big_child[v]:
                for i in range(tin[u], tin[u] + sz[u]):
                    add(order[i], +1)
        add(v, +1)
        ans[v] = distinct
        if not keep:
            for i in range(tin[v], tin[v] + sz[v]):
                add(order[i], -1)

    dfs(1, True)
    return ans
```

#### Độ phức tạp

- **Thời gian:** $O(n \log n)$ (chứng minh ở trên).
- **Bộ nhớ:** $O(n)$.
- Các thao tác cộng/xoá phải rẻ (ở bài này là $O(1)$); nếu mỗi thao tác đắt, hằng số sẽ đội lên tương ứng.

## Bài tập luyện

- [Distinct Colors (CSES)](https://cses.fi/problemset/task/1139): biến thể tương tự nhưng màu tới $10^9$ — phải nén màu trước khi dùng mảng đếm, hoặc dùng `unordered_map` (nhưng đừng lạm dụng).
- [Lomsat gelral (CF 600E)](https://codeforces.com/problemset/problem/600/E): bài gốc kinh điển với $n \le 10^5$, màu không vượt quá $n$; đề yêu cầu với mỗi cây con, tính tổng các màu xuất hiện nhiều nhất.

## Nguồn

- <https://codeforces.com/blog/entry/44351>
- <https://codeforces.com/blog/entry/67696>
- <https://oj.chuyentin.pro/wiki/dsu-on-tree/>
