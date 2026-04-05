# blog2

Next.js を想定したブログ／アプリ用リポジトリです。

## ディレクトリ構成

### リポジトリ直下（`blog2/`）

| パス | 役割 |
|------|------|
| `Dockerfile` | アプリ用 Node コンテナのイメージ定義 |
| `docker-compose.yml` | アプリ（`app`）・MySQL（`db`）・phpMyAdmin などの起動定義 |
| `db/` | MySQL 向けの初期化 SQL。Compose では `db/init/` がコンテナの `docker-entrypoint-initdb.d` にマウントされるので、**初回起動時に自動実行したい SQL は `db/init/` 配下**に置く |
| `app/` | **アプリケーションの本体**（Next.js・Prisma・スクリプト・設定の中心） |
| `prisma/`・`src/`（ルート） | 現状は未使用のプレースホルダ。スキーマや生成クライアントは **`app/` 側**を参照 |

### アプリプロジェクト（`app/` 配下・リポジトリルートからのパス）

| パス | 役割 |
|------|------|
| `app/app/` | Next.js の **App Router**（`layout.tsx`・`page.tsx`・`posts/` など） |
| `app/components/` | サイト共通 UI（サイドバー・フッター・モバイルヘッダーなど） |
| `app/lib/` | 共通ロジック（例: `prisma.ts`・`postExcerpt.ts`） |
| `app/prisma/` | **`schema.prisma`** と **`migrations/`** |
| `app/prisma.config.ts` | Prisma CLI 用設定（接続 URL など） |
| `app/convert/` | JSON から DB へ投入する `import.ts` と `convert/src/` の元データ |
| `app/src/generated/prisma/` | `prisma generate` の出力（**.gitignore 対象**） |
| `app/` 直下の各種設定 | `package.json`・`tsconfig.json`・`tailwind.config.ts`・`postcss.config.mjs`・`.env`（秘密情報はコミットしない） |

作業するときは **`cd app`** してから `npm run dev` や `npx prisma` を実行する想定です。

## 技術スタック

| カテゴリ | 技術 |
|----------|------|
| フロントエンド | Next.js（想定） |
| 言語 | TypeScript |
| ランタイム | Node.js 22（Dockerfile ベースイメージ） |
| ORM | Prisma 7（`@prisma/client`） |
| DB 接続（Prisma 7） | `@prisma/adapter-mariadb` + `mariadb` ドライバ |
| データベース | MySQL 8.0 |
| コンテナ | Docker / Docker Compose |
| DB 管理 UI | phpMyAdmin（Compose サービス） |
| データ投入 | `tsx` による `app/convert/import.ts`（JSON → Prisma） |

補足:

- アプリ本体は `app/` 配下。Prisma のスキーマは `app/prisma/schema.prisma`、設定は `app/prisma.config.ts`。
- コンテナ内から DB へは `DATABASE_URL` のホスト名 `db`（サービス名）で接続します。

## 環境構築

### prisma
migrateコマンド
```
npx prisma migrate dev 
```
エラーが出た場合、database作成権限がない
```
Error: P3014

Prisma Migrate could not create the shadow database. Please make sure the database user has permission to create databases. Read more about the shadow database (and workarounds) at https://pris.ly/d/migrate-shadow

Original error: Error code: P1010

User was denied access on the database `prisma_migrate_shadow_db_f1ceabff-6fc3-49f3-b971-451362c20bfe`

```
rootユーザーでmysqlに入って、
```
GRANT CREATE, ALTER, DROP, REFERENCES ON *.* TO 'blog_user'@'%';
FLUSH PRIVILEGES;
```
実行


テストデータを入れる際の工夫
```
npx tsx convert/import.ts --test
npx tsx convert/import.ts --test=25

```


