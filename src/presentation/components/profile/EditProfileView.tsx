"use client";

import type { AuthProfile } from "@/application/repositories/IAuthRepository";
import { ArrowLeft, Camera, Loader2, Save, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";

interface EditProfileViewProps {
  profile: AuthProfile;
}

export function EditProfileView({ profile }: EditProfileViewProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(profile.fullName ?? "");
  const [username, setUsername] = useState(profile.username ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      setError(null);
      setSuccess(false);

      try {
        const res = await fetch("/api/auth/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: fullName || undefined,
            username: username || undefined,
            bio: bio || undefined,
            avatarUrl: avatarUrl || undefined,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "บันทึกไม่สำเร็จ");
          return;
        }

        setSuccess(true);
        setTimeout(() => {
          router.push("/profile");
        }, 1000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
      } finally {
        setIsSubmitting(false);
      }
    },
    [fullName, username, bio, avatarUrl, router],
  );

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <Link
            href="/profile"
            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-semibold">แก้ไขโปรไฟล์</h1>
        </div>
      </div>

      {/* Form */}
      <div className="mx-auto max-w-2xl px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={handleAvatarClick}
              className="group relative h-24 w-24 overflow-hidden rounded-full ring-2 ring-border transition-all hover:ring-primary/50"
            >
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt="Avatar"
                  fill
                  className="object-cover transition-opacity group-hover:opacity-75"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <User className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                <Camera className="h-6 w-6 text-white" />
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
            />
            <p className="text-xs text-muted-foreground">
              คลิกเพื่อเปลี่ยนรูปโปรไฟล์
            </p>
          </div>

          {/* Fields */}
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                ชื่อที่แสดง
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="ชื่อของคุณ"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                ชื่อผู้ใช้
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="@username"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                เกี่ยวกับฉัน
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="เล่าเกี่ยวกับตัวคุณสั้นๆ..."
                rows={4}
                className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-lg bg-success/10 px-4 py-3 text-sm text-success">
              บันทึกสำเร็จ! กำลังกลับไปหน้าโปรไฟล์...
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <Link
              href="/profile"
              className="flex-1 rounded-xl border border-border py-3 text-center text-sm font-medium transition-colors hover:bg-muted"
            >
              ยกเลิก
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
