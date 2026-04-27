# ขั้นตอนการเทส Google Login บน Local Dev

สร้าง Google OAuth credentials และตั้งค่า Supabase local ให้พร้อมเทส Google Sign In

## แผนการทำงาน

### 1. สร้าง OAuth 2.0 Credentials ใน Google Cloud Console

1. ไปที่ https://console.cloud.google.com/apis/credentials
2. Click **Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: `StrayPetMap Local`
5. Authorized redirect URIs:
   - `http://127.0.0.1:54321/auth/v1/callback` (Supabase local)
6. Click **Create** →  copy **Client ID** และ **Client Secret**

### 2. เพิ่มค่าใน `.env.local`

```env
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=your-client-id-from-google
SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=your-client-secret-from-google
```

### 3. Restart Supabase Local

```bash
supabase stop
supabase start
```

### 4. เทส Google Login

1. เปิด http://localhost:3000/auth/login
2. Click **เข้าสู่ระบบด้วย Google**
3. เลือกบัญชี Google → ควร redirect กลับมาและ login สำเร็จ

### 5. ถ้า redirect URL ไม่ตรง

ตรวจสอบ `site_url` และ `additional_redirect_urls` ใน `supabase/config.toml`:
- `site_url` ต้องตรงกับ URL ที่ app รัน (เช่น `http://localhost:3000`)
- `additional_redirect_urls` ต้องมี callback URL ของ Supabase local

### Production

สำหรับ production ต้อง:
1. ไปตั้งค่าที่ Supabase Dashboard → Authentication → Providers → Google
2. ใส่ Client ID และ Secret เดียวกัน
3. เพิ่ม redirect URL: `https://straypetmap.online/auth/callback`
4. ใน Google Cloud Console เพิ่ม Authorized redirect URI:
   `https://<project-ref>.supabase.co/auth/v1/callback`
