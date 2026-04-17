"use client";

import type { DonationTargetType } from "@/domain/entities/donation";
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
import { useState } from "react";

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDonate: (params: {
    amount: number;
    message: string;
    targetType: DonationTargetType;
    petPostId?: string;
    donorName?: string;
    donorEmail?: string;
    isAnonymous: boolean;
    showOnLeaderboard: boolean;
  }) => Promise<void>;
  // Optional: for pet-specific donation mode
  petPostId?: string;
  petName?: string;
  // User info (if logged in)
  userDisplayName?: string;
  userEmail?: string;
  isGuest?: boolean;
}

const PRESET_AMOUNTS = [
  { value: 50, label: "50฿", icon: Coffee },
  { value: 100, label: "100฿", icon: Heart },
  { value: 200, label: "200฿", icon: Zap },
  { value: 500, label: "500฿", icon: Rocket },
];

export function DonationModal({
  isOpen,
  onClose,
  onDonate,
  petPostId,
  petName,
  userDisplayName,
  userEmail,
  isGuest = true,
}: DonationModalProps) {
  // Mode selection
  const [targetType, setTargetType] = useState<DonationTargetType>(
    petPostId ? "pet" : "fund",
  );

  // Amount
  const [selectedAmount, setSelectedAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>("");

  // Message & Info
  const [message, setMessage] = useState<string>("");
  const [donorName, setDonorName] = useState<string>(userDisplayName || "");
  const [donorEmail, setDonorEmail] = useState<string>(userEmail || "");
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [showOnLeaderboard, setShowOnLeaderboard] = useState<boolean>(true);

  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleDonate = async () => {
    const amount = customAmount ? parseInt(customAmount) : selectedAmount;
    if (amount < 20) return;

    setIsLoading(true);
    try {
      await onDonate({
        amount,
        message,
        targetType,
        petPostId: targetType === "pet" ? petPostId : undefined,
        donorName: donorName || undefined,
        donorEmail: donorEmail || undefined,
        isAnonymous,
        showOnLeaderboard,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const finalAmount = customAmount
    ? parseInt(customAmount) || 0
    : selectedAmount;
  const displayTitle =
    targetType === "pet" && petName
      ? `บริจาคให้น้อง${petName}`
      : "สนับสนุน StrayPetMap";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl max-h-[90vh] overflow-y-auto">
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
              <h2 className="text-xl font-bold">{displayTitle}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {targetType === "pet"
                  ? "ช่วยเหลือค่าอาหารและค่ารักษาพยาบาล"
                  : "ช่วยเราช่วยเหลือสัตว์จรจัดต่อไป"}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-5 p-6">
            {/* Mode Selection - Only show if petPostId provided */}
            {petPostId ? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setTargetType("fund")}
                  className={`flex flex-col items-center justify-center gap-1 rounded-xl border p-3 transition-all ${
                    targetType === "fund"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-muted/30 hover:border-primary/30"
                  }`}
                >
                  <Building2 className="h-4 w-4" />
                  <span className="text-sm font-medium">กองทุนกลาง</span>
                  <span className="text-[10px] opacity-70">
                    ช่วยเหลือทั่วไป
                  </span>
                </button>
                <button
                  onClick={() => setTargetType("pet")}
                  className={`flex flex-col items-center justify-center gap-1 rounded-xl border p-3 transition-all ${
                    targetType === "pet"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-muted/30 hover:border-primary/30"
                  }`}
                >
                  <PawPrint className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {petName ? `น้อง${petName}` : "ให้น้องตัวนี้"}
                  </span>
                  <span className="text-[10px] opacity-70">
                    บริจาคเฉพาะน้อง
                  </span>
                </button>
              </div>
            ) : (
              /* Single mode indicator for general fund only */
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-center">
                <div className="flex items-center justify-center gap-2 text-primary">
                  <Building2 className="h-4 w-4" />
                  <span className="text-sm font-medium">บริจาคกองทุนกลาง</span>
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  ต้องการบริจาคให้น้องเฉพาะตัว? กรุณาไปที่หน้ารายละเอียดน้อง
                </p>
              </div>
            )}

            {/* Guest Info (if not logged in) */}
            {isGuest && (
              <div className="space-y-3 rounded-xl border border-border bg-muted/20 p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <User className="h-4 w-4 text-primary" />
                  <span>ข้อมูลผู้บริจาค</span>
                </div>
                <input
                  type="text"
                  placeholder="ชื่อของคุณ (หรือนามแฝง)"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <input
                  type="email"
                  placeholder="อีเมล (สำหรับส่งใบเสร็จ)"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
            )}

            {/* Amount Selection */}
            <div className="grid grid-cols-4 gap-2">
              {PRESET_AMOUNTS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => {
                    setSelectedAmount(value);
                    setCustomAmount("");
                  }}
                  className={`flex flex-col items-center gap-1 rounded-xl border p-3 transition-all ${
                    selectedAmount === value && !customAmount
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-muted/30 hover:border-primary/30"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>

            {/* Custom Amount */}
            <div className="relative">
              <input
                type="number"
                placeholder="หรือระบุจำนวนเอง"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-center text-lg font-semibold outline-none focus:border-primary"
                min="20"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                ฿
              </span>
            </div>

            {/* Message */}
            <textarea
              placeholder="ข้อความให้กำลังใจ (ไม่บังคับ)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              rows={2}
            />

            {/* Visibility Options */}
            <div className="space-y-2 rounded-xl border border-border bg-muted/20 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  {showOnLeaderboard ? (
                    <Trophy className="h-4 w-4 text-yellow-500" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span>แสดงในกระดานผู้บริจาค</span>
                </div>
                <button
                  onClick={() => setShowOnLeaderboard(!showOnLeaderboard)}
                  className={`relative h-5 w-9 rounded-full transition-colors ${
                    showOnLeaderboard ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                      showOnLeaderboard ? "left-4.5" : "left-0.5"
                    }`}
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
                    onClick={() => setIsAnonymous(!isAnonymous)}
                    className={`relative h-5 w-9 rounded-full transition-colors ${
                      isAnonymous ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                        isAnonymous ? "left-4.5" : "left-0.5"
                      }`}
                    />
                  </button>
                </div>
              )}
            </div>

            {/* Roadmap Link */}
            <Link
              href="/road-map"
              onClick={onClose}
              className="flex items-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 p-3 text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
            >
              <Map className="h-4 w-4" />
              <span>ดู Roadmap ว่าเงินจะไปใช้ทำอะไรต่อ</span>
            </Link>

            {/* Donate Button */}
            <button
              onClick={handleDonate}
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
                  {targetType === "pet" ? "บริจาค" : "สนับสนุน"} {finalAmount}฿
                </span>
              )}
            </button>

            {/* Payment Methods */}
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
