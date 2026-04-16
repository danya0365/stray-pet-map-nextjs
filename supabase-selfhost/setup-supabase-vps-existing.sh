#!/bin/bash
# ============================================
# 🚀 Supabase Self-Hosted Setup Script (Existing VPS Mode)
# ============================================
# สำหรับเครื่องที่มี Nginx และ Docker อยู่แล้ว
# 
# วิธีใช้:
#   chmod +x setup-supabase-vps-existing.sh
#   sudo ./setup-supabase-vps-existing.sh
# ============================================

set -euo pipefail

# ==========================================
# Configuration — อัตโนมัติเกือบทั้งหมด
# ==========================================
SUPABASE_DOMAIN="supabase.social-generator.vibify.site"
# สร้าง Project ID จาก Domain (เช่น social-generator)
PROJECT_ID=$(echo "$SUPABASE_DOMAIN" | cut -d'.' -f2)
INSTALL_DIR="/opt/supabase-${PROJECT_ID}"
DASHBOARD_USERNAME="supabase"
NGINX_CONF_NAME="supabase-${PROJECT_ID}"

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
# Step 1: Install dependencies
# ==========================================
install_dependencies() {
    log_step "Step 1: Installing dependencies"
    apt-get update -y && apt-get install -y git openssl jq curl
    log_success "Dependencies installed"
}

# ==========================================
# Step 2: Clone & Setup Supabase
# ==========================================
setup_supabase_files() {
    log_step "Step 2: Setting up Supabase files"

    mkdir -p "$INSTALL_DIR"
    
    # Clone Repo ชั่วคราวเพื่อเอา Docker files
    local TEMP_REPO="/tmp/supabase-repo-$(date +%s)"
    log_info "Cloning official Supabase repository template..."
    git clone --depth 1 https://github.com/supabase/supabase "$TEMP_REPO"
    
    # Copy docker files if not exists
    if [ ! -f "$INSTALL_DIR/docker-compose.yml" ]; then
        log_info "Copying Docker files to $INSTALL_DIR..."
        cp -rf "$TEMP_REPO/docker/"* "$INSTALL_DIR/"
        cp "$TEMP_REPO/docker/.env.example" "$INSTALL_DIR/.env"
        log_success "Docker files prepared"
    else
        log_warn "Project already exists in $INSTALL_DIR, skipping file copy."
    fi
    rm -rf "$TEMP_REPO"
    cd "$INSTALL_DIR"
}

# ==========================================
# Step 3: Handle Secrets & Ports
# ==========================================
configure_env() {
    log_step "Step 3: Configuring Environment & Dynamic Ports"

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

    # Inject Ports into .env
    sed -i "/^KONG_HTTP_PORT=/d" .env
    echo "KONG_HTTP_PORT=$KONG_HTTP_PORT" >> .env
    sed -i "/^SUPABASE_DB_PORT=/d" .env
    echo "SUPABASE_DB_PORT=$SUPABASE_DB_PORT" >> .env

    # 2. Handle Secrets (Generate only if not exist)
    if grep -q "POSTGRES_PASSWORD=replace-me" .env || ! grep -q "POSTGRES_PASSWORD=" .env; then
        log_info "Generating new secrets..."
        POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 32)
        JWT_SECRET=$(openssl rand -base64 48 | tr -dc 'a-zA-Z0-9' | head -c 64)
        DASHBOARD_PASSWORD=$(openssl rand -base64 16 | tr -dc 'a-zA-Z0-9' | head -c 20)
        
        # Generate JWT Keys
        local IAT=$(date +%s)
        local EXP=$(( IAT + 157680000 ))
        local HEADER=$(echo -n '{"alg":"HS256","typ":"JWT"}' | base64 | tr -d '\n' | tr '+/' '-_' | tr -d '=')
        local ANON_PAYLOAD=$(echo -n "{\"role\":\"anon\",\"iss\":\"supabase\",\"iat\":${IAT},\"exp\":${EXP}}" | base64 | tr -d '\n' | tr '+/' '-_' | tr -d '=')
        local ANON_SIGNATURE=$(echo -n "${HEADER}.${ANON_PAYLOAD}" | openssl dgst -sha256 -hmac "$JWT_SECRET" -binary | base64 | tr -d '\n' | tr '+/' '-_' | tr -d '=')
        ANON_KEY="${HEADER}.${ANON_PAYLOAD}.${ANON_SIGNATURE}"
        local SERVICE_PAYLOAD=$(echo -n "{\"role\":\"service_role\",\"iss\":\"supabase\",\"iat\":${IAT},\"exp\":${EXP}}" | base64 | tr -d '\n' | tr '+/' '-_' | tr -d '=')
        local SERVICE_SIGNATURE=$(echo -n "${HEADER}.${SERVICE_PAYLOAD}" | openssl dgst -sha256 -hmac "$JWT_SECRET" -binary | base64 | tr -d '\n' | tr '+/' '-_' | tr -d '=')
        SERVICE_ROLE_KEY="${HEADER}.${SERVICE_PAYLOAD}.${SERVICE_SIGNATURE}"

        # Update .env
        sed -i "s|POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=${POSTGRES_PASSWORD}|" .env
        sed -i "s|JWT_SECRET=.*|JWT_SECRET=${JWT_SECRET}|" .env
        sed -i "s|ANON_KEY=.*|ANON_KEY=${ANON_KEY}|" .env
        sed -i "s|SERVICE_ROLE_KEY=.*|SERVICE_ROLE_KEY=${SERVICE_ROLE_KEY}|" .env
        sed -i "s|DASHBOARD_USERNAME=.*|DASHBOARD_USERNAME=${DASHBOARD_USERNAME}|" .env
        sed -i "s|DASHBOARD_PASSWORD=.*|DASHBOARD_PASSWORD=${DASHBOARD_PASSWORD}|" .env
        sed -i "s|SUPABASE_PUBLIC_URL=.*|SUPABASE_PUBLIC_URL=https://${SUPABASE_DOMAIN}|" .env
        sed -i "s|API_EXTERNAL_URL=.*|API_EXTERNAL_URL=https://${SUPABASE_DOMAIN}|" .env
    else
        log_info "Existing secrets found, preserving them."
    fi

    log_success "Environment configured: Kong Port=$KONG_HTTP_PORT, DB Port=$SUPABASE_DB_PORT"
}

