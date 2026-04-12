import { internalApiUrl } from "@/lib/api/internalUrl";
import type { CategoryWithPostCount } from "@/lib/data/categories";

/** GET /api/categories … サイドバー等（サーバーから同一オリジン fetch） */
export async function fetchCategoriesFromApi(): Promise<CategoryWithPostCount[]> {
  const url = await internalApiUrl("/api/categories");
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `API error: ${res.status}`);
  }
  return (await res.json()) as CategoryWithPostCount[];
}
