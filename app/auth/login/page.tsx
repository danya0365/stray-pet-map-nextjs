import { LoginForm } from "@/presentation/components/auth/LoginForm";
import { PawPrint } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "เข้าสู่ระบบ | StrayPetMap",
  description: "เข้าสู่ระบบเพื่อโพสต์น้องสัตว์จรและช่วยตามหาบ้าน",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <PawPrint className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">เข้าสู่ระบบ</h1>
          <p className="mt-1.5 text-sm text-foreground/50">
            เข้าสู่ระบบเพื่อโพสต์น้องและช่วยตามหาบ้าน
          </p>
        </div>

        {/* Form */}
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
