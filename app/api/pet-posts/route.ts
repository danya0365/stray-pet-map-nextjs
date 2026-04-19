/**
 * /api/pet-posts
 * API Route for pet post CRUD operations
 *
 * ✅ Uses PetPostPresenter (Clean Architecture)
 * ✅ Client components call this via ApiPetPostRepository
 * ✅ GET = query / list, POST = create
 */

import type { PetPostQuery } from "@/application/repositories/IPetPostRepository";
import type {
  PetGender,
  PetPostPurpose,
  PetPostStatus,
} from "@/domain/entities/pet-post";
import { createServerPetPostPresenter } from "@/presentation/presenters/pet-post/PetPostPresenterServerFactory";
import { NextResponse } from "next/server";

// GET /api/pet-posts — query pet posts (public)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const presenter = await createServerPetPostPresenter();

    const search = searchParams.get("search") || undefined;
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder =
      (searchParams.get("sortOrder") as "asc" | "desc") || "desc";

    const purposeParam = searchParams.get("purpose");
    const purpose = purposeParam ? purposeParam.split(",") : undefined;
    const statusParam = searchParams.get("status");
    const status = statusParam ? statusParam.split(",") : undefined;
    const petTypeId = searchParams.get("petTypeId") || undefined;
    const gender = searchParams.get("gender") || undefined;
    const province = searchParams.get("province") || undefined;
    const breed = searchParams.get("breed") || undefined;
    const color = searchParams.get("color") || undefined;

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
        purpose: purpose as PetPostPurpose[] | undefined,
        status: status as PetPostStatus[] | undefined,
        petTypeId,
        gender: gender as PetGender | undefined,
        province,
        breed,
        color,
      },
      pagination:
        paginationType === "cursor"
          ? { type: "cursor", cursor, limit }
          : { type: "offset", page, perPage },
    };

    const result = await presenter.query(query);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    // Detailed error logging for debugging
    console.error("[GET /api/pet-posts] Error:", error);
    console.error("[GET /api/pet-posts] Request URL:", request.url);

    // Supabase errors have .code, .details, .hint, .message
    const supaErr = error as {
      message?: string;
      details?: string;
      hint?: string;
      code?: string;
    };

    const message = supaErr?.message || "ไม่สามารถโหลดข้อมูลได้";
    const details = supaErr?.details || undefined;
    const hint = supaErr?.hint || undefined;
    const code = supaErr?.code || undefined;

    return NextResponse.json(
      { error: message, details, hint, code },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log(
      "[POST /api/pet-posts] Payload:",
      JSON.stringify(body, null, 2),
    );

    const presenter = await createServerPetPostPresenter();
    const result = await presenter.create(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error: unknown) {
    console.error("[POST /api/pet-posts] Error:", error);

    // Supabase errors have .code, .details, .hint, .message
    const supaErr = error as {
      message?: string;
      details?: string;
      hint?: string;
      code?: string;
    };

    const message = supaErr?.message || "ไม่สามารถสร้างโพสต์ได้";
    const details = supaErr?.details || undefined;
    const hint = supaErr?.hint || undefined;
    const code = supaErr?.code || undefined;

    return NextResponse.json(
      { error: message, details, hint, code },
      { status: 500 },
    );
  }
}
