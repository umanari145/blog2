import { NextResponse } from "next/server";
import { getPostList } from "@/lib/data/posts";

export const dynamic = "force-dynamic";

/** GET /api/posts … 記事一覧 JSON（クライアント・外部からも利用可） */
export async function GET() {
  try {
    const posts = await getPostList();
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
