import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { BackendLockScreen } from "@/presentation/components/backend/BackendLockScreen";
import { BackendLoginScreen } from "@/presentation/components/backend/BackendLoginScreen";
import { BackendMobileHeader } from "@/presentation/components/backend/BackendMobileHeader";
import { BackendSidebar } from "@/presentation/components/backend/BackendSidebar";

async function getBackendAuth(): Promise<{
  status: "authenticated" | "unauthenticated" | "forbidden";
  userName?: string;
  userRole?: string;
}> {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { status: "unauthenticated" };

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("auth_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: true })
      .limit(1)
      .single();

    if (!profile) return { status: "unauthenticated" };

    const { data: roleData } = await supabase
      .from("profile_roles")
      .select("role")
      .eq("profile_id", profile.id)
      .single();

    const role = roleData?.role ?? "user";

    if (role !== "admin") {
      return {
        status: "forbidden",
        userName: profile.full_name ?? user.email ?? "",
        userRole: role,
      };
    }

    return {
      status: "authenticated",
      userName: profile.full_name ?? "",
      userRole: role,
    };
  } catch {
    return { status: "unauthenticated" };
  }
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
