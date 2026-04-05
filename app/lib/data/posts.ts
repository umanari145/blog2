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
