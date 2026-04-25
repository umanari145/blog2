import Link from "next/link";
import { postsListHref } from "@/lib/postsListHref";

type PreserveQuery = { tagId?: number | null; q?: string | null };

type Props = {
  id: number;
  name: string;
  current?: boolean;
  /** 記事一覧でタグ・検索語を維持するとき */
  preserveQuery?: PreserveQuery;
};

/** 記事一覧・詳細のカテゴリピル。`/posts?categoryId=` で同カテゴリの記事一覧へ */
export function CategoryPillLink({ id, name, current, preserveQuery }: Props) {
  return (
    <Link
      href={postsListHref({
        categoryId: id,
        tagId: preserveQuery?.tagId ?? undefined,
        q: preserveQuery?.q,
      })}
      aria-current={current ? "page" : undefined}
      className={`inline-flex rounded-md px-2.5 py-0.5 text-[11px] font-semibold outline-none ring-accent transition focus-visible:ring-2 ${
        current
          ? "bg-accent text-white shadow-sm dark:bg-accent-light dark:text-ink-900"
          : "bg-accent-muted/90 text-accent-dark hover:brightness-95 dark:bg-accent-dark/35 dark:text-accent-light dark:hover:brightness-110"
      }`}
    >
      {name}
    </Link>
  );
}
