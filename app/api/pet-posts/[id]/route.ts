/**
 * /api/pet-posts/[id]
 * API Route for single pet post operations
 *
 * ✅ GET = getById (public)
 * ✅ PUT = update (auth required)
 * ✅ DELETE = soft delete (auth required)
 */

import { SupabasePetPostRepository } from "@/infrastructure/repositories/supabase/SupabasePetPostRepository";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { NextResponse } from "next/server";

// GET /api/pet-posts/[id] — get single pet post (public)
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const repo = new SupabasePetPostRepository(supabase);

    const post = await repo.getById(id);
    if (!post) {
      return NextResponse.json(
        { error: "ไม่พบโพสต์ที่ต้องการ" },
        { status: 404 },
      );
    }

    return NextResponse.json(post);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "ไม่สามารถโหลดข้อมูลได้";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT /api/pet-posts/[id] — update pet post (auth required)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();

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
    const repo = new SupabasePetPostRepository(supabase);
    const updated = await repo.update(id, body);

    return NextResponse.json(updated);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "ไม่สามารถอัปเดตโพสต์ได้";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/pet-posts/[id] — soft delete pet post (auth required)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "กรุณาเข้าสู่ระบบ" },
        { status: 401 },
      );
    }

    const repo = new SupabasePetPostRepository(supabase);
    await repo.delete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "ไม่สามารถลบโพสต์ได้";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
