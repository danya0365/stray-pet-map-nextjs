/**
 * CommentPresenterClientFactory
 * ✅ Uses ApiCommentRepository for production
 * ✅ Client → API Routes → Supabase
 */

"use client";

import { ApiCommentRepository } from "@/infrastructure/repositories/api/ApiCommentRepository";
import { CommentPresenter } from "./CommentPresenter";

export class CommentPresenterClientFactory {
  static create(): CommentPresenter {
    const repository = new ApiCommentRepository();
    return new CommentPresenter(repository);
  }
}

export function createClientCommentPresenter(): CommentPresenter {
  return CommentPresenterClientFactory.create();
}
