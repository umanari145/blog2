import type { Metadata } from "next";
import Link from "next/link";
import { mockPosts } from "./mockPosts";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "記事一覧 | blog2",
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
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/posts" className={styles.brand}>
            blog2
          </Link>
          <span className={styles.sub}>記事一覧（UI のみ）</span>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.inner}>
          <h1 className={styles.pageTitle}>記事一覧</h1>
          <p className={styles.lead}>
            表示データはモックです。詳細ページは別途実装してください。
          </p>

          <ul className={styles.list}>
            {mockPosts.map((post) => (
              <li key={post.postNo}>
                <article className={styles.card}>
                  <h2 className={styles.cardTitle}>{post.title}</h2>
                  <div className={styles.meta}>
                    <time dateTime={post.postDate}>
                      {formatDate(post.postDate)}
                    </time>
                    <span className={styles.postNo}>{post.postNo}</span>
                  </div>
                  <div className={styles.pills}>
                    {post.categories.map((name) => (
                      <span key={name} className={styles.pill}>
                        {name}
                      </span>
                    ))}
                    {post.tags.map((name) => (
                      <span
                        key={name}
                        className={`${styles.pill} ${styles.pillMuted}`}
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                  <p className={styles.excerpt}>{post.excerpt}</p>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </main>

      <footer className={styles.footer}>一覧のみ · Next.js App Router</footer>
    </div>
  );
}
