---
title: FFT và NTT — nhân đa thức trong O(n \log n)
date: 2026-10-30 06:00:00
description: Nhân đa thức trong O(n log n) bằng FFT chia để trị, NTT trên modul thân thiện, Garner bốn modul cho modul bất kì, và đánh giá đa thức tại các điểm liên tiếp bằng một phép nhân.
tags: [polynomial, fft, ntt, convolution, garner, cpp]
tree: [da-thuc, tich-chap]
---

_Bài này mở đầu chuỗi **Đa thức**, nền cho các bài sau như [binomial mod P](/posts/binomial-mod-p/) và [binomial mod m](/posts/binomial-mod-m/)._

## Đề bài

Cho hai đa thức $A(x) = \sum_{i<n} a_i x^i$ và $B(x) = \sum_{j<m} b_j x^j$, tính hệ số của $C = A \cdot B$, lấy modulo $M$:


$$
c_k \;=\; \sum_{i+j=k} a_i b_j \qquad (0 \le k < n+m-1).
$$


Đây là **tích chập** (convolution): mọi bài "với mỗi $k$, đếm số cặp $(i, j)$ sao cho $i + j = k$" đều về dạng này. Nhân ngây thơ từng cặp hệ số tốn $O(nm)$ — với $n = m = 5 \cdot 10^5$ (giới hạn của bài Convolution, Library Checker) là $2{,}5 \cdot 10^{11}$ phép, hàng trăm giây. Mục tiêu: $O(n \log n)$.

Bài này chỉ làm việc với $n$ là **luỹ thừa của 2** (pad số 0 cho đủ); phần khác chỉ là độ dài mảng.

## Hai miền: hệ số và giá trị

Một đa thức bậc $< n$ được xác định **duy nhất** bởi giá trị của nó tại $n$ điểm phân biệt: nếu hai đa thức bậc $< n$ đồng nhất tại $n$ điểm thì hiệu của chúng — bậc $< n$ — có $n$ nghiệm, buộc phải là đa thức không (một đa thức khác không bậc $d$ có không quá $d$ nghiệm). Hai điểm định một đường thẳng, ba điểm định một parabol.

Ở **miền giá trị**, phép nhân đa thức trở nên rẻ: $C(t) = A(t) \cdot B(t)$ chỉ là nhân hai con số tại mỗi điểm. Chiến lược ba bước:

1. **Đánh giá** $A, B$ tại $n + m - 1$ điểm;
2. **Nhân từng cặp** giá trị — $O(n)$;
3. **Nội suy** ngược lại hệ số của $C$.

Chọn điểm tùy tiện thì bước 1 và 3 vẫn $O(n^2)$. Phép màu nằm ở việc chọn điểm: **các nghiệm của $x^n = 1$**.

## Chọn điểm là các căn đơn vị

Gọi $\omega$ là **căn nguyên thủy bậc $n$ của đơn vị**: $\omega^n = 1$ và $\omega^k \ne 1$ với $0 < k < n$. Trên $\mathbb{C}$ thì $\omega = e^{2\pi i/n}$, các điểm đánh giá là $n$ đỉnh đều nhau trên đường tròn đơn vị. Điều làm tập điểm này đặc biệt là phép **bình phương thu nó về chính nó ở kích thước nửa**:


$$
\{(\omega^k)^2 : k = 0..n-1\} \;=\; \{\text{các căn bậc } n/2\},
$$


vì $\omega^2$ đúng là căn nguyên thủy bậc $n/2$ ($n$ chẵn). Chính tính "tự giống ở nửa" này nuôi được chia để trị.

**Biến đổi Fourier rời rạc (DFT)** của dãy $a$ là việc đánh giá $A$ tại các lũy thừa đó:


$$
\mathrm{DFT}(a)_k = A(\omega^k) = \sum_{j=0}^{n-1} a_j\, \omega^{kj}.
$$


## Định lí tích chập

**Định lí.** $\mathrm{DFT}(a \ast b) = \mathrm{DFT}(a) \cdot \mathrm{DFT}(b)$ (nhân theo từng vị trí).

*Chứng minh.* Đặt $c = a \ast b$, tức $c_t = \sum_{i+j=t} a_i b_j$. Tại điểm $\omega^k$:


$$
\sum_t c_t \omega^{kt} = \sum_t \sum_{i+j=t} a_i b_j\, \omega^{k(i+j)}
= \sum_i \sum_j a_i b_j\, \omega^{ki}\omega^{kj}
= \Big(\sum_i a_i \omega^{ki}\Big)\Big(\sum_j b_j \omega^{kj}\Big).
$$


Hai vế đúng là $A(\omega^k) \cdot B(\omega^k)$. 

Vậy để nhân đa thức: DFT hai dãy, nhân từng vị trí, rồi "DFT ngược". Chỉ còn hai việc: biến đổi nhanh, và hiểu biến đổi ngược.

## Biến đổi ngược

**Bổ đề (tổng lũy thừa).** Nếu $\omega$ nguyên thủy bậc $n$ và $n \nmid s$ thì $\sum_{j=0}^{n-1} \omega^{sj} = 0$.

*Chứng minh.* Đặt $T = \sum_j \omega^{sj}$. Vì $n \nmid s$ nên $\omega^s \ne 1$, do đó


$$
\omega^s \cdot T = \sum_{j=1}^{n} \omega^{sj} = T \quad (\text{các số hạng chỉ dịch vòng})
\;\Longrightarrow\; (\omega^s - 1)\,T = 0 \;\Longrightarrow\; T = 0. \;
$$


**Định lí (nghịch đảo DFT).** $\mathrm{IDFT}(y) = \frac{1}{n}\,\mathrm{DFT}_{\omega^{-1}}(y)$.

*Chứng minh.* Ghép hai biến đổi theo ma trận Vandermonde $V = (\omega^{kj})_{k,j}$: DFT thuận là $y = Va$; DFT với $\omega^{-1}$ là ma trận $V' = (\omega^{-kj})$. Tích chéo


$$
(V'V)_{k,k'} = \sum_{j} \omega^{-kj}\omega^{k'j} = \sum_j \omega^{(k'-k)j}
= \begin{cases} n & k = k', \\ 0 & k \ne k' \end{cases}
$$


theo bổ đề trên. Vậy $V'V = nI$, tức $a = \frac{1}{n}V'y$. 

Nói cách ngoài ma trận: biến đổi ngược **giống hệt biến đổi xuôi**, chỉ đổi $\omega \to \omega^{-1}$ và chia cuối cho $n$ — hai tính chất này là toàn bộ những gì ta cần từ "số phức" hay "trường số", và cả hai đều thuần đại số.

## FFT: chia để trị theo chẵn/lẻ

Tách $A(x) = A_0(x^2) + x \cdot A_1(x^2)$ với $A_0, A_1$ lần lượt gom các hệ số chẵn, lẻ — hai đa thức bậc $< n/2$. Với $k < n/2$:


$$
A(\omega^k) = A_0(\omega^{2k}) + \omega^k A_1(\omega^{2k}),
$$


