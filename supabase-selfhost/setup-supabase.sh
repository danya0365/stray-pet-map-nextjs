#!/bin/bash
# ============================================
# 🚀 Supabase Self-Hosted Setup Script
# ============================================
# สำหรับ Ubuntu 22.04 | Domain: supabase.social-generator.vibify.site
# 
# วิธีใช้:
#   chmod +x setup-supabase.sh
#   sudo ./setup-supabase.sh
#
# Script นี้จะ:
# 1. ติดตั้ง Docker & Docker Compose (ถ้ายังไม่มี)
# 2. Clone Supabase Docker repo
# 3. Generate secrets ทั้งหมดอัตโนมัติ
# 4. ตั้งค่า Caddy reverse proxy (auto SSL)
# 5. Start Supabase services
# ============================================

# ==========================================
# Configuration — อัตโนมัติเกือบทั้งหมด
# ==========================================
SUPABASE_DOMAIN="supabase.social-generator.vibify.site"
APP_DOMAIN="social-generator.vibify.site"
# สร้าง Project ID จาก Domain (เช่น social-generator)
PROJECT_ID=$(echo "$SUPABASE_DOMAIN" | cut -d'.' -f2)
INSTALL_DIR="/opt/supabase-${PROJECT_ID}"
DASHBOARD_USERNAME="supabase"

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
# Step 1: Install Docker & Docker Compose
# ==========================================
install_docker() {
    log_step "Step 1: Installing Docker & Docker Compose"
    if command -v docker &> /dev/null; then
        log_success "Docker already installed"
    else
        apt-get update -y && apt-get install -y ca-certificates curl gnupg lsb-release
        mkdir -p /etc/apt/keyrings
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
        apt-get update -y && apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
        log_success "Docker installed"
    fi
}

# ==========================================
# Step 2: Install additional tools
# ==========================================
install_dependencies() {
    log_step "Step 2: Installing dependencies"
    apt-get install -y git openssl jq curl
    log_success "Dependencies installed"
}

# ==========================================
# Step 3: Clone & Setup Supabase files
# ==========================================
setup_supabase_files() {
    log_step "Step 3: Setting up Supabase files"
    mkdir -p "$INSTALL_DIR"
    
    local TEMP_REPO="/tmp/supabase-repo-$(date +%s)"
    log_info "Cloning official Supabase template..."
    git clone --depth 1 https://github.com/supabase/supabase "$TEMP_REPO"
    
    if [ ! -f "$INSTALL_DIR/docker-compose.yml" ]; then
        cp -rf "$TEMP_REPO/docker/"* "$INSTALL_DIR/"
        cp "$TEMP_REPO/docker/.env.example" "$INSTALL_DIR/.env"
        log_success "Docker files prepared in $INSTALL_DIR"
    else
        log_warn "Project already exists, skipping file copy."
    fi
    rm -rf "$TEMP_REPO"
}

# ==========================================
# Step 4: Handle Secrets & Ports
# ==========================================
configure_env() {
    log_step "Step 4: Configuring Environment & Dynamic Ports"
    cd "$INSTALL_DIR"

    # 1. Handle Ports
    local BASE_KONG_PORT=8000
    local BASE_DB_PORT=54322

    if [ -f ".env" ] && grep -q "^KONG_HTTP_PORT=" .env; then
         KONG_HTTP_PORT=$(grep "^KONG_HTTP_PORT=" .env | cut -d'=' -f2)
    else
         KONG_HTTP_PORT=$(find_free_port $BASE_KONG_PORT)
    fi

    if [ -f ".env" ] && grep -q "^SUPABASE_DB_PORT=" .env; then
         SUPABASE_DB_PORT=$(grep "^SUPABASE_DB_PORT=" .env | cut -d'=' -f2)
    else
         SUPABASE_DB_PORT=$(find_free_port $BASE_DB_PORT)
    fi

    sed -i "/^KONG_HTTP_PORT=/d" .env
    echo "KONG_HTTP_PORT=$KONG_HTTP_PORT" >> .env
    sed -i "/^SUPABASE_DB_PORT=/d" .env
    echo "SUPABASE_DB_PORT=$SUPABASE_DB_PORT" >> .env

    # 2. Handle Secrets (Only if fresh)
    if grep -q "POSTGRES_PASSWORD=replace-me" .env || ! grep -q "POSTGRES_PASSWORD=" .env; then
        POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 32)
        JWT_SECRET=$(openssl rand -base64 48 | tr -dc 'a-zA-Z0-9' | head -c 64)
        DASHBOARD_PASSWORD=$(openssl rand -base64 16 | tr -dc 'a-zA-Z0-9' | head -c 20)
        
        # JWT Generation
        local IAT=$(date +%s)
        local EXP=$(( IAT + 157680000 ))
        local HEADER=$(echo -n '{"alg":"HS256","typ":"JWT"}' | base64 | tr -d '\n' | tr '+/' '-_' | tr -d '=')
        local ANON_PAYLOAD=$(echo -n "{\"role\":\"anon\",\"iss\":\"supabase\",\"iat\":${IAT},\"exp\":${EXP}}" | base64 | tr -d '\n' | tr '+/' '-_' | tr -d '=')
        local ANON_SIGNATURE=$(echo -n "${HEADER}.${ANON_PAYLOAD}" | openssl dgst -sha256 -hmac "$JWT_SECRET" -binary | base64 | tr -d '\n' | tr '+/' '-_' | tr -d '=')
        local ANON_KEY="${HEADER}.${ANON_PAYLOAD}.${ANON_SIGNATURE}"
        local SERVICE_PAYLOAD=$(echo -n "{\"role\":\"service_role\",\"iss\":\"supabase\",\"iat\":${IAT},\"exp\":${EXP}}" | base64 | tr -d '\n' | tr '+/' '-_' | tr -d '=')
        local SERVICE_SIGNATURE=$(echo -n "${HEADER}.${SERVICE_PAYLOAD}" | openssl dgst -sha256 -hmac "$JWT_SECRET" -binary | base64 | tr -d '\n' | tr '+/' '-_' | tr -d '=')
        local SERVICE_ROLE_KEY="${HEADER}.${SERVICE_PAYLOAD}.${SERVICE_SIGNATURE}"

        sed -i "s|POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=${POSTGRES_PASSWORD}|" .env
        sed -i "s|JWT_SECRET=.*|JWT_SECRET=${JWT_SECRET}|" .env
        sed -i "s|ANON_KEY=.*|ANON_KEY=${ANON_KEY}|" .env
        sed -i "s|SERVICE_ROLE_KEY=.*|SERVICE_ROLE_KEY=${SERVICE_ROLE_KEY}|" .env
        sed -i "s|DASHBOARD_USERNAME=.*|DASHBOARD_USERNAME=${DASHBOARD_USERNAME}|" .env
        sed -i "s|DASHBOARD_PASSWORD=.*|DASHBOARD_PASSWORD=${DASHBOARD_PASSWORD}|" .env
        sed -i "s|SUPABASE_PUBLIC_URL=.*|SUPABASE_PUBLIC_URL=https://${SUPABASE_DOMAIN}|" .env
        sed -i "s|API_EXTERNAL_URL=.*|API_EXTERNAL_URL=https://${SUPABASE_DOMAIN}|" .env
        sed -i "s|SITE_URL=.*|SITE_URL=https://${APP_DOMAIN}|" .env
    fi
    log_success "Environment ready (Kong=$KONG_HTTP_PORT, DB=$SUPABASE_DB_PORT)"
}

