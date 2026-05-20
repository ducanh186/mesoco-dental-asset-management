#!/bin/sh
# =============================================================================
# Mesoco Dental - Container Entrypoint
# =============================================================================
# Runs on container startup. Bootstrap is idempotent so that the demo stays
# usable after `git pull`:
# - Installs PHP/Node deps if missing.
# - For the app container (no args from compose): clears stale config cache,
#   rebuilds frontend assets, then waits for MySQL, runs migrations, and seeds
#   when the DB is empty.
# - For the vite container (compose passes `sh -c "...vite..."`): skips the
#   DB/build phases — the app container already handled them and the dev
#   server builds on demand.
# =============================================================================

set -e

cd /var/www/html

echo "=============================================="
echo "Mesoco Dental Asset Management"
echo "=============================================="

# -----------------------------------------------------------------------------
# PHP dependencies (both containers need vendor/)
# -----------------------------------------------------------------------------
if [ ! -f "vendor/autoload.php" ]; then
    echo "[deps] Installing PHP dependencies (composer install)..."
    composer install --no-interaction --prefer-dist --optimize-autoloader
else
    echo "[deps] PHP dependencies already installed ✓"
fi

if [ ! -f "vendor/autoload.php" ]; then
    echo "[ERROR] PHP dependencies are still missing after composer install."
    exit 1
fi

# -----------------------------------------------------------------------------
# Node dependencies (both containers share node_modules volume)
# -----------------------------------------------------------------------------
NODE_PLATFORM="$(node -p "'node-' + process.platform + '-' + process.arch")"
NODE_PLATFORM_FILE="node_modules/.docker-platform"
INSTALLED_NODE_PLATFORM="$(cat "$NODE_PLATFORM_FILE" 2>/dev/null || true)"

if [ ! -f "node_modules/.package-lock.json" ] || [ "package-lock.json" -nt "node_modules/.package-lock.json" ] || [ "$INSTALLED_NODE_PLATFORM" != "$NODE_PLATFORM" ]; then
    echo "[deps] Installing Node dependencies (npm install)..."
    if [ -d "node_modules" ] && [ "$INSTALLED_NODE_PLATFORM" != "$NODE_PLATFORM" ]; then
        echo "      Resetting node_modules for container platform: $NODE_PLATFORM"
        find node_modules -mindepth 1 -maxdepth 1 -exec rm -rf {} +
    fi
    npm install
    echo "$NODE_PLATFORM" > "$NODE_PLATFORM_FILE"
else
    echo "[deps] Node dependencies already installed ✓"
fi

# -----------------------------------------------------------------------------
# If compose passed a command (vite container), exec it now and skip the
# DB/build phases — those belong to the app container.
# -----------------------------------------------------------------------------
if [ "$#" -gt 0 ]; then
    echo "[vite] Handing off to: $*"
    exec "$@"
fi

# -----------------------------------------------------------------------------
# .env file (generated only if absent)
# -----------------------------------------------------------------------------
if [ ! -f ".env" ]; then
    echo "[env] Creating .env from docker/.env.docker..."
    if [ -f "docker/.env.docker" ]; then
        cp docker/.env.docker .env
        echo "      Copied docker/.env.docker to .env ✓"
    else
        echo "      Warning: docker/.env.docker not found, using .env.example"
        cp .env.example .env
    fi
    php artisan key:generate --force
    echo "      Generated APP_KEY ✓"
else
    echo "[env] .env present ✓"
fi

# Clear cached config/view so a stale .env (e.g. ngrok session domain from a
# previous tunnelled run) cannot poison this boot. Compose `environment:`
# values still win at runtime.
php artisan config:clear >/dev/null 2>&1 || true
php artisan view:clear   >/dev/null 2>&1 || true

# -----------------------------------------------------------------------------
# Frontend assets. Build every app-container boot so a pulled/stale
# public/build bundle cannot keep showing old sidebar/menu UI.
# -----------------------------------------------------------------------------
if [ "${SKIP_FRONTEND_BUILD:-false}" = "true" ]; then
    echo "[build] Frontend build skipped by SKIP_FRONTEND_BUILD=true"
