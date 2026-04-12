import Link from "next/link";
import { fetchCategoriesFromApi } from "@/lib/api/categoriesFromApi";
import type { CategoryWithPostCount } from "@/lib/data/categories";

const nav = [
  { href: "/", label: "ホーム" },
  { href: "/posts", label: "記事一覧" },
];

export async function SiteSidebar() {
  let categories: CategoryWithPostCount[] = [];
  try {
    categories = await fetchCategoriesFromApi();
  } catch {
    categories = [];
  }

  return (
    <aside className="relative hidden min-h-0 w-full flex-col border-l border-ink-200/80 bg-white/95 backdrop-blur-md dark:border-ink-700 dark:bg-ink-900/95 md:flex">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-accent-muted/40 to-transparent dark:from-accent-dark/20" />
      <div className="relative flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto p-6 lg:p-8">
        <div>
          <Link
            href="/posts"
            className="group inline-flex items-center gap-2 rounded-lg outline-none ring-accent focus-visible:ring-2"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white shadow-md shadow-accent/25 transition group-hover:bg-accent-light">
              B
            </span>
            <span className="font-bold tracking-tight text-ink-900 dark:text-ink-50">
              blog2
            </span>
          </Link>
          <p className="mt-3 text-xs leading-relaxed text-ink-500 dark:text-ink-400">
            技術メモと開発の記録。Next.js · Prisma · MySQL。
          </p>
        </div>

        <nav className="flex flex-col gap-1" aria-label="メインナビ">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-ink-600 transition hover:bg-accent-muted/80 hover:text-accent-dark dark:text-ink-300 dark:hover:bg-ink-800 dark:hover:text-accent-light"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div>
          <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-400 dark:text-ink-500">
            カテゴリ
          </h2>
          {categories.length === 0 ? (
            <p className="px-3 text-xs text-ink-400 dark:text-ink-500">
              カテゴリを取得できませんでした。DB 接続を確認してください。
            </p>
          ) : (
            <ul className="flex flex-col gap-1">
              {categories.map((c) => (
                <li key={c.id}>
                  <span className="flex items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-sm text-ink-600 dark:text-ink-300">
                    <span className="min-w-0 truncate">{c.name}</span>
                    <span className="shrink-0 tabular-nums text-xs text-ink-400 dark:text-ink-500">
                      {c.postCount} 件
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-auto rounded-xl border border-dashed border-ink-200/90 bg-ink-50/80 p-4 dark:border-ink-700 dark:bg-ink-800/50">
          <p className="text-[11px] leading-relaxed text-ink-500 dark:text-ink-400">
            カテゴリは{" "}
            <code className="rounded bg-ink-200/60 px-1 dark:bg-ink-700">
              categories
            </code>{" "}
            テーブルから取得しています。
          </p>
        </div>
      </div>
    </aside>
  );
}
