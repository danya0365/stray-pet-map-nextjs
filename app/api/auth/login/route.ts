/**
 * POST /api/auth/login
 * Proxy: sign in with email + password (server-side)
 *
 * ✅ No direct Supabase access from client
 * ✅ Session cookies set server-side
 */

import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "กรุณากรอกอีเมลและรหัสผ่าน" },
        { status: 400 },
      );
    }

    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      const message =
        error.message === "Invalid login credentials"
          ? "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
          : error.message;
      return NextResponse.json({ error: message }, { status: 401 });
    }

    return NextResponse.json({
      user: data.user,
      session: { access_token: data.session?.access_token },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
