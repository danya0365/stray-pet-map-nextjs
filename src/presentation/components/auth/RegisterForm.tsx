"use client";

import { cn } from "@/presentation/lib/cn";
import { useAuthPresenter } from "@/presentation/presenters/auth/useAuthPresenter";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Mail, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const registerSchema = z
  .object({
    email: z.string().email("กรุณากรอกอีเมลให้ถูกต้อง"),
    password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
    confirmPassword: z.string(),
    fullName: z.string().min(2, "กรุณากรอกชื่อ (อย่างน้อย 2 ตัวอักษร)"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "รหัสผ่านไม่ตรงกัน",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [{ loading, error, isSuccess }, { signUp, clearError }] =
    useAuthPresenter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    clearError();
    await signUp(data.email, data.password, data.fullName);
  };

  // Auto redirect on success
  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    }
  }, [isSuccess, router]);

  if (isSuccess) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <span className="text-3xl">🎉</span>
        </div>
        <h3 className="text-lg font-semibold">สมัครสมาชิกสำเร็จ!</h3>
        <p className="text-sm text-foreground/60">
          กำลังพาไปหน้าเข้าสู่ระบบ...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Full Name */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground/70">
          ชื่อที่แสดง
        </label>
        <input
          type="text"
          placeholder="เช่น คนรักสัตว์"
          className={cn(
            "w-full rounded-xl border bg-card px-4 py-3 text-sm outline-none transition-colors",
            "placeholder:text-foreground/30 focus:border-primary focus:ring-2 focus:ring-primary/20",
            errors.fullName
              ? "border-red-400 dark:border-red-600"
              : "border-border",
          )}
          {...register("fullName")}
        />
        {errors.fullName && (
          <p className="text-xs text-red-500">{errors.fullName.message}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground/70">อีเมล</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/30" />
          <input
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            className={cn(
              "w-full rounded-xl border bg-card py-3 pl-10 pr-4 text-sm outline-none transition-colors",
              "placeholder:text-foreground/30 focus:border-primary focus:ring-2 focus:ring-primary/20",
              errors.email
                ? "border-red-400 dark:border-red-600"
                : "border-border",
            )}
            {...register("email")}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground/70">
          รหัสผ่าน
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="อย่างน้อย 6 ตัวอักษร"
            className={cn(
              "w-full rounded-xl border bg-card py-3 pl-4 pr-10 text-sm outline-none transition-colors",
              "placeholder:text-foreground/30 focus:border-primary focus:ring-2 focus:ring-primary/20",
              errors.password
                ? "border-red-400 dark:border-red-600"
                : "border-border",
            )}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground/60"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-red-500">{errors.password.message}</p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground/70">
          ยืนยันรหัสผ่าน
        </label>
        <input
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="กรอกรหัสผ่านอีกครั้ง"
          className={cn(
            "w-full rounded-xl border bg-card px-4 py-3 text-sm outline-none transition-colors",
            "placeholder:text-foreground/30 focus:border-primary focus:ring-2 focus:ring-primary/20",
            errors.confirmPassword
              ? "border-red-400 dark:border-red-600"
              : "border-border",
          )}
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p className="text-xs text-red-500">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <UserPlus className="h-4 w-4" />
        )}
        {loading ? "กำลังสมัคร..." : "สมัครสมาชิก"}
      </button>

      {/* Login link */}
      <p className="text-center text-sm text-foreground/50">
        มีบัญชีอยู่แล้ว?{" "}
        <Link
          href="/auth/login"
          className="font-medium text-primary hover:underline"
        >
          เข้าสู่ระบบ
        </Link>
      </p>
    </form>
  );
}
