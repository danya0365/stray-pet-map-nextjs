"use client";

import {
  BarChart3,
  FileText,
  Flag,
  Home,
  PawPrint,
  Settings,
  Shield,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/presentation/components/layout/ThemeToggle";

const sidebarMenus = [
  {
    label: "หลัก",
    items: [
      { href: "/admin", label: "Dashboard", icon: Home },
      { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "จัดการเนื้อหา",
    items: [
      { href: "/admin/posts", label: "โพสต์ทั้งหมด", icon: FileText },
      { href: "/admin/pet-types", label: "ชนิดสัตว์", icon: PawPrint },
      { href: "/admin/reports", label: "รายงาน / แจ้งเตือน", icon: Flag },
      {
        href: "/admin/scraped",
        label: "FB Scraped Posts",
        icon: FileText,
      },
    ],
  },
  {
    label: "ผู้ใช้ & Gamification",
    items: [
      { href: "/admin/users", label: "ผู้ใช้งาน", icon: Users },
      { href: "/admin/badges", label: "Badges", icon: Trophy },
    ],
  },
  {
    label: "ระบบ",
    items: [
      { href: "/admin/roles", label: "สิทธิ์ & บทบาท", icon: Shield },
      { href: "/admin/settings", label: "ตั้งค่า", icon: Settings },
    ],
  },
];

export function BackendSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-border px-5">
        <PawPrint className="h-6 w-6 text-primary" />
        <span className="text-lg font-bold text-primary">StrayPetMap</span>
        <span className="ml-1 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
          ADMIN
        </span>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {sidebarMenus.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-foreground/40">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-foreground/60 hover:bg-foreground/5 hover:text-foreground"
                      }`}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="flex items-center justify-between border-t border-border px-4 py-3">
        <Link
          href="/"
          className="text-xs text-foreground/40 transition-colors hover:text-primary"
        >
          ← กลับหน้าเว็บ
        </Link>
        <ThemeToggle />
      </div>
    </aside>
  );
}
