/**
 * GET /api/auth/me
 * Proxy: get current user + profile (server-side)
 *
 * ✅ Uses AuthOperationsPresenter (Clean Architecture)
 * ✅ No direct Supabase access from client
 * ✅ Returns user + profile with role
 */

import { createServerAuthOperationsPresenter } from "@/presentation/presenters/auth/AuthOperationsPresenterServerFactory";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const presenter = await createServerAuthOperationsPresenter();
    const result = await presenter.getCurrentUser();

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      user: result.user,
      profile: result.profile,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
