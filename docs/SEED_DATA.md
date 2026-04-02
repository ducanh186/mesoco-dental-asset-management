# Seed Data Documentation

> **Last Updated:** January 27, 2026  
> **Seeder:** `FinalMvpSeeder.php`

This document describes the demo data created by `FinalMvpSeeder` for MVP demonstration and testing purposes.

---

## Quick Start

### Safe Incremental Seed (Recommended)

Run this to add demo data to your **existing** database without losing current data:

```bash
php artisan db:seed --class=FinalMvpSeeder
```

### Fresh Database with All Seeds

Reset everything and start fresh:

```bash
php artisan migrate:fresh --seed
```

### Run via DatabaseSeeder

The `FinalMvpSeeder` can also be called from `DatabaseSeeder`:

```php
// In DatabaseSeeder.php
$this->call([
    ShiftSeeder::class,
    FinalMvpSeeder::class,
]);
```

---

## Demo Accounts

All demo accounts use the same password: **`password`**

| Employee Code | Name                  | Role         | Email               | Position              |
|---------------|-----------------------|--------------|---------------------|-----------------------|
| E0001         | Nguyễn Văn Admin      | **ADMIN**    | admin@mesoco.vn     | System Administrator  |
| E0002         | Trần Thị HR           | **HR**       | hr@mesoco.vn        | HR Manager            |
| E0003         | Dr. Lê Văn Bác Sĩ     | **DOCTOR**   | doctor1@mesoco.vn   | Senior Dentist        |
| E0004         | Dr. Phạm Thị Nha Sĩ   | **DOCTOR**   | doctor2@mesoco.vn   | Orthodontist          |
| E0005         | Hoàng Văn Kỹ Thuật    | **TECHNICIAN** | tech1@mesoco.vn   | Dental Technician     |
| E0006         | Võ Thị Kỹ Thuật Viên  | **TECHNICIAN** | tech2@mesoco.vn   | Lab Technician        |
| E0007         | Đặng Văn Nhân Viên    | **EMPLOYEE** | staff1@mesoco.vn    | Receptionist          |
| E0008         | Bùi Thị Lễ Tân        | **EMPLOYEE** | staff2@mesoco.vn    | Dental Assistant      |

### Employees Without User Accounts

These employees exist but don't have login credentials (for testing assignment without login):

| Employee Code | Name               | Position        |
|---------------|--------------------|-----------------|
| E0009         | Ngô Văn Pending    | Trainee Dentist |
| E0010         | Lý Thị Thực Tập    | Intern          |

---

## Locations

| Name                      | Description                              |
|---------------------------|------------------------------------------|
| Main Clinic - District 1  | Primary dental clinic with 5 treatment rooms |
| Branch Clinic - District 3 | Branch office with 3 treatment rooms    |
| Storage Warehouse         | Central storage for equipment and supplies |

---

## Shifts

| Code | Name            | Time          |
|------|-----------------|---------------|
| S1   | Morning Shift   | 08:00 - 12:00 |
| S2   | Afternoon Shift | 13:00 - 17:00 |
| S3   | Evening Shift   | 18:00 - 21:00 |

---

## Assets Summary

Total: **65 assets** with MSA-XXXX code pattern

### By Type

| Type      | Count | Asset Codes          |
|-----------|-------|----------------------|
| Machine   | 10    | MSA-0001 to MSA-0010 |
| Equipment | 40    | MSA-0011 to MSA-0020, MSA-0036 to MSA-0065 |
| Tool      | 8     | MSA-0021 to MSA-0028 |
| Tray      | 5     | MSA-0029 to MSA-0033 |
| Other     | 2     | MSA-0034 to MSA-0035 |

### By Status

| Status      | Count | Examples                           |
|-------------|-------|------------------------------------|
| Active      | 55    | Most assets                        |
| Maintenance | 6     | MSA-0019, MSA-0042, MSA-0064       |
| Off-Service | 2     | MSA-0009, MSA-0043                 |
| Retired     | 2     | MSA-0020, MSA-0065                |

### High-Value Assets (> 50M VND)

| Code     | Name                      | Purchase Cost |
|----------|---------------------------|---------------|
| MSA-0010 | Dental CT Scanner (CBCT)  | 350,000,000 ₫ |
| MSA-0005 | CAD/CAM Milling Machine   | 250,000,000 ₫ |
| MSA-0001 | Dental Panoramic X-Ray    | 120,000,000 ₫ |
| MSA-0019 | Intraoral Scanner         | 95,000,000 ₫  |
| MSA-0011 | Dental Chair Unit #1      | 85,000,000 ₫  |

### Warranty Status

| Status              | Count | Examples                     |
|---------------------|-------|------------------------------|
| Valid (> 6 months)  | 25+   | Most recent purchases        |
| Expiring Soon       | 3     | MSA-0004, MSA-0014, MSA-0015 |
| Expired             | 5+    | MSA-0007, MSA-0009, MSA-0020 |

---

## Assignments

