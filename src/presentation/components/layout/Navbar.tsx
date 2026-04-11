"use client";

import {
  Heart,
  LogIn,
  MapPin,
  Menu,
  PawPrint,
  PlusCircle,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { ThemeToggle } from "./ThemeToggle";

const emptySubscribe = () => () => {};

const navLinks = [
  { href: "/map", label: "แผนที่", icon: MapPin },
  { href: "/search", label: "ค้นหา", icon: Search },
  { href: "/posts/create", label: "โพสต์น้อง", icon: PlusCircle },
  { href: "/favorites", label: "รายการโปรด", icon: Heart },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

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

          {/* Auth placeholder */}
          <Link
            href="/login"
            className="hidden items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 md:flex"
          >
            <LogIn className="h-4 w-4" />
            เข้าสู่ระบบ
          </Link>

          {/* Mobile menu toggle */}
          <button
            className="rounded-lg p-2 transition-colors hover:bg-foreground/5 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Nav */}
      {mounted && mobileOpen && (
        <div className="border-t border-border/40 bg-background px-4 pb-4 md:hidden">
          <ul className="flex flex-col gap-1 pt-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/70 transition-colors hover:bg-primary/10 hover:text-primary"
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
              >
                <LogIn className="h-4 w-4" />
                เข้าสู่ระบบ
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
