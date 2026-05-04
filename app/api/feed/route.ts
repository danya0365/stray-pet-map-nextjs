import { createServerActivityFeedPresenter } from "@/presentation/presenters/activity-feed/ActivityFeedPresenterServerFactory";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/feed?cursor=&limit=&types=
 * Activity feed API - returns merged posts + comments as activity items
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor") || undefined;
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const typesParam = searchParams.get("types");
    const types = typesParam ? typesParam.split(",") : undefined;

    const presenter = await createServerActivityFeedPresenter();
    const result = await presenter.getFeed({ limit, cursor, types });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error fetching feed:", error);
    return NextResponse.json(
      { error: "Failed to fetch feed" },
      { status: 500 },
    );
  }
}
