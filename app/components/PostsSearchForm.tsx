"use client";

import { useSearchParams } from "next/navigation";

type Variant = "sidebar" | "mobile";

/** 記事タイトル・本文検索（GET `q`）。親で `<Suspense>` でラップすること。 */
export function PostsSearchForm({ variant }: { variant: Variant }) {
  const sp = useSearchParams();
  const q = sp.get("q") ?? "";
  const inputId =
    variant === "sidebar" ? "sidebar-post-search" : "mobile-post-search";

  return (
    <form
      key={sp.toString()}
      action="/posts"
      method="get"
      className={
        variant === "sidebar"
          ? "flex flex-col gap-2"
          : "flex min-w-0 flex-1 items-center gap-1.5"
      }
      role="search"
    >
      {variant === "sidebar" ? (
        <label
          htmlFor={inputId}
          className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-400 dark:text-ink-500"
        >
          記事を検索
        </label>
      ) : null}
      <div
        className={
          variant === "sidebar"
            ? "flex gap-1.5"
            : "flex min-w-0 flex-1 items-center gap-1.5"
        }
      >
        <input
          id={inputId}
          name="q"
          type="search"
          enterKeyHint="search"
          placeholder={
            variant === "sidebar" ? "タイトル・本文" : "タイトル・本文で検索"
          }
          defaultValue={q}
          maxLength={200}
          className={
            variant === "sidebar"
              ? "min-w-0 flex-1 rounded-lg border border-ink-200/90 bg-white px-2.5 py-2 text-sm text-ink-800 shadow-sm outline-none ring-accent placeholder:text-ink-400 focus:border-accent/50 focus:ring-2 dark:border-ink-600 dark:bg-ink-800 dark:text-ink-100 dark:placeholder:text-ink-500"
              : "min-w-0 flex-1 rounded-md border border-ink-200/90 bg-white px-2 py-1.5 text-xs text-ink-800 outline-none ring-accent placeholder:text-ink-400 focus:ring-2 dark:border-ink-600 dark:bg-ink-800 dark:text-ink-100"
          }
        />
        <button
          type="submit"
          className={
            variant === "sidebar"
              ? "shrink-0 rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-accent-light dark:hover:brightness-110"
              : "shrink-0 rounded-md bg-accent px-2.5 py-1.5 text-[11px] font-semibold text-white"
          }
        >
          検索
        </button>
      </div>
    </form>
  );
}

/** サイドバー用（親で Suspense 必須） */
export function SidebarSearchForm() {
  return <PostsSearchForm variant="sidebar" />;
}
