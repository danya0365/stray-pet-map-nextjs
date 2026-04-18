import { SupabasePetPostRepository } from "@/infrastructure/repositories/supabase/SupabasePetPostRepository";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { NextResponse } from "next/server";

// POST /api/pet-posts/auto-archive - ปิดโพสต์ที่หมดอายุอัตโนมัติ
// ควรถูกเรียกโดย cron job (เช่น Vercel Cron หรือ GitHub Actions)
export async function POST(request: Request) {
  try {
    // Verify cron secret (optional security)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createServerSupabaseClient();
    const repo = new SupabasePetPostRepository(supabase);

    // ดึงโพสต์ที่หมดอายุผ่าน Repository (สร้างมาเกิน 90 วัน)
    const EXPIRY_DAYS = 90;
    const expiredPosts = await repo.findExpiredPosts(EXPIRY_DAYS);

    // ปิดโพสต์ที่หมดอายุทั้งหมด
    const archivedPosts: string[] = [];
    const failedPosts: string[] = [];

    for (const post of expiredPosts) {
      try {
        await repo.update(post.id, {
          outcome: "expired",
          resolvedAt: new Date().toISOString(),
          isArchived: true,
          isActive: false,
        });
        archivedPosts.push(post.id);
      } catch (err) {
        console.error(`Failed to archive post ${post.id}:`, err);
        failedPosts.push(post.id);
      }
    }

    return NextResponse.json({
      success: true,
      archived: archivedPosts.length,
      failed: failedPosts.length,
      postIds: archivedPosts,
      failedIds: failedPosts,
      expiryDays: EXPIRY_DAYS,
    });
  } catch (error) {
    console.error("Auto-archive error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// GET /api/pet-posts/auto-archive - ดูสถิติโพสต์ที่จะหมดอายุ (dry run)
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createServerSupabaseClient();
    const repo = new SupabasePetPostRepository(supabase);

    const EXPIRY_DAYS = 90;
    const WARNING_DAYS = 7;

    // ดึงข้อมูลผ่าน Repository Methods
    const willExpire = await repo.findExpiredPosts(EXPIRY_DAYS);
    const willWarn = await repo.findExpiringSoonPosts(
      EXPIRY_DAYS,
      WARNING_DAYS,
    );

    return NextResponse.json({
      expiryDays: EXPIRY_DAYS,
      warningDays: WARNING_DAYS,
      willExpire,
      willWarn,
      expireCount: willExpire.length,
      warnCount: willWarn.length,
    });
  } catch (error) {
    console.error("Auto-archive stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
