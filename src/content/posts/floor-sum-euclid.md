---
title: Floor Sum — tính tổng hàm sàn bằng đệ quy kiểu Euclid
date: 2026-10-22 11:45:00
description: Tính nhanh tổng phần nguyên Σ⌊(ai+b)/c⌋ bằng đệ quy kiểu Euclid, độ phức tạp O(log).
tags: [number-theory, floor-sum, euclidean, cpp]
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

Chuỗi tham số đệ quy $(a, c) \to (c, a) \to (c \bmod a, a)$ chính là tiến trình của thuật Euclid tìm $\gcd$ — thuật toán được gọi là "kiểu Euclid" vì lẽ đó — nên độ phức tạp cũng là $O(\log)$.

## Ghi chú

Khi $M = 0$, phép đệ quy dẫn tới bài toán con với $n = -1$; tuy về hình thức có vẻ vô lý, công thức vẫn cho kết quả $0$ vì các nhân tử $(n+1)$ và $\frac{n(n+1)}{2}$ đều triệt tiêu tại đó. Công thức đã được kiểm chứng bằng chương trình brute force trên dữ liệu ngẫu nhiên (bao gồm các trường hợp biên $a = 0$, $b = 0$, $c = 1$, $n = 0$).

## Bài tập luyện

- [C — Floor Sum (AtCoder)](https://atcoder.jp/contests/practice2/tasks/practice2_c): bài kinh điển đúng với nội dung này; xem thêm `floor_sum` trong AtCoder Library.
- [P5170 (Luogu)](https://www.luogu.com.cn/problem/P5170): bản mở rộng của bài template, yêu cầu thêm hai tổng bình phương và tổng có trọng số.

## Nguồn

- <https://www.cnblogs.com/bztMinamoto/p/10334354.html>
- <https://codeforces.com/blog/entry/140997>
