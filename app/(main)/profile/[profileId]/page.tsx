import { createBaseMetadata } from "@/config/metadata";
import { SupabasePublicProfileRepository } from "@/infrastructure/repositories/supabase/SupabasePublicProfileRepository";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import {
  Award,
  BadgeCheck,
  Calendar,
  ChevronRight,
  FileText,
  Heart,
  MapPin,
  User,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ profileId: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { profileId } = await params;
  const supabase = await createServerSupabaseClient();
  const repo = new SupabasePublicProfileRepository(supabase);
  const profile = await repo.getById(profileId);

  if (!profile) {
    return createBaseMetadata(
      "ไม่พบโปรไฟล์ | StrayPetMap",
      "ไม่พบข้อมูลโปรไฟล์ที่ต้องการ",
    );
  }

  return createBaseMetadata(
    `${profile.displayName} | StrayPetMap`,
    profile.bio ??
      `โปรไฟล์ของ ${profile.displayName} บน StrayPetMap - ดูโพสต์และผลงานการช่วยเหลือสัตว์`,
    {
      url: `/profile/${profileId}`,
      image: profile.avatarUrl || undefined,
      keywords: ["โปรไฟล์", "profile", "นักช่วยเหลือ", "badges"],
    },
  );
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { profileId } = await params;
  const supabase = await createServerSupabaseClient();
  const repo = new SupabasePublicProfileRepository(supabase);

  const [profile, postsResult] = await Promise.all([
    repo.getById(profileId),
    repo.getPosts(profileId, 1, 12),
  ]);

  if (!profile) {
    notFound();
  }

  const { stats, badges, badgeProgress } = profile;

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Hero Card - Glassmorphism Style */}
        <div className="relative mb-6 overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-card via-card to-muted/30 p-6 shadow-lg backdrop-blur-sm sm:p-8">
          {/* Decorative gradient blobs */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-secondary/10 blur-3xl" />

          <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-8">
            {/* Avatar with ring */}
            <div className="relative shrink-0">
              <div className="relative h-28 w-28 overflow-hidden rounded-full bg-muted ring-4 ring-primary/20 ring-offset-4 ring-offset-background sm:h-32 sm:w-32">
                {profile.avatarUrl &&
                (profile.avatarUrl.startsWith("http") ||
                  profile.avatarUrl.startsWith("/")) ? (
                  <Image
                    src={profile.avatarUrl}
                    alt={profile.displayName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <User className="h-14 w-14 text-muted-foreground" />
                  </div>
                )}
              </div>
              {profile.isVerified && (
                <div className="absolute -right-1 -bottom-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                  <BadgeCheck className="h-5 w-5" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="mb-1 flex flex-col items-center gap-2 sm:flex-row sm:items-baseline">
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {profile.displayName}
                </h1>
                {profile.username && (
                  <span className="text-sm text-muted-foreground">
                    @{profile.username}
                  </span>
                )}
              </div>

              {profile.bio && (
                <p className="mb-4 max-w-xl text-muted-foreground">
                  {profile.bio}
                </p>
              )}

              {/* Bento Grid Stats */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-background/50 p-3 text-center transition-all hover:border-primary/30 hover:bg-primary/5 sm:p-4">
                  <div className="mb-1 flex justify-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <FileText className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="text-xl font-bold text-foreground sm:text-2xl">
                    {stats.totalPosts}
                  </p>
                  <p className="text-xs text-muted-foreground">โพสต์</p>
                </div>

                <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-background/50 p-3 text-center transition-all hover:border-secondary/30 hover:bg-secondary/5 sm:p-4">
                  <div className="mb-1 flex justify-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                      <Heart className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="text-xl font-bold text-foreground sm:text-2xl">
                    {stats.helpedCount}
                  </p>
                  <p className="text-xs text-muted-foreground">ช่วยสำเร็จ</p>
                </div>

                <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-background/50 p-3 text-center transition-all hover:border-accent/30 hover:bg-accent/5 sm:p-4">
                  <div className="mb-1 flex justify-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent-foreground">
                      <Award className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="text-xl font-bold text-foreground sm:text-2xl">
                    {stats.totalBadges}
                  </p>
                  <p className="text-xs text-muted-foreground">ตราสัญลักษณ์</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Badges Section - Horizontal Scroll */}
        {badges.length > 0 && (
          <div className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <Award className="h-5 w-5 text-primary" />
                ตราสัญลักษณ์
              </h2>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-sm font-medium text-muted-foreground">
                {badges.length}
              </span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`flex shrink-0 items-center gap-3 rounded-2xl border border-border/50 p-3 transition-transform hover:scale-105 ${badge.color}`}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-2xl">
                    {badge.icon}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{badge.name}</p>
                    <p className="text-xs capitalize opacity-80">
                      {badge.tier}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Posts Section */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <MapPin className="h-5 w-5 text-primary" />
              โพสต์ล่าสุด
            </h2>
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-sm font-medium text-muted-foreground">
              {postsResult.total}
            </span>
          </div>

          {postsResult.posts.length === 0 ? (
            <div className="rounded-2xl border border-border/50 bg-card/50 py-16 text-center">
              <div className="mb-3 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <MapPin className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
              <p className="text-muted-foreground">ยังไม่มีโพสต์</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {postsResult.posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/pets/${post.id}`}
                  className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-4/3 overflow-hidden bg-muted">
                    {post.thumbnailUrl ? (
                      <Image
                        src={post.thumbnailUrl}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <MapPin className="h-10 w-10 text-muted-foreground/50" />
                      </div>
                    )}
                    {/* Status Badge */}
                    <span
                      className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold shadow-lg ${
                        post.status === "available"
                          ? "bg-emerald-500 text-white"
                          : post.status === "adopted"
                            ? "bg-blue-500 text-white"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {post.status === "available"
                        ? "กำลังหาบ้าน"
                        : post.status === "adopted"
                          ? "มีบ้านแล้ว"
                          : post.status === "missing"
                            ? "หาย"
                            : "รอดำเนินการ"}
                    </span>
                    {/* Hover overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                      <div className="translate-y-4 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
                        <div className="flex items-center gap-1 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-foreground shadow-lg backdrop-blur-sm">
                          ดูรายละเอียด
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="mb-1 line-clamp-1 font-semibold text-foreground">
                      {post.title}
                    </h3>
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {post.description || "ไม่มีคำอธิบาย"}
                    </p>
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(post.createdAt).toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Load More */}
          {postsResult.hasMore && (
            <div className="mt-8 text-center">
              <button className="group inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-2.5 text-sm font-medium text-foreground shadow-sm transition-all hover:border-primary/50 hover:bg-primary/5">
                ดูเพิ่มเติม
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
