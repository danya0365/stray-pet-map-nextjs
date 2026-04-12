"use client";

import { AdoptionRequestModal } from "@/presentation/components/adoption/AdoptionRequestModal";
import { ClosePostModal } from "@/presentation/components/close-post/ClosePostModal";
import { FavoriteButton } from "@/presentation/components/favorites/FavoriteButton";
import { Badge } from "@/presentation/components/ui";
import type { PetDetailViewModel } from "@/presentation/presenters/pet-detail/PetDetailPresenter";
import { useAuthStore } from "@/presentation/stores/useAuthStore";
import dayjs from "dayjs";
import "dayjs/locale/th";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Flag,
  Heart,
  MapPin,
  Scissors,
  Share2,
  Syringe,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PetDetailMiniMap } from "./PetDetailMiniMap";

dayjs.extend(relativeTime);
dayjs.locale("th");

const statusConfig: Record<
  string,
  { label: string; variant: "success" | "warning" | "primary" | "danger" }
> = {
  available: { label: "รอรับเลี้ยง", variant: "success" },
  pending: { label: "มีคนสนใจ", variant: "warning" },
  adopted: { label: "มีบ้านแล้ว", variant: "primary" },
  missing: { label: "ตามหาน้อง", variant: "danger" },
};

const genderLabel: Record<string, string> = {
  male: "ผู้",
  female: "เมีย",
  unknown: "ไม่ทราบ",
};

interface PetDetailViewProps {
  viewModel: PetDetailViewModel;
}

