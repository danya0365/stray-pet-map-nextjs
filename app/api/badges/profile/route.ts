import { SupabaseAuthRepository } from "@/infrastructure/repositories/supabase/SupabaseAuthRepository";
import { SupabaseBadgeRepository } from "@/infrastructure/repositories/supabase/SupabaseBadgeRepository";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { NextResponse } from "next/server";

// GET /api/badges/profile/me - ดึง badges ของผู้ใช้ปัจจุบัน (ใช้ active profile)
export async function GET(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    // ตรวจสอบ authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ดึง active profile จาก auth repository
    const authRepo = new SupabaseAuthRepository(supabase);
    const profile = await authRepo.getProfile();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const badgeRepo = new SupabaseBadgeRepository(supabase);

    // ดึง badges และ progress จาก active profile
    const [badges, progress] = await Promise.all([
      badgeRepo.getByProfileId(profile.id),
      badgeRepo.getProgress(profile.id),
    ]);

    return NextResponse.json({
      success: true,
      profileId: profile.id,
      displayName: profile.fullName,
      badges,
      totalBadges: badges.length,
      progress,
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
    const supabase = await createServerSupabaseClient();

    // ตรวจสอบ authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ดึง active profile จาก auth repository
    const authRepo = new SupabaseAuthRepository(supabase);
    const profile = await authRepo.getProfile();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // เรียกฟังก์ชัน RPC เพื่อตรวจสอบและมอบ badges
    const { data: awardedBadges, error: rpcError } = await supabase.rpc(
      "check_and_award_badges",
      { target_profile_id: profile.id },
    );

    if (rpcError) {
      console.error("Error checking badges:", rpcError);
      return NextResponse.json(
        { error: "Failed to check badges" },
        { status: 500 },
      );
    }

    // ดึง badges ล่าสุด
    const badgeRepo = new SupabaseBadgeRepository(supabase);
    const badges = await badgeRepo.getByProfileId(profile.id);

    return NextResponse.json({
      success: true,
      newlyAwarded: awardedBadges || [],
      totalBadges: badges.length,
      badges,
    });
  } catch (error) {
    console.error("Error updating badges:", error);
    return NextResponse.json(
      { error: "Failed to update badges" },
      { status: 500 },
    );
  }
}
