"use client";

import { ApiAuthRepository } from "@/infrastructure/repositories/api/ApiAuthRepository";
import { useAuthStore } from "@/presentation/stores/useAuthStore";
import {
  Check,
  Loader2,
  MapPin,
  PawPrint,
  Plus,
  Shield,
  SwitchCamera,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

const ROLE_LABELS: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  admin: {
    label: "ผู้ดูแลระบบ",
    color: "text-amber-600 dark:text-amber-400",
    bgColor:
      "bg-amber-50 dark:bg-amber-950/30 ring-amber-200 dark:ring-amber-800",
  },
  moderator: {
    label: "อาสาตรวจสอบ",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/30 ring-blue-200 dark:ring-blue-800",
  },
  user: {
    label: "ผู้ใช้ทั่วไป",
    color: "text-green-600 dark:text-green-400",
    bgColor:
      "bg-green-50 dark:bg-green-950/30 ring-green-200 dark:ring-green-800",
  },
};

export function ProfileView() {
  const router = useRouter();
  const {
    user,
    profile,
    profiles,
    isLoading,
    isSwitchingProfile,
    setProfile,
    setSwitchingProfile,
  } = useAuthStore();

  const [showAllProfiles, setShowAllProfiles] = useState(false);

  const handleSwitchProfile = useCallback(
    async (profileId: string) => {
      if (isSwitchingProfile || profileId === profile?.id) return;

      setSwitchingProfile(true);
      try {
        const authRepo = new ApiAuthRepository();
        const newProfile = await authRepo.switchProfile(profileId);
        if (newProfile) {
          setProfile(newProfile);
          router.refresh();
        }
      } catch (error) {
        console.error("Failed to switch profile:", error);
      } finally {
        setSwitchingProfile(false);
      }
    },
    [isSwitchingProfile, profile?.id, setProfile, setSwitchingProfile, router],
  );

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
  const hasMultipleProfiles = profiles.length > 1;

  return (
    <div className="space-y-6">
      {/* Current Active Profile Card */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />

        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
            {/* Large Avatar */}
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 text-4xl font-bold text-primary ring-4 ring-background">
                {(profile.fullName || profile.username || "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>
              {/* Active indicator */}
              <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 ring-2 ring-background">
                <Check className="h-3.5 w-3.5 text-white" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-3">
                <h2 className="text-2xl font-bold">
                  {profile.fullName || "ผู้ใช้งาน"}
                </h2>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 ${roleInfo.bgColor} ${roleInfo.color}`}
                >
                  <Shield className="h-3 w-3" />
                  {roleInfo.label}
                </span>
              </div>

              <p className="mt-1 text-sm text-foreground/50">
                @{profile.username || user.email?.split("@")[0]}
              </p>
              <p className="text-sm text-foreground/40">{user.email}</p>

              {/* Bio */}
              {profile.bio ? (
                <p className="mt-3 text-sm text-foreground/60">{profile.bio}</p>
              ) : (
                <p className="mt-3 text-sm italic text-foreground/30">
                  ยังไม่มีคำอธิบายตัวเอง
                </p>
              )}

              {/* Active badge */}
              <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-950/30 dark:text-green-400">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                </span>
                กำลังใช้งานโปรไฟล์นี้
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Management Section */}
      {hasMultipleProfiles && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SwitchCamera className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">จัดการโปรไฟล์</h3>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {profiles.length}
              </span>
            </div>
            <button
              onClick={() => setShowAllProfiles(!showAllProfiles)}
              className="text-xs text-primary hover:underline"
            >
              {showAllProfiles ? "ซ่อนบางส่วน" : "ดูทั้งหมด"}
            </button>
          </div>

          <div className="space-y-2">
            {profiles
              .slice(0, showAllProfiles ? profiles.length : 3)
              .map((p) => {
                const isCurrent = profile.id === p.id;
                const pRole = ROLE_LABELS[p.role] ?? ROLE_LABELS.user;

                return (
                  <button
                    key={p.id}
                    onClick={() => !isCurrent && handleSwitchProfile(p.id)}
                    disabled={isCurrent || isSwitchingProfile}
                    className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                      isCurrent
                        ? "border-primary/30 bg-primary/5 ring-1 ring-primary/20"
                        : "border-border bg-background hover:border-primary/20 hover:bg-muted/50"
                    } ${isSwitchingProfile && !isCurrent ? "opacity-60" : ""}`}
                  >
                    {/* Avatar */}
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-semibold ${
                        isCurrent
                          ? "bg-primary text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isSwitchingProfile && !isCurrent ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        (p.fullName || p.username || "U")
                          .charAt(0)
                          .toUpperCase()
                      )}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <p
                        className={`truncate font-medium ${
                          isCurrent
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {p.fullName || p.username || "ผู้ใช้"}
                      </p>
                      <span
                        className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium ${pRole.bgColor} ${pRole.color}`}
                      >
                        <Shield className="h-2.5 w-2.5" />
                        {pRole.label}
                      </span>
                    </div>

                    {/* Status */}
                    {isCurrent ? (
                      <div className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-[10px] font-medium text-green-700 dark:bg-green-950/30 dark:text-green-400">
                        <Check className="h-3 w-3" />
                        ใช้งานอยู่
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        คลิกเพื่อสลับ
                      </span>
                    )}
                  </button>
                );
              })}
          </div>

          {/* Add new profile hint */}
          <div className="mt-4 rounded-xl border border-dashed border-border bg-muted/30 p-4 text-center">
            <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-muted">
              <Plus className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">
              ต้องการเพิ่มโปรไฟล์ใหม่?
              <br />
              ติดต่อผู้ดูแลระบบ
            </p>
          </div>
        </div>
      )}

      {/* Single profile state - show upgrade hint */}
      {!hasMultipleProfiles && (
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <User className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-medium">โปรไฟล์เดียว</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            คุณมีโปรไฟล์เดียวเท่านั้น
            <br />
            ติดต่อผู้ดูแลระบบเพื่อเพิ่มโปรไฟล์อื่น
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-4 text-center transition-colors hover:border-primary/20">
          <PawPrint className="mx-auto h-5 w-5 text-primary/60" />
          <p className="mt-1 text-lg font-bold">0</p>
          <p className="text-xs text-foreground/50">โพสต์</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center transition-colors hover:border-primary/20">
          <MapPin className="mx-auto h-5 w-5 text-primary/60" />
          <p className="mt-1 text-lg font-bold">0</p>
          <p className="text-xs text-foreground/50">ช่วยเหลือ</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center transition-colors hover:border-primary/20">
          <span className="text-xl">⭐</span>
          <p className="mt-1 text-lg font-bold">0</p>
          <p className="text-xs text-foreground/50">คะแนน</p>
        </div>
      </div>
    </div>
  );
}
