---
title: A + B
date: 2026-08-11 13:30:00
description: Bài mẫu A + B — đọc hai số nguyên và in ra tổng, kèm giải thích, cài đặt C++/Python và phân tích độ phức tạp.
tags: [cpp, python, implementation]
source: VNOJ — A cộng B
sourceUrl: https://oj.vnoi.info/problem/post
category: [Cơ bản]
---

## Đề bài

Cho hai số nguyên $A$ và $B$, hãy tính và in ra tổng $A + B$.

### Input

Một dòng chứa hai số nguyên $A$ và $B$ ($-10^9 \le A, B \le 10^9$).

### Output

Một số nguyên: tổng $A + B$.

### Ví dụ

<div class="io" data-io="Input"><pre>3 5
-2 7</pre></div>

<div class="io" data-io="Output"><pre>8
5</pre></div>

## Lời giải

Đây là bài toán cơ bản nhất. Với ràng buộc $-10^9 \le A, B \le 10^9$, tổng $A + B$ nằm trong khoảng $[-2 \times 10^9,\, 2 \times 10^9]$, vẫn nằm gọn trong phạm vi của `int` 32-bit (khoảng $\pm 2{,}1 \times 10^9$). Do đó ta chỉ cần đọc hai số và in ra tổng.

## Cài đặt C++

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    cout << a + b << '\n';
    return 0;
}
```

## Cài đặt Python

```python
a, b = map(int, input().split())
print(a + b)
```

## Độ phức tạp

- **Thời gian**: $O(1)$ — chỉ đọc và cộng hai số.
- **Không gian**: $O(1)$ — không lưu thêm cấu trúc dữ liệu.

Bài A + B là bài khởi đầu kinh điển, thường dùng để kiểm tra hệ nộp bài và làm quen với input/output.
