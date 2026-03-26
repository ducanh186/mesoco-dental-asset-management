# Phase 2: RBAC + Profile — Implementation Summary

## Files Changed/Created

### Database
| File | Action | Description |
|------|--------|-------------|
| [database/migrations/2026_01_26_000001_create_employees_table.php](database/migrations/2026_01_26_000001_create_employees_table.php) | **Created** | Employees table: employee_code, full_name, position, dob, gender, phone, email, address, status |
| [database/migrations/2026_01_26_000002_refactor_users_for_employee_link.php](database/migrations/2026_01_26_000002_refactor_users_for_employee_link.php) | **Created** | Adds employee_id FK + must_change_password to users table |
| [database/seeders/DatabaseSeeder.php](database/seeders/DatabaseSeeder.php) | **Updated** | Creates test employees + users for all 5 roles, plus 2 employees without user accounts |

### Models
| File | Action | Description |
|------|--------|-------------|
| [app/Models/Employee.php](app/Models/Employee.php) | **Created** | Employee model with user relationship, profile editable fields constants |
| [app/Models/User.php](app/Models/User.php) | **Updated** | Added employee relationship, role constants, isAdmin(), hasRole() methods |

### Middleware
| File | Action | Description |
|------|--------|-------------|
| [app/Http/Middleware/CheckRole.php](app/Http/Middleware/CheckRole.php) | **Created** | RBAC middleware: `role:admin,hr` syntax |
| [app/Http/Middleware/CheckMustChangePassword.php](app/Http/Middleware/CheckMustChangePassword.php) | **Created** | Blocks access if must_change_password=true |
| [bootstrap/app.php](bootstrap/app.php) | **Updated** | Registered `role` and `must_change_password` middleware aliases |

### Policies
| File | Action | Description |
|------|--------|-------------|
| [app/Policies/EmployeePolicy.php](app/Policies/EmployeePolicy.php) | **Created** | Authorization for employee CRUD |
| [app/Policies/UserPolicy.php](app/Policies/UserPolicy.php) | **Created** | Authorization for user management |
| [app/Providers/AppServiceProvider.php](app/Providers/AppServiceProvider.php) | **Updated** | Registered policies via Gate::policy() |

### Form Requests
| File | Action | Description |
|------|--------|-------------|
| [app/Http/Requests/UpdateProfileRequest.php](app/Http/Requests/UpdateProfileRequest.php) | **Created** | Profile update validation, prohibits employee_code/email |
| [app/Http/Requests/StoreEmployeeRequest.php](app/Http/Requests/StoreEmployeeRequest.php) | **Created** | Create employee validation |
| [app/Http/Requests/UpdateEmployeeRequest.php](app/Http/Requests/UpdateEmployeeRequest.php) | **Created** | Update employee validation, prohibits employee_code change |
| [app/Http/Requests/StoreUserRequest.php](app/Http/Requests/StoreUserRequest.php) | **Created** | Create user account validation |
| [app/Http/Requests/UpdateUserRoleRequest.php](app/Http/Requests/UpdateUserRoleRequest.php) | **Created** | Update role only, prohibits employee_code/name/email/password |

### Controllers
| File | Action | Description |
|------|--------|-------------|
| [app/Http/Controllers/ProfileController.php](app/Http/Controllers/ProfileController.php) | **Created** | GET/PUT /api/profile |
| [app/Http/Controllers/EmployeeController.php](app/Http/Controllers/EmployeeController.php) | **Created** | Employee CRUD + available endpoint |
| [app/Http/Controllers/UserController.php](app/Http/Controllers/UserController.php) | **Created** | User CRUD + role-only PATCH |

### Routes
| File | Action | Description |
|------|--------|-------------|
| [routes/api.php](routes/api.php) | **Updated** | Added Phase 2 routes with RBAC middleware |

### Services
| File | Action | Description |
|------|--------|-------------|
| [app/Services/AuthService.php](app/Services/AuthService.php) | **Updated** | changePassword() now clears must_change_password flag |

### Postman
| File | Action | Description |
|------|--------|-------------|
| [scripts/generate-postman.mjs](scripts/generate-postman.mjs) | **Updated** | Added Phase 2 folder with all endpoints + test scripts |
| [postman/mesoco.postman_collection.json](postman/mesoco.postman_collection.json) | **Generated** | 28 total requests across 2 phases |
| [postman/mesoco.local.postman_environment.json](postman/mesoco.local.postman_environment.json) | **Updated** | Added role-specific variables |
| [postman/mesoco.docker.postman_environment.json](postman/mesoco.docker.postman_environment.json) | **Updated** | Added role-specific variables |

---

## API Endpoints (Phase 2)

