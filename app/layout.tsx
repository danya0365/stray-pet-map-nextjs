import { AuthProvider } from "@/presentation/components/providers/AuthProvider";
import { ThemeProvider } from "@/presentation/components/providers/ThemeProvider";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_Thai } from "next/font/google";
import "../public/styles/index.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-sans-thai",
  subsets: ["thai"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "StrayPetMap — ช่วยให้สัตว์จรมีบ้าน",
  description:
    "แพลตฟอร์มกลางสำหรับโพสต์ตำแหน่งสัตว์จร ค้นหาสัตว์ตามสเปก และเชื่อมคนอยากเลี้ยงกับคนช่วยสัตว์",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://straypetmap.online"), // เปลี่ยนเป็น URL จริงเมื่อขึ้น prod
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "StrayPetMap — ช่วยให้สัตว์จรมีบ้าน",
    description: "แพลตฟอร์มกลางสำหรับโพสต์ตำแหน่งสัตว์จร ค้นหาสัตว์ตามสเปก และเชื่อมคนอยากเลี้ยงกับคนช่วยสัตว์",
    url: "/",
    siteName: "StrayPetMap",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "StrayPetMap — Helpers for stray pets",
      },
    ],
    locale: "th_TH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "StrayPetMap — ช่วยให้สัตว์จรมีบ้าน",
    description: "แพลตฟอร์มกลางสำหรับโพสต์ตำแหน่งสัตว์จร ค้นหาสัตว์ตามสเปก และเชื่อมคนอยากเลี้ยงกับคนช่วยสัตว์",
    images: ["/og-image.svg"],
  },
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${geistSans.variable} ${geistMono.variable} ${notoSansThai.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
