import type { Metadata } from "next";
import Link from "next/link";
import { CategoryPillLink } from "@/components/CategoryPillLink";
import { PostListPager } from "@/components/PostListPager";
import { TagPillLink } from "@/components/TagPillLink";
import { getCategoryById } from "@/lib/data/categories";
import {
  getPostListFilteredPage,
  POST_LIST_PAGE_SIZE,
  type PostListFilter,
  type PostListItem,
} from "@/lib/data/posts";
import { getTagById } from "@/lib/data/tags";

type PostsPageProps = {
  searchParams: Promise<{
    categoryId?: string | string[];
    tagId?: string | string[];
    page?: string | string[];
  }>;
};

/** DB 参照のためビルド時の静的生成は行わない */
export const dynamic = "force-dynamic";

function parseOptionalPositiveIntParam(
  raw: string | string[] | undefined,
): number | null {
  if (raw == null) return null;
  const s = (Array.isArray(raw) ? raw[0] : raw).trim();
  if (!/^\d+$/.test(s)) return null;
  const n = Number.parseInt(s, 10);
  if (n < 0) return null;
  return n;
}

function parsePageParam(raw: string | string[] | undefined): number {
  const n = parseOptionalPositiveIntParam(raw);
  if (n == null || n < 1) return 1;
  return n;
}

export async function generateMetadata({
  searchParams,
}: PostsPageProps): Promise<Metadata> {
  const sp = await searchParams;
  const cid = parseOptionalPositiveIntParam(sp.categoryId);
  const tid = parseOptionalPositiveIntParam(sp.tagId);

  if (cid == null && tid == null) {
    return {
      title: "記事一覧",
      description: "ブログ記事の一覧ページ",
    };
  }

  const [cat, tag] = await Promise.all([
    cid != null ? getCategoryById(cid) : Promise.resolve(null),
    tid != null ? getTagById(tid) : Promise.resolve(null),
  ]);

  if (cid != null && tid != null) {
    const cname = cat?.name ?? "カテゴリ";
    const tname = tag?.name ?? "タグ";
    return {
      title: `${cname}・#${tname}の記事`,
      description: `カテゴリ「${cname}」かつタグ「#${tname}」の記事一覧。`,
    };
  }
  if (cid != null) {
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
  if (tag) {
    return {
      title: `#${tag.name}の記事`,
      description: `タグ「#${tag.name}」の記事一覧`,
    };
  }
  return {
    title: "タグ別記事",
    description: "指定したタグの記事一覧",
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
  const categoryFilterId = parseOptionalPositiveIntParam(sp.categoryId);
  const tagFilterId = parseOptionalPositiveIntParam(sp.tagId);
  const requestedPage = parsePageParam(sp.page);

  let posts: PostListItem[] = [];
  let total = 0;
  let page = 1;
  let totalPages = 1;
  let loadError: string | null = null;
  let categoryName: string | null = null;
  let tagName: string | null = null;

  const filter: PostListFilter = {};
  if (categoryFilterId != null) filter.categoryId = categoryFilterId;
  if (tagFilterId != null) filter.tagId = tagFilterId;

  try {
    if (categoryFilterId != null) {
      const cat = await getCategoryById(categoryFilterId);
      categoryName = cat?.name ?? null;
    }
    if (tagFilterId != null) {
      const tag = await getTagById(tagFilterId);
      tagName = tag?.name ?? null;
    }
    const paged = await getPostListFilteredPage(
      filter,
      requestedPage,
      POST_LIST_PAGE_SIZE,
    );
    posts = paged.items;
    total = paged.total;
    page = paged.page;
    totalPages = paged.totalPages;
  } catch (e) {
    loadError =
      e instanceof Error
        ? e.message
        : "データベースから記事を取得できませんでした。";
  }

  const hasCatFilter = categoryFilterId != null;
  const hasTagFilter = tagFilterId != null;
  const isFiltered = hasCatFilter || hasTagFilter;

  let heading: string;
  if (hasCatFilter && hasTagFilter) {
    heading =
      categoryName && tagName
        ? `カテゴリ: ${categoryName} / タグ: #${tagName}`
        : "絞り込み結果";
  } else if (hasCatFilter) {
    heading = categoryName ? `カテゴリ: ${categoryName}` : "カテゴリ別記事";
  } else if (hasTagFilter) {
    heading = tagName ? `タグ: #${tagName}` : "タグ別記事";
  } else {
    heading = "記事一覧";
  }

  let subline: string;
  if (hasCatFilter && hasTagFilter) {
    subline =
      categoryName && tagName
        ? `「${categoryName}」かつ「#${tagName}」の両方を含む記事のみ表示しています。`
        : "指定のカテゴリ・タグの組み合わせに該当する記事を表示しています。";
  } else if (hasCatFilter) {
    subline = categoryName
      ? `「${categoryName}」を含む記事のみ表示しています。`
      : "指定の ID に該当するカテゴリはありません（記事 0 件）。";
  } else if (hasTagFilter) {
    subline = tagName
      ? `「#${tagName}」を含む記事のみ表示しています。`
      : "指定の ID に該当するタグはありません（記事 0 件）。";
  } else {
    subline =
      "開発・インフラ・言語まわりのメモを時系列で並べています。データは MySQL（Prisma）から取得しています。";
  }

  const filterBadgeLabel = (() => {
    if (hasCatFilter && hasTagFilter) return "カテゴリ＋タグ絞り込み";
    if (hasCatFilter) return "カテゴリ絞り込み";
    if (hasTagFilter) return "タグ絞り込み";
    return "カードから詳細へ";
  })();

  const emptyFilteredMessage = (() => {
    if (hasCatFilter && hasTagFilter) {
      return "この条件に該当する記事はまだありません。";
    }
    if (hasCatFilter) {
      return "このカテゴリに該当する記事はまだありません。";
    }
    if (hasTagFilter) {
      return "このタグに該当する記事はまだありません。";
    }
    return "";
  })();

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
              {isFiltered ? "該当記事" : "登録記事"}: {total} 件
              {total > 0 && (
                <span className="block text-xs font-normal text-ink-500 dark:text-ink-400">
                  1 ページ {POST_LIST_PAGE_SIZE} 件表示（{page} / {totalPages}{" "}
                  ページ目）
                </span>
              )}
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
            {loadError ? "—" : `記事 ${total} 件`}
          </span>
          <span className="inline-flex items-center rounded-full bg-accent-muted/90 px-3 py-1 text-xs font-medium text-accent-dark dark:bg-accent-dark/40 dark:text-accent-light">
            {filterBadgeLabel}
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
      ) : total === 0 ? (
        <p className="text-sm text-ink-500 dark:text-ink-400">
          {isFiltered
            ? emptyFilteredMessage
            : "まだ記事がありません。`convert/import.ts` でデータを投入するか、Prisma Studio などで追加してください。"}
        </p>
      ) : (
        <>
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
                    <TagPillLink
                      key={t.id}
                      id={t.id}
                      name={t.name}
                      current={tagFilterId != null && t.id === tagFilterId}
                    />
                  ))}
                </div>
              </article>
            </li>
          ))}
        </ul>
        <PostListPager
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={POST_LIST_PAGE_SIZE}
          categoryId={categoryFilterId}
          tagId={tagFilterId}
        />
        </>
      )}
    </div>
  );
}
