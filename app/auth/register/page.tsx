import { RegisterForm } from "@/presentation/components/auth/RegisterForm";
import { PawPrint } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "สมัครสมาชิก | StrayPetMap",
  description: "สมัครสมาชิกเพื่อเริ่มช่วยเหลือน้องสัตว์จร",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <PawPrint className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">สมัครสมาชิก</h1>
          <p className="mt-1.5 text-sm text-foreground/50">
            เริ่มต้นช่วยเหลือน้องสัตว์จรวันนี้
          </p>
        </div>

        {/* Form */}
        <RegisterForm />
      </div>
    </div>
  );
}
