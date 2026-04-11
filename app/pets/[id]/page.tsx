import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PetDetailView } from "@/presentation/components/pet-detail/PetDetailView";
import { createServerPetDetailPresenter } from "@/presentation/presenters/pet-detail/PetDetailPresenterServerFactory";

interface PetDetailPageProps {
  params: Promise<{ id: string }>;
}

const presenter = createServerPetDetailPresenter();

export async function generateMetadata({
  params,
}: PetDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const viewModel = await presenter.getViewModel(id);

  if (!viewModel) {
    return { title: "ไม่พบโพสต์ | StrayPetMap" };
  }

  return presenter.generateMetadata(viewModel.post);
}

export default async function PetDetailPage({ params }: PetDetailPageProps) {
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

  return <PetDetailView viewModel={viewModel} />;
}
