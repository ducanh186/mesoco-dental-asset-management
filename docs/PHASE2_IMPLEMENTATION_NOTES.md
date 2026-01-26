# Phase 2 Implementation Notes

## Role Mapping vs Specification

**Spec Phase 2** mentions 3 role groups:
- Doctor/Nurse
- Technician/Admin staff  
- Owner/Admin

**Current Implementation** uses 5 roles for finer control:

| Spec Group | Implementation | Access Level |
|------------|----------------|--------------|
| **Doctor/Nurse** | `doctor` | Can access own profile + patient data (Phase 3+) |
| **Technician/Admin staff** | `technician` + `employee` | Technicians handle equipment, employees general tasks |
| **Owner/Admin** | `admin` + `hr` | Admin = full system, HR = user/employee management |

### RBAC Implementation

- **Backend-enforced** via `CheckRole` middleware + Policies
- **Admin roles** (`admin`, `hr`) can manage employees and users  
- **Non-admin roles** get 403 for management endpoints
- **Immutable fields** (employee_code, email) return 422 if sent

### Must-Change-Password Flow

- New user accounts get `must_change_password=true`
- Blocks access with **409 Conflict** (not 403) - indicates solvable state
- **Allowlisted routes**: `/api/me`, `/api/profile`, `/api/change-password`, `/logout`
- Once password changed, `must_change_password=false` and full access granted

### Database Relationships

```
employees (profile data)
├── employee_code (unique)
├── full_name, position, dob, gender
├── phone, email (unique), address
└── status

users (auth accounts)
├── employee_id → employees.id (FK, unique)
├── role (admin|hr|doctor|technician|employee)
├── must_change_password (boolean)
└── standard auth fields
```

**Key Constraints:**
- 1 employee = max 1 user account
- employee_code and email are immutable once set
- Role changes only via PATCH /api/users/{id}/role

### Testing Coverage

✅ **47 API tests** covering:
- Auth flow (login, forgot password, change password)
- Profile CRUD with immutable field validation (422)
- Employee management (admin/hr only)
- User/role management with RBAC (403 for wrong roles)
- Must-change-password workflow (409 handling)

### Frontend Integration Notes

- **CORS/Sanctum**: Use `127.0.0.1:8000` consistently
- **CSRF Flow**: Call `/sanctum/csrf-cookie` before state-changing requests
- **Error Handling**: 
  - 403 = "Access Denied" (permanent)
  - 409 = "Password Change Required" (actionable)
  - 422 = "Invalid Data" (validation errors)
- **Session Management**: Maintain XSRF-TOKEN + laravel-session cookies