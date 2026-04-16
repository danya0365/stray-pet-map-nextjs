"use client";

import { ApiAuthRepository } from "@/infrastructure/repositories/api/ApiAuthRepository";
import { useAuthPresenter } from "@/presentation/presenters/auth/useAuthPresenter";
import { useAuthStore } from "@/presentation/stores/useAuthStore";
import {
  Check,
  Heart,
  Loader2,
  LogIn,
  LogOut,
  MapPin,
  PawPrint,
  PlusCircle,
  Search,
  Settings,
  SwitchCamera,
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
  const {
    user,
    profile,
    profiles,
    isInitialized,
    isSwitchingProfile,
    setProfile,
    setSwitchingProfile,
  } = useAuthStore();
  const [{}, { signOut }] = useAuthPresenter();

  const handleSwitchProfile = useCallback(
    async (profileId: string) => {
      if (isSwitchingProfile) return;

      setSwitchingProfile(true);
      try {
        const authRepo = new ApiAuthRepository();
        const newProfile = await authRepo.switchProfile(profileId);
        if (newProfile) {
          setProfile(newProfile);
        }
      } catch (error) {
        console.error("Failed to switch profile:", error);
      } finally {
        setSwitchingProfile(false);
        setUserMenuOpen(false);
        router.refresh();
      }
    },
    [isSwitchingProfile, setProfile, setSwitchingProfile, router],
  );

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
                  <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-xl border border-border bg-card py-1 shadow-lg">
                    {/* Profile Switcher (if multiple profiles exist) */}
                    {profiles.length > 1 && (
                      <div className="border-b border-border/50 px-2 py-2">
                        <p className="mb-1.5 flex items-center justify-between px-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <SwitchCamera className="h-3 w-3" />
                            สลับโปรไฟล์
                          </span>
                          <span className="rounded bg-muted px-1.5 py-0.5 text-[9px]">
                            {profiles.length}
                          </span>
                        </p>
                        <div className="space-y-1">
                          {profiles.map((p) => {
                            const isCurrent = profile?.id === p.id;
                            const roleLabel =
                              p.role === "admin"
                                ? "แอดมิน"
                                : p.role === "moderator"
                                  ? "มอด"
                                  : "สมาชิก";
                            const roleColor =
                              p.role === "admin"
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                                : p.role === "moderator"
                                  ? "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                                  : "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400";

                            return (
                              <button
                                key={p.id}
                                onClick={() =>
                                  !isCurrent &&
                                  !isSwitchingProfile &&
                                  handleSwitchProfile(p.id)
                                }
                                disabled={isCurrent || isSwitchingProfile}
                                className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors ${
                                  isCurrent
                                    ? "bg-primary/5 ring-1 ring-primary/20"
                                    : "hover:bg-muted"
                                } ${isSwitchingProfile && !isCurrent ? "opacity-50" : ""}`}
                              >
                                <div
                                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
                                    isCurrent
                                      ? "bg-primary text-white"
                                      : "bg-muted text-muted-foreground"
                                  }`}
                                >
                                  {isSwitchingProfile && !isCurrent ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <span>
                                      {(p.fullName || p.username || "U")
                                        .charAt(0)
                                        .toUpperCase()}
                                    </span>
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p
                                    className={`truncate text-xs font-medium ${
                                      isCurrent
                                        ? "text-foreground"
                                        : "text-muted-foreground"
                                    }`}
                                  >
                                    {p.fullName || p.username || "ผู้ใช้"}
                                  </p>
                                  <span
                                    className={`inline-block rounded px-1 py-0.5 text-[9px] font-medium ${roleColor}`}
                                  >
                                    {roleLabel}
                                  </span>
                                </div>
                                {isCurrent && (
                                  <Check className="h-4 w-4 shrink-0 text-primary" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <Link
                      href="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-foreground/70 hover:bg-foreground/5"
                    >
                      <User className="h-4 w-4" />
                      โปรไฟล์
                    </Link>
                    {profile?.role === "admin" && (
                      <Link
                        href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-foreground/70 hover:bg-foreground/5"
                      >
                        <Settings className="h-4 w-4" />
                        แดชบอร์ดผู้ดูแล
                      </Link>
                    )}
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
