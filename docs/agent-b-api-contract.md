# Agent B API/Data Contract

Date: 2026-05-20

Scope: backend P0 contract for Agent A frontend integration. No frontend files are changed by Agent B.

## Authentication

All routes below are under `/api` and require the existing authenticated API session/token.

Role constraints from current `routes/api.php`:

- `GET /api/reports/summary`, `GET|POST /api/reports/export`, and write purchase-order routes are manager-only.
- `GET /api/purchase-orders`, `GET /api/purchase-orders/{purchaseOrder}`, and `PATCH /api/purchase-orders/{purchaseOrder}/status` are manager/supplier.
- `GET /api/requests` and `POST /api/requests` are authenticated user routes.
- `GET /api/my-assigned-assets/dropdown` and `GET /api/department-assets/dropdown` are authenticated user routes.

## Reports

### GET `/api/reports/summary`

Purpose: dashboard/report summary.

Query params:

- `from`: optional date, `YYYY-MM-DD`; defaults to current month start.
- `to`: optional date, `YYYY-MM-DD`; defaults to current month end.

Sample response:

```json
{
  "period": {
    "from": "2026-05-01",
    "to": "2026-05-31"
  },
  "assets": {
    "total": 10,
    "active": 6,
    "locked": 2,
    "off_service": 1,
    "maintenance": 1,
    "retired": 2,
    "deprecation_threshold_75_pct": 3,
    "depreciation_threshold_75_pct": 3,
    "by_status": {
      "active": 6,
      "off_service": 1,
      "maintenance": 1,
      "retired": 2
    }
  },
  "disposal": {
    "eligible": 3,
    "retired_total": 2,
    "retired_in_period": 1,
    "by_method": {
      "destroy": 1,
      "liquidation": 0,
      "scrap": 0,
      "other": 0
    },
    "recovered_value": 0
  },
  "report_types": [
    { "key": "device_status", "label": "Báo cáo trạng thái thiết bị", "exportable": true },
    { "key": "depreciation_remaining_value", "label": "Báo cáo khấu hao / giá trị còn lại", "exportable": true },
    { "key": "disposal_proposal", "label": "Báo cáo đề xuất thu hủy", "exportable": true },
    { "key": "lifecycle_analysis", "label": "Báo cáo phân tích vòng đời", "exportable": true, "method": "rule_based" }
  ]
}
```

Notes:

- `disposal.eligible`, `assets.deprecation_threshold_75_pct`, and `assets.depreciation_threshold_75_pct` use the same rule: asset is not retired and depreciation percentage is `>= 75`.
- Both `deprecation_threshold_75_pct` and `depreciation_threshold_75_pct` are present for compatibility. Agent A should prefer the correctly spelled `depreciation_threshold_75_pct`.

### POST `/api/reports/export`

Purpose: export CSV reports.

`GET /api/reports/export` is also supported for compatibility, but Agent A should call `POST`.

Request body:

```json
{
  "type": "device_status"
}
```

Supported `type` values:

- `device_status`
- `disposal_proposal`

Success response:

- HTTP `200`
- `Content-Type: text/csv; charset=UTF-8`
- Attachment download file name:
  - `device-status.csv` for `device_status`
  - `disposal-proposal.csv` for `disposal_proposal`

`device_status` CSV columns:

```csv
Asset Code,Name,Category,Status,Location,Purchase Date
IT-LAP-1001,Developer Laptop,Laptop,active,Office A,2026-01-01
```

`disposal_proposal` CSV columns:

```csv
Asset Code,Name,Category,Status,Purchase Date,Purchase Cost,Accumulated Depreciation,Depreciation Percentage,Current Book Value
IT-LAP-1001,Old Laptop,Laptop,active,2020-01-01,10000,7500,75,2500
```

Empty-data behavior:

- Still returns HTTP `200`.
- Still streams CSV with only the header row.
- Does not crash when there are no eligible disposal proposal rows.

Validation error:

```json
{
  "message": "The type field is required.",
  "errors": {
    "type": ["The type field is required."]
  }
}
```

## Purchase Orders

### POST `/api/purchase-orders`

Purpose: create a purchase order from manager UI.

Minimal request body accepted by backend:

```json
{
  "supplier_id": 1,
  "items": [
    {
      "item_name": "PC văn phòng",
      "qty": 2,
      "unit": "cái",
      "note": "Nhập giá sau khi nhận hàng"
    }
  ],
  "note": "Đơn hàng tạo từ UI"
}
```

Optional request fields:

- `order_date`: optional date. If omitted or empty, backend defaults to today's date.
- `expected_delivery_date`: optional date, must be after or equal to `order_date` when provided.
- `status`: optional, defaults to `preparing`.
- `payment_method`: optional string.
- `items.*.unit_price`: optional numeric value. If omitted/null/empty, backend stores `unit_price` and `line_total` as `null`.
- `items.*.asset_id`: optional existing asset id.
- `items.*.category_id`: optional existing category id.

Required request fields:

- `supplier_id`
- `items` array with at least one item
- `items.*.item_name`
- `items.*.qty`
- `items.*.unit`

Sample success response:

