import Link from "next/link";

type Props = { id: number; name: string; current?: boolean };

/** 記事一覧・詳細のカテゴリピル。`/posts?categoryId=` で同カテゴリの記事一覧へ */
export function CategoryPillLink({ id, name, current }: Props) {
  return (
    <Link
      href={`/posts?categoryId=${id}`}
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
