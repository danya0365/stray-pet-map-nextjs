"use client";

import type { ReportReason } from "@/application/repositories/IReportRepository";
import { Button } from "@/presentation/components/ui";
import { Flag, Loader2, X } from "lucide-react";
import { useState } from "react";

interface ReportModalProps {
  petPostId: string;
  petTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

const reportReasons: { value: ReportReason; label: string; description: string }[] = [
  {
    value: "spam",
    label: "สแปม / โฆษณา",
    description: "โพสต์ที่ไม่เกี่ยวข้องกับการช่วยเหลือสัตว์",
  },
  {
    value: "fake_info",
    label: "ข้อมูลเท็จ",
    description: "ข้อมูลที่ไม่เป็นความจริงหรือหลอกลวง",
  },
  {
    value: "inappropriate",
    label: "เนื้อหาไม่เหมาะสม",
    description: "ภาพหรือข้อความที่ไม่เหมาะสม",
  },
  {
    value: "animal_abuse",
    label: "ทารุณกรรมสัตว์",
    description: "พบการทารุณกรรมหรือภาพที่รุนแรง",
  },
  {
    value: "other",
    label: "อื่นๆ",
    description: "เหตุผลอื่นที่ไม่ได้ระบุ",
  },
];

export function ReportModal({ petPostId, petTitle, isOpen, onClose }: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async () => {
    if (!selectedReason) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petPostId,
          reason: selectedReason,
          description: description.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ success: true, message: data.message });
        setTimeout(() => {
          onClose();
          resetForm();
        }, 2000);
      } else {
        setResult({ success: false, message: data.error || "เกิดข้อผิดพลาด" });
      }
    } catch {
      setResult({ success: false, message: "เกิดข้อผิดพลาดในการเชื่อมต่อ" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedReason(null);
    setDescription("");
    setResult(null);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      resetForm();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
        {/* Close button */}
        <button
          onClick={handleClose}
          disabled={isSubmitting}
          className="absolute right-4 top-4 rounded-full p-1 text-foreground/40 transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
          type="button"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <Flag className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">รายงานโพสต์</h2>
            <p className="text-sm text-foreground/60 line-clamp-1">{petTitle}</p>
          </div>
        </div>

        {result ? (
          /* Result */
          <div
            className={`rounded-xl border p-4 text-center ${
              result.success
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            <p className="font-medium">{result.message}</p>
            {result.success && (
              <p className="mt-1 text-sm opacity-80">
                หน้าต่างจะปิดอัตโนมัติ...
              </p>
            )}
            {!result.success && (
              <button
                onClick={() => setResult(null)}
                className="mt-3 text-sm font-medium underline"
                type="button"
              >
                ลองอีกครั้ง
              </button>
            )}
          </div>
        ) : (
          /* Form */
          <>
            {/* Reason selection */}
            <div className="mb-4 space-y-2">
              <label className="text-sm font-medium text-foreground/80">
                เหตุผลในการรายงาน <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {reportReasons.map((reason) => (
                  <button
                    key={reason.value}
                    onClick={() => setSelectedReason(reason.value)}
                    className={`w-full rounded-xl border p-3 text-left transition-all ${
                      selectedReason === reason.value
                        ? "border-amber-500 bg-amber-50"
                        : "border-border hover:border-amber-200 hover:bg-amber-50/50"
                    }`}
                    type="button"
                  >
                    <div className="font-medium">{reason.label}</div>
                    <div className="text-xs text-foreground/60">
                      {reason.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-foreground/80">
                รายละเอียดเพิ่มเติม (ไม่บังคับ)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="อธิบายเพิ่มเติมเกี่ยวกับปัญหาที่พบ..."
                maxLength={500}
                rows={3}
                className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-amber-500"
              />
              <p className="mt-1 text-right text-xs text-foreground/40">
                {description.length}/500
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                ยกเลิก
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!selectedReason || isSubmitting}
                className="flex-1 bg-amber-600 hover:bg-amber-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    กำลังส่ง...
                  </>
                ) : (
                  "รายงาน"
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
