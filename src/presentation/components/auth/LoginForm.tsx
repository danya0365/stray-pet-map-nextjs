"use client";

import { cn } from "@/presentation/lib/cn";
import { useAuthPresenter } from "@/presentation/presenters/auth/useAuthPresenter";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, LogIn, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("กรุณากรอกอีเมลให้ถูกต้อง"),
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";

  const [showPassword, setShowPassword] = useState(false);
  const [{ loading, error, isSuccess }, { signIn, clearError }] =
    useAuthPresenter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    clearError();
    const success = await signIn(data.email, data.password);
    if (success) {
      router.push(redirectTo);
      router.refresh();
    }
  };

  // Auto redirect on success
  useEffect(() => {
    if (isSuccess) {
      router.push(redirectTo);
      router.refresh();
    }
  }, [isSuccess, redirectTo, router]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

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
            autoComplete="current-password"
            placeholder="••••••••"
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

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <LogIn className="h-4 w-4" />
        )}
        {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
      </button>

      {/* Register link */}
      <p className="text-center text-sm text-foreground/50">
        ยังไม่มีบัญชี?{" "}
        <Link
          href="/auth/register"
          className="font-medium text-primary hover:underline"
        >
          สมัครสมาชิก
        </Link>
      </p>
    </form>
  );
}
