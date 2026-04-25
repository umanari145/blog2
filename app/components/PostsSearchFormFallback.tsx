import type { ReactNode } from "react";

type Variant = "sidebar" | "mobile";

/** `PostsSearchForm` 用 Suspense fallback（サーバー・クライアントどちらでも可） */
export function PostsSearchFormFallback({
  variant,
}: {
  variant: Variant;
}): ReactNode {
  return (
    <div
      className={
        variant === "sidebar"
          ? "h-[4.5rem] rounded-lg bg-ink-100/80 dark:bg-ink-800/60"
          : "h-8 min-w-[8rem] flex-1 rounded-md bg-ink-100/80 dark:bg-ink-800/60"
      }
      aria-hidden
    />
  );
}
