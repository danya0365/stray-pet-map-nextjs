/**
 * /api/adoption-requests
 * API Route for adoption request CRUD operations
 *
 * ✅ Uses SupabaseAdoptionRequestRepository (server-side)
 * ✅ Client components call this via ApiAdoptionRequestRepository
 */

import { SupabaseAdoptionRequestRepository } from "@/infrastructure/repositories/supabase/SupabaseAdoptionRequestRepository";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { NextResponse } from "next/server";

// ============================================================
// POST - Create adoption request
// ============================================================

export async function POST(request: Request) {
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

    const body = await request.json();
    const repo = new SupabaseAdoptionRequestRepository(supabase);
    
    const adoptionRequest = await repo.create({
      petPostId: body.petPostId,
      message: body.message,
      contactPhone: body.contactPhone,
      contactLineId: body.contactLineId,
    });

    return NextResponse.json(adoptionRequest, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "ไม่สามารถส่งคำขอรับเลี้ยงได้";
    
    // Handle duplicate request error
    if (message.includes("ส่งคำขอ") && message.includes("แล้ว")) {
      return NextResponse.json({ error: message }, { status: 409 });
    }
    
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ============================================================
// GET - Get adoption requests by post ID
// ============================================================

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
    const repo = new SupabaseAdoptionRequestRepository(supabase);
    
    const requests = await repo.getByPostId(petPostId);

    return NextResponse.json(requests);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "ไม่สามารถโหลดข้อมูลได้";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
