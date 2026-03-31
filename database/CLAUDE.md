# Database (database/)

## Migrations

Key tables:
- `users` — login accounts with `employee_id` FK, `role`, `must_change_password`
- `employees` — HR records: `full_name`, `department`, `employee_code`
- `assets` — equipment with valuation fields (`purchase_cost`, `useful_life_months`, `salvage_value`, `depreciation_method`) and off-service fields
- `asset_assignments` — tracks which employee has which asset
- `asset_checkins` — check-in/check-out logs
- `requests` — asset request state machine (model is `AssetRequest`)
- `maintenance_events` — maintenance/repair records
- `locations` — physical locations/rooms
- `asset_qr_identities` — QR code tracking
- `asset_code_sequences` — auto-generated asset codes

## Seeders

- All demo accounts use password `password`
- Employee codes: E0001 (admin), E0002 (hr), E0003 (doctor), E0004 (technician), E0005 (employee)
- Run `php artisan migrate:fresh --seed` to reset

## Depreciation

Straight-line method:
```
Monthly Depreciation = (Purchase Cost - Salvage Value) / Useful Life (months)
Accumulated Depreciation = Monthly × Months Elapsed
Current Book Value = Purchase Cost - Accumulated Depreciation
```

Business rule: Depreciation > 70% → eligible for disposal (phiếu thu hủy)
