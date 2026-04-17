/**
 * RoadMapPresenterServerFactory
 * Factory for creating RoadMapPresenter instances on the server side
 */

import { SupabaseRoadMapRepository } from "@/infrastructure/repositories/supabase/SupabaseRoadMapRepository";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { RoadMapPresenter } from "./RoadMapPresenter";

/**
 * Factory for creating server-side RoadMapPresenter
 * Uses Supabase repository for real donation stats
 */
export async function createServerRoadMapPresenter(): Promise<RoadMapPresenter> {
  const supabase = await createServerSupabaseClient();
  const repository = new SupabaseRoadMapRepository(supabase);
  return new RoadMapPresenter(repository);
}
