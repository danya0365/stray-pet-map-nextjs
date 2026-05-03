"use client";

import type { DonationTargetType } from "@/domain/entities/donation";
import {
  DONATION_MODE_CONFIG,
  DONATION_PRESETS,
  MODE_ACTIVE_CLASS,
  MODE_INACTIVE_CLASS,
} from "@/domain/entities/donation-modes";
import type {
  DonateFormActions,
  DonateFormState,
} from "@/presentation/presenters/donation/useDonatePresenter";
import {
  Coffee,
  Heart,
  Home,
  Loader2,
  Map,
  Rocket,
  Trophy,
  User,
  Zap,
} from "lucide-react";
import Link from "next/link";

const PRESET_ICONS = [Coffee, Heart, Zap, Rocket] as const;

interface Props {
  state: DonateFormState;
  actions: DonateFormActions;
  availableModes: DonationTargetType[];
}

export function DonateView({ state, actions, availableModes }: Props) {
  const {
    targetType,
    selectedAmount,
    customAmount,
    message,
    donorName,
    donorEmail,
    isAnonymous,
    showOnLeaderboard,
    localError,
    isLoading,
    serverError,
  } = state;
  const error = localError || serverError;
  const finalAmount = customAmount
    ? parseInt(customAmount) || 0
    : selectedAmount;

  const modeConfig = DONATION_MODE_CONFIG[targetType as DonationTargetType];
  const isAmtActive = (v: number) =>
    selectedAmount === v && !customAmount
      ? MODE_ACTIVE_CLASS
      : MODE_INACTIVE_CLASS;

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden bg-linear-to-br from-primary/10 via-secondary/5 to-background px-4 pt-12 pb-8">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute left-[10%] top-[20%] text-6xl select-none">
            🐕
          </div>
          <div className="absolute right-[15%] top-[10%] text-5xl select-none">
            💕
          </div>
          <div className="absolute left-[60%] bottom-[10%] text-5xl select-none">
            🐈
          </div>
          <div className="absolute right-[5%] bottom-[25%] text-4xl select-none">
            ✨
          </div>
        </div>
        <div className="relative mx-auto max-w-lg text-center">
          <div className="mb-4 flex justify-center gap-2 text-5xl">
            <span className="animate-bounce">🐾</span>
            <span className="animate-bounce" style={{ animationDelay: "0.1s" }}>
              💛
            </span>
            <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>
              🐾
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            ช่วยเราอยู่ช่วยน้องๆ ต่อ 🐕🐈
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            StrayPetMap ใช้งานฟรี 100% — ไม่มีโฆษณา ไม่มี paywall
            <br />
            เราอยู่ได้จากจิตอาสาอย่างคุณเท่านั้น
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4 py-8">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xl">
          {/* Target */}
          <div
            className="mb-6 grid gap-3"
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
                  onClick={() => actions.setTargetType(mode as "fund" | "dev")}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border p-4 transition-all ${isActive ? MODE_ACTIVE_CLASS : MODE_INACTIVE_CLASS}`}
                >
                  <config.icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{config.label}</span>
                  <span className="text-[10px] opacity-70">
                    {config.sublabel}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Amount */}
          <div className="mb-6">
            <label className="mb-3 block text-sm font-medium">เลือกจำนวน</label>
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
                    className={`flex flex-col items-center gap-1 rounded-xl border p-3 transition-all ${isAmtActive(value)}`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-xs font-medium">{label}</span>
                  </button>
                );
              })}
            </div>
            <div className="relative mt-3">
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
          </div>

          {/* Donor Info */}
          <div className="mb-6 space-y-3">
            <label className="block text-sm font-medium">
              ข้อมูลผู้สนับสนุน
            </label>
            <input
              type="text"
              placeholder="ชื่อของคุณ (หรือนามแฝง)"
              value={donorName}
              onChange={(e) => actions.setDonorName(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
            <input
              type="email"
              placeholder="อีเมล (สำหรับส่งใบเสร็จ)"
              value={donorEmail}
              onChange={(e) => actions.setDonorEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>

          {/* Message */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium">
              ข้อความให้กำลังใจ (ไม่บังคับ)
            </label>
            <textarea
              value={message}
              onChange={(e) => actions.setMessage(e.target.value)}
              className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              rows={2}
              placeholder="ส่งข้อความดีๆ ให้ทีมงาน 💛"
            />
          </div>

          {/* Toggles */}
          <div className="mb-6 space-y-3 rounded-xl border border-border bg-muted/20 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-primary" />
                <span>แสดงในกระดานผู้สนับสนุน</span>
              </div>
              <button
                onClick={() => actions.setShowOnLeaderboard(!showOnLeaderboard)}
                className={`relative h-5 w-9 rounded-full transition-colors ${showOnLeaderboard ? "bg-primary" : "bg-muted"}`}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${showOnLeaderboard ? "translate-x-4.5" : "translate-x-0.5"}`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Heart className="h-4 w-4 text-muted-foreground" />
                <span>ไม่ประสงค์ออกนาม</span>
              </div>
              <button
                onClick={() => actions.setIsAnonymous(!isAnonymous)}
                className={`relative h-5 w-9 rounded-full transition-colors ${isAnonymous ? "bg-primary" : "bg-muted"}`}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${isAnonymous ? "translate-x-4.5" : "translate-x-0.5"}`}
                />
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
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
                <Loader2 className="h-4 w-4 animate-spin" />
                กำลังไปยัง Stripe...
              </span>
            ) : (
              <span>
                {modeConfig.submitButtonText} {finalAmount}฿
              </span>
            )}
          </button>
          <div className="mt-3 flex items-center justify-center gap-3 text-xs text-muted-foreground">
            <span>รองรับ:</span>
            <span className="rounded bg-muted px-2 py-0.5">PromptPay</span>
            <span className="rounded bg-muted px-2 py-0.5">Credit Card</span>
          </div>

          {/* Legal */}
          <div className="mt-4 rounded-lg border border-border/40 bg-muted/30 p-3 text-[10px] leading-relaxed text-muted-foreground">
            <p className="mb-1 font-medium text-foreground/60">หมายเหตุ:</p>
            <p>
              StrayPetMap ดำเนินการโดยบุคคลธรรมดา ไม่ใช่นิติบุคคร
              การสนับสนุนเป็นการให้กำลังใจ (tipping) ไม่ใช่การบริจาคตามกฎหมาย
              ใบเสร็จรับเงินไม่สามารถนำไปหักภาษีได้
            </p>
          </div>
        </div>

        {/* Links */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/donate/leaderboard"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            <Trophy className="h-4 w-4 text-yellow-500" />
            กระดานผู้สนับสนุน
          </Link>
          <Link
            href="/road-map"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            <Map className="h-4 w-4 text-primary" />
            แผนพัฒนา
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            <Home className="h-4 w-4" />
            กลับหน้าหลัก
          </Link>
        </div>
      </div>
    </div>
  );
}
