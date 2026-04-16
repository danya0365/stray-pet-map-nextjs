"use client";

import {
  BarChart3,
  FileText,
  Flag,
  Home,
  Menu,
  PawPrint,
  Settings,
  Shield,
  Trophy,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "@/presentation/components/layout/ThemeToggle";

const mobileMenuItems = [
  { href: "/admin", label: "Dashboard", icon: Home },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/posts", label: "โพสต์ทั้งหมด", icon: FileText },
  { href: "/admin/pet-types", label: "ชนิดสัตว์", icon: PawPrint },
  { href: "/admin/reports", label: "รายงาน", icon: Flag },
  { href: "/admin/scraped", label: "FB Scraped", icon: FileText },
  { href: "/admin/users", label: "ผู้ใช้งาน", icon: Users },
  { href: "/admin/badges", label: "Badges", icon: Trophy },
  { href: "/admin/roles", label: "สิทธิ์", icon: Shield },
  { href: "/admin/settings", label: "ตั้งค่า", icon: Settings },
];

export function BackendMobileHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
      <div className="flex items-center gap-2">
        <PawPrint className="h-5 w-5 text-primary" />
        <span className="text-sm font-bold text-primary">Admin</span>
      </div>

      <div className="flex items-center gap-1">
        <ThemeToggle />
        <button
          onClick={() => setOpen(!open)}
          className="rounded-lg p-2 transition-colors hover:bg-foreground/5"
          aria-label="Toggle admin menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 right-0 top-14 z-50 max-h-[70vh] overflow-y-auto border-b border-border bg-card shadow-lg">
            <nav className="p-3">
              <ul className="space-y-0.5">
                {mobileMenuItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
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
              <div className="mt-3 border-t border-border pt-3">
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-foreground/40 hover:text-primary"
                >
                  ← กลับหน้าเว็บ
                </Link>
              </div>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
