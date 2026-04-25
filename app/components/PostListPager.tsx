import Link from "next/link";
import { postsListHref } from "@/lib/postsListHref";

type PostListPagerProps = {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  categoryId: number | null;
  tagId: number | null;
  searchQuery: string | null;
};

function hrefForPage(
  categoryId: number | null,
  tagId: number | null,
  searchQuery: string | null,
  targetPage: number,
) {
  return postsListHref({
    categoryId,
    tagId,
    page: targetPage,
    q: searchQuery,
  });
}

/** 先頭 2 ページ・現在・末尾 2 ページを基準に並べ、飛びがあれば省略 */
function pagerSegments(
  current: number,
  totalPages: number,
): ({ kind: "page"; n: number } | { kind: "ellipsis" })[] {
  const want = new Set<number>();
  want.add(1);
  if (totalPages >= 2) want.add(2);
  want.add(current);
  want.add(totalPages);
  if (totalPages >= 2) want.add(totalPages - 1);

  const nums = [...want]
    .filter((n) => n >= 1 && n <= totalPages)
    .sort((a, b) => a - b);

  const out: ({ kind: "page"; n: number } | { kind: "ellipsis" })[] = [];
  for (let i = 0; i < nums.length; i++) {
    const n = nums[i];
    if (i > 0 && n - nums[i - 1]! > 1) {
      out.push({ kind: "ellipsis" });
    }
    out.push({ kind: "page", n });
  }
  return out;
}

/** 記事一覧のページ送り（10 件ずつ想定） */
export function PostListPager({
  page,
  totalPages,
  total,
  pageSize,
  categoryId,
  tagId,
  searchQuery,
}: PostListPagerProps) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const navBtnClass =
    "inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg border border-ink-200/90 bg-white px-3 text-sm font-medium text-ink-700 transition hover:border-accent/40 hover:bg-accent-muted/50 dark:border-ink-600 dark:bg-ink-800 dark:text-ink-200 dark:hover:border-accent-light/30 dark:hover:bg-ink-700";
  const disabledClass =
    "inline-flex min-h-9 min-w-9 cursor-not-allowed items-center justify-center rounded-lg border border-ink-100/90 bg-ink-50/80 px-3 text-sm text-ink-300 dark:border-ink-800 dark:bg-ink-900/50 dark:text-ink-600";
  const pageLinkClass =
    "inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg border border-ink-200/90 bg-white px-2.5 text-sm font-medium tabular-nums text-ink-700 transition hover:border-accent/40 hover:bg-accent-muted/50 dark:border-ink-600 dark:bg-ink-800 dark:text-ink-200 dark:hover:border-accent-light/30 dark:hover:bg-ink-700";
  const pageCurrentClass =
    "inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg border border-accent/50 bg-accent-muted/90 px-2.5 text-sm font-semibold tabular-nums text-accent-dark dark:border-accent-light/40 dark:bg-accent-dark/30 dark:text-accent-light";

  const segments = pagerSegments(page, totalPages);

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
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
          {page > 1 ? (
            <Link
              href={hrefForPage(categoryId, tagId, searchQuery, page - 1)}
              className={navBtnClass}
              rel="prev"
            >
              前へ
            </Link>
          ) : (
            <span className={disabledClass} aria-disabled="true">
              前へ
            </span>
          )}

          <div
            className="flex flex-wrap items-center justify-center gap-1"
            role="list"
          >
            {segments.map((seg, i) =>
              seg.kind === "ellipsis" ? (
                <span
                  key={`e-${i}`}
                  className="px-1.5 text-sm text-ink-400 dark:text-ink-500"
                  aria-hidden
                >
                  …
                </span>
              ) : seg.n === page ? (
                <span
                  key={seg.n}
                  role="listitem"
                  aria-current="page"
                  className={pageCurrentClass}
                >
                  {seg.n}
                </span>
              ) : (
                <Link
                  key={seg.n}
                  role="listitem"
                  href={hrefForPage(categoryId, tagId, searchQuery, seg.n)}
                  className={pageLinkClass}
                >
                  {seg.n}
                </Link>
              ),
            )}
          </div>

          {page < totalPages ? (
            <Link
              href={hrefForPage(categoryId, tagId, searchQuery, page + 1)}
              className={navBtnClass}
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
