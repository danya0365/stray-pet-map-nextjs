"use client";

import type { AuthProfile } from "@/application/repositories/IAuthRepository";
import { compressImage } from "@/presentation/lib/image-compressor";
import { useAuthStore } from "@/presentation/stores/useAuthStore";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useRef, useState } from "react";
import type { Area } from "react-easy-crop";
import { EditProfilePresenter } from "./EditProfilePresenter";
import { createClientEditProfilePresenter } from "./EditProfilePresenterClientFactory";

/* ============================================================
   Canvas crop helper
   ============================================================ */
function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  targetSize = 512,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.src = imageSrc;
    image.crossOrigin = "anonymous";
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = targetSize;
      canvas.height = targetSize;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("canvas error"));

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        targetSize,
        targetSize,
      );

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("crop failed"));
        },
        "image/jpeg",
        0.92,
      );
    };
    image.onerror = () => reject(new Error("load image failed"));
  });
}

/* ============================================================
   Hook
   ============================================================ */
export interface EditProfileState {
  fullName: string;
  username: string;
  bio: string;
  avatarUrl: string;
  isSubmitting: boolean;
  error: string | null;
  success: boolean;
  cropOpen: boolean;
  cropImage: string | null;
  crop: { x: number; y: number };
  zoom: number;
  isUploadingAvatar: boolean;
}

export interface EditProfileActions {
  setFullName: (v: string) => void;
  setUsername: (v: string) => void;
  setBio: (v: string) => void;
  setAvatarUrl: (v: string) => void;
  submit: () => Promise<void>;
  handleFileSelect: (file: File) => void;
  setCrop: (c: { x: number; y: number }) => void;
  setZoom: (z: number) => void;
  setCroppedAreaPixels: (area: Area | null) => void;
  confirmCrop: () => Promise<void>;
  cancelCrop: () => void;
  dismissError: () => void;
}

export function useEditProfilePresenter(
  initialProfile: AuthProfile,
  presenterOverride?: EditProfilePresenter,
): [EditProfileState, EditProfileActions] {
  const router = useRouter();
  const presenter = useMemo(
    () => presenterOverride ?? createClientEditProfilePresenter(),
    [presenterOverride],
  );
  const setStoreProfile = useAuthStore((s) => s.setProfile);
  const isMountedRef = useRef(true);

  const [fullName, setFullName] = useState(initialProfile.fullName ?? "");
  const [username, setUsername] = useState(initialProfile.username ?? "");
  const [bio, setBio] = useState(initialProfile.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(initialProfile.avatarUrl ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Crop modal state
  const [cropOpen, setCropOpen] = useState(false);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [crop, setCropState] = useState({ x: 0, y: 0 });
  const [zoom, setZoomState] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const dismissError = useCallback(() => setError(null), []);

  const submit = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await presenter.updateProfile({
        fullName: fullName || undefined,
        username: username || undefined,
        bio: bio || undefined,
        avatarUrl: avatarUrl || undefined,
      });

      if (result.error) {
        if (isMountedRef.current) setError(result.error);
        return;
      }

      if (result.profile) {
        setStoreProfile(result.profile);
      }
      if (isMountedRef.current) setSuccess(true);
      setTimeout(() => {
        if (isMountedRef.current) router.push("/profile");
      }, 1000);
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
      }
    } finally {
      if (isMountedRef.current) setIsSubmitting(false);
    }
  }, [presenter, fullName, username, bio, avatarUrl, router, setStoreProfile]);

  const handleFileSelect = useCallback(async (file: File) => {
    let processedFile = file;
    try {
      const compressedBlob = await compressImage(file);
      processedFile = new File([compressedBlob], file.name, {
        type: compressedBlob.type,
      });
    } catch {
      // Fallback to original if compression fails
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (isMountedRef.current) {
        setCropImage(reader.result as string);
        setCropState({ x: 0, y: 0 });
        setZoomState(1);
        setCropOpen(true);
      }
    };
    reader.readAsDataURL(processedFile);
  }, []);

  const confirmCrop = useCallback(async () => {
    if (!cropImage || !croppedAreaPixels) return;
    setIsUploadingAvatar(true);
    setError(null);

    try {
      const blob = await getCroppedImg(cropImage, croppedAreaPixels);
      const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });

      const result = await presenter.uploadAvatar(file);

      if (result.error) {
        if (isMountedRef.current) setError(result.error);
        return;
      }

      if (result.url) {
        if (isMountedRef.current) setAvatarUrl(result.url);
      }
      if (isMountedRef.current) {
        setCropOpen(false);
        setCropImage(null);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
      }
    } finally {
      if (isMountedRef.current) setIsUploadingAvatar(false);
    }
  }, [presenter, cropImage, croppedAreaPixels]);

  const cancelCrop = useCallback(() => {
    setCropOpen(false);
    if (cropImage) URL.revokeObjectURL(cropImage);
    setCropImage(null);
  }, [cropImage]);

  const state: EditProfileState = {
    fullName,
    username,
    bio,
    avatarUrl,
    isSubmitting,
    error,
    success,
    cropOpen,
    cropImage,
    crop,
    zoom,
    isUploadingAvatar,
  };

  const actions: EditProfileActions = {
    setFullName,
    setUsername,
    setBio,
    setAvatarUrl,
    submit,
    handleFileSelect,
    setCrop: setCropState,
    setZoom: setZoomState,
    setCroppedAreaPixels,
    confirmCrop,
    cancelCrop,
    dismissError,
  };

  return [state, actions];
}
