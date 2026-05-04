import { EditProfileView } from "@/presentation/components/profile/EditProfileView";
import { createServerProfilePresenter } from "@/presentation/presenters/profile/ProfilePresenterServerFactory";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

/**
 * Edit Profile Page - Server Component
 * Loads profile data server-side and passes to EditProfileView
 */
export default async function EditProfilePage() {
  const presenter = await createServerProfilePresenter();
  const viewModel = await presenter.getViewModel();

  // Redirect if not authenticated
  if (!viewModel.user || !viewModel.profile) {
    redirect("/auth/login");
  }

  return <EditProfileView profile={viewModel.profile} />;
}
