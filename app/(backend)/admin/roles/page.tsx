import { Shield } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "สิทธิ์ & บทบาท — Admin",
};

export default function AdminRolesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">สิทธิ์ & บทบาท</h1>
        <p className="mt-1 text-sm text-foreground/50">
          จัดการ Role & Permission ของผู้ใช้งาน
        </p>
      </div>
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-16">
        <Shield className="h-10 w-10 text-foreground/20" />
        <p className="mt-3 text-sm font-medium text-foreground/30">
          จัดการสิทธิ์ — อยู่ระหว่างพัฒนา
        </p>
      </div>
    </div>
  );
}
