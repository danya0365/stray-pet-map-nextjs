"use client";

import { useAuthPresenter } from "@/presentation/presenters/auth/useAuthPresenter";
import { Home, LogOut, PawPrint, ShieldX } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

const ROLE_LABELS: Record<string, string> = {
  user: "ผู้ใช้ทั่วไป",
  moderator: "อาสาตรวจสอบ",
  admin: "ผู้ดูแลระบบ",
};

interface BackendLockScreenProps {
  userName: string;
  userRole: string;
}

export function BackendLockScreen({
  userName,
  userRole,
}: BackendLockScreenProps) {
  const router = useRouter();
  const [{}, { signOut }] = useAuthPresenter();

  const handleSignOut = useCallback(async () => {
    await signOut();
    router.refresh();
  }, [signOut, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6 text-center">
        {/* Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-red-500/10">
          <ShieldX className="h-10 w-10 text-red-500" />
        </div>

        {/* Title */}
        <div>
          <div className="mb-3 flex items-center justify-center gap-2">
            <PawPrint className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold text-primary">StrayPetMap</span>
            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
              ADMIN
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            ไม่มีสิทธิ์เข้าถึง
          </h1>
          <p className="mt-2 text-sm text-foreground/50">
            หน้านี้สำหรับผู้ดูแลระบบเท่านั้น
          </p>
        </div>

        {/* User info card */}
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-foreground/60">เข้าสู่ระบบในนาม</p>
          <p className="mt-1 text-lg font-semibold text-foreground">
            {userName || "ผู้ใช้งาน"}
          </p>
          <span className="mt-2 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            บทบาท: {ROLE_LABELS[userRole] || userRole}
          </span>
          <p className="mt-3 text-xs text-foreground/40">
            หากคุณคิดว่านี่คือความผิดพลาด กรุณาติดต่อผู้ดูแลระบบ
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
          >
            <Home className="h-4 w-4" />
            กลับหน้าหลัก
          </Link>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-medium text-foreground/70 transition-colors hover:bg-foreground/5"
          >
            <LogOut className="h-4 w-4" />
            เปลี่ยนบัญชี
          </button>
        </div>
      </div>
    </div>
  );
}
