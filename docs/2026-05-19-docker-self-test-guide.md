# Mesoco Docker Self-Test Guide - 2026-05-19

## 1. Current Test URLs

Docker is running with these ports:

- App / backend / built frontend: http://192.168.123.9:8000
- Vite dev server: http://192.168.123.9:5173
- MySQL from host machine: localhost:3307

If you test on the same laptop, `http://localhost:8000` also works. For another device on the same Wi-Fi/LAN, use `http://192.168.123.9:8000`.

## 2. Demo Accounts

| Role | Employee code | Password |
| --- | --- | --- |
| Manager | E1001 | password |
| Technician | E1002 | password |
| Employee | E1003 | password |

## 3. Quick Docker Checks

Run from `D:\CODE\mesoco-dental-asset-management`:

```powershell
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

Expected:

- `mesoco-app` is healthy and maps `0.0.0.0:8000->8000/tcp`.
- `mesoco-db` is healthy and maps `0.0.0.0:3307->3306/tcp`.
- `mesoco-vite` is up and maps `0.0.0.0:5173->5173/tcp`.

If you need to restart:

```powershell
scripts\docker-start.bat
```

If you need to stop:

```powershell
scripts\docker-stop.bat
```

## 4. Manager Smoke Test

Open:

```text
http://192.168.123.9:8000/login
```

Login:

- Username: `E1001`
- Password: `password`

Check:

- Sidebar starts with `Tổng quan`.
- `Quét QR thiết bị` is directly under `Tổng quan`.
- `Duyệt yêu cầu` is a top-level menu item.
- `Quản lý đơn hàng` is visible.
- User name is `Nguyen Van An`.
- No visible `Sơ đồ chức năng BFD`.

Go to:

```text
http://192.168.123.9:8000/purchase-orders
```

Check:

- Status filter only has `Chờ giao hàng` and `Giao hàng thành công`.
- List row action is `Chi tiết`.
- There are no direct row `Sửa` / `Xóa` actions.
- Open `Chi tiết`; edit/delete actions should be inside the detail modal.

Go to:

```text
http://192.168.123.9:8000/review-requests
```

Check:

- Request labels include `Bàn giao`, `Thu hồi`, `Sửa chữa`, `Thu hủy`.
- Dates are between `6/5/2026` and `13/5/2026`.
- Status labels are only `Chờ duyệt`, `Đã duyệt`, `Không duyệt`.
- List action is `Xem`; approve/reject actions should be inside the detail modal.

## 5. Employee Smoke Test

Logout, then login:

- Username: `E1003`
- Password: `password`

Check:

- Sidebar shows `Tổng quan`, `Quét QR thiết bị`, and `Phiếu yêu cầu`.
- Purchase orders are not visible.
- Open this URL directly:

```text
http://192.168.123.9:8000/purchase-orders
```

Expected:

- Employee should not get the purchase-order page.
- Current observed behavior: app redirects away from purchase orders.

## 6. Technician Smoke Test

Logout, then login:

- Username: `E1002`
- Password: `password`

Check:

- Purchase orders are not visible.
- `Quét QR thiết bị` and relevant request/repair/inventory menus are visible.
- Technician should only work with relevant/assigned operational data.

## 7. Automated Checks Already Run

Inside Docker:

```powershell
docker compose --env-file docker/.env.runtime -f docker/docker-compose.yml exec -T app php artisan test --filter=UserFacingCopyTest
```

Result:

- Passed: `Tests\Feature\UserFacingCopyTest`
- 1 test, 53 assertions

Before Docker smoke testing, the full local test suite was also run:

- `npm run check:i18n` passed.
- `npm run build` passed.
- `php artisan test` passed with 273 tests and 1272 assertions.

## 8. Firecrawl Note

Firecrawl CLI is authenticated, but it cannot scrape this LAN URL directly:

```text
http://192.168.123.9:8000/login
```

Reason:

- Firecrawl runs from an external/browser service context.
- `192.168.x.x` is a private LAN IP, so Firecrawl cannot reliably reach it from outside your machine/network.
- The CLI also rejects the private IP as not having a public top-level domain.

Use Browser/manual testing for this local Docker app. Use Firecrawl for public URLs or hosted staging URLs.
