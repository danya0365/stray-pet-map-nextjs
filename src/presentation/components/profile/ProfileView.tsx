"use client";

import { useAuthStore } from "@/presentation/stores/useAuthStore";
import { MapPin, PawPrint, Shield } from "lucide-react";

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  admin: { label: "ผู้ดูแลระบบ", color: "text-red-500 bg-red-50 dark:bg-red-950/30" },
  moderator: { label: "อาสาตรวจสอบ", color: "text-blue-500 bg-blue-50 dark:bg-blue-950/30" },
  user: { label: "ผู้ใช้ทั่วไป", color: "text-green-500 bg-green-50 dark:bg-green-950/30" },
};

export function ProfileView() {
  const { user, profile, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="py-20 text-center text-foreground/50">
        ไม่พบข้อมูลโปรไฟล์
      </div>
    );
  }

  const roleInfo = ROLE_LABELS[profile.role] ?? ROLE_LABELS.user;

  return (
    <div className="space-y-8">
      {/* Profile card */}
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          {/* Avatar */}
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-4xl">
            {profile.avatarUrl || "🐾"}
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-bold">
              {profile.fullName || "ผู้ใช้งาน"}
            </h2>
            <p className="text-sm text-foreground/50">
              @{profile.username || user.email?.split("@")[0]}
            </p>
            <p className="mt-1 text-sm text-foreground/40">{user.email}</p>

            {/* Role badge */}
            <div className="mt-3 flex justify-center gap-2 sm:justify-start">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${roleInfo.color}`}
              >
                <Shield className="h-3 w-3" />
                {roleInfo.label}
              </span>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="mt-3 text-sm text-foreground/60">{profile.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* Stats (placeholder) */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <PawPrint className="mx-auto h-5 w-5 text-primary/60" />
          <p className="mt-1 text-lg font-bold">0</p>
          <p className="text-xs text-foreground/50">โพสต์</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <MapPin className="mx-auto h-5 w-5 text-primary/60" />
          <p className="mt-1 text-lg font-bold">0</p>
          <p className="text-xs text-foreground/50">ช่วยเหลือ</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <span className="text-xl">⭐</span>
          <p className="mt-1 text-lg font-bold">0</p>
          <p className="text-xs text-foreground/50">คะแนน</p>
        </div>
      </div>
    </div>
  );
}
