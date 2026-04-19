import { createServerAuthPresenter } from "@/presentation/presenters/auth/AuthPresenterServerFactory";
import { createServerBadgePresenter } from "@/presentation/presenters/badge/BadgePresenterServerFactory";
import { NextResponse } from "next/server";

// GET /api/badges/profile/me - ดึง badges ของผู้ใช้ปัจจุบัน (ใช้ active profile)
export async function GET(request: Request) {
  try {
    // Check auth via AuthPresenter
    const authPresenter = await createServerAuthPresenter();
    const authViewModel = await authPresenter.getViewModel();

    if (!authViewModel.isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const presenter = await createServerBadgePresenter();
    const result = await presenter.getMyBadges();

    if (!result.success) {
      if (result.error === "Profile not found") {
        return NextResponse.json({ error: result.error }, { status: 404 });
      }
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      profileId: result.profileId,
      displayName: result.displayName,
      badges: result.badges,
      totalBadges: result.totalBadges,
      progress: result.progress,
    });
  } catch (error) {
    console.error("Error fetching profile badges:", error);
    return NextResponse.json(
      { error: "Failed to fetch badges" },
      { status: 500 },
    );
  }
}

// POST /api/badges/profile/me - คำนวณและอัปเดต badges อัตโนมัติ (ใช้ active profile)
export async function POST(request: Request) {
  try {
    // Check auth via AuthPresenter
    const authPresenter = await createServerAuthPresenter();
    const authViewModel = await authPresenter.getViewModel();

    if (!authViewModel.isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const presenter = await createServerBadgePresenter();
    const result = await presenter.checkAndAwardBadges();

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      newlyAwarded: result.newlyAwarded || [],
      totalBadges: result.totalBadges,
      badges: result.badges,
      progress: result.progress,
    });
  } catch (error) {
    console.error("Error updating badges:", error);
    return NextResponse.json(
      { error: "Failed to update badges" },
      { status: 500 },
    );
  }
}
