/**
 * CommentPresenterClientFactory
 * ✅ Uses MockCommentRepository for development
 * ✅ Client → Repository → Data
 */

"use client";

import { MockCommentRepository } from "@/infrastructure/repositories/mock/MockCommentRepository";
import { CommentPresenter } from "./CommentPresenter";

export class CommentPresenterClientFactory {
  static create(): CommentPresenter {
    const repository = new MockCommentRepository();
    return new CommentPresenter(repository);
  }
}

export function createClientCommentPresenter(): CommentPresenter {
  return CommentPresenterClientFactory.create();
}
