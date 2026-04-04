import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { config } from "dotenv";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "../src/generated/prisma/client.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

config({ path: join(__dirname, "..", ".env") });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error(
    "DATABASE_URL が .env にありません（app/.env を確認してください）。",
  );
  process.exit(1);
}

const adapter = new PrismaMariaDb(databaseUrl);
const prisma = new PrismaClient({ adapter });

type LabelRow = {
  no: number;
  name: string;
  type: string;
};

type PostRow = {
  title: string;
  contents: string;
  post_date: string;
  post_no: string;
  categories: number[];
  tags: number[];
};

function loadJson<T>(relativeToConvertSrc: string): T {
  const path = join(__dirname, "src", relativeToConvertSrc);
  return JSON.parse(readFileSync(path, "utf-8")) as T;
}

const DEFAULT_TEST_POST_LIMIT = 20;

function parsePostTestLimit(): number | undefined {
  const argv = process.argv.slice(2);
  const flag = argv.find((a) => a === "--test" || a.startsWith("--test="));
  if (!flag) return undefined;
  if (flag === "--test") return DEFAULT_TEST_POST_LIMIT;
  const n = Number.parseInt(flag.slice("--test=".length), 10);
  if (!Number.isFinite(n) || n < 1) return DEFAULT_TEST_POST_LIMIT;
  return n;
}

async function main() {
  const labels = loadJson<LabelRow[]>("blog.labels.json");

  const categoryRows = labels
    .filter((l) => l.type === "category")
    .map((l) => ({ id: l.no, name: l.name }));

  const tagRows = labels
    .filter((l) => l.type === "post_tag")
    .map((l) => ({ id: l.no, name: l.name }));

  if (categoryRows.length > 0) {
    const r = await prisma.category.createMany({
      data: categoryRows,
      skipDuplicates: true,
    });
    console.log(
      `categories: createMany で ${r.count} 件を新規挿入（既存 id はスキップ）`,
    );
  }

  if (tagRows.length > 0) {
    const r = await prisma.tag.createMany({
      data: tagRows,
      skipDuplicates: true,
    });
    console.log(
      `tags: createMany で ${r.count} 件を新規挿入（既存 id はスキップ）`,
    );
  }

  const allPosts = loadJson<PostRow[]>("blog.posts.json");
  const postTestLimit = parsePostTestLimit();
  const posts =
    postTestLimit !== undefined ? allPosts.slice(0, postTestLimit) : allPosts;

  if (postTestLimit !== undefined) {
    console.log(
      `テストモード: posts は先頭 ${posts.length} 件のみ登録（全 ${allPosts.length} 件中）`,
    );
  }

  const total = posts.length;
  let done = 0;

  for (const p of posts) {
    await prisma.post.upsert({
      where: { postNo: p.post_no },
      create: {
        postNo: p.post_no,
        title: p.title,
        contents: p.contents,
        postDate: new Date(p.post_date),
        categories: { connect: p.categories.map((id) => ({ id })) },
        tags: { connect: p.tags.map((id) => ({ id })) },
      },
      update: {
        title: p.title,
        contents: p.contents,
        postDate: new Date(p.post_date),
        categories: { set: p.categories.map((id) => ({ id })) },
        tags: { set: p.tags.map((id) => ({ id })) },
      },
    });
    done += 1;
    if (done % 100 === 0 || done === total) {
      console.log(`posts: ${done}/${total}`);
    }
  }

  console.log("インポート完了");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
