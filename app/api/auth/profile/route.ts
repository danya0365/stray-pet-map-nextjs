/**
 * PATCH /api/auth/profile — Update current user profile
 * POST  /api/auth/profile — Create new profile
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

export async function POST(request: Request) {
  try {
    const { fullName, username, bio, avatarUrl } = await request.json();

    const presenter = await createServerProfilePresenter();
    const result = await presenter.createProfile({
      fullName,
      username,
      bio,
      avatarUrl,
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ profile: result.profile }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
