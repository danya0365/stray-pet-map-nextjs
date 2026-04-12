/**
 * /api/pet-posts
 * API Route for pet post CRUD operations
 *
 * ✅ Uses SupabasePetPostRepository (server-side)
 * ✅ Client components call this via ApiPetPostRepository
 */

import { SupabasePetPostRepository } from "@/infrastructure/repositories/supabase/SupabasePetPostRepository";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { NextResponse } from "next/server";

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
    const repo = new SupabasePetPostRepository(supabase);
    const post = await repo.create(body);

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "ไม่สามารถสร้างโพสต์ได้";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
