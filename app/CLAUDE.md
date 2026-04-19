# Backend Architecture (app/)

## Controllers (`Http/Controllers/`)

- `AuthController` — login/logout/me, uses `AuthService`
- `AssetController` — full CRUD + search, category/type enums
- `AssetAssignmentController` — assign/unassign equipment to employees
- `AssetCheckinController` — check-in/check-out tracking
- `InventoryController` — inventory listing, valuation/depreciation calculations, inventory checks
- `AssetOffServiceController` — lock/unlock assets (off-service management)
- `MaintenanceEventController` — maintenance scheduling and records
- `EmployeeController` — employee CRUD (HR records)
- `LocationController` — location/room management
- `FeedbackController` — user feedback/suggestions
- `ReportController` — reports and statistics

## Models (`Models/`)

- `Asset` — core model, has depreciation calculation methods, status state machine
- `InventoryCheck` / `InventoryCheckItem` — inventory audit header and detail rows
- `MaintenanceDetail` / `DisposalDetail` — detail rows for maintenance and disposal
- `Employee` — HR record, distinct from User
- `User` — login account, has `employee_id` FK

## Middleware (`Http/Middleware/`)

- `CheckRole` — RBAC gate (`role:manager,technician`)
- `CheckMustChangePassword` — forces password change on first login

## Services (`Services/`)

- `AuthService` — authentication logic, password reset

## Policies (`Policies/`)

- Ownership and role checks for assets, maintenance, check-ins, users, and feedback.

## FormRequests (`Http/Requests/`)

- Server-side validation with `authorize()` method for role checks
