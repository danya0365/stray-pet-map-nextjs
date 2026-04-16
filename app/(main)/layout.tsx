import { MainLayout } from "@/presentation/components/layout/MainLayout";

export default function MainRouteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <MainLayout>{children}</MainLayout>;
}
