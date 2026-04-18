"use client";

import { ImpactCard } from "@/presentation/components/donation";
import { ArrowLeft, Home, Trophy } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();

  // Get data from URL params (passed from Stripe success URL)
  const amount = parseInt(searchParams.get("amount") || "0");
  const donorName = searchParams.get("donorName") || undefined;
  const petName = searchParams.get("petName") || undefined;
  const isAnonymous = searchParams.get("anonymous") === "true";

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-12">
      {/* Impact Card */}
      <ImpactCard
        amount={amount || 100} // Default for demo
        donorName={donorName}
        petName={petName}
        isAnonymous={isAnonymous}
      />

      {/* Quick Links */}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          <Home className="h-4 w-4" />
          หน้าแรก
        </Link>
        <Link
          href="/donate/leaderboard"
          className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          <Trophy className="h-4 w-4 text-yellow-500" />
          กระดานผู้บริจาค
        </Link>
        <Link
          href="/road-map"
          className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          Roadmap
        </Link>
      </div>

      {/* Back Link */}
      <Link
        href="/"
        className="mt-6 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        กลับไปช่วยน้องๆ ต่อ
      </Link>
    </div>
  );
}

export default function DonateSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[80vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
