/**
 * POST /api/auth/register
 * Proxy: sign up with email + password (server-side)
 *
 * ✅ No direct Supabase access from client
 * ✅ Session cookies set server-side
 */

import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password, fullName, username } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "กรุณากรอกอีเมลและรหัสผ่าน" },
        { status: 400 },
      );
    }

    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          username: username || email.split("@")[0],
        },
      },
    });

    if (error) {
      const message =
        error.message === "User already registered"
          ? "อีเมลนี้ถูกใช้งานแล้ว"
          : error.message;
      return NextResponse.json({ error: message }, { status: 400 });
    }

    return NextResponse.json({ user: data.user });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
