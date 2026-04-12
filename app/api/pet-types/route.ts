/**
 * /api/pet-types
 * API Route for pet type read operations
 *
 * ✅ Uses SupabasePetTypeRepository (server-side)
 * ✅ Client components call this via ApiPetTypeRepository
 */

import { SupabasePetTypeRepository } from "@/infrastructure/repositories/supabase/SupabasePetTypeRepository";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const repo = new SupabasePetTypeRepository(supabase);
    const petTypes = await repo.getAll();

    return NextResponse.json(petTypes);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "ไม่สามารถโหลดชนิดสัตว์ได้";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
