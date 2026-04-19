import Link from "next/link";

type PostListPagerProps = {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  categoryId: number | null;
  tagId: number | null;
};

function hrefForPage(
  categoryId: number | null,
  tagId: number | null,
  targetPage: number,
) {
  const params = new URLSearchParams();
  if (categoryId != null) params.set("categoryId", String(categoryId));
  if (tagId != null) params.set("tagId", String(tagId));
  if (targetPage > 1) params.set("page", String(targetPage));
  const qs = params.toString();
  return qs ? `/posts?${qs}` : "/posts";
}

/** 記事一覧のページ送り（10 件ずつ想定） */
export function PostListPager({
  page,
  totalPages,
  total,
  pageSize,
  categoryId,
  tagId,
}: PostListPagerProps) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const linkClass =
    "inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg border border-ink-200/90 bg-white px-3 text-sm font-medium text-ink-700 transition hover:border-accent/40 hover:bg-accent-muted/50 dark:border-ink-600 dark:bg-ink-800 dark:text-ink-200 dark:hover:border-accent-light/30 dark:hover:bg-ink-700";
  const disabledClass =
    "inline-flex min-h-9 min-w-9 cursor-not-allowed items-center justify-center rounded-lg border border-ink-100/90 bg-ink-50/80 px-3 text-sm text-ink-300 dark:border-ink-800 dark:bg-ink-900/50 dark:text-ink-600";

  return (
    <nav
      className="mt-12 flex flex-col items-center gap-4 border-t border-ink-200/90 pt-10 dark:border-ink-700/90"
      aria-label="記事一覧のページ送り"
    >
      <p className="text-center text-sm text-ink-500 dark:text-ink-400">
        {total === 0
          ? "該当する記事はありません。"
          : `全 ${total} 件中 ${from}–${to} 件を表示（1 ページ ${pageSize} 件）`}
      </p>
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {page > 1 ? (
            <Link
              href={hrefForPage(categoryId, tagId, page - 1)}
              className={linkClass}
              rel="prev"
            >
              前へ
            </Link>
          ) : (
            <span className={disabledClass} aria-disabled="true">
              前へ
            </span>
          )}
          <span className="px-3 text-sm tabular-nums text-ink-600 dark:text-ink-300">
            {page} / {totalPages}
          </span>
          {page < totalPages ? (
            <Link
              href={hrefForPage(categoryId, tagId, page + 1)}
              className={linkClass}
              rel="next"
            >
              次へ
            </Link>
          ) : (
            <span className={disabledClass} aria-disabled="true">
              次へ
            </span>
          )}
        </div>
      )}
    </nav>
  );
}
