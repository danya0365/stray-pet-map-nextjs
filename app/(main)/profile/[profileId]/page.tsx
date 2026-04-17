import { SupabasePublicProfileRepository } from "@/infrastructure/repositories/supabase/SupabasePublicProfileRepository";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { Award, Heart, MapPin, User } from "lucide-react";
import { Metadata } from "next";
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
    return {
      title: "ไม่พบโปรไฟล์ | StrayPetMap",
    };
  }

  return {
    title: `${profile.displayName} | StrayPetMap`,
    description:
      profile.bio ??
      `โปรไฟล์ของ ${profile.displayName} บน StrayPetMap - แพลตฟอร์มช่วยเหลือสัตว์จรจัด`,
  };
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
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Profile Header */}
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            {/* Avatar */}
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-gray-100 sm:h-32 sm:w-32">
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
                  <User className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="mb-1 text-2xl font-bold text-gray-900">
                {profile.displayName}
                {profile.isVerified && (
                  <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                    ✓ ยืนยันแล้ว
                  </span>
                )}
              </h1>
              {profile.username && (
                <p className="mb-3 text-gray-500">@{profile.username}</p>
              )}
              {profile.bio && (
                <p className="mb-4 max-w-lg text-gray-700">{profile.bio}</p>
              )}

              {/* Stats */}
              <div className="flex flex-wrap justify-center gap-4 sm:justify-start">
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{stats.totalPosts} โพสต์</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <Heart className="h-4 w-4" />
                  <span>{stats.helpedCount} ช่วยสำเร็จ</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <Award className="h-4 w-4" />
                  <span>{stats.totalBadges} ตราสัญลักษณ์</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Badges Section */}
        {badges.length > 0 && (
          <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              ตราสัญลักษณ์ ({badges.length})
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`flex items-center gap-3 rounded-xl p-3 ${badge.color}`}
                >
                  <span className="text-2xl">{badge.icon}</span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{badge.name}</p>
                    <p className="text-xs capitalize opacity-75">
                      {badge.tier}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Posts Section */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            โพสต์ล่าสุด ({postsResult.total})
          </h2>

          {postsResult.posts.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <p>ยังไม่มีโพสต์</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {postsResult.posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/pets/${post.id}`}
                  className="group overflow-hidden rounded-xl border border-gray-100 bg-white transition-shadow hover:shadow-md"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                    {post.thumbnailUrl ? (
                      <Image
                        src={post.thumbnailUrl}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-400">
                        <MapPin className="h-8 w-8" />
                      </div>
                    )}
                    {/* Status Badge */}
                    <span
                      className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-xs font-medium ${
                        post.status === "available"
                          ? "bg-emerald-100 text-emerald-700"
                          : post.status === "adopted"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
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
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <h3 className="mb-1 line-clamp-1 font-medium text-gray-900">
                      {post.title}
                    </h3>
                    <p className="line-clamp-2 text-sm text-gray-600">
                      {post.description || "ไม่มีคำอธิบาย"}
                    </p>
                    <p className="mt-2 text-xs text-gray-400">
                      {new Date(post.createdAt).toLocaleDateString("th-TH")}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Load More */}
          {postsResult.hasMore && (
            <div className="mt-6 text-center">
              <button className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200">
                ดูเพิ่มเติม
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
