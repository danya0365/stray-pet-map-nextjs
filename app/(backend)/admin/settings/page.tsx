import { Settings } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ตั้งค่า — Admin",
};

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">ตั้งค่าระบบ</h1>
        <p className="mt-1 text-sm text-foreground/50">
          ตั้งค่าทั่วไปของระบบ StrayPetMap
        </p>
      </div>
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-16">
        <Settings className="h-10 w-10 text-foreground/20" />
        <p className="mt-3 text-sm font-medium text-foreground/30">
          หน้าตั้งค่า — อยู่ระหว่างพัฒนา
        </p>
      </div>
    </div>
  );
}
