import { SupabaseBadgeRepository } from "@/infrastructure/repositories/supabase/SupabaseBadgeRepository";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { NextResponse } from "next/server";

// GET /api/badges/profile - ดึง badges ของผู้ใช้ปัจจุบัน
export async function GET(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // ตรวจสอบ authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const repo = new SupabaseBadgeRepository(supabase);

    // ดึง badges และ progress
    const [badges, progress] = await Promise.all([
      repo.getByProfileId(user.id),
      repo.getProgress(user.id),
    ]);

    return NextResponse.json({
      success: true,
      profileId: user.id,
      badges,
      totalBadges: badges.length,
      progress,
    });
  } catch (error) {
    console.error("Error fetching profile badges:", error);
    return NextResponse.json(
      { error: "Failed to fetch badges" },
      { status: 500 }
    );
  }
}

// POST /api/badges/profile - คำนวณและอัปเดต badges อัตโนมัติ
export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // ตรวจสอบ authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // เรียกฟังก์ชัน RPC เพื่อตรวจสอบและมอบ badges
    const { data: awardedBadges, error: rpcError } = await supabase.rpc(
      "check_and_award_badges",
      { target_profile_id: user.id }
    );

    if (rpcError) {
      console.error("Error checking badges:", rpcError);
      return NextResponse.json(
        { error: "Failed to check badges" },
        { status: 500 }
      );
    }

    // ดึง badges ล่าสุด
    const repo = new SupabaseBadgeRepository(supabase);
    const badges = await repo.getByProfileId(user.id);

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
      { status: 500 }
    );
  }
}
