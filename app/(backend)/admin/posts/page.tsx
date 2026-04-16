import { FileText } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "จัดการโพสต์ — Admin",
};

export default function AdminPostsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">จัดการโพสต์</h1>
        <p className="mt-1 text-sm text-foreground/50">
          ดูและจัดการโพสต์สัตว์จรทั้งหมดในระบบ
        </p>
      </div>
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-16">
        <FileText className="h-10 w-10 text-foreground/20" />
        <p className="mt-3 text-sm font-medium text-foreground/30">
          ตารางแสดงโพสต์ — อยู่ระหว่างพัฒนา
        </p>
      </div>
    </div>
  );
}
