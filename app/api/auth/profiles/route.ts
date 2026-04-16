/**
 * GET /api/auth/profiles
 * Get all profiles for the current user
 *
 * ✅ Uses SupabaseAuthRepository — no direct Supabase queries in API route
 * ✅ Clean Architecture pattern
 */

import { SupabaseAuthRepository } from "@/infrastructure/repositories/supabase/SupabaseAuthRepository";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const authRepo = new SupabaseAuthRepository(supabase);

    const profiles = await authRepo.getProfiles();

    return NextResponse.json({ profiles });
  } catch (error) {
    const message = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
