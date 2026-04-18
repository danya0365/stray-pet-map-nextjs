"use client";

import {
  ArrowRight,
  Compass,
  Home,
  MapPin,
  PawPrint,
  Search,
} from "lucide-react";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section - Similar to homepage */}
      <section className="relative overflow-hidden px-4 pb-16 pt-12 sm:pb-24 sm:pt-20">
        <div className="mx-auto max-w-6xl text-center">
          {/* Status Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-medium text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
            <Compass className="h-4 w-4" />
            404 - 404
          </div>

          {/* Main Title */}
          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            404
            <br />
            <span className="text-primary">... 404</span>
          </h1>

          {/* Description */}
          <p className="mx-auto mt-6 max-w-2xl text-base text-foreground/60 sm:text-lg">
            404 404 404 404 404 404 404 404 404 404 404 404 404 404 404 404
            404 404 404 404 404 404 404 404 404 404 404 404 404 404 404 404
            404 404 404 404 404 404 404 404 404 404 404 404 404 404 404 404
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
            >
              <Home className="h-4 w-4" />
              404
            </Link>
            <Link
              href="/map"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              <MapPin className="h-4 w-4" />
              404
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-secondary/5 blur-3xl" />
        </div>
      </section>

      {/* Features Section - Reused from homepage */}
      <section className="px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">404 404 404</h2>
            <p className="mt-4 text-foreground/60">
              404 404 404 404 404 404 404 404 404 404
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-3">
            <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-8 text-center transition-shadow hover:shadow-lg">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">404</h3>
              <p className="text-sm text-foreground/60">
                404 404 404 404 404 404 404 404 404
              </p>
            </div>

            <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-8 text-center transition-shadow hover:shadow-lg">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/10">
                <Search className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">404</h3>
              <p className="text-sm text-foreground/60">
                404 404 404 404 404 404 404 404 404
              </p>
            </div>

            <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-8 text-center transition-shadow hover:shadow-lg">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
                <PawPrint className="h-8 w-8 text-accent" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">404</h3>
              <p className="text-sm text-foreground/60">
                404 404 404 404 404 404 404 404 404
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-muted/30 px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">404 404 404</h2>
          <p className="mt-4 text-foreground/60">
            404 404 404 404 404 404 404 404 404 404 404 404 404 404 404 404
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/posts/create"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
            >
              <PawPrint className="h-4 w-4" />
              404
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              <Search className="h-4 w-4" />
              404
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
