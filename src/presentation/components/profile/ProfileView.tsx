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
  ExternalLink,
  FileText,
  Heart,
  Loader2,
  PawPrint,
  Plus,
  RefreshCw,
  Settings,
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

// Badge type labels in Thai
const BADGE_TYPE_LABELS: Record<string, string> = {
  successful_adoption: "ช่วยน้องมีบ้าน",
  pet_finder: "ตามหาน้องเจอ",
  first_post: "โพสต์แรก",
  helper: "ผู้ช่วยเหลือ",
  volunteer: "อาสาสมัคร",
  expert: "ผู้เชี่ยวชาญ",
  // Add more as needed
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
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Hero Card - Glassmorphism with Bento Grid */}
        <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-card via-card to-muted/30 p-6 shadow-lg backdrop-blur-sm sm:p-8">
          {/* Decorative gradient blobs */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-secondary/10 blur-3xl" />
          <div className="pointer-events-none absolute right-1/3 top-1/2 h-32 w-32 rounded-full bg-accent/10 blur-2xl" />

          <div className="relative">
            {/* Top Row: Avatar + Info + Quick Actions */}
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
              {/* Avatar with ring */}
              <div className="relative shrink-0">
                <div className="relative h-28 w-28 overflow-hidden rounded-full bg-muted ring-4 ring-primary/20 ring-offset-4 ring-offset-background sm:h-32 sm:w-32">
                  {profile.avatarUrl &&
                  (profile.avatarUrl.startsWith("http") ||
                    profile.avatarUrl.startsWith("/")) ? (
                    <Image
                      src={profile.avatarUrl}
                      alt={profile.fullName || "ผู้ใช้"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-primary">
                      {(profile.fullName || profile.username || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}
                </div>
                {/* Active indicator */}
                <div className="absolute -right-1 -bottom-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-background shadow-lg">
                  <Check className="h-4 w-4" />
                </div>
              </div>

              {/* Info Section */}
              <div className="flex-1 text-center sm:text-left">
                <div className="mb-1 flex flex-col items-center gap-2 sm:flex-row sm:items-baseline">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {profile.fullName || "ผู้ใช้งาน"}
                  </h1>
                  <span className="text-sm text-muted-foreground">
                    @{profile.username || user.email?.split("@")[0]}
                  </span>
                </div>

                <div className="mb-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 ${roleInfo.bgColor} ${roleInfo.color}`}
                  >
                    <Shield className="h-3 w-3" />
                    {roleInfo.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>

                {/* Bio */}
                {profile.bio ? (
                  <p className="mb-4 max-w-lg text-sm text-muted-foreground">
                    {profile.bio}
                  </p>
                ) : (
                  <p className="mb-4 text-sm italic text-muted-foreground/50">
                    ยังไม่มีคำอธิบายตัวเอง
                  </p>
                )}

                {/* Quick Actions */}
                <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                  <Link
                    href="/profile/edit"
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-4 py-2 text-sm font-medium text-foreground transition-all hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm"
                  >
                    <Settings className="h-4 w-4" />
                    แก้ไขโปรไฟล์
                  </Link>
                  <Link
                    href={`/profile/${profile.id}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-4 py-2 text-sm font-medium text-foreground transition-all hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm"
                  >
                    <ExternalLink className="h-4 w-4" />
                    ดูโปรไฟล์สาธารณะ
                  </Link>
                </div>
              </div>
            </div>

            {/* Bento Grid Stats */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-background/50 p-4 text-center transition-all hover:border-primary/30 hover:bg-primary/5">
                <div className="mb-2 flex justify-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {viewModel?.stats?.posts ??
                    initialViewModel?.stats?.posts ??
                    0}
                </p>
                <p className="text-xs text-muted-foreground">โพสต์</p>
              </div>

              <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-background/50 p-4 text-center transition-all hover:border-secondary/30 hover:bg-secondary/5">
                <div className="mb-2 flex justify-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                    <Heart className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {viewModel?.stats?.helped ??
                    initialViewModel?.stats?.helped ??
                    0}
                </p>
                <p className="text-xs text-muted-foreground">ช่วยสำเร็จ</p>
              </div>

              <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-background/50 p-4 text-center transition-all hover:border-accent/30 hover:bg-accent/5">
                <div className="mb-2 flex justify-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent-foreground">
                    <Trophy className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {badgesData?.totalBadges ?? 0}
                </p>
                <p className="text-xs text-muted-foreground">ตราสัญลักษณ์</p>
              </div>

              <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-background/50 p-4 text-center transition-all hover:border-primary/30 hover:bg-primary/5">
                <div className="mb-2 flex justify-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground">
                    <span className="text-lg">⭐</span>
                  </div>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {viewModel?.stats?.points ??
                    initialViewModel?.stats?.points ??
                    0}
                </p>
                <p className="text-xs text-muted-foreground">คะแนน</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Management - Accordion Style */}
        {hasMultipleProfiles && (
          <div className="rounded-2xl border border-border/50 bg-card/50 p-6 shadow-sm">
            <button
              onClick={() => setShowAllProfiles(!showAllProfiles)}
              className="flex w-full items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <SwitchCamera className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-foreground">สลับโปรไฟล์</h3>
                  <p className="text-xs text-muted-foreground">
                    {profiles.length} โปรไฟล์ในระบบ
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                  {showAllProfiles ? "ซ่อน" : "ดูทั้งหมด"}
                </span>
                <ChevronRight
                  className={`h-5 w-5 text-muted-foreground transition-transform ${showAllProfiles ? "rotate-90" : ""}`}
                />
              </div>
            </button>

            {/* Expandable Profile List */}
            <div
              className={`overflow-hidden transition-all ${showAllProfiles ? "mt-4 max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}
            >
              <div className="space-y-2 border-t border-border/50 pt-4">
                {profiles.map((p) => {
                  const isCurrent = profile.id === p.id;
                  const pRole = ROLE_LABELS[p.role] ?? ROLE_LABELS.user;

                  return (
                    <button
                      key={p.id}
                      onClick={() => !isCurrent && handleSwitchProfile(p.id)}
                      disabled={isCurrent || isSwitchingProfile}
                      className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                        isCurrent
                          ? "border-primary/30 bg-primary/5"
                          : "border-border/50 bg-background/50 hover:border-primary/20 hover:bg-muted/30"
                      } ${isSwitchingProfile && !isCurrent ? "opacity-60" : ""}`}
                    >
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-lg font-semibold ${
                          isCurrent
                            ? "bg-primary text-white shadow-sm"
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

                      <div className="min-w-0 flex-1">
                        <p
                          className={`truncate font-medium ${isCurrent ? "text-foreground" : "text-muted-foreground"}`}
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

                      {isCurrent ? (
                        <div className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-[10px] font-medium text-green-700 dark:bg-green-950/30 dark:text-green-400">
                          <Check className="h-3 w-3" />
                          ใช้งานอยู่
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          คลิกสลับ
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Add profile hint */}
              <div className="mt-3 flex items-center gap-3 rounded-xl border border-dashed border-border/50 bg-muted/20 p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">
                  ต้องการเพิ่มโปรไฟล์? ติดต่อผู้ดูแลระบบ
                </p>
              </div>
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

        {/* Badges Section - Horizontal Scroll */}
        <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Trophy className="h-4 w-4" />
              </div>
              <h3 className="font-semibold text-foreground">ตราสัญลักษณ์</h3>
              {badgesData && badgesData.totalBadges > 0 && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {badgesData.totalBadges}
                </span>
              )}
            </div>
            <Link
              href="/profile/badges"
              className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
            >
              ดูทั้งหมด
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {badgesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary/60" />
            </div>
          ) : badgesData && badgesData.badges.length > 0 ? (
            <div className="space-y-4">
              {/* Horizontal Scroll Badges */}
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {badgesData.badges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`flex shrink-0 items-center gap-3 rounded-2xl border border-border/50 p-3 transition-transform hover:scale-105 ${badge.color}`}
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-2xl">
                      {badge.icon}
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{badge.name}</p>
                      <p className="text-xs capitalize opacity-80">
                        {badge.tier}
                      </p>
                      {badge.earnedValue && (
                        <p className="text-[10px] opacity-70">
                          ทำได้ {badge.earnedValue} ครั้ง
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Progress Preview */}
              {badgesData.progress.length > 0 && (
                <div className="rounded-xl border border-border/50 bg-background/50 p-4">
                  <p className="mb-3 text-xs font-medium text-muted-foreground">
                    ความคืบหน้าระดับถัดไป
                  </p>
                  <div className="space-y-3">
                    {badgesData.progress.slice(0, 2).map((p) => (
                      <div key={p.type} className="flex items-center gap-3">
                        <span
                          className="text-xs text-muted-foreground w-20 truncate"
                          title={BADGE_TYPE_LABELS[p.type] || p.type}
                        >
                          {BADGE_TYPE_LABELS[p.type] || p.type}
                        </span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{
                              width: `${Math.min(100, (p.current / p.target) * 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground w-14 text-right">
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
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-border/50 bg-background/50 py-2.5 text-sm text-muted-foreground transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-foreground disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isCheckingBadges ? "animate-spin" : ""}`}
                />
                {isCheckingBadges
                  ? "กำลังตรวจสอบ..."
                  : "ตรวจสอบตราสัญลักษณ์ใหม่"}
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 bg-background/30 py-8 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <Sparkles className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground/60">
                ยังไม่มีตราสัญลักษณ์
              </p>
              <p className="text-xs text-muted-foreground">
                เริ่มสร้างโพสต์ช่วยเหลือสัตว์เพื่อรับตราสัญลักษณ์!
              </p>
              <div className="mt-4 flex gap-2">
                <Link
                  href="/posts/create"
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-medium text-white hover:bg-primary/90"
                >
                  <Award className="h-3.5 w-3.5" />
                  สร้างโพสต์
                </Link>
                <button
                  onClick={handleCheckBadges}
                  disabled={isCheckingBadges}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs text-muted-foreground hover:bg-muted disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${isCheckingBadges ? "animate-spin" : ""}`}
                  />
                  ตรวจสอบ
                </button>
              </div>
            </div>
          )}
        </div>

        {/* My Posts Section */}
        <UserPostsSection
          posts={viewModel?.posts ?? initialViewModel?.posts ?? []}
          totalPosts={
            viewModel?.totalPosts ?? initialViewModel?.totalPosts ?? 0
          }
          onDeletePost={deletePost}
          isDeletingPost={isDeletingPost}
        />
      </div>
    </main>
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
    <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <PawPrint className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">โพสต์ของฉัน</h3>
            <p className="text-xs text-muted-foreground">
              จัดการโพสต์ที่สร้างไว้
            </p>
          </div>
          {totalPosts > 0 && (
            <span className="ml-2 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {totalPosts}
            </span>
          )}
        </div>
        <Link
          href="/posts/create"
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
        >
          <Plus className="h-4 w-4" />
          สร้างโพสต์
        </Link>
      </div>

      {/* Posts List */}
      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 bg-background/30 py-10 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <PawPrint className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground/60">
            ยังไม่มีโพสต์
          </p>
          <p className="text-xs text-muted-foreground">
            เริ่มต้นช่วยเหลือน้องด้วยการสร้างโพสต์แรก
          </p>
          <Link
            href="/posts/create"
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            สร้างโพสต์
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const status = statusLabels[post.status] ?? statusLabels.available;
            const hasOutcome = post.outcome && outcomeLabels[post.outcome];

            return (
              <div
                key={post.id}
                className="group relative overflow-hidden rounded-2xl border border-border/50 bg-background transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                {/* Thumbnail */}
                <Link
                  href={`/pets/${post.id}`}
                  className="relative block aspect-4/3 overflow-hidden bg-muted"
                >
                  {post.thumbnailUrl ? (
                    <Image
                      src={post.thumbnailUrl}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-4xl">
                      {post.petType?.icon || "🐾"}
                    </div>
                  )}
                  {/* Status Badge */}
                  <span
                    className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm ${
                      post.status === "available"
                        ? "bg-emerald-500 text-white"
                        : post.status === "adopted"
                          ? "bg-blue-500 text-white"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {status.label}
                  </span>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/10">
                    <div className="translate-y-2 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
                      <div className="flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-foreground shadow-lg backdrop-blur-sm">
                        ดูรายละเอียด
                        <ChevronRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Info */}
                <div className="p-3">
                  <Link href={`/pets/${post.id}`}>
                    <h4 className="mb-1 line-clamp-1 font-medium text-foreground transition-colors group-hover:text-primary">
                      {post.title}
                    </h4>
                  </Link>

                  <div className="mb-2 flex flex-wrap items-center gap-1.5">
                    {hasOutcome && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                        {outcomeLabels[post.outcome!]}
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground">
                      {post.petType?.icon} {post.petType?.name}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 border-t border-border/30 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (post.outcome) {
                          alert("โพสต์ที่จบแล้วไม่สามารถแก้ไขได้");
                          return;
                        }
                        alert("ฟีเจอร์แก้ไขโพสต์กำลังพัฒนา");
                      }}
                      disabled={!!post.outcome}
                      className="flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
                      title={
                        post.outcome
                          ? "โพสต์ที่จบแล้วไม่สามารถแก้ไขได้"
                          : "แก้ไข"
                      }
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      แก้ไข
                    </button>
                    <div className="h-4 w-px bg-border/50" />
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(post.id)}
                      disabled={isDeletingPost === post.id}
                      className="flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      title="ลบ"
                    >
                      {isDeletingPost === post.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                      ลบ
                    </button>
                  </div>
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
