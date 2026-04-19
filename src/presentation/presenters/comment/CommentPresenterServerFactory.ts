import { SupabaseCommentRepository } from "@/infrastructure/repositories/supabase/SupabaseCommentRepository";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { CommentPresenter } from "./CommentPresenter";

export class CommentPresenterServerFactory {
  static async create(): Promise<CommentPresenter> {
    const supabase = await createServerSupabaseClient();
    const repository = new SupabaseCommentRepository(supabase);
    return new CommentPresenter(repository);
  }
}

export async function createServerCommentPresenter(): Promise<CommentPresenter> {
  return CommentPresenterServerFactory.create();
}
