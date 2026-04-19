/**
 * /api/pet-posts/stats
 * API Route for pet post statistics
 *
 * ✅ Uses PetPostPresenter (Clean Architecture)
 * ✅ GET = getStats (public)
 */

import type { PetPostStatus } from "@/domain/entities/pet-post";
import { createServerPetPostPresenter } from "@/presentation/presenters/pet-post/PetPostPresenterServerFactory";
import { NextResponse } from "next/server";

// GET /api/pet-posts/stats — get pet post statistics (public)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const presenter = await createServerPetPostPresenter();

    const statusParam = searchParams.get("status");
    const status = statusParam
      ? (statusParam.split(",") as PetPostStatus[])
      : undefined;

    const result = await presenter.getStats(status ? { status } : undefined);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "ไม่สามารถโหลดสถิติได้";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
