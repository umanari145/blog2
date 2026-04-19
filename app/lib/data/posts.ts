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

  return mapPostRows(rows);
}

export type PostListFilter = {
  categoryId?: number;
  tagId?: number;
};

/** 記事一覧ページの 1 ページあたり件数 */
export const POST_LIST_PAGE_SIZE = 10;

export type PagedPostList = {
  items: PostListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

function buildFilterWhere(
  filter: PostListFilter,
):
  | {
      categories?: { some: { id: number } };
      tags?: { some: { id: number } };
    }
  | undefined {
  const hasCat = filter.categoryId != null;
  const hasTag = filter.tagId != null;
  if (!hasCat && !hasTag) return undefined;
  const where: {
    categories?: { some: { id: number } };
    tags?: { some: { id: number } };
  } = {};
  if (hasCat) {
    where.categories = { some: { id: filter.categoryId! } };
  }
  if (hasTag) {
    where.tags = { some: { id: filter.tagId! } };
  }
  return where;
}

function mapPostRows(
  rows: {
    id: string;
    postNo: string;
    title: string;
    contents: string;
    postDate: Date;
    categories: { id: number; name: string }[];
    tags: { id: number; name: string }[];
  }[],
): PostListItem[] {
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

/** カテゴリ・タグのいずれかまたは両方で絞り込み（未指定なら全件＝ getPostList と同等） */
export async function getPostListFiltered(
  filter: PostListFilter,
): Promise<PostListItem[]> {
  const where = buildFilterWhere(filter);
  if (where == null) {
    return getPostList();
  }

  const prisma = getPrisma();
  const rows = await prisma.post.findMany({
    where,
    orderBy: { postDate: "desc" },
    include: {
      categories: { select: { id: true, name: true } },
      tags: { select: { id: true, name: true } },
    },
  });

  return mapPostRows(rows);
}

/**
 * 記事一覧（ページング）。`filter` が空なら全件対象。
 * 存在しないページ番号は最終ページに丸めます。
 */
export async function getPostListFilteredPage(
  filter: PostListFilter,
  requestedPage: number,
  pageSize: number = POST_LIST_PAGE_SIZE,
): Promise<PagedPostList> {
  const prisma = getPrisma();
  const where = buildFilterWhere(filter) ?? {};
  const safeSize = Math.min(100, Math.max(1, Math.floor(pageSize)));
  const total = await prisma.post.count({ where });
  const totalPages = total === 0 ? 1 : Math.ceil(total / safeSize);

  let page = Number.isFinite(requestedPage) ? Math.floor(requestedPage) : 1;
  if (page < 1) page = 1;
  if (page > totalPages) page = totalPages;
  const skip = (page - 1) * safeSize;

  const rows = await prisma.post.findMany({
    where,
    orderBy: { postDate: "desc" },
    skip,
    take: safeSize,
    include: {
      categories: { select: { id: true, name: true } },
      tags: { select: { id: true, name: true } },
    },
  });

  return {
    items: mapPostRows(rows),
    total,
    page,
    pageSize: safeSize,
    totalPages,
  };
}
