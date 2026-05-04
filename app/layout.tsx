import { SITE_CONFIG } from "@/config/metadata";
import { SupportBanner } from "@/presentation/components/banner/SupportBanner";
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
  title: {
    default: SITE_CONFIG.title,
    template: "%s | StrayPetMap",
  },
  description: SITE_CONFIG.description,
  keywords: [
    "สัตว์จร",
    "หมาจร",
    "แมวจร",
    "รับเลี้ยงสัตว์",
    "หาบ้านให้สัตว์",
    "ช่วยเหลือสัตว์",
    "แผนที่สัตว์จร",
    "บริจาคสัตว์",
    "adoption",
    "stray pets",
    "Thailand",
  ],
  authors: [{ name: "StrayPetMap Team" }],
  creator: "StrayPetMap",
  publisher: "StrayPetMap",
  metadataBase: new URL(SITE_CONFIG.url),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    images: [
      {
        url: SITE_CONFIG.ogImage,
        width: 1200,
        height: 630,
        alt: SITE_CONFIG.title,
      },
    ],
    locale: SITE_CONFIG.locale,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    images: [SITE_CONFIG.ogImage],
    site: SITE_CONFIG.twitterHandle,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: undefined, // Add Google Search Console verification code here
  },
  icons: {
    icon: "/favicon/favicon.ico",
    shortcut: "/favicon/favicon-16x16.png",
    apple: "/favicon/apple-touch-icon.png",
  },
  manifest: "/favicon/site.webmanifest",
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
          <AuthProvider>
            {children}
            <SupportBanner />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
