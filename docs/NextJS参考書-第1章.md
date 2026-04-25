# 第1章 Docker とデータベースで開発環境をそろえる

## はじめに

この章では、`blog2` を動かすために必要な開発環境を、**Docker で再現できる形**で作ります。  
初心者の方は、まず「アプリが起動する」ことを最優先にしましょう。

この章を終えると、次の状態になります。

- `http://localhost:3000` で Next.js アプリが開ける
- `http://localhost:8080` で phpMyAdmin が開ける
- MySQL とアプリが Docker 上で接続できる
- Prisma migrate を実行できる

---

## 1. この章で使う構成を先にイメージする

このリポジトリでは、`docker-compose.yml` で3つのサービスを起動します。

- `app` : Next.js（Node.js 22 / ポート 3000）
- `db` : MySQL 8.0（ポート 3306）
- `phpmyadmin` : DB をブラウザで確認する画面（ポート 8080）

ポイントは、**アプリは DB のホスト名に `db` を使う**ことです。  
同じ Docker ネットワーク内では、サービス名で名前解決できるためです。

---

## 2. 事前準備（最初に一度だけ）

### 2-1. 必要ソフト

- Docker Desktop（Mac/Windows）
- Git

まずは Docker が動くか確認します。

```bash
docker --version
docker compose version
```

どちらもバージョンが表示されれば OK です。

### 2-2. リポジトリを開く

```bash
cd /path/to/blog2
ls
```

`docker-compose.yml`、`Dockerfile`、`app/`、`db/` が見えれば準備完了です。

---

## 3. Docker でアプリとDBを起動する

プロジェクトルート（`blog2/`）で実行します。

```bash
docker compose up -d --build
```

初回はイメージビルドで時間がかかることがあります。  
起動確認は次のコマンドで行います。

```bash
docker compose ps
```

`app` / `db` / `phpmyadmin` が `Up` なら OK です。

---

## 4. ブラウザで動作確認する

### 4-1. Next.js アプリ

- [http://localhost:3000](http://localhost:3000) にアクセス

画面が表示されれば、`app` コンテナは正常です。

### 4-2. phpMyAdmin

- [http://localhost:8080](http://localhost:8080) にアクセス

ログインできれば、MySQL へ接続できています。

---

## 5. Prisma の migrate を実行する

このリポジトリでは、Prisma の作業は `app/` ディレクトリで行います。

```bash
cd app
npx prisma migrate dev
```

内部的には `app/prisma/schema.prisma` と `app/prisma.config.ts` が使われます。  
`prisma.config.ts` では `dotenv/config` を読み込んでいるため、`.env` の `DATABASE_URL` が参照されます。

---

## 6. 初心者がつまずきやすいポイント

### 6-1. `P3014`（shadow database が作れない）

`migrate dev` で次のようなエラーが出ることがあります。

- `Prisma Migrate could not create the shadow database`
- `User was denied access`

このリポジトリには `db/01-grant.sql` があり、必要な権限を付与する内容になっています。  
初回起動時に適用される想定ですが、すでに DB ボリュームが作成済みだと反映されない場合があります。

その場合は一度 DB の状態を作り直します。

```bash
cd ..
docker compose down -v
docker compose up -d --build
cd app
npx prisma migrate dev
```

`-v` はボリューム（DBデータ）を削除するため、学習中のみ使うようにしてください。

### 6-2. `DATABASE_URL` のホストを `localhost` にしてしまう

Docker の `app` コンテナから見る DB ホストは `localhost` ではなく **`db`** です。  
`DATABASE_URL` はこの形を守ってください（本リポジトリの既定値）。

- `mysql://<user>:<password>@db:3306/blog`

### 6-3. ポート競合（3000 / 3306 / 8080）

他プロセスが同じポートを使っていると起動に失敗します。  
`docker compose ps` と Docker Desktop のログで、どのサービスが落ちているかを先に確認しましょう。

---

## 7. ここまでの確認チェックリスト

- [ ] `docker compose ps` で3サービスが `Up`
- [ ] `http://localhost:3000` が表示される
- [ ] `http://localhost:8080` が表示される
- [ ] `npx prisma migrate dev` が成功する

---

## 8. 章末まとめ

この章では、Next.js アプリと MySQL を Docker で同時に起動し、Prisma migrate まで実行できる状態を作りました。  
大事なのは次の3点です。

- 起動は `docker compose up -d --build`
- Prisma 実行は `cd app` してから
- Docker 環境の DB ホストは `db`

次章では、この土台の上で **Next.js プロジェクトの骨格（App Router / ディレクトリ構成）** を読み解いていきます。
