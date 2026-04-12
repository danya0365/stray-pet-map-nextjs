import { SupabasePetTypeRepository } from "@/infrastructure/repositories/supabase/SupabasePetTypeRepository";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { CreatePostForm } from "@/presentation/components/create-post/CreatePostForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "โพสต์น้อง | StrayPetMap",
  description: "โพสต์น้องสัตว์จรเพื่อช่วยตามหาบ้านหรือเจ้าของ",
};

export default async function CreatePostPage() {
  const supabase = await createServerSupabaseClient();
  const petTypeRepo = new SupabasePetTypeRepository(supabase);
  const petTypes = await petTypeRepo.getAll();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold sm:text-3xl">โพสต์น้อง</h1>
      <CreatePostForm petTypes={petTypes} />
    </div>
  );
}
