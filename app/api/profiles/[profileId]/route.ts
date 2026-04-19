import { createServerPublicProfilePresenter } from "@/presentation/presenters/public-profile/PublicProfilePresenterServerFactory";
import { NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ profileId: string }>;
}

// GET /api/profiles/[profileId] - ดึง public profile ของผู้ใช้อื่น
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { profileId } = await params;

    if (!profileId) {
      return NextResponse.json(
        { error: "Profile ID is required" },
        { status: 400 },
      );
    }

    const presenter = await createServerPublicProfilePresenter();
    const result = await presenter.getById(profileId);

    if (!result.success) {
      if (result.error === "Profile not found") {
        return NextResponse.json({ error: result.error }, { status: 404 });
      }
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      profile: result.profile,
    });
  } catch (error) {
    console.error("Error fetching public profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 },
    );
  }
}
