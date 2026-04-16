#!/bin/bash
# ============================================
# 🔧 Supabase Self-Hosted Maintenance Script
# ============================================
# วิธีใช้:
#   sudo ./maintenance.sh <command>
#
# Commands:
#   status    — แสดงสถานะ services
#   restart   — restart ทุก services
#   stop      — stop ทุก services
#   start     — start ทุก services
#   logs      — ดู logs (ระบุ service name ได้)
#   backup    — backup database
#   restore   — restore database จาก backup file
#   update    — อัพเดท Supabase images
#   creds     — แสดง credentials
# ============================================

# ==========================================
# Dynamic Configuration
# ==========================================
# Detect where we are
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INSTALL_DIR="$SCRIPT_DIR"

# Load Project ID from .env or directory name
if [ -f "$INSTALL_DIR/.env" ]; then
    # ดึงค่า SUPABASE_PUBLIC_URL เพื่อสร้าง PROJECT_ID ถ้าไม่มีกำหนดตรงๆ
    PROJECT_ID=$(grep "^SUPABASE_PUBLIC_URL=" "$INSTALL_DIR/.env" | cut -d'/' -f3 | cut -d'.' -f2)
else
    PROJECT_ID=$(basename "$INSTALL_DIR" | sed 's/supabase-//')
fi

# Fallback
PROJECT_ID="${PROJECT_ID:-supabase}"
BACKUP_DIR="/opt/supabase-backups/${PROJECT_ID}"

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

# Docker Compose helper
dc() {
    docker compose -p "$PROJECT_ID" "$@"
}

# ==========================================
# Status
# ==========================================
cmd_status() {
    log_info "Supabase Project: ${PROJECT_ID}"
    log_info "Services Status:"
    echo ""
    dc ps
    echo ""

    log_info "Disk Usage:"
    echo "  Install dir:    $(du -sh $INSTALL_DIR 2>/dev/null | cut -f1)"
    if [ -d "$BACKUP_DIR" ]; then
        echo "  Backups:        $(du -sh $BACKUP_DIR 2>/dev/null | cut -f1)"
    fi
}

# ==========================================
# Restart / Stop / Start
# ==========================================
cmd_restart() {
    log_info "Restarting Supabase '${PROJECT_ID}'..."
    dc down && dc up -d
    log_success "Restarted"
}

cmd_stop() {
    log_info "Stopping Supabase '${PROJECT_ID}'..."
    dc down
    log_success "Stopped"
}

cmd_start() {
    log_info "Starting Supabase '${PROJECT_ID}'..."
    dc up -d
    log_success "Started"
}

# ==========================================
# Logs
# ==========================================
cmd_logs() {
    local service="${1:-}"
    if [ -z "$service" ]; then
        dc logs --tail=100 -f
    else
        dc logs --tail=100 -f "$service"
    fi
}

# ==========================================
# Backup / Restore
# ==========================================
cmd_backup() {
    log_info "Backing up database for ${PROJECT_ID}..."
    mkdir -p "$BACKUP_DIR"
    local TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    local BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.sql.gz"

    local PG_CONTAINER=$(dc ps -q db)
    if [ -z "$PG_CONTAINER" ]; then
        log_error "Postgres container not running!"
        exit 1
    fi

    docker exec "$PG_CONTAINER" pg_dumpall -U supabase_admin | gzip > "$BACKUP_FILE"
    log_success "Backup created: ${BACKUP_FILE}"
}

cmd_restore() {
    local backup_file="${1:-}"
    if [ -z "$backup_file" ]; then
        log_error "Please specify backup file path."
        exit 1
    fi
    
    local PG_CONTAINER=$(dc ps -q db)
    log_warn "Restoring will overwrite all data in ${PROJECT_ID}!"
    read -p "Confirm? (y/N): " confirm
    if [ "$confirm" = "y" ]; then
        gunzip -c "$backup_file" | docker exec -i "$PG_CONTAINER" psql -U supabase_admin -d postgres
        log_success "Restored"
    fi
}

# ==========================================
# Update
# ==========================================
cmd_update() {
    log_info "Updating images for ${PROJECT_ID}..."
    dc pull && dc down && dc up -d
    log_success "Updated"
}

# ==========================================
# Credentials
# ==========================================
cmd_creds() {
    if [ -f "$INSTALL_DIR/.credentials" ]; then
        cat "$INSTALL_DIR/.credentials"
    else
        log_warn "Credentials file not found, check .env"
        grep -E "^(POSTGRES_PASSWORD|JWT_SECRET|ANON_KEY|SERVICE_ROLE_KEY|DASHBOARD_|SUPABASE_PUBLIC_URL)" "$INSTALL_DIR/.env"
    fi
}

# ==========================================
# Usage
# ==========================================
usage() {
    echo -e "${CYAN}🔧 Supabase Maintenance Tool (${PROJECT_ID})${NC}"
    echo "Usage: sudo ./maintenance.sh <command> [service]"
    echo "Commands: status, health, start, stop, restart, logs, backup, restore, update, creds"
}

# ==========================================
# Main
# ==========================================
COMMAND="${1:-}"
shift 2>/dev/null || true

case "$COMMAND" in
    status)     cmd_status ;;
    start)      cmd_start ;;
    stop)       cmd_stop ;;
    restart)    cmd_restart ;;
    logs)       cmd_logs "$@" ;;
    backup)     cmd_backup ;;
    restore)    cmd_restore "$@" ;;
    update)     cmd_update ;;
    creds)      cmd_creds ;;
    *)          usage ;;
esac