và tại điểm đối xứng $\omega^{k+n/2} = -\omega^k$ (bởi $\omega^{n/2}$ là căn bậc hai của 1 mà khác 1):


A(\omega^{k+n/2}) = A_0(\omega^{2(k+n/2)}) + \omega^{k+n/2} A_1(\omega^{2(k+n/2)})
= A_0(\omega^{2k}) - \omega^k A_1(\omega^{2k}).


Hai giá trị đầu-cuối **dùng chung** $A_0(\omega^{2k}), A_1(\omega^{2k})$ — hai đánh giá nửa kích thước (nhớ rằng $\omega^2$ là căn nguyên thủy bậc $n/2$, nên đây chính là DFT của hai dãy con). Cặp công thức $u + v,\ u - v$ gọi là **butterfly**:


$$
T(n) = 2\,T(n/2) + O(n) \;\Longrightarrow\; O(n \log n).
$$


Sơ đồ cho $n = 4$ (đã sắp theo đảo bit ở đầu vào):

<div class="diagram">
<svg viewBox="0 0 560 240" width="100%" role="img" aria-label="Sơ đồ butterfly cho n bằng 4: sau hoán vị đảo bit, tầng len bằng 2 gộp từng cặp bằng phép cộng trừ, tầng len bằng 4 gộp hai nửa với twiddle omega"><text x="70" y="25" font-size="11" fill="currentColor" opacity="0.75" text-anchor="middle">đã đảo bit</text><text x="185" y="25" font-size="11" fill="currentColor" opacity="0.75" text-anchor="middle">tầng len = 2</text><text x="405" y="25" font-size="11" fill="currentColor" opacity="0.75" text-anchor="middle">tầng len = 4</text><g stroke="#3b82f6" stroke-width="1.8" fill="none"><line x1="70" y1="50" x2="300" y2="50"/><line x1="70" y1="50" x2="300" y2="100" stroke-dasharray="4 3"/><line x1="70" y1="100" x2="300" y2="50" stroke-dasharray="4 3"/><line x1="70" y1="100" x2="300" y2="100"/><line x1="70" y1="150" x2="300" y2="150"/><line x1="70" y1="150" x2="300" y2="200" stroke-dasharray="4 3"/><line x1="70" y1="200" x2="300" y2="150" stroke-dasharray="4 3"/><line x1="70" y1="200" x2="300" y2="200"/><line x1="300" y1="50" x2="510" y2="50"/><line x1="300" y1="50" x2="510" y2="150" stroke-dasharray="4 3"/><line x1="300" y1="150" x2="510" y2="50" stroke-dasharray="4 3"/><line x1="300" y1="150" x2="510" y2="150"/><line x1="300" y1="100" x2="510" y2="100"/><line x1="300" y1="100" x2="510" y2="200" stroke-dasharray="4 3"/><line x1="300" y1="200" x2="510" y2="100" stroke-dasharray="4 3"/><line x1="300" y1="200" x2="510" y2="200"/></g><g font-size="10.5" font-weight="700" fill="#f59e0b"><text x="272" y="82">−</text><text x="272" y="72">−</text><text x="272" y="182">−</text><text x="272" y="172">−</text><text x="482" y="112">−</text><text x="482" y="118">−</text></g><g font-size="10.5" font-weight="700" fill="#10b981"><text x="352" y="212" text-anchor="middle">×ω</text><text x="352" y="92" text-anchor="middle">×ω</text></g><g><circle cx="70" cy="50" r="5" fill="#9aa4b2"/><circle cx="70" cy="100" r="5" fill="#9aa4b2"/><circle cx="70" cy="150" r="5" fill="#9aa4b2"/><circle cx="70" cy="200" r="5" fill="#9aa4b2"/><circle cx="300" cy="50" r="4" fill="currentColor" fill-opacity="0.45"/><circle cx="300" cy="100" r="4" fill="currentColor" fill-opacity="0.45"/><circle cx="300" cy="150" r="4" fill="currentColor" fill-opacity="0.45"/><circle cx="300" cy="200" r="4" fill="currentColor" fill-opacity="0.45"/><circle cx="510" cy="50" r="5" fill="#3b82f6"/><circle cx="510" cy="100" r="5" fill="#3b82f6"/><circle cx="510" cy="150" r="5" fill="#3b82f6"/><circle cx="510" cy="200" r="5" fill="#3b82f6"/></g><g font-size="12" font-weight="700" fill="currentColor"><text x="40" y="54" text-anchor="end">a₀</text><text x="40" y="104" text-anchor="end">a₂</text><text x="40" y="154" text-anchor="end">a₁</text><text x="40" y="204" text-anchor="end">a₃</text><text x="528" y="54">X₀</text><text x="528" y="104">X₁</text><text x="528" y="154">X₂</text><text x="528" y="204">X₃</text></g></svg>
</div>

Kiểm bằng tay: $X_1 = (a_0 - a_2) + \omega\,(a_1 - a_3)$ và $X_3 = (a_0 - a_2) - \omega\,(a_1 - a_3)$ — chẵn lẻ đúng như hai công thức butterfly với $k = 1$.

Bản đệ quy trên số phức (đúng như ba công thức trên, phần nghịch đảo chia dần $n$ lần $\div 2$):

```cpp
#include <bits/stdc++.h>

using namespace std;

typedef long long i64;
const i64 MOD = 1e9 + 7;
const int INF = 1e9 + 7;

using cd = complex<double>;
const double PI = acos(-1.0);

// a chứa hệ số (độ dài là luỹ thừa 2); invert = true là bản ngược
void fft(vector<cd> &a, bool invert) {
    int n = (int)a.size();
    if (n == 1) return;
    vector<cd> a0(n / 2), a1(n / 2);
    for (int i = 0; 2 * i < n; ++i) a0[i] = a[2 * i], a1[i] = a[2 * i + 1];
    fft(a0, invert);
    fft(a1, invert);
    double ang = 2 * PI / n * (invert ? -1 : 1);
    cd w(1), wn(cos(ang), sin(ang));
    for (int i = 0; 2 * i < n; ++i) {
        a[i] = a0[i] + w * a1[i];
        a[i + n / 2] = a0[i] - w * a1[i];
        if (invert) a[i] /= 2, a[i + n / 2] /= 2;
        w *= wn;
    }
}

void solve() {
    // Nhân (1 + 2x)(3 + 4x) = 3 + 10x + 8x^2: DFT hai dãy, nhân từng vị trí, DFT ngược
    vector<cd> a = {1, 2, 0, 0}, b = {3, 4, 0, 0};
    fft(a, false); fft(b, false);
    for (int i = 0; i < 4; ++i) a[i] *= b[i];
    fft(a, true);
    for (int i = 0; i < 3; ++i) cout << llround(a[i].real()) << " \n"[i == 2];
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

## Khử đệ quy: hoán vị đảo bit

Đệ quy ở tầng ngoài cùng tách mảng theo **bit thấp nhất** của chỉ số (chẵn sang trái, lẻ sang phải), tầng tiếp theo tách theo bit thấp thứ hai, v.v. Nếu ta **đảo thứ tự bit** của mọi chỉ số trước, thì mỗi "cuộc gọi đệ quy" nằm gọn trên một đoạn liên tiếp — và các tầng chạy từ dưới lên: gộp các đoạn độ dài 2, rồi 4, rồi 8… Với $n = 8$, thứ tự sau đảo bit là $(a_0, a_4, a_2, a_6, a_1, a_5, a_3, a_7)$ — chính là thứ tự các lá của cây đệ quy từ trái sang phải.

```cpp
#include <bits/stdc++.h>

