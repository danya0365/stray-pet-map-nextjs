/**
 * FB Group Scraper — StrayPetMap
 * ==============================
 * ดึงโพสต์จาก Facebook Public Group → Insert เข้า Supabase
 * รูปภาพ upload เข้า Supabase Storage (bucket: scraped-images)
 *
 * Prerequisites:
 *   yarn add -D tsx dotenv playwright
 *   npx playwright install chromium
 *
 * Usage:
 *   yarn scrape:fb                         # default (headless=false, max=99999)
 *   yarn scrape:fb --headless              # ซ่อน browser
 *   yarn scrape:fb --max-posts=50          # จำกัดจำนวนโพสต์
 *   yarn scrape:fb --scroll-delay=5000     # หน่วง scroll (ms)
 */

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { chromium, type Page } from "playwright";

// ============================================================
// Types
// ============================================================
interface ScrapedPost {
  content: string;
  authorName: string;
  postedAt: string | null;
  sourceUrl: string;
  imageUrls: string[];
}

interface ScraperConfig {
  fbGroupUrl: string;
  scrollDelayMs: number;
  maxPosts: number;
  headless: boolean;
  maxNoChange: number;
  storageBucket: string;
}

// ============================================================
// CLI Argument Parser
// ============================================================
function parseCliNumber(name: string, defaultValue: number): number {
  const arg = process.argv.find((a) => a.startsWith(`${name}=`));
  if (!arg) return defaultValue;
  const val = parseInt(arg.split("=")[1], 10);
  return isNaN(val) ? defaultValue : val;
}

function parseCliFlag(name: string): boolean {
  return process.argv.includes(name);
}

// ============================================================
// Config
// ============================================================
const config: ScraperConfig = {
  fbGroupUrl: "https://www.facebook.com/groups/217672018379895/",
  scrollDelayMs: parseCliNumber("--scroll-delay", 3000),
  maxPosts: parseCliNumber("--max-posts", 99999),
  headless: parseCliFlag("--headless"),
  maxNoChange: 5,
  storageBucket: "scraped-images",
};

// ============================================================
// Supabase Client (service_role — bypasses RLS)
// ============================================================
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env",
  );
  console.error("   ตรวจสอบไฟล์ .env ที่ root ของโปรเจค");
  process.exit(1);
}

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ============================================================
// Helpers
// ============================================================

/**
 * Extract Facebook post ID from URL
 * ใช้ regex หลาย pattern รองรับ URL หลายรูปแบบ
 * fallback เป็น MD5 hash ของ URL
 */
function extractPostId(url: string): string {
  if (!url) return "";
  const match =
    url.match(/\/posts\/(\d+)/) ||
    url.match(/permalink\/(\d+)/) ||
    url.match(/[?&]story_fbid=(\d+)/);
  return match
    ? match[1]
    : crypto.createHash("md5").update(url).digest("hex").slice(0, 16);
}

/**
 * Download image จาก URL แล้ว upload เข้า Supabase Storage
 * @returns public URL ของรูปที่ upload แล้ว หรือ null ถ้าล้มเหลว
 */
