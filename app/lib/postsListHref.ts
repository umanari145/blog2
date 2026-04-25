export type PostsListHrefParams = {
  categoryId?: number | null;
  tagId?: number | null;
  page?: number;
  /** タイトル・本文検索クエリ（空・空白のみは無視） */
  q?: string | null;
};

/** 記事一覧 `/posts` のクエリ付き URL を組み立てる */
export function postsListHref(p: PostsListHrefParams): string {
  const params = new URLSearchParams();
  if (p.categoryId != null) params.set("categoryId", String(p.categoryId));
  if (p.tagId != null) params.set("tagId", String(p.tagId));
  if (p.page != null && p.page > 1) params.set("page", String(p.page));
  const q = p.q?.trim();
  if (q) params.set("q", q);
  const s = params.toString();
  return s ? `/posts?${s}` : "/posts";
}