using namespace std;

typedef long long i64;
const i64 MOD = 1e9 + 7;
const int INF = 1e9 + 7;

using ull = unsigned long long;

template<unsigned mod_>
struct mint {
    static constexpr unsigned mod = mod_;
    unsigned x;
    constexpr mint() : x(0U) {}
    constexpr mint(unsigned x_) : x(x_ % mod) {}
    constexpr mint(ull x_) : x(x_ % mod) {}
    constexpr mint(int x_) : x(((x_ %= static_cast<int>(mod)) < 0) ? (x_ + static_cast<int>(mod)) : x_) {}
    constexpr mint(i64 x_) : x(((x_ %= static_cast<i64>(mod)) < 0) ? (x_ + static_cast<i64>(mod)) : x_) {}
    mint &operator += (const mint &a) { x = ((x += a.x) >= mod) ? (x - mod) : x; return *this; }
    mint &operator -= (const mint &a) { x = ((x += mod - a.x) >= mod) ? (x - mod) : x; return *this; }
    mint &operator *= (const mint &a) { x = (static_cast<ull>(x) * a.x) % mod; return *this; }
    mint &operator /= (const mint &a) { return (*this *= a.inv()); }
    mint pow(i64 e) const {
        if (e < 0) return inv().pow(-e);
        mint a = *this, b = 1U; for (; e; e >>= 1) { if (e & 1) b *= a; a *= a; }
        return b;
    }
    mint inv() const {
        unsigned a = mod, b = x; int y = 0, z = 1;
        for (; b; ) { const unsigned q = a / b; const unsigned c = a - q * b; a = b; b = c; const int w = y - static_cast<int>(q) * z; y = z; z = w; }
        assert(a == 1U); return mint(y);
    }
    mint operator + () const { return *this; }
    mint operator - () const { mint a; a.x = x ? (mod - x) : 0U; return a; }
    mint operator + (const mint &a) const { return (mint(*this) += a); }
    mint operator - (const mint &a) const { return (mint(*this) -= a); }
    mint operator * (const mint &a) const { return (mint(*this) *= a); }
    mint operator / (const mint &a) const { return (mint(*this) /= a); }
    template <class T> friend mint operator + (T a, const mint &b) { return (mint(a) += b); }
    template <class T> friend mint operator - (T a, const mint &b) { return (mint(a) -= b); }
    template <class T> friend mint operator * (T a, const mint &b) { return (mint(a) *= b); }
    template <class T> friend mint operator / (T a, const mint &b) { return (mint(a) /= b); }
    explicit operator bool() const { return x; }
    bool operator == (const mint &a) const { return (x == a.x); }
    bool operator != (const mint &a) const { return (x != a.x); }
    friend ostream &operator << (ostream &os, const mint &a) { return os << a.x; }
};

/// Nguyên tố P = a * 2^b + 1 với g là phần tử sinh (P < 2^31)
template <unsigned PRIME> struct proth_prime {};
template <> struct proth_prime< 998244353> { static constexpr int a =     7 * 17, b = 23, g =  3; };
template <> struct proth_prime< 985661441> { static constexpr int a =     5 * 47, b = 22, g =  3; };
template <> struct proth_prime< 943718401> { static constexpr int a = 3 * 3 * 5 * 5, b = 22, g =  7; };
template <> struct proth_prime< 935329793> { static constexpr int a =        223, b = 22, g =  3; };

template <unsigned PRIME>
void ntt(vector<mint<PRIME>> &a, bool inv) {
    int n = (int)a.size();
    int L = __builtin_ctz(n);
    vector<int> rev(n);
    for (int i = 1; i < n; ++i) rev[i] = (rev[i >> 1] >> 1) | ((i & 1) << (L - 1));
    for (int i = 0; i < n; ++i) if (i < rev[i]) swap(a[i], a[rev[i]]);
    for (int len = 2; len <= n; len <<= 1) {
        mint<PRIME> wlen = mint<PRIME>(proth_prime<PRIME>::g)
                       .pow(inv ? (PRIME - 1) - (PRIME - 1) / len : (PRIME - 1) / len);
        for (int i = 0; i < n; i += len) {
            mint<PRIME> w = 1;
            for (int j = 0; j < len / 2; ++j) {
                mint<PRIME> u = a[i + j], v = a[i + j + len / 2] * w;
                a[i + j] = u + v;                 // bước butterfly
                a[i + j + len / 2] = u - v;
                w *= wlen;
            }
        }
    }
    if (inv) {
        mint<PRIME> ninv = mint<PRIME>(n).inv();
        for (auto &x : a) x *= ninv;
    }
}

