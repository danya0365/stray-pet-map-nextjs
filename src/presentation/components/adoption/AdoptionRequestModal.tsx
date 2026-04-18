"use client";

import { ApiAdoptionRequestRepository } from "@/infrastructure/repositories/api/ApiAdoptionRequestRepository";
import { cn } from "@/presentation/lib/cn";
import { CheckCircle2, Heart, Loader2, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

interface AdoptionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  petPostId: string;
  petTitle: string;
}

export function AdoptionRequestModal({
  isOpen,
  onClose,
  petPostId,
  petTitle,
}: AdoptionRequestModalProps) {
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");
  const [lineId, setLineId] = useState("");
  const [state, setState] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // API Repository instance (client-side, no Supabase credentials exposed)
  const repo = useMemo(() => new ApiAdoptionRequestRepository(), []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setState("submitting");
      setErrorMsg("");

      try {
        await repo.create({
          petPostId,
          message: message || undefined,
          contactPhone: phone || undefined,
          contactLineId: lineId || undefined,
        });
        setState("success");
      } catch (err) {
        setErrorMsg(
          err instanceof Error ? err.message : "เกิดข้อผิดพลาด กรุณาลองใหม่",
        );
        setState("error");
      }
    },
    [repo, petPostId, message, phone, lineId],
  );

  if (!isOpen) return null;

  const inputClass =
    "w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-xl">
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-foreground/40 transition-colors hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        {state === "success" ? (
          <div className="flex flex-col items-center py-6 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold">ส่งคำขอสำเร็จ!</h3>
            <p className="mt-1 text-sm text-foreground/60">
              เจ้าของโพสต์จะได้รับแจ้งคำขอของคุณ
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
            >
              ปิด
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Heart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-base font-bold">ขอรับเลี้ยง</h3>
                <p className="text-xs text-foreground/50 line-clamp-1">
                  {petTitle}
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                {errorMsg}
              </div>
            )}

            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground/60">
                  ข้อความถึงเจ้าของ
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="เล่าให้ฟังหน่อยว่าทำไมอยากรับเลี้ยง..."
                  rows={3}
                  className={cn(inputClass, "resize-none")}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-foreground/60">
                  เบอร์โทรศัพท์
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08x-xxx-xxxx"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-foreground/60">
                  LINE ID
                </label>
                <input
                  type="text"
                  value={lineId}
                  onChange={(e) => setLineId(e.target.value)}
                  placeholder="@line-id"
                  className={inputClass}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={state === "submitting"}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {state === "submitting" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  กำลังส่ง...
                </>
              ) : (
                <>
                  <Heart className="h-4 w-4" />
                  ส่งคำขอรับเลี้ยง
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
