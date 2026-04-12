import type { Metadata } from "next";
import Link from "next/link";
import { CategoryPillLink } from "@/components/CategoryPillLink";
import { getCategoryById } from "@/lib/data/categories";
import { getPostList, getPostListByCategoryId, type PostListItem } from "@/lib/data/posts";

type PostsPageProps = {
  searchParams: Promise<{ categoryId?: string | string[] }>;
};

/** DB 参照のためビルド時の静的生成は行わない */
export const dynamic = "force-dynamic";

function parseOptionalCategoryId(
  raw: string | string[] | undefined,
): number | null {
  if (raw == null) return null;
  const s = (Array.isArray(raw) ? raw[0] : raw).trim();
  if (!/^\d+$/.test(s)) return null;
  const n = Number.parseInt(s, 10);
  if (n < 0) return null;
  return n;
}

export async function generateMetadata({
  searchParams,
}: PostsPageProps): Promise<Metadata> {
  const sp = await searchParams;
  const cid = parseOptionalCategoryId(sp.categoryId);
  if (cid != null) {
    const cat = await getCategoryById(cid);
    if (cat) {
      return {
        title: `${cat.name}の記事`,
        description: `カテゴリ「${cat.name}」の記事一覧`,
      };
    }
    return {
      title: "カテゴリ別記事",
      description: "指定したカテゴリの記事一覧",
    };
  }
  return {
    title: "記事一覧",
    description: "ブログ記事の一覧ページ",
  };
}

function formatDate(d: Date) {
  const iso = d.toISOString().slice(0, 10);
  const parsed = new Date(`${iso}T12:00:00`);
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(parsed);
}

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const sp = await searchParams;
  const categoryFilterId = parseOptionalCategoryId(sp.categoryId);

  let posts: PostListItem[] = [];
  let loadError: string | null = null;
  let categoryName: string | null = null;

  try {
    if (categoryFilterId != null) {
      const cat = await getCategoryById(categoryFilterId);
      categoryName = cat?.name ?? null;
      posts = await getPostListByCategoryId(categoryFilterId);
    } else {
      posts = await getPostList();
    }
  } catch (e) {
    loadError =
      e instanceof Error
        ? e.message
        : "データベースから記事を取得できませんでした。";
  }

  const isFiltered = categoryFilterId != null;
  const heading = isFiltered
    ? categoryName
      ? `カテゴリ: ${categoryName}`
      : "カテゴリ別記事"
    : "記事一覧";
  const subline = isFiltered
    ? categoryName
      ? `「${categoryName}」を含む記事のみ表示しています。`
      : "指定の ID に該当するカテゴリはありません（記事 0 件）。"
    : "開発・インフラ・言語まわりのメモを時系列で並べています。データは MySQL（Prisma）から取得しています。";

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-10 md:px-8 md:py-14 lg:max-w-4xl lg:px-12">
      <header className="mb-12 border-b border-ink-200/90 pb-10 dark:border-ink-700/90">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-accent dark:text-accent-light">
          Journal
        </p>
        <h1 className="bg-gradient-to-br from-ink-900 to-ink-600 bg-clip-text text-3xl font-bold tracking-tight text-transparent dark:from-ink-100 dark:to-ink-400 md:text-4xl">
          {heading}
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-500 dark:text-ink-400">
          {subline}
          {!loadError && (
            <span className="mt-2 block font-medium text-ink-600 dark:text-ink-300">
              {isFiltered ? "該当記事" : "登録記事"}: {posts.length} 件
            </span>
          )}
        </p>
        {isFiltered && (
          <p className="mt-3">
            <Link
              href="/posts"
              className="text-sm font-medium text-accent-dark underline-offset-4 hover:underline dark:text-accent-light"
            >
              すべての記事を表示
            </Link>
          </p>
        )}
        <div className="mt-6 flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-ink-600 shadow-sm ring-1 ring-ink-200/80 dark:bg-ink-800/80 dark:text-ink-300 dark:ring-ink-600">
            {loadError ? "—" : `記事 ${posts.length} 件`}
          </span>
          <span className="inline-flex items-center rounded-full bg-accent-muted/90 px-3 py-1 text-xs font-medium text-accent-dark dark:bg-accent-dark/40 dark:text-accent-light">
            {isFiltered ? "カテゴリ絞り込み" : "カードから詳細へ"}
          </span>
        </div>
      </header>

      {loadError ? (
        <div
          className="rounded-xl border border-amber-200/90 bg-amber-50/90 p-4 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100"
          role="alert"
        >
          <p className="font-medium">記事を読み込めませんでした</p>
          <p className="mt-2 text-amber-900/90 dark:text-amber-200/90">
            {loadError}
          </p>
          <p className="mt-2 text-xs text-amber-800/80 dark:text-amber-300/80">
            Docker を使う場合は DB が起動しているか、`DATABASE_URL`
            のホスト（例: コンテナ内なら{" "}
            <code className="rounded bg-amber-100/80 px-1 dark:bg-amber-900/50">
              db
            </code>
            ）を確認してください。
          </p>
        </div>
      ) : posts.length === 0 ? (
        <p className="text-sm text-ink-500 dark:text-ink-400">
          {isFiltered
            ? "このカテゴリに該当する記事はまだありません。"
            : "まだ記事がありません。`convert/import.ts` でデータを投入するか、Prisma Studio などで追加してください。"}
        </p>
      ) : (
        <ul className="flex flex-col gap-6 md:gap-8">
          {posts.map((post, index) => (
            <li key={post.id}>
              <article
                className="group relative overflow-hidden rounded-2xl border border-ink-200/90 bg-white/85 shadow-card backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-card-hover dark:border-ink-700/90 dark:bg-ink-800/60 dark:shadow-card-dark dark:hover:border-accent-light/25 dark:hover:shadow-[0_8px_40px_rgb(0_0_0_/_0.45)]"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-accent/5 transition group-hover:bg-accent/10 dark:bg-accent-light/5 dark:group-hover:bg-accent-light/10" />
                <Link
                  href={`/posts/${encodeURIComponent(post.postNo)}`}
                  className="relative block rounded-2xl p-6 outline-none ring-accent focus-visible:ring-2 md:p-8"
                >
                  <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500 dark:text-ink-400">
                    <time
                      dateTime={post.postDate.toISOString()}
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
                  <h2 className="text-xl font-bold leading-snug tracking-tight text-ink-900 transition group-hover:text-accent-dark dark:text-ink-50 dark:group-hover:text-accent-light md:text-2xl">
                    {post.title}
                  </h2>
                  <p className="prose prose-sm prose-neutral mt-4 max-w-none leading-relaxed text-ink-600 dark:prose-invert dark:text-ink-400">
                    {post.excerpt}
                  </p>
                </Link>
                <div className="flex flex-wrap gap-2 border-t border-ink-200/60 px-6 pb-6 pt-4 dark:border-ink-700/60 md:px-8 md:pb-8">
                  {post.categories.map((c) => (
                    <CategoryPillLink
                      key={c.id}
                      id={c.id}
                      name={c.name}
                      current={
                        categoryFilterId != null && c.id === categoryFilterId
                      }
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
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
