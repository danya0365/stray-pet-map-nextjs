import React from "react";
import Image from "next/image";

export default function BrandShowcasePage() {
  return (
    <div className="min-h-screen bg-[#fffaf5] p-8 font-sans text-[#3d3533]">
      <div className="mx-auto max-w-4xl space-y-12">
        <header className="space-y-4 text-center">
          <h1 className="text-4xl font-bold text-[#f2845c]">Brand Assets — Stray Pet Map</h1>
          <p className="text-lg text-gray-600">
            ชุดเครื่องมือสำหรับแบรนด์และ SEO เพื่อใช้ในการเปิดตัวโปรเจกต์
          </p>
        </header>

        {/* Logo Section */}
        <section className="space-y-6 rounded-2xl bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold">1. Logo (SVG)</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="flex flex-col items-center space-y-4 rounded-xl border border-dashed border-gray-200 p-6">
              <span className="text-sm font-medium text-gray-500">App Icon / Favicon</span>
              <div className="relative h-32 w-32">
                <Image src="/logo.svg" alt="Stray Pet Map Logo" fill className="object-contain" />
              </div>
              <code className="rounded bg-gray-100 px-2 py-1 text-xs">/public/logo.svg</code>
            </div>
            <div className="flex flex-col justify-center space-y-4">
              <p className="text-gray-600">
                โลโก้หลักในรูปแบบ SVG ที่มีความคมชัดสูง ปรับขนาดได้ไม่จำกัด (Scalable) เหมาะสำหรับใช้ในเว็บ แอป และสื่อสิ่งพิมพ์
              </p>
              <ul className="list-inside list-disc space-y-1 text-sm text-gray-500">
                <li>ใช้สี Coral (#f2845c) เป็นสีหลัก</li>
                <li>สัดส่วน 1:1 เหมาะสำหรับ App Icon</li>
              </ul>
            </div>
          </div>
        </section>

        {/* SEO / OG Image Section */}
        <section className="space-y-6 rounded-2xl bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold">2. SEO / Open Graph Image</h2>
          <div className="space-y-4">
            <div className="relative aspect-[1.91/1] w-full overflow-hidden rounded-xl border border-gray-100">
              <Image src="/og-image.svg" alt="SEO Preview" fill className="object-cover" />
            </div>
            <div className="flex flex-col space-y-2">
              <p className="text-gray-600">
                รูปสำหรับ Social Preview (Facebook, Twitter, Line) ขนาดมาตรฐาน 1200x630px
              </p>
              <code className="w-fit rounded bg-gray-100 px-2 py-1 text-xs">/public/og-image.svg</code>
            </div>
          </div>
        </section>

        {/* Color Palette */}
        <section className="space-y-6 rounded-2xl bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold">3. Color Palette</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <div className="h-20 rounded-lg bg-[#f2845c]"></div>
              <div className="text-center">
                <div className="font-medium text-sm">Primary (Coral)</div>
                <div className="text-xs text-gray-500">#f2845c</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-20 rounded-lg bg-[#7ecec0]"></div>
              <div className="text-center">
                <div className="font-medium text-sm">Secondary (Mint)</div>
                <div className="text-xs text-gray-500">#7ecec0</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-20 rounded-lg bg-[#f9b4c2]"></div>
              <div className="text-center">
                <div className="font-medium text-sm">Accent (Pink)</div>
                <div className="text-xs text-gray-500">#f9b4c2</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-20 rounded-lg bg-[#3d3533]"></div>
              <div className="text-center">
                <div className="font-medium text-sm">Foreground</div>
                <div className="text-xs text-gray-500">#3d3533</div>
              </div>
            </div>
          </div>
        </section>

        <footer className="pt-8 text-center text-sm text-gray-500">
          <p>สร้างโดย Antigravity • พร้อมสำหรับ Production แล้วครับ 🚀</p>
        </footer>
      </div>
    </div>
  );
}
