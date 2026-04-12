import { PetDetailContainer } from "@/presentation/components/pet-detail/PetDetailContainer";
import { createServerPetDetailPresenter } from "@/presentation/presenters/pet-detail/PetDetailPresenterServerFactory";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface PetDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PetDetailPageProps): Promise<Metadata> {
  const presenter = await createServerPetDetailPresenter();
  const { id } = await params;
  const viewModel = await presenter.getViewModel(id);

  if (!viewModel) {
    return { title: "ไม่พบโพสต์ | StrayPetMap" };
  }

  return presenter.generateMetadata(viewModel.post);
}

export default async function PetDetailPage({ params }: PetDetailPageProps) {
  const presenter = await createServerPetDetailPresenter();
  const { id } = await params;

  let viewModel = null;
  let fetchError = false;

  try {
    viewModel = await presenter.getViewModel(id);
  } catch (error) {
    console.error("Error fetching pet detail:", error);
    fetchError = true;
  }

  if (fetchError) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold text-foreground">
            เกิดข้อผิดพลาด
          </h1>
          <p className="text-foreground/60">ไม่สามารถโหลดข้อมูลได้</p>
        </div>
      </div>
    );
  }

  if (!viewModel) {
    notFound();
  }

  return <PetDetailContainer initialViewModel={viewModel} />;
}
