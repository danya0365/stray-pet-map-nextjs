/**
 * ReportPresenterClientFactory
 * ✅ Uses ApiReportRepository for production
 * ✅ Client → API Routes → Supabase
 */

"use client";

import { ApiReportRepository } from "@/infrastructure/repositories/api/ApiReportRepository";
import { ReportPresenter } from "./ReportPresenter";

export class ReportPresenterClientFactory {
  static create(): ReportPresenter {
    const repository = new ApiReportRepository();
    return new ReportPresenter(repository);
  }
}

export function createClientReportPresenter(): ReportPresenter {
  return ReportPresenterClientFactory.create();
}
