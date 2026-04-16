"use client";

import { cn } from "@/presentation/lib/cn";
import { useAuthStore } from "@/presentation/stores/useAuthStore";
import { Heart, Home, MapPin, PlusCircle, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "หน้าแรก", icon: Home },
  { href: "/map", label: "แผนที่", icon: MapPin },
  { href: "/posts/create", label: "โพสต์", icon: PlusCircle },
  { href: "/favorites", label: "โปรด", icon: Heart },
  { href: "/profile", label: "โปรไฟล์", icon: User },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { isInitialized, user } = useAuthStore();

  // Hide bottom nav on auth pages
  if (pathname.startsWith("/auth") || pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-background/95 backdrop-blur-md md:hidden">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          // Hide profile/favorites if not logged in and not initialized
          if (
            !isInitialized &&
            (item.href === "/profile" || item.href === "/favorites")
          ) {
            return (
              <div
                key={item.href}
                className="flex flex-col items-center gap-0.5 p-2 opacity-50"
              >
                <div className="h-5 w-5 animate-pulse rounded bg-foreground/20" />
                <span className="text-[10px]">...</span>
              </div>
            );
          }

          // Hide favorites/profile for non-logged in users
          if (
            !user &&
            (item.href === "/favorites" || item.href === "/profile")
          ) {
            return (
              <Link
                key={item.href}
                href="/auth/login"
                className="flex flex-col items-center gap-0.5 p-2 text-foreground/40"
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px]">{item.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-lg p-2 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-foreground/50 hover:text-foreground/70",
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "fill-current")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Safe area padding for iOS */}
      <div className="h-safe-area-inset-bottom" />
    </nav>
  );
}
