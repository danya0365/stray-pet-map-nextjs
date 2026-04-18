import { Users } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ผู้ใช้งาน — Admin",
};

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">ผู้ใช้งาน</h1>
        <p className="mt-1 text-sm text-foreground/50">
          จัดการบัญชีผู้ใช้งานทั้งหมดในระบบ
        </p>
      </div>
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-16">
        <Users className="h-10 w-10 text-foreground/20" />
        <p className="mt-3 text-sm font-medium text-foreground/30">
          ตารางผู้ใช้งาน — อยู่ระหว่างพัฒนา
        </p>
      </div>
    </div>
  );
}
