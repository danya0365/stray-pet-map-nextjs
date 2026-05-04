/**
 * POST /api/auth/oauth
 * Initiate OAuth sign in (Google, etc.)
 *
 * ✅ Uses AuthOperationsPresenter (Clean Architecture)
 * ✅ No direct Supabase access from client
 */

import { createServerAuthPresenter } from "@/presentation/presenters/auth/AuthPresenterServerFactory";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { provider } = await request.json();

    if (!provider) {
      return NextResponse.json(
        { error: "Provider is required" },
        { status: 400 },
      );
    }

    const presenter = await createServerAuthPresenter();
    // For now only google is supported via the public method
    const result =
      provider === "google"
        ? await presenter.signInWithGoogle()
        : { success: false, error: "Unsupported provider" };

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    if (!result.url) {
      return NextResponse.json(
        { error: "No redirect URL returned" },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: result.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
