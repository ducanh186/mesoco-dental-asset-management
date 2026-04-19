# Class Diagram

Tài liệu này phản ánh scope mới nhất theo yêu cầu khách hàng: phần tài khoản/quyền có khóa chính và khóa ngoại rõ ràng; phần nghiệp vụ chính gồm 4 luồng có bảng chính và bảng chi tiết.

## 1. Tài khoản và phân quyền

```mermaid
classDiagram
    direction LR

    class Role {
        +id PK
        code
        name
        description
        is_active
    }

    class Permission {
        +id PK
        code
        name
        description
    }

    class RolePermission {
        +role_id PK, FK
        +permission_id PK, FK
        granted_at
        note
    }

    class User {
        +id PK
        employee_id FK
        supplier_id FK
        role_id FK
        employee_code
        name
        email
        password
        status
    }

    class AccountRole {
        +user_id PK, FK
        +role_id PK, FK
        assigned_at
        status
        note
    }

    class Employee {
        +id PK
        employee_code
        full_name
        department
        position
        phone
        status
    }

    class Supplier {
        +id PK
        code
        name
        contact_person
        phone
        email
    }

    Role "1" --> "0..*" RolePermission : grants
    Permission "1" --> "0..*" RolePermission : included_in
    User "1" --> "0..*" AccountRole : assigned
    Role "1" --> "0..*" AccountRole : assigned_to
    Role "1" --> "0..*" User : canonical_role
    Employee "1" --> "0..1" User : login_account
    Supplier "1" --> "0..1" User : portal_account
```

## 2. Danh mục tài sản

```mermaid
classDiagram
    direction TB

    class Category {
        +id PK
        code
        name
        description
    }

    class Supplier {
        +id PK
        code
        name
    }

    class Asset {
        +id PK
        category_id FK
        supplier_id FK
        asset_code
        name
        type
        status
        location
        purchase_cost
        warranty_expiry
    }

    class AssetAssignment {
        +id PK
        asset_id FK
        employee_id FK
        assigned_by FK
        assigned_at
        unassigned_at
    }

    class Employee {
        +id PK
        employee_code
        full_name
    }

    class User {
        +id PK
        name
        role_id FK
    }

    Category "1" --> "0..*" Asset : classifies
    Supplier "1" --> "0..*" Asset : supplies
    Asset "1" --> "0..*" AssetAssignment : assigned_history
    Employee "1" --> "0..*" AssetAssignment : receives
    User "1" --> "0..*" AssetAssignment : performs
```

## 3. Bốn nghiệp vụ chính

```mermaid
classDiagram
    direction TB

    class PurchaseOrder {
        +id PK
        supplier_id FK
        requested_by_user_id FK
        approved_by_user_id FK
        order_code
        order_date
        expected_delivery_date
        status
        total_amount
        payment_method
    }

    class PurchaseOrderItem {
        +id PK
        purchase_order_id FK
        asset_id FK
        category_id FK
        item_name
        qty
        unit
        unit_price
        line_total
    }

    class MaintenanceEvent {
        +id PK
        asset_id FK
        assigned_to_user_id FK
        code
        type
        status
        planned_at
        priority
        cost
    }

    class MaintenanceDetail {
        +id PK
        maintenance_event_id FK
        asset_id FK
        technician_user_id FK
        supplier_id FK
        status
        issue_description
        action_taken
        cost
        completed_at
    }

    class Disposal {
        +id PK
        asset_id FK
        disposed_by_user_id FK
        approved_by_user_id FK
        code
        method
        reason
        disposed_at
        asset_book_value
        proceeds_amount
    }

    class DisposalDetail {
        +id PK
        disposal_id FK
        asset_id FK
        condition_summary
        asset_book_value
        proceeds_amount
        processed_at
    }

    class InventoryCheck {
        +id PK
        created_by_user_id FK
        completed_by_user_id FK
        code
        title
        check_date
        status
        location
    }

    class InventoryCheckItem {
        +id PK
        inventory_check_id FK
        asset_id FK
        counted_by_user_id FK
        expected_status
        actual_status
        expected_location
        actual_location
        result
        checked_at
    }

    class Asset {
        +id PK
        asset_code
        name
        status
        location
    }

    class Supplier {
        +id PK
        name
    }

    class User {
        +id PK
        name
        role_id FK
    }

    Supplier "1" --> "0..*" PurchaseOrder : receives
    User "1" --> "0..*" PurchaseOrder : creates_or_approves
    PurchaseOrder "1" --> "1..*" PurchaseOrderItem : has_details
    Asset "0..1" --> "0..*" PurchaseOrderItem : created_or_linked

    Asset "1" --> "0..*" MaintenanceEvent : maintained
    User "0..1" --> "0..*" MaintenanceEvent : assigned
    MaintenanceEvent "1" --> "0..1" MaintenanceDetail : has_detail
    Supplier "0..1" --> "0..*" MaintenanceDetail : external_support

    Asset "1" --> "0..*" Disposal : disposed
    User "0..1" --> "0..*" Disposal : performs_or_approves
    Disposal "1" --> "1..*" DisposalDetail : has_details
    Asset "1" --> "0..*" DisposalDetail : disposed_item

    User "0..1" --> "0..*" InventoryCheck : creates_or_completes
    InventoryCheck "1" --> "1..*" InventoryCheckItem : has_details
    Asset "1" --> "0..*" InventoryCheckItem : counted_item
    User "0..1" --> "0..*" InventoryCheckItem : counted_by
```

## Ghi chú đọc sơ đồ

- `PK` là Primary Key, định danh duy nhất của một bản ghi.
- `FK` là Foreign Key, cột dùng để liên kết sang bảng khác.
- `1`, `0..1`, `0..*`, `1..*` lần lượt nghĩa là một, có thể không có hoặc một, có thể nhiều, và ít nhất một.
- Bảng `requests`, `request_items`, `request_events` không còn nằm trong scope hiện tại.
