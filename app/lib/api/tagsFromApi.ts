import { internalApiUrl } from "@/lib/api/internalUrl";
import type { TagWithPostCount } from "@/lib/data/tags";

/** GET /api/tags … サイドバー等（サーバーから同一オリジン fetch） */
export async function fetchTagsFromApi(): Promise<TagWithPostCount[]> {
  const url = await internalApiUrl("/api/tags");
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `API error: ${res.status}`);
  }
  return (await res.json()) as TagWithPostCount[];
}
