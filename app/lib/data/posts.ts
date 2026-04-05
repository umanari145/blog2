import { getPrisma } from "@/lib/prisma";
import { excerptFromContents } from "@/lib/postExcerpt";

export type PostListItem = {
  id: string;
  postNo: string;
  title: string;
  postDate: Date;
  excerpt: string;
  categories: { id: number; name: string }[];
  tags: { id: number; name: string }[];
};

export type PostDetail = {
  id: string;
  postNo: string;
  title: string;
  contents: string;
  postDate: Date;
  categories: { id: number; name: string }[];
  tags: { id: number; name: string }[];
};

/** 記事詳細（postNo はスキーマ上 @unique） */
export async function getPostByPostNo(
  postNo: string,
): Promise<PostDetail | null> {
  const prisma = getPrisma();
  const row = await prisma.post.findUnique({
    where: { postNo },
    include: {
      categories: { select: { id: true, name: true } },
      tags: { select: { id: true, name: true } },
    },
  });
  if (!row) return null;
  return {
    id: row.id,
    postNo: row.postNo,
    title: row.title,
    contents: row.contents,
    postDate: row.postDate,
    categories: row.categories,
    tags: row.tags,
  };
}

/** 記事一覧（サーバーコンポーネント・Route Handler 共通） */
export async function getPostList(): Promise<PostListItem[]> {
  const prisma = getPrisma();
  const rows = await prisma.post.findMany({
    orderBy: { postDate: "desc" },
    include: {
      categories: { select: { id: true, name: true } },
      tags: { select: { id: true, name: true } },
    },
  });

  return rows.map((p) => ({
    id: p.id,
    postNo: p.postNo,
    title: p.title,
    postDate: p.postDate,
    excerpt: excerptFromContents(p.contents),
    categories: p.categories,
    tags: p.tags,
  }));
}
