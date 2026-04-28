# IT Asset Location + Responsible Employee Implementation Plan

> **Status:** Implemented in branch `codex/location-responsible-employee`.

**Goal:** Align the Mesoco IT asset management app with the final business scope:

```text
Asset -> Location
Asset -> Responsible Employee
Asset -> Depreciation -> Disposal Proposal
```

The active system does not use an internal organization unit as the ownership model. It also does not add a separate circulation module. Employee visibility comes from active `asset_assignments.employee_id`.

**Architecture:** Keep `assets.status` as the physical lifecycle state (`active`, `off_service`, `maintenance`, `retired`). Normalize physical placement through `assets.location_id -> locations.id`. Keep legacy text columns only for compatibility and backfill.

**Tech Stack:** Laravel 12, Sanctum, Eloquent, React 19, Vite, custom i18n files, PHPUnit feature tests.

---

## Business Decisions

1. `Location` is the source of truth for where an asset is placed.
2. `Employee.position` is enough to describe the person's job title; no active organization-unit model is needed.
3. Active responsibility is represented by `asset_assignments.employee_id` where `unassigned_at = null`.
4. Assigning an asset requires `employee_id`. Sending only legacy `department_name` returns validation error.
5. Employee-facing lists return only assets assigned to the current employee.
6. Disposal clears both `assets.location_id` and legacy `assets.location`, then closes the active responsible assignment.
7. Depreciation `> 75%` creates a disposal proposal list only; it does not automatically retire the asset.
8. Legacy endpoints/routes stay available only as explicit compatibility contracts.

## Implemented File Areas

- Migration: add `locations.code`, add `assets.location_id`, backfill data, end legacy active responsibility rows without employee.
- Models: `Asset`, `Location`, `AssetAssignment`.
- Requests: asset create/update validation and employee-only assignment validation.
- Controllers: `AssetController`, `LocationController`, `InventoryController`, `DisposalController`.
- Frontend: assets, locations, dashboard, feedback, requests, disposal wording/API usage.
- Docs: README, BFD, DB conventions, RBAC matrix, role features, class diagram, seed data, stack, feature checklist.
- Tests: location/responsible employee flow, disposal threshold and cleanup, inventory location filter, updated existing API tests.

## Verification Commands

```bash
php artisan test
npm run check:i18n
npm run build
php artisan migrate:fresh --seed --env=testing
git diff --check
```

All commands passed during implementation. Vite still reports a chunk-size warning, but the build exits successfully.

## Notes

- Do not stage unrelated `package-lock.json` unless that pre-existing package-name diff is intentionally included.
- `docs/superpowers/` was already untracked before this implementation; this plan file is updated only to avoid stale business guidance.