### Active Assignments (13 total)

| Employee   | Role       | Assets Assigned                  |
|------------|------------|----------------------------------|
| E0003      | Doctor     | MSA-0002, MSA-0014, MSA-0021     |
| E0004      | Doctor     | MSA-0013, MSA-0032               |
| E0005      | Technician | MSA-0003, MSA-0004, MSA-0022     |
| E0006      | Technician | MSA-0005, MSA-0019               |
| E0007      | Staff      | MSA-0029                         |
| E0008      | Staff      | MSA-0030, MSA-0031               |

### Historical Assignments (for testing history view)

- MSA-0011 was previously assigned to E0003, then unassigned
- MSA-0016 was previously assigned to E0005, then unassigned

---

## Requests

### Request Summary (10 total)

| Code             | Type               | Status    | Requested By |
|------------------|--------------------|-----------|--------------|
| REQ-202501-0001  | JUSTIFICATION      | SUBMITTED | E0003        |
| REQ-202501-0002  | JUSTIFICATION      | APPROVED  | E0005        |
| REQ-202501-0003  | JUSTIFICATION      | REJECTED  | E0004        |
| REQ-202501-0004  | ASSET_LOAN         | SUBMITTED | E0006        |
| REQ-202501-0005  | ASSET_LOAN         | APPROVED  | E0003        |
| REQ-202501-0006  | ASSET_LOAN         | CANCELLED | E0008        |
| REQ-202501-0007  | CONSUMABLE_REQUEST | SUBMITTED | E0007        |
| REQ-202501-0008  | CONSUMABLE_REQUEST | APPROVED  | E0005        |
| REQ-202501-0009  | CONSUMABLE_REQUEST | REJECTED  | E0004        |
| REQ-202501-0010  | CONSUMABLE_REQUEST | SUBMITTED | E0003        |

### By Status

| Status    | Count |
|-----------|-------|
| SUBMITTED | 4     |
| APPROVED  | 3     |
| REJECTED  | 2     |
| CANCELLED | 1     |

---

## QR Identities

All 65 assets have QR identities with:
- **Format:** `MESOCO|ASSET|v1|<uuid>`
- **Payload Version:** v1

Example QR codes to test scanning:

```
Asset: MSA-0001 (Dental Panoramic X-Ray)
QR Payload: MESOCO|ASSET|v1|<auto-generated-uuid>

Asset: MSA-0011 (Dental Chair Unit #1)
QR Payload: MESOCO|ASSET|v1|<auto-generated-uuid>
```

> Note: UUIDs are auto-generated on first seed. Query the database to get actual values.

---

## Check-ins

### Check-in Records (8 total)

| Asset    | Employee | Shift     | Status       |
|----------|----------|-----------|--------------|
| MSA-0002 | E0003    | Morning   | Completed    |
| MSA-0014 | E0003    | Afternoon | Completed    |
| MSA-0021 | E0003    | Morning   | Completed    |
| MSA-0003 | E0005    | Morning   | Completed    |
| MSA-0004 | E0005    | Afternoon | Completed    |
| MSA-0013 | E0004    | Morning   | Completed    |
| MSA-0032 | E0004    | Morning   | **Active** ⏳ |
| MSA-0029 | E0007    | Morning   | Completed    |

---

## Test Scenarios

Use this data to verify the following features:

### ✅ Authentication & RBAC

1. Login as each role (admin, hr, doctor, technician, employee)
2. Verify menu visibility per role
3. Test unauthorized access attempts

### ✅ Asset Management

1. View asset list with filters (type, status, category)
2. Check depreciation calculations
3. View assets with expired/expiring warranties
4. Search by asset code (MSA-XXXX)

### ✅ Inventory & Valuation

1. View inventory summary by category
2. Check depreciation reports
3. Filter fully depreciated assets
4. Export asset valuation data

### ✅ Assignments

1. View current assignments per employee
2. Check assignment history
3. Assign/unassign assets (admin only)
4. View "My Assets" for logged-in user

### ✅ Requests

1. Create new requests (all types)
2. Approve/reject requests (admin/hr)
3. View request history
4. Check request events timeline

### ✅ Check-in/Check-out

1. Scan QR to check-in
2. Manual check-in
3. View active check-ins
4. Complete check-out

---

## Idempotency

The seeder uses `updateOrCreate` pattern, meaning:

- ✅ Safe to run multiple times
- ✅ Won't duplicate data
- ✅ Updates existing records with same identifiers
- ✅ Wrapped in DB transaction (all-or-nothing)

---

## Customization

To add more demo data, edit [FinalMvpSeeder.php](../database/seeders/FinalMvpSeeder.php):

```php
// Add new asset
$assetsData[] = [
    'asset_code' => 'MSA-0066',
    'name' => 'New Equipment',
    'type' => Asset::TYPE_EQUIPMENT,
    // ... other fields
];
```

Then re-run the seeder:

```bash
php artisan db:seed --class=FinalMvpSeeder
```
