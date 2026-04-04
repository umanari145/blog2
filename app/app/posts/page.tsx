import type { Metadata } from "next";
import { mockPosts } from "./mockPosts";

export const metadata: Metadata = {
  title: "記事一覧",
  description: "ブログ記事の一覧ページ",
};

function formatDate(iso: string) {
  const d = new Date(iso + "T12:00:00");
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

export default function PostsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-10 md:px-8 md:py-14 lg:max-w-4xl lg:px-12">
      <header className="mb-12 border-b border-ink-200/90 pb-10 dark:border-ink-700/90">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-accent dark:text-accent-light">
          Journal
        </p>
        <h1 className="bg-gradient-to-br from-ink-900 to-ink-600 bg-clip-text text-3xl font-bold tracking-tight text-transparent dark:from-ink-100 dark:to-ink-400 md:text-4xl">
          記事一覧
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-500 dark:text-ink-400">
          開発・インフラ・言語まわりのメモを時系列で並べています。現在の表示はモックデータです。
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-ink-600 shadow-sm ring-1 ring-ink-200/80 dark:bg-ink-800/80 dark:text-ink-300 dark:ring-ink-600">
            {mockPosts.length} 件を表示
          </span>
          <span className="inline-flex items-center rounded-full bg-accent-muted/90 px-3 py-1 text-xs font-medium text-accent-dark dark:bg-accent-dark/40 dark:text-accent-light">
            詳細ページは未実装
          </span>
        </div>
      </header>

      <ul className="flex flex-col gap-6 md:gap-8">
        {mockPosts.map((post, index) => (
          <li key={post.postNo}>
            <article
              className="group relative overflow-hidden rounded-2xl border border-ink-200/90 bg-white/85 p-6 shadow-card backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-card-hover dark:border-ink-700/90 dark:bg-ink-800/60 dark:shadow-card-dark dark:hover:border-accent-light/25 dark:hover:shadow-[0_8px_40px_rgb(0_0_0_/_0.45)] md:p-8"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-accent/5 transition group-hover:bg-accent/10 dark:bg-accent-light/5 dark:group-hover:bg-accent-light/10" />
              <div className="relative">
                <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500 dark:text-ink-400">
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
                <h2 className="text-xl font-bold leading-snug tracking-tight text-ink-900 transition group-hover:text-accent-dark dark:text-ink-50 dark:group-hover:text-accent-light md:text-2xl">
                  {post.title}
                </h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {post.categories.map((name) => (
                    <span
                      key={name}
                      className="rounded-md bg-accent-muted/90 px-2.5 py-0.5 text-[11px] font-semibold text-accent-dark dark:bg-accent-dark/35 dark:text-accent-light"
                    >
                      {name}
                    </span>
                  ))}
                  {post.tags.map((name) => (
                    <span
                      key={name}
                      className="rounded-md bg-ink-100/90 px-2.5 py-0.5 text-[11px] font-medium text-ink-600 ring-1 ring-ink-200/80 dark:bg-ink-700/80 dark:text-ink-300 dark:ring-ink-600"
                    >
                      #{name}
                    </span>
                  ))}
                </div>
                <p className="prose prose-sm prose-neutral mt-4 max-w-none leading-relaxed text-ink-600 dark:prose-invert dark:text-ink-400">
                  {post.excerpt}
                </p>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
