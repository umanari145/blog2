import { getPrisma } from "@/lib/prisma";

export type CategoryWithPostCount = {
  id: number;
  name: string;
  postCount: number;
};

/** categories テーブル一覧＋各カテゴリに紐づく記事数（多対多の件数） */
export async function getCategoriesWithPostCount(): Promise<
  CategoryWithPostCount[]
> {
  const prisma = getPrisma();
  const rows = await prisma.category.findMany({
    orderBy: { id: "asc" },
    include: {
      _count: { select: { posts: true } },
    },
  });
  return rows.map((c) => ({
    id: c.id,
    name: c.name,
    postCount: c._count.posts,
  }));
}

export async function getCategoryById(
  id: number,
): Promise<{ id: number; name: string } | null> {
  const prisma = getPrisma();
  return prisma.category.findUnique({
    where: { id },
    select: { id: true, name: true },
  });
}
