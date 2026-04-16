"use client";

/**
 * useCreatePostPresenter
 * Custom hook for CreatePost presenter — ALL logic lives here.
 * ✅ Clean Architecture: View receives [State, Actions] and only renders UI
 * ✅ Manages: step navigation, react-hook-form, image, location, submission
 * ✅ Accepts presenter override for testing (DI)
 */

import type {
  CreatePetPostPayload,
  PetPost,
  PetType,
} from "@/domain/entities/pet-post";
import {
  createPostSchema,
  type CreatePostFormValues,
} from "@/presentation/validations/createPostSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form";
import { useForm } from "react-hook-form";
import type {
  CreatePostPresenter,
  CreatePostViewModel,
} from "./CreatePostPresenter";
import { createClientCreatePostPresenter } from "./CreatePostPresenterClientFactory";

// ── Constants ────────────────────────────────────────────

const TOTAL_STEPS = 4;

// ── State ────────────────────────────────────────────────

export interface CreatePostPresenterState {
  // Step
  step: number;
  isReview: boolean;

  // Form (exposed to View)
  errors: FieldErrors<CreatePostFormValues>;
  watchedValues: {
    petTypeId?: string;
    gender: string;
    purpose: string;
    latitude?: number;
    title?: string;
    breed?: string;
    color?: string;
    estimatedAge?: string;
    description?: string;
    isVaccinated?: boolean | null;
    isNeutered?: boolean | null;
  };

  // Image
  imagePreview: string | null;

  // Location
  showLocationPicker: boolean;
  locationAddress: string | null;

  // Submission
  submitting: boolean;
  error: string | null;
  createdPost: PetPost | null;
}

// ── Actions ──────────────────────────────────────────────

export interface CreatePostPresenterActions {
  // Step navigation
  goNext: () => Promise<void>;
  goBack: () => void;
  skipToReview: () => void;
  goToStep: (targetStep: number) => void;

  // Form helpers (pass-through to react-hook-form)
  register: UseFormRegister<CreatePostFormValues>;
  setValue: UseFormSetValue<CreatePostFormValues>;
  handleFormSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;

