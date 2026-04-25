import Link from "next/link";
import { postsListHref } from "@/lib/postsListHref";

type PreserveQuery = { categoryId?: number | null; q?: string | null };

type Props = {
  id: number;
  name: string;
  current?: boolean;
  preserveQuery?: PreserveQuery;
};

/** 記事一覧・詳細のタグピル。`/posts?tagId=` で同タグの記事一覧へ */
export function TagPillLink({ id, name, current, preserveQuery }: Props) {
  return (
    <Link
      href={postsListHref({
        tagId: id,
        categoryId: preserveQuery?.categoryId ?? undefined,
        q: preserveQuery?.q,
      })}
      aria-current={current ? "page" : undefined}
      className={`inline-flex rounded-md px-2.5 py-0.5 text-[11px] font-medium outline-none ring-accent transition focus-visible:ring-2 ${
        current
          ? "bg-ink-700 text-white ring-1 ring-ink-600 dark:bg-ink-200 dark:text-ink-900 dark:ring-ink-300"
          : "bg-ink-100/90 text-ink-600 ring-1 ring-ink-200/80 hover:bg-ink-200/90 dark:bg-ink-700/80 dark:text-ink-300 dark:ring-ink-600 dark:hover:bg-ink-600/80"
      }`}
    >
      #{name}
    </Link>
  );
}
