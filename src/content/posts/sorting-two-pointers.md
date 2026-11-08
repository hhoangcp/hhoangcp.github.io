---
title: Sắp xếp, hai con trỏ và cửa sổ trượt
date: 2026-11-02 15:00:00
description: Sắp xếp mảng rồi quét bằng hai con trỏ, cửa sổ trượt, tham lam và prefix sum để giải các bài CSES kinh điển bằng C++ và Python.
tags: [sorting, two-pointers, sliding-window, prefix-sum, greedy, cpp, python]
tree: [co-ban, sap-xep-hai-con-tro]
---

## Đề bài

**[Ferris Wheel (CSES 1090)](https://cses.fi/problemset/task/1090).** $n$ đứa trẻ xếp hàng chờ lên tàu lượn. Mỗi gondola chở được **tối đa hai** đứa và tổng trọng lượng không vượt quá $x$ kilogram; đứa thứ $i$ nặng $p_i$ kilogram. Cần ít nhất bao nhiêu gondola để chở hết tất cả?

Giới hạn: $1 \le n \le 2 \cdot 10^5$, $1 \le p_i \le x \le 10^9$.

<div class="io" data-io="Input"><pre>4 10
7 2 3 9</pre></div>

<div class="io" data-io="Output"><pre>3</pre></div>

**[Movie Festival (CSES 1629)](https://cses.fi/problemset/task/1629).** Trong một lễ hội phim có $n$ bộ phim, phim thứ $i$ bắt đầu lúc $a_i$ và kết thúc lúc $b_i$. Một người có thể bắt đầu xem phim mới đúng lúc phim cũ kết thúc, nhưng không xem được hai phim chồng lấn. Chọn nhiều nhất bao nhiêu phim để xem trọn vẹn?

Giới hạn: $1 \le n \le 2 \cdot 10^5$, $1 \le a_i < b_i \le 10^9$.

<div class="io" data-io="Input"><pre>3
3 5
4 9
5 8</pre></div>

<div class="io" data-io="Output"><pre>2</pre></div>

Hai đề trông chẳng liên quan — một bài chia cặp theo trọng lượng, một bài chọn khoảng không chồng lấn — nhưng chung một hướng đi: sắp xếp để tạo ra thứ tự, rồi kết luận bằng một lượt quét tuyến tính. Bài viết dựng lại chuỗi kỹ thuật đó từ gốc: comparator, hai con trỏ, cửa sổ trượt, tham lam theo thời điểm kết thúc và prefix sum.

## Sắp xếp và comparator

`std::sort` cài đặt introsort — lai giữa quicksort, heapsort và insertion sort — với chi phí $O(n \log n)$ kể cả trường hợp xấu nhất. Thứ tự mặc định là tăng dần theo toán tử `<`; muốn khác thì truyền **comparator**: hàm nhận hai phần tử và trả `true` nếu phần tử đầu đứng trước. Comparator phải là thứ tự yếu nghiêm ngặt: `cmp(u, u)` bắt buộc `false`; viết nhầm `<=` thay vì `<` sẽ gây hành vi không xác định — có thể crash ngay giữa lúc chạy.

Với cặp `pair`, thứ tự mặc định là **so sánh từ điển**: so `.first` trước, bằng thì mới so `.second`. Khai thác tính chất này thường thay được comparator tự viết: muốn xếp các đoạn thời gian theo giờ kết thúc, chỉ cần đổi mỗi phim $(a_i, b_i)$ thành cặp $(b_i, a_i)$ rồi `sort` không cần đối số thứ ba — so giờ kết thúc trước, trùng thì so giờ bắt đầu.

`std::stable_sort` (merge sort) khác `sort` ở chỗ giữ nguyên thứ tự tương đối giữa các phần tử "bằng nhau" theo comparator — cần khi chính thứ tự xuất hiện ban đầu mang thông tin. Chi phí $O(n \log n)$ nếu cấp phát đủ bộ nhớ đệm, $O(n \log^2 n)$ nếu không.

Từ thứ tự đó suy ra ngay: **các phần tử bằng nhau đứng liền nhau thành từng đoạn**. Đây là chìa khóa của [Distinct Numbers (CSES 1621)](https://cses.fi/problemset/task/1621) — đếm số giá trị phân biệt: sort xong, mỗi lần $a_i$ khác $a_{i-1}$ là gặp một giá trị mới. Với $a = [3, 1, 2, 2, 1, 4]$, sau sort được $[1, 1, 2, 2, 3, 4]$ — ba vị trí đổi giá trị (tại 3, 5, 6) cộng $1$ vị trí đầu, vậy có $4$ giá trị phân biệt.

```cpp
#include <bits/stdc++.h>

using namespace std;

typedef long long i64;
const i64 MOD = 1e9 + 7;
const int INF = 1e9 + 7;

// Distinct Numbers — số giá trị phân biệt của dãy
int distinct_numbers(int n, vector<i64> a) {
    sort(a.begin(), a.end());
    int res = 1; // dãy không rỗng nên có ít nhất một giá trị
    for (int i = 1; i < n; ++i)
        res += (a[i] != a[i - 1]); // giá trị mới: khác phần tử liền trước
    return res;
}

void solve() {
    vector<i64> a = {3, 1, 2, 2, 1, 4};
    cout << distinct_numbers((int)a.size(), a) << '\n';
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

## Hai con trỏ đối xứng

### Ferris Wheel — ghép nặng nhất với nhẹ nhất

Sort $p$ tăng dần rồi giữ hai con trỏ: $l$ trỏ đứa nhẹ nhất chưa xếp, $r$ trỏ đứa nặng nhất chưa xếp. Mỗi bước:

- nếu $p_l + p_r \le x$: hai đứa ghép chung một gondola, dịch cả hai con trỏ vào giữa;
- ngược lại: đứa nặng nhất đi một mình, chỉ dịch $r$.

Chạy tay đề mẫu với $x = 10$, sau sort $p = [2, 3, 7, 9]$:

| Bước | Còn lại | $p_l + p_r$ | Gondola |
|---|---|---|---|
| 1 | $2\ 3\ 7\ 9$ | $2 + 9 = 11 > 10$ | $\{9\}$ |
| 2 | $2\ 3\ 7$ | $2 + 7 = 9 \le 10$ | $\{2, 7\}$ |
| 3 | $3$ | — | $\{3\}$ |

Mỗi bước đưa một hoặc hai đứa vào đúng một gondola mới; hết $n$ đứa thì dừng — với đề mẫu là $3$ gondola.

**Định lí.** Thuật toán trên cho số gondola ít nhất.

*Chứng minh.* Dùng **phép trao đổi**: chỉ ra rằng luôn tồn tại một phương án tối ưu đi theo đúng quyết định đầu tiên của thuật toán; phần còn lại là bài toán nhỏ hơn, lặp lại theo quy nạp. Xét một phương án tối ưu bất kì, với $p_1$ nhẹ nhất và $p_n$ nặng nhất.

- Nếu $p_1 + p_n > x$: đứa nặng nhất không thể đi chung với bất kì ai, vì mọi đứa khác nặng $\ge p_1$ nên tổng luôn $\ge p_1 + p_n > x$. Nó **bắt buộc** đi một mình trong mọi phương án — trùng nhánh "một mình" của thuật toán.
- Nếu $p_1 + p_n \le x$: trong phương án đang xét, $p_1$ đi cùng $b$ (hoặc một mình), $p_n$ đi cùng $c$ (hoặc một mình). Hoán đổi: ghép $p_1$ với $p_n$, ghép $b$ với $c$ (nếu cả hai cùng tồn tại). Phần hoán đổi hợp lệ vì $p_1 + p_n \le x$ theo giả thiết, còn $b + c \le x$ thoát ra từ $b \le p_n$ (đứa nặng nhất) và $c \le x - p_n \le x - b$. Số gondola không đổi — ngoại trừ trường hợp cả hai cùng đi một mình, khi đó ghép chung còn **giảm** số gondola, mâu thuẫn với tính tối ưu của phương án gốc, tức trường hợp này không xảy ra.

Vậy luôn tồn tại phương án tối ưu trùng thuật toán ở bước đầu. Cố định bước đó, phần còn lại của phương án là một phương án hợp lệ cho các đứa trẻ còn lại; nếu nó chưa tối ưu ở bài toán con thì thay bằng phương án tối ưu của bài con, tổng số gondola còn giảm nữa — vô lí. Theo quy nạp, thuật toán tối ưu. 

Toàn bài $O(n \log n)$ cho sort và $O(n)$ cho quét.

### Sum of Two Values — tìm cặp tổng bằng x

[Sum of Two Values (CSES 1640)](https://cses.fi/problemset/task/1640) hỏi hai **chỉ số** $i \ne j$ với $a_i + a_j = x$, nên khi sort phải giữ cặp (giá trị, chỉ số gốc) — cũng chính là chỗ thứ tự từ điển của `pair` phát huy: giá trị bằng nhau sẽ tự xếp theo chỉ số. Sau sort, đặt hai con trỏ ở hai đầu rồi mỗi bước so $b_l + b_r$ với $x$:

- bằng $x$: tìm thấy đáp án;
- nhỏ hơn $x$: $b_l$ vô dụng — mọi ứng viên $b_j$ còn lại có $b_j \le b_r$ nên $b_l + b_j \le b_l + b_r < x$; loại $b_l$;
- lớn hơn $x$: $b_r$ vô dụng — mọi ứng viên còn lại có $b_j \ge b_l$ nên $b_j + b_r > x$; loại $b_r$.

**Bất biến:** mọi cặp đáp án (nếu có) luôn nằm trọn trong đoạn $[l, r]$. Đúng khi $l, r$ bao cả mảng. Khi loại $b_l$ vì tổng còn thiếu: cặp $(l, j)$ với $j$ trong $(l, r]$ đều có tổng $< x$, còn cặp $(l, j)$ với $j$ ngoài $[l, r]$ vốn đã không phải đáp án theo bất biến. Nhánh loại $b_r$ đối xứng. Vậy bất biến giữ vững; khi $l = r$ mà chưa tìm thấy thì không tồn tại đáp án. Mỗi bước bỏ hẳn một phần tử nên quét là $O(n)$ sau sort. Với $x = 8$ và $a = [2, 7, 5, 1]$: sort được $[(1,4), (2,1), (5,3), (7,2)]$, bước đầu $1 + 7 = 8$ — ngay hai chỉ số gốc $2$ và $4$.

### Sum of Three Values — cố định một, hai con trỏ

[Sum of Three Values (CSES 1641)](https://cses.fi/problemset/task/1641) cần bộ ba chỉ số có tổng bằng $x$, với $n \le 5000$ — vừa khít cho $O(n^2)$. Sort cặp (giá trị, chỉ số gốc) như trên. Với từng vị trí $i$, coi $b_i$ là phần tử **nhỏ nhất** của bộ ba và chạy đúng thuật toán hai con trỏ ở trên cho mục tiêu $x - b_i$, nhưng giới hạn hai con trỏ trong đoạn $(i, n]$. Cách gán vai trò này không bỏ sót bộ ba nào: mọi bộ ba chỉ số phân biệt, khi sắp theo giá trị tăng dần, phần tử đứng đầu của nó ở một vị trí $i$ nào đó trong mảng đã sort và hai phần tử kia ở phía sau.

Ví dụ $a = [1, 4, 5, 8, 9]$, $x = 21$: cố định $1$ thì hai con trỏ trên $[4, 5, 8, 9]$ với mục tiêu $20$ thất bại ($8 + 9$ vẫn thiếu); chuyển sang cố định $4$, mục tiêu $17$: $5 + 9$ còn thiếu, $8 + 9 = 17$ đúng — bộ ba $4, 8, 9$. Tổng chi phí $O(n^2)$.

## Cửa sổ trượt

[Playlist (CSES 1141)](https://cses.fi/problemset/task/1141) yêu cầu đoạn con **dài nhất** sao cho không có bài hát nào lặp lại trong đoạn. Hai con trỏ $l \le r$ mô tả "cửa sổ" $[l, r]$, kèm bảng đếm số lần mỗi giá trị xuất hiện trong cửa sổ:

1. tăng $r$ từng bước, thêm $k_r$ vào bảng đếm;
2. nếu $k_r$ xuất hiện lần thứ hai trong cửa sổ, tăng $l$ (bớt $k_l$ khỏi bảng đếm) tới khi hết trùng;
3. đáp án là max của $r - l + 1$.

Với mỗi $r$, thuật toán tìm được $f(r)$ = giá trị $l$ nhỏ nhất sao cho $[l, r]$ không trùng — tức cửa sổ dài nhất kết thúc tại $r$; lấy max theo mọi $r$ cho đáp án toàn cục.

**Vì sao $l$ không bao giờ phải lùi.** Nếu $[l, r]$ không trùng thì mọi cửa sổ con của nó cũng không trùng (bớt phần tử không thể tạo ra trùng lặp). Suy ra tập các $l$ hợp lệ cho $r + 1$ là tập con của tập tương ứng ở $r$, nên $f(r)$ không giảm theo $r$ — biên trái chỉ tiến, không lùi.

**Vì sao $O(n)$.** Dù hai vòng lặp lồng nhau, mỗi phần tử được thêm vào bảng đếm đúng **một lần** (khi $r$ đi qua nó) và bị bớt đi nhiều nhất **một lần** (khi $l$ đi qua nó). Tổng số thao tác thêm/bớt là $2n$, cộng $n$ lần tăng $r$ — tuyến tính $O(n)$.

Chạy tay đề mẫu $k = [1, 2, 1, 3, 2, 7, 4, 2]$:

| $r$ | $k_r$ | thu hẹp | cửa sổ | độ dài |
|---|---|---|---|---|
| 0 | 1 | — | $1$ | 1 |
| 1 | 2 | — | $1\ 2$ | 2 |
| 2 | 1 | bỏ $1$ đầu | $2\ 1$ | 2 |
| 3 | 3 | — | $2\ 1\ 3$ | 3 |
| 4 | 2 | bỏ tới hết $2$ cũ | $1\ 3\ 2$ | 3 |
| 5 | 7 | — | $1\ 3\ 2\ 7$ | 4 |
| 6 | 4 | — | $1\ 3\ 2\ 7\ 4$ | **5** |
| 7 | 2 | bỏ $1, 3, 2$ | $7\ 4\ 2$ | 3 |

Đáp án $5$. Vì $k_i$ tới $10^9$ nên bảng đếm phải là bảng băm (hoặc từ điển trong Python); muốn mảng đếm thường thì nén giá trị trước bằng sort — đúng kỹ thuật đã dùng ở Distinct Numbers.

## Tham lam theo thời điểm kết thúc

Trở lại Movie Festival. Phương án ứng viên: sort phim theo $b_i$ (giờ kết thúc) tăng dần rồi quét, chọn phim đầu tiên có giờ bắt đầu $\ge$ mốc kết thúc của phim vừa chọn. Tại sao theo giờ **kết thúc**, chứ không phải giờ bắt đầu hay thời lượng? Cả hai hướng kia đều sai: với phim $(1,10), (2,4), (5,6)$, tham lam theo giờ bắt đầu chọn ngay $(1,10)$ và chốt ở một phim, trong khi $(2,4), (5,6)$ cho hai phim; với $(1,4), (3,5), (4,7)$, tham lam theo thời lượng chọn $(3,5)$ ngắn nhất rồi không chọn được phim nào khác, còn $(1,4), (4,7)$ vẫn được hai phim.

**Định lí.** Tham lam chọn phim kết thúc sớm nhất cho số phim nhiều nhất.

*Chứng minh.* Dùng phép trao đổi. Gọi $O$ là một phương án tối ưu $k$ phim, $g$ là phim kết thúc sớm nhất trong **toàn bộ** $n$ phim — đúng lựa chọn đầu tiên của tham lam, $o$ là phim kết thúc sớm nhất trong $O$.

Mọi phim còn lại của $O$ phải bắt đầu từ $b_o$ trở đi: phim nằm gọn trước $o$ sẽ kết thúc trước $b_o$, trái với cách chọn $o$. Vì $b_g \le b_o$ (vì $g$ kết thúc sớm nhất toàn cục), thay $o$ bằng $g$ trong $O$ không tạo chồng lấn — các phim khác vẫn bắt đầu $\ge b_o \ge b_g$. Ta nhận được phương án hợp lệ vẫn $k$ phim mà bước đầu trùng tham lam.

Cố định bước đó, các phim còn lại của phương án lập thành một phương án hợp lệ cho bài toán con "các phim bắt đầu $\ge b_g$"; nếu nó chưa tối ưu ở bài con thì thay bằng phương án tối ưu của bài con, tổng số phim còn tăng — vô lí. Theo quy nạp, tham lam đạt đúng $k$. 

Chạy tay đề mẫu: sort theo giờ kết thúc được $(3,5), (5,8), (4,9)$. Chọn $(3,5)$ — mốc $5$; phim $(5,8)$ bắt đầu $5 \ge 5$, chọn — mốc $8$; phim $(4,9)$ bắt đầu $4 < 8$, bỏ. Đáp án $2$. Toàn bài $O(n \log n)$ cho sort và $O(n)$ cho quét.

## Prefix sum — đổi bài toán đoạn thành bài toán điểm

Đặt $P_0 = 0$ và $P_i = a_1 + \dots + a_i$. Tổng đoạn con liên tiếp $a_{l+1..i}$ đúng bằng $P_i - P_l$, nên [Subarray Sums II (CSES 1661)](https://cses.fi/problemset/task/1661) — đếm đoạn con có tổng $x$ — quy về: **đếm số cặp $0 \le l < i \le n$ với $P_i - P_l = x$**, tức đếm các "điểm" trước đó có giá trị $P_i - x$.

Quét $i$ từ trái sang, giữ một map đếm tần suất các giá trị prefix đã qua: tại mỗi $i$, cộng `cnt[P_i − x]` vào đáp án rồi mới thêm $P_i$ vào map. Thứ tự "hỏi trước, thêm sau" bảo đảm không tự ghép $P_i$ với chính nó khi $x = 0$. Chạy tay với $a = [2, -1, 3]$, $x = 2$: dãy prefix $0, 2, 1, 4$; tại $P_1 = 2$ có `cnt[0] = 1` (đoạn $[2]$), tại $P_3 = 4$ có `cnt[2] = 1` (đoạn $[-1, 3]$) — tổng $2$ đoạn.

Hai lưu ý về cỡ số: $x$ và $a_i$ có thể **âm** (tới $-10^9$) nên không dùng mảng đếm trực tiếp theo giá trị — map (cây tìm kiếm) là lựa chọn xác định với $O(\log n)$ mỗi thao tác, bảng băm là lựa chọn nhanh hơn nhưng chỉ trung bình; đáp án có thể tới $\frac{n(n+1)}{2} \approx 2 \cdot 10^{10}$ đoạn (cả dãy $0$ với $x = 0$) nên phải dùng 64 bit.

## Cài đặt

Mỗi bài một hàm thuần nhận dữ liệu vào và trả kết quả; `two_sum_sorted` trả `{-1, -1}` (C++) hoặc `None` (Python) khi không có đáp án — judge yêu cầu in `IMPOSSIBLE` ở trường hợp đó.

**C++**

```cpp
#include <bits/stdc++.h>

using namespace std;

typedef long long i64;
const i64 MOD = 1e9 + 7;
const int INF = 1e9 + 7;

// Ferris Wheel — số gondola ít nhất, mỗi gondola tối đa hai người có tổng ≤ x
int ferris_wheel(int n, i64 x, vector<i64> p) {
    sort(p.begin(), p.end());
    int l = 0, r = n - 1, res = 0;
    while (l <= r) {
        if (l < r && p[l] + p[r] <= x) ++l; // người nhẹ nhất ghép được với nặng nhất
        --r; // người nặng nhất của đoạn luôn chiếm một gondola
        ++res;
    }
    return res;
}

// Sum of Two Values — hai chỉ số gốc (1-based) có tổng đúng x, hoặc {-1, -1}
pair<int, int> two_sum_sorted(i64 x, const vector<i64> &a) {
    int n = (int)a.size();
    vector<pair<i64, int>> b(n);
    for (int i = 0; i < n; ++i) b[i] = {a[i], i + 1}; // (giá trị, chỉ số gốc)
    sort(b.begin(), b.end());
    int l = 0, r = n - 1;
    while (l < r) {
        i64 s = b[l].first + b[r].first;
        if (s == x) return {b[l].second, b[r].second};
        if (s < x) ++l; // tổng còn thiếu: b[l] không ghép được với ai còn lại
        else --r; // tổng bị vượt: b[r] không ghép được với ai còn lại
    }
    return {-1, -1};
}

// Movie Festival — số phim nhiều nhất không chồng lấn; movies[i] = (giờ bắt đầu, giờ kết thúc)
int movie_festival(vector<pair<i64, i64>> movies) {
    sort(movies.begin(), movies.end(), [](const pair<i64, i64> &u, const pair<i64, i64> &v) {
        return u.second < v.second; // xếp theo giờ kết thúc sớm trước
    });
    int res = 0;
    i64 lastEnd = LLONG_MIN; // giờ kết thúc của phim được chọn cuối cùng
    for (auto &[s, e] : movies)
        if (s >= lastEnd) {
            ++res;
            lastEnd = e; // phim này trở thành mốc cho lần chọn tiếp theo
        }
    return res;
}

// Playlist — độ dài đoạn con dài nhất không chứa giá trị lặp
int playlist(int n, const vector<int> &k) {
    unordered_map<int, int> cnt; // k_i tới 1e9 nên bảng đếm phải là map/băm
    int best = 0;
    for (int l = 0, r = 0; r < n; ++r) {
        ++cnt[k[r]];
        while (cnt[k[r]] > 1) { // k[r] lặp trong cửa sổ: thu hẹp biên trái
            --cnt[k[l]];
            ++l;
        }
        best = max(best, r - l + 1);
    }
    return best;
}

// Subarray Sums II — đếm đoạn con có tổng đúng x (giá trị có thể âm)
i64 subarray_sums_ii(i64 x, const vector<i64> &a) {
    map<i64, int> cnt;
    cnt[0] = 1; // tiền tố rỗng
    i64 prefix = 0, res = 0;
    for (i64 v : a) {
        prefix += v;
        auto it = cnt.find(prefix - x); // các tiền tố trước có giá trị prefix - x
        if (it != cnt.end()) res += it->second;
        ++cnt[prefix]; // hỏi trước, thêm sau: không tự ghép với chính P_i
    }
    return res;
}

void solve() {
    cout << ferris_wheel(4, 10, {7, 2, 3, 9}) << '\n';
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
def ferris_wheel(n: int, x: int, p: list[int]) -> int:
    """Số gondola ít nhất, mỗi gondola tối đa hai người có tổng trọng lượng ≤ x."""
    q = sorted(p)
    l, r, res = 0, n - 1, 0
    while l <= r:
        if l < r and q[l] + q[r] <= x:
            l += 1  # người nhẹ nhất ghép được với người nặng nhất
        r -= 1  # người nặng nhất của đoạn luôn chiếm một gondola
        res += 1
    return res


def two_sum_sorted(x: int, a: list[int]) -> tuple[int, int] | None:
    """Hai chỉ số gốc (1-based) có tổng đúng x, hoặc None nếu không tồn tại."""
    b = sorted((v, i + 1) for i, v in enumerate(a))  # (giá trị, chỉ số gốc)
    l, r = 0, len(b) - 1
    while l < r:
        s = b[l][0] + b[r][0]
        if s == x:
            return b[l][1], b[r][1]
        if s < x:
            l += 1  # tổng còn thiếu: b[l] không ghép được với ai còn lại
        else:
            r -= 1  # tổng bị vượt: b[r] không ghép được với ai còn lại
    return None


def movie_festival(movies: list[tuple[int, int]]) -> int:
    """Số phim nhiều nhất xem được, không bộ nào chồng lấn."""
    ms = sorted(movies, key=lambda m: m[1])  # xếp theo giờ kết thúc
    res = 0
    last_end = float("-inf")  # giờ kết thúc của phim được chọn cuối cùng
    for s, e in ms:
        if s >= last_end:
            res += 1
            last_end = e  # phim này trở thành mốc cho lần chọn tiếp theo
    return res


def playlist(n: int, k: list[int]) -> int:
    """Độ dài đoạn con dài nhất không chứa giá trị lặp."""
    cnt: dict[int, int] = {}
    best = 0
    l = 0
    for r in range(n):
        cnt[k[r]] = cnt.get(k[r], 0) + 1
        while cnt[k[r]] > 1:  # k[r] lặp trong cửa sổ: thu hẹp biên trái
            cnt[k[l]] -= 1
            l += 1
        best = max(best, r - l + 1)
    return best


def subarray_sums_ii(x: int, a: list[int]) -> int:
    """Đếm số đoạn con liên tiếp có tổng đúng bằng x (giá trị có thể âm)."""
    cnt: dict[int, int] = {0: 1}  # tiền tố rỗng
    prefix = 0
    res = 0
    for v in a:
        prefix += v
        res += cnt.get(prefix - x, 0)  # các tiền tố trước có giá trị prefix - x
        cnt[prefix] = cnt.get(prefix, 0) + 1  # hỏi trước, thêm sau
    return res
```

## Bài tập luyện

- [Distinct Numbers (CSES 1621)](https://cses.fi/problemset/task/1621): đếm giá trị phân biệt bằng sort rồi đếm đoạn liên tiếp bằng nhau.
- [Ferris Wheel (CSES 1090)](https://cses.fi/problemset/task/1090): ghép nặng nhất với nhẹ nhất để tối thiểu số gondola.
- [Sum of Two Values (CSES 1640)](https://cses.fi/problemset/task/1640): hai con trỏ tìm cặp tổng bằng x trên mảng đã sort.
- [Sum of Three Values (CSES 1641)](https://cses.fi/problemset/task/1641): cố định một phần tử rồi hai con trỏ, $O(n^2)$.
- [Movie Festival (CSES 1629)](https://cses.fi/problemset/task/1629): tham lam chọn phim kết thúc sớm nhất.
- [Playlist (CSES 1141)](https://cses.fi/problemset/task/1141): cửa sổ trượt dài nhất không lặp.
- [Apartments (CSES 1084)](https://cses.fi/problemset/task/1084): sort hai dãy rồi hai con trỏ ghép người với căn hộ chênh lệch ≤ k.
- [Concert Tickets (CSES 1091)](https://cses.fi/problemset/task/1091): multiset và lower_bound, mỗi khách mua vé đắt nhất vừa túi tiền.
- [Restaurant Customers (CSES 1619)](https://cses.fi/problemset/task/1619): sort sự kiện vào/ra rồi quét cộng dồn.
- [Subarray Sums II (CSES 1661)](https://cses.fi/problemset/task/1661): đếm cặp tiền tố hiệu x bằng map.

## Nguồn

- <https://oj.chuyentin.pro/wiki/sap-xep-va-tim-kiem/>
- <https://oj.chuyentin.pro/wiki/two-pointers/>
- <https://cses.fi/problemset/>
