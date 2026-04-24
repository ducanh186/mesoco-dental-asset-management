# Copilot Instructions: Mesoco IT Asset Management

This repository is an IT Asset Management application for a technology company. The active product scope is department-based asset management, not personal borrow/return.

## Active Scope

- IT asset catalog: laptop, desktop, monitor, server, network, printer, peripheral, mobile device, office IT.
- Department handover: asset belongs to a department and can be reassigned by manager/technician.
- Maintenance: inspection, preventive, software update, hardware upgrade, calibration, repair, cleaning, replacement.
- Inventory and valuation: purchase cost, useful life, salvage value, depreciation, warranty, inventory checks.
- Purchase orders: manager/technician create orders; supplier views and updates own orders.
- Requests: employee reports asset incidents or requests IT consumables/accessories.
- Disposal: retire/off-service assets and keep disposal records.

## Roles

- `manager`: reports, approvals, user management, full operations.
- `technician`: asset operations, maintenance, inventory, purchase orders, disposal.
- `employee`: department assets and own requests.
- `supplier`: own purchase orders.

## Do Not Reintroduce

- Personal borrow/return flow.
- Personal asset history page.
- Available-for-loan UI.
- Scanner-driven flow as the main workflow.
- Employee contract CRUD.
- Domain-specific seed/demo wording from the old product scope.

## Compatibility

Legacy routes intentionally return HTTP `410 Gone`. Keep this behavior for old clients. Do not delete historical migrations or drop old tables/columns without a separate migration plan.

## Verification

Run the relevant checks after changes:

```bash
npm run check:i18n
npm run build
php artisan test
```