### Profile (All authenticated users)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile` | Get own profile (from linked employee) |
| PUT | `/api/profile` | Update own profile (only editable fields) |

### Employees (Admin/HR only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employees` | List employees (search, status, has_user filters) |
| GET | `/api/employees/available` | Get employees without user accounts |
| POST | `/api/employees` | Create employee |
| GET | `/api/employees/{id}` | Get employee |
| PUT | `/api/employees/{id}` | Update employee |
| DELETE | `/api/employees/{id}` | Delete employee (fails if has user account) |

### Users / Roles & Permission (Admin/HR only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List users (search, role filters) |
| POST | `/api/users` | Create user account from employee |
| GET | `/api/users/{id}` | Get user |
| PATCH | `/api/users/{id}/role` | Update role only |
| DELETE | `/api/users/{id}` | Delete user (cannot delete self) |
| GET | `/api/roles` | Get available roles |

---

## Smoke-Test Checklist

### Prerequisites
```bash
# Reset database and run migrations
php artisan migrate:fresh --seed

# Start server
php artisan serve
```

### Test Accounts (all password: `password`)
| Role | Employee Code | Email |
|------|---------------|-------|
| admin | E0001 | admin@mesoco.vn |
| hr | E0002 | hr@mesoco.vn |
| doctor | E0003 | doctor@mesoco.vn |
| technician | E0004 | tech@mesoco.vn |
| employee | E0005 | employee@mesoco.vn |

### ✅ Admin Role Tests (E0001)
- [ ] Login as admin
- [ ] `GET /api/profile` → 200, returns profile data
- [ ] `PUT /api/profile` with valid fields → 200
- [ ] `PUT /api/profile` with `employee_code` → **422**
- [ ] `PUT /api/profile` with `email` → **422**
- [ ] `GET /api/employees` → 200, returns employee list
- [ ] `POST /api/employees` → 201, creates employee
- [ ] `GET /api/users` → 200, returns user list
- [ ] `POST /api/users` (employee_id=6, role=employee, default_password) → 201
- [ ] `PATCH /api/users/{id}/role` with role only → 200
- [ ] `PATCH /api/users/{id}/role` with `name` → **422**
- [ ] `PATCH /api/users/{id}/role` with `employee_code` → **422**
- [ ] `DELETE /api/users/{id}` (not self) → 200

### ✅ HR Role Tests (E0002)
- [ ] Login as HR
- [ ] `GET /api/employees` → 200 (HR can access)
- [ ] `GET /api/users` → 200 (HR can access)
- [ ] `POST /api/users` → 201 (HR can create)

### ✅ Doctor Role Tests (E0003) — RBAC 403 Verification
- [ ] Login as doctor
- [ ] `GET /api/profile` → 200 (doctors can view own profile)
- [ ] `PUT /api/profile` → 200 (doctors can update own profile)
- [ ] `GET /api/employees` → **403** (doctors cannot access)
- [ ] `POST /api/employees` → **403**
- [ ] `GET /api/users` → **403**
- [ ] `POST /api/users` → **403**

### ✅ Technician Role Tests (E0004)
- [ ] Login as technician
- [ ] `GET /api/employees` → **403**
- [ ] `GET /api/users` → **403**

### ✅ Regular Employee Tests (E0005)
- [ ] Login as employee
- [ ] `GET /api/profile` → 200
- [ ] `GET /api/employees` → **403**

### ✅ New User Flow (must_change_password)
1. Admin creates user for E0006 with default_password
2. Login as E0006 → check `must_change_password: true`
3. `POST /api/change-password` → 200
4. Re-login → check `must_change_password: false`

### ✅ Edge Cases
- [ ] `DELETE /api/users/{self}` → **422** "cannot delete your own account"
- [ ] `DELETE /api/employees/{id}` (employee has user) → **422**
- [ ] `POST /api/users` with already-linked employee_id → **422** unique constraint

---

## Architecture Notes

1. **Data Model Split**
   - `employees` table: Profile/HR data (full_name, position, dob, etc.)
   - `users` table: Auth account (employee_id FK, role, password)
   - One employee → One user (1:1 via FK)

2. **Role Storage**
   - `users.role` is a string column (enum in validation)
   - No separate `roles` table
   - Available roles: admin, hr, doctor, technician, employee

3. **Authorization Enforcement**
   - Route middleware: `role:admin,hr`
   - Form Request `authorize()` methods
   - Policies for fine-grained control
   - **Never rely on frontend menu hiding**

4. **Immutable Fields**
   - `employee_code` — cannot be changed via API (returns 422)
   - `email` — cannot be changed via profile update (returns 422)
   - Backend enforces these regardless of what frontend sends
