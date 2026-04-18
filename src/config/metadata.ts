/**
 * Metadata Configuration for StrayPetMap
 * Centralized SEO and Open Graph settings
 */

import type { Metadata } from "next";
import type { OpenGraph } from "next/dist/lib/metadata/types/opengraph-types";
import type { Twitter } from "next/dist/lib/metadata/types/twitter-types";

// Site Configuration
export const SITE_CONFIG = {
  name: "StrayPetMap",
  title: "StrayPetMap - ช่วยให้สัตว์มีบ้าน",
  description:
    "แพลตฟอร์มแผนที่สัตว์จร จัดโดยคนไทย เพื่อคนไทย - ช่วยให้สัตว์จรได้มีบ้านและได้รับการดูแล",
  url: "https://straypetmap.com",
  ogImage: "/images/og-default.png",
  locale: "th_TH",
  twitterHandle: "@straypetmap",
} as const;

// Default Keywords
export const DEFAULT_KEYWORDS = [
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
];

// OG Image Dimensions
export const OG_IMAGE_DIMENSIONS = {
  width: 1200,
  height: 630,
} as const;

/**
 * Create base metadata for any page
 */
export function createBaseMetadata(
  title: string,
  description: string,
  options?: {
    image?: string;
    url?: string;
    keywords?: string[];
    type?: "website" | "article";
  },
): Metadata {
  const imageUrl = options?.image || SITE_CONFIG.ogImage;
  const pageUrl = options?.url
    ? `${SITE_CONFIG.url}${options.url}`
    : SITE_CONFIG.url;

  const openGraph: OpenGraph = {
    title,
    description,
    url: pageUrl,
    siteName: SITE_CONFIG.name,
    images: [
      {
        url: imageUrl,
        width: OG_IMAGE_DIMENSIONS.width,
        height: OG_IMAGE_DIMENSIONS.height,
        alt: title,
      },
    ],
    locale: SITE_CONFIG.locale,
    type: options?.type || "website",
  };

  const twitter: Twitter = {
    card: "summary_large_image",
    title,
    description,
    images: [imageUrl],
    site: SITE_CONFIG.twitterHandle,
  };

  return {
    title,
    description,
    keywords: [...DEFAULT_KEYWORDS, ...(options?.keywords || [])],
    openGraph,
    twitter,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
    alternates: {
      canonical: pageUrl,
    },
  };
}

/**
 * Create metadata for pet detail pages (dynamic)
 */
export function createPetMetadata(
  petTitle: string,
  petDescription: string,
  petImageUrl?: string,
  petUrl?: string,
  petKeywords?: string[],
): Metadata {
  const title = `${petTitle} | ${SITE_CONFIG.name}`;
  const image = petImageUrl || SITE_CONFIG.ogImage;
  const url = petUrl ? `${SITE_CONFIG.url}/pets/${petUrl}` : SITE_CONFIG.url;
  const keywords = [
    "สัตว์หาบ้าน",
    "รับเลี้ยง",
    "adoption",
    ...(petKeywords || []),
  ];

  return createBaseMetadata(title, petDescription, {
    image,
    url,
    keywords,
    type: "article",
  });
}

/**
 * Create metadata for user profile pages
 */
export function createProfileMetadata(
  userName: string,
  userAvatar?: string,
): Metadata {
  const title = `โปรไฟล์ของ ${userName} | ${SITE_CONFIG.name}`;
  const description = `ดูโปรไฟล์และผลงานการช่วยเหลือสัตว์ของ ${userName} บน StrayPetMap`;

  return createBaseMetadata(title, description, {
    image: userAvatar || SITE_CONFIG.ogImage,
    url: "/profile",
    keywords: ["โปรไฟล์", "นักช่วยเหลือ", "Hall of Fame"],
  });
}
