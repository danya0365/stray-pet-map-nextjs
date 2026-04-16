"use client";

import type { Badge, BadgeProgress } from "@/domain/entities/badge";
import { useEffect, useState } from "react";
import { MyBadgesView } from "./MyBadgesView";

interface MyBadgesData {
  badges: Badge[];
  totalBadges: number;
  progress: BadgeProgress[];
}

export function MyBadgesContainer() {
  const [data, setData] = useState<MyBadgesData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    async function fetchBadges() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/badges/profile");

        if (!res.ok) {
          if (res.status === 401) {
            throw new Error("กรุณาเข้าสู่ระบบเพื่อดูตราสัญลักษณ์");
          }
          throw new Error("Failed to fetch badges");
        }

        const result = await res.json();
        setData({
          badges: result.badges || [],
          totalBadges: result.totalBadges || 0,
          progress: result.progress || [],
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    }

    fetchBadges();
  }, []);

  const handleCheckBadges = async () => {
    try {
      setIsChecking(true);
      const res = await fetch("/api/badges/profile", {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Failed to check badges");
      }

      const result = await res.json();
      setData({
        badges: result.badges || [],
        totalBadges: result.totalBadges || 0,
        progress: result.progress || [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <MyBadgesView
      data={data}
      isLoading={isLoading}
      error={error}
      isChecking={isChecking}
      onCheckBadges={handleCheckBadges}
    />
  );
}
