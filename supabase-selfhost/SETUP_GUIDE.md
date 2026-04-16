# 📖 คู่มือติดตั้ง Self-Hosted Supabase

> Domain: `supabase.social-generator.vibify.site` | OS: Ubuntu 22.04 | SSL: Caddy (auto)

---

## 📋 สารบัญ

1. [สิ่งที่ต้องเตรียม](#1-สิ่งที่ต้องเตรียม)
2. [ติดตั้งอัตโนมัติ (แนะนำ)](#2-ติดตั้งอัตโนมัติ-แนะนำ)
3. [ติดตั้งแบบ Manual](#3-ติดตั้งแบบ-manual)
4. [ตั้งค่า DNS](#4-ตั้งค่า-dns)
5. [เชื่อม Next.js App](#5-เชื่อม-nextjs-app)
6. [การ Backup & Restore](#6-การ-backup--restore)
7. [การ Update](#7-การ-update)
8. [Troubleshooting](#8-troubleshooting)
9. [Architecture Overview](#9-architecture-overview)

---

## 1. สิ่งที่ต้องเตรียม

### System Requirements (ขั้นต่ำ)

| Resource | Minimum | แนะนำ |
|----------|---------|-------|
| RAM      | 4 GB    | 8 GB+ |
| CPU      | 2 cores | 4 cores+ |
| SSD      | 50 GB   | 80 GB+ |

### สิ่งที่ต้องมี

- VPS running **Ubuntu 22.04**
- **SSH access** (root หรือ sudo)
- **Domain name** ที่ชี้มาที่ VPS IP → `supabase.social-generator.vibify.site`
- Port **80** และ **443** เปิดอยู่

---

## 2. ติดตั้งอัตโนมัติ (แนะนำ)

### Step 1: Upload script ไปยัง VPS

```bash
# จาก local machine
scp supabase-selfhost/setup-supabase.sh root@<VPS_IP>:/root/
scp supabase-selfhost/maintenance.sh root@<VPS_IP>:/root/
```

### Step 2: SSH เข้า VPS และรัน

```bash
ssh root@<VPS_IP>

# ทำให้ script executable
chmod +x setup-supabase.sh maintenance.sh

# รัน installer
sudo ./setup-supabase.sh
```

### Step 3: รอจนเสร็จ (~5-10 นาที)

Script จะทำทุกอย่างให้อัตโนมัติ:
- ✅ ติดตั้ง Docker & Docker Compose
- ✅ Clone Supabase Docker repo
- ✅ Generate secrets ทั้งหมด
- ✅ ตั้งค่า .env
- ✅ ติดตั้ง Caddy (auto SSL)
- ✅ ตั้งค่า Firewall
- ✅ Start Supabase services
- ✅ บันทึก credentials

### Step 4: จด credentials

เมื่อเสร็จ script จะแสดง:
- Dashboard URL
- Username / Password
- API Keys (ANON_KEY, SERVICE_ROLE_KEY)

Credentials ทั้งหมดบันทึกอยู่ที่: `/opt/supabase/.credentials`

```bash
# ดู credentials ทีหลัง
sudo ./maintenance.sh creds
```

---

## 2.1 ติดตั้งบนเครื่องที่มีโปรเจคอื่นอยู่แล้ว (Existing VPS)

> [!IMPORTANT]
> **ใช้กรณีนี้เมื่อ:** VPS ของคุณรันโปรเจคอื่นอยู่แล้ว (เช่น Laravel Sail) และมีการใช้ Port 80/443 ไปแล้ว เพื่อป้องกันไม่ให้เว็บเดิมล่ม

### Step 1: Upload script เฉพาะกิจ
```bash
# จาก local machine
scp supabase-selfhost/setup-supabase-vps-existing.sh maros@<VPS_IP>:~/
```

### Step 2: รัน installer (โหมด VPS เดิม)
```bash
ssh -t maros@<VPS_IP> "chmod +x setup-supabase-vps-existing.sh && sudo ./setup-supabase-vps-existing.sh"
```

### Step 3: ทำ SSL ด้วย Certbot
เนื่องจากเราใช้ Shared Nginx เราต้องรัน Certbot เพื่อขอใบรับรองให้ Domain ใหม่:
```bash
sudo certbot --nginx -d supabase.social-generator.vibify.site
```

---

## 3. ติดตั้งแบบ Manual

> ถ้าต้องการควบคุมทุกขั้นตอนเอง

### 3.1 ติดตั้ง Docker

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install dependencies
sudo apt-get install -y ca-certificates curl gnupg lsb-release

# Add Docker GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
  sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) \
  signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io \
  docker-buildx-plugin docker-compose-plugin

# Start & Enable Docker
sudo systemctl enable docker
sudo systemctl start docker

# Verify
docker --version
docker compose version
```

### 3.2 Clone Supabase

```bash
sudo mkdir -p /opt/supabase
cd /opt

# Clone repo
git clone --depth 1 https://github.com/supabase/supabase

# Copy docker files
cp -rf supabase/docker/* /opt/supabase/
cp supabase/docker/.env.example /opt/supabase/.env

cd /opt/supabase
```

### 3. Database Migration (Push Local Schema to VPS)

To move your local database structure to the VPS:

1. **Open a Secure Tunnel** to the direct database port (54322):
   ```bash
   ssh -L 54322:localhost:54322 maros@95.216.221.18
   ```

2. **Run the Push Command** (Keep the tunnel open!):
   ```bash
   supabase db push --db-url "postgresql://postgres:<POSTGRES_PASSWORD>@127.0.0.1:54322/postgres?sslmode=disable"
   ```

---

## 🔒 Security Best Practices

- **Port 54322**: This port is exposed on the VPS `localhost` only by default in the script. Do NOT open it in UFW/Firewall to the public. Always use an SSH tunnel for migrations.
- **Mixed Content**: The script automatically adds the `Content-Security-Policy` header to fix HTTPS warnings in the Supabase Studio.
- **Credentials**: All secrets are stored in `/opt/supabase/.credentials`. Keep this file secure.
---

## 🛠️ Troubleshooting & Lessons Learned

### 1. หน้าจอ "Not Secure" ทั้งที่ลง SSL แล้ว (Mixed Content)
- **ปัญหา**: หน้าเว็บ HTTPS พยายามโหลดไฟล์ผ่าน HTTP ธรรมดา
- **วิธีแก้**: เพิ่ม Header ใน Nginx: `add_header Content-Security-Policy "upgrade-insecure-requests";` และเช็ก `SITE_URL` ใน `.env`

### 2. WebSocket (Realtime) เชื่อมต่อไม่ได้ (WSS Failed)
- **ปัญหา**: Nginx บล็อกการขอ Upgrade โปรโตคอลเป็น WebSocket
- **วิธีแก้**: เพิ่มคำสั่ง `proxy_http_version 1.1;`, `Upgrade`, และ `Connection` ใน Nginx location block

### 3. `supabase db push` ขึ้นว่า "Tenant not found"
- **ปัญหา**: Port 5432 บน Host ถูกจองโดย Supavisor (Pooler) ซึ่งไม่รับการต่อตรงจาก CLI
- **วิธีแก้**: เปิด Port **54322** ตรงเข้า Container `db` และใช้ SSH Tunnel เชื่อมต่อไปที่หา Port นี้แทน

### 4. ตัวแปรใน `.env` มีปัญหาเวลาใช้ `sed`
- **ปัญหา**: ค่าที่ถูก Generate (เช่น Base64) แอบมี Newline ติดมาด้วย
- **วิธีแก้**: ใช้ `tr -d '\n'` ทุกครั้งหลังจาก Generate Secret เพื่อให้เป็นบรรทัดเดียวเสมอ

---

## 📂 สรุปไฟล์ที่สำคัญ
- `setup-supabase-vps-existing.sh`: สคริปต์ติดตั้งหลัก (รวม Fix ทั้งหมดแล้ว)
- `/opt/supabase/.credentials`: ที่เก็บรหัสผ่านทั้งหมดบน VPS
- `nginx/sites-available/supabase`: คอนฟิก Nginx ที่มีแก้เรื่อง WebSocket และ SSL
### 3.3 Generate Secrets

```bash
# Generate ทีละตัว
echo "POSTGRES_PASSWORD: $(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 32)"
echo "JWT_SECRET: $(openssl rand -base64 48 | tr -dc 'a-zA-Z0-9' | head -c 64)"
echo "SECRET_KEY_BASE: $(openssl rand -base64 48)"
echo "VAULT_ENC_KEY: $(openssl rand -hex 16)"
echo "PG_META_CRYPTO_KEY: $(openssl rand -base64 24)"
echo "DASHBOARD_PASSWORD: $(openssl rand -base64 16 | tr -dc 'a-zA-Z0-9' | head -c 20)"
```

> [!IMPORTANT]
> สำหรับ **ANON_KEY** และ **SERVICE_ROLE_KEY** ให้ใช้ [Supabase Key Generator](https://supabase.com/docs/guides/self-hosting/docker#generate-and-configure-api-keys) หรือ `setup-supabase.sh` ที่ generate ให้อัตโนมัติ

### 3.4 แก้ไข .env

```bash
cd /opt/supabase
nano .env
```

แก้ไขค่าต่อไปนี้:

```env
# Database
POSTGRES_PASSWORD=<generated_password>

# JWT / API Keys
JWT_SECRET=<generated_jwt_secret>
ANON_KEY=<generated_anon_key>
SERVICE_ROLE_KEY=<generated_service_role_key>

# Dashboard Login
DASHBOARD_USERNAME=supabase
DASHBOARD_PASSWORD=<generated_password>

# Secrets
SECRET_KEY_BASE=<generated>
VAULT_ENC_KEY=<generated>
PG_META_CRYPTO_KEY=<generated>

# URLs
SUPABASE_PUBLIC_URL=https://supabase.social-generator.vibify.site
API_EXTERNAL_URL=https://supabase.social-generator.vibify.site
SITE_URL=https://social-generator.vibify.site
```

### 3.5 ติดตั้ง Caddy

```bash
sudo apt-get install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | \
  sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | \
  sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt-get update
sudo apt-get install -y caddy
```

สร้าง Caddyfile:

```bash
sudo nano /etc/caddy/Caddyfile
```

```caddyfile
supabase.social-generator.vibify.site {
    reverse_proxy localhost:8000
}
```

```bash
sudo systemctl enable caddy
sudo systemctl restart caddy
```

> Caddy จะ request SSL certificate จาก Let's Encrypt อัตโนมัติ ไม่ต้องทำอะไรเพิ่ม!

### 3.7 การเข้าถึงแบบปลอดภัยด้วย SSH Tunnel (แนะนำ)

เพื่อความปลอดภัยสูงสุด คุณสามารถใช้ SSH Tunnel เพื่อเข้าจัดการฐานข้อมูลและ Studio โดยตรงจากเครื่อง Local โดยไม่ต้องผ่าน Internet:

```bash
# รันที่เครื่อง Local ของคุณ
ssh -L 8000:localhost:8000 root@<VPS_IP>
```

หลังจากนั้นเปิด Browser ไปที่: `http://localhost:8000`

---

```bash
cd /opt/supabase
docker compose pull
docker compose up -d

# รอ ~30 วินาที แล้วเช็คสถานะ
docker compose ps
```

---

## 4. ตั้งค่า DNS

ที่ DNS provider ของคุณ (Cloudflare, Namecheap, etc.) สร้าง **A Record**:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A    | `supabase.social-generator` | `<VPS_IP>` | Auto |

> [!WARNING]
> ถ้าใช้ **Cloudflare**: ตั้ง Proxy status เป็น **DNS only** (ไอคอนเมฆสีเทา) ไม่ใช่ Proxied
> เพราะ Caddy ต้องการ direct connection เพื่อ provision SSL certificate

### ตรวจสอบ DNS

```bash
# จาก VPS หรือ local machine
dig supabase.social-generator.vibify.site +short
# ควรแสดง VPS IP

# หรือ
nslookup supabase.social-generator.vibify.site
```

---

## 5. เชื่อม Next.js App

### Step 1: อัพเดท .env ของ Next.js

แก้ไข `.env.production` หรือ `.env.local`:

```env
# เปลี่ยนจาก Supabase Cloud → Self-Hosted
NEXT_PUBLIC_SUPABASE_URL="https://supabase.social-generator.vibify.site"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<ANON_KEY จาก /opt/supabase/.credentials>"
SUPABASE_SERVICE_ROLE_KEY="<SERVICE_ROLE_KEY จาก /opt/supabase/.credentials>"
```

### Step 2: อัพเดท GitHub Secrets

ไปที่ GitHub → Repository → Settings → Secrets → Actions:

| Secret Name | Value |
|-------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://supabase.social-generator.vibify.site` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `<ANON_KEY>` |
| `SUPABASE_SERVICE_ROLE_KEY` | `<SERVICE_ROLE_KEY>` |

### Step 3: Migrate ข้อมูล (ถ้าต้องการ)

ถ้าต้องการย้ายข้อมูลจาก Supabase Cloud:

```bash
# Export จาก Supabase Cloud (ใน Supabase Dashboard → Settings → Database)
# Download backup file

# Import เข้า Self-Hosted
cat backup.sql | docker exec -i $(docker compose ps -q db) \
  psql -U supabase_admin -d postgres
```

### Step 4: Deploy & Test

```bash
# ทดสอบ API
curl -s https://supabase.social-generator.vibify.site/rest/v1/ \
  -H "apikey: <ANON_KEY>" \
  -H "Authorization: Bearer <ANON_KEY>"
```

---

## 6. การ Backup & Restore

### Backup ด้วยมือ

```bash
sudo ./maintenance.sh backup
# Backup จะอยู่ที่ /opt/supabase-backups/
```

### ตั้ง Auto Backup (วันละครั้ง 03:00 AM)

```bash
sudo ./maintenance.sh setup-cron
```

### Restore

```bash
sudo ./maintenance.sh restore
# จะแสดงรายการ backup ให้เลือก
```

---

## 7. การ Update

```bash
sudo ./maintenance.sh update
# Script จะ:
# 1. ถามว่าจะ backup ก่อนไหม
# 2. Pull Supabase repo ใหม่
# 3. Pull Docker images ใหม่
# 4. Restart services
# 5. ถามว่าจะลบ images เก่าไหม
```

---

## 8. Troubleshooting

### Container ไม่ขึ้น

```bash
# ดู logs ของ service ที่มีปัญหา
docker compose logs <service_name>

# เช่น
docker compose logs auth
docker compose logs rest
docker compose logs db
```

### SSL ไม่ทำงาน

```bash
# 1. เช็คว่า DNS ชี้มาถูกต้อง
dig supabase.social-generator.vibify.site +short

# 2. เช็ค Caddy logs
sudo journalctl -u caddy --no-pager -n 50

# 3. เช็คว่า port 80/443 เปิด
sudo ufw status

# 4. Restart Caddy
sudo systemctl restart caddy
```

### Database connection refused

```bash
# เช็ค database container
docker compose logs db

# Restart database
docker compose restart db
```

### Health Check

```bash
sudo ./maintenance.sh health
```

### Disk เต็ม

```bash
# ลบ Docker images ที่ไม่ใช้
docker system prune -a

# ลบ backup เก่า
ls -la /opt/supabase-backups/
```

---

## 9. Architecture Overview

```
                    Internet
                       │
                       ▼
              ┌─────────────────┐
              │   Caddy (443)   │  ← Auto SSL (Let's Encrypt)
              │  Reverse Proxy  │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │  Kong (8000)    │  ← API Gateway
              │  API Gateway    │
              └────────┬────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
   ┌─────────┐  ┌───────────┐  ┌──────────┐
   │  Auth   │  │ PostgREST │  │ Storage  │
   │ (GoTrue)│  │  (REST)   │  │          │
   └────┬────┘  └─────┬─────┘  └────┬─────┘
        │              │              │
        └──────────────┼──────────────┘
                       │
                       ▼
              ┌─────────────────┐
              │   PostgreSQL    │  ← Database
              │    (5432)       │
              └─────────────────┘
```

### Port Summary

| Port | Service | เข้าถึงจากภายนอก |
|------|---------|:-:|
| 443  | Caddy (HTTPS) | ✅ |
| 80   | Caddy (HTTP → redirect) | ✅ |
| 8000 | Kong API Gateway | ❌ (ผ่าน Caddy เท่านั้น) |
| 5432 | PostgreSQL | ❌ |
| 6543 | Supavisor (pooled) | ❌ |

### Maintenance Commands (สรุป)

| Command | Description |
|---------|-------------|
| `sudo ./maintenance.sh status` | ดูสถานะ services |
| `sudo ./maintenance.sh health` | ตรวจสอบ API health |
| `sudo ./maintenance.sh restart` | restart ทุก services |
| `sudo ./maintenance.sh logs` | ดู logs |
| `sudo ./maintenance.sh backup` | backup database |
| `sudo ./maintenance.sh update` | อัพเดท Supabase |
| `sudo ./maintenance.sh creds` | ดู credentials |

---

> **📝 Note:** ไฟล์ credentials อยู่ที่ `/opt/supabase/.credentials` สำคัญมาก ห้ามแชร์!
