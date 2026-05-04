import { createServerPublicProfilePresenter } from "@/presentation/presenters/public-profile/PublicProfilePresenterServerFactory";
import { NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ profileId: string }>;
}

// GET /api/profiles/[profileId]/posts - ดึงโพสต์ทั้งหมดของผู้ใช้
// Supports both offset and cursor pagination
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { profileId } = await params;
    const { searchParams } = new URL(request.url);
    const paginationType = searchParams.get("paginationType") || "cursor";

    if (!profileId) {
      return NextResponse.json(
        { error: "Profile ID is required" },
        { status: 400 },
      );
    }

    // Build pagination based on type
    let pagination;
    if (paginationType === "offset") {
      // Offset pagination (for admin)
      const page = parseInt(searchParams.get("page") ?? "1", 10);
      const perPage = parseInt(searchParams.get("perPage") ?? "10", 10);
      pagination = { type: "offset" as const, page, perPage };
    } else {
      // Cursor pagination (for frontend load more)
      const cursor = searchParams.get("cursor") || undefined;
      const limit = parseInt(searchParams.get("limit") ?? "20", 10);
      pagination = { type: "cursor" as const, cursor, limit };
    }

    const presenter = await createServerPublicProfilePresenter();
    const result = await presenter.getPosts(profileId, pagination);

    if (!result.success) {
      if (result.error === "Profile not found") {
        return NextResponse.json({ error: result.error }, { status: 404 });
      }
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // Return the data directly from the ProfilePostsQueryResult
    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error fetching profile posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 },
    );
  }
}
