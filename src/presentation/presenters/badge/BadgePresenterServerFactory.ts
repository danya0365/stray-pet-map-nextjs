/**
 * BadgePresenterServerFactory
 * Factory for creating BadgePresenter instances on the server side
 * ✅ Injects the appropriate repositories (Mock or Real)
 */

import { SupabaseBadgeRepository } from "@/infrastructure/repositories/supabase/SupabaseBadgeRepository";
import { SupabaseProfileBadgeRepository } from "@/infrastructure/repositories/supabase/SupabaseProfileBadgeRepository";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { BadgePresenter } from "./BadgePresenter";

export class BadgePresenterServerFactory {
  static async create(): Promise<BadgePresenter> {
    const supabase = await createServerSupabaseClient();
    const badgeRepo = new SupabaseBadgeRepository(supabase);
    const profileBadgeRepo = new SupabaseProfileBadgeRepository(supabase);
    return new BadgePresenter(badgeRepo, profileBadgeRepo);
  }
}

export async function createServerBadgePresenter(): Promise<BadgePresenter> {
  return await BadgePresenterServerFactory.create();
}
