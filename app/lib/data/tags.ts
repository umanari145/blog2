import { getPrisma } from "@/lib/prisma";

export type TagWithPostCount = {
  id: number;
  name: string;
  postCount: number;
};

/** tags テーブル一覧＋各タグに紐づく記事数（多対多） */
export async function getTagsWithPostCount(): Promise<TagWithPostCount[]> {
  const prisma = getPrisma();
  const rows = await prisma.tag.findMany({
    orderBy: { id: "asc" },
    include: {
      _count: { select: { posts: true } },
    },
  });
  return rows.map((t) => ({
    id: t.id,
    name: t.name,
    postCount: t._count.posts,
  }));
}

export async function getTagById(
  id: number,
): Promise<{ id: number; name: string } | null> {
  const prisma = getPrisma();
  return prisma.tag.findUnique({
    where: { id },
    select: { id: true, name: true },
  });
}
