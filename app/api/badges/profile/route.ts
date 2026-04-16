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

    // ใช้ badge repository แทนการเรียก RPC ตรงๆ
    const badgeRepo = new SupabaseBadgeRepository(supabase);

    // ตรวจสอบและมอบ badges อัตโนมัติ
    const newlyAwarded = await badgeRepo.checkAndAwardBadges(profile.id);

    // ดึง badges และ progress ล่าสุด
    const [badges, progress] = await Promise.all([
      badgeRepo.getByProfileId(profile.id),
      badgeRepo.getProgress(profile.id),
    ]);

    return NextResponse.json({
      success: true,
      newlyAwarded: newlyAwarded || [],
      totalBadges: badges.length,
      badges,
      progress,
    });
  } catch (error) {
    console.error("Error updating badges:", error);
    return NextResponse.json(
      { error: "Failed to update badges" },
      { status: 500 },
    );
  }
}
