# 第3章 レイアウトとページ

## はじめに

第2章で `blog2` の地図ができたので、第3章では実際に **画面を描いている2つのファイル**を読み解きます。

- `app/app/layout.tsx` … 全ページ共通の **枠**
- `app/app/page.tsx` … トップページ（`/`）

加えて、ページの上部に表示される **タブ名や検索結果の見え方**を決める **メタデータ** と、Next.js の **キャッシュ動作の制御**（`dynamic = 'force-dynamic'`）も扱います。

この章を終えると、

- どのファイルが画面のどこを描いているか
- メタデータをどう書くか
- 「DB を読む」ページで `dynamic` を指定する理由

がわかるようになります。

---

## 1. 全体像：レイアウトとページの関係

App Router の基本ルールはとてもシンプルです。

- **`layout.tsx`** … その配下すべてのページを **包む枠**
- **`page.tsx`** … その URL に表示する **中身**

`blog2` のいまの構造はこうなっています。

```
app/app/
├── layout.tsx        （ルートレイアウト：全ページの枠）
├── page.tsx          （/ … トップページ）
└── posts/
    ├── page.tsx      （/posts … 記事一覧）
    └── [postNo]/
        ├── page.tsx          （/posts/xxx … 記事詳細）
        └── not-found.tsx     （詳細が無いとき用）
```

つまり、どのページを開いても **`app/app/layout.tsx` の枠の中に**、その URL に対応する `page.tsx` が表示されます。

---

## 2. `app/app/layout.tsx` を読む

第2章で見た「共通の枠」に当たるファイルです。  
要点だけ抜き出すと、こんな構成になっています。

```tsx
// app/app/layout.tsx（要点だけ抜粋）
import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteMobileHeader } from "@/components/SiteMobileHeader";
import { SiteSidebar } from "@/components/SiteSidebar";
import "./globals.css";

const noto = Noto_Sans_JP({ /* …フォント設定… */ });

export const metadata: Metadata = {
  title: { default: "blog2", template: "%s | blog2" },
  description: "技術ブログ · Next.js と Prisma の実験場",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <SiteMobileHeader />
        <div className="md:grid md:grid-cols-[minmax(0,1fr)_16rem]">
          <main>{children}</main>
          <SiteSidebar />
        </div>
        <SiteFooter />
      </body>
    </html>
  );
}
```

### 押さえるポイントは4つ

1. **`<html>` と `<body>` を書くのはここだけ**  
   ルートレイアウトの責務です。子ページでは書きません。

2. **`{children}` が「中身を差し込む穴」**  
   各ページの `page.tsx` の出力が、ここに入ります。

3. **共通 UI を呼ぶのもここ**  
   `SiteMobileHeader` / `SiteSidebar` / `SiteFooter` などは全ページで使うので、レイアウトに置きます。

4. **フォントとスタイルもここで読み込む**  
   `Noto_Sans_JP` と `globals.css` をルートで読み込み、子全体に適用しています。

### よくある誤解

- 「レイアウトは複数置けるの？」  
  → 置けます。`app/posts/layout.tsx` を作れば、`/posts` 配下だけに使われる枠になります。  
  本リポジトリはルート1枚だけです。

---

## 3. `app/app/page.tsx`（トップページ）を読む

`blog2` のトップは、いたってシンプルです。

```tsx
// app/app/page.tsx
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/posts");
}
```

これは「トップに来たら **記事一覧へ転送**する」という、最小のページです。

### ポイント

- **`page.tsx` は基本的にコンポーネントを `default export` する**
- 描画ではなくリダイレクトしたいときは **`redirect("/posts")`** が手早い
- このページは UI を持たないので、レイアウトの **`{children}`** には何も入らずにそのまま転送されます

### 演習（あとで戻ってきてOK）

学習で試したいときは、トップにダミーの見出しを置いてみると、レイアウトとの位置関係が体感しやすいです。

```tsx
export default function Home() {
  return <h1 className="p-8 text-2xl">こんにちは blog2</h1>;
}
```

---

## 4. メタデータ（`metadata` / `generateMetadata`）

ブラウザのタブ名・SNS シェア時のタイトル・OG 情報などを決める部分です。Next.js では、**ページごとに2通り**の書き方があります。

### 4-1. 静的に決まるとき: `metadata`

```tsx
// 例: app/app/layout.tsx
export const metadata: Metadata = {
  title: { default: "blog2", template: "%s | blog2" },
  description: "技術ブログ · Next.js と Prisma の実験場",
};
```

- **`default`** … タイトルを上書きしない場合に使われる文字列
- **`template`** … 子ページの `title` をどう装飾するかのテンプレ（`%s` に子のタイトルが入る）

たとえば子ページが `title: "記事一覧"` を返すと、ブラウザのタブには **`記事一覧 | blog2`** と表示されます。

### 4-2. URL に応じて変わるとき: `generateMetadata`

