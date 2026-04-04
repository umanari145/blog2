# blog2

Next.js を想定したブログ／アプリ用リポジトリです。

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


