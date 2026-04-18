/**
 * /api/pet-posts/stats
 * API Route for pet post statistics
 *
 * ✅ GET = getStats (public)
 */

import type { PetPostStatus } from "@/domain/entities/pet-post";
import { SupabasePetPostRepository } from "@/infrastructure/repositories/supabase/SupabasePetPostRepository";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { NextResponse } from "next/server";

// GET /api/pet-posts/stats — get pet post statistics (public)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const supabase = await createServerSupabaseClient();
    const repo = new SupabasePetPostRepository(supabase);

    const statusParam = searchParams.get("status");
    const status = statusParam
      ? (statusParam.split(",") as PetPostStatus[])
      : undefined;

    const stats = await repo.getStats(status ? { status } : undefined);
    return NextResponse.json(stats);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "ไม่สามารถโหลดสถิติได้";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