`/posts/abc123` のように **その時々で内容が変わる**ページでは、関数を export します。

```tsx
// 例: app/app/posts/[postNo]/page.tsx
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { postNo: raw } = await params;
  const postNo = decodeURIComponent(raw);
  const post = await fetchPostDetailFromApi(postNo);
  if (!post) return { title: "記事が見つかりません" };
  return {
    title: post.title,
    description: excerptFromContents(post.contents, 120),
  };
}
```

- 引数の **`params`** は `Promise` なので **`await`** が必要
- 中で **データ取得**して、そのページに合わせたタイトル・説明を返せる
- ルートレイアウトの `template: "%s | blog2"` と組み合わせると、自動で `記事タイトル | blog2` のように整います

### 4-3. 一覧ページの応用例（条件で出し分け）

`app/app/posts/page.tsx` では、検索クエリやカテゴリ ID で **タイトル文字列を切り替え**ています。

- 検索なし → `記事一覧 | blog2`
- 検索 `q=docker` → `「docker」の検索 | blog2`
- カテゴリ指定 → `カテゴリ名の記事 | blog2`

ユーザーの操作に応じてタブ名が変わるので、**ブックマーク時にも内容が判別しやすい**のが利点です。

---

## 5. `dynamic = 'force-dynamic'` の意味

Next.js は **できるだけ静的に作って配る**のが基本動作です。  
ところが、DB を読むページや、リクエストごとに結果が変わるページは静的化しても意味がありません。  
そんなときに使うのが、ページの先頭に書く一行です。

```tsx
export const dynamic = "force-dynamic";
```

### これを書くとどうなる？

- **ビルド時にプリレンダーしない**
- リクエストのたびに **サーバーで描画**する
- DB のデータを **常に最新**で読める

### `blog2` ではどこで使っている？

- `app/app/posts/page.tsx`（記事一覧 … DB を読む）
- `app/app/posts/[postNo]/page.tsx`（詳細 … DB を読む）

逆に `layout.tsx` や `page.tsx`（トップ）には書いていません。  
ここは固定の枠／単純なリダイレクトのみで、動的な指定が不要だからです。

### 似た仲間

- `dynamic = "force-static"` … 反対に、動的に決まらないと宣言する
- `revalidate = 60` … 60秒ごとに再生成（ISR）

最初は **DB を読むページに `force-dynamic`** とだけ覚えればOKです。

---

## 6. レイアウトとページが連動する流れ（おさらい）

`/posts/abc123` を開いたときの流れを追ってみましょう。

1. ルーティング … `app/app/posts/[postNo]/page.tsx` が選ばれる
2. メタデータ … 同ファイルの `generateMetadata` が走り、タイトル・説明を確定
3. データ取得 … サーバーコンポーネントとして DB を読む
4. 描画 … ページの JSX が `app/app/layout.tsx` の `{children}` に差し込まれる
5. 共通 UI … サイドバー・フッター・モバイルヘッダーがレイアウト側で描かれる

つまり、**「枠（layout） + 中身（page）」がリクエスト単位で組み合わさる**、というのが App Router の基本です。

---

## 7. 初心者がつまずきやすいポイント

### 7-1. 「レイアウトに書くのか、ページに書くのか」迷う

おすすめの基準は次のとおりです。

- **全ページで使う UI** → レイアウト
- **そのページでしか使わない UI** → ページ
- **そのセクション配下だけ共通** → セクション用のレイアウトを別途作る

### 7-2. メタデータが上書きされない

子ページで返した `title` は、ルートレイアウトの **`template`** によって整形されます。  
`{ title: "記事一覧" }` を返すと、最終的なタブ名は **`記事一覧 | blog2`** になります。  
完全に上書きしたい場合は `title: { absolute: "完全上書き" }` を使います。

### 7-3. `dynamic` を全部書きそうになる

DB を読まない静的な枠（フッターだけ表示する `not-found.tsx` など）には不要です。  
**「リクエストごとに変わるページだけ」**が原則です。

---

## 8. ここまでの確認チェックリスト

- [ ] レイアウトとページの違いを説明できる
- [ ] `<html>` と `<body>` をどこで書くか答えられる
- [ ] `{children}` が何を意味するか説明できる
- [ ] `metadata` と `generateMetadata` を使い分けられる
- [ ] DB を読むページに `dynamic = "force-dynamic"` を書く理由を言える

---

## 9. 章末まとめ

第3章では、画面の見た目を作る2大ファイル **`layout.tsx` と `page.tsx`** を読み解きました。

- 共通の枠は **ルートレイアウト**
- 中身は各 **`page.tsx`**
- タブ名・SNS タイトルは **`metadata` / `generateMetadata`**
- DB 参照ページは **`dynamic = "force-dynamic"`**

次章（第4章）では、`/posts/[postNo]` のような **動的ルートと 404 ページ** を、もう一段詳しく扱います。
