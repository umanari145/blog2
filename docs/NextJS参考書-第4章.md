# 第4章 動的ルートと 404

## はじめに

第3章では、レイアウトとページの基本を学びました。  
第4章ではいよいよ、**URL の一部を変数として受け取るページ**＝**動的ルート**を扱います。

`blog2` でいうと、ここがゴールです。

```
/posts/abc123   ← 「abc123」の部分が記事ごとに変わる
/posts/xyz999
/posts/hello
```

このような URL を1つの `page.tsx` で受け止め、

- どの記事を表示するか決める
- 記事が無いときは **404 ページ**を出す
- 記事のタイトルを **タブ名（メタデータ）に反映する**

までを、最小のコードで実現していきます。

該当ファイルは下の3つです。

- `app/app/posts/[postNo]/page.tsx` … 動的ルート本体
- `app/app/posts/[postNo]/not-found.tsx` … その配下専用の 404 ページ
- `app/lib/api/postDetail.ts` … API 経由で記事を取得するヘルパー

---

## 1. 動的ルートとは

App Router では、フォルダ名を `[xxx]` のように **角カッコ**で囲むと、その部分が **URL から取れる変数**になります。

```
app/app/posts/[postNo]/page.tsx
                ^^^^^^
                ここがパラメータ
```

| URL | `params.postNo` の値 |
|---|---|
| `/posts/abc123` | `"abc123"` |
| `/posts/hello-world` | `"hello-world"` |
| `/posts/123` | `"123"` |

ポイントは、**`postNo` という名前は自分で決めている**ということです。  
`[id]` でも `[slug]` でもよく、フォルダ名がそのまま受け取る変数名になります。

---

## 2. `params` は `Promise` で受け取る（Next.js 15 以降）

`blog2` の詳細ページの先頭はこうなっています。

```tsx
// app/app/posts/[postNo]/page.tsx（要点）
type PageProps = {
  params: Promise<{ postNo: string }>;
};

export default async function PostDetailPage({ params }: PageProps) {
  const { postNo: raw } = await params;   // ← await が必要
  const postNo = decodeURIComponent(raw);
  // ……以下、データ取得と描画……
}
```

ここで初心者がいちばん戸惑うのが、**`params` が `Promise` であること**です。

### なぜ `Promise` なのか

Next.js 15 から、`params` と `searchParams` は **非同期に解決される値**として渡される仕様になりました。  
そのため、必ず **`await params`** してから中身を取り出します。

```tsx
const { postNo } = await params;        // OK
const { postNo } = params;              // 型エラー & 期待通りに動かない
```

### `decodeURIComponent` を挟んでいる理由

URL に **日本語や記号**が含まれることがあるためです。  
たとえば `/posts/こんにちは` は実際には `/posts/%E3%81%93%E3%82%93%E3%81%AB%E3%81%A1%E3%81%AF` のようにエンコードされて届きます。  
それを **元の文字列に戻す**のが `decodeURIComponent` です。

---

## 3. データを取りに行く

`postNo` が分かったら、その記事を取りに行きます。  
`blog2` では「ページから直接 DB を触らず、**内部 API を fetch する**」スタイルを採用しています。

```tsx
import { fetchPostDetailFromApi } from "@/lib/api/postDetail";

const post = await fetchPostDetailFromApi(postNo);
```

中身（`lib/api/postDetail.ts`）の要点はこうです。

```ts
export async function fetchPostDetailFromApi(
  postNo: string,
): Promise<PostDetailApi | null> {
  const url = await internalApiUrl(`/api/posts/${encodeURIComponent(postNo)}`);
  const res = await fetch(url, { cache: "no-store" });
  if (res.status === 404) return null;        // ← 見つからなければ null
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `API error: ${res.status}`);
  }
  return (await res.json()) as PostDetailApi;
}
```

ここでは大事な“約束ごと”が2つあります。

1. **記事が無いとき**は例外を投げず、**`null` を返す**
2. **通信そのものが失敗したとき**は **例外を投げる**

「無い」と「壊れた」を区別しておくと、ページ側の表示分岐がとてもシンプルになります。

---

## 4. `notFound()` と `not-found.tsx`

ページ側はこうなっています。

```tsx
let post = null;
let loadError: string | null = null;
try {
  post = await fetchPostDetailFromApi(postNo);
} catch (e) {
  loadError = e instanceof Error ? e.message : "記事 API の取得に失敗しました。";
}

if (loadError) {
  return <div>記事を読み込めませんでした: {loadError}</div>;
}

if (!post) {
  notFound();   // ← 404 を発火させる
}

// ここから先は post が必ず存在する
```

### `notFound()` の正体

`next/navigation` から import する関数で、**呼ぶとそこで処理が中断**され、Next.js が **最寄りの `not-found.tsx`** を探して描画します。

```tsx
import { notFound } from "next/navigation";
```

つまり、`notFound()` の呼び出し以降のコードは実行されません。  
TypeScript もそれを理解してくれるので、続く行で `post` を **必ずあるもの**として扱えます。

### `not-found.tsx` はどこに置く？

App Router のルールは「**最寄りに置けば、その配下で使われる**」です。  
`blog2` では、詳細ページの 404 だけ独自にしたかったので、こう置いています。

```
app/app/posts/[postNo]/
├── page.tsx
└── not-found.tsx     ← /posts/xxx の notFound() がここに飛ぶ
```

中身はとてもシンプルです。

```tsx
// app/app/posts/[postNo]/not-found.tsx（要点）
export default function PostNotFound() {
  return (
    <div className="mx-auto w-full max-w-lg px-5 py-16 text-center">
      <h1>記事が見つかりません</h1>
      <p>URL が間違っているか、記事が削除された可能性があります。</p>
      <Link href="/posts">記事一覧へ戻る</Link>
    </div>
  );
}
```

