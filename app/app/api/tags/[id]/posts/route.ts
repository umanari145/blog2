import { NextResponse } from "next/server";
import { getPostListFiltered } from "@/lib/data/posts";

export const dynamic = "force-dynamic";

function parseTagId(raw: string): number | null {
  const t = raw.trim();
  if (!/^\d+$/.test(t)) return null;
  const n = Number.parseInt(t, 10);
  if (n < 0) return null;
  return n;
}

/** GET /api/tags/[id]/posts … そのタグを含む記事一覧（形状は GET /api/posts と同じ） */
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id: idParam } = await context.params;
  const tagId = parseTagId(idParam);
  if (tagId === null) {
    return NextResponse.json({ error: "Invalid tag id" }, { status: 400 });
  }

  try {
    const posts = await getPostListFiltered({ tagId });
    const body = posts.map((p) => ({
      ...p,
      postDate: p.postDate.toISOString(),
    }));
    return NextResponse.json(body);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
