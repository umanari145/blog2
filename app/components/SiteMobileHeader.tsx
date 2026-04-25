import Link from "next/link";
import { Suspense } from "react";
import { PostsSearchForm } from "@/components/PostsSearchForm";
import { PostsSearchFormFallback } from "@/components/PostsSearchFormFallback";

export function SiteMobileHeader() {
  return (
    <header className="sticky top-0 z-30 flex shrink-0 flex-col gap-2 border-b border-ink-200/80 bg-white/90 px-4 py-3 backdrop-blur-md dark:border-ink-700 dark:bg-ink-900/90 md:hidden">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/posts"
          className="flex shrink-0 items-center gap-2 font-bold tracking-tight text-ink-900 dark:text-ink-50"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-xs font-bold text-white">
            B
          </span>
          blog2
        </Link>
        <nav className="flex shrink-0 gap-1 text-sm font-medium" aria-label="モバイルナビ">
          <Link
            href="/"
            className="rounded-md px-2 py-1 text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800"
          >
            ホーム
          </Link>
          <Link
            href="/posts"
            className="rounded-md px-2 py-1 text-accent-dark hover:bg-accent-muted/60 dark:text-accent-light dark:hover:bg-ink-800"
          >
            記事
          </Link>
        </nav>
      </div>
      <Suspense fallback={<PostsSearchFormFallback variant="mobile" />}>
        <PostsSearchForm variant="mobile" />
      </Suspense>
    </header>
  );
}
