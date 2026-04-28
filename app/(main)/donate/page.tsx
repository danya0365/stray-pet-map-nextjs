"use client";

import { DonateView } from "@/presentation/components/donation/DonateView";
import { useDonatePresenter } from "@/presentation/presenters/donation/useDonatePresenter";

export default function DonatePage() {
  const [state, actions] = useDonatePresenter();
  return <DonateView state={state} actions={actions} />;
}
