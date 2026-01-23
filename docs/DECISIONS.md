# Technical Decisions Log

This document records key technical decisions made for the Mesoco Dental Asset Management system.

> **📖 Development Ruleset**: All development work follows the guidelines in [`VIBE_CODE_PLAYBOOK.md`](VIBE_CODE_PLAYBOOK.md), which defines non-negotiable rules, workflows, and conventions for AI agents and developers.
> 
> **📚 Detailed Documentation**: See [`archive/`](archive/) for vision, UI maps, API contracts, security checklist, and contributing guidelines.

**Phase 0 Status**: ✅ **COMPLETE**
- Auth scaffolding: Login/Logout with Sanctum SPA ✅
- Demo users: Admin (E0001), Doctor (E0002), Technician (E0003) ✅
- SPA routing: React Router with protected routes ✅
- UI scaffolding: Dashboard + placeholder pages ✅
- Verification checklist: See [README.md](../README.md) ✅

**Next Phase**: Implement MVP business logic (Assets, QR, Requests, Maintenance)

---

## Decision 001: Monolith Architecture

**Date**: 2026-01-23  
**Status**: Accepted

### Context
Need to choose between microservices vs monolith for initial development.

### Decision
Use Laravel monolith serving React SPA via Vite on the same origin.

### Rationale
- Simpler deployment and maintenance for small team
- No CORS complexity (same origin)
- Easier to refactor later if needed
- AI tooling works better with common stack

---

## Decision 002: Authentication Strategy

**Date**: 2026-01-23  
**Status**: Accepted

### Context
Choose between JWT tokens, API tokens, or session-based auth.

### Decision
Use **Laravel Sanctum** with SPA authentication (session cookie + CSRF).

### Rationale
- Built-in CSRF protection
- No token storage on client side
- Session handled by Laravel automatically
- Stateful API middleware enabled

### Configuration
- `statefulApi()` enabled in `bootstrap/app.php`
- Stateful domains: `localhost,localhost:8000,localhost:3000,127.0.0.1`
- Session driver: `database`

---

## Decision 003: Database

**Date**: 2026-01-23  
**Status**: Accepted

### Context
Choose between MySQL, PostgreSQL, or SQLite.

### Decision
Use **MySQL 8.0+** for all environments.

### Rationale
- Common in Vietnamese hosting providers
- Team familiarity
- Good Laravel support
- Sufficient for expected scale

---

## Decision 004: File Storage

**Date**: 2026-01-23  
**Status**: Accepted

### Context
Where to store uploaded files (contracts, equipment photos, etc.)

### Decision
Use **local filesystem** for MVP/development. S3-compatible for production.

### Rationale
- Simplest for local development
- Laravel's filesystem abstraction makes switching easy
- No external dependencies for MVP

### Configuration
```env
FILESYSTEM_DISK=local
```

---

## Decision 005: QR Code Format

**Date**: 2026-01-23  
**Status**: Accepted

### Context
Define QR code payload format for equipment tagging.

### Decision
Use structured payload: `MESOCO:ASSET:{asset_id}:v1`

### Example
```
MESOCO:ASSET:12345:v1
```

### Rationale
- Namespace prefix prevents collision
- Version suffix allows future format changes
- Simple to parse with regex
- Human-readable for debugging

### Validation Regex
```javascript
/^MESOCO:ASSET:(\d+):v(\d+)$/
```

---

## Decision 006: User Identity

**Date**: 2026-01-23  
**Status**: Accepted

### Context
Use email or employee code for login?

### Decision
Use **employee_code** as primary login identifier.

### Rationale
- Clinic staff may share email addresses
- Employee codes are already used internally
- Unique per employee

### Implementation
- `employee_code` column added to `users` table (unique)
- Login endpoint accepts `employee_code` + `password`

---

## Decision 007: Role Management

**Date**: 2026-01-23  
**Status**: Accepted

### Context
How to implement role-based access control?

### Decision
Use simple **string role** column on user table for Phase 0.

### Defined Roles
- `admin` - Full access
- `technician` - Equipment/inventory management
- `doctor` - View own equipment, create requests
- `nurse` - Same as doctor
- `employee` - Basic access (default)

### Future Consideration
May migrate to separate `roles` table with permissions if needed.

---

## Decision 008: Frontend Framework

**Date**: 2026-01-23  
**Status**: Accepted

### Context
Choose frontend framework for SPA.

### Decision
Use **React 19** with **React Router v7**.

### Rationale
- Team familiarity
- Large ecosystem
- Good TypeScript support (future)
- Strong AI assistance coverage

### Supporting Libraries
- **Vite** - Build tool
- **TailwindCSS 4** - Styling
- **Axios** - HTTP client

---

## Template for New Decisions

```markdown
## Decision XXX: [Title]

**Date**: YYYY-MM-DD  
**Status**: Proposed | Accepted | Deprecated | Superseded

### Context
[What is the issue or question?]

### Decision
[What was decided?]

### Rationale
[Why this decision?]

### Consequences
[What are the implications?]
```
