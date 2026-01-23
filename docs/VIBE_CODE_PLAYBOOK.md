# Mesoco Dental Asset Management — VIBE CODE PLAYBOOK (AI Agent Rules)

## 0) Purpose
This file defines non-negotiable rules and the development workflow for the **Mesoco Dental Asset Management** project.
The goal is to **ship MVP fast without breaking architecture**, while keeping the codebase maintainable.

**📌 STATUS**: This is the **PRIMARY ACTIVE RULESET** for all development work.

---

## 0.1) Documentation Structure

### Active Documents (Required Reading)
Located in `docs/` folder:
- **`VIBE_CODE_PLAYBOOK.md`** (this file) - Primary development rules & workflow
- **`DECISIONS.md`** - Technical decision log (architecture, stack, auth)
- **`STACK.md`** - Technology stack overview
- **`../README.md`** - Setup guide & Phase 0 verification (at project root)

### Archived Documents (Reference Only)
Located in `docs/archive/` - consult when needed for detailed specs:
- **`vision.md`** - Product vision, scope, user roles, flows
- **`UI_MAP.md`** - Complete screen list, routes, navigation structure
- **`API_CONTRACT.md`** - Detailed API endpoint contracts
- **`SECURITY_CHECKLIST.md`** - Security baseline checklist
- **`CONTRIBUTING.md`** - Git workflow, commit conventions, PR process

**Rule**: Always read active docs before starting work. Consult archived docs for detailed specifications.

---

## 1) Product scope (North Star)

### 1.1 MVP (End-to-End, must work)
Login → My Equipment → QR Scan (status + instructions) → Justification/Request → Manager Approval → Maintenance schedule + Off-service lock.

### 1.2 V1 (After MVP)
Inventory + asset value/depreciation + my asset history + feedback + admin reporting.

---

## 2) Current architecture (as-is)
- **Monolith**: Laravel 11 backend + React SPA frontend under the **same origin** (local: `http://localhost:8000`).
- Frontend is built with **Vite** and served by Laravel (SPA shell view).
- Auth uses **Sanctum SPA authentication** (cookie-based session + CSRF).
- DB: **MySQL 8.0+**.
- Storage: **local** for dev; S3-compatible for staging/prod (later).
- Existing endpoints (expected):
  - `POST /login` (employee_code + password) — session login
  - `POST /logout` — session logout
  - `GET /api/health` — healthcheck
  - `GET /api/me` — current user (protected)

> If the repo differs, update `DECISIONS.md` + this file to match reality.

---

## 3) Non-negotiables (hard rules)

### 3.1 Scope discipline
- Do **ONLY** the requested task.
- Do **NOT** refactor unrelated files.
- If a change touches architecture (auth, routing, DB schema, folder structure), record it in **DECISIONS.md**.

### 3.2 Security baseline
- Enforce authorization on server for every protected resource:
  - RBAC checks (role)
  - Ownership checks (prevent IDOR)
  - Off-service blocking rules
- Error messages must not leak system details (no stack traces to user).

### 3.3 Same-origin first (local)
- Keep SPA and API on the same origin to avoid CORS/cookie issues.
- Prefer `/api/*` for API and catch-all web route for SPA.

### 3.4 Database changes
- Every schema change must be via **migrations**.
- Add seeds for demo/dev only (never embed secrets).
- Provide rollback strategy if a migration is risky.

### 3.5 Documentation sync
When you change:
- endpoints → update `API_CONTRACT.md`
- screens/flows → update `UI_MAP.md`
- scope decisions → update `vision.md` and/or `DECISIONS.md`

---

## 4) Development workflow (Vibe Coding process)

### 4.1 Before coding (mandatory)
1) Read: `vision.md`, `DECISIONS.md`, `API_CONTRACT.md`, `UI_MAP.md`, `STACK.md`
2) Identify:
   - The smallest slice that delivers value
   - Dependencies (DB tables, routes, UI pages)
   - Risks (auth/CSRF, authorization, migrations)
3) Propose a plan:
   - Files to touch
   - Endpoints to add/modify
   - Test/verification steps

