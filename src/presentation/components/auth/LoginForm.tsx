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
  const [
    { loading, error, isSuccess },
    { signIn, signInWithGoogle, clearError },
  ] = useAuthPresenter();

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

      {/* Google Sign In */}
      <button
        type="button"
        disabled={loading}
        onClick={async () => {
          clearError();
          const url = await signInWithGoogle();
          if (url) {
            window.location.href = url;
          }
        }}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-white py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-60"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        เข้าสู่ระบบด้วย Google
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-foreground/50">หรือ</span>
        </div>
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

      {/* Dev: 1-click login */}
      {process.env.NODE_ENV !== "production" && (
        <button
          type="button"
          disabled={loading}
          onClick={() =>
            onSubmit({ email: "admin@straypetmap.com", password: "12345678" })
          }
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-amber-400 bg-amber-50 py-3 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-100 disabled:opacity-60 dark:border-amber-600 dark:bg-amber-950/30 dark:text-amber-400 dark:hover:bg-amber-950/50"
        >
          ⚡ Dev Login (admin)
        </button>
      )}

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
