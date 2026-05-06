"use client";

import { DonationProvider } from "../donation/DonationProvider";
import { Footer } from "./Footer";
import { MobileBottomNav } from "./MobileBottomNav";
import { Navbar } from "./Navbar";

interface MainLayoutProps {
  children: React.ReactNode;
  hideFooter?: boolean;
  hideNavbar?: boolean;
}

export function MainLayout({
  children,
  hideFooter = false,
  hideNavbar = false,
}: MainLayoutProps) {
  return (
    <DonationProvider showFloatingButton={false}>
      <div className="flex min-h-screen flex-col">
        {/* Desktop Header */}
        {!hideNavbar && <Navbar />}

        {/* Main Content - add bottom padding on mobile for bottom nav */}
        <main className="flex-1 pb-16 md:pb-0">{children}</main>

        {/* Desktop Footer */}
        {!hideFooter && <Footer />}

        {/* Mobile Bottom Tab Bar */}
        <MobileBottomNav />
      </div>
    </DonationProvider>
  );
}
