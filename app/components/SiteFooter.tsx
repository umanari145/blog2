import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="shrink-0 border-t border-ink-200 bg-white/80 dark:border-ink-800 dark:bg-ink-900/80">
      <div className="mx-auto max-w-4xl px-6 py-12 lg:px-10">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-sm font-semibold text-ink-900 dark:text-ink-100">
              blog2
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-500 dark:text-ink-400">
              個人ブログの実験場です。記事データは開発用のモックを表示しています。
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-400 dark:text-ink-500">
              ナビゲーション
            </p>
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-ink-600 hover:text-accent dark:text-ink-300 dark:hover:text-accent-light"
                >
                  ホーム
                </Link>
              </li>
              <li>
                <Link
                  href="/posts"
                  className="text-ink-600 hover:text-accent dark:text-ink-300 dark:hover:text-accent-light"
                >
                  記事一覧
                </Link>
              </li>
            </ul>
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-400 dark:text-ink-500">
              スタック
            </p>
            <p className="mt-3 text-sm text-ink-500 dark:text-ink-400">
              Next.js · Tailwind CSS · Prisma · MySQL
            </p>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-ink-200/80 pt-8 text-xs text-ink-400 dark:border-ink-800 sm:flex-row dark:text-ink-500">
          <p>© {new Date().getFullYear()} blog2</p>
          <p className="text-center sm:text-right">
            このサイトはダークモード（システム設定）に追従します。
          </p>
        </div>
      </div>
    </footer>
  );
}