ポイントは、**ファイル名が `not-found.tsx` で固定**であることです（Next.js の予約名）。  
名前を間違えると、せっかく置いてもまったく使われません。

### 「無い」と「失敗」を分けるとどう嬉しい？

`blog2` では、

- 記事が無いとき → 上の **専用 404 画面**
- API 通信エラー → ページ内の **黄色いアラートボックス**

と、ユーザーに見せる UI が変わります。  
**ユーザーがリトライすれば直るかどうか**が違うため、表示も分けておくのが親切です。

---

## 5. `generateMetadata` と動的パラメータ

詳細ページは記事ごとにタブ名を変えたいので、**メタデータも動的に生成**します。

```tsx
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { postNo: raw } = await params;
  const postNo = decodeURIComponent(raw);
  try {
    const post = await fetchPostDetailFromApi(postNo);
    if (!post) {
      return { title: "記事が見つかりません" };
    }
    return {
      title: post.title,
      description: excerptFromContents(post.contents, 120),
    };
  } catch {
    return { title: "記事の取得に失敗しました" };
  }
}
```

### 押さえどころ

- 引数の **`params` も `Promise`** … `await` 必須（描画関数と同じ）
- 中で **データを取りに行ってよい** … fetch 結果からタイトル・説明を作れる
- `null` のとき・例外のとき・正常時の **3パターンを返している**
- ルートレイアウトの `template: "%s | blog2"` と組み合わさり、最終的なタブ名は **`記事タイトル | blog2`** になる

### 同じ fetch を2回している？

`generateMetadata` と本文の `PostDetailPage` で、同じ `fetchPostDetailFromApi(postNo)` を呼んでいます。  
気になるかもしれませんが、Next.js の仕組みとして **同一リクエスト内の同じ fetch は重複排除（dedupe）** されるため、実際の通信は基本 1 回です。  
意識せずに「必要な場所で素直に呼ぶ」で OK です。

---

## 6. `dynamic = 'force-dynamic'` をなぜここにも書く？

詳細ページの先頭にもこの一行があります。

```tsx
export const dynamic = "force-dynamic";
```

理由は第3章と同じです。  
**DB（API 経由）を読むため、ビルド時に静的化しても意味がない**から。  
リクエストのたびに最新を取りに行くようにしておきます。

> 補足：将来「人気記事だけは10秒キャッシュしたい」のような要件が出てきたら、`revalidate = 10` のような書き方に置き換えていく流れになります。

---

## 7. リクエスト全体の流れ（おさらい）

`/posts/abc123` を開いたときに何が起きているか、順を追って整理します。

1. ルーティング … `app/app/posts/[postNo]/page.tsx` が選ばれる
2. メタデータ … `generateMetadata` が `params` を解決し、API から記事を取ってタブ名を決める
3. 描画関数 … `PostDetailPage` が `params` を解決し、API から記事を取得
4. 例外 → エラー表示  
   `null` → `notFound()` → `not-found.tsx`  
   正常 → 記事 UI を描画
5. レイアウト … 第3章で見た `app/app/layout.tsx` の `{children}` に差し込まれる

**動的ルート × 404 × メタデータ** の3点セットが、いつもこの順で連動します。

---

## 8. 初心者がつまずきやすいポイント

### 8-1. `params` を `await` し忘れる

```tsx
const { postNo } = params;       // NG
const { postNo } = await params; // OK
```

Next.js 15 以降は `Promise` 必須。型エラーが出たらまずここを疑います。

### 8-2. `not-found.tsx` の置き場所を間違える

- 詳細だけの 404 にしたい → `app/posts/[postNo]/not-found.tsx`
- ルート全体で共通の 404 にしたい → `app/app/not-found.tsx`

ファイル名は **必ず `not-found.tsx`**（ハイフン）です。

### 8-3. 「無い」と「失敗」を一緒くたに `notFound()` してしまう

API が落ちているだけなのに 404 を出すと、ユーザーは「記事が消えた」と誤解します。  
本リポジトリのように **try/catch でエラーを別表示**にしておくのが安全です。

### 8-4. パラメータをそのまま信用する

`[postNo]` には何でも入る可能性があります。  
本プロジェクトでは「DB に存在しない `postNo` ならそもそも `null` が返る → `notFound()`」という流れで安全側に倒しています。  
**「URL は信用しない」**を基本にしましょう。

---

## 9. ここまでの確認チェックリスト

- [ ] フォルダ名 `[xxx]` がパラメータになる仕組みを説明できる
- [ ] `params` が `Promise` であることを知っている
- [ ] `decodeURIComponent` を挟む理由を言える
- [ ] `notFound()` を呼ぶと最寄りの `not-found.tsx` が出ることを説明できる
- [ ] `generateMetadata` で動的にタブ名を変える方法を書ける
- [ ] 「データ無し」と「通信エラー」を分けて扱う意義がわかる

---

## 10. 章末まとめ

第4章では、**動的ルート × 404 × メタデータ**を、`blog2` の記事詳細ページから読み解きました。

- フォルダ名 `[postNo]` で **URL の一部を変数化**
- `params` は **`await` してから使う**
- 記事が無ければ **`notFound()` → `not-found.tsx`**
- API エラーは別 UI に分けて **ユーザーに正しく伝える**
- メタデータも **記事ごとに動的生成**

次章（第5章）では、**`/posts?categoryId=…&tagId=…&q=…&page=…` のような検索パラメータ**を扱う一覧ページを取り上げます。「URL でアプリの状態を表現する」感覚をつかみましょう。
