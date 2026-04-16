"use client";

import { useState } from "react";
import { X, Home, Search, Ban, CheckCircle } from "lucide-react";
import { cn } from "@/presentation/lib/cn";
import type { PetPostPurpose } from "@/domain/entities/pet-post";

interface ClosePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  purpose: PetPostPurpose;
  onConfirm: (outcome: "owner_found" | "rehomed" | "cancelled") => void;
  isLoading?: boolean;
}

const OUTCOME_OPTIONS: Record<
  PetPostPurpose,
  { value: "owner_found" | "rehomed" | "cancelled"; label: string; icon: React.ReactNode; desc: string }[]
> = {
  lost_pet: [
    {
      value: "owner_found",
      label: "เจอเจ้าของแล้ว!",
      icon: <Search className="h-5 w-5" />,
      desc: "น้องกลับบ้านกับเจ้าของเดิม",
    },
    {
      value: "cancelled",
      label: "ยังไม่เจอ (ปิดโพสต์)",
      icon: <Ban className="h-5 w-5" />,
      desc: "ปิดการตามหาแล้ว",
    },
  ],
  rehome_pet: [
    {
      value: "rehomed",
      label: "มีคนรับเลี้ยงแล้ว!",
      icon: <Home className="h-5 w-5" />,
      desc: "น้องมีบ้านใหม่แล้ว",
    },
    {
      value: "cancelled",
      label: "ยกเลิกโพสต์",
      icon: <Ban className="h-5 w-5" />,
      desc: "เลิกหาบ้านใหม่ให้น้อง",
    },
  ],
  community_cat: [
    {
      value: "rehomed",
      label: "มีคนรับเลี้ยงแล้ว!",
      icon: <Home className="h-5 w-5" />,
      desc: "น้องแมวมีบ้านแล้ว",
    },
    {
      value: "cancelled",
      label: "ยกเลิกโพสต์",
      icon: <Ban className="h-5 w-5" />,
      desc: "เลิกหาบ้านให้น้อง",
    },
  ],
};

export function ClosePostModal({
  isOpen,
  onClose,
  purpose,
  onConfirm,
  isLoading = false,
}: ClosePostModalProps) {
  const [selectedOutcome, setSelectedOutcome] = useState<
    "owner_found" | "rehomed" | "cancelled" | null
  >(null);

  const options = OUTCOME_OPTIONS[purpose];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">จบโพสต์</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Description */}
        <p className="mb-4 text-sm text-gray-600">
          เลือกผลลัพธ์ของโพสต์นี้ โพสต์จะถูกปิดและเก็บเป็นประวัติ
        </p>

        {/* Options */}
        <div className="space-y-2">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedOutcome(option.value)}
              disabled={isLoading}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left transition-all",
                selectedOutcome === option.value
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-gray-200 hover:border-emerald-300 hover:bg-gray-50"
              )}
            >
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full",
                  selectedOutcome === option.value
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-100 text-gray-500"
                )}
              >
                {option.icon}
              </span>
              <div>
                <p className="font-semibold text-gray-900">{option.label}</p>
                <p className="text-xs text-gray-500">{option.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 rounded-xl border border-gray-300 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            ยกเลิก
          </button>
          <button
            onClick={() =>
              selectedOutcome && onConfirm(selectedOutcome)
            }
            disabled={!selectedOutcome || isLoading}
            className={cn(
              "flex-1 rounded-xl py-3 font-medium text-white transition-colors",
              selectedOutcome
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-gray-300 cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                กำลังบันทึก...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <CheckCircle className="h-4 w-4" />
                ยืนยัน
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
