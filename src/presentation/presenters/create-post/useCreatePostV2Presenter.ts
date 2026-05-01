"use client";

/**
 * useCreatePostV2Presenter
 * ✅ Clean Architecture: ALL logic lives here, View only renders
 * ✅ No react-hook-form — plain useState for form data
 * ✅ No <form> element needed — explicit submit via button onClick
 * ✅ AI pet-type detection ready (placeholder for future integration)
 */

import type {
  CreatePetPostPayload,
  PetGender,
  PetPost,
  PetPostPurpose,
  PetType,
} from "@/domain/entities/pet-post";
import { compressImage } from "@/presentation/lib/image-compressor";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  CreatePostPresenter,
  CreatePostViewModel,
} from "./CreatePostPresenter";
import { createClientCreatePostPresenter } from "./CreatePostPresenterClientFactory";

// ── Constants ────────────────────────────────────────────

const TOTAL_STEPS = 4;

// ── Form Data ────────────────────────────────────────────

export interface CreatePostV2FormData {
  petTypeId: string;
  purpose: PetPostPurpose | "";
  latitude: number | null;
  longitude: number | null;
  address: string;
  title: string;
  gender: PetGender;
  breed: string;
  color: string;
  estimatedAge: string;
  description: string;
  isVaccinated: boolean | null;
  isNeutered: boolean | null;
}

const INITIAL_FORM: CreatePostV2FormData = {
  petTypeId: "",
  purpose: "",
  latitude: null,
  longitude: null,
  address: "",
  title: "",
  gender: "unknown",
  breed: "",
  color: "",
  estimatedAge: "",
  description: "",
  isVaccinated: null,
  isNeutered: null,
};

// ── State ────────────────────────────────────────────────

export interface CreatePostV2State {
  step: number;
  isReview: boolean;
  form: CreatePostV2FormData;
  imageFile: File | null;
  imagePreview: string | null;
  detecting: boolean;
  showLocationPicker: boolean;
  stepErrors: Record<string, string>;
  submitting: boolean;
  error: string | null;
  createdPost: PetPost | null;
  petTypes: PetType[];
}

// ── Actions ──────────────────────────────────────────────

export interface CreatePostV2Actions {
  setField: <K extends keyof CreatePostV2FormData>(
    key: K,
    value: CreatePostV2FormData[K],
  ) => void;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  goNext: () => void;
  goBack: () => void;
  goToStep: (step: number) => void;
  openLocationPicker: () => void;
  closeLocationPicker: () => void;
  handleLocationConfirm: (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
  submit: () => Promise<void>;
  resetForm: () => void;
  buildTitleSuggestions: () => string[];
}

// ── Helper: title suggestions ────────────────────────────

function buildTitleSuggestions(
  petTypeId: string,
  purpose: string,
  address: string,
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
    if (shortAddress) suggestions.push(`พบ${petLabel}จร ${shortAddress}`);
    suggestions.push(`${petLabel}น่ารัก หาบ้านให้หน่อย`);
  } else if (purpose === "lost_pet") {
    suggestions.push(
      `ตามหา${petLabel}${shortAddress ? ` หายจาก${shortAddress}` : ""}`,
    );
    if (shortAddress)
      suggestions.push(`ใครเจอ${petLabel} แถว${shortAddress} ช่วยแจ้งด้วย`);
    suggestions.push(`${petLabel}หาย ช่วยตามหาด้วยค่ะ`);
  }

  return suggestions;
}

// ── Helper: step validation ──────────────────────────────

function validateStep(
  step: number,
  form: CreatePostV2FormData,
  imageFile: File | null,
): Record<string, string> {
  const errors: Record<string, string> = {};

  switch (step) {
    case 1:
      if (!imageFile) errors.image = "กรุณาเลือกรูปน้อง";
      if (!form.petTypeId) errors.petTypeId = "กรุณาเลือกชนิดสัตว์";
      if (!form.purpose) errors.purpose = "กรุณาเลือกจุดประสงค์";
      break;
    case 2:
      if (form.latitude == null || form.longitude == null)
        errors.location = "กรุณาเลือกตำแหน่งบนแผนที่";
      break;
    case 3:
      if (!form.title.trim()) errors.title = "กรุณากรอกชื่อเรื่อง";
      break;
    // Step 4: all optional
  }

  return errors;
}

// ── Hook ─────────────────────────────────────────────────

