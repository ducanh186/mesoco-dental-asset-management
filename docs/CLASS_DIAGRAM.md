# Class Diagram

Diagram này dùng cho báo cáo/luận văn. Mục tiêu là mô tả nghiệp vụ chính, không liệt kê mọi field kỹ thuật.

```mermaid
classDiagram
    class User {
        +id
        +name
        +email
        +role
        +status
    }

    class Employee {
        +id
        +employee_code
        +full_name
        +department
        +position
        +status
    }

    class Supplier {
        +id
        +code
        +name
        +email
        +status
    }

    class Asset {
        +id
        +asset_code
        +name
        +type
        +category
        +status
        +department_name
        +purchase_date
        +purchase_cost
        +useful_life_months
        +warranty_expiry
    }

    class Category {
        +id
        +code
        +name
    }

    class AssetAssignment {
        +id
        +asset_id
        +employee_id
        +department_name
        +assigned_at
        +returned_at
    }

    class MaintenanceEvent {
        +id
        +code
        +asset_id
        +type
        +status
        +planned_at
        +started_at
        +completed_at
        +cost
    }

    class MaintenanceDetail {
        +id
        +maintenance_event_id
        +asset_id
        +technician_user_id
        +issue_description
        +action_taken
        +cost
    }

    class InventoryCheck {
        +id
        +code
        +status
        +started_at
        +completed_at
    }

    class InventoryCheckItem {
        +id
        +inventory_check_id
        +asset_id
        +expected_status
        +actual_status
        +note
    }

    class PurchaseOrder {
        +id
        +order_code
        +supplier_id
        +status
        +order_date
        +total_amount
    }

    class PurchaseOrderItem {
        +id
        +purchase_order_id
        +item_name
        +quantity
        +unit_price
    }

    class AssetRequest {
        +id
        +code
        +type
        +status
        +title
        +severity
        +incident_at
    }

    class RequestItem {
        +id
        +request_id
        +item_name
        +quantity
        +unit
    }

    class Disposal {
        +id
        +code
        +method
        +reason
        +disposed_at
        +asset_book_value
    }

    User "1" --> "0..1" Employee : internal profile
    User "1" --> "0..1" Supplier : supplier account
    Category "1" --> "0..*" Asset : classifies
    Supplier "1" --> "0..*" Asset : supplies
    Asset "1" --> "0..*" AssetAssignment : handover history
    Employee "1" --> "0..*" AssetAssignment : receives when assigned
    Asset "1" --> "0..*" MaintenanceEvent : maintenance schedule
    MaintenanceEvent "1" --> "0..*" MaintenanceDetail : details
    User "1" --> "0..*" MaintenanceDetail : technician
    InventoryCheck "1" --> "0..*" InventoryCheckItem : contains
    Asset "1" --> "0..*" InventoryCheckItem : counted asset
    Supplier "1" --> "0..*" PurchaseOrder : receives orders
    PurchaseOrder "1" --> "1..*" PurchaseOrderItem : order lines
    Employee "1" --> "0..*" AssetRequest : creates
    Asset "0..1" --> "0..*" AssetRequest : incident target
    AssetRequest "1" --> "0..*" RequestItem : consumables
    Asset "1" --> "0..*" Disposal : retired records
```

## Cách Đọc Nhanh

- `Asset` là trung tâm hệ thống.
- `AssetAssignment` thể hiện bàn giao theo phòng ban hoặc nhân viên đại diện.
- `MaintenanceEvent` là phiếu bảo trì; `MaintenanceDetail` là dòng chi tiết xử lý.
- `InventoryCheck` và `InventoryCheckItem` phục vụ kiểm kê.
- `PurchaseOrder` và `Supplier` phục vụ mua sắm thiết bị/vật tư.
- `AssetRequest` chỉ còn báo sự cố và xin vật tư IT.
