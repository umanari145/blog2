import { NextResponse } from "next/server";
import { getTagsWithPostCount } from "@/lib/data/tags";

export const dynamic = "force-dynamic";

/** GET /api/tags … tags テーブル＋各タグの記事数 */
export async function GET() {
  try {
    const tags = await getTagsWithPostCount();
    return NextResponse.json(tags);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
