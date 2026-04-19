/**
 * POST /api/auth/switch-profile
 * Switch to a different profile
 *
 * ✅ Uses AuthOperationsPresenter (Clean Architecture)
 * ✅ No direct Supabase queries in API route
 */

import { createServerAuthOperationsPresenter } from "@/presentation/presenters/auth/AuthOperationsPresenterServerFactory";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { profileId } = await request.json();

    const presenter = await createServerAuthOperationsPresenter();
    const result = await presenter.switchProfile(profileId);

    if (!result.success) {
      if (result.error === "Unauthorized") {
        return NextResponse.json({ error: result.error }, { status: 401 });
      }
      if (result.error === "Profile ID is required") {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    return NextResponse.json({ profile: result.profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
