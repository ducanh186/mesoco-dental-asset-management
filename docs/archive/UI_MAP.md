# Mesoco Dental — UI Map

## Navigation Structure

### All Roles
- Login
- Forgot Password (Step 1: Email → Step 2: Code + New Password)
- Change Password
- Profile (View/Edit)

### Doctor / Nurse
- Dashboard (shift check-in prompt)
- My Equipment (list + QR quick view)
- Equipment Justification (report issue)
- Asset Request (borrow/return, consumables)
- My Asset History
- Feedbacks

### Technician / Admin Staff
- Dashboard
- Inventory (stock overview)
- Asset Management (CRUD equipment)
- Review Requests (pending approvals)
- Maintenance Calendar
- Reports (asset value, depreciation)

### Owner / Admin
- Dashboard (overview metrics)
- All Technician/Admin features +
- Employee Management (CRUD + assign roles)
- Contracts (view PDFs)
- System Settings

---

## Screen List (MVP)

| # | Screen | Route | Roles |
|---|--------|-------|-------|
| 1 | Login | `/login` | Public |
| 2 | Forgot Password - Email | `/forgot-password` | Public |
| 3 | Forgot Password - Code | `/forgot-password/verify` | Public |
| 4 | Dashboard | `/` | All authenticated |
| 5 | Profile | `/profile` | All authenticated |
| 6 | Change Password | `/change-password` | All authenticated |
| 7 | My Equipment | `/my-equipment` | Doctor, Nurse |
| 8 | QR Scanner | `/scan` | Doctor, Nurse, Tech |
| 9 | Equipment Detail | `/equipment/:id` | All authenticated |
| 10 | Justification Form | `/justification/new` | Doctor, Nurse |
| 11 | Asset Request Form | `/request/new` | Doctor, Nurse |
| 12 | Review Requests | `/requests` | Tech, Admin |
| 13 | Inventory | `/inventory` | Tech, Admin |
| 14 | Asset List | `/assets` | Tech, Admin |
| 15 | Maintenance Calendar | `/maintenance` | Tech, Admin |
| 16 | Employees | `/employees` | Admin |
| 17 | Reports | `/reports` | Admin |

---

## Reusable Components

| Component | Description |
|-----------|-------------|
| `<AppLayout>` | Main layout với sidebar + header |
| `<AuthLayout>` | Layout cho login/forgot password |
| `<DataTable>` | Table với sort, filter, pagination |
| `<Modal>` | Dialog overlay |
| `<FormField>` | Label + input + error message |
| `<StatusBadge>` | Trạng thái thiết bị (Active, Off-service, etc.) |
| `<QRScanner>` | Camera scanner component |
| `<EquipmentCard>` | Card hiển thị thiết bị |
| `<RequestCard>` | Card hiển thị request pending |
| `<EmptyState>` | Placeholder khi không có data |
| `<LoadingSpinner>` | Loading indicator |

---

## User Flows

### Flow 1: Shift Check-in
```
Dashboard → Prompt check-in → Scan QR → Confirm → Success toast
```

### Flow 2: Report Issue
```
My Equipment → Select item → Justification → Fill form → Submit → Success
```

### Flow 3: Borrow Request
```
Dashboard → Asset Request → Select type → Fill form → Submit → Pending approval
```

### Flow 4: Review Request (Admin)
```
Review Requests → Select request → View details → Approve/Reject → Update status
```
