# 第2章 Next.js プロジェクトの骨格

## はじめに

第1章では、Docker と DB を含めてアプリが動く環境を作りました。  
第2章では、`blog2` の中身を「どこに何があるか」という視点で読み解きます。

初心者の方が最初に迷うポイントは、だいたい次の2つです。

- 「`app/` が2回出てくるのはなぜ？」（`app/app/`）
- 「コマンドはどの階層で打つの？」

この章を読み終えると、**どのファイルを開けば何がわかるか**が整理できるようになります。

---

## 1. まずは全体の2階建て構造を理解する

このリポジトリは、ざっくりいうと「外側」と「内側」の2層です。

## 外側（リポジトリ直下: `blog2/`）

- Docker 関連（`Dockerfile`、`docker-compose.yml`）
- DB 初期化 SQL（`db/`）
- アプリ本体フォルダ（`app/`）

## 内側（アプリ本体: `blog2/app/`）

- Next.js / TypeScript / Prisma の実ファイル
- ここで `npm run dev` や `npx prisma ...` を実行する

つまり、**作業の多くは `cd app` してから**です。

---

## 2. `app/` 配下の重要ディレクトリ

ここでは「初心者が最初に触る順」で説明します。

### 2-1. `app/app/`（App Router の本体）

この `app/app/` は、Next.js の App Router のルートです。  
主に次のファイルを読みます。

- `app/app/layout.tsx` : 全ページ共通の枠（レイアウト）
- `app/app/page.tsx` : トップページ
- `app/app/posts/page.tsx` : 記事一覧ページ
- `app/app/posts/[postNo]/page.tsx` : 記事詳細ページ（動的ルート）
- `app/app/api/**/route.ts` : API エンドポイント（Route Handler）

### 2-2. `app/components/`（再利用UI）

ページを構成する部品が入っています。

- `SiteSidebar.tsx` : サイドバー
- `SiteMobileHeader.tsx` : モバイルヘッダー
- `PostListPager.tsx` : ページャー
- `CategoryPillLink.tsx` / `TagPillLink.tsx` : フィルタリンク

**ページに直接べた書きせず、部品に切り出す**のが基本方針です。

### 2-3. `app/lib/`（ロジック）

UI から分離した処理が入ります。

- `lib/prisma.ts` : Prisma クライアント作成
- `lib/data/*.ts` : DB 取得ロジック
- `lib/api/*.ts` : 内部 API 呼び出し helper
- `lib/postsListHref.ts` : URL クエリ組み立て

「見た目」は `components`、  
「中身の処理」は `lib` と覚えると追いやすいです。

### 2-4. `app/prisma/`（DB スキーマ）

- `schema.prisma` : テーブル・リレーション定義
- `migrations/` : マイグレーション履歴

DB 関連で迷ったら、まずここを見ます。

---

## 3. よく使う設定ファイルを先に押さえる

### 3-1. `package.json`

よく使うスクリプトはこの4つです。

- `npm run dev` : 開発サーバー起動
- `npm run build` : 本番ビルド
- `npm run start` : 本番起動
- `npm run convert:import:test` : テスト件数でデータ投入

### 3-2. `tsconfig.json`

このプロジェクトでは `@/` から始まる import を使っています。  
例: `@/lib/data/posts`

相対パス（`../../../`）の地獄を避けるためです。

### 3-3. `prisma.config.ts` と `.env`

- `prisma.config.ts` が `dotenv/config` を読み込む
- `.env` の `DATABASE_URL` を Prisma が参照する

**環境変数が反映されないときは、この2つをセットで確認**します。

---

## 4. App Router で最低限知っておきたいルール

### 4-1. `page.tsx` は「ページ」

ルートに対応する UI 本体です。

- `/posts` → `app/app/posts/page.tsx`

### 4-2. `layout.tsx` は「共通の枠」

子ページの外側をまとめます。

- 共通ヘッダー
- 共通サイドバー
- 共通フッター

### 4-3. `[postNo]` は「動的セグメント」

URL パラメータを使うページです。

- `/posts/a001` → `app/app/posts/[postNo]/page.tsx`

### 4-4. `app/api/**/route.ts` は API

UI ページとは別に、JSON を返すルートを定義できます。

- 例: `GET /api/posts`

---

## 5. `blog2` を読むときのおすすめ順

いきなり全部読むと混乱しやすいので、次の順で見ていきます。

1. `app/app/layout.tsx`（全体の枠）
2. `app/app/posts/page.tsx`（一覧の主処理）
3. `app/components/PostListPager.tsx`（一覧の部品）
4. `app/lib/data/posts.ts`（DB 取得の実体）
5. `app/app/api/posts/route.ts`（API 版）
6. `app/prisma/schema.prisma`（DB 定義）

この順にすると、**画面 → 部品 → データ取得 → DB** の流れで理解できます。

---

## 6. 初心者が混乱しやすいポイント

### 6-1. `app/app/` が気持ち悪い

これはよくある反応です。  
外側の `app/` は「プロジェクトフォルダ名」、内側の `app/` は「App Router の仕様名」です。

### 6-2. API を使うべきか、直接 `lib/data` を呼ぶべきか

このプロジェクトは両方使います。

- サーバーコンポーネントから直接 `lib/data`
- もしくは Route Handler 経由で fetch

どちらも正解ですが、**チームで方針をそろえる**ことが大事です。

### 6-3. どこで `npm run dev` するか間違える

ルート直下 (`blog2/`) ではなく、**`blog2/app/` で実行**します。

```bash
cd app
npm run dev
```

---

## 7. ミニ演習（5分）

実際に次の3つをやってみてください。

1. `app/app/posts/page.tsx` を開き、見出しテキストを1文字だけ変更
2. ブラウザで `/posts` をリロードして反映確認
3. 元に戻す

この演習で、**どのファイルがどの画面に効くか**の感覚がつかめます。

---

## 8. ここまでの確認チェックリスト

- [ ] `app/app/` が App Router 本体だと説明できる
- [ ] `components` と `lib` の役割の違いを説明できる
- [ ] `schema.prisma` の場所を即答できる
- [ ] `npm run dev` を `app/` 配下で実行できる
- [ ] `posts/page.tsx` と `/posts` の対応がわかる

---

## 9. 章末まとめ

第2章では、`blog2` を読むための地図を作りました。  
特に重要なのは次の3点です。

- `app/app/` はページと API の入口
- `components` は見た目、`lib` は処理
- 実行コマンドは基本 `cd app` してから

次章では、この地図を使って **レイアウトとページ（`layout.tsx` / `page.tsx`）** を具体的に読み解きます。

