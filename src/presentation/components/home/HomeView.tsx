"use client";

import { SuccessStoriesSection } from "@/presentation/components/success-stories/SuccessStoriesSection";
import type { HomeViewModel } from "@/presentation/presenters/home/HomePresenter";
import { useHomePresenter } from "@/presentation/presenters/home/useHomePresenter";
import {
  ArrowRight,
  Heart,
  Loader2,
  MapPin,
  PawPrint,
  Search,
} from "lucide-react";
import Link from "next/link";
import { PetPostCard } from "./PetPostCard";

const features = [
  {
    icon: MapPin,
    title: "ปักหมุดตำแหน่ง",
    description: "เจอน้องจรอยู่ไหน ปักหมุดบนแผนที่พร้อมรูปภาพได้ทันที",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Search,
    title: "ค้นหาตามสเปก",
    description: "ค้นหาสัตว์ตามชนิด พันธุ์ สี ตำแหน่ง และสถานะได้ง่ายๆ",
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
  {
    icon: Heart,
    title: "รับเลี้ยงน้อง",
    description: "เชื่อมต่อคนอยากเลี้ยงกับคนช่วยสัตว์ ให้น้องมีบ้านใหม่",
    color: "text-accent",
    bg: "bg-accent/10",
  },
];

interface HomeViewProps {
  initialViewModel?: HomeViewModel;
}

export function HomeView({ initialViewModel }: HomeViewProps) {
  const [state] = useHomePresenter(initialViewModel);
  const { viewModel, loading, error } = state;

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-16 pt-12 sm:pb-24 sm:pt-20">
        <div className="mx-auto max-w-6xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <PawPrint className="h-4 w-4" />
            ช่วยให้สัตว์มีบ้าน
          </div>

          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            แผนที่สัตว์จร
            <br />
            <span className="text-primary">ทั่วประเทศไทย</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base text-foreground/60 sm:text-lg">
            แพลตฟอร์มกลางสำหรับโพสต์ตำแหน่งสัตว์จร ค้นหาน้องหมาน้องแมว
            และเชื่อมคนอยากเลี้ยงกับคนช่วยสัตว์
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/map"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
            >
              <MapPin className="h-4 w-4" />
              เปิดแผนที่
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              ค้นหาสัตว์
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Stats */}
          {viewModel?.stats && (
            <div className="mx-auto mt-12 grid max-w-lg grid-cols-3 gap-4">
              <div className="rounded-xl bg-card p-3 shadow-sm border border-border/40">
                <p className="text-2xl font-bold text-primary">
                  {viewModel.stats.availablePosts}
                </p>
                <p className="text-xs text-foreground/50">น้องหาบ้าน</p>
              </div>
              <div className="rounded-xl bg-card p-3 shadow-sm border border-border/40">
                <p className="text-2xl font-bold text-secondary">
                  {viewModel.stats.adoptedPosts}
                </p>
                <p className="text-xs text-foreground/50">มีบ้านแล้ว</p>
              </div>
              <div className="rounded-xl bg-card p-3 shadow-sm border border-border/40">
                <p className="text-2xl font-bold text-accent">
                  {viewModel.stats.totalPosts}
                </p>
                <p className="text-xs text-foreground/50">โพสต์ทั้งหมด</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Recent Pet Posts */}
      <section className="border-t border-border/40 px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold sm:text-3xl">น้องๆ รอบ้านใหม่</h2>
            <Link
              href="/search"
              className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              ดูทั้งหมด
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-600 dark:border-red-900/40 dark:bg-red-900/10 dark:text-red-400">
              {error}
            </div>
          )}

          {viewModel && !loading && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {viewModel.recentPosts.map((post) => (
                <PetPostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Success Stories */}
      <SuccessStoriesSection limit={3} />

      {/* Features */}
      <section className="border-t border-border/40 bg-muted/50 px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-2xl font-bold sm:text-3xl">
            ทำอะไรได้บ้าง?
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-border/40 bg-card p-6 transition-shadow hover:shadow-md"
              >
                <div
                  className={`mb-4 inline-flex rounded-xl ${feature.bg} p-3`}
                >
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-foreground/60">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
