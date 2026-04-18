/**
 * GET /api/auth/me
 * Proxy: get current user + profile (server-side)
 *
 * ✅ No direct Supabase access from client
 * ✅ Returns user + profile with role
 */

import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ user: null, profile: null });
    }

    // Get profile
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, auth_id, username, full_name, avatar_url, bio")
      .eq("auth_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: true })
      .limit(1);

    const profile = profiles?.[0] ?? null;

    if (!profile) {
      return NextResponse.json({ user, profile: null });
    }

    // Get role
    const { data: roleData } = await supabase
      .from("profile_roles")
      .select("role")
      .eq("profile_id", profile.id)
      .single();

    return NextResponse.json({
      user,
      profile: {
        id: profile.id,
        authId: profile.auth_id,
        username: profile.username,
        fullName: profile.full_name,
        avatarUrl: profile.avatar_url,
        bio: profile.bio,
        role: roleData?.role ?? "user",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
