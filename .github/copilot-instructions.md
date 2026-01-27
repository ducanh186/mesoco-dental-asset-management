# Mesoco Dental Asset Management — Project Guide & AI Coding Rules

> **Stack:** Laravel 12 API + React 19 SPA
> **Auth:** Sanctum **cookie-based** (session-style), **not** token-based
> **Goal:** Dental clinic asset lifecycle: asset master → assignment → check-in/out → requests → inventory/valuation → maintenance/off-service → reporting

---

## 1) Architecture Overview

### 1.1 System shape

* **Backend:** Laravel API (`/api/*`) provides domain logic, RBAC, validation, persistence, reporting.
* **Frontend:** React SPA consumes APIs via a shared API client (`resources/js/services/api.js`) and renders inside a consistent shell (Sidebar + Topbar + AdminLayout).
* **Auth flow:** Login creates a Sanctum session cookie; subsequent requests are authenticated by cookies (CSRF rules apply).

### 1.2 Key domains and why they matter

#### Employee vs User (core concept)

* **Employee** = HR record in `employees` table (clinic staff identity, employment metadata).
* **User** = system login account in `users` table.
* **Relationship:** A user may link to an employee via `users.employee_id` (Employee may exist without a User).
* **Asset ownership convention:**

  * **Assignments** typically use `employee_id` (business ownership).
  * **Audit trails/check-ins** often use `user_id` (who performed the action).
* This distinction prevents “login account” from being treated as “HR identity” and avoids IDOR mistakes.

#### Roles (string-based)

* Roles are stored as a **string** in `users.role`.
* No separate roles table.
* Source of truth: `User::ROLES` constant (and helper methods like `isAdmin()`).

---

## 2) RBAC Enforcement Model (3 layers)

RBAC must be enforced on backend regardless of frontend visibility.

### Layer 1 — Route middleware (primary gate)

Use role middleware groups for admin-only or admin/hr endpoints.

```php
// routes/api.php
Route::middleware(['auth:sanctum', 'role:admin,hr'])->group(function () {
    Route::apiResource('employees', EmployeeController::class);
});
```

### Layer 2 — Form Request authorize()

When an endpoint uses a `FormRequest`, enforce role checks in `authorize()` so validation and auth logic are co-located.

```php
public function authorize(): bool
{
    return $this->user()?->isAdmin() || $this->user()?->isHr();
}
```

### Layer 3 — Policies (resource-level rules)

Use Policies for object-level permissions (ownership, cross-tenant safety, “can view this asset” rules).

---

## 3) API Conventions (must follow)

### 3.1 Response shapes (consistency rule)

All endpoints should return stable JSON shapes. Prefer:

* List endpoints: `{ data: [...], pagination: {...}, filters?: {...} }`
* Custom list endpoints may use domain keys (e.g., `assets`) but keep consistency within that module.

Example (paginated list):

```php
return response()->json([
    'assets' => $assets->items(),
    'pagination' => [
        'current_page' => $assets->currentPage(),
        'per_page' => $assets->perPage(),
        'total' => $assets->total(),
        'last_page' => $assets->lastPage(),
    ],
    'filters' => $appliedFilters,
]);
```

### 3.2 Query params

* Use snake_case query params: `fully_depreciated`, `warranty_expiring_soon`, `sort_by`, `sort_dir`, `per_page`, `page`.
* Filters must be applied **server-side before pagination** to avoid misleading results.

### 3.3 Errors

* Validation errors: standard Laravel 422 JSON errors.
* Forbidden: 403 with a human message.
* Frontend uses toast; backend must provide clean `message`.

---

## 4) Model & Domain Conventions

### 4.1 “Enums” as constants

Use class constants arrays, not PHP enums.

```php
class Asset extends Model
{
    public const TYPES = ['tray', 'machine', 'tool', 'equipment', 'other'];
    public const STATUSES = ['active', 'off_service', 'maintenance', 'retired'];
}
```

### 4.2 Scopes for filters

Any reusable filter should be a model scope (e.g., warranty, fully depreciated) so controller code stays thin and testable.

### 4.3 Ownership & audit naming rule

* Use `employee_id` for “who owns/uses this asset” (business context).
* Use `user_id` for “who clicked / approved / checked-in” (audit context).
* If a table uses a confusing legacy name, document it in `docs/DB_CONVENTIONS.md` and never guess—verify via migrations.

