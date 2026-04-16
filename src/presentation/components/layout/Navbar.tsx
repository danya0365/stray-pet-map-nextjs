"use client";

import { useAuthPresenter } from "@/presentation/presenters/auth/useAuthPresenter";
import { useAuthStore } from "@/presentation/stores/useAuthStore";
import {
  Heart,
  LogIn,
  LogOut,
  MapPin,
  PawPrint,
  PlusCircle,
  Search,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";

const navLinks = [
  { href: "/map", label: "แผนที่", icon: MapPin },
  { href: "/search", label: "ค้นหา", icon: Search },
  { href: "/posts/create", label: "โพสต์น้อง", icon: PlusCircle },
  { href: "/favorites", label: "รายการโปรด", icon: Heart },
];

export function Navbar() {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const router = useRouter();
  const { user, profile, isInitialized } = useAuthStore();
  const [{}, { signOut }] = useAuthPresenter();

  const handleSignOut = useCallback(async () => {
    await signOut();
    setUserMenuOpen(false);
    router.push("/");
    router.refresh();
  }, [signOut, router]);

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold text-primary"
        >
          <PawPrint className="h-7 w-7" />
          <span className="hidden sm:inline">StrayPetMap</span>
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-primary/10 hover:text-primary"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* Auth */}
          {!isInitialized ? (
            // Loading state - show skeleton to prevent UI flash
            <div className="hidden h-9 w-24 animate-pulse rounded-lg bg-foreground/10 md:block" />
          ) : user ? (
            <div className="relative hidden md:block">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-foreground/5"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {profile?.avatarUrl ? (
                    <span className="text-base">{profile.avatarUrl}</span>
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </div>
                <span className="max-w-[120px] truncate">
                  {profile?.fullName || user.email?.split("@")[0]}
                </span>
              </button>

              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-xl border border-border bg-card py-1 shadow-lg">
                    <Link
                      href="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-foreground/70 hover:bg-foreground/5"
                    >
                      <User className="h-4 w-4" />
                      โปรไฟล์
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      <LogOut className="h-4 w-4" />
                      ออกจากระบบ
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="hidden items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 md:flex"
            >
              <LogIn className="h-4 w-4" />
              เข้าสู่ระบบ
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
