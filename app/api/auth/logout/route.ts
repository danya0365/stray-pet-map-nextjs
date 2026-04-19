/**
 * POST /api/auth/logout
 * Proxy: sign out (server-side)
 *
 * ✅ Uses AuthOperationsPresenter (Clean Architecture)
 * ✅ No direct Supabase access from client
 * ✅ Session cookies cleared server-side
 */

import { createServerAuthOperationsPresenter } from "@/presentation/presenters/auth/AuthOperationsPresenterServerFactory";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const presenter = await createServerAuthOperationsPresenter();
    const result = await presenter.signOut();

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
