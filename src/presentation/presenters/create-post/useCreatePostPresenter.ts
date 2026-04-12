"use client";

/**
 * useCreatePostPresenter
 * Custom hook for CreatePost presenter state management
 * ✅ Uses Zustand auth store for user context
 * ✅ Accepts presenter override for testing (DI)
 */

import type { CreatePetPostPayload, PetPost } from "@/domain/entities/pet-post";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  CreatePostPresenter,
  CreatePostViewModel,
} from "./CreatePostPresenter";
import { createClientCreatePostPresenter } from "./CreatePostPresenterClientFactory";

// ── State ────────────────────────────────────────────────

export interface CreatePostPresenterState {
  viewModel: CreatePostViewModel | null;
  loading: boolean;
  submitting: boolean;
  error: string | null;
  createdPost: PetPost | null;
}

// ── Actions ──────────────────────────────────────────────

export interface CreatePostPresenterActions {
  submitPost: (
    data: CreatePetPostPayload,
    imageFile: File | null,
  ) => Promise<void>;
  resetForm: () => void;
  setError: (error: string | null) => void;
}

// ── Hook ─────────────────────────────────────────────────

export function useCreatePostPresenter(
  initialViewModel?: CreatePostViewModel,
  presenterOverride?: CreatePostPresenter,
): [CreatePostPresenterState, CreatePostPresenterActions] {
  const presenter = useMemo(
    () => presenterOverride ?? createClientCreatePostPresenter(),
    [presenterOverride],
  );

  const isMountedRef = useRef(true);

  const [viewModel] = useState<CreatePostViewModel | null>(
    initialViewModel || null,
  );
  const [loading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdPost, setCreatedPost] = useState<PetPost | null>(null);

  const submitPost = useCallback(
    async (data: CreatePetPostPayload, imageFile: File | null) => {
      setSubmitting(true);
      setError(null);

      try {
        // Upload image via presenter (goes through ApiStorageRepository → API Route)
        let thumbnailUrl = data.thumbnailUrl;
        if (imageFile) {
          const result = await presenter.uploadThumbnail(imageFile);
          thumbnailUrl = result.url;
        }

        const post = await presenter.createPost({
          ...data,
          thumbnailUrl,
        });

        if (isMountedRef.current) {
          setCreatedPost(post);
        }
      } catch (err) {
        if (isMountedRef.current) {
          const message =
            err instanceof Error ? err.message : "เกิดข้อผิดพลาด กรุณาลองใหม่";
          setError(message);
        }
        throw err;
      } finally {
        if (isMountedRef.current) {
          setSubmitting(false);
        }
      }
    },
    [presenter],
  );

  const resetForm = useCallback(() => {
    setCreatedPost(null);
    setError(null);
    setSubmitting(false);
  }, []);

  // ✅ Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return [
    { viewModel, loading, submitting, error, createdPost },
    { submitPost, resetForm, setError },
  ];
}
