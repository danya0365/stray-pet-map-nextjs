"use client";

import { CheckCircle, Download, Heart, Share2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface ImpactCardProps {
  amount: number;
  donorName?: string;
  petName?: string;
  isAnonymous?: boolean;
}

export function ImpactCard({
  amount,
  donorName,
  petName,
  isAnonymous,
}: ImpactCardProps) {
  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "error">(
    "idle",
  );

  const displayName = isAnonymous
    ? "ผู้ใจดีไม่ประสงค์ออกนาม"
    : donorName || "ผู้ใจดี";
  const targetText = petName ? `ให้น้อง${petName}` : "ให้ StrayPetMap";

  // Generate share text
  const shareText = `🐾 ${displayName} เพิ่งบริจาค ${amount} บาท ${targetText} ผ่าน StrayPetMap\n\nมาร่วมเป็นฮีโร่ช่วยน้องกัน! 🦸‍♀️🦸‍♂️\nhttps://straypetmap.com/donate/leaderboard`;

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "StrayPetMap - ฮีโร่ช่วยน้อง",
          text: shareText,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        setShareStatus("copied");
        setTimeout(() => setShareStatus("idle"), 2000);
      }
    } catch {
      setShareStatus("error");
      setTimeout(() => setShareStatus("idle"), 2000);
    }
  };

  const handleDownload = () => {
    // Create a canvas or use html-to-image library for better results
    // For now, just alert the user
    alert("ฟีเจอร์ดาวน์โหลดการ์ดจะมาเร็วๆ นี้! 🎨");
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-primary/20 bg-linear-to-br from-primary/5 to-secondary/5 p-6 shadow-lg">
      {/* Header */}
      <div className="mb-4 text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
          <CheckCircle className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-bold">ขอบคุณสำหรับการบริจาค! 💚</h3>
        <p className="text-sm text-muted-foreground">
          คุณ{isAnonymous ? "ได้บริจาค" : displayName + " ได้บริจาค"}{" "}
          <span className="font-semibold text-primary">{amount} บาท</span>
        </p>
      </div>

      {/* Impact Stats */}
      <div className="mb-4 rounded-xl bg-card p-4 text-center">
        <div className="text-3xl font-bold text-primary">
          {Math.floor(amount / 50)}
        </div>
        <p className="text-xs text-muted-foreground">มื้ออาหารสำหรับน้อง 🍖</p>
        <div className="mt-2 text-xs text-muted-foreground">
          (คำนวณจากมื้อละ 50 บาท)
        </div>
      </div>

      {/* Message */}
      <div className="mb-4 text-center text-sm text-muted-foreground">
        <p>
          การบริจาคของคุณจะช่วยเหลือ
          {petName ? `น้อง${petName} ` : "สัตว์จรจัด "}
          ให้มีชีวิตที่ดีขึ้น
        </p>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <button
          onClick={handleShare}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 font-medium text-white shadow-md transition-all hover:bg-primary/90 hover:shadow-lg active:scale-[0.98]"
        >
          <Share2 className="h-4 w-4" />
          {shareStatus === "copied" ? "คัดลอกแล้ว! ✅" : "แชร์ผลบุญ"}
        </button>

        <button
          onClick={handleDownload}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-white py-2.5 font-medium text-primary transition-all hover:bg-primary/5 active:scale-[0.98]"
        >
          <Download className="h-4 w-4" />
          ดาวน์โหลดการ์ด
        </button>

        <Link
          href="/donate/leaderboard"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-muted py-2.5 text-sm font-medium text-foreground transition-all hover:bg-muted/80"
        >
          <Heart className="h-4 w-4" />
          ดูกระดานผู้บริจาค
        </Link>
      </div>

      {/* Footer note */}
      <div className="mt-4 text-center text-xs text-muted-foreground">
        <p>
          ใบเสร็จรับเงินจะถูกส่งไปยังอีเมลของคุณ
          <br />
          (หากระบุไว้)
        </p>
      </div>
    </div>
  );
}
