import { SupabasePublicProfileRepository } from "@/infrastructure/repositories/supabase/SupabasePublicProfileRepository";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
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

    const supabase = await createServerSupabaseClient();
    const repo = new SupabasePublicProfileRepository(supabase);

    // ตรวจสอบว่า profile มีอยู่จริง
    const exists = await repo.exists(profileId);
    if (!exists) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 },
      );
    }

    const result = await repo.getPosts(profileId, page, perPage);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Error fetching profile posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 },
    );
  }
}