export function useCreatePostV2Presenter(
  initialViewModel?: CreatePostViewModel,
  presenterOverride?: CreatePostPresenter,
): [CreatePostV2State, CreatePostV2Actions] {
  const presenter = useMemo(
    () => presenterOverride ?? createClientCreatePostPresenter(),
    [presenterOverride],
  );

  const isMountedRef = useRef(true);

  const petTypes = useMemo(
    () => initialViewModel?.petTypes ?? [],
    [initialViewModel?.petTypes],
  );

  // ── Step ────────────────────────────────────────────

  const [step, setStep] = useState(1);
  const isReview = step > TOTAL_STEPS;

  // ── Form data ───────────────────────────────────────

  const [form, setForm] = useState<CreatePostV2FormData>(INITIAL_FORM);

  // ── Image ───────────────────────────────────────────

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(false);

  // ── Location ────────────────────────────────────────

  const [showLocationPicker, setShowLocationPicker] = useState(false);

  // ── Validation ──────────────────────────────────────

  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});

  // ── Submission ──────────────────────────────────────

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdPost, setCreatedPost] = useState<PetPost | null>(null);

  // ── Set form field ──────────────────────────────────

  const setField = useCallback(
    <K extends keyof CreatePostV2FormData>(
      key: K,
      value: CreatePostV2FormData[K],
    ) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      // Clear related error when user interacts
      setStepErrors((prev) => {
        if (!(key in prev)) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      });
    },
    [],
  );

  // ── Image handling ──────────────────────────────────

  const handleImageChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const compressedBlob = await compressImage(file);
        const compressedFile = new File([compressedBlob], file.name, {
          type: compressedBlob.type,
        });
        setImageFile(compressedFile);
      } catch {
        // Fallback to original if compression fails
        setImageFile(file);
      }

      setStepErrors((prev) => {
        if (!("image" in prev)) return prev;
        const next = { ...prev };
        delete next.image;
        return next;
      });

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    },
    [],
  );

  // ── AI Detection (triggered by image change) ───────

  useEffect(() => {
    if (!imageFile) return;

    let cancelled = false;
    setDetecting(true);

    const detect = async () => {
      try {
        // ── TODO: Replace with actual AI detection API ──
        // Example:
        // const formData = new FormData();
        // formData.append("image", imageFile);
        // const res = await fetch("/api/ai/detect-pet", { method: "POST", body: formData });
        // const data = await res.json();
        // if (!cancelled && data.petTypeSlug) {
        //   const match = petTypes.find((pt) => pt.slug === data.petTypeSlug);
        //   if (match) setForm((prev) => ({ ...prev, petTypeId: match.id }));
        // }

        // Simulated delay for future AI integration
        await new Promise((resolve) => setTimeout(resolve, 1200));
      } catch {
        // Silent fail — user picks manually
      } finally {
        if (!cancelled) setDetecting(false);
      }
    };

    detect();
    return () => {
      cancelled = true;
    };
  }, [imageFile, petTypes]);

  // ── Navigation ──────────────────────────────────────

  const goNext = useCallback(() => {
    if (step > TOTAL_STEPS) return; // already at review

    const errors = validateStep(step, form, imageFile);
    if (Object.keys(errors).length > 0) {
      setStepErrors(errors);
      return;
    }

    setStepErrors({});
    setStep((s) => Math.min(s + 1, TOTAL_STEPS + 1));
  }, [step, form, imageFile]);

  const goBack = useCallback(() => {
    setStepErrors({});
    setStep((s) => Math.max(s - 1, 1));
  }, []);

  const goToStep = useCallback(
    (targetStep: number) => {
      if (targetStep >= 1 && targetStep <= step) {
        setStepErrors({});
        setStep(targetStep);
      }
    },
    [step],
  );

  // ── Location ────────────────────────────────────────

  const openLocationPicker = useCallback(() => {
    setShowLocationPicker(true);
  }, []);

  const closeLocationPicker = useCallback(() => {
    setShowLocationPicker(false);
  }, []);

  const handleLocationConfirm = useCallback(
    (location: { latitude: number; longitude: number; address: string }) => {
      setForm((prev) => ({
        ...prev,
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
      }));
      setStepErrors((prev) => {
        if (!("location" in prev)) return prev;
        const next = { ...prev };
        delete next.location;
        return next;
      });
      setShowLocationPicker(false);
    },
    [],
  );

  // ── Submit ──────────────────────────────────────────

  const submit = useCallback(async () => {
    setSubmitting(true);
    setError(null);

    try {
      // Upload image first
      let thumbnailUrl = "";
      if (imageFile) {
        const result = await presenter.uploadThumbnail(imageFile);
        thumbnailUrl = result.url;
      }

      const payload: CreatePetPostPayload = {
        petTypeId: form.petTypeId,
        title: form.title,
        description: form.description || undefined,
        breed: form.breed || undefined,
        color: form.color || undefined,
        gender: form.gender,
        estimatedAge: form.estimatedAge || undefined,
        isVaccinated: form.isVaccinated ?? undefined,
        isNeutered: form.isNeutered ?? undefined,
        latitude: form.latitude!,
        longitude: form.longitude!,
        address: form.address || undefined,
        purpose: form.purpose as PetPostPurpose,
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
  }, [form, imageFile, presenter]);

  // ── Reset ───────────────────────────────────────────

  const resetForm = useCallback(() => {
    setForm(INITIAL_FORM);
    setImageFile(null);
    setImagePreview(null);
    setStep(1);
    setStepErrors({});
    setSubmitting(false);
    setError(null);
    setCreatedPost(null);
    setDetecting(false);
  }, []);

  // ── Title suggestions ──────────────────────────────

  const buildTitleSuggestionsAction = useCallback(() => {
    return buildTitleSuggestions(
      form.petTypeId,
      form.purpose,
      form.address,
      petTypes,
    );
  }, [form.petTypeId, form.purpose, form.address, petTypes]);

  // ── Cleanup ─────────────────────────────────────────

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // ── Return [State, Actions] ─────────────────────────

  return [
    {
      step,
      isReview,
      form,
      imageFile,
      imagePreview,
      detecting,
      showLocationPicker,
      stepErrors,
      submitting,
      error,
      createdPost,
      petTypes,
    },
    {
      setField,
      handleImageChange,
      goNext,
      goBack,
      goToStep,
      openLocationPicker,
      closeLocationPicker,
      handleLocationConfirm,
      submit,
      resetForm,
      buildTitleSuggestions: buildTitleSuggestionsAction,
    },
  ];
}
