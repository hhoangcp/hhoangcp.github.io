---
title: A + B
date: 2026-08-11 13:30:00
description: Bài mẫu A + B — đọc hai số nguyên và in ra tổng, kèm giải thích, cài đặt C++/Python và phân tích độ phức tạp.
tags: [mẫu, cơ bản, cpp]
category: Cơ bản
---

## Đề bài

Cho hai số nguyên $A$ và $B$, hãy tính và in ra tổng $A + B$.

### Input

Một dòng chứa hai số nguyên $A$ và $B$ ($-10^9 \le A, B \le 10^9$).

### Output

Một số nguyên: tổng $A + B$.

### Ví dụ

| Input  | Output |
| ------ | ------ |
| `3 5`  | `8`    |
| `-2 7` | `5`    |

## Lời giải

Đây là bài toán cơ bản nhất. Tổng $A + B$ có thể vượt phạm vi của `int` 32-bit (tối đa $\approx 2{,}1 \times 10^9$), nên ta dùng `long long` để an toàn:

$$
|A + B| \le |A| + |B| \le 2 \times 10^9 < 2^{31} - 1
$$

> Mẹo: trong C++, khi tổng có thể vượt $\pm 2 \times 10^9$ thì nên dùng `long long` thay vì `int`.

## Cài đặt C++

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    long long a, b;
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
