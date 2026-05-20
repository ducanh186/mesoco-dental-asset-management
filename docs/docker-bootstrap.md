# Docker Bootstrap

Mesoco Docker stack bootstraps itself on every `docker compose up`, so the demo
stays usable after `git pull` without manual artisan commands.

## What the entrypoint does

`docker/app/entrypoint.sh` runs on container startup:

1. **PHP deps** — `composer install` if `vendor/autoload.php` is missing.
2. **Node deps** — `npm install` if `node_modules` is missing, stale (newer
   `package-lock.json`), or built for a different OS/arch (`.docker-platform`).
3. **`.env`** — copies `docker/.env.docker` if `.env` is absent, then
   `php artisan key:generate`.
4. **Cache clear** — `php artisan config:clear` + `view:clear` so a stale
   `.env` from a previous tunnelled run (e.g. an old ngrok session domain)
   cannot leak into the boot. Compose `environment:` values still win at
   runtime.
5. **Frontend** — runs `npx vite build` only when `public/build/manifest.json`
   is missing or any file under `resources/`, `vite.config.js`, or
   `package.json` is newer than the manifest.
6. **Database** — waits up to 60 s for MySQL, then `php artisan migrate
   --force`. Seeds via `DatabaseSeeder` only when the `users` table is empty.
   Both are idempotent.

The vite container shares the entrypoint but compose passes it a `command:`,
so the entrypoint detects this and skips steps 3–6 (the app container already
handled them; the dev server builds on demand).

## Typical workflows

```bash
# First-time clone or fresh boot
docker compose -f docker/docker-compose.yml up -d
# → migrate + seed run automatically; app at http://localhost:8000

# After `git pull` (new migrations, new seeder data, new frontend code)
docker compose -f docker/docker-compose.yml restart app
# → new migrations applied; stale assets rebuilt; seed is skipped because
#   users still exist (data preserved).

# Wipe and reseed (when seeder logic changed and you want fresh demo data)
docker compose -f docker/docker-compose.yml exec -T app \
    php artisan migrate:fresh --seed --force

# Nuke the DB volume entirely (last resort)
docker compose -f docker/docker-compose.yml down -v
docker compose -f docker/docker-compose.yml up -d
```

## Demo logins (seeded)

| Role       | Username | Password   |
|------------|----------|------------|
| manager    | E1001    | password   |
| technician | E1002    | password   |
| employee   | E1003    | password   |

## Troubleshooting

- **`/login` shows but nothing loads** — the cached `manifest.json` predates
  the current source. Restart the app container; the entrypoint will rebuild.
- **Login succeeds but every page is empty** — the `users` table somehow has
  rows but child tables don't. Run `migrate:fresh --seed --force` to reset.
- **`/api/*` returns 419 / CSRF mismatch** — leftover session cookies bound
  to an old `SESSION_DOMAIN` (e.g. ngrok). Clear browser cookies for
  `localhost`, then refresh.
- **Vite assets 404** — `ASSET_URL` env on the host is pointing somewhere
  other than `http://localhost:8000`. Unset it or re-run with
  `APP_URL=http://localhost:8000 ASSET_URL=http://localhost:8000 docker
  compose up -d`.
