"use client";

import { useDonation } from "@/presentation/hooks/useDonation";
import { createContext, ReactNode, useContext, useState } from "react";
import { DonationModal } from "./DonationModal";
import { SupportButton } from "./SupportButton";

interface DonationContextType {
  open: () => void;
  triggerAfterAction: () => void;
  openForPet: (petPostId: string, petName: string) => void;
}

const DonationContext = createContext<DonationContextType | null>(null);

export function useDonationContext() {
  const context = useContext(DonationContext);
  if (!context) {
    throw new Error("useDonationContext must be used within DonationProvider");
  }
  return context;
}

interface DonationProviderProps {
  children: ReactNode;
  showFloatingButton?: boolean;
  // Optional: user info if logged in
  userDisplayName?: string;
  userEmail?: string;
  isGuest?: boolean;
}

export function DonationProvider({
  children,
  showFloatingButton = true,
  userDisplayName,
  userEmail,
  isGuest = true,
}: DonationProviderProps) {
  const { isOpen, open, close, handleDonate, triggerAfterAction } = useDonation(
    {
      autoShowDelay: 180000, // 3 minutes
      maxAutoShows: 2,
    },
  );

  // State for pet-specific donation
  const [petContext, setPetContext] = useState<{
    petPostId?: string;
    petName?: string;
  }>({});

  const openForPet = (petPostId: string, petName: string) => {
    setPetContext({ petPostId, petName });
    open();
  };

  // Wrapper to handle donation with optional pet context
  const handleDonateWithContext = async (
    params: Parameters<typeof handleDonate>[0],
  ) => {
    await handleDonate({
      ...params,
      petPostId: petContext.petPostId || params.petPostId,
    });
  };

  return (
    <DonationContext.Provider value={{ open, triggerAfterAction, openForPet }}>
      {children}

      {/* Modal */}
      <DonationModal
        isOpen={isOpen}
        onClose={close}
        onDonate={handleDonateWithContext}
        petPostId={petContext.petPostId}
        petName={petContext.petName}
        userDisplayName={userDisplayName}
        userEmail={userEmail}
        isGuest={isGuest}
      />

      {/* Floating Support Button */}
      {showFloatingButton && (
        <SupportButton onClick={open} variant="floating" />
      )}
    </DonationContext.Provider>
  );
}
