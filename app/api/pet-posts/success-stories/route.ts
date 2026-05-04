import { createServerPetPostPresenter } from "@/presentation/presenters/pet-post/PetPostPresenterServerFactory";
import { NextResponse } from "next/server";

// GET /api/pet-posts/success-stories - ดึงเรื่องราวความสำเร็จ
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "6", 10);

    const presenter = await createServerPetPostPresenter();
    const result = await presenter.getSuccessStories(limit);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      stories: result.data,
      total: result.data?.length ?? 0,
    });
  } catch (error) {
    console.error("Error fetching success stories:", error);
    return NextResponse.json(
      { error: "Failed to fetch success stories" },
      { status: 500 },
    );
  }
}
