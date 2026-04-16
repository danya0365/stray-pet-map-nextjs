"use client";

import { PetPost } from "@/domain/entities/pet-post";
import dayjs from "dayjs";
import "dayjs/locale/th";
import { Heart, Home, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface SuccessStoriesSectionProps {
  limit?: number;
}

export function SuccessStoriesSection({
  limit = 6,
}: SuccessStoriesSectionProps) {
  const [stories, setStories] = useState<PetPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStories() {
      try {
        const res = await fetch(
          `/api/pet-posts/success-stories?limit=${limit}`,
        );
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setStories(data.stories || []);
      } catch (error) {
        console.error("Error fetching success stories:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStories();
  }, [limit]);

  if (isLoading) {
    return (
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="mb-8 text-center text-2xl font-bold">
            เรื่องราวความสำเร็จ
          </h2>
          <div className="flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </div>
      </section>
    );
  }

  if (stories.length === 0) return null;

  return (
    <section className="bg-gradient-to-b from-emerald-50 to-white py-16">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-emerald-700">
            <Heart className="h-5 w-5 fill-emerald-500" />
            <span className="font-medium">น้องมีบ้านแล้ว!</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            เรื่องราวความสำเร็จ
          </h2>
          <p className="mt-2 text-gray-600">
            น้องหมา น้องแมว ที่ได้รับการช่วยเหลือและมีบ้านใหม่แล้ว
          </p>
        </div>

        {/* Stories Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((story) => (
            <SuccessStoryCard key={story.id} story={story} />
          ))}
        </div>

        {/* View All Link */}
        <div className="mt-10 text-center">
          <Link
            href="/success-stories"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 font-medium text-white transition-colors hover:bg-emerald-700"
          >
            ดูเรื่องราวทั้งหมด
            <Heart className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function SuccessStoryCard({ story }: { story: PetPost }) {
  const outcomeConfig: Record<
    "owner_found" | "rehomed",
    { icon: React.ReactNode; label: string; color: string }
  > = {
    owner_found: {
      icon: <Search className="h-4 w-4" />,
      label: "เจอเจ้าของ",
      color: "bg-blue-100 text-blue-700",
    },
    rehomed: {
      icon: <Home className="h-4 w-4" />,
      label: "มีบ้านใหม่",
      color: "bg-emerald-100 text-emerald-700",
    },
  };

  const config =
    story.outcome === "owner_found" || story.outcome === "rehomed"
      ? outcomeConfig[story.outcome]
      : null;
  const resolvedDate = story.resolvedAt
    ? dayjs(story.resolvedAt).locale("th").format("MMM YYYY")
    : null;

  return (
    <Link href={`/pets/${story.id}`}>
      <article className="group overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-lg">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {story.thumbnailUrl ? (
            <Image
              src={story.thumbnailUrl}
              alt={story.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gray-100 text-4xl">
              {story.petType?.icon || "🐾"}
            </div>
          )}

          {/* Outcome Badge */}
          {config && (
            <div className="absolute right-3 top-3">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${config.color}`}
              >
                {config.icon}
                {config.label}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="line-clamp-2 font-semibold text-gray-900 group-hover:text-emerald-600">
            {story.title}
          </h3>

          {resolvedDate && (
            <p className="mt-2 text-xs text-gray-500">
              จบโพสต์เมื่อ {resolvedDate}
            </p>
          )}
        </div>
      </article>
    </Link>
  );
}
