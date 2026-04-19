/**
 * ReportPresenterServerFactory
 * Factory for creating ReportPresenter instances on the server side
 * ✅ Injects the appropriate repository (Mock or Real)
 */

import { SupabaseReportRepository } from "@/infrastructure/repositories/supabase/SupabaseReportRepository";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { ReportPresenter } from "./ReportPresenter";

export class ReportPresenterServerFactory {
  static async create(): Promise<ReportPresenter> {
    const supabase = await createServerSupabaseClient();
    const repository = new SupabaseReportRepository(supabase);
    return new ReportPresenter(repository);
  }
}

export async function createServerReportPresenter(): Promise<ReportPresenter> {
  return await ReportPresenterServerFactory.create();
}
