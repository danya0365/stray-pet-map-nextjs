#!/bin/bash
# ============================================
# 🚀 Next.js App Setup Script (Clean VPS Mode)
# ============================================
# สำหรับ Ubuntu 22.04 | Domain: social-generator.vibify.site
# 
# วิธีใช้:
#   chmod +x setup-nextjs.sh
#   sudo ./setup-nextjs.sh
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
    command -v netstat &> /dev/null && netstat -tuln | grep -q ":$1 "
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
# Step 1: Install Docker
# ==========================================
install_docker() {
    log_step "Step 1: Installing Docker"
    if command -v docker &> /dev/null; then
        log_success "Docker already installed"
    else
        apt-get update -y
        apt-get install -y ca-certificates curl gnupg lsb-release
        mkdir -p /etc/apt/keyrings
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
        apt-get update -y
        apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
        log_success "Docker installed"
    fi
}

# ==========================================
# Step 2: Install Caddy
# ==========================================
install_caddy() {
    log_step "Step 2: Installing Caddy"
    if command -v caddy &> /dev/null; then
        log_success "Caddy already installed"
    else
        apt-get install -y debian-keyring debian-archive-keyring apt-transport-https
        curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
        curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
        apt-get update -y
        apt-get install -y caddy
        log_success "Caddy installed"
    fi
}

# ==========================================
# Step 3: Setup App & Environment
# ==========================================
setup_app() {
    log_step "Step 3: Setting up app and environment"
    
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
    
    # Update .env.production
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

    # Export for Docker Compose
    export APP_PORT
    export CONTAINER_NAME

    cd nextjs-vps
    docker compose build
    docker compose up -d
    cd ..
}

# ==========================================
# Step 4: Caddy Config
# ==========================================
setup_caddy() {
    log_step "Step 4: Configuring Caddy"
    cat > /etc/caddy/Caddyfile << EOF
${APP_DOMAIN} {
    # Proxy ไปยัง Docker container port สดๆ
    reverse_proxy localhost:${APP_PORT}
}
EOF
    systemctl restart caddy
    log_success "Caddy configured (Proxy to port $APP_PORT)"
}

# ==========================================
# Step 5: Cron Setup (Tagged)
# ==========================================
setup_cron() {
    log_step "Step 5: Setting up Cron Job"
    
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
    install_docker
    install_caddy
    setup_app
    setup_caddy
    setup_cron
    
    echo -e "\n${GREEN}============================================${NC}"
    echo -e "${GREEN}  ✅ ${PROJECT_ID} Setup Complete!${NC}"
    echo -e "${GREEN}============================================${NC}"
    echo -e "🔗 URL: https://${APP_DOMAIN}"
    echo -e "🚢 Container: ${CONTAINER_NAME}"
    echo -e "🔌 Local Port: ${APP_PORT}"
    echo -e "🔑 Cron Secret: ${CRON_SECRET:0:5}****************"
    echo -e "${GREEN}============================================${NC}"
}

main "$@"