void solve() {
    // Nhân (1 + 2x + 3x^2)(4 + 5x) = 4 + 13x + 22x^2 + 15x^3 trên F_998244353
    vector<mint<998244353>> a = {1, 2, 3, 0}, b = {4, 5, 0, 0};
    ntt(a, false); ntt(b, false);
    for (int i = 0; i < 4; ++i) a[i] *= b[i];
    ntt(a, true);
    for (int i = 0; i < 4; ++i) cout << a[i].x << " \n"[i == 3];
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

Một biến thể mình dùng trong bài [binomial mod m](/posts/binomial-mod-m/) bỏ luôn bảng đảo bit: mỗi tầng ghi kết quả sang **buffer phụ** theo con số "nửa đầu/nửa sau" (`b[i/2 + j]`, `b[n/2 + i/2 + j]`) rồi swap hai buffer — cũng là trải trực tiếp của đệ quy, khỏi cần biết tới khái niệm đảo bit.

**Những lỗi hay gặp** (đều từ kinh nghiệm dính đòn của mình):

- quên `long long` ở các phép nhân trung gian — tràn im lặng;
- butterfly dưới thiếu `+ MOD` — hệ số âm lan tràn;
- không pad đủ tới luỹ thừa của 2 và đủ $n + m - 1$ hệ số — DFT làm việc **theo vòng** modulo $x^n - 1$: thiếu chỗ là hệ số cao cuộn về cộng nhầm vào hệ số thấp;
- dùng Fermat $x^{M-2}$ để nghịch đảo $n$ khi $M$ không nguyên tố — sai.

## NTT: đổi "số phức" thành "trường hữu hạn"

FFT trên `double` có **sai số làm tròn**; hệ số cần giữ chính xác modulo $M$ thì phải làm tròn (`llround`) và chỉ tin được khi hệ số tích nhỏ (mức $10^{14}{-}10^{15}$ tùy cỡ $n$). Câu hỏi: chỗ nào trong phép chứng minh trên đã dùng tính chất của $\mathbb{C}$?

Soi lại: ta cần (1) một phần tử $\omega$ có $\omega^n = 1$, $\omega^k \ne 1$ với $0 < k < n$; (2) bổ đề tổng lũy thừa; (3) tồn tại $\omega^{-1}$ để đảo biến đổi; (4) chia cho $n$ được. Tất cả đều là **đại số trường**. Vậy thay $\mathbb{C}$ bằng trường $\mathbb{F}_p$ với $p$ nguyên tố:

**Định lí (nhóm nhân $\mathbb{F}_p^*$ là cyclic).** Với mọi ước $d$ của $p - 1$, gọi $\psi(d)$ là số phần tử của $\mathbb{F}_p^*$ có bậc đúng $d$. Nếu tồn tại một phần tử $a$ bậc $d$ thì mọi nghiệm của $x^d = 1$ nằm trong $\{1, a, \dots, a^{d-1}\}$ — vì đa thức bậc $d$ có tối đa $d$ nghiệm mà đây đã là $d$ nghiệm phân biệt; trong đó các phần tử bậc đúng $d$ là $a^k$ với $\gcd(k, d) = 1$, tức đúng $\varphi(d)$ cái. Vậy $\psi(d) \le \varphi(d)$. Mặt khác mọi phần tử có bậc là ước nào đó của $p - 1$ (định lí Lagrange), nên


$$
p - 1 = \sum_{d \mid p-1} \psi(d) \;\le\; \sum_{d \mid p-1} \varphi(d) = p - 1,
$$


buộc $\psi(d) = \varphi(d)$ trên mọi ước. Đặc biệt $\psi(p-1) = \varphi(p-1) \ge 1$: tồn tại **phần tử sinh** $g$. 

Từ đó mọi thứ xếp vào nhau như một chuỗi domino:

- **Bậc của $g^k$ là $\dfrac{p-1}{\gcd(p-1, k)}$**: $(g^k)^m = 1 \Leftrightarrow (p-1) \mid km \Leftrightarrow \frac{p-1}{\gcd} \mid m$.
- Căn nguyên thủy bậc $n$ tồn tại **khi và chỉ khi** $n \mid p - 1$: bậc phải chia $p-1$ theo Lagrange; ngược lại $\omega = g^{(p-1)/n}$ có bậc đúng $n$.
- $\omega^{-1}$ tồn tại (trường), $\frac1n$ hiểu là $n^{-1} \bmod p$ (và $n < p$ nên $n$ khả nghịch).

Đây là khác biệt căn bản với $\mathbb{C}$: trên số phức, $\omega_n$ tồn tại với **mọi** $n$; trên $\mathbb{F}_p$, chỉ khi $n \mid p-1$. Với $n$ là luỹ thừa 2 cỡ $2^{20}$ trở lên, $p$ phải có dạng


$$
p = a \cdot 2^b + 1 \qquad (b \ge \log_2 n, \; p \text{ nguyên tố}),
$$


người ta gọi quen thuộc là **modul thân thiện NTT**. Bộ bốn modul mình dùng trong cả chuỗi:

| $p$ | phân tích $p - 1$ | phần tử sinh $g$ | NTT tới |
| --- | --- | --- | --- |
| 998244353 | $119 \cdot 2^{23}$ | 3 | $2^{23}$ |
| 985661441 | $235 \cdot 2^{22}$ | 3 | $2^{22}$ |
| 943718401 | $225 \cdot 2^{22}$ | 7 | $2^{22}$ |
| 935329793 | $223 \cdot 2^{22}$ | 3 | $2^{22}$ |

Tính toán trên $\mathbb{F}_p$ không có sai số: kết quả NTT **chính xác tuyệt đối** theo modulo, và $998244353$ đủ dùng cho đa thức tới $2^{23} \approx 8 \cdot 10^6$ hệ số.

## Modul bất kì: Garner nhiều modul

$10^9+7$ không có dạng $a \cdot 2^b + 1$ — không chạy NTT trực tiếp được. Lối thoát: nhân trên **vài modul thân thiện** rồi ghép bằng CRT. Hệ số thật của tích bị chặn


|c_k| \;<\; \min(n, m) \cdot M^2 \;\le\; 2^{21} \cdot (10^{11})^2 \approx 2 \cdot 10^{28},


trong khi tích bốn modul trên $\approx 8{,}6 \cdot 10^{35}$ — dư sức. Garner ghép theo kiểu "mỗi modulo biết thêm một chữ số":

```cpp
#include <bits/stdc++.h>

using namespace std;

typedef long long i64;
const i64 MOD = 1e9 + 7;
const int INF = 1e9 + 7;

using ull = unsigned long long;
using u128 = __uint128_t;

template<unsigned mod_>
struct mint {
    static constexpr unsigned mod = mod_;
    unsigned x;
    constexpr mint() : x(0U) {}
    constexpr mint(unsigned x_) : x(x_ % mod) {}
    constexpr mint(ull x_) : x(x_ % mod) {}
    constexpr mint(int x_) : x(((x_ %= static_cast<int>(mod)) < 0) ? (x_ + static_cast<int>(mod)) : x_) {}
    constexpr mint(i64 x_) : x(((x_ %= static_cast<i64>(mod)) < 0) ? (x_ + static_cast<i64>(mod)) : x_) {}
    mint &operator += (const mint &a) { x = ((x += a.x) >= mod) ? (x - mod) : x; return *this; }
    mint &operator -= (const mint &a) { x = ((x += mod - a.x) >= mod) ? (x - mod) : x; return *this; }
    mint &operator *= (const mint &a) { x = (static_cast<ull>(x) * a.x) % mod; return *this; }
    mint &operator /= (const mint &a) { return (*this *= a.inv()); }
    mint pow(i64 e) const {
        if (e < 0) return inv().pow(-e);
        mint a = *this, b = 1U; for (; e; e >>= 1) { if (e & 1) b *= a; a *= a; }
        return b;
    }
    mint inv() const {
        unsigned a = mod, b = x; int y = 0, z = 1;
        for (; b; ) { const unsigned q = a / b; const unsigned c = a - q * b; a = b; b = c; const int w = y - static_cast<int>(q) * z; y = z; z = w; }
        assert(a == 1U); return mint(y);
    }
    mint operator + () const { return *this; }
    mint operator - () const { mint a; a.x = x ? (mod - x) : 0U; return a; }
    mint operator + (const mint &a) const { return (mint(*this) += a); }
    mint operator - (const mint &a) const { return (mint(*this) -= a); }
    mint operator * (const mint &a) const { return (mint(*this) *= a); }
    mint operator / (const mint &a) const { return (mint(*this) /= a); }
    template <class T> friend mint operator + (T a, const mint &b) { return (mint(a) += b); }
    template <class T> friend mint operator - (T a, const mint &b) { return (mint(a) -= b); }
    template <class T> friend mint operator * (T a, const mint &b) { return (mint(a) *= b); }
    template <class T> friend mint operator / (T a, const mint &b) { return (mint(a) /= b); }
    explicit operator bool() const { return x; }
    bool operator == (const mint &a) const { return (x == a.x); }
    bool operator != (const mint &a) const { return (x != a.x); }
    friend ostream &operator << (ostream &os, const mint &a) { return os << a.x; }
};

// modul đích (kết quả cuối cùng) và nhân modulo an toàn tràn
ull P;
ull mul(ull A, ull B) {
    A %= P, B %= P;
    return (u128)A * B % P;
}

template <unsigned MOD1, unsigned MOD2, unsigned MOD3, unsigned MOD4>
i64 garner4(mint<MOD1> a1, mint<MOD2> a2, mint<MOD3> a3, mint<MOD4> a4) {
    static const auto r12 = mint<MOD2>(MOD1).inv();
    static const auto r13 = mint<MOD3>(MOD1).inv();
    static const auto r14 = mint<MOD4>(MOD1).inv();
    static const auto r23 = mint<MOD3>(MOD2).inv();
    static const auto r24 = mint<MOD4>(MOD2).inv();
    static const auto r34 = mint<MOD4>(MOD3).inv();
    a2 = (a2 - a1.x) * r12;
    a3 = (a3 - a1.x) * r13;
    a3 = (a3 - a2.x) * r23;
    a4 = (a4 - a1.x) * r14;
    a4 = (a4 - a2.x) * r24;
    a4 = (a4 - a3.x) * r34;
    return (a1.x + mul(a2.x, MOD1) + mul(mul(a3.x, MOD1), MOD2)
              + mul(mul(a4.x, MOD1), mul(MOD2, MOD3))) % P;
}

void solve() {
    // Ghép lại x = 123456789123456789 từ bốn residue modulo bốn nguyên tố thân thiện NTT
    P = (ull)1e18;
    i64 x = 123456789123456789LL;
    cout << garner4<998244353, 985661441, 943718401, 935329793>(
        mint<998244353>(x), mint<985661441>(x), mint<943718401>(x), mint<935329793>(x)) << '\n';
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

(Toàn bộ tính theo modulo đích `P` — xem bài [binomial mod m](/posts/binomial-mod-m/) để gặp đúng ngữ cảnh này với $P \approx 10^{11}$.) Một phương án khác không cần nhiều modul: tách mỗi hệ số thành phần cao/thấp theo $\sqrt{M}$ rồi trở lại FFT số phức — chỉ bốn biến đổi cho cả phép nhân. Nó nhanh hơn Garner gần năm lần; cái giá là phải thương lượng với sai số làm tròn. Mục tiếp theo.

## FFT mod — tách hệ số theo √mod, bốn FFT thay vì Garner

Garner mua tính chính xác tuyệt đối bằng mười hai lượt biến đổi (bốn modul × ba lượt xuôi–ngược) cộng thêm mạch ghép. Lối thứ hai cho bài toán modul bất kì đi ngược hướng: quay lại đúng chỗ ta từng rời bỏ — số phức và sai số làm tròn — nhưng thu nhỏ hệ số trước khi nhảy, sao cho kết quả nguyên vẫn nổi nguyên vẹn qua `llround`. Không cần $M$ nguyên tố, không cần dạng $a \cdot 2^b + 1$, không cần mạch trộn modul (CRT mini hai modul kiểu [binomial mod P](/posts/binomial-mod-p/) hay Garner bốn modul như phía trên): $M$ chỉ cần là một con số.

**Tách hệ số theo căn.** Đặt $c = \lfloor\sqrt{M}\rfloor$ — căn *nguyên* của $M$, không phải căn bậc hai *modulo* (chuyện của bài [discrete sqrt](/posts/discrete-sqrt-log/)) — và viết mỗi hệ số dưới "cơ số $c$":

$$
a_i = h_i \cdot c + \ell_i \qquad h_i = \lfloor a_i / c \rfloor, \quad \ell_i = a_i \bmod c, \qquad \ell_i < c, \quad h_i \le c + 1
$$

($h_i \le c+1$ vì $a_i < M < (c+1)^2$.) Viết $H_a$, $L_a$ cho hai đa thức có hệ số $h_i$, $\ell_i$ (và $H_b$, $L_b$), khai triển ra đúng ba tích cần tính:

$$
C \;=\; H_a H_b \cdot c^2 \;+\; \left(H_a L_b + L_a H_b\right) \cdot c \;+\; L_a L_b .
$$

Giá trị của kĩ thuật nằm ở hai chiêu gói nối tiếp đưa cả phép nhân về **đúng bốn biến đổi**.

**Chiêu 1 — gói khi đánh giá.** Gom $P(x) = H_a(x) + i\,L_a(x)$ thành một đa thức có hệ số phức: một biến đổi phục cả hai dãy. Vì $H_a$, $L_a$ có hệ số thực, tại chỉ số đối $j \equiv -i \pmod n$ liên hợp lọt vào trong tổng: $\mathrm{DFT}(H_a)[j] = \sum h_k \omega^{-ik} = \overline{\mathrm{DFT}(H_a)[i]}$. Suy ra

$$
\mathrm{DFT}(H_a)[i] = \tfrac{1}{2}\bigl(L[i] + \overline{L[j]}\bigr), \qquad \mathrm{DFT}(L_a)[i] = \tfrac{1}{2i}\bigl(L[i] - \overline{L[j]}\bigr)
$$

với $L = \mathrm{DFT}(P)$ — chính là mẹo "FFT hai dãy một lần", áp dụng cho cả $R = \mathrm{DFT}(H_b + i\,L_b)$.

**Chiêu 2 — gói khi nhân.** Đặt $p = L[i] + \overline{L[j]}$, $q = L[i] - \overline{L[j]}$, và $r$, $s$ đọc từ $R$ tương tự. Thế bốn công thức trên vào từng tích, gộp hai tích "chẵn" vào một mảng và phần "chéo" vào mảng kia:

$$
\mathrm{outl}[i] = \mathrm{DFT}(H_a H_b)[i] + i \cdot \mathrm{DFT}(L_a L_b)[i] = \frac{p\,r - i\,q\,s}{4}, \qquad \mathrm{outs}[i] = i \cdot \mathrm{DFT}(H_a L_b + L_a H_b)[i] = \frac{p\,s + q\,r}{4}
$$

— chỉ là đại số: $\mathrm{DFT}(H_a)\,\mathrm{DFT}(H_b) = \frac{p}{2}\cdot\frac{r}{2} = \frac{pr}{4}$, còn $\mathrm{DFT}(L_a)\,\mathrm{DFT}(L_b) = \frac{q}{2i}\cdot\frac{s}{2i} = -\frac{qs}{4}$; phần chéo ra $\frac{ps+qr}{4i}$, nhân $i$ từ trước để kết quả nằm trên trục ảo. Biến đổi ngược hai mảng: phần thực và phần ảo của $\mathrm{IDFT}(\mathrm{outl})$ là $H_a H_b$ và $L_a L_b$; phần ảo của $\mathrm{IDFT}(\mathrm{outs})$ là phần chéo. Tổng cộng **bốn** biến đổi — hai xuôi ($L$, $R$), hai ngược ($\mathrm{outl}$, $\mathrm{outs}$). Hai số chia $\frac14$ và $\frac1n$ đều là luỹ thừa của 2: chia chính xác, không thêm nổi một sai số nào.

```cpp
#include <bits/stdc++.h>

using namespace std;

typedef long long i64;
const i64 MOD = 1e9 + 7;
const int INF = 1e9 + 7;

using ull = unsigned long long;
using u128 = __uint128_t;

struct Data {
    long double x, y;
    Data(long double x = 0, long double y = 0) : x(x), y(y) {}
    Data operator + (const Data &o) const { return Data(x + o.x, y + o.y); }
    Data operator - (const Data &o) const { return Data(x - o.x, y - o.y); }
    Data operator * (const Data &o) const { return Data(x * o.x - y * o.y, x * o.y + y * o.x); }
    Data operator / (const long double &o) const { return Data(x / o, y / o); }
    Data conj() const { return Data(x, -y); }
};

const long double PI = acosl(-1.0L);

// FFT lặp: đảo bit rồi chạy các tầng butterfly len = 2, 4, 8, ...
// Bảng rt (các căn 2^k của 1) là static, mở rộng theo tầng và đứng lại giữa các lần gọi
void fft(vector<Data> &a, bool inv) {
    int n = (int)a.size();
    int L = __builtin_ctz(n);
    static vector<Data> rt(2, Data(1, 0));
    for (static int k = 2; k < n; k <<= 1) {
        rt.resize(2 * k);
        Data x(cosl(PI / k), sinl(PI / k));           // w_{2k} = e^{i.pi/k}
        for (int i = k; i < 2 * k; ++i)
            rt[i] = (i & 1) ? rt[i / 2] * x : rt[i / 2];
    }
    vector<int> rev(n);
    for (int i = 1; i < n; ++i)
        rev[i] = (rev[i >> 1] >> 1) | ((i & 1) << (L - 1));
    for (int i = 0; i < n; ++i) if (i < rev[i]) swap(a[i], a[rev[i]]);
    for (int k = 1; k < n; k <<= 1)
        for (int i = 0; i < n; i += 2 * k)
            for (int j = 0; j < k; ++j) {
                Data w = inv ? rt[j + k].conj() : rt[j + k];
                Data z = w * a[i + j + k];
                a[i + j + k] = a[i + j] - z;
                a[i + j] = a[i + j] + z;
            }
    if (inv) for (auto &d : a) d = d / n;
}

// Tích hai đa thức mod M bất kì (M không cần nguyên tố), dùng đúng 4 biến đổi FFT.
// Hệ số a, b đã nằm trong [0, M). Tách a_i = hi.cut + lo với cut = sqrt(M);
// "hai trong một": L chứa (hi a, lo a), R chứa (hi b, lo b) — mỗi FFT chịu hai đa
// thức thực; từ L[i] +- conj(L[j]) và R[i] +- conj(R[j]) tách ra DFT của bốn đa
// thức, ghép thành outl = hi.hi + i.(lo.lo) và outs = i.(hi.lo + lo.hi) rồi biến
// đổi ngược hai dãy — lấy phần thực/ảo ra đúng ba tích cần thiết.
vector<i64> conv_mod(const vector<i64> &a, const vector<i64> &b, ull M) {
    if (a.empty() || b.empty()) return {};
    if (M == 1) return vector<i64>(a.size() + b.size() - 1, 0);
    int m = (int)a.size() + (int)b.size() - 1;
    int n = (m == 1 ? 1 : 1 << (32 - __builtin_clz(m - 1)));
    i64 cut = (i64)sqrtl((long double)M);
    vector<Data> L(n), R(n), outl(n), outs(n);
    for (size_t i = 0; i < a.size(); ++i)
        L[i] = Data(a[i] / cut, a[i] % cut);          // a_i = hi.cut + lo
    for (size_t i = 0; i < b.size(); ++i)
        R[i] = Data(b[i] / cut, b[i] % cut);
    fft(L, false); fft(R, false);
    for (int i = 0; i < n; ++i) {
        int j = (n - i) & (n - 1);                    // chỉ số của -i (theo vòng)
        Data p = L[i] + L[j].conj();                  // 2.DFT(hi a)
        Data q = L[i] - L[j].conj();                  // 2i.DFT(lo a)
        Data r = R[i] + R[j].conj();
        Data s = R[i] - R[j].conj();
        outl[i] = (p * r - q * s * Data(0, 1)) / 4;   // DFT(hi.hi) + i.DFT(lo.lo)
        outs[i] = (p * s + q * r) / 4;                 // i.DFT(hi.lo + lo.hi)
    }
    fft(outl, true); fft(outs, true);
    vector<i64> res(m);
    ull c2 = (ull)cut * (ull)cut % M;                 // cut^2 mod M
    for (int k = 0; k < m; ++k) {
        i64 av = llroundl(outl[k].x);                  // (hi.hi)_k
        i64 bv = llroundl(outs[k].y);                  // (hi.lo + lo.hi)_k
        i64 cv = llroundl(outl[k].y);                  // (lo.lo)_k
        res[k] = ((u128)(ull)(av % (i64)M) * c2
                + (u128)(ull)(bv % (i64)M) * (ull)cut
                + (ull)(cv % (i64)M)) % M;             // av.cut^2 + bv.cut + cv
    }
    return res;
}

void solve() {
    // (999999999 + 999999999x)^2 mod 1e9+7 — hệ số cỡ M buộc phải tách theo cut = sqrt(M)
    vector<i64> a = {999999999, 999999999}, b = {999999999, 999999999};
    vector<i64> c = conv_mod(a, b, 1000000007ULL);
    for (size_t i = 0; i < c.size(); ++i) cout << c[i] << " \n"[i + 1 == c.size()];
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

Sau khi làm tròn, ba số $av_k, bv_k, cv_k$ gộp bằng đúng biểu thức khai triển ban đầu — $\mathrm{res}_k = (av_k \bmod M)\,c^2 + (bv_k \bmod M)\,c + cv_k \pmod M$ — lấy dư từng bước vì $av_k \cdot c^2$ tràn 64 bit khi $n$ lớn (trong code là một dòng `__uint128_t`). Trong `multiply()` ở mục Cài đặt, thay nhánh `conv_general` bằng `conv_mod` là chạy.

**Sai số — đọc kỹ trước khi dùng.** Đừng mặc định `long double` rộng hơn `double`: trên một số nền tảng (Windows MSVC, macOS ARM) nó chỉ là `double` với 53 bit định trị; trên Linux x86 là 80-bit extended (64 bit định trị), trên aarch64 Linux là 128-bit. Code trên viết `Data` với `long double` để được hưởng phần dư ở nơi có, nhưng mọi con số dưới đây chặn theo 53-bit — xấu nhất.

Hai ràng buộc cùng quy về đại lượng $n \cdot M$. Thứ nhất, **biểu diễn được**: mỗi hệ số của ba tích bị chặn $\min(n, m) \cdot (c+1)^2 \approx \min(n,m) \cdot M$, muốn `llround` còn số đúng để tròn tới thì phải nằm gọn trong 53 bit định trị ($2^{53} \approx 9 \cdot 10^{15}$). Thứ hai, **sai số làm tròn**: qua $\log_2 N$ tầng butterfly, sai số tích luỹ cỡ $\varepsilon \log_2 N$ nhân với độ lớn các giá trị trung gian — cùng cỡ $n \cdot M$ sau khi gói; ràng buộc này hẹp hơn ràng buộc biểu diễn chừng năm đến tám lần.

Đường an toàn trên 53-bit do đó vào cỡ **$n \cdot M \lesssim 10^{15}$**: với $M \approx 10^9$, vùng hoạt động chạm $n = 10^6$ — gấp đôi giới hạn của Library Checker. Trên x86 Linux với `long double` 80-bit, sai số định trị nhỏ hơn $2^{11}$ lần nên vùng này nới ra đáng kể.

Vậy chọn gì: Garner đúng tuyệt đối, không điều kiện; FFT mod nhanh gần năm lần, chạy với mọi $M$ kể cả hợp số, nhưng chỉ đúng trong vùng $n \cdot M \lesssim 10^{15}$ trên 53-bit. Chuỗi này giữ Garner làm mặc định vì tính chính xác; FFT mod là lựa chọn khi cần tốc độ và đứng trong vùng an toàn.

## Ứng dụng: đánh giá đa thức tại các điểm liên tiếp

Một mẹo ít nơi viết đủ, nhưng là trái tim của bài [binomial mod m](/posts/binomial-mod-m/): cho trước $f(0), \dots, f(n)$ của đa thức bậc $n$, tính $f(c), f(c+1), \dots, f(c+m-1)$ **modulo một prime thân thiện NTT** — bằng đúng một phép nhân đa thức.

Từ công thức Lagrange với $W(x) = \prod_{k=0}^{n}(x - k)$, đồng nhất thức chính của mẹo là


$$
f(c+j) \;=\; (A \ast B)[\,n+j\,] \cdot W(c+j),
\qquad
A[i] = \frac{f(i)\,(-1)^{n-i}}{i!\,(n-i)!}, \;\; B[\ell] = \frac{1}{c - n + \ell},
$$


— mẫu số của Lagrange tại các điểm liên tiếp trượt thành đúng một tích chập, còn $W(c+j)$ cập nhật trượt từng bước; chi phí $O((n + m) \log (n + m))$ so với $O(n \log^2 n)$ của multipoint evaluation tổng quát — "đặc sản" của các điểm cách đều. Chứng minh đầy đủ, hai nhánh an toàn ($c \le n$, $c + m > \mathrm{MOD}$) và code `compute` nằm ở [phần 2 của nội suy đa điểm](/posts/poly-multipoint-interpolation-part-2/) — mục "Dịch mẫu" chính là bản trình bày đầy đủ của mẹo này.

Các ứng dụng kinh điển khác của tích chập: đếm số cặp có tổng cho trước (đặt hệ số là số lần xuất hiện), nhân số nguyên lớn (chuyển chữ số thành hệ số rồi xử lý carry), string matching với wildcard (mỗi chữ cái một tích chập), XOR-convolution (Walsh–Hadamard — cùng triết lí "biến đổi, nhân điểm, biến đổi ngược" nhưng không phải FFT).

## Cài đặt

Bộ nhân hoàn chỉnh, đúng interface Convolution của Library Checker: `multiply(a, b, M)` nhận hai dãy hệ số và modul bất kì $M$, trả về $n + m - 1$ hệ số của tích — nếu $M$ là modul thân thiện thì một NTT, không thì Garner bốn modul:

**C++**

```cpp
#include <bits/stdc++.h>

using namespace std;

typedef long long i64;
const i64 MOD = 1e9 + 7;
const int INF = 1e9 + 7;

using ull = unsigned long long;
using u128 = __uint128_t;

template<unsigned mod_>
struct mint {
    static constexpr unsigned mod = mod_;
    unsigned x;
    constexpr mint() : x(0U) {}
    constexpr mint(unsigned x_) : x(x_ % mod) {}
    constexpr mint(ull x_) : x(x_ % mod) {}
    constexpr mint(int x_) : x(((x_ %= static_cast<int>(mod)) < 0) ? (x_ + static_cast<int>(mod)) : x_) {}
    constexpr mint(i64 x_) : x(((x_ %= static_cast<i64>(mod)) < 0) ? (x_ + static_cast<i64>(mod)) : x_) {}
    mint &operator += (const mint &a) { x = ((x += a.x) >= mod) ? (x - mod) : x; return *this; }
    mint &operator -= (const mint &a) { x = ((x += mod - a.x) >= mod) ? (x - mod) : x; return *this; }
    mint &operator *= (const mint &a) { x = (static_cast<ull>(x) * a.x) % mod; return *this; }
    mint &operator /= (const mint &a) { return (*this *= a.inv()); }
    mint pow(i64 e) const {
        if (e < 0) return inv().pow(-e);
        mint a = *this, b = 1U; for (; e; e >>= 1) { if (e & 1) b *= a; a *= a; }
        return b;
    }
    mint inv() const {
        unsigned a = mod, b = x; int y = 0, z = 1;
        for (; b; ) { const unsigned q = a / b; const unsigned c = a - q * b; a = b; b = c; const int w = y - static_cast<int>(q) * z; y = z; z = w; }
        assert(a == 1U); return mint(y);
    }
    mint operator + () const { return *this; }
    mint operator - () const { mint a; a.x = x ? (mod - x) : 0U; return a; }
    mint operator + (const mint &a) const { return (mint(*this) += a); }
    mint operator - (const mint &a) const { return (mint(*this) -= a); }
    mint operator * (const mint &a) const { return (mint(*this) *= a); }
    mint operator / (const mint &a) const { return (mint(*this) /= a); }
    template <class T> friend mint operator + (T a, const mint &b) { return (mint(a) += b); }
    template <class T> friend mint operator - (T a, const mint &b) { return (mint(a) -= b); }
    template <class T> friend mint operator * (T a, const mint &b) { return (mint(a) *= b); }
    template <class T> friend mint operator / (T a, const mint &b) { return (mint(a) /= b); }
    explicit operator bool() const { return x; }
    bool operator == (const mint &a) const { return (x == a.x); }
    bool operator != (const mint &a) const { return (x != a.x); }
    friend ostream &operator << (ostream &os, const mint &a) { return os << a.x; }
};

/// Nguyên tố P = a * 2^b + 1 với g là phần tử sinh (P < 2^31)
template <unsigned PRIME> struct proth_prime {};
template <> struct proth_prime< 998244353> { static constexpr int a =     7 * 17, b = 23, g =  3; };
template <> struct proth_prime< 985661441> { static constexpr int a =     5 * 47, b = 22, g =  3; };
template <> struct proth_prime< 943718401> { static constexpr int a = 3 * 3 * 5 * 5, b = 22, g =  7; };
template <> struct proth_prime< 935329793> { static constexpr int a =        223, b = 22, g =  3; };

// NTT lặp tại chỗ: đảo bit rồi các tầng butterfly len = 2, 4, 8, ...
template <unsigned PRIME>
void ntt(vector<mint<PRIME>> &a, bool inv) {
    int n = (int)a.size();
    assert(n > 0 && (n & (n - 1)) == 0);
    int L = __builtin_ctz(n);
    vector<int> rev(n);
    for (int i = 1; i < n; ++i) rev[i] = (rev[i >> 1] >> 1) | ((i & 1) << (L - 1));
    for (int i = 0; i < n; ++i) if (i < rev[i]) swap(a[i], a[rev[i]]);
    for (int len = 2; len <= n; len <<= 1) {
        // wlen = omega_len = g^((P-1)/len); bản ngược thay bằng g^(P-1-(P-1)/len)
        mint<PRIME> wlen = mint<PRIME>(proth_prime<PRIME>::g)
                       .pow(inv ? (PRIME - 1) - (PRIME - 1) / len : (PRIME - 1) / len);
        for (int i = 0; i < n; i += len) {
            mint<PRIME> w = 1;
            for (int j = 0; j < len / 2; ++j) {
                mint<PRIME> u = a[i + j], v = a[i + j + len / 2] * w;
                a[i + j] = u + v;                 // bước butterfly
                a[i + j + len / 2] = u - v;
                w *= wlen;
            }
        }
    }
    if (inv) {
        mint<PRIME> ninv = mint<PRIME>(n).inv();
        for (auto &x : a) x *= ninv;
    }
}

// tích hai đa thức (a, b) mod PRIME — trả về vector<ll>
template <unsigned PRIME>
vector<i64> conv_single(const vector<i64> &a, const vector<i64> &b) {
    if (a.empty() || b.empty()) return {};
    int m = (int)a.size() + (int)b.size() - 1;
    int n = (m == 1 ? 1 : 1 << (32 - __builtin_clz(m - 1)));
    vector<mint<PRIME>> A(a.begin(), a.end()), B(b.begin(), b.end());
    A.resize(n); B.resize(n);
    ntt(A, false); ntt(B, false);
    for (int i = 0; i < n; ++i) A[i] *= B[i];
    ntt(A, true);
    A.resize(m);
    vector<i64> c(m);
    for (int i = 0; i < m; ++i) c[i] = A[i].x;
    return c;
}

// --- Garner: nhân theo 4 modul rồi ghép ---

ull P;   // modul đích (kết quả cuối cùng)
ull mul(ull A, ull B) {
    A %= P, B %= P;
    return (u128)A * B % P;
}

template <unsigned MOD1, unsigned MOD2, unsigned MOD3, unsigned MOD4>
i64 garner4(mint<MOD1> a1, mint<MOD2> a2, mint<MOD3> a3, mint<MOD4> a4) {
    static const auto r12 = mint<MOD2>(MOD1).inv();
    static const auto r13 = mint<MOD3>(MOD1).inv();
    static const auto r14 = mint<MOD4>(MOD1).inv();
    static const auto r23 = mint<MOD3>(MOD2).inv();
    static const auto r24 = mint<MOD4>(MOD2).inv();
    static const auto r34 = mint<MOD4>(MOD3).inv();
    a2 = (a2 - a1.x) * r12;
    a3 = (a3 - a1.x) * r13;
    a3 = (a3 - a2.x) * r23;
    a4 = (a4 - a1.x) * r14;
    a4 = (a4 - a2.x) * r24;
    a4 = (a4 - a3.x) * r34;
    return (a1.x + mul(a2.x, MOD1) + mul(mul(a3.x, MOD1), MOD2)
              + mul(mul(a4.x, MOD1), mul(MOD2, MOD3))) % P;
}

constexpr int nttmod[4] = {998244353, 985661441, 943718401, 935329793};

// tích hai đa thức mod M bất kì: NTT trên 4 modul rồi Garner ghép lại
vector<i64> conv_general(const vector<i64> &a, const vector<i64> &b) {
    if (a.empty() || b.empty()) return {};
    int m = (int)a.size() + (int)b.size() - 1;
    vector<i64> c0 = conv_single<nttmod[0]>(a, b);
    vector<i64> c1 = conv_single<nttmod[1]>(a, b);
    vector<i64> c2 = conv_single<nttmod[2]>(a, b);
    vector<i64> c3 = conv_single<nttmod[3]>(a, b);
    vector<i64> c(m);
    for (int i = 0; i < m; ++i)
        c[i] = garner4<nttmod[0], nttmod[1], nttmod[2], nttmod[3]>(
                   mint<nttmod[0]>(c0[i]), mint<nttmod[1]>(c1[i]),
                   mint<nttmod[2]>(c2[i]), mint<nttmod[3]>(c3[i]));
    return c;
}

vector<i64> multiply(const vector<i64> &a, const vector<i64> &b, ull M) {
    if (a.empty() || b.empty()) return {};
    int m = (int)a.size() + (int)b.size() - 1;
    if (M == 1) return vector<i64>(m, 0);
    vector<i64> ra(a), rb(b);
    for (auto &x : ra) x %= (i64)M;
    for (auto &x : rb) x %= (i64)M;
    if (M == 998244353) return conv_single<998244353>(ra, rb);
    if (M == 985661441) return conv_single<985661441>(ra, rb);
    if (M == 943718401) return conv_single<943718401>(ra, rb);
    if (M == 935329793) return conv_single<935329793>(ra, rb);
    P = M;
    return conv_general(ra, rb);
}

void solve() {
    // Modul thân thiện NTT: (1 + 2x + 3x^2)(4 + 5x) = 4 + 13x + 22x^2 + 15x^3
    vector<i64> c1 = multiply({1, 2, 3}, {4, 5}, 998244353ULL);
    for (size_t i = 0; i < c1.size(); ++i) cout << c1[i] << " \n"[i + 1 == c1.size()];
    // Modul bất kì: (999999999 + 999999999x)^2 qua Garner bốn modul
    vector<i64> c2 = multiply({999999999, 999999999}, {999999999, 999999999}, 1000000007ULL);
    for (size_t i = 0; i < c2.size(); ++i) cout << c2[i] << " \n"[i + 1 == c2.size()];
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

## Bài tập luyện

- [Convolution (Library Checker)](https://judge.yosupo.jp/problem/convolution_mod) và [Convolution mod 1,000,000,007](https://judge.yosupo.jp/problem/convolution_mod_1000000007) — nộp bằng `multiply` sau khi thêm phần đọc in.
- [A \* B Problem Plus (HDU 1402)](https://acm.hdu.edu.cn/showproblem.php?pid=1402) — nhân số nguyên lớn bằng FFT số phức.
- [The Child and Binary Tree (CF 438E)](https://codeforces.com/problemset/problem/438/E) — hàm sinh + nghịch đảo formal power series bằng NTT.
- [Nikita and Order Statistics (CF 993E)](https://codeforces.com/problemset/problem/993/E) — tích chập chéo (xconv).
- Bộ bài `convintv`, `luckytkt`, `sigproc` trên Chuyên Tin OJ — từ đếm cặp tổng tới lũy thừa đa thức.

## Nguồn

- <https://cp-algorithms.com/algebra/fft.html>
- <https://wiki.vnoi.info/algo/trick/fft>
- <https://oj.chuyentin.pro/wiki/fft/>
- <https://codeforces.com/blog/entry/75326>
- <https://en.wikipedia.org/wiki/Cooley%E2%80%93Tukey_FFT_algorithm>
