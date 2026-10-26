---
title: Floor Sum — tính tổng hàm sàn bằng đệ quy kiểu Euclid
date: 2026-10-22 11:45:00
description: Thuật toán floor sum — tính tổng phần nguyên bằng đệ quy kiểu Euclid với độ phức tạp logarit.
tags: [number-theory, floor-sum, euclidean, cpp, python]
category: [Số học]
---

## Đề bài

Cho $a, b, c, n \in \mathbb{N}$ với $c \ge 1$, tính:

$$
f(a,b,c,n) = \sum_{i=0}^{n} \left\lfloor \frac{ai+b}{c} \right\rfloor
$$

## Lời giải

Trường hợp đơn giản nhất là $a = 0$: mọi số hạng đều bằng $\left\lfloor \frac{b}{c} \right\rfloor$, nên

$$
f(a,b,c,n) = (n+1)\left\lfloor \frac{b}{c} \right\rfloor
$$

Với trường hợp tổng quát, công cụ chính là bước tách phần nguyên của tử số theo phép chia có dư, đúng với mọi số nguyên $x$ và $b > 0$:

$$
\left\lfloor \frac{ax}{b} \right\rfloor = \left\lfloor \frac{a\,(x \bmod b)}{b} \right\rfloor + a\left\lfloor \frac{x}{b} \right\rfloor
$$

Áp dụng cho cả $a$ và $b$ khi $a \ge c$ hoặc $b \ge c$:

$$
\begin{aligned}
f(a,b,c,n) &= \sum_{i=0}^{n} \left( \left\lfloor \frac{(a \bmod c)i + (b \bmod c)}{c} \right\rfloor + i\left\lfloor \frac{a}{c} \right\rfloor + \left\lfloor \frac{b}{c} \right\rfloor \right)\\
&= f(a \bmod c,\, b \bmod c,\, c,\, n) + \frac{n(n+1)}{2}\left\lfloor \frac{a}{c} \right\rfloor + (n+1)\left\lfloor \frac{b}{c} \right\rfloor
\end{aligned}
$$

Xét trường hợp chủ chốt $a < c$ và $b < c$. Đặt $M = \left\lfloor \frac{an+b}{c} \right\rfloor$, ta có:

$$
\begin{aligned}
f(a,b,c,n) &= \sum_{i=0}^{n} \sum_{j=1}^{M} \left[ \left\lfloor \frac{ai+b}{c} \right\rfloor \ge j \right]\\
&= \sum_{i=0}^{n} \sum_{j=1}^{M} \left[ ai+b \ge jc \right]\\
&= \sum_{i=0}^{n} \sum_{j=0}^{M-1} \left[ ai+b > jc+c-1 \right]\\
&= \sum_{j=0}^{M-1} \sum_{i=0}^{n} \left[ i > \left\lfloor \frac{jc+c-b-1}{a} \right\rfloor \right]\\
&= \sum_{j=0}^{M-1} \left( n - \left\lfloor \frac{jc+c-b-1}{a} \right\rfloor \right)\\
&= nM - f(c,\, c-b-1,\, a,\, M-1)
\end{aligned}
$$

($[\,\cdot\,]$ là ký hiệu Iverson: nhận giá trị $1$ khi điều kiện trong ngoặc đúng, $0$ khi sai.) Tóm lại, $f$ được tính đệ quy như sau:

$$
f(a,b,c,n) = \begin{cases}
(n+1)\left\lfloor \dfrac{b}{c} \right\rfloor & a = 0\\[4mm]
f(a \bmod c, b \bmod c, c, n) + \dfrac{n(n+1)}{2}\left\lfloor \dfrac{a}{c} \right\rfloor + (n+1)\left\lfloor \dfrac{b}{c} \right\rfloor & a \ge c \lor b \ge c\\[4mm]
nM - f(c, c-b-1, a, M-1) & a < c,\; b < c
\end{cases}
$$

Hai bước đệ quy luân phiên đúng như thuật Euclid: bước tách phần nguyên đưa $(a, c) \to (a \bmod c,\, c)$, còn bước đổi trục tráo thành $(a, c) \to (c,\, a)$. Ghép trọn một vòng xuất phát từ nhánh $a \ge c$: $(a, c) \to (a \bmod c,\, c) \to (c,\, a \bmod c) \to \cdots$ — chính là chuỗi phép lấy dư của $\gcd$, nên độ phức tạp là $O(\log)$; cái tên "kiểu Euclid" cũng từ đây.

## Cài đặt

**C++**

```cpp
#include <bits/stdc++.h>
using namespace std;

using i64 = long long;
using i128 = __int128_t;

// sum_{i=0}^{n} floor((a*i + b) / c), voi c >= 1
i128 floorSum(int a, int b, int c, i64 n) {
    if (a == 0) return ((i128)n + 1) * (b / c);
    if (a >= c || b >= c)
        return floorSum(a % c, b % c, c, n)
             + (i128)n * ((i128)n + 1) / 2 * (a / c)
             + ((i128)n + 1) * (b / c);
    i64 M = (i64)(((i128)a * n + b) / c);
    if (M == 0) return 0; // a*n + b < c: moi so hang deu bang 0
    return (i128)n * M - floorSum(c, c - b - 1, a, M - 1);
}
```

**Python**

```python
def floor_sum(a: int, b: int, c: int, n: int) -> int:
    """sum_{i=0}^{n} floor((a*i + b) / c), voi c >= 1"""
    if a == 0:
        return (n + 1) * (b // c)
    if a >= c or b >= c:
        return (
            floor_sum(a % c, b % c, c, n)
            + n * (n + 1) // 2 * (a // c)
            + (n + 1) * (b // c)
        )
    M = (a * n + b) // c
    if M == 0:
        return 0  # a*n + b < c: moi so hang deu bang 0
    return n * M - floor_sum(c, c - b - 1, a, M - 1)
```

## Ghi chú

Khi $M = \left\lfloor \frac{an+b}{c} \right\rfloor = 0$ (tức $an+b < c$), mọi số hạng đều bằng $0$, nên cả hai bản cài đặt trả về $0$ ngay nhờ câu lệnh `if (M == 0)`. Nếu bỏ câu lệnh này, công thức đệ quy vẫn cho kết quả đúng: lời gọi rơi vào bài toán con với $n = -1$ và mọi số hạng chứa nhân tử $(n+1)$ đều triệt tiêu — nhưng giữ lại thì tránh hẳn vùng $n$ âm và dễ đọc hơn. Công thức đã được kiểm chứng bằng brute force trên dữ liệu ngẫu nhiên, kể cả các trường hợp biên $a = 0$, $b = 0$, $c = 1$, $n = 0$.

## Bài tập luyện

- [C — Floor Sum (AtCoder)](https://atcoder.jp/contests/practice2/tasks/practice2_c): bài kinh điển đúng với nội dung này; xem thêm `floor_sum` trong AtCoder Library.
- [P5170 (Luogu)](https://www.luogu.com.cn/problem/P5170): bản mở rộng của bài template, yêu cầu thêm hai tổng bình phương và tổng có trọng số.

## Nguồn

- <https://www.cnblogs.com/bztMinamoto/p/10334354.html>
- <https://codeforces.com/blog/entry/140997>
