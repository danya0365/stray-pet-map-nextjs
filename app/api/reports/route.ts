import { createServerAuthPresenter } from "@/presentation/presenters/auth/AuthPresenterServerFactory";
import { createServerReportPresenter } from "@/presentation/presenters/report/ReportPresenterServerFactory";
import { NextResponse } from "next/server";
import { z } from "zod";

const createReportSchema = z.object({
  petPostId: z.string().uuid(),
  reason: z.enum([
    "spam",
    "fake_info",
    "inappropriate",
    "animal_abuse",
    "other",
  ]),
  description: z.string().max(500).optional(),
});

// POST /api/reports - Create a new report
export async function POST(request: Request) {
  try {
    // Check auth via AuthPresenter
    const authPresenter = await createServerAuthPresenter();
    const authViewModel = await authPresenter.getViewModel();

    if (!authViewModel.isAuthenticated) {
      return NextResponse.json(
        { error: "กรุณาเข้าสู่ระบบก่อนรายงาน" },
        { status: 401 },
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = createReportSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "ข้อมูลไม่ถูกต้อง", details: validation.error.issues },
        { status: 400 },
      );
    }

    const { petPostId, reason, description } = validation.data;

    // Create the report via presenter
    const presenter = await createServerReportPresenter();
    const result = await presenter.create({
      petPostId,
      reason,
      description,
    });

    if (!result.success) {
      if (result.hasAlreadyReported) {
        return NextResponse.json({ error: result.error }, { status: 409 });
      }
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "รายงานสำเร็จ ขอบคุณที่ช่วยดูแลชุมชน",
      reportId: result.data?.id,
    });
  } catch (error) {
    console.error("Error creating report:", error);
    const message = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET /api/reports - Get current user's reports
// Supports both offset and cursor pagination
export async function GET(request: Request) {
  try {
    // Check auth via AuthPresenter
    const authPresenter = await createServerAuthPresenter();
    const authViewModel = await authPresenter.getViewModel();

    if (!authViewModel.isAuthenticated) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const paginationType = searchParams.get("paginationType") || "cursor";

    // Build pagination based on type
    let pagination;
    if (paginationType === "offset") {
      // Offset pagination (for admin)
      const page = parseInt(searchParams.get("page") ?? "1", 10);
      const perPage = parseInt(searchParams.get("perPage") ?? "20", 10);
      pagination = { type: "offset" as const, page, perPage };
    } else {
      // Cursor pagination (for frontend load more)
      const cursor = searchParams.get("cursor") || undefined;
      const limit = parseInt(searchParams.get("limit") ?? "20", 10);
      pagination = { type: "cursor" as const, cursor, limit };
    }

    const presenter = await createServerReportPresenter();
    const result = await presenter.getMyReports(pagination);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // Return the ReportQueryResult directly
    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error fetching reports:", error);
    const message = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
