import { ProfileView } from "@/presentation/components/profile/ProfileView";
import { createServerProfilePresenter } from "@/presentation/presenters/profile/ProfilePresenterServerFactory";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

// Tell Next.js this is a dynamic page
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

/**
 * Generate metadata for the profile page
 */
export async function generateMetadata(): Promise<Metadata> {
  try {
    const presenter = await createServerProfilePresenter();
    return presenter.generateMetadata();
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "โปรไฟล์ของฉัน | StrayPetMap",
      description: "จัดการโปรไฟล์และตราสัญลักษณ์ของคุณ",
    };
  }
}

/**
 * Profile Management page - Server Component for SEO optimization
 * Uses presenter pattern following Clean Architecture
 */
export default async function ProfilePage() {
  // Get view model from presenter - errors will bubble up to error boundary
  const presenter = await createServerProfilePresenter();
  const viewModel = await presenter.getViewModel();

  // Redirect if not authenticated
  if (!viewModel.user) {
    redirect("/auth/login");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">โปรไฟล์ของฉัน</h1>
      <ProfileView initialViewModel={viewModel} />
    </div>
  );
}
