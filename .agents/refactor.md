# Refactor Plan

## API Routes

ผมอยากให้ค่อยๆ อ่านทีละไฟล์ในนี้ /Users/marosdeeuma/stray-pet-map-nextjs/app/api

มันมีกฎการเขียนไว้อยุ่ใน /Users/marosdeeuma/stray-pet-map-nextjs/.agents/skills/create-page/references/CREATE_PAGE_PATTERN.md

ผมอยากให้คุณ ค่อยๆ audit ไฟล์ไหนบ้าง ที่ยังไม่ตรง

โดยหลักๆคือ ต้องเรียก presenter server factory เท่านั้น ห้ามเรียก repo ตรงๆ

ทำสรุปออกมา เดวเราจะค่อยๆไล่แก้ทีละไฟล์ๆๆ

## Pre-Production Checklist

ผมกำลังไล่ refactor ทั้งหมดให้โค้ด ถุกต้องตาม rules ที่เรากำหนด

และให้โค้ดเป็น single sourch of truth

เพราะกำลังเตรียมเอาขึ้น production

ผมเลย อยากให้คุณช่วย audit หน่อย

อยากให้คุณวางแผนจะ audit อย่างไรได้บ้าง
