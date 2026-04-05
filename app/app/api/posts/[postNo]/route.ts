import { NextResponse } from "next/server";
import { getPostByPostNo } from "@/lib/data/posts";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ postNo: string }>;
};

/** GET /api/posts/[postNo] … 記事1件の JSON */
export async function GET(_request: Request, context: RouteContext) {
  const { postNo: raw } = await context.params;
  const postNo = decodeURIComponent(raw);
  try {
    const post = await getPostByPostNo(postNo);
    if (!post) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({
      ...post,
      postDate: post.postDate.toISOString(),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
