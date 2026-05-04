/**
 * GET /api/auth/profiles
 * Get all profiles for the current user
 *
 * ✅ Uses AuthOperationsPresenter (Clean Architecture)
 * ✅ No direct Supabase queries in API route
 */

import { createServerAuthPresenter } from "@/presentation/presenters/auth/AuthPresenterServerFactory";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const presenter = await createServerAuthPresenter();
    const result = await presenter.getProfiles();

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ profiles: result.profiles });
  } catch (error) {
    const message = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
