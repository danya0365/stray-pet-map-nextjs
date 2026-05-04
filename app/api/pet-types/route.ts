/**
 * /api/pet-types
 * API Route for pet type read operations
 *
 * ✅ Uses PetTypePresenter (Clean Architecture)
 * ✅ Client components call this via ApiPetTypeRepository
 */

import { createServerPetTypePresenter } from "@/presentation/presenters/pet-type/PetTypePresenterServerFactory";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const presenter = await createServerPetTypePresenter();
    const result = await presenter.getAll();

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "ไม่สามารถโหลดชนิดสัตว์ได้";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
