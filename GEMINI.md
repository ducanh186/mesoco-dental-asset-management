# Mesoco IT Asset Management

## Project Overview
Mesoco IT Asset Management is a software project for managing IT equipment within a technology company. The system tracks the lifecycle of IT assets including laptops, desktops, monitors, network devices, and more. Key functionalities revolve around tracking asset locations, assigning responsible employees, scheduling and logging maintenance, conducting inventory checks with valuation/depreciation, handling purchase orders, processing employee requests for incidents/supplies, and managing asset disposal.

### Architecture & Tech Stack
This project follows a decoupled architecture using a monolithic backend API and a Single Page Application (SPA) frontend.
- **Backend:** Laravel 12 (PHP 8.2), utilizing Laravel Sanctum for API authentication.
- **Frontend:** React 19 with Vite 7, styled with TailwindCSS 4, using Axios for HTTP requests and a custom i18n solution.
- **Database:** SQLite (default for local development and testing). Migrations act as the single source of truth.
- **Testing:** PHPUnit for backend feature tests, and a custom Node.js script for checking i18n key parity.

## Building and Running

### Prerequisites
- PHP 8.2+
- Composer
- Node.js & npm

### Setup Instructions
1. Install PHP dependencies:
   ```bash
   composer install
   ```
2. Install Node.js dependencies:
   ```bash
   npm install
   ```
3. Prepare environment and database:
   ```bash
   cp .env.example .env
   php artisan key:generate
   php artisan migrate --seed
   ```
   *Note: Seeding generates demo accounts (`manager`, `technician`, `employee`, `supplier` all with the password `password`) and mock IT data.*
4. Build frontend assets for production (optional for local dev):
   ```bash
   npm run build
   ```

### Running the Application Locally
Run the backend and frontend development servers concurrently:
```bash
php artisan serve
npm run dev
```

### Testing
Execute the following commands to ensure system integrity:
```bash
npm run check:i18n   # Checks for missing or mismatched localization keys
npm run build        # Ensures frontend compiles successfully
php artisan test     # Runs the backend test suite
```

## Development Conventions

### Scope & Domain Rules
- **Active Scope:** The product strictly focuses on department/location-based asset management and specific responsible employees.
- **Restricted Features:** **DO NOT** reintroduce old workflows such as personal borrow/return flows, personal asset history pages, available-for-loan UI, scanner-driven core workflows, or employee contract CRUD.
- **Database Safety:** Do not rewrite or drop historical migrations. Do not drop legacy tables or columns during regular cleanup tasks unless there is a dedicated, destructive migration plan. 
- **Legacy Compatibility:** Old API endpoints that are no longer in scope must return an HTTP `410 Gone` response with a JSON payload to prevent confusing errors on legacy clients. Do not remove these endpoints from the routes file.
- **Asset Categorization:** The `assets.type` column relies on generic enums. Use the `category` relation for specific IT classification.

### Role-Based Access Control (RBAC)
The application relies on 4 canonical roles:
- `manager`: Full system overview, user management, and approval of requests/disposals.
- `technician`: Asset operations, maintenance handling, inventory checks, and purchase orders.
- `employee`: Read-only access to assigned assets and the ability to submit incident/supply requests.
- `supplier`: Read and update access limited to their own purchase orders.

### File Structure & Coding Style
- **React UI:** Active frontend pages are located in `resources/js/pages`. Shared components are in `resources/js/components`. The main navigation is driven by `resources/js/layouts/Sidebar.jsx`.
- **Localization:** All display text should use i18n keys located in `resources/js/i18n/locales`. Always run `npm run check:i18n` after modifying text.
- **Documentation:** System documentation is maintained in the `docs/` directory. Updates to business logic or public APIs must be accompanied by corresponding updates in these markdown files.