/** 一覧 UI 用のモック（後から Prisma 取得に差し替え可能） */
export type ListPost = {
  postNo: string;
  title: string;
  postDate: string;
  categories: string[];
  tags: string[];
  excerpt: string;
};

export const mockPosts: ListPost[] = [
  {
    postNo: "post-60",
    title: "便利すぎる道具の弊害",
    postDate: "2015-03-29",
    categories: ["技術メモ", "開発環境"],
    tags: [],
    excerpt:
      "IDE やフレームワークが便利すぎると、内部の動きを考えなくなるデメリットについて。",
  },
  {
    postNo: "post-65",
    title: "CIことはじめ",
    postDate: "2015-03-30",
    categories: ["技術メモ", "開発環境"],
    tags: ["jenkins", "java"],
    excerpt:
      "Netbeans から Jenkins まで、ビルドとデプロイの初歩の流れを整理したメモ。",
  },
  {
    postNo: "post-68",
    title: "ループ処理+switch",
    postDate: "2015-04-01",
    categories: ["PHP"],
    tags: [],
    excerpt: "PHP で switch 内の continue がループに効かない話と continue2 の話。",
  },
  {
    postNo: "post-100",
    title: "GlassFishとTomcatの違い",
    postDate: "2015-04-07",
    categories: ["技術メモ"],
    tags: ["glassfish", "java"],
    excerpt: "サーブレットコンテナと Java EE 対応サーバーの違いの整理。",
  },
  {
    postNo: "post-132",
    title: "GlassFish＆Junitの不具合",
    postDate: "2015-04-10",
    categories: ["技術メモ"],
    tags: ["glassfish", "java"],
    excerpt: "埋め込み GlassFish での JUnit とラムダ式周りのメモ。",
  },
  {
    postNo: "post-149",
    title: "テストコードの実装",
    postDate: "2015-04-15",
    categories: ["技術メモ"],
    tags: ["テスト"],
    excerpt: "Netbeans から JUnit を生成して assertEquals で試す流れ。",
  },
];
