# Next.js App VPS Deployment Guide 🚀

คู่มือนี้สำหรับติดตั้งแอป Next.js AI Content Creator บน VPS โดยแยกเป็นอิสระจาก Supabase (Portable)

## 📁 โครงสร้างไฟล์
- `Dockerfile`: สำหรับ Build แอปแบบ Standalone (ขนาดเล็กและเร็ว)
- `docker-compose.yml`: สำหรับรันคอนเทนเนอร์
- `setup-nextjs-vps-existing.sh`: สำหรับ VPS ที่มี Nginx/Laravel อยู่แล้ว
- `setup-nextjs.sh`: สำหรับ VPS ใหม่เอี่ยม (ใช้ Caddy SSL)

---

## 🛠️ ขั้นตอนการติดตั้ง

1. **เตรียม Environment:**
   ก๊อปปี้โฟลเดอร์ `nextjs-vps/` ไปไว้ในที่ๆ คุณต้องการบน VPS (เช่น `/opt/nextjs-ai-creator`)

2. **เลือกสคริปต์ที่เหมาะสม:**
   - ถ้าเป็น VPS เดิม: `sudo ./setup-nextjs-vps-existing.sh`
   - ถ้าเป็น VPS ใหม่: `sudo ./setup-nextjs.sh`

3. **ตั้งค่า .env.production:**
   เมื่อรันสคริปต์เสร็จ ให้ตรวจสอบไฟล์ `.env.production` และใส่ค่าที่จำเป็น:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-domain.com
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   GEMINI_API_KEY=your-gemini-key
   CRON_SECRET=generated-by-script
   ```

4. **Restart App:**
   ```bash
   docker compose up -d --build
   ```

---

## ⏰ ระบบ Cron Job (Scheduler)

สคริปต์จะทำการติดตั้ง Cron Job ให้โดยอัตโนมัติในเครื่อง VPS:
`* * * * * curl -s -H "x-cron-secret: <SECRET>" http://localhost:3000/api/cron/run >/dev/null 2>&1`

### วิธีตรวจสอบ Cron:
- ดูรายการ Cron: `crontab -l`
- ตรวจสอบว่าระบบทำงานไหม: ดู Log ของ Docker `docker compose logs -f nextjs-app`

---

## 🔒 ความปลอดภัย (Security)
- **CRON_SECRET**: ถูกสร้างมาเพื่อให้เฉพาะเครื่อง VPS เท่านั้นที่เรียก API Cron ได้ ป้องกันคนนอกมารัน AI เล่นแล้วเสียเงิน
- **Port 3000**: ถูกซ่อนไว้หลัง Nginx/Caddy เพื่อความปลอดภัย
