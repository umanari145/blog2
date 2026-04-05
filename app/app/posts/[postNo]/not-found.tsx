import Link from "next/link";

export default function PostNotFound() {
  return (
    <div className="mx-auto w-full max-w-lg px-5 py-16 text-center md:px-8">
      <h1 className="text-xl font-bold text-ink-900 dark:text-ink-100">
        記事が見つかりません
      </h1>
      <p className="mt-3 text-sm text-ink-500 dark:text-ink-400">
        URL が間違っているか、記事が削除された可能性があります。
      </p>
      <Link
        href="/posts"
        className="mt-8 inline-block font-medium text-accent hover:underline dark:text-accent-light"
      >
        記事一覧へ戻る
      </Link>
    </div>
  );
}