else
    echo "[build] Building frontend assets (npm run build)..."
    npm run build
fi

# -----------------------------------------------------------------------------
# Database — wait, migrate, seed-if-empty. All idempotent.
# -----------------------------------------------------------------------------
DB_HOST_DEFAULT="${DB_HOST:-db}"
DB_PORT_DEFAULT="${DB_PORT:-3306}"
DB_USERNAME_DEFAULT="${DB_USERNAME:-mesoco}"
DB_PASSWORD_DEFAULT="${DB_PASSWORD:-secret}"
DB_DATABASE_DEFAULT="${DB_DATABASE:-mesoco_dental}"

# Use PDO for readiness so the check verifies the real Laravel connection,
# not just an open TCP port.
DB_WAIT_SECONDS="${DB_WAIT_SECONDS:-30}"
echo "[db] Waiting up to ${DB_WAIT_SECONDS}s for MySQL at ${DB_HOST_DEFAULT}:${DB_PORT_DEFAULT}..."
DB_READY=0
i=0
while [ "$i" -lt "$DB_WAIT_SECONDS" ]; do
    if DB_HOST_CHECK="$DB_HOST_DEFAULT" \
        DB_PORT_CHECK="$DB_PORT_DEFAULT" \
        DB_DATABASE_CHECK="$DB_DATABASE_DEFAULT" \
        DB_USERNAME_CHECK="$DB_USERNAME_DEFAULT" \
        DB_PASSWORD_CHECK="$DB_PASSWORD_DEFAULT" \
        php -r '
            $host = getenv("DB_HOST_CHECK") ?: "db";
            $port = (int) (getenv("DB_PORT_CHECK") ?: 3306);
            $database = getenv("DB_DATABASE_CHECK") ?: "mesoco_dental";
            $username = getenv("DB_USERNAME_CHECK") ?: "mesoco";
            $password = getenv("DB_PASSWORD_CHECK") ?: "secret";

            try {
                new PDO(
                    "mysql:host={$host};port={$port};dbname={$database};charset=utf8mb4",
                    $username,
                    $password,
                    [PDO::ATTR_TIMEOUT => 2]
                );
                exit(0);
            } catch (Throwable $e) {
                exit(1);
            }
        ' >/dev/null 2>&1; then
        DB_READY=1
        break
    fi
    i=$((i + 1))
    sleep 1
done

if [ "$DB_READY" = "1" ]; then
    echo "[db] MySQL connection ready ✓"
    php artisan migrate --force --no-interaction || echo "[WARN] migrate returned non-zero"

    USERS_COUNT="$(mysql --skip-ssl -h "$DB_HOST_DEFAULT" -P "$DB_PORT_DEFAULT" -u "$DB_USERNAME_DEFAULT" -p"$DB_PASSWORD_DEFAULT" -D "$DB_DATABASE_DEFAULT" -sN -e 'SELECT COUNT(*) FROM users' 2>/dev/null || echo 0)"
    case "$USERS_COUNT" in
        ''|*[!0-9]*) USERS_COUNT=0 ;;
    esac

    if [ "$USERS_COUNT" = "0" ]; then
        echo "[db] Users table empty → running DatabaseSeeder..."
        php artisan db:seed --class=DatabaseSeeder --force --no-interaction || echo "[WARN] seed returned non-zero"
    else
        echo "[db] Users present (${USERS_COUNT}) → skipping seed"
    fi
else
    echo "[WARN] MySQL connection not ready after ${DB_WAIT_SECONDS}s; skipping migrate/seed"
fi

echo "=============================================="
echo "Ready. App on http://localhost:8000"
echo "Re-seed manually if needed:"
echo "  docker compose exec -T app php artisan migrate:fresh --seed --force"
echo "=============================================="

# -----------------------------------------------------------------------------
# Start Laravel development server (app container)
# -----------------------------------------------------------------------------
exec php -S 0.0.0.0:8000 -t public docker/app/router.php