async function downloadAndUploadImage(
  imageUrl: string,
  fbPostId: string,
  index: number,
): Promise<string | null> {
  try {
    const response = await fetch(imageUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      console.warn(
        `  ⚠️  Image fetch failed (${response.status}): ${imageUrl.slice(0, 60)}...`,
      );
      return null;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const storagePath = `fb/${fbPostId}/${index}.jpg`;

    const { error } = await supabase.storage
      .from(config.storageBucket)
      .upload(storagePath, buffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (error) {
      console.warn(`  ⚠️  Storage upload failed: ${error.message}`);
      return null;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(config.storageBucket).getPublicUrl(storagePath);

    return publicUrl;
  } catch (err) {
    console.warn(`  ⚠️  Image download failed: ${(err as Error).message}`);
    return null;
  }
}

// ============================================================
// Page Extraction — ดึงข้อมูลโพสต์จากหน้า FB
// ============================================================
async function extractPostsFromPage(page: Page): Promise<ScrapedPost[]> {
  return page.evaluate(() => {
    const results: Array<{
      content: string;
      authorName: string;
      postedAt: string | null;
      sourceUrl: string;
      imageUrls: string[];
    }> = [];

    // FB render โพสต์ใน div ที่มี role="article"
    const articles = document.querySelectorAll('[role="article"]');

    articles.forEach((article) => {
      try {
        // ── ข้อความ / caption ────────────────────────
        const textEl =
          article.querySelector('[data-ad-comet-preview="message"]') ||
          article.querySelector('[data-ad-preview="message"]') ||
          article.querySelector(".xdj266r") ||
          article.querySelector("div[dir='auto']");
        const content = (textEl as HTMLElement)?.innerText?.trim() || "";

        // ── ชื่อผู้โพสต์ ─────────────────────────────
        const authorEl =
          article.querySelector("h2 a") ||
          article.querySelector("h3 a") ||
          article.querySelector("h4 a") ||
          article.querySelector('[data-testid="post_author_name"]');
        const authorName = (authorEl as HTMLElement)?.innerText?.trim() || "";

        // ── วันที่โพสต์ ──────────────────────────────
        const timeEl =
          article.querySelector("abbr[data-utime]") ||
          article.querySelector("a > abbr");
        let postedAt: string | null = null;
        if (timeEl) {
          const utime = timeEl.getAttribute("data-utime");
          postedAt = utime
            ? new Date(parseInt(utime) * 1000).toISOString()
            : timeEl.getAttribute("title") || (timeEl as HTMLElement).innerText;
        }

        // ── URL โพสต์ ────────────────────────────────
        const linkEl =
          article.querySelector('a[href*="/posts/"]') ||
          article.querySelector('a[href*="permalink"]') ||
          article.querySelector('a[href*="story_fbid"]');
        const sourceUrl = (linkEl as HTMLAnchorElement)?.href || "";

        // ── รูปภาพ ───────────────────────────────────
        const imgEls = article.querySelectorAll("img[src]");
        const imageUrls: string[] = [];
        imgEls.forEach((img) => {
          const src = (img as HTMLImageElement).src;
          // กรอง avatar, emoji, reaction icon ออก
          if (
            src &&
            src.startsWith("https://") &&
            !src.includes("emoji") &&
            !src.includes("reaction") &&
            !src.includes("rsrc.php") &&
            (img as HTMLImageElement).width > 100
          ) {
            imageUrls.push(src);
          }
        });

        if (content || imageUrls.length > 0) {
          results.push({
            content,
            authorName,
            postedAt,
            sourceUrl,
            imageUrls,
          });
        }
      } catch (_) {
        // skip broken article
      }
    });

    return results;
  });
}

// ============================================================
// Dismiss Popups — ปิด popup login / cookie ที่ FB แสดง
// ============================================================
async function dismissPopups(page: Page): Promise<void> {
  const selectors = [
    '[aria-label="Close"]',
    '[aria-label="ปิด"]',
    '[data-testid="cookie-policy-manage-dialog-accept-button"]',
    'div[role="dialog"] [aria-label="Close"]',
    'div[role="dialog"] [aria-label="ปิด"]',
  ];

  for (const selector of selectors) {
    try {
      const btn = page.locator(selector).first();
      if (await btn.isVisible({ timeout: 2000 })) {
        await btn.click();
        await page.waitForTimeout(500);
      }
    } catch (_) {
      // ignore
    }
  }
}

// ============================================================
// Main Scraper
// ============================================================
async function scrape(): Promise<void> {
  console.log("🚀 Starting Facebook Group Scraper — StrayPetMap");
  console.log(`📌 Group: ${config.fbGroupUrl}`);
  console.log(
    `⚙️  Config: max=${config.maxPosts} | headless=${config.headless} | delay=${config.scrollDelayMs}ms`,
  );
  console.log(`📦 Supabase: ${supabaseUrl}`);
  console.log("");

  // ── Ensure storage bucket exists ──────────────────────────
  const { error: bucketError } = await supabase.storage.createBucket(
    config.storageBucket,
    {
      public: true,
      allowedMimeTypes: ["image/*"],
    },
  );
  if (bucketError && !bucketError.message.includes("already exists")) {
    console.warn(`⚠️  Storage bucket warning: ${bucketError.message}`);
  }

  // ── Launch browser ────────────────────────────────────────
  const browser = await chromium.launch({
    headless: config.headless,
    args: [
      "--lang=th-TH,en-US",
      "--disable-blink-features=AutomationControlled",
    ],
  });

  const context = await browser.newContext({
    locale: "th-TH",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    viewport: { width: 1280, height: 900 },
  });

  const page = await context.newPage();

  // ── Navigate to group ─────────────────────────────────────
  console.log("📂 Opening Facebook group...");
  await page.goto(config.fbGroupUrl, {
    waitUntil: "networkidle",
    timeout: 60_000,
  });
  await page.waitForTimeout(3000);

  // ── Dismiss popups ────────────────────────────────────────
  await dismissPopups(page);

  // ── Scroll & collect loop ─────────────────────────────────
  let totalInserted = 0;
  let lastHeight = 0;
  let noChangeCount = 0;
  const processedFbIds = new Set<string>();

  console.log("🔄 Scrolling and collecting posts...\n");

  while (totalInserted < config.maxPosts) {
    // ── Extract posts from current page ──────────────────────
    const posts = await extractPostsFromPage(page);

    for (const post of posts) {
      if (totalInserted >= config.maxPosts) break;

      const fbPostId =
        extractPostId(post.sourceUrl) ||
        `no-id-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      // Skip ถ้าประมวลผลแล้วใน session นี้
      if (processedFbIds.has(fbPostId)) continue;
      processedFbIds.add(fbPostId);

      // ── Check duplicate in DB ──────────────────────────────
      const { data: existing } = await supabase
        .from("fb_scraped_posts")
        .select("id")
        .eq("fb_post_id", fbPostId)
        .maybeSingle();

      if (existing) continue;

      // ── Upload images to Supabase Storage ──────────────────
      const storageUrls: string[] = [];
      for (let i = 0; i < post.imageUrls.length; i++) {
        const publicUrl = await downloadAndUploadImage(
          post.imageUrls[i],
          fbPostId,
          i,
        );
        if (publicUrl) storageUrls.push(publicUrl);
      }

      // ── Insert into Supabase ───────────────────────────────
      const { error } = await supabase.from("fb_scraped_posts").insert({
        fb_post_id: fbPostId,
        author_name: post.authorName || null,
        content: post.content || null,
        posted_at: post.postedAt || null,
        source_url: post.sourceUrl || null,
        image_urls: post.imageUrls,
        storage_urls: storageUrls,
      });

      if (error) {
        if (error.code === "23505") {
          // duplicate key — ข้ามไป
        } else {
          console.error(`  ❌ Insert error: ${error.message}`);
        }
      } else {
        totalInserted++;
        const imgInfo = `${storageUrls.length}/${post.imageUrls.length} รูป`;
        console.log(
          `  ✅ [${totalInserted}] ${post.authorName || "Unknown"} | ${post.postedAt || "-"} | ${imgInfo}`,
        );
        console.log(
          `     ${post.content?.slice(0, 80) || "(ไม่มีข้อความ)"}...`,
        );
      }
    }

    // ── Scroll ลงไปโหลดเพิ่ม ──────────────────────────────
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(config.scrollDelayMs);

    const newHeight = await page.evaluate(() => document.body.scrollHeight);

    if (newHeight === lastHeight) {
      noChangeCount++;
      console.log(
        `\n⏳ No new content loaded (${noChangeCount}/${config.maxNoChange})...`,
      );
      if (noChangeCount >= config.maxNoChange) {
        console.log("\n✅ Reached end of group feed. Stopping.");
        break;
      }
      // รอนานขึ้นก่อน retry
      await page.waitForTimeout(config.scrollDelayMs * 2);
    } else {
      noChangeCount = 0;
      lastHeight = newHeight;
      console.log(`\n📜 Scrolled — Total inserted: ${totalInserted}`);
    }

    // ── Try dismiss popups that may reappear ──
    await dismissPopups(page);
  }

  // ── Cleanup ───────────────────────────────────────────────
  await browser.close();

  console.log("\n" + "=".repeat(50));
  console.log(`🎉 Done! Total posts inserted: ${totalInserted}`);
  console.log(`📦 Storage bucket: ${config.storageBucket}`);
  console.log(`📊 Total FB IDs seen: ${processedFbIds.size}`);
  console.log("=".repeat(50));
}

// ── Entry point ─────────────────────────────────────────────
scrape().catch((err) => {
  console.error("💥 Fatal error:", err);
  process.exit(1);
});
