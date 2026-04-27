/**
 * PATCH /api/auth/profile
 * Update current user profile
 *
 * ✅ Uses ProfilePresenter (Clean Architecture)
 * ✅ No direct Supabase access from client
 */

import { createServerProfilePresenter } from "@/presentation/presenters/profile/ProfilePresenterServerFactory";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  try {
    const { fullName, username, bio, avatarUrl } = await request.json();

    const presenter = await createServerProfilePresenter();
    const result = await presenter.updateProfile({
      fullName,
      username,
      bio,
      avatarUrl,
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ profile: result.profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
