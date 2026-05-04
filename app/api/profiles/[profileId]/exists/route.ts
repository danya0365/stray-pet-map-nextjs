import { createServerPublicProfilePresenter } from "@/presentation/presenters/public-profile/PublicProfilePresenterServerFactory";
import { NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ profileId: string }>;
}

// GET /api/profiles/[profileId]/exists - ตรวจสอบว่า profile มีอยู่จริง
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { profileId } = await params;

    if (!profileId) {
      return NextResponse.json({ exists: false }, { status: 400 });
    }

    const presenter = await createServerPublicProfilePresenter();
    const result = await presenter.exists(profileId);

    if (!result.success) {
      return NextResponse.json({ exists: false }, { status: 500 });
    }

    return NextResponse.json({ exists: result.exists });
  } catch (error) {
    console.error("Error checking profile existence:", error);
    return NextResponse.json({ exists: false }, { status: 500 });
  }
}
