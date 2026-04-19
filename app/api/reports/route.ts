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
export async function GET() {
  try {
    // Check auth via AuthPresenter
    const authPresenter = await createServerAuthPresenter();
    const authViewModel = await authPresenter.getViewModel();

    if (!authViewModel.isAuthenticated) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    const presenter = await createServerReportPresenter();
    const result = await presenter.getMyReports();

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ reports: result.data });
  } catch (error) {
    console.error("Error fetching reports:", error);
    const message = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
