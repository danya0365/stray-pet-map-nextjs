/**
 * POST /api/auth/switch-profile
 * Switch to a different profile
 *
 * ✅ Uses SupabaseAuthRepository — no direct Supabase queries in API route
 * ✅ Clean Architecture pattern
 */

import { SupabaseAuthRepository } from "@/infrastructure/repositories/supabase/SupabaseAuthRepository";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const authRepo = new SupabaseAuthRepository(supabase);

    // Check if user is authenticated
    const user = await authRepo.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { profileId } = await request.json();

    if (!profileId) {
      return NextResponse.json(
        { error: "Profile ID is required" },
        { status: 400 },
      );
    }

    // Switch profile via repository
    const profile = await authRepo.switchProfile(profileId);

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found or access denied" },
        { status: 404 },
      );
    }

    return NextResponse.json({ profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
