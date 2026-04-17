"use client";

import { useState, useEffect } from "react";
import { Trophy, Medal, Crown, Sparkles, PawPrint, Heart } from "lucide-react";
import Link from "next/link";
import { useDonation } from "@/presentation/hooks/useDonation";

const TABS = [
  { id: "weekly", label: "ฮีโร่ประจำสัปดาห์", icon: Sparkles },
  { id: "alltime", label: "ฮอลล์ออฟเฟม", icon: Crown },
];

const RANK_ICONS = [Crown, Medal, Medal];
const RANK_COLORS = [
  "text-yellow-500",
  "text-gray-400",
  "text-amber-600",
];

export default function DonationLeaderboardPage() {
  const [activeTab, setActiveTab] = useState<"weekly" | "alltime">("weekly");
  const { leaderboard, isLoading, fetchLeaderboard } = useDonation();

  useEffect(() => {
    fetchLeaderboard(activeTab);
  }, [activeTab, fetchLeaderboard]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-linear-to-br from-primary/10 via-secondary/5 to-background py-12 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
              <Trophy className="h-10 w-10 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            ฮีโร่ช่วยน้อง 🏆
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            ขอบคุณผู้ใจดีทุกท่านที่ช่วยเหลือน้องๆ ให้มีชีวิตที่ดีขึ้น
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-white shadow-lg shadow-primary/20 transition-all hover:shadow-xl"
            >
              <PawPrint className="h-4 w-4" />
              ดูน้องที่ต้องการความช่วยเหลือ
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Tabs */}
        <div className="mb-8 flex justify-center gap-2">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as "weekly" | "alltime")}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 font-medium transition-all ${
                activeTab === id
                  ? "bg-primary text-white shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Stats Summary */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          <div className="rounded-2xl border border-border bg-card p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {leaderboard.stats?.totalRaised?.toLocaleString() || "0"}฿
            </div>
            <div className="text-sm text-muted-foreground">ยอดบริจาครวม</div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 text-center">
            <div className="text-2xl font-bold text-secondary">
              {leaderboard.stats?.uniqueDonors || "0"}
            </div>
            <div className="text-sm text-muted-foreground">ผู้บริจาค</div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 text-center">
            <div className="text-2xl font-bold text-accent">
              {leaderboard.stats?.totalDonations || "0"}
            </div>
            <div className="text-sm text-muted-foreground">ครั้งบริจาค</div>
          </div>
        </div>

        {/* Leaderboard List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              กำลังโหลด...
            </div>
          ) : leaderboard.entries.length === 0 ? (
            <div className="py-12 text-center">
              <Heart className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">ยังไม่มีข้อมูลผู้บริจาค</p>
              <p className="mt-2 text-sm text-muted-foreground">
                มาเป็นฮีโร่คนแรกกัน! 🦸
              </p>
            </div>
          ) : (
            leaderboard.entries.map((entry, index) => {
              const rank = index + 1;
              const RankIcon = RANK_ICONS[index] || null;
              const rankColor = RANK_COLORS[index] || "text-muted-foreground";

              return (
                <div
                  key={entry.donorId}
                  className={`flex items-center gap-4 rounded-2xl border p-4 transition-all ${
                    rank <= 3
                      ? "border-primary/20 bg-primary/5"
                      : "border-border bg-card hover:border-primary/10"
                  }`}
                >
                  {/* Rank */}
                  <div className="flex w-12 items-center justify-center">
                    {RankIcon ? (
                      <RankIcon className={`h-8 w-8 ${rankColor}`} />
                    ) : (
                      <span className="text-lg font-bold text-muted-foreground">
                        #{rank}
                      </span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="h-12 w-12 overflow-hidden rounded-full bg-muted">
                    {entry.avatarUrl ? (
                      <img
                        src={entry.avatarUrl}
                        alt={entry.donorName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                        {entry.donorName.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{entry.donorName}</span>
                      {rank <= 3 && (
                        <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
                          TOP {rank}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      บริจาค {entry.donationCount} ครั้ง
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-right">
                    <div className="text-xl font-bold text-primary">
                      {entry.totalAmount.toLocaleString()}฿
                    </div>
                    {entry.lastDonationAt && (
                      <div className="text-xs text-muted-foreground">
                        ล่าสุด: {new Date(entry.lastDonationAt).toLocaleDateString("th-TH")}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <p className="mb-4 text-muted-foreground">
            อยากเห็นชื่อตัวเองในกระดานผู้บริจาค?
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-primary px-6 py-3 font-medium text-primary transition-all hover:bg-primary hover:text-white"
          >
            <Heart className="h-4 w-4" />
            ร่วมบริจาคเลย
          </Link>
        </div>
      </div>
    </div>
  );
}
