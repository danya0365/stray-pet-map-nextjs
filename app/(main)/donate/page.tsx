"use client";

import type { DonationTargetType } from "@/domain/entities/donation";
import { DonateView } from "@/presentation/components/donation/DonateView";
import { useDonatePresenter } from "@/presentation/presenters/donation/useDonatePresenter";

const AVAILABLE_MODES: DonationTargetType[] = ["dev", "fund"];

export default function DonatePage() {
  const [state, actions] = useDonatePresenter();
  return (
    <DonateView
      state={state}
      actions={actions}
      availableModes={AVAILABLE_MODES}
    />
  );
}
