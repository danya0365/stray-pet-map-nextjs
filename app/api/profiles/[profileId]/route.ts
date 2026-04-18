import { SupabasePublicProfileRepository } from "@/infrastructure/repositories/supabase/SupabasePublicProfileRepository";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
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

    const supabase = await createServerSupabaseClient();
    const repo = new SupabasePublicProfileRepository(supabase);

    const profile = await repo.getById(profileId);

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Error fetching public profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 },
    );
  }
}
