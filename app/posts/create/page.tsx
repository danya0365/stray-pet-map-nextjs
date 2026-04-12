import { CreatePostView } from "@/presentation/components/create-post/CreatePostForm";
import { createServerCreatePostPresenter } from "@/presentation/presenters/create-post/CreatePostPresenterServerFactory";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export function generateMetadata(): Metadata {
  return {
    title: "โพสต์น้อง | StrayPetMap",
    description: "โพสต์น้องสัตว์จรเพื่อช่วยตามหาบ้านหรือเจ้าของ",
  };
}

export default async function CreatePostPage() {
  const presenter = await createServerCreatePostPresenter();

  let viewModel = null;
  let fetchError = false;

  try {
    viewModel = await presenter.getViewModel();
  } catch (error) {
    console.error("Error fetching create-post data:", error);
    fetchError = true;
  }

  if (fetchError || !viewModel) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold text-foreground">
            เกิดข้อผิดพลาด
          </h1>
          <p className="mb-4 text-foreground/60">ไม่สามารถโหลดข้อมูลได้</p>
          <Link
            href="/"
            className="rounded-lg bg-primary px-4 py-2 text-white transition-colors hover:bg-primary/90"
          >
            กลับหน้าแรก
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold sm:text-3xl">โพสต์น้อง</h1>
      <CreatePostView initialViewModel={viewModel} />
    </div>
  );
}
