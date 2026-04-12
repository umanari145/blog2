import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryPillLink } from "@/components/CategoryPillLink";
import { fetchPostDetailFromApi } from "@/lib/api/postDetail";
import { excerptFromContents } from "@/lib/postExcerpt";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ postNo: string }>;
};

function formatDate(isoOrDate: string | Date) {
  const d = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  const iso = d.toISOString().slice(0, 10);
  const parsed = new Date(`${iso}T12:00:00`);
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(parsed);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { postNo: raw } = await params;
  const postNo = decodeURIComponent(raw);
  try {
    const post = await fetchPostDetailFromApi(postNo);
    if (!post) {
      return { title: "記事が見つかりません" };
    }
    return {
      title: post.title,
      description: excerptFromContents(post.contents, 120),
    };
  } catch {
    return { title: "記事の取得に失敗しました" };
  }
}

export default async function PostDetailPage({ params }: PageProps) {
  const { postNo: raw } = await params;
  const postNo = decodeURIComponent(raw);

  let post: Awaited<ReturnType<typeof fetchPostDetailFromApi>> = null;
  let loadError: string | null = null;
  try {
    post = await fetchPostDetailFromApi(postNo);
  } catch (e) {
    loadError =
      e instanceof Error ? e.message : "記事 API の取得に失敗しました。";
  }

  if (loadError) {
    return (
      <div className="mx-auto w-full max-w-lg px-5 py-12 md:px-8">
        <nav className="mb-8 text-sm">
          <Link
            href="/posts"
            className="font-medium text-accent hover:text-accent-dark dark:text-accent-light"
          >
            ← 記事一覧
          </Link>
        </nav>
        <div
          className="rounded-xl border border-amber-200/90 bg-amber-50/90 p-4 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100"
          role="alert"
        >
          <p className="font-medium">記事を読み込めませんでした</p>
          <p className="mt-2 text-amber-900/90 dark:text-amber-200/90">
            {loadError}
          </p>
        </div>
      </div>
    );
  }

  if (!post) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-10 md:px-8 md:py-14 lg:max-w-4xl lg:px-12">
      <nav className="mb-8 text-sm">
        <Link
          href="/posts"
          className="font-medium text-accent hover:text-accent-dark dark:text-accent-light dark:hover:text-accent"
        >
          ← 記事一覧
        </Link>
      </nav>

      <article>
        <header className="mb-10 border-b border-ink-200/90 pb-8 dark:border-ink-700/90">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-accent dark:text-accent-light">
            Journal
          </p>
          <h1 className="bg-gradient-to-br from-ink-900 to-ink-600 bg-clip-text text-2xl font-bold tracking-tight text-transparent dark:from-ink-100 dark:to-ink-400 md:text-4xl">
            {post.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500 dark:text-ink-400">
            <time
              dateTime={post.postDate}
              className="font-medium text-ink-600 dark:text-ink-300"
            >
              {formatDate(post.postDate)}
            </time>
            <span className="hidden sm:inline text-ink-300 dark:text-ink-600">
              ·
            </span>
            <span className="font-mono text-[11px] text-ink-400 dark:text-ink-500">
              {post.postNo}
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {post.categories.map((c) => (
              <CategoryPillLink
                key={c.id}
                id={c.id}
                name={c.name}
              />
            ))}
            {post.tags.map((t) => (
              <span
                key={t.id}
                className="rounded-md bg-ink-100/90 px-2.5 py-0.5 text-[11px] font-medium text-ink-600 ring-1 ring-ink-200/80 dark:bg-ink-700/80 dark:text-ink-300 dark:ring-ink-600"
              >
                #{t.name}
              </span>
            ))}
          </div>
        </header>

        <div
          className="prose prose-neutral max-w-none dark:prose-invert prose-headings:scroll-mt-24 prose-a:text-accent prose-img:rounded-lg dark:prose-a:text-accent-light"
          dangerouslySetInnerHTML={{ __html: post.contents }}
        />
      </article>
    </div>
  );
}
