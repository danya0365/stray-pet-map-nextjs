/**
 * /api/adoption-requests/my-requests
 * API Route for getting current user's adoption requests
 *
 * ✅ Uses SupabaseAdoptionRequestRepository (server-side)
 * ✅ Returns list of adoption requests made by the current user
 */

import { SupabaseAdoptionRequestRepository } from "@/infrastructure/repositories/supabase/SupabaseAdoptionRequestRepository";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
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
    const requests = await repo.getMyRequests();

    return NextResponse.json(requests);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "ไม่สามารถโหลดข้อมูลได้";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
