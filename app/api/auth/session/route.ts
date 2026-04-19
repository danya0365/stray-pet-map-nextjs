/**
 * GET /api/auth/session
 * Get current session info (server-side)
 *
 * ✅ Uses AuthPresenter (Clean Architecture)
 * ✅ No direct Supabase access from client
 */

import { createServerAuthPresenter } from "@/presentation/presenters/auth/AuthPresenterServerFactory";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const presenter = await createServerAuthPresenter();
    const result = await presenter.getSession();

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      session: result.session,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