### 4.2 While coding
- Create changes as a minimal diff.
- Keep modules cohesive (Auth/Employees/Assets/Requests/Maintenance/QR).
- Prefer adding new files over rewriting large existing ones.

### 4.3 After coding (mandatory)
- Run:
  - Backend: `php artisan test` (or at least smoke checks)
  - Frontend: `npm run build` (or `npm run lint` if present)
- Provide a **Verification Checklist** (manual steps).
- Summarize:
  - What changed
  - Files changed
  - How to test

---

## 5) Code conventions

### 5.1 Backend (Laravel)
- Controllers:
  - Keep thin; push business rules into Services/Actions.
- Requests:
  - Use Form Requests for validation.
- Responses:
  - Standardize JSON response shape:
    - success: `{ "data": ..., "meta": ... }`
    - error: `{ "message": "...", "errors": { ... } }`
- Auth:
  - Protect API routes with `auth:sanctum`.
  - If using role checks, prefer Policies/Gates or middleware.

### 5.2 Frontend (React SPA)
- Axios defaults:
  - `withCredentials = true`
  - Call `GET /sanctum/csrf-cookie` before login/POST that requires CSRF.
- Routing:
  - React Router routes match `UI_MAP.md`.
- UI style:
  - Follow sample UI you extracted + OrangeHRM baseline look & feel.
  - Reusable components in `components/`, pages in `pages/`.
- Forms:
  - Clear validation states and disabled/loading states.

### 5.3 Naming
- DB columns: `snake_case`
- JSON fields: `snake_case` or `camelCase` — choose **one** and document in `DECISIONS.md`
- Routes: `/api/<resource>` REST-like, consistent.

---

## 6) Phase 0 Definition of Done (Local)

### 6.1 Repo & docs
- `README.md` (local run guide, env, migrate/seed, dev commands)
- `CONTRIBUTING.md` (workflow, PR checklist)
- `DECISIONS.md` (stack/auth/db/storage/QR)
- `.env.example` exists; `.env` not committed

### 6.2 App scaffolding
- SPA loads at `http://localhost:8000`
- Catch-all route serves SPA shell for non-API paths
- Placeholder pages exist for MVP nav:
  - `/login`, `/profile`, `/my-equipment`, `/qr-scan`, `/requests`, `/maintenance`

### 6.3 DB baseline
- Users/employees table includes:
  - `employee_code` (unique)
  - `role` (string) and `status`
- Seeds create demo accounts: admin/doctor/technician
- `php artisan migrate --seed` works

### 6.4 Sanctum SPA auth
- `GET /sanctum/csrf-cookie` works
- `POST /login` works with employee_code
- `POST /logout` works
- `GET /api/me` is protected and returns current user after login

### 6.5 Minimal quality gate
- Backend tests or smoke checks exist
- Frontend build works

---

## 7) QR payload rule (v1)
Current accepted format: `MESOCO:ASSET:{id}:v1`

Strong recommendation:
- Use `{public_id}` (UUID/ULID) instead of internal numeric `id`.
- DB mapping: `assets.id` internal, `assets.public_id` external.
- Record final decision in `DECISIONS.md`.

---

## 8) How to avoid "project drift" (AI-specific rules)
- Never invent requirements: if unclear, add a short **Assumptions** section and proceed minimally.
- Never change unrelated styling/layout.
- Never rename endpoints casually; if you must, update docs.
- Always list:
  - touched files
  - commands run
  - verification steps
- If an error occurs:
  - propose 3 likely causes
  - add minimal logging
  - re-run the smallest reproducible test

---

## 9) Inputs needed from the owner (to reduce guessing)
Provide these when you request a feature:
- Target role(s)
- Exact screen(s) affected (from UI_MAP)
- API endpoints expected (or "create new following REST naming")
- Validation rules
- Status values and transitions
- Done criteria (what is considered "working")

---

## 10) Standard "Output format" for every task
Agent must reply with:
1) Plan (bullets)
2) Changes made (file paths)
3) Verification checklist (commands + manual steps)
4) Notes/Risks (if any)
5) Docs updated (which docs, what changed)

END.
