/**
 * /api/adoption-requests/has-requested
 * API Route for checking if current user has requested a specific pet post
 *
 * ✅ Uses SupabaseAdoptionRequestRepository (server-side)
 * ✅ Query param: petPostId
 */

import { SupabaseAdoptionRequestRepository } from "@/infrastructure/repositories/supabase/SupabaseAdoptionRequestRepository";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const petPostId = searchParams.get("petPostId");

    if (!petPostId) {
      return NextResponse.json(
        { error: "กรุณาระบุ petPostId" },
        { status: 400 },
      );
    }

    const supabase = await createServerSupabaseClient();

    // Check auth
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "กรุณาเข้าสู่ระบบ" },
        { status: 401 },
      );
    }

    const repo = new SupabaseAdoptionRequestRepository(supabase);
    const hasRequested = await repo.hasRequested(petPostId);

    return NextResponse.json({ hasRequested });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "ไม่สามารถตรวจสอบสถานะได้";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