# ==========================================
# Step 4: Setup Nginx
# ==========================================
setup_nginx() {
    log_step "Step 4: Setting up Nginx config ($NGINX_CONF_NAME)"

    cat > "/etc/nginx/sites-available/$NGINX_CONF_NAME" << EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${SUPABASE_DOMAIN};

    location / {
        proxy_pass http://localhost:${KONG_HTTP_PORT};
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        
        add_header Content-Security-Policy "upgrade-insecure-requests";
    }
}
EOF

    ln -sf "/etc/nginx/sites-available/$NGINX_CONF_NAME" "/etc/nginx/sites-enabled/"
    nginx -t && systemctl reload nginx
    log_success "Nginx configured for ${SUPABASE_DOMAIN} -> localhost:${KONG_HTTP_PORT}"
}

# ==========================================
# Step 5: Start Supabase
# ==========================================
start_supabase() {
    log_step "Step 5: Starting Supabase (Isolation Mode)"
    
    # 1. Modify docker-compose.yml to use dynamic DB port
    if ! grep -q "SUPABASE_DB_PORT" docker-compose.yml; then
        log_info "Patching docker-compose.yml for dynamic DB port..."
        sed -i "/container_name: supabase-db/a \    ports:\n      - \"\${SUPABASE_DB_PORT:-54322}:5432\"" docker-compose.yml
    fi

    # 2. Start with Project Name (Isolation)
    docker compose -p "$PROJECT_ID" pull
    docker compose -p "$PROJECT_ID" up -d
    
    # Copy maintenance script
    local SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    if [ -f "$SCRIPT_DIR/maintenance.sh" ]; then
        cp "$SCRIPT_DIR/maintenance.sh" "$INSTALL_DIR/maintenance.sh"
        chmod +x "$INSTALL_DIR/maintenance.sh"
        log_success "Maintenance script deployed to ${INSTALL_DIR}/maintenance.sh"
    fi

    log_success "Supabase '$PROJECT_ID' started!"
}

# ==========================================
# Step 6: Save credentials
# ==========================================
save_credentials() {
    local CREDS_FILE="$INSTALL_DIR/.credentials"
    # ดึงค่าล่าสุดจาก .env
    local ANON_KEY=$(grep "^ANON_KEY=" .env | cut -d'=' -f2)
    local SERVICE_ROLE_KEY=$(grep "^SERVICE_ROLE_KEY=" .env | cut -d'=' -f2)
    local POSTGRES_PASSWORD=$(grep "^POSTGRES_PASSWORD=" .env | cut -d'=' -f2)
    local DASHBOARD_PASSWORD=$(grep "^DASHBOARD_PASSWORD=" .env | cut -d'=' -f2)

    cat > "$CREDS_FILE" << EOF
# Supabase Self-Hosted Credentials for ${PROJECT_ID}
PROJECT_ID=${PROJECT_ID}
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
    log_success "Credentials saved to ${CREDS_FILE}"
}

# ==========================================
# Main
# ==========================================
main() {
    install_dependencies
    setup_supabase_files
    configure_env
    setup_nginx
    start_supabase
    save_credentials
    
    echo -e "\n${GREEN}============================================${NC}"
    echo -e "${GREEN}  ✅ ${PROJECT_ID} Setup Complete!${NC}"
    echo -e "${GREEN}============================================${NC}"
    echo -e "🔗 URL: https://${SUPABASE_DOMAIN}"
    echo -e "🔌 Kong Port: ${KONG_HTTP_PORT}"
    echo -e "🔌 DB Port: ${SUPABASE_DB_PORT}"
    echo -e "📄 Credentials: ${INSTALL_DIR}/.credentials"
    echo -e ""
    echo -e "${YELLOW}Next Step:${NC} sudo certbot --nginx -d ${SUPABASE_DOMAIN}"
    echo -e "${GREEN}============================================${NC}"
}

main "$@"
