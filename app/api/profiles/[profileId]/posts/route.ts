import { createServerPublicProfilePresenter } from "@/presentation/presenters/public-profile/PublicProfilePresenterServerFactory";
import { NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ profileId: string }>;
}

// GET /api/profiles/[profileId]/posts - ดึงโพสต์ทั้งหมดของผู้ใช้
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { profileId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const perPage = parseInt(searchParams.get("perPage") ?? "10", 10);

    if (!profileId) {
      return NextResponse.json(
        { error: "Profile ID is required" },
        { status: 400 },
      );
    }

    const presenter = await createServerPublicProfilePresenter();
    const result = await presenter.getPosts(profileId, page, perPage);

    if (!result.success) {
      if (result.error === "Profile not found") {
        return NextResponse.json({ error: result.error }, { status: 404 });
      }
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      posts: result.posts,
      total: result.total,
      hasMore: result.hasMore,
    });
  } catch (error) {
    console.error("Error fetching profile posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 },
    );
  }
}
