import { BackendMobileHeader } from "@/presentation/components/backend/BackendMobileHeader";
import { BackendSidebar } from "@/presentation/components/backend/BackendSidebar";

export default function BackendLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <BackendSidebar />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <BackendMobileHeader />

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl p-4 lg:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
