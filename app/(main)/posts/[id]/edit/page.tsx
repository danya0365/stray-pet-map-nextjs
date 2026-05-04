import { SupabaseAuthRepository } from "@/infrastructure/repositories/supabase/SupabaseAuthRepository";
import { SupabasePetPostRepository } from "@/infrastructure/repositories/supabase/SupabasePetPostRepository";
import { SupabasePetTypeRepository } from "@/infrastructure/repositories/supabase/SupabasePetTypeRepository";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { EditPostView } from "@/presentation/components/edit-post/EditPostView";
import { PetPostPresenter } from "@/presentation/presenters/pet-post/PetPostPresenter";
import { notFound, redirect } from "next/navigation";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const authRepo = new SupabaseAuthRepository(supabase);
  const postRepo = new SupabasePetPostRepository(supabase);
  const petTypeRepo = new SupabasePetTypeRepository(supabase);

  const user = await authRepo.getUser();
  if (!user) {
    redirect(`/login?redirect=/posts/${id}/edit`);
  }

  const profile = await authRepo.getProfile();
  if (!profile) {
    redirect("/login");
  }

  const presenter = new PetPostPresenter(postRepo);
  const result = await presenter.getById(id);

  if (!result.success || !result.data) {
    notFound();
  }

  // Only post owner can edit
  if (result.data.profileId !== profile.id) {
    redirect(`/pets/${id}`);
  }

  const petTypes = await petTypeRepo.getAll();

  return <EditPostView post={result.data} petTypes={petTypes} />;
}
