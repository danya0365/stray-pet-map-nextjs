"use client";

import type {
  PetGender,
  PetPost,
  PetPostPurpose,
  PetPostStatus,
  PetType,
  UpdatePetPostData,
} from "@/domain/entities/pet-post";
import { useCallback, useMemo, useState } from "react";

// ── Form Data ────────────────────────────────────────────

export interface EditPostFormData {
  title: string;
  description: string;
  petTypeId: string;
  purpose: PetPostPurpose;
  status: PetPostStatus;
  gender: PetGender;
  breed: string;
  color: string;
  estimatedAge: string;
  isVaccinated: boolean;
  isNeutered: boolean;
  province: string;
  latitude: number | null;
  longitude: number | null;
}

function petPostToFormData(post: PetPost): EditPostFormData {
  return {
    title: post.title || "",
    description: post.description || "",
    petTypeId: post.petTypeId || "",
    purpose: post.purpose || "lost_pet",
    status: post.status || "available",
    gender: post.gender || "unknown",
    breed: post.breed || "",
    color: post.color || "",
    estimatedAge: post.estimatedAge || "",
    isVaccinated: post.isVaccinated ?? false,
    isNeutered: post.isNeutered ?? false,
    province: post.province || "",
    latitude: post.latitude ?? null,
    longitude: post.longitude ?? null,
  };
}

// ── State ────────────────────────────────────────────────

export interface EditPostState {
  form: EditPostFormData;
  submitting: boolean;
  error: string | null;
  showLocationPicker: boolean;
  petTypes: PetType[];
  originalPost: PetPost;
}

// ── Actions ──────────────────────────────────────────────

export interface EditPostActions {
  setField: <K extends keyof EditPostFormData>(
    key: K,
    value: EditPostFormData[K],
  ) => void;
  openLocationPicker: () => void;
  closeLocationPicker: () => void;
  handleLocationConfirm: (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
  submit: () => Promise<void>;
  hasChanges: boolean;
}

export function useEditPostPresenter(
  post: PetPost,
  petTypes: PetType[],
  onSuccess?: (updatedPost: PetPost) => void,
): [EditPostState, EditPostActions] {
  const [form, setForm] = useState<EditPostFormData>(() =>
    petPostToFormData(post),
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const setField = useCallback(
    <K extends keyof EditPostFormData>(key: K, value: EditPostFormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setError(null);
    },
    [],
  );

  const openLocationPicker = useCallback(() => setShowLocationPicker(true), []);
  const closeLocationPicker = useCallback(
    () => setShowLocationPicker(false),
    [],
  );

  const handleLocationConfirm = useCallback(
    (location: { latitude: number; longitude: number; address: string }) => {
      setForm((prev) => ({
        ...prev,
        latitude: location.latitude,
        longitude: location.longitude,
      }));
      setShowLocationPicker(false);
    },
    [],
  );

  const hasChanges = useMemo(() => {
    const original = petPostToFormData(post);
    return JSON.stringify(original) !== JSON.stringify(form);
  }, [form, post]);

  const submit = useCallback(async () => {
    if (!hasChanges) return;

    setSubmitting(true);
    setError(null);

    try {
      const updateData: UpdatePetPostData = {
        title: form.title,
        description: form.description,
        petTypeId: form.petTypeId,
        purpose: form.purpose,
        status: form.status,
        gender: form.gender,
        breed: form.breed || undefined,
        color: form.color || undefined,
        estimatedAge: form.estimatedAge || undefined,
        isVaccinated: form.isVaccinated,
        isNeutered: form.isNeutered,
        province: form.province || undefined,
        latitude: form.latitude ?? undefined,
        longitude: form.longitude ?? undefined,
      };

      const res = await fetch(`/api/pet-posts/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to update post");
      }

      const updatedPost: PetPost = await res.json();
      onSuccess?.(updatedPost);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
    } finally {
      setSubmitting(false);
    }
  }, [form, hasChanges, post.id, onSuccess]);

  const state: EditPostState = {
    form,
    submitting,
    error,
    showLocationPicker,
    petTypes,
    originalPost: post,
  };

  const actions: EditPostActions = {
    setField,
    openLocationPicker,
    closeLocationPicker,
    handleLocationConfirm,
    submit,
    hasChanges,
  };

  return [state, actions];
}
