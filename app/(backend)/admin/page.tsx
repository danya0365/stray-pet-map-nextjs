import {
  FileText,
  Flag,
  PawPrint,
  TrendingUp,
  Users,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard — StrayPetMap",
};

const mockStats = [
  {
    label: "โพสต์ทั้งหมด",
    value: "—",
    icon: FileText,
    color: "text-blue-500 bg-blue-500/10",
  },
  {
    label: "ผู้ใช้งาน",
    value: "—",
    icon: Users,
    color: "text-emerald-500 bg-emerald-500/10",
  },
  {
    label: "รายงานรอตรวจ",
    value: "—",
    icon: Flag,
    color: "text-amber-500 bg-amber-500/10",
  },
  {
    label: "รับเลี้ยงสำเร็จ",
    value: "—",
    icon: PawPrint,
    color: "text-rose-500 bg-rose-500/10",
  },
];

const mockRecentPosts = [
  { title: "น้องหมาพันธุ์ไทย สีน้ำตาล", status: "available", date: "—" },
  { title: "น้องแมวส้ม 2 ตัว หาบ้าน", status: "pending", date: "—" },
  { title: "น้องกระต่ายหูตก", status: "adopted", date: "—" },
  { title: "น้องหมาจรตรงซอย 5", status: "available", date: "—" },
  { title: "แมวดำถูกทิ้ง", status: "available", date: "—" },
];

const statusLabel: Record<string, { text: string; cls: string }> = {
  available: { text: "พร้อม", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  pending: { text: "รอดำเนินการ", cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  adopted: { text: "มีบ้านแล้ว", cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
};

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-foreground/50">
          ภาพรวมระบบ StrayPetMap (Mock Data — เชื่อมข้อมูลจริงทีหลัง)
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {mockStats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-4"
          >
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${stat.color}`}
            >
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-foreground/50">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Posts */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <h2 className="text-sm font-semibold text-foreground">
              โพสต์ล่าสุด
            </h2>
            <span className="text-xs text-foreground/40">Mock</span>
          </div>
          <div className="divide-y divide-border">
            {mockRecentPosts.map((post, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-5 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {post.title}
                  </p>
                  <p className="text-xs text-foreground/40">{post.date}</p>
                </div>
                <span
                  className={`ml-3 shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${statusLabel[post.status].cls}`}
                >
                  {statusLabel[post.status].text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <h2 className="text-sm font-semibold text-foreground">
              Quick Actions
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3 p-5">
            {[
              { label: "จัดการโพสต์", href: "/admin/posts", icon: FileText },
              { label: "ดูรายงาน", href: "/admin/reports", icon: Flag },
              { label: "ผู้ใช้งาน", href: "/admin/users", icon: Users },
              { label: "FB Scraped", href: "/admin/scraped", icon: TrendingUp },
            ].map((action) => (
              <a
                key={action.href}
                href={action.href}
                className="flex flex-col items-center gap-2 rounded-lg border border-border p-4 text-center transition-colors hover:border-primary/30 hover:bg-primary/5"
              >
                <action.icon className="h-5 w-5 text-foreground/50" />
                <span className="text-xs font-medium text-foreground/70">
                  {action.label}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Placeholder chart area */}
      <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
        <TrendingUp className="mx-auto h-8 w-8 text-foreground/20" />
        <p className="mt-2 text-sm font-medium text-foreground/30">
          กราฟ & Analytics — เชื่อมข้อมูลจริงในอนาคต
        </p>
      </div>
    </div>
  );
}
