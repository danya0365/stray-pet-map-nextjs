import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { ProfileView } from "@/presentation/components/profile/ProfileView";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Profile | StrayPetMap",
  description: "View my profile and activities",
};

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">My Profile</h1>
      <ProfileView />
    </div>
  );
}
