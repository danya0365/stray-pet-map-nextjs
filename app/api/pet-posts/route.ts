/**
 * /api/pet-posts
 * API Route for pet post CRUD operations
 *
 * ✅ Uses SupabasePetPostRepository (server-side)
 * ✅ Client components call this via ApiPetPostRepository
 * ✅ GET = query / list, POST = create
 */

import type { PetPostQuery } from "@/application/repositories/IPetPostRepository";
import type { PetGender, PetPostStatus } from "@/domain/entities/pet-post";
import { SupabasePetPostRepository } from "@/infrastructure/repositories/supabase/SupabasePetPostRepository";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { NextResponse } from "next/server";

// GET /api/pet-posts — query pet posts (public)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const supabase = await createServerSupabaseClient();
    const repo = new SupabasePetPostRepository(supabase);

    const search = searchParams.get("search") || undefined;
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder =
      (searchParams.get("sortOrder") as "asc" | "desc") || "desc";

    const statusParam = searchParams.get("status");
    const status = statusParam ? statusParam.split(",") : undefined;
    const petTypeId = searchParams.get("petTypeId") || undefined;
    const gender = searchParams.get("gender") || undefined;
    const province = searchParams.get("province") || undefined;

    const page = parseInt(searchParams.get("page") || "1", 10);
    const perPage = parseInt(searchParams.get("perPage") || "12", 10);

    // Cursor pagination params
    const cursor = searchParams.get("cursor") || undefined;
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const paginationType = searchParams.get("paginationType") || "offset";

    const query: PetPostQuery = {
      search,
      sortBy: sortBy as PetPostQuery["sortBy"],
      sortOrder,
      filters: {
        status: status as PetPostStatus[] | undefined,
        petTypeId,
        gender: gender as PetGender | undefined,
        province,
      },
      pagination:
        paginationType === "cursor"
          ? { type: "cursor", cursor, limit }
          : { type: "offset", page, perPage },
    };

    const result = await repo.query(query);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "ไม่สามารถโหลดข้อมูลได้";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    // Check auth
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
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
