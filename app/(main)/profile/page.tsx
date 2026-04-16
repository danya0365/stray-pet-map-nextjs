import { ProfileView } from "@/presentation/components/profile/ProfileView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "โปรไฟล์ | StrayPetMap",
  description: "ดูข้อมูลโปรไฟล์และกิจกรรมของฉัน",
};

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">โปรไฟล์ของฉัน</h1>
      <ProfileView />
    </div>
  );
}
