import { SupabasePublicProfileRepository } from "@/infrastructure/repositories/supabase/SupabasePublicProfileRepository";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ profileId: string }>;
}

// GET /api/profiles/[profileId]/exists - ตรวจสอบว่า profile มีอยู่จริง
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { profileId } = await params;

    if (!profileId) {
      return NextResponse.json({ exists: false }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    const repo = new SupabasePublicProfileRepository(supabase);

    const exists = await repo.exists(profileId);

    return NextResponse.json({ exists });
  } catch (error) {
    console.error("Error checking profile existence:", error);
    return NextResponse.json({ exists: false }, { status: 500 });
  }
}
