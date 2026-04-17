"use client";

import type { Badge, BadgeProgress } from "@/domain/entities/badge";
import type { PetPost } from "@/domain/entities/pet-post";
import type { ProfileViewModel } from "@/presentation/presenters/profile/ProfilePresenter";
import { useProfilePresenter } from "@/presentation/presenters/profile/useProfilePresenter";
import {
  Award,
  Check,
  ChevronRight,
  Edit3,
  Loader2,
  MapPin,
  PawPrint,
  Plus,
  RefreshCw,
  Shield,
  Sparkles,
  SwitchCamera,
  Trash2,
  Trophy,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

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

interface ProfileViewProps {
  initialViewModel?: ProfileViewModel;
}

export function ProfileView({ initialViewModel }: ProfileViewProps) {
  // Use the presenter hook with initialViewModel from server
  const [state, actions] = useProfilePresenter(initialViewModel);
  const { viewModel, loading, error, isSwitchingProfile, isDeletingPost } =
    state;
  const { switchProfile, refreshProfiles, deletePost } = actions;

  const [showAllProfiles, setShowAllProfiles] = useState(false);

  // Badges state
  const [badgesData, setBadgesData] = useState<{
    badges: Badge[];
    totalBadges: number;
    progress: BadgeProgress[];
  } | null>(null);
  const [badgesLoading, setBadgesLoading] = useState(true);
  const [isCheckingBadges, setIsCheckingBadges] = useState(false);

  // Get data from viewModel or initialViewModel
  const user = viewModel?.user || initialViewModel?.user;
  const profile = viewModel?.profile || initialViewModel?.profile;
  const profiles = viewModel?.profiles || initialViewModel?.profiles || [];
  const hasMultipleProfiles =
    viewModel?.hasMultipleProfiles ||
    initialViewModel?.hasMultipleProfiles ||
    profiles.length > 1;

  // Fetch badges
  useEffect(() => {
    async function fetchBadges() {
      if (!user) return;
      try {
        setBadgesLoading(true);
        const res = await fetch("/api/badges/profile");
        if (res.ok) {
          const result = await res.json();
          setBadgesData({
            badges: result.badges || [],
            totalBadges: result.totalBadges || 0,
            progress: result.progress || [],
          });
        }
      } catch (err) {
        console.error("Failed to fetch badges:", err);
      } finally {
        setBadgesLoading(false);
      }
    }

    fetchBadges();
  }, [user]);

  const handleCheckBadges = async () => {
    try {
      setIsCheckingBadges(true);
      const res = await fetch("/api/badges/profile", { method: "POST" });
      if (res.ok) {
        const result = await res.json();
        setBadgesData({
          badges: result.badges || [],
          totalBadges: result.totalBadges || 0,
          progress: result.progress || [],
        });
      }
    } catch (err) {
      console.error("Failed to check badges:", err);
    } finally {
      setIsCheckingBadges(false);
    }
  };

  const handleSwitchProfile = async (profileId: string) => {
    await switchProfile(profileId);
    await refreshProfiles();
  };

  if (loading && !initialViewModel) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 text-center">
        <p className="text-red-500">{error}</p>
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

      {/* Badges Section */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">ตราสัญลักษณ์</h3>
            {badgesData && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {badgesData.totalBadges}
              </span>
            )}
          </div>
          <Link
            href="/profile/badges"
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            ดูทั้งหมด
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {badgesLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary/60" />
          </div>
        ) : badgesData && badgesData.badges.length > 0 ? (
          <div className="space-y-4">
            {/* Badges Preview Grid */}
            <div className="flex flex-wrap gap-3">
              {badgesData.badges.slice(0, 5).map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2"
                >
                  <span className="text-2xl">{badge.icon}</span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium">{badge.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {badge.earnedValue && `ทำได้ ${badge.earnedValue} ครั้ง`}
                    </p>
                  </div>
                </div>
              ))}
              {badgesData.badges.length > 5 && (
                <Link
                  href="/profile/badges"
                  className="flex items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 px-4 py-2 text-xs text-muted-foreground hover:border-primary/30 hover:text-primary"
                >
                  +{badgesData.badges.length - 5} อื่นๆ
                </Link>
              )}
            </div>

            {/* Progress Preview */}
            {badgesData.progress.length > 0 && (
              <div className="border-t border-border pt-3">
                <p className="mb-2 text-xs text-muted-foreground">
                  ความคืบหน้า
                </p>
                <div className="space-y-2">
                  {badgesData.progress.slice(0, 2).map((p) => (
                    <div key={p.type} className="flex items-center gap-2">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{
                            width: `${Math.min(100, (p.current / p.target) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {p.current}/{p.target}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Check Badges Button */}
            <button
              onClick={handleCheckBadges}
              disabled={isCheckingBadges}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-muted/30 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
            >
              <RefreshCw
                className={`h-3 w-3 ${isCheckingBadges ? "animate-spin" : ""}`}
              />
              {isCheckingBadges ? "กำลังตรวจสอบ..." : "ตรวจสอบตราสัญลักษณ์ใหม่"}
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Sparkles className="h-10 w-10 text-foreground/20" />
            <p className="mt-2 text-sm font-medium text-foreground/60">
              ยังไม่มีตราสัญลักษณ์
            </p>
            <p className="text-xs text-muted-foreground">
              เริ่มสร้างโพสต์ช่วยเหลือสัตว์เพื่อรับตราสัญลักษณ์!
            </p>
            <div className="mt-3 flex gap-2">
              <Link
                href="/posts/create"
                className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/90"
              >
                <Award className="h-3 w-3" />
                สร้างโพสต์
              </Link>
              <button
                onClick={handleCheckBadges}
                disabled={isCheckingBadges}
                className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-3 w-3 ${isCheckingBadges ? "animate-spin" : ""}`}
                />
                ตรวจสอบ
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-4 text-center transition-colors hover:border-primary/20">
          <PawPrint className="mx-auto h-5 w-5 text-primary/60" />
          <p className="mt-1 text-lg font-bold">
            {viewModel?.stats?.posts ?? initialViewModel?.stats?.posts ?? 0}
          </p>
          <p className="text-xs text-foreground/50">โพสต์</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center transition-colors hover:border-primary/20">
          <MapPin className="mx-auto h-5 w-5 text-primary/60" />
          <p className="mt-1 text-lg font-bold">
            {viewModel?.stats?.helped ?? initialViewModel?.stats?.helped ?? 0}
          </p>
          <p className="text-xs text-foreground/50">ช่วยเหลือ</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center transition-colors hover:border-primary/20">
          <span className="text-xl">⭐</span>
          <p className="mt-1 text-lg font-bold">
            {viewModel?.stats?.points ?? initialViewModel?.stats?.points ?? 0}
          </p>
          <p className="text-xs text-foreground/50">คะแนน</p>
        </div>
      </div>

      {/* My Posts Section */}
      <UserPostsSection
        posts={viewModel?.posts ?? initialViewModel?.posts ?? []}
        totalPosts={viewModel?.totalPosts ?? initialViewModel?.totalPosts ?? 0}
        onDeletePost={deletePost}
        isDeletingPost={isDeletingPost}
      />
    </div>
  );
}

// User Posts Section Component
function UserPostsSection({
  posts,
  totalPosts,
  onDeletePost,
  isDeletingPost,
}: {
  posts: PetPost[];
  totalPosts: number;
  onDeletePost: (postId: string) => Promise<boolean>;
  isDeletingPost: string | null;
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null,
  );

  const handleDelete = async (postId: string) => {
    const success = await onDeletePost(postId);
    if (success) {
      setShowDeleteConfirm(null);
    } else {
      alert("ไม่สามารถลบโพสต์ได้ กรุณาลองอีกครั้ง");
    }
  };

  const statusLabels: Record<string, { label: string; color: string }> = {
    available: {
      label: "รอรับเลี้ยง",
      color: "bg-emerald-100 text-emerald-700",
    },
    pending: { label: "มีคนสนใจ", color: "bg-amber-100 text-amber-700" },
    adopted: { label: "มีบ้านแล้ว", color: "bg-blue-100 text-blue-700" },
    missing: { label: "ตามหาน้อง", color: "bg-red-100 text-red-700" },
  };

  const outcomeLabels: Record<string, string> = {
    rehomed: "มีบ้านใหม่",
    owner_found: "เจอเจ้าของ",
    cancelled: "ยกเลิก",
    expired: "หมดอายุ",
    admin_closed: "ถูกปิดโดยแอดมิน",
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PawPrint className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">โพสต์ของฉัน</h3>
          {totalPosts > 0 && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {totalPosts}
            </span>
          )}
        </div>
        <Link
          href="/posts/create"
          className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/90"
        >
          <Plus className="h-3.5 w-3.5" />
          สร้างโพสต์
        </Link>
      </div>

      {/* Posts List */}
      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 py-8 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <PawPrint className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            ยังไม่มีโพสต์
          </p>
          <p className="text-xs text-muted-foreground/70">
            เริ่มต้นช่วยเหลือน้องด้วยการสร้างโพสต์แรก
          </p>
          <Link
            href="/posts/create"
            className="mt-3 inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/90"
          >
            <Plus className="h-3.5 w-3.5" />
            สร้างโพสต์
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => {
            const status = statusLabels[post.status] ?? statusLabels.available;
            const hasOutcome = post.outcome && outcomeLabels[post.outcome];

            return (
              <div
                key={post.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-background p-3 transition-colors hover:border-primary/20"
              >
                {/* Thumbnail */}
                <Link
                  href={`/pets/${post.id}`}
                  className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted"
                >
                  {post.thumbnailUrl ? (
                    <Image
                      src={post.thumbnailUrl}
                      alt={post.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl">
                      {post.petType?.icon || "🐾"}
                    </div>
                  )}
                </Link>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <Link href={`/pets/${post.id}`} className="block">
                    <p className="truncate font-medium hover:text-primary">
                      {post.title}
                    </p>
                  </Link>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${status.color}`}
                    >
                      {status.label}
                    </span>
                    {hasOutcome && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                        {outcomeLabels[post.outcome!]}
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground">
                      {post.petType?.icon} {post.petType?.name}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  {/* Edit - Coming Soon if post has outcome */}
                  <button
                    type="button"
                    onClick={() => {
                      if (post.outcome) {
                        alert("โพสต์ที่จบแล้วไม่สามารถแก้ไขได้");
                        return;
                      }
                      // Navigate to edit page (coming soon)
                      alert("ฟีเจอร์แก้ไขโพสต์กำลังพัฒนา");
                    }}
                    disabled={!!post.outcome}
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
                    title={
                      post.outcome ? "โพสต์ที่จบแล้วไม่สามารถแก้ไขได้" : "แก้ไข"
                    }
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(post.id)}
                    disabled={isDeletingPost === post.id}
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    title="ลบ"
                  >
                    {isDeletingPost === post.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(null)}
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                <Trash2 className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">ยืนยันการลบ</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                คุณแน่ใจหรือไม่ว่าต้องการลบโพสต์นี้?
                <br />
                การกระทำนี้ไม่สามารถย้อนกลับได้
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(showDeleteConfirm)}
                  disabled={isDeletingPost !== null}
                  className="flex-1 rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50"
                >
                  {isDeletingPost ? "กำลังลบ..." : "ลบ"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
