# Next.js 参考書（題材: blog2）— 目次

本リポジトリのブログ実装を題材にした、**学習用の章立て**です。各章はコードベース（`app/` 配下）と対応させて読み進められます。

---

## はじめに

- 本書のゴールと前提（Node / TypeScript / ターミナル）
- リポジトリの見方（`blog2/` と `app/`）
- 作業ディレクトリ: `cd app` と `npm run dev`

---

## 第 I 部　環境とプロジェクトの全体像

### 第 1 章　Docker とデータベースで開発環境をそろえる

- `docker-compose.yml` の役割（アプリ・MySQL・phpMyAdmin）
- `Dockerfile` と Node イメージ
- `db/init/` と初回 SQL
- コンテナ内外と `DATABASE_URL`（ホスト名 `db` と `localhost`）
- よくある接続エラーと切り分け

### 第 2 章　Next.js プロジェクトの骨格

- `package.json` のスクリプト（`dev` / `build` / `start`）
- `tsconfig.json` とパスエイリアス（`@/`）
- `next.config`（利用する場合の注意点）
- App Router のルート: `app/app/` の意味

---

## 第 II 部　App Router の基礎

### 第 3 章　レイアウトとページ

- `layout.tsx`: 共通シェル（フォント・グリッド・フッター）
- `page.tsx`: トップページ
- メタデータ（`metadata` / `generateMetadata`）
- `dynamic = 'force-dynamic'` の意味（DB 参照ページ）

### 第 4 章　動的ルートと 404

- `app/posts/[postNo]/page.tsx` と `params`（`Promise` 型）
- `notFound()` と `not-found.tsx`
- `generateMetadata` と動的パラメータ

### 第 5 章　検索パラメータと一覧 UI

- `searchParams`（`Promise`）の扱い
- クエリによる絞り込み（`categoryId` / `tagId` / `q` / `page`）
- 条件に応じた見出し・空表示・メタデータ

---

## 第 III 部　データ層と Prisma

### 第 6 章　Prisma 7 と MySQL

- `schema.prisma`（`Post` / `Category` / `Tag` と多対多）
- `prisma.config.ts` と接続 URL
- `npx prisma migrate dev` とシャドウ DB権限（README の補足）
- `prisma generate` と生成クライアントの置き場所

### 第 7 章　Prisma クライアントとアダプター

- `lib/prisma.ts`: シングルトンと開発時のホットリロード
- Prisma 7 + `@prisma/adapter-mariadb` + `mariadb` ドライバ
- `DATABASE_URL` 未設定時のエラーメッセージ

### 第 8 章　データ取得の集約（`lib/data/`）

- `posts.ts`: 一覧・詳細・フィルタ・ページング・検索
- `categories.ts` / `tags.ts`
- `PostListFilter` と `buildPostListWhere` の考え方
- `lib/postExcerpt.ts`（一覧用の抜粋）

---

## 第 IV 部　Route Handlers（API）

### 第 9 章　REST 風エンドポイントの設計

- `app/api/posts/route.ts`（一覧）
- `app/api/posts/[postNo]/route.ts`（詳細）
- JSON における `Date`（ISO 文字列）
- エラー時の `NextResponse.json` とステータスコード

### 第 10 章　カテゴリ・タグ API

- `GET /api/categories` / `GET /api/tags`
- `GET /api/categories/[id]/posts` / `GET /api/tags/[id]/posts`
- 動的セグメントのバリデーション（数値 ID）

### 第 11 章　サーバーから同一オリジン API を呼ぶ

- `lib/api/internalUrl.ts`（`headers()` による絶対 URL）
- `fetchPostDetailFromApi` / `fetchCategoriesFromApi` / `fetchTagsFromApi`
- 「ページは fetch、実体は Route Handler」のパターンと注意点

---

## 第 V 部　コンポーネント設計

### 第 12 章　サーバーコンポーネントとクライアントの境界

- サイドバー・フッター（サーバーでのデータ取得）
- `"use client"` が必要なケース（`useSearchParams`）
- **Suspense** を親（レイアウト／サーバー側）に置く理由（本プロジェクトの検索フォーム）

### 第 13 章　フォームとナビゲーション

- `PostsSearchForm`: `GET` / `action="/posts"` / `name="q"`
- `postsListHref.ts`: クエリの組み立てと再利用
- `CategoryPillLink` / `TagPillLink`（リンクのネストを避ける一覧カード）

### 第 14 章　ページネーション UI

- `PostListPager`: 前後リンクとページ番号（先頭・現在・末尾のアンカー）
- フィルタを維持した `href` 生成

---

## 第 VI 部　スタイルと体験

### 第 15 章　Tailwind CSS

- `tailwind.config.ts` / `globals.css`
- ダークモードとユーティリティの読み方
- `@tailwindcss/typography`（本文 HTML の表示）

### 第 16 章　レスポンシブとレイアウト

- `md:` ブレークポイントでのサイドバー表示切替
- `SiteMobileHeader` とモバイル用検索
- メインカラム幅の設計（`layout.tsx` のグリッド）

---

## 第 VII 部　データ投入と運用

### 第 17 章　JSON からのインポート

- `convert/import.ts` と `tsx` 実行
- `--test` / `--test=25` での件数制限
- 本番データ投入の流れ（安全な手順）

### 第 18 章　README とドキュメント駆動

- ディレクトリ表の書き方
- トラブルシューティングを README に残す習慣

---

## 付録

- **付録 A**　用語索引（RSC / Route Handler / `searchParams` / Prisma など）
- **付録 B**　コマンド早見表（`prisma` / `docker compose` / `npm`）
- **付録 C**　発展課題（認証、ISR、全文検索、テストの導入など）

---

## 本書とソースコードの対応表（抜粋）

| 章で扱う話題 | 主な参照パス |
|--------------|----------------|
| レイアウト | `app/app/layout.tsx` |
| 記事一覧 | `app/app/posts/page.tsx` |
| 記事詳細 | `app/app/posts/[postNo]/page.tsx` |
| API | `app/app/api/**/route.ts` |
| データ取得 | `app/lib/data/*.ts` |
| Prisma | `app/lib/prisma.ts`, `app/prisma/schema.prisma` |
| UI 部品 | `app/components/*.tsx` |

---

*目次のみのファイルです。本文は各章をこのリポジトリのコードと README を開きながら執筆・講義する想定です。*
