import { DonationLeaderboardView } from "@/presentation/components/donation/DonationLeaderboardView";
import { createServerDonationPresenter } from "@/presentation/presenters/donation/DonationPresenterServerFactory";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "กระดานผู้สนับสนุน | StrayPetMap",
    description:
      "ขอบคุณผู้ใจดีทุกท่านที่ให้กำลังใจและสนับสนุน StrayPetMap - แพลตฟอร์มช่วยเหลือสัตว์จร",
    openGraph: {
      title: "กระดานผู้สนับสนุน | StrayPetMap",
      description:
        "ร่วมเป็นส่วนหนึ่งของการเปลี่ยนแปลง - สนับสนุนเพื่อพัฒนาแพลตฟอร์มช่วยเหลือสัตว์จร",
    },
  };
}

export default async function DonationLeaderboardPage() {
  const presenter = await createServerDonationPresenter();

  let initialViewModel = null;
  let fetchError = false;

  try {
    initialViewModel = await presenter.getViewModel();
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
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

  return <DonationLeaderboardView initialViewModel={initialViewModel} />;
}
