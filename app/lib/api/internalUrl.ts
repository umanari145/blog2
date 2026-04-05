import { headers } from "next/headers";

/** サーバーコンポーネントから同一オリジンの API を fetch するときの絶対 URL */
export async function internalApiUrl(path: string): Promise<string> {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  if (host) {
    return `${proto}://${host}${normalized}`;
  }
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    `http://127.0.0.1:${process.env.PORT ?? "3000"}`;
  return `${base}${normalized}`;
}
