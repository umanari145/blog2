import { NextResponse } from "next/server";
import { getCategoriesWithPostCount } from "@/lib/data/categories";

export const dynamic = "force-dynamic";

/** GET /api/categories … categories テーブル＋各カテゴリの記事数 */
export async function GET() {
  try {
    const categories = await getCategoriesWithPostCount();
    return NextResponse.json(categories);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
