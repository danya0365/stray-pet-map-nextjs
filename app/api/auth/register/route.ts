/**
 * POST /api/auth/register
 * Proxy: sign up with email + password (server-side)
 *
 * ✅ Uses AuthOperationsPresenter (Clean Architecture)
 * ✅ No direct Supabase access from client
 * ✅ Session cookies set server-side
 */

import { createServerAuthPresenter } from "@/presentation/presenters/auth/AuthPresenterServerFactory";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password, fullName, username } = await request.json();

    const presenter = await createServerAuthPresenter();
    const result = await presenter.signUp(email, password, {
      full_name: fullName,
      username: username || email.split("@")[0],
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ user: result.user });
  } catch (error) {
    const message = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
