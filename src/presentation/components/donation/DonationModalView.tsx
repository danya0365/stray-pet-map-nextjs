"use client";
import { FEATURE_FLAGS } from "@/config/features";
import type {
  DonationFormActions,
  DonationFormState,
} from "@/presentation/presenters/donation/useDonationForm";
import {
  Building2,
  Coffee,
  EyeOff,
  Heart,
  Map,
  PawPrint,
  Rocket,
  Trophy,
  User,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";

const PRESETS = [
  { value: 50, label: "50฿", icon: Coffee },
  { value: 100, label: "100฿", icon: Heart },
  { value: 200, label: "200฿", icon: Zap },
  { value: 500, label: "500฿", icon: Rocket },
];

const a = "border-primary bg-primary/10 text-primary";
const i = "border-border bg-muted/30 hover:border-primary/30";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  state: DonationFormState;
  actions: DonationFormActions;
  petName?: string;
  petPostId?: string;
  isGuest?: boolean;
}

export function DonationModalView({
  isOpen,
  onClose,
  state,
  actions,
  petName,
  petPostId,
  isGuest = true,
}: Props) {
  if (!isOpen) return null;

  // Guard: disable pet-specific donations when feature flag is off
  if (state.targetType === "pet" && !FEATURE_FLAGS.petDonationEnabled) {
    return null;
  }

  const {
    targetType,
    selectedAmount,
    customAmount,
    message,
    donorName,
    donorEmail,
    isAnonymous,
    showOnLeaderboard,
    isLoading,
    validationError,
    finalAmount,
  } = state;

  const title =
    targetType === "pet" && petName
      ? `ให้ผู้ดูแลน้อง${petName}`
      : targetType === "dev"
        ? "ให้กำลังใจทีมงาน"
        : "สนับสนุน StrayPetMap";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        <div className="max-h-[90vh] overflow-y-auto overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          {/* Header */}
          <div className="relative bg-linear-to-br from-primary/20 to-secondary/20 p-6">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-1 text-foreground/50 hover:bg-black/5 hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex flex-col items-center text-center">
              <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
                {targetType === "pet" ? (
                  <PawPrint className="h-8 w-8 text-primary" />
                ) : (
                  <Heart className="h-8 w-8 text-primary" />
                )}
              </div>
              <h2 className="text-xl font-bold">{title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {targetType === "pet"
                  ? "ส่งต่อให้ผู้ดูแลน้องโดยตรง"
                  : targetType === "dev"
                    ? "ขอบคุณที่ให้กำลังใจพวกเรา"
                    : "ช่วยเราพัฒนาแพลตฟอร์มต่อไป"}
              </p>
            </div>
          </div>

          <div className="space-y-5 p-6">
            {/* Modes */}
            <div
              className={`grid gap-2 ${FEATURE_FLAGS.petDonationEnabled ? "grid-cols-3" : "grid-cols-2"}`}
            >
              <button
                onClick={() => actions.setTargetType("dev")}
                className={`flex flex-col items-center gap-1 rounded-xl border p-3 transition-all ${targetType === "dev" ? a : i}`}
              >
                <Heart className="h-4 w-4" />
                <span className="text-sm font-medium">กำลังใจ Dev</span>
                <span className="text-[10px] opacity-70">ให้ทีมพัฒนา</span>
              </button>
              <button
                onClick={() => actions.setTargetType("fund")}
                className={`flex flex-col items-center gap-1 rounded-xl border p-3 transition-all ${targetType === "fund" ? a : i}`}
              >
                <Building2 className="h-4 w-4" />
                <span className="text-sm font-medium">แพลตฟอร์ม</span>
                <span className="text-[10px] opacity-70">พัฒนาต่อ</span>
              </button>
              {FEATURE_FLAGS.petDonationEnabled && (
                <button
                  onClick={() => actions.setTargetType("pet")}
                  disabled={!petPostId}
                  className={`flex flex-col items-center gap-1 rounded-xl border p-3 transition-all ${targetType === "pet" ? a : i} ${!petPostId ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  <PawPrint className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {petName ? `น้อง${petName}` : "ผู้ดูแลน้อง"}
                  </span>
                  <span className="text-[10px] opacity-70">
                    {petName ? "ส่งต่อผู้ดูแล" : "ไปที่หน้าน้อง"}
                  </span>
                </button>
              )}
            </div>

            {targetType === "pet" && !petPostId && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
                <p className="flex items-center gap-1.5">
                  <span>⚠️</span>กรุณาไปที่หน้ารายละเอียดน้องก่อน แล้วกด
                  &quot;สนับสนุน&quot;จากตรงนั้น
                </p>
              </div>
            )}

            {/* Guest Info */}
            {isGuest && (
              <div className="space-y-3 rounded-xl border border-border bg-muted/20 p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <User className="h-4 w-4 text-primary" />
                  <span>ข้อมูลผู้สนับสนุน</span>
                </div>
                <input
                  type="text"
                  placeholder="ชื่อของคุณ (หรือนามแฝง)"
                  value={donorName}
                  onChange={(e) => actions.setDonorName(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <input
                  type="email"
                  placeholder="อีเมล (สำหรับส่งใบเสร็จ)"
                  value={donorEmail}
                  onChange={(e) => actions.setDonorEmail(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
            )}

            {/* Amount */}
            <div className="grid grid-cols-4 gap-2">
              {PRESETS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => {
                    actions.setSelectedAmount(value);
                    actions.setCustomAmount("");
                  }}
                  className={`flex flex-col items-center gap-1 rounded-xl border p-3 transition-all ${selectedAmount === value && !customAmount ? a : i}`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>

            <div className="relative">
              <input
                type="number"
                placeholder="หรือระบุจำนวนเอง"
                value={customAmount}
                onChange={(e) => actions.setCustomAmount(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-center text-lg font-semibold outline-none focus:border-primary"
                min="20"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                ฿
              </span>
            </div>

            <textarea
              placeholder="ข้อความให้กำลังใจ (ไม่บังคับ)"
              value={message}
              onChange={(e) => actions.setMessage(e.target.value)}
              className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              rows={2}
            />

            {/* Toggles */}
            <div className="space-y-2 rounded-xl border border-border bg-muted/20 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  {showOnLeaderboard ? (
                    <Trophy className="h-4 w-4 text-yellow-500" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span>แสดงในกระดานผู้สนับสนุน</span>
                </div>
                <button
                  onClick={() =>
                    actions.setShowOnLeaderboard(!showOnLeaderboard)
                  }
                  className={`relative h-5 w-9 rounded-full transition-colors ${showOnLeaderboard ? "bg-primary" : "bg-muted"}`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${showOnLeaderboard ? "left-4.5" : "left-0.5"}`}
                  />
                </button>
              </div>
              {isGuest && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    {isAnonymous ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <User className="h-4 w-4 text-primary" />
                    )}
                    <span>ไม่ประสงค์ออกนาม</span>
                  </div>
                  <button
                    onClick={() => actions.setIsAnonymous(!isAnonymous)}
                    className={`relative h-5 w-9 rounded-full transition-colors ${isAnonymous ? "bg-primary" : "bg-muted"}`}
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${isAnonymous ? "left-4.5" : "left-0.5"}`}
                    />
                  </button>
                </div>
              )}
            </div>

            <Link
              href="/road-map"
              onClick={onClose}
              className="flex items-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 p-3 text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
            >
              <Map className="h-4 w-4" />
              <span>ดู Roadmap แผนพัฒนาแพลตฟอร์ม</span>
            </Link>

            {/* Legal */}
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-[10px] text-muted-foreground">
              <p className="mb-1">
                <strong>หมายเหตุทางกฎหมาย:</strong>
              </p>
              <p>
                StrayPetMap ดำเนินการโดยบุคคลธรรมดา ไม่ใช่นิติบุคคล
                การสนับสนุนเป็นการให้กำลังใจ (tipping) ไม่ใช่การบริจาคตามกฎหมาย
                ใบเสร็จรับเงินนี้ไม่สามารถนำไปหักภาษีได้
              </p>
            </div>

            {/* Error */}
            {validationError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {validationError}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={actions.handleDonate}
              disabled={isLoading || finalAmount < 20}
              className="w-full rounded-xl bg-linear-to-r from-primary to-secondary py-3.5 font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  กำลังไปยัง Stripe...
                </span>
              ) : (
                <span>
                  {targetType === "pet"
                    ? "ส่งต่อให้ผู้ดูแล"
                    : targetType === "dev"
                      ? "ให้กำลังใจ"
                      : "สนับสนุน"}{" "}
                  {finalAmount}฿
                </span>
              )}
            </button>

            <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
              <span>รองรับ:</span>
              <span className="rounded bg-muted px-2 py-0.5">PromptPay</span>
              <span className="rounded bg-muted px-2 py-0.5">Credit Card</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