# ==========================================
# Step 5: Setup Caddy
# ==========================================
setup_caddy() {
    log_step "Step 5: Configuring Caddy"
    if ! command -v caddy &> /dev/null; then
        apt-get install -y debian-keyring debian-archive-keyring apt-transport-https
        curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
        curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
        apt-get update -y && apt-get install -y caddy
    fi

    cat > /etc/caddy/Caddyfile << EOF
${SUPABASE_DOMAIN} {
    reverse_proxy localhost:${KONG_HTTP_PORT}
    header Content-Security-Policy "upgrade-insecure-requests"
}
EOF
    systemctl restart caddy
    log_success "Caddy configured (Proxy to $KONG_HTTP_PORT)"
}

# ==========================================
# Step 6: Start Supabase
# ==========================================
start_supabase() {
    log_step "Step 6: Starting Supabase ($PROJECT_ID)"
    cd "$INSTALL_DIR"
    
    if ! grep -q "SUPABASE_DB_PORT" docker-compose.yml; then
        sed -i "/container_name: supabase-db/a \    ports:\n      - \"\${SUPABASE_DB_PORT:-54322}:5432\"" docker-compose.yml
    fi

    docker compose -p "$PROJECT_ID" pull
    docker compose -p "$PROJECT_ID" up -d

    # Copy maintenance script
    local SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    if [ -f "$SCRIPT_DIR/maintenance.sh" ]; then
        cp "$SCRIPT_DIR/maintenance.sh" "$INSTALL_DIR/maintenance.sh"
        chmod +x "$INSTALL_DIR/maintenance.sh"
        log_success "Maintenance script deployed to ${INSTALL_DIR}/maintenance.sh"
    fi

    log_success "Supabase services started!"
}

# ==========================================
# Step 7: Summary & Credentials
# ==========================================
print_summary() {
    local CREDS_FILE="$INSTALL_DIR/.credentials"
    # Read values from .env
    local ANON_KEY=$(grep "^ANON_KEY=" .env | cut -d'=' -f2)
    local SERVICE_ROLE_KEY=$(grep "^SERVICE_ROLE_KEY=" .env | cut -d'=' -f2)
    local POSTGRES_PASSWORD=$(grep "^POSTGRES_PASSWORD=" .env | cut -d'=' -f2)
    local DASHBOARD_PASSWORD=$(grep "^DASHBOARD_PASSWORD=" .env | cut -d'=' -f2)

    cat > "$CREDS_FILE" << EOF
# Supabase Credentials for ${PROJECT_ID}
DASHBOARD_URL=https://${SUPABASE_DOMAIN}
DASHBOARD_USERNAME=${DASHBOARD_USERNAME}
DASHBOARD_PASSWORD=${DASHBOARD_PASSWORD}
SUPABASE_URL=https://${SUPABASE_DOMAIN}
SUPABASE_ANON_KEY=${ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${SERVICE_ROLE_KEY}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
KONG_PORT=${KONG_HTTP_PORT}
DB_PORT=${SUPABASE_DB_PORT}
EOF
    chmod 600 "$CREDS_FILE"

    echo -e "\n${GREEN}============================================${NC}"
    echo -e "${GREEN}  ✅ ${PROJECT_ID} Setup Complete!${NC}"
    echo -e "${GREEN}============================================${NC}"
    echo -e "🔗 URL: https://${SUPABASE_DOMAIN}"
    echo -e "🔌 Kong Port: ${KONG_HTTP_PORT}"
    echo -e "🔌 DB Port: ${SUPABASE_DB_PORT}"
    echo -e "📄 Credentials: ${INSTALL_DIR}/.credentials"
    echo -e "${GREEN}============================================${NC}"
}

# ==========================================
# Main
# ==========================================
main() {
    install_docker
    install_dependencies
    setup_supabase_files
    configure_env
    setup_caddy
    start_supabase
    print_summary
}

main "$@"
