import { HomeView } from "@/presentation/components/home/HomeView";
import { createServerHomePresenter } from "@/presentation/presenters/home/HomePresenterServerFactory";
import Link from "next/link";

export default async function HomePage() {
  const presenter = createServerHomePresenter();

  let viewModel = null;
  let fetchError = false;

  try {
    viewModel = await presenter.getViewModel();
  } catch (error) {
    console.error("Error fetching home data:", error);
    fetchError = true;
  }

  if (fetchError || !viewModel) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold text-foreground">
            เกิดข้อผิดพลาด
          </h1>
          <p className="mb-4 text-foreground/60">
            ไม่สามารถโหลดข้อมูลหน้าแรกได้
          </p>
          <Link
            href="/"
            className="rounded-lg bg-primary px-4 py-2 text-white transition-colors hover:bg-primary/90"
          >
            ลองใหม่อีกครั้ง
          </Link>
        </div>
      </div>
    );
  }

  return <HomeView initialViewModel={viewModel} />;
}
