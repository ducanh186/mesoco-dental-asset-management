#!/bin/sh
# =============================================================================
# Mesoco Dental - Container Entrypoint
# =============================================================================
# Runs on container startup:
# - Installs PHP dependencies if missing
# - Installs Node dependencies if missing
# - Does NOT auto-migrate (manual step for safety)
# - Starts Laravel development server
# =============================================================================

set -e

cd /var/www/html

echo "=============================================="
echo "Mesoco Dental Asset Management"
echo "=============================================="

# -----------------------------------------------------------------------------
# Install PHP dependencies (if vendor missing)
# -----------------------------------------------------------------------------
if [ ! -f "vendor/autoload.php" ]; then
    echo "[1/3] Installing PHP dependencies (composer install)..."
    composer install --no-interaction --prefer-dist --optimize-autoloader
else
    echo "[1/3] PHP dependencies already installed ✓"
fi

if [ ! -f "vendor/autoload.php" ]; then
    echo "[ERROR] PHP dependencies are still missing after composer install."
    echo "        Expected file: /var/www/html/vendor/autoload.php"
    echo "        Run: docker compose --env-file .env.runtime exec -T app composer install --no-interaction --prefer-dist --optimize-autoloader"
    exit 1
fi

# -----------------------------------------------------------------------------
# Install Node dependencies (if node_modules missing or empty)
# -----------------------------------------------------------------------------
if [ ! -f "node_modules/.package-lock.json" ] || [ "package-lock.json" -nt "node_modules/.package-lock.json" ]; then
    echo "[2/3] Installing Node dependencies (npm install)..."
    npm install
else
    echo "[2/3] Node dependencies already installed ✓"
fi

# -----------------------------------------------------------------------------
# Build frontend assets (fallback until Vite dev server starts)
# -----------------------------------------------------------------------------
if [ ! -f "public/build/manifest.json" ]; then
    echo "[2.5/3] Building frontend assets (npx vite build)..."
    npx vite build || echo "[WARN] Frontend build failed, Vite dev server will handle it"
else
    echo "[2.5/3] Frontend assets already built ✓"
fi

# -----------------------------------------------------------------------------
# Environment setup
# -----------------------------------------------------------------------------
if [ ! -f ".env" ]; then
    echo "[3/3] Creating .env from docker/.env.docker..."
    if [ -f "docker/.env.docker" ]; then
        cp docker/.env.docker .env
        echo "✓ Copied docker/.env.docker to .env"
    else
        echo "⚠ Warning: docker/.env.docker not found, using .env.example"
        cp .env.example .env
    fi
    php artisan key:generate --force
    echo "✓ Generated APP_KEY"
else
    echo "[3/3] Environment file exists ✓"
fi

echo "=============================================="
echo "Ready! Run these commands in another terminal:"
echo ""
echo "  docker compose exec app php artisan migrate --seed"
echo ""
echo "Then open: http://localhost:8000"
echo "=============================================="

# Run the service command when docker-compose provides one, for example Vite.
if [ "$#" -gt 0 ]; then
    exec "$@"
fi

# -----------------------------------------------------------------------------
# Start Laravel development server
# -----------------------------------------------------------------------------
exec php -S 0.0.0.0:8000 -t public docker/app/router.php
