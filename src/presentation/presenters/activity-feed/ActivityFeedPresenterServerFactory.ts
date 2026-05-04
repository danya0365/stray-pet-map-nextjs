import { SupabaseActivityFeedRepository } from "@/infrastructure/repositories/supabase/SupabaseActivityFeedRepository";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { ActivityFeedPresenter } from "./ActivityFeedPresenter";

export class ActivityFeedPresenterServerFactory {
  static async create(): Promise<ActivityFeedPresenter> {
    const supabase = await createServerSupabaseClient();
    const repo = new SupabaseActivityFeedRepository(supabase);
    return new ActivityFeedPresenter(repo);
  }
}

export async function createServerActivityFeedPresenter(): Promise<ActivityFeedPresenter> {
  return ActivityFeedPresenterServerFactory.create();
}
