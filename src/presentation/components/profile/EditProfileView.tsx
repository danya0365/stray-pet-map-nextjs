"use client";

import type { AuthProfile } from "@/application/repositories/IAuthRepository";
import { Avatar } from "@/presentation/components/ui";
import {
  useEditProfilePresenter,
  type EditProfileActions,
  type EditProfileState,
} from "@/presentation/presenters/edit-profile/useEditProfilePresenter";
import { ArrowLeft, Camera, Loader2, Save, X, ZoomIn } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import Cropper from "react-easy-crop";

interface EditProfileViewProps {
  profile: AuthProfile;
}

export function EditProfileView({ profile }: EditProfileViewProps) {
  const [state, actions] = useEditProfilePresenter(profile);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <EditProfileForm
      state={state}
      actions={actions}
      fileInputRef={fileInputRef}
    />
  );
}

/* ============================================================
   Pure presentational component
   ============================================================ */
function EditProfileForm({
  state,
  actions,
  fileInputRef,
}: {
  state: EditProfileState;
  actions: EditProfileActions;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}) {
  const {
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
  } = state;

  const {
    setFullName,
    setUsername,
    setBio,
    submit,
    handleFileSelect,
    setCrop,
    setZoom,
    setCroppedAreaPixels,
    confirmCrop,
    cancelCrop,
  } = actions;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    e.target.value = "";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <Link
            href="/profile"
            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-semibold">แก้ไขโปรไฟล์</h1>
        </div>
      </div>

      {/* Form */}
      <div className="mx-auto max-w-2xl px-4 py-8">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="space-y-6"
        >
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="group relative h-24 w-24 overflow-hidden rounded-full ring-2 ring-border transition-all hover:ring-primary/50"
            >
              <Avatar
                src={avatarUrl}
                alt="Avatar"
                className="h-full w-full"
                imageClassName="transition-opacity group-hover:opacity-75"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                <Camera className="h-6 w-6 text-white" />
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <p className="text-xs text-muted-foreground">
              คลิกเพื่อเปลี่ยนรูปโปรไฟล์
            </p>
          </div>

          {/* Fields */}
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                ชื่อที่แสดง
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="ชื่อของคุณ"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                ชื่อผู้ใช้
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="@username"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                เกี่ยวกับฉัน
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="เล่าเกี่ยวกับตัวคุณสั้นๆ..."
                rows={4}
                className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-lg bg-success/10 px-4 py-3 text-sm text-success">
              บันทึกสำเร็จ! กำลังกลับไปหน้าโปรไฟล์...
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <Link
              href="/profile"
              className="flex-1 rounded-xl border border-border py-3 text-center text-sm font-medium transition-colors hover:bg-muted"
            >
              ยกเลิก
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              บันทึก
            </button>
          </div>
        </form>
      </div>

      {/* Crop Modal */}
      {cropOpen && cropImage && (
        <div className="fixed inset-0 z-100 flex flex-col bg-black/80">
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 py-3">
            <button
              type="button"
              onClick={cancelCrop}
              className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
            <span className="text-sm font-medium text-white">
              ปรับตำแหน่งรูปโปรไฟล์
            </span>
            <button
              type="button"
              onClick={confirmCrop}
              disabled={isUploadingAvatar}
              className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {isUploadingAvatar ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "ยืนยัน"
              )}
            </button>
          </div>

          {/* Crop area */}
          <div className="relative flex-1">
            <Cropper
              image={cropImage}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, areaPixels) =>
                setCroppedAreaPixels(areaPixels)
              }
            />
          </div>

          {/* Zoom slider */}
          <div className="flex items-center gap-3 px-6 py-4">
            <ZoomIn className="h-4 w-4 text-white/70" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 accent-primary"
            />
          </div>
        </div>
      )}
    </div>
  );
}
