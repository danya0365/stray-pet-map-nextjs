"use client";

import type { DonationTargetType } from "@/domain/entities/donation";
import {
  DONATION_MODE_CONFIG,
  DONATION_PRESETS,
  MODE_ACTIVE_CLASS,
  MODE_INACTIVE_CLASS,
} from "@/domain/entities/donation-modes";
import type {
  DonationFormActions,
  DonationFormState,
} from "@/presentation/presenters/donation/useDonationForm";
import {
  Coffee,
  EyeOff,
  Heart,
  Map,
  Rocket,
  Trophy,
  User,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";

const PRESET_ICONS = [Coffee, Heart, Zap, Rocket] as const;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  state: DonationFormState;
  actions: DonationFormActions;
  petName?: string;
  isGuest?: boolean;
  availableModes: DonationTargetType[];
}

export function DonationModalView({
  isOpen,
  onClose,
  state,
  actions,
  petName,
  isGuest = true,
  availableModes,
}: Props) {
  if (!isOpen) return null;

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

  const modeConfig = DONATION_MODE_CONFIG[targetType];
  const title =
    targetType === "pet" && petName
      ? `ให้ผู้ดูแลน้อง${petName}`
      : modeConfig.headerTitle;

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
                <modeConfig.icon className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold">{title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {modeConfig.headerSubtitle}
              </p>
            </div>
          </div>

          <div className="space-y-5 p-6">
            {/* Modes */}
            <div
              className="grid gap-2"
              style={{
                gridTemplateColumns: `repeat(${availableModes.length}, minmax(0, 1fr))`,
              }}
            >
              {availableModes.map((mode) => {
                const config = DONATION_MODE_CONFIG[mode];
                const isActive = targetType === mode;
                return (
                  <button
                    key={mode}
                    onClick={() => actions.setTargetType(mode)}
                    className={`flex flex-col items-center gap-1 rounded-xl border p-3 transition-all ${isActive ? MODE_ACTIVE_CLASS : MODE_INACTIVE_CLASS}`}
                  >
                    <config.icon className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {mode === "pet" && petName
                        ? `น้อง${petName}`
                        : config.label}
                    </span>
                    <span className="text-[10px] opacity-70">
                      {config.sublabel}
                    </span>
                  </button>
                );
              })}
            </div>

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
              {DONATION_PRESETS.map(({ value, label }, index) => {
                const Icon = PRESET_ICONS[index];
                return (
                  <button
                    key={value}
                    onClick={() => {
                      actions.setSelectedAmount(value);
                      actions.setCustomAmount("");
                    }}
                    className={`flex flex-col items-center gap-1 rounded-xl border p-3 transition-all ${selectedAmount === value && !customAmount ? MODE_ACTIVE_CLASS : MODE_INACTIVE_CLASS}`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-xs font-medium">{label}</span>
                  </button>
                );
              })}
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
                  {modeConfig.submitButtonText} {finalAmount}฿
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
