"use client";

import type { PetFundingGoal } from "@/domain/entities/donation";
import type { PetPostOutcome } from "@/domain/entities/pet-post";
import { AdoptionRequestModal } from "@/presentation/components/adoption/AdoptionRequestModal";
import { ClosePostModal } from "@/presentation/components/close-post/ClosePostModal";
import { PetFundingProgress } from "@/presentation/components/donation/PetFundingProgress";
import { FavoriteButton } from "@/presentation/components/favorites/FavoriteButton";
import { Badge } from "@/presentation/components/ui";
import type { PetDetailViewModel } from "@/presentation/presenters/pet-detail/PetDetailPresenter";
import dayjs from "dayjs";
import "dayjs/locale/th";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  AlertTriangle,
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
import { PetDetailMiniMap } from "./PetDetailMiniMap";

dayjs.extend(relativeTime);

// Helper: คำนวณวันที่เหลือก่อนหมดอายุ
function getDaysUntilExpiry(createdAt: string, expiryDays = 90): number {
  const created = dayjs(createdAt);
  const expiry = created.add(expiryDays, "day");
  return expiry.diff(dayjs(), "day");
}

// Helper: แสดง warning banner สำหรับโพสต์ใกล้หมดอายุ
function ExpiryWarning({ createdAt }: { createdAt: string }) {
  const daysLeft = getDaysUntilExpiry(createdAt);
  const EXPIRY_WARNING_DAYS = 14; // แจ้งเตือนก่อน 2 สัปดาห์

  if (daysLeft > EXPIRY_WARNING_DAYS || daysLeft <= 0) return null;

  return (
    <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
      <AlertTriangle className="h-5 w-5 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium">โพสต์ใกล้หมดอายุ</p>
        <p className="text-xs text-amber-700">
          โพสต์นี้จะถูกปิดอัตโนมัติในอีก {daysLeft} วัน หากยังไม่ได้ปิดโพสต์
        </p>
      </div>
    </div>
  );
}
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

// View Props - รับ state และ callbacks จาก Presenter
interface PetDetailViewProps {
  viewModel: PetDetailViewModel;
  fundingGoal: PetFundingGoal | null;
  isOwner: boolean;
  canClose: boolean;
  isAdoptionModalOpen: boolean;
  isCloseModalOpen: boolean;
  isClosingPost: boolean;
  onOpenAdoptionModal: () => void;
  onCloseAdoptionModal: () => void;
  onOpenCloseModal: () => void;
  onCloseCloseModal: () => void;
  onAdoptClick: () => void;
  onClosePost: (outcome: PetPostOutcome) => Promise<void>;
  onDonateClick: () => void;
}

// View Component - 100% Logic-Free รับ state และ callbacks จาก props
export function PetDetailView({
  viewModel,
  fundingGoal,
  isOwner,
  canClose,
  isAdoptionModalOpen,
  isCloseModalOpen,
  isClosingPost,
  onCloseAdoptionModal,
  onCloseCloseModal,
  onAdoptClick,
  onOpenCloseModal,
  onClosePost,
  onDonateClick,
}: PetDetailViewProps) {
  const { post } = viewModel;
  const statusInfo = statusConfig[post.status];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Expiry Warning (แสดงเฉพาะเจ้าของ) */}
      {isOwner && !post.outcome && !post.isArchived && (
        <ExpiryWarning createdAt={post.createdAt} />
      )}

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

          {/* Funding Progress */}
          <PetFundingProgress
            goal={fundingGoal}
            petName={post.title}
            onDonateClick={onDonateClick}
          />

          {/* Actions */}
          {canClose ? (
            <>
              {(post.status === "available" || post.status === "pending") && (
                <button
                  type="button"
                  onClick={onAdoptClick}
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
                onClick={onOpenCloseModal}
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
                  onClick={onAdoptClick}
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

      {/* Modals */}
      <AdoptionRequestModal
        isOpen={isAdoptionModalOpen}
        onClose={onCloseAdoptionModal}
        petPostId={post.id}
        petTitle={post.title}
      />

      <ClosePostModal
        isOpen={isCloseModalOpen}
        onClose={onCloseCloseModal}
        purpose={post.purpose}
        onConfirm={onClosePost}
        isLoading={isClosingPost}
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
