#!/bin/bash
# ============================================
# 🚀 Next.js App Setup Script (Existing VPS Mode)
# ============================================
# สำหรับเครื่องที่มี Nginx และ Docker อยู่แล้ว
# 
# วิธีใช้:
#   chmod +x setup-nextjs-vps-existing.sh
#   sudo ./setup-nextjs-vps-existing.sh
# ============================================

set -euo pipefail

# ==========================================
# Configuration — อัตโนมัติเกือบทั้งหมด
# ==========================================
APP_DOMAIN="social-generator.vibify.site"
# สร้าง Project ID จาก Domain (เช่น social-generator)
PROJECT_ID=$(echo "$APP_DOMAIN" | cut -d'.' -f1)
INSTALL_DIR="/opt/nextjs-${PROJECT_ID}"
NGINX_CONF_NAME="nextjs-${PROJECT_ID}"
CONTAINER_NAME="nextjs-${PROJECT_ID}-app"

# ==========================================
# Colors & Helpers
# ==========================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[✓]${NC} $1"; }
log_warn()    { echo -e "${YELLOW}[⚠]${NC} $1"; }
log_error()   { echo -e "${RED}[✗]${NC} $1"; }
log_step()    { echo -e "\n${CYAN}============================================${NC}"; echo -e "${CYAN}  $1${NC}"; echo -e "${CYAN}============================================${NC}"; }

# Check if port is in use
is_port_busy() {
    netstat -tuln | grep -q ":$1 "
}

# Find next available port
find_free_port() {
    local port=$1
    while is_port_busy "$port"; do
        log_warn "Port $port is busy, trying next..."
        port=$((port + 1))
    done
    echo "$port"
}

# ==========================================
# Pre-flight checks
# ==========================================
if [ "$EUID" -ne 0 ]; then
    log_error "กรุณารัน script ด้วย sudo"
    exit 1
fi

# ==========================================
# Step 1: Prepare Environment
# ==========================================
setup_env() {
    log_step "Step 1: Setting up environment & Dynamic Ports"
    
    # Check if .env.production.vps exists (Source of Truth)
    if [ -f "nextjs-vps/.env.production.vps" ]; then
        log_info "Syncing from .env.production.vps..."
        cp nextjs-vps/.env.production.vps .env.production
    elif [ -f ".env.production.vps" ]; then
        log_info "Syncing from .env.production.vps..."
        cp .env.production.vps .env.production
    fi

    if [ ! -f ".env.production" ]; then
        log_info "Creating new .env.production from example..."
        cp .env.example .env.production 2>/dev/null || touch .env.production
    fi

    # 1. Handle APP_PORT
    if grep -q "^APP_PORT=" .env.production; then
        BASE_PORT=$(grep "^APP_PORT=" .env.production | cut -d '=' -f2)
    else
        BASE_PORT=3005
    fi
    
    # Detect free port
    APP_PORT=$(find_free_port "$BASE_PORT")
    
    # Update or Add APP_PORT and CONTAINER_NAME to .env.production
    sed -i "/^APP_PORT=/d" .env.production
    echo "APP_PORT=$APP_PORT" >> .env.production
    
    sed -i "/^CONTAINER_NAME=/d" .env.production
    echo "CONTAINER_NAME=$CONTAINER_NAME" >> .env.production

    # 1.1 Handle BUILD_COMMIT_SHA
    if [ -n "${BUILD_COMMIT_SHA:-}" ]; then
        log_info "Baking BUILD_COMMIT_SHA: $BUILD_COMMIT_SHA"
        sed -i "/^BUILD_COMMIT_SHA=/d" .env.production
        echo "BUILD_COMMIT_SHA=$BUILD_COMMIT_SHA" >> .env.production
    fi

    # 2. Handle CRON_SECRET
    if grep -q "^CRON_SECRET=" .env.production; then
        CRON_SECRET=$(grep "^CRON_SECRET=" .env.production | cut -d '=' -f2)
    else
        log_info "Generating new CRON_SECRET..."
        CRON_SECRET=$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 32)
        echo "CRON_SECRET=$CRON_SECRET" >> .env.production
    fi

    export APP_PORT
    export CONTAINER_NAME
    log_success "Environment ready: Port=$APP_PORT, Container=$CONTAINER_NAME"
}

# ==========================================
# Step 2: Build & Start App
# ==========================================
start_app() {
    log_step "Step 2: Building and starting Next.js app"
    
    # ลงไปที่ nextjs-vps เพื่อรัน docker compose
    if [[ "$PWD" != *"/nextjs-vps" ]]; then
        cd nextjs-vps
    fi
    
    # Export variables so docker compose can see them
    export APP_PORT
    export CONTAINER_NAME
    
    docker compose down 2>/dev/null || true
    docker compose build
    docker compose up -d
    
    log_success "Next.js app started as '$CONTAINER_NAME' on port $APP_PORT"
    cd ..
}

# ==========================================
# Step 3: Setup Nginx
# ==========================================
setup_nginx() {
    log_step "Step 3: Setting up Nginx config ($NGINX_CONF_NAME)"

    cat > "/etc/nginx/sites-available/$NGINX_CONF_NAME" << EOF
# ============================================
# Next.js App: ${PROJECT_ID}
# ============================================
server {
    listen 80;
    listen [::]:80;
    server_name ${APP_DOMAIN};

    location / {
        proxy_pass http://localhost:${APP_PORT};
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

    ln -sf "/etc/nginx/sites-available/$NGINX_CONF_NAME" "/etc/nginx/sites-enabled/"
    
    if nginx -t; then
        systemctl reload nginx
        log_success "Nginx configured for ${APP_DOMAIN} -> localhost:${APP_PORT}"
    else
        log_error "Nginx configuration test failed!"
        exit 1
    fi
}

# ==========================================
# Step 4: Setup Cron Job (Tagged)
# ==========================================
setup_cron() {
    log_step "Step 4: Setting up Cron Job"
    
    # ใช้ Tag เพื่อให้ลบเฉพาะของโปรเจคนี้ได้
    CRON_TAG="# cron-nextjs-${PROJECT_ID}"
    CRON_LINE="* * * * * curl -s -X POST -H \"x-cron-secret: $CRON_SECRET\" http://localhost:${APP_PORT}/api/cron/run >/dev/null 2>&1 ${CRON_TAG}"
    
    # Remove old tagged cron and add new one
    (crontab -l 2>/dev/null | grep -v "${CRON_TAG}"; echo "$CRON_LINE") | crontab -
    
    log_success "Cron job added (using port $APP_PORT)"
}

# ==========================================
# Main
# ==========================================
main() {
    setup_env
    start_app
    setup_nginx
    setup_cron
    
    echo -e "\n${GREEN}============================================${NC}"
    echo -e "${GREEN}  ✅ ${PROJECT_ID} Setup Complete!${NC}"
    echo -e "${GREEN}============================================${NC}"
    echo -e "🔗 URL: https://${APP_DOMAIN}"
    echo -e "🚢 Container: ${CONTAINER_NAME}"
    echo -e "🔌 Local Port: ${APP_PORT}"
    echo -e "🔑 Cron Secret: ${CRON_SECRET:0:5}****************"
    echo -e ""
    echo -e "${YELLOW}Next Step:${NC} sudo certbot --nginx -d ${APP_DOMAIN}"
    echo -e "${GREEN}============================================${NC}"
}

main "$@"
