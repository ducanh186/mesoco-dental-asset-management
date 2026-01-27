# Database Conventions

This document describes the database naming conventions and design patterns used in the Mesoco Dental Asset Management system.

## ID Field Conventions

### `employee_id` vs `user_id`

The system distinguishes between **Employees** (HR records) and **Users** (system accounts):

| Field | Table | Description | FK Target |
|-------|-------|-------------|-----------|
| `employee_id` | asset_assignments | Physical person responsible for asset | employees.id |
| `employee_id` | asset_checkins | Person performing check-in | employees.id |
| `user_id` | users | Employee's system account (nullable) | employees.id |
| `user_id` | request_events | System user who performed action | users.id |

### Key Relationships

```
┌─────────────┐         ┌─────────────┐
│  Employee   │ 1────0..1│    User     │
│  (HR Record)│         │  (Account)  │
├─────────────┤         ├─────────────┤
│ id (PK)     │◄────────│ employee_id │
│ code        │         │ role        │
│ name        │         │ email       │
│ department  │         │ password    │
└─────────────┘         └─────────────┘
       │
       │ 1
       ▼
       *
┌─────────────────┐
│ AssetAssignment │
├─────────────────┤
│ asset_id        │
│ employee_id     │◄─── The person holding the asset
│ assigned_at     │
│ returned_at     │
└─────────────────┘
```

### When to Use Each

| Use Case | Use Field | Example |
|----------|-----------|---------|
| Asset is assigned to someone | `employee_id` | "Dr. Nguyen is responsible for this ultrasonic scaler" |
| Someone checks in for shift | `employee_id` | "Dr. Nguyen checked in at 8:00 AM" |
| Audit trail of system actions | `user_id` | "HR admin approved this request" |
| Login/authentication | `user_id` | "User logged in at 9:00 AM" |

## Table Naming

- Use **snake_case** for table names: `asset_assignments`, `request_items`
- Use **plural** form: `employees`, `assets`, `locations`
- Pivot tables: alphabetical order: `asset_employee` (not used), `employee_shift`

## Column Naming

- Primary key: always `id` (auto-increment bigint)
- Foreign keys: `{referenced_table_singular}_id` → `employee_id`, `asset_id`
- Timestamps: `created_at`, `updated_at`, `deleted_at` (soft deletes)
- Boolean flags: `is_*` prefix → `is_active`, `is_verified`
- Dates: `*_at` suffix for datetimes, `*_date` for dates only
- Monetary values: store as `decimal(15,2)` with `_cost` or `_value` suffix

## Status Enums

### Asset Status
```php
enum AssetStatus: string {
    case AVAILABLE = 'available';      // Ready to assign
    case IN_USE = 'in_use';           // Currently assigned
    case MAINTENANCE = 'maintenance';  // Under repair
    case RETIRED = 'retired';         // End of life
}
```

### Request Status
```php
enum RequestStatus: string {
    case PENDING = 'pending';
    case APPROVED = 'approved';
    case REJECTED = 'rejected';
    case CANCELLED = 'cancelled';
}
```

## Soft Deletes

Tables using soft deletes (have `deleted_at` column):
- `assets` - Retired assets kept for history
- `users` - Deactivated accounts

Tables using `is_active` flag instead:
- `locations` - May have assets still referencing them
- `employees` - Employment status tracking

## Indexing Strategy

### Required Indexes
- All foreign keys
- Frequently filtered columns: `status`, `is_active`, `created_at`
- Search columns: `name`, `asset_code`, `employee_code`

### Composite Indexes
```sql
-- Asset search
INDEX idx_assets_search (status, is_active, asset_code)

-- Assignment lookup
INDEX idx_assignments_active (asset_id, returned_at)

-- Check-in queries
INDEX idx_checkins_date (employee_id, checked_in_at)
```

## Migration Naming

Format: `{YYYY_MM_DD_HHMMSS}_{action}_{table}_table.php`

Examples:
- `2024_01_01_000001_create_employees_table.php`
- `2024_01_15_000001_create_locations_table.php`
- `2024_02_01_000001_add_warranty_fields_to_assets_table.php`

## Data Integrity

### Cascading Rules

| Parent | Child | On Delete | Reason |
|--------|-------|-----------|--------|
| employees | asset_assignments | RESTRICT | Preserve assignment history |
| employees | users | SET NULL | User can exist without employee link |
| assets | asset_assignments | CASCADE | Assignment meaningless without asset |
| assets | asset_qr_identities | CASCADE | QR tied to specific asset |

### Constraints

```sql
-- Assets must have positive values
CHECK (purchase_cost >= 0)
CHECK (useful_life_months > 0 OR useful_life_months IS NULL)

-- Assignments must have valid dates
CHECK (returned_at IS NULL OR returned_at >= assigned_at)

-- Location names must be unique
UNIQUE (name) ON locations
```

## Query Patterns

### Getting Active Assignments
```php
// Current holder of an asset
Asset::find($id)->currentAssignment?->employee;

// All assets held by an employee
Employee::find($id)->currentAssets;
```

### Filtering by Employee via User
```php
// Get user's employee record, then filter
$employeeId = auth()->user()->employee_id;
AssetCheckin::where('employee_id', $employeeId)->get();
```

### Audit Trail
```php
// Who approved a request?
$request->events()->where('action', 'approved')->first()->user;
```
