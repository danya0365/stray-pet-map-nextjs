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

    const presenter = createServerPetPostPresenter();
    const EXPIRY_DAYS = 90;

    // Auto-archive via presenter
    const result = await presenter.autoArchive(EXPIRY_DAYS);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      archived: result.archived,
      failed: result.failed,
      postIds: result.postIds,
      failedIds: result.failedIds,
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

    const presenter = createServerPetPostPresenter();
    const EXPIRY_DAYS = 90;
    const WARNING_DAYS = 7;

    // ดึงข้อมูล preview ผ่าน Presenter
    const result = await presenter.previewAutoArchive(
      EXPIRY_DAYS,
      WARNING_DAYS,
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      expiryDays: EXPIRY_DAYS,
      warningDays: WARNING_DAYS,
      willExpire: result.willExpire,
      willWarn: result.willWarn,
      expireCount: result.expireCount,
      warnCount: result.warnCount,
    });
  } catch (error) {
    console.error("Auto-archive stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