  // Image
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  // Location
  openLocationPicker: () => void;
  closeLocationPicker: () => void;
  handleLocationConfirm: (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;

  // Submission
  resetForm: () => void;
  setError: (error: string | null) => void;

  // Helpers
  buildTitleSuggestions: () => string[];
}

// ── Helper: build title suggestions ──────────────────────

function buildTitleSuggestions(
  petTypeId: string | undefined,
  purpose: string | undefined,
  address: string | null,
  petTypes: PetType[],
): string[] {
  const petLabel = petTypes.find((p) => p.id === petTypeId)?.name ?? "น้อง";
  const shortAddress = address
    ? address.split(",").slice(0, 2).join(",").trim()
    : null;

  const suggestions: string[] = [];

  if (purpose === "rehome_pet" || purpose === "community_cat") {
    suggestions.push(
      `${petLabel}รอรับเลี้ยง${shortAddress ? ` พบที่${shortAddress}` : ""}`,
    );
    if (shortAddress) {
      suggestions.push(`พบ${petLabel}จร ${shortAddress}`);
    }
    suggestions.push(`${petLabel}น่ารัก หาบ้านให้หน่อย`);
  } else if (purpose === "lost_pet") {
    suggestions.push(
      `ตามหา${petLabel}${shortAddress ? ` หายจาก${shortAddress}` : ""}`,
    );
    if (shortAddress) {
      suggestions.push(`ใครเจอ${petLabel} แถว${shortAddress} ช่วยแจ้งด้วย`);
    }
    suggestions.push(`${petLabel}หาย ช่วยตามหาด้วยค่ะ`);
  }

  return suggestions;
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
  const petTypes = useMemo(
    () => initialViewModel?.petTypes ?? [],
    [initialViewModel?.petTypes],
  );

  // ── Step state ───────────────────────────────────────

  const [step, setStep] = useState(1);
  const isReview = step > TOTAL_STEPS;

  // ── Form (react-hook-form) ───────────────────────────

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    reset,
    formState: { errors },
  } = useForm<CreatePostFormValues>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      gender: "unknown",
      purpose: "community_cat",
    },
  });

  const watchedValues = {
    petTypeId: watch("petTypeId"),
    gender: watch("gender"),
    purpose: watch("purpose"),
    latitude: watch("latitude"),
    title: watch("title"),
    breed: watch("breed"),
    color: watch("color"),
    estimatedAge: watch("estimatedAge"),
    description: watch("description"),
    isVaccinated: watch("isVaccinated"),
    isNeutered: watch("isNeutered"),
  };

  // ── Image state ──────────────────────────────────────

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // ── Location state ───────────────────────────────────

  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [locationAddress, setLocationAddress] = useState<string | null>(null);

  // ── Submission state ─────────────────────────────────

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdPost, setCreatedPost] = useState<PetPost | null>(null);

  // ── Step navigation ──────────────────────────────────

  const canGoNext = useCallback(
    async (currentStep: number): Promise<boolean> => {
      switch (currentStep) {
        case 1:
          return await trigger(["purpose", "petTypeId"]);
        case 2:
          return await trigger(["latitude", "longitude"]);
        case 3:
          return await trigger(["title", "gender"]);
        case 4:
          return true;
        default:
          return true;
      }
    },
    [trigger],
  );

  const goNext = useCallback(async () => {
    if (await canGoNext(step)) {
      setStep((s) => Math.min(s + 1, TOTAL_STEPS + 1));
    }
  }, [canGoNext, step]);

  const goBack = useCallback(() => {
    setStep((s) => Math.max(s - 1, 1));
  }, []);

  const skipToReview = useCallback(() => {
    setStep(TOTAL_STEPS + 1);
  }, []);

  const goToStep = useCallback(
    (targetStep: number) => {
      if (targetStep >= 1 && targetStep < step) {
        setStep(targetStep);
      }
    },
    [step],
  );

  // ── Image handling ───────────────────────────────────

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    },
    [],
  );

  // ── Location handling ────────────────────────────────

  const openLocationPicker = useCallback(() => {
    setShowLocationPicker(true);
  }, []);

  const closeLocationPicker = useCallback(() => {
    setShowLocationPicker(false);
  }, []);

  const handleLocationConfirm = useCallback(
    (location: { latitude: number; longitude: number; address: string }) => {
      setValue("latitude", location.latitude, { shouldValidate: true });
      setValue("longitude", location.longitude, { shouldValidate: true });
      setValue("address", location.address);
      setLocationAddress(location.address);
      setShowLocationPicker(false);
    },
    [setValue],
  );

  // ── Submission ───────────────────────────────────────

  const onSubmit = useCallback(
    async (data: CreatePostFormValues) => {
      // ✅ Step-based guard: only submit from the review step
      if (step <= TOTAL_STEPS) {
        return;
      }

      setSubmitting(true);
      setError(null);

      try {
        let thumbnailUrl = data.thumbnailUrl;
        if (imageFile) {
          const result = await presenter.uploadThumbnail(imageFile);
          thumbnailUrl = result.url;
        }

        const payload: CreatePetPostPayload = {
          petTypeId: data.petTypeId,
          title: data.title,
          description: data.description,
          breed: data.breed,
          color: data.color,
          gender: data.gender,
          estimatedAge: data.estimatedAge,
          isVaccinated: data.isVaccinated ?? undefined,
          isNeutered: data.isNeutered ?? undefined,
          latitude: data.latitude,
          longitude: data.longitude,
          address: data.address,
          province: data.province,
          purpose: data.purpose,
          thumbnailUrl,
        };

        const post = await presenter.createPost(payload);

        if (isMountedRef.current) {
          setCreatedPost(post);
        }
      } catch (err) {
        if (isMountedRef.current) {
          const message =
            err instanceof Error ? err.message : "เกิดข้อผิดพลาด กรุณาลองใหม่";
          setError(message);
        }
      } finally {
        if (isMountedRef.current) {
          setSubmitting(false);
        }
      }
    },
    [step, imageFile, presenter],
  );

  const handleFormSubmit = useMemo(
    () => handleSubmit(onSubmit),
    [handleSubmit, onSubmit],
  );

  const resetForm = useCallback(() => {
    setCreatedPost(null);
    setError(null);
    setSubmitting(false);
    setImageFile(null);
    setImagePreview(null);
    setLocationAddress(null);
    setStep(1);
    reset({ gender: "unknown", purpose: "community_cat" });
  }, [reset]);

  // ── Title suggestions ────────────────────────────────

  const buildTitleSuggestionsAction = useCallback(() => {
    return buildTitleSuggestions(
      watchedValues.petTypeId,
      watchedValues.purpose,
      locationAddress,
      petTypes,
    );
  }, [
    watchedValues.petTypeId,
    watchedValues.purpose,
    locationAddress,
    petTypes,
  ]);

  // ── Cleanup on unmount ───────────────────────────────

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // ── Return [State, Actions] ──────────────────────────

  return [
    {
      step,
      isReview,
      errors,
      watchedValues,
      imagePreview,
      showLocationPicker,
      locationAddress,
      submitting,
      error,
      createdPost,
    },
    {
      goNext,
      goBack,
      skipToReview,
      goToStep,
      register,
      setValue,
      handleFormSubmit,
      handleImageChange,
      openLocationPicker,
      closeLocationPicker,
      handleLocationConfirm,
      resetForm,
      setError,
      buildTitleSuggestions: buildTitleSuggestionsAction,
    },
  ];
}
