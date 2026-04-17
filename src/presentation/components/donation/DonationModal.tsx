"use client";

import { useState } from "react";
import { Heart, X, Map, Coffee, Zap, Rocket } from "lucide-react";
import Link from "next/link";

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDonate: (amount: number, message: string) => Promise<void>;
}

const PRESET_AMOUNTS = [
  { value: 50, label: "50฿", icon: Coffee },
  { value: 100, label: "100฿", icon: Heart },
  { value: 200, label: "200฿", icon: Zap },
  { value: 500, label: "500฿", icon: Rocket },
];

export function DonationModal({ isOpen, onClose, onDonate }: DonationModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleDonate = async () => {
    const amount = customAmount ? parseInt(customAmount) : selectedAmount;
    if (amount < 20) return;

    setIsLoading(true);
    try {
      await onDonate(amount, message);
    } finally {
      setIsLoading(false);
    }
  };

  const finalAmount = customAmount ? parseInt(customAmount) || 0 : selectedAmount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          {/* Header */}
          <div className="relative bg-gradient-to-br from-primary/20 to-secondary/20 p-6">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-1 text-foreground/50 hover:bg-black/5 hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold">สนับสนุน StrayPetMap</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                ช่วยเราช่วยเหลือสัตว์จรจัดต่อไป
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6 p-6">
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
              className="w-full rounded-xl bg-gradient-to-r from-primary to-secondary py-3.5 font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  กำลังไปยัง Stripe...
                </span>
              ) : (
                <span>สนับสนุน {finalAmount}฿</span>
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
