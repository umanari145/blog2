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
  /** タイトル・本文の部分一致（事前に trim・長さ制限済みを想定） */
  search?: string;
};

/** 検索クエリの最大文字数（URL・負荷対策） */
export const POST_SEARCH_Q_MAX_LEN = 200;

export function normalizePostSearchQuery(
  raw: string | string[] | undefined,
): string | undefined {
  if (raw == null) return undefined;
  const s = (Array.isArray(raw) ? raw[0] : raw).trim();
  if (s.length === 0) return undefined;
  return s.slice(0, POST_SEARCH_Q_MAX_LEN);
}

/** 記事一覧ページの 1 ページあたり件数 */
export const POST_LIST_PAGE_SIZE = 10;

export type PagedPostList = {
  items: PostListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

/** カテゴリ・タグ・キーワード検索を AND で合成。条件なしなら null */
function buildPostListWhere(filter: PostListFilter): object | null {
  const parts: object[] = [];
  if (filter.categoryId != null) {
    parts.push({ categories: { some: { id: filter.categoryId } } });
  }
  if (filter.tagId != null) {
    parts.push({ tags: { some: { id: filter.tagId } } });
  }
  const q = filter.search?.trim();
  if (q != null && q.length > 0) {
    parts.push({
      OR: [{ title: { contains: q } }, { contents: { contains: q } }],
    });
  }
  if (parts.length === 0) return null;
  if (parts.length === 1) return parts[0] as object;
  return { AND: parts };
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

/** カテゴリ・タグ・検索語のいずれかで絞り込み（すべて未指定なら全件＝ getPostList と同等） */
export async function getPostListFiltered(
  filter: PostListFilter,
): Promise<PostListItem[]> {
  const where = buildPostListWhere(filter);
  if (where == null) {
    return getPostList();
  }

  const prisma = getPrisma();
  const rows = await prisma.post.findMany({
    // Prisma の Where 型と object 合成の両立（生成クライアントに依存）
    where: where as never,
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
  const where = (buildPostListWhere(filter) ?? {}) as never;
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
