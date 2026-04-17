import { SupabaseReportRepository } from "@/infrastructure/repositories/supabase/SupabaseReportRepository";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const createReportSchema = z.object({
  petPostId: z.string().uuid(),
  reason: z.enum(["spam", "fake_info", "inappropriate", "animal_abuse", "other"]),
  description: z.string().max(500).optional(),
});

// POST /api/reports - Create a new report
export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "กรุณาเข้าสู่ระบบก่อนรายงาน" },
        { status: 401 },
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const result = createReportSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "ข้อมูลไม่ถูกต้อง", details: result.error.issues },
        { status: 400 },
      );
    }

    const { petPostId, reason, description } = result.data;

    // Check if user has already reported this post
    const reportRepo = new SupabaseReportRepository(supabase);
    const hasReported = await reportRepo.hasReported(petPostId);

    if (hasReported) {
      return NextResponse.json(
        { error: "คุณได้รายงานโพสต์นี้ไปแล้ว" },
        { status: 409 },
      );
    }

    // Create the report
    const report = await reportRepo.create({
      petPostId,
      reason,
      description,
    });

    return NextResponse.json({
      success: true,
      message: "รายงานสำเร็จ ขอบคุณที่ช่วยดูแลชุมชน",
      reportId: report.id,
    });
  } catch (error) {
    console.error("Error creating report:", error);
    const message = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}

// GET /api/reports - Get current user's reports
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "กรุณาเข้าสู่ระบบ" },
        { status: 401 },
      );
    }

    const reportRepo = new SupabaseReportRepository(supabase);
    const reports = await reportRepo.getMyReports();

    return NextResponse.json({ reports });
  } catch (error) {
    console.error("Error fetching reports:", error);
    const message = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}
