"use client";

import { createContext, useContext, ReactNode } from "react";
import { useDonation } from "@/presentation/hooks/useDonation";
import { DonationModal } from "./DonationModal";
import { SupportButton } from "./SupportButton";

interface DonationContextType {
  open: () => void;
  triggerAfterAction: () => void;
}

const DonationContext = createContext<DonationContextType | null>(null);

export function useDonationContext() {
  const context = useContext(DonationContext);
  if (!context) {
    throw new Error(
      "useDonationContext must be used within DonationProvider",
    );
  }
  return context;
}

interface DonationProviderProps {
  children: ReactNode;
  showFloatingButton?: boolean;
}

export function DonationProvider({
  children,
  showFloatingButton = true,
}: DonationProviderProps) {
  const { isOpen, open, close, handleDonate, triggerAfterAction } =
    useDonation({
      autoShowDelay: 180000, // 3 minutes
      maxAutoShows: 2,
    });

  return (
    <DonationContext.Provider value={{ open, triggerAfterAction }}>
      {children}

      {/* Modal */}
      <DonationModal isOpen={isOpen} onClose={close} onDonate={handleDonate} />

      {/* Floating Support Button */}
      {showFloatingButton && <SupportButton onClick={open} variant="floating" />}
    </DonationContext.Provider>
  );
}
