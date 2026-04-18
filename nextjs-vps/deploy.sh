#!/bin/bash
# ============================================
# 🚀 Next.js Lightweight Deploy Script (CI/CD)
# ============================================
# ใช้สำหรับ Update แอปผ่าน GitHub Actions
# ไม่ยุ่งกับ Nginx หรือ Cron (สมมติว่า Setup ครั้งแรกไปแล้ว)
# 
# วิธีใช้:
#   BUILD_COMMIT_SHA=xxx ./deploy.sh
# ============================================

set -euo pipefail

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[✓]${NC} $1"; }

# 1. Sync Environment System
log_info "Syncing environment from source of truth..."
if [ -f "nextjs-vps/.env.production.vps" ]; then
    cp nextjs-vps/.env.production.vps nextjs-vps/.env.production
elif [ -f ".env.production.vps" ]; then
    cp .env.production.vps nextjs-vps/.env.production
fi

ENV_FILE="nextjs-vps/.env.production"

# 2. Bake BUILD_COMMIT_SHA
if [ -n "${BUILD_COMMIT_SHA:-}" ]; then
    log_info "Baking BUILD_COMMIT_SHA: $BUILD_COMMIT_SHA"
    sed -i "/^BUILD_COMMIT_SHA=/d" "$ENV_FILE"
    echo "BUILD_COMMIT_SHA=$BUILD_COMMIT_SHA" >> "$ENV_FILE"
fi

# 3. Read existing config (Assume setup-nextjs.sh was run once)
if grep -q "^APP_PORT=" "$ENV_FILE"; then
    APP_PORT=$(grep "^APP_PORT=" "$ENV_FILE" | cut -d '=' -f2)
else
    log_info "APP_PORT not found, using default 3005"
    APP_PORT=3005
fi

# 4. Build & Restart
log_info "Rebuilding and restarting Docker containers..."
cd nextjs-vps
export APP_PORT
docker compose build
docker compose up -d

log_success "Deployment complete! App is running on port $APP_PORT"