---

## 5) Database Conventions

### 5.1 Foreign keys

* Naming: `{table_singular}_id` (e.g., `asset_id`, `employee_id`, `user_id`).
* Prefer foreign keys for integrity, unless there is an intentional “free-text” field (document it).

### 5.2 Soft deletes

* Use SoftDeletes where data is operationally important (assets, users).
* Deletion semantics must be explicit (hard delete vs soft delete), especially for Locations when referenced.

### 5.3 Source of truth docs

* Follow `docs/DB_CONVENTIONS.md` for the full naming + relationship guide.

---

## 6) Frontend UI Baseline Rules (do not drift)

### 6.1 Layout

* Use the existing shell: `AdminLayout` + `Sidebar` + `Topbar`.
* Do not introduce new layout systems per page.

### 6.2 UI components

Reuse `resources/js/components/ui/*`:

* `Button`, `Card`, `Badge/StatusBadge`, `Table/TablePagination`, `Modal/ConfirmModal`, `Input`, `Select`, `Toast`.

### 6.3 Styling tokens

Use CSS variables from `resources/css/app.css` (OrangeHRM-inspired, primary orange).
Do **not** introduce new palettes unless explicitly requested.

### 6.4 States

Every data view must support:

* loading
* empty
* error (toast + optional inline)
* forbidden (toast; optionally inline)

---

## 7) Developer Workflow

### 7.1 Commands

```bash
# Quick local flow (SQLite / scripted)
scripts\demo.bat

# Docker development
scripts\docker-setup.bat
scripts\docker-start.bat

# Tests
php artisan test

# Fresh DB
php artisan migrate:fresh --seed
```

### 7.2 Test accounts (after seed)

| Role       | Employee Code | Password |
| ---------- | ------------- | -------- |
| admin      | E0001         | password |
| hr         | E0002         | password |
| doctor     | E0003         | password |
| technician | E0004         | password |
| staff      | E0005         | password |

> Login uses **employee_code + password**, not email.

### 7.3 Testing patterns

* Use `RefreshDatabase`.
* Create users with factories + role states.
* Always test RBAC + ownership.

```php
$admin = User::factory()->admin()->create();
$this->actingAs($admin)->getJson('/api/inventory/summary')->assertOk();
```

---

## 8) File Organization Patterns

| Concern        | Location                       | Notes                                    |
| -------------- | ------------------------------ | ---------------------------------------- |
| Controllers    | `app/Http/Controllers/`        | Keep thin; push logic to Models/Services |
| Form Requests  | `app/Http/Requests/`           | Validation + authorize()                 |
| Models         | `app/Models/`                  | Constants + scopes + computed fields     |
| Policies       | `app/Policies/`                | Resource-level checks                    |
| Feature tests  | `tests/Feature/`               | RBAC/ownership/API contract              |
| Unit tests     | `tests/Unit/`                  | Pure logic (e.g., depreciation math)     |
| Frontend pages | `resources/js/pages/`          | Page-level containers                    |
| UI components  | `resources/js/components/ui/`  | Reusable primitives                      |
| Layouts        | `resources/js/layouts/`        | Shell components                         |
| API client     | `resources/js/services/api.js` | Centralized API calls                    |

---

## 9) Security Rules (non-negotiable)

1. **Never rely on frontend checks** for permissions. Backend must enforce RBAC.
2. **Never auto-scope admin endpoints to current user.**

   * Use explicit `/my-*` endpoints for personal views (e.g., My Asset History).
3. **Prevent IDOR** by always verifying ownership/role in controllers/policies.
4. **Auth is cookie-based** (Sanctum). Respect CSRF requirements and same-site behavior.
5. **Login identifier is employee_code**, email is not the primary identifier (email may be for recovery only).
6. If `must_change_password` exists, keep it enforced before protected routes.

---

## 10) “Cuốn chiếu” rule for future phases

For every Phase X:

* ✅ APIs implemented + tests green + docs `docs/API_PHASEX.md`
* ✅ UI demo exists (React UI in repo OR `docs/ui-demo/phaseX/ui-demo-phaseX.html`)
* ✅ `docs/PHASEX_PACK.md` + `docs/REGRESSION_PHASEX.md`

---

