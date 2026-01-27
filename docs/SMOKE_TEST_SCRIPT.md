# Smoke Test Script — Mesoco Dental Asset Management

> **Duration:** ~10-15 minutes
> **Prerequisites:** Fresh seed data (`php artisan migrate:fresh --seed`)
> **Password:** `Password123!` for all test accounts

---

## Quick Setup

```bash
# Reset database with fresh seed data
php artisan migrate:fresh --seed

# Start development servers
npm run dev          # Terminal 1 - Vite
php artisan serve    # Terminal 2 - Laravel

# Open browser: http://localhost:8000
```

---

## Test Accounts

| Role | Login Code | Name |
|------|------------|------|
| Admin | E0001 | Nguyễn Văn Admin |
| HR | E0002 | Trần Thị HR |
| Doctor | E0003 | Dr. Lê Văn Bác Sĩ |
| Technician | E0005 | Hoàng Văn Kỹ Thuật |
| Staff | E0007 | Đặng Văn Nhân Viên |

---

## Smoke Test Checklist

### Phase A: Authentication (~2 min)

- [ ] **A1. Login as Admin (E0001)**
  - Enter `E0001` + `Password123!`
  - Verify: Dashboard loads with admin stats
  - Verify: Sidebar shows all menu items

- [ ] **A2. Logout**
  - Click logout button
  - Verify: Redirected to login page

- [ ] **A3. Login as Doctor (E0003)**
  - Verify: Dashboard shows "My Assets" focus
  - Verify: Sidebar hides admin-only items

---

### Phase B: Dashboard by Role (~2 min)

- [ ] **B1. Admin Dashboard**
  - Login as E0001
  - Verify: Shows global stats (Total Assets, Pending Requests, etc.)
  - Verify: Shows Recent Equipment table with all assets

- [ ] **B2. Doctor Dashboard**
  - Login as E0003
  - Verify: Shows "My Assets" count
  - Verify: Shows "My Pending Requests" 
  - Verify: Quick actions show role-appropriate buttons

---

### Phase C: Asset Management — Admin (E0001) (~3 min)

- [ ] **C1. View Assets List**
  - Navigate to Assets page
  - Verify: List shows ~35+ assets
  - Verify: Pagination works

- [ ] **C2. Create New Asset**
  - Click "Add Asset" button
  - Fill: Name "Test Scanner", Type "machine"
  - Submit and verify success toast
  - Verify: Asset code auto-generated (MSA-YYYY-XXXX pattern)

- [ ] **C3. Edit Asset**
  - Click edit on any asset
  - Change notes field
  - Save and verify update

- [ ] **C4. Assign Asset**
  - Find unassigned asset
  - Click Assign, select employee
  - Verify assignment success

---

### Phase D: Request Flow — Doctor (E0003) (~3 min)

- [ ] **D1. Create Justification Request**
  - Login as E0003
  - Navigate to Requests → New Request
  - Select "Justification" type
  - Fill required fields (asset, severity, justification)
  - Submit and verify success

- [ ] **D2. View My Requests**
  - Navigate to "My Requests"
  - Verify: Shows only own requests
  - Verify: New request appears in list

- [ ] **D3. Cancel Request**
  - Find a SUBMITTED request
  - Click Cancel
  - Verify: Status changes to CANCELLED

---

### Phase E: Request Review — HR (E0002) (~2 min)

- [ ] **E1. View Review Queue**
  - Login as E0002
  - Navigate to Review Requests
  - Verify: Shows SUBMITTED requests

- [ ] **E2. Approve Request**
  - Select a request
  - Click Approve
  - Add note (optional)
  - Verify: Status changes to APPROVED

- [ ] **E3. Reject Request**
  - Select another request
  - Click Reject
  - Add rejection reason
  - Verify: Status changes to REJECTED

---

### Phase F: Maintenance — Technician (E0005) (~2 min)

- [ ] **F1. View Maintenance Events**
  - Login as E0005
  - Navigate to Maintenance
  - Verify: List shows existing events

- [ ] **F2. Create Maintenance Event**
  - Click "Schedule Maintenance"
  - Select asset, type (repair), planned date
  - Submit and verify success

- [ ] **F3. Start Maintenance**
  - Find SCHEDULED event
  - Click "Start"
  - Verify: Status → IN_PROGRESS
  - Verify: Asset becomes locked

- [ ] **F4. Complete Maintenance**
  - Click "Complete"
  - Add result notes
  - Verify: Status → COMPLETED
  - Verify: Asset unlocked (if no other active events)

---

### Phase G: RBAC Enforcement (~2 min)

- [ ] **G1. Doctor Cannot Access Admin Pages**
  - Login as E0003
  - Manually navigate to `/employees`
  - Verify: 403 or redirect to dashboard

- [ ] **G2. Staff Cannot Access Maintenance**
  - Login as E0007
  - Navigate to Maintenance (if menu visible)
  - Verify: 403 Forbidden response

- [ ] **G3. HR Cannot Delete User**
  - Login as E0002
  - Navigate to Roles & Permission
  - Verify: Delete button not available OR 403 on attempt

---

### Phase H: Inventory & Reports — Admin (E0001) (~2 min)

- [ ] **H1. Inventory Summary**
  - Navigate to Inventory
  - Verify: Dashboard shows counts by status, category
  - Verify: Valuation totals displayed

- [ ] **H2. Export CSV**
  - Click "Export CSV"
  - Verify: File downloads
  - Verify: Contains expected columns

- [ ] **H3. Reports Page**
  - Navigate to Reports
  - Verify: Summary statistics load
  - Verify: Charts/data displayed

---

### Phase I: Feedback (~1 min)

- [ ] **I1. Submit Feedback**
  - Login as E0003
  - Navigate to Feedback → New
  - Submit feedback with rating
  - Verify: Success

- [ ] **I2. View Own Feedback**
  - Verify: Only own feedback visible

---

## Quick API Tests (Postman/curl)

```bash
# Login
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"employee_code":"E0001","password":"Password123!"}'

# Get Assets (authenticated)
curl http://localhost:8000/api/assets \
  -H "Accept: application/json" \
  --cookie "session_cookie_here"

# IDOR Test: Doctor accessing other's request (should 403)
# Login as E0003, try GET /api/requests/{other_user_request_id}
```

---

## Red Flags (Fail Criteria)

- [ ] 500 error on any page
- [ ] Login accepts wrong password
- [ ] Doctor can see all assets (not just assigned)
- [ ] Staff can access admin endpoints
- [ ] Locked asset allows check-in
- [ ] Approved request can be cancelled
- [ ] Empty dashboard for any role

---

## Sign-Off

| Tester | Date | Pass/Fail | Notes |
|--------|------|-----------|-------|
|        |      |           |       |

---

*Script created during Phase 9 Hardening.*