```json
{
  "message": "Tạo đơn hàng thành công.",
  "data": {
    "id": 12,
    "order_code": "PO-202605-0012",
    "order_date": "2026-05-20",
    "expected_delivery_date": null,
    "status": "preparing",
    "status_label": "Chờ giao hàng",
    "payment_method": null,
    "total_amount": null,
    "note": "Đơn hàng tạo từ UI",
    "items_count": 1,
    "supplier": {
      "id": 1,
      "code": "SUP-001",
      "name": "Mesoco Supplier",
      "contact_person": "Nguyen Van A",
      "email": "supplier@example.com"
    },
    "requester": {
      "id": 2,
      "name": "Manager User",
      "employee_code": "EMP002"
    },
    "approver": {
      "id": 2,
      "name": "Manager User",
      "employee_code": "EMP002"
    },
    "items": [
      {
        "id": 99,
        "item_name": "PC văn phòng",
        "qty": "2.00",
        "unit": "cái",
        "unit_price": null,
        "line_total": null,
        "note": "Nhập giá sau khi nhận hàng",
        "asset_id": null,
        "category_id": null
      }
    ]
  },
  "supplier_notification": {
    "status": "sent"
  }
}
```

Known frontend rule:

- Do not send `line_total`; backend rejects `items.*.line_total`.

## Repair/Issue Requests

The active repair/issue request type is `JUSTIFICATION`.

### GET `/api/my-assigned-assets/dropdown`

Alias: `GET /api/department-assets/dropdown`

Purpose: fetch assets that the current user can use when creating a repair/issue request.

Response shape:

```json
{
  "data": [
    {
      "value": 93,
      "label": "IT-LAP-1001 - Employee Laptop",
      "asset_code": "IT-LAP-1001",
      "name": "Employee Laptop",
      "type": "device",
      "category": "PC",
      "raw_category": "Laptop",
      "location": {
        "id": 4,
        "code": "HCM-01",
        "name": "Ho Chi Minh Office",
        "description": null
      },
      "location_name": "HCM-01 - Ho Chi Minh Office",
      "responsible_employee": {
        "id": 7,
        "employee_code": "EMP007",
        "full_name": "Nguyen Van B",
        "position": "Developer",
        "department": "Engineering",
        "user": {
          "id": 8,
          "username": "employee",
          "full_name": "Nguyen Van B",
          "status": "active"
        }
      },
      "assignedTo": "Nguyen Van B",
      "status": "active",
      "is_locked": false
    }
  ]
}
```

Selection rule:

- Agent A should populate the repair/issue asset picker from this endpoint.
- It returns only active assets assigned/handed-over to the current user's employee profile.
- If the user has no linked employee profile, it returns `{ "data": [] }`.

### POST `/api/requests`

Purpose: create a repair/issue request or consumable request.

Repair/issue request body:

```json
{
  "type": "JUSTIFICATION",
  "title": "Laptop không lên nguồn",
  "description": "Máy không phản hồi khi bấm nút nguồn.",
  "severity": "HIGH",
  "incident_at": "2026-05-20 09:30:00",
  "suspected_cause": "OTHER",
  "items": [
    {
      "item_kind": "ASSET",
      "asset_id": 93,
      "note": "Cần kỹ thuật kiểm tra"
    }
  ]
}
```

Backend validation:

- `type` must be one of active request types: `JUSTIFICATION`, `CONSUMABLE_REQUEST`.
- For `JUSTIFICATION`:
  - `severity` is required.
  - `items` is required.
  - each item must use `item_kind: "ASSET"`.
  - each item must include `asset_id`.
  - selected asset must currently be assigned/handed-over to the requester employee.

Validation error when user picks another user's asset:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "items.0.asset_id": [
      "Bạn chỉ có thể báo cáo sự cố cho thiết bị mình đang chịu trách nhiệm."
    ]
  }
}
```

Sample success response:

```json
{
  "message": "Request created successfully.",
  "request": {
    "id": 41,
    "code": "REQ-202605-0041",
    "type": "JUSTIFICATION",
    "status": "SUBMITTED",
    "title": "Laptop không lên nguồn",
    "description": "Máy không phản hồi khi bấm nút nguồn.",
    "severity": "HIGH",
    "asset": {
      "id": 93,
      "asset_code": "IT-LAP-1001",
      "name": "Employee Laptop"
    },
    "items": [
      {
        "item_kind": "ASSET",
        "asset_id": 93,
        "note": "Cần kỹ thuật kiểm tra"
      }
    ]
  }
}
```

## Agent A Blockers / Coordination Notes

- No database migration is required for this backend patch.
- No response shape was removed.
- New report export returns CSV, not JSON, on success. Frontend should handle it as a file download/blob.
- For report summary, prefer `assets.depreciation_threshold_75_pct`; the misspelled `deprecation_threshold_75_pct` is kept only to avoid breaking existing dashboard code.
- For repair/issue requests, do not use legacy `/api/my-assets`; it intentionally returns `410 Gone`.
- Use `/api/my-assigned-assets/dropdown` or `/api/department-assets/dropdown` before `POST /api/requests` so Agent A only offers valid assets.
