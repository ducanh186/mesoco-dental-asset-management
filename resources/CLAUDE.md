# Frontend Architecture (resources/)

## React SPA (`js/`)

Entry point: `app.jsx` — contains AuthContext, I18nProvider, React Router, Axios CSRF setup.

### Pages (`js/pages/`)

- `Dashboard.jsx` — overview with stats, quick actions, recent equipment
- `AssetsPage.jsx` — equipment catalog (admin/HR), CRUD
- `InventoryPage.jsx` — inventory & valuation, two tabs: inventory list + depreciation view
- `MaintenancePage.jsx` — maintenance & repair scheduling
- `FeedbackPage.jsx` — feedback & suggestions
- `ReportPage.jsx` — reports & statistics
- `EmployeesPage.jsx` — employee profiles (admin/HR)
- `LocationsPage.jsx` — location catalog
- `MyAssetsPage.jsx` / `MyEquipmentPage.jsx` — user's assigned equipment
- `MyAssetHistoryPage.jsx` — equipment history for non-admin roles
- `QRScanPage.jsx` — QR code scanner
- `ProfilePage.jsx` / `ChangePasswordPage.jsx` — user settings

### Components (`js/components/`)

- `ui/` — shared primitives: Button, Input, Select, Card, Badge, Table, Modal, Toast, LoadingSpinner
- `dashboard/` — StatCard, QuickActionGrid, RecentEquipmentTable
- `PrintableAssetLabel.jsx` — QR label printing

### Layouts (`js/layouts/`)

- `AdminLayout.jsx` — main layout with sidebar + topbar
- `Sidebar.jsx` — role-based navigation menu
- `Topbar.jsx` — header bar
- `Breadcrumbs.jsx` — breadcrumb navigation

### i18n (`js/i18n/`)

- `index.jsx` — I18nProvider, useI18n hook, useTranslation hook
- `locales/vi.js` — Vietnamese translations (default)
- `locales/en.js` — English translations

## Blade (`views/`)

- `spa.blade.php` — single template that loads the React SPA