export function PetDetailView({ viewModel }: PetDetailViewProps) {
  const { post } = viewModel;
  const statusInfo = statusConfig[post.status];
  const { user } = useAuthStore();
  const router = useRouter();
  const [showAdoptionModal, setShowAdoptionModal] = useState(false);

  const handleAdoptClick = () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    setShowAdoptionModal(true);
  };

  const [showCloseModal, setShowCloseModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const isOwner = user?.id === post.profileId;
  const canClose = isOwner && !post.outcome && !post.isArchived;

  const handleClosePost = async (
    outcome: "owner_found" | "rehomed" | "cancelled",
  ) => {
    setIsClosing(true);
    try {
      const res = await fetch(`/api/pet-posts/${post.id}/close`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outcome }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to close post");
      }

      setShowCloseModal(false);
      router.refresh(); // Refresh page to show updated status
    } catch (error) {
      console.error("Close post error:", error);
      alert("ไม่สามารถปิดโพสต์ได้ กรุณาลองใหม่");
    } finally {
      setIsClosing(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Back */}
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-foreground/50 transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        กลับหน้าแรก
      </Link>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Left — Image + Map */}
        <div className="flex flex-col gap-4 lg:col-span-3">
          {/* Main Image */}
          <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-muted">
            {post.thumbnailUrl ? (
              <Image
                src={post.thumbnailUrl}
                alt={post.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 60vw"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-6xl">
                {post.petType?.icon || "🐾"}
              </div>
            )}

            {/* Status */}
            <div className="absolute left-4 top-4">
              <Badge variant={statusInfo.variant} size="md">
                {statusInfo.label}
              </Badge>
            </div>
          </div>

          {/* Mini Map */}
          <div className="overflow-hidden rounded-2xl border border-border/40">
            <div className="flex items-center gap-2 border-b border-border/40 bg-card px-4 py-2.5">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">ตำแหน่งที่พบ</span>
            </div>
            <PetDetailMiniMap
              latitude={post.latitude}
              longitude={post.longitude}
              icon={post.petType?.icon}
            />
            {post.address && (
              <div className="border-t border-border/40 bg-card px-4 py-2.5">
                <p className="text-xs text-foreground/50">{post.address}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right — Info */}
        <div className="flex flex-col gap-5 lg:col-span-2">
          {/* Title + Meta */}
          <div>
            {post.petType && (
              <span className="mb-2 inline-flex items-center gap-1 text-sm text-foreground/50">
                {post.petType.icon} {post.petType.name}
              </span>
            )}
            <h1 className="text-xl font-bold leading-tight sm:text-2xl">
              {post.title}
            </h1>
            <div className="mt-2 flex items-center gap-3 text-xs text-foreground/40">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {dayjs(post.createdAt).fromNow()}
              </span>
              {post.province && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {post.province}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          {post.description && (
            <div>
              <h2 className="mb-1.5 text-sm font-semibold">รายละเอียด</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/70">
                {post.description}
              </p>
            </div>
          )}

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            <InfoItem
              label="เพศ"
              value={genderLabel[post.gender] || "ไม่ทราบ"}
            />
            {post.breed && <InfoItem label="พันธุ์" value={post.breed} />}
            {post.color && <InfoItem label="สี" value={post.color} />}
            {post.estimatedAge && (
              <InfoItem label="อายุโดยประมาณ" value={post.estimatedAge} />
            )}
          </div>

          {/* Health */}
          <div className="flex flex-wrap gap-2">
            {post.isVaccinated !== null && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                  post.isVaccinated
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                }`}
              >
                <Syringe className="h-3 w-3" />
                {post.isVaccinated ? "ฉีดวัคซีนแล้ว" : "ยังไม่ฉีดวัคซีน"}
              </span>
            )}
            {post.isNeutered !== null && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                  post.isNeutered
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                }`}
              >
                <Scissors className="h-3 w-3" />
                {post.isNeutered ? "ทำหมันแล้ว" : "ยังไม่ทำหมัน"}
              </span>
            )}
          </div>

          {/* Actions */}
          {canClose ? (
            <>
              {(post.status === "available" || post.status === "pending") && (
                <button
                  type="button"
                  onClick={handleAdoptClick}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
                >
                  <Heart className="h-4 w-4" />
                  {post.status === "pending"
                    ? "สนใจรับเลี้ยงเช่นกัน"
                    : "ขอรับเลี้ยง"}
                </button>
              )}

              {post.status === "missing" && (
                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-600"
                >
                  <MapPin className="h-4 w-4" />
                  แจ้งพบเจอน้อง
                </button>
              )}

              {/* Close Post Button (Owner only) */}
              <button
                type="button"
                onClick={() => setShowCloseModal(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-emerald-500 bg-white px-6 py-3 text-sm font-semibold text-emerald-600 transition-colors hover:bg-emerald-50"
              >
                <CheckCircle className="h-4 w-4" />
                จบโพสต์
              </button>
            </>
          ) : post.outcome ? (
            <div
              className={`flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-medium ${
                post.outcome === "owner_found" || post.outcome === "rehomed"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              <CheckCircle className="h-4 w-4" />
              {post.outcome === "owner_found" && "เจอเจ้าของแล้ว!"}
              {post.outcome === "rehomed" && "มีบ้านใหม่แล้ว!"}
              {post.outcome === "cancelled" && "ปิดโพสต์แล้ว"}
              {post.outcome === "expired" && "หมดอายุ"}
              {post.outcome === "admin_closed" && "ถูกปิดโดยแอดมิน"}
            </div>
          ) : (
            <>
              {(post.status === "available" || post.status === "pending") && (
                <button
                  type="button"
                  onClick={handleAdoptClick}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
                >
                  <Heart className="h-4 w-4" />
                  {post.status === "pending"
                    ? "สนใจรับเลี้ยงเช่นกัน"
                    : "ขอรับเลี้ยง"}
                </button>
              )}

              {post.status === "missing" && (
                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-600"
                >
                  <MapPin className="h-4 w-4" />
                  แจ้งพบเจอน้อง
                </button>
              )}

              {post.status === "adopted" && (
                <div className="flex w-full items-center justify-center gap-2 rounded-xl bg-muted px-6 py-3 text-sm font-medium text-foreground/50">
                  <Heart className="h-4 w-4" />
                  น้องมีบ้านแล้ว
                </div>
              )}
            </>
          )}

          {/* Secondary Actions */}
          <div className="flex gap-2">
            <div className="flex flex-1 items-center justify-center rounded-xl border border-border bg-card">
              <FavoriteButton petPostId={post.id} size="md" />
              <span className="pr-3 text-xs font-medium text-foreground/60">
                บันทึก
              </span>
            </div>
            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-medium text-foreground/60 transition-colors hover:bg-muted"
            >
              <Share2 className="h-3.5 w-3.5" />
              แชร์
            </button>
            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-medium text-foreground/60 transition-colors hover:bg-muted"
            >
              <Flag className="h-3.5 w-3.5" />
              รายงาน
            </button>
          </div>
        </div>
      </div>

      <AdoptionRequestModal
        isOpen={showAdoptionModal}
        onClose={() => setShowAdoptionModal(false)}
        petPostId={post.id}
        petTitle={post.title}
      />

      <ClosePostModal
        isOpen={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        purpose={post.purpose}
        onConfirm={handleClosePost}
        isLoading={isClosing}
      />
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/40 bg-card px-3 py-2.5">
      <p className="text-xs text-foreground/40">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}
