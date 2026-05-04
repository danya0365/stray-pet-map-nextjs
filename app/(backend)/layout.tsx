import { BackendLockScreen } from "@/presentation/components/backend/BackendLockScreen";
import { BackendLoginScreen } from "@/presentation/components/backend/BackendLoginScreen";
import { BackendMobileHeader } from "@/presentation/components/backend/BackendMobileHeader";
import { BackendSidebar } from "@/presentation/components/backend/BackendSidebar";
import { createServerAuthPresenter } from "@/presentation/presenters/auth/AuthPresenterServerFactory";

async function getBackendAuth(): Promise<{
  status: "authenticated" | "unauthenticated" | "forbidden";
  userName?: string;
  userRole?: string;
}> {
  const presenter = await createServerAuthPresenter();
  const result = await presenter.getCurrentUser();

  if (!result.success || !result.user) {
    return { status: "unauthenticated" };
  }

  if (!result.profile) {
    return { status: "unauthenticated" };
  }

  const role = result.profile.role;
  const userName = result.profile.fullName ?? result.user.email ?? "";

  if (role !== "admin") {
    return {
      status: "forbidden",
      userName,
      userRole: role,
    };
  }

  return {
    status: "authenticated",
    userName,
    userRole: role,
  };
}

export default async function BackendLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const auth = await getBackendAuth();

  if (auth.status === "unauthenticated") {
    return <BackendLoginScreen />;
  }

  if (auth.status === "forbidden") {
    return (
      <BackendLockScreen
        userName={auth.userName ?? ""}
        userRole={auth.userRole ?? "user"}
      />
    );
  }

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
