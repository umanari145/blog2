import { internalApiUrl } from "@/lib/api/internalUrl";

export type PostDetailApi = {
  id: string;
  postNo: string;
  title: string;
  contents: string;
  postDate: string;
  categories: { id: number; name: string }[];
  tags: { id: number; name: string }[];
};

/** GET /api/posts/[postNo] … 詳細ページ・metadata 用 */
export async function fetchPostDetailFromApi(
  postNo: string,
): Promise<PostDetailApi | null> {
  const url = await internalApiUrl(
    `/api/posts/${encodeURIComponent(postNo)}`,
  );
  const res = await fetch(url, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `API error: ${res.status}`);
  }
  return (await res.json()) as PostDetailApi;
}
