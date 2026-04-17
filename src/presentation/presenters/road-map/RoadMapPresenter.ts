/**
 * RoadMapPresenter
 * Handles business logic for the Road Map page
 * Receives repository via dependency injection
 */

import type {
  IRoadMapRepository,
  RoadMapViewModel,
} from "@/application/repositories/IRoadMapRepository";
import type { Metadata } from "next";

export type { RoadMapViewModel };

export class RoadMapPresenter {
  constructor(private readonly repository: IRoadMapRepository) {}

  // ────────────────────────────────────────────────────────────
  // VIEW MODEL
  // ────────────────────────────────────────────────────────────

  async getViewModel(): Promise<RoadMapViewModel> {
    const [tiers, stats] = await Promise.all([
      this.repository.getTiers(),
      this.repository.getStats(),
    ]);

    return { tiers, stats };
  }

  // ────────────────────────────────────────────────────────────
  // METADATA
  // ────────────────────────────────────────────────────────────

  generateMetadata(): Metadata {
    return {
      title: "Road Map — แผนพัฒนาแพลตฟอร์ม | StrayPetMap",
      description:
        "ดูแผนการพัฒนาฟีเจอร์ใหม่ๆ ของ StrayPetMap — ยิ่งสนับสนุนมาก ยิ่งได้ฟีเจอร์เด็ดๆ เร็วขึ้น!",
    };
  }
}
