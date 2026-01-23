# Mesoco Dental — Tech Stack

## Frontend
- **Framework**: React 18+ (Vite)
- **Styling**: TailwindCSS 3.x
- **State**: React Query + Zustand
- **Router**: React Router v6
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **QR Scanner**: html5-qrcode

## Backend
- **Framework**: Laravel 11 (PHP 8.3+)
- **API**: RESTful JSON API
- **Auth**: Laravel Sanctum (SPA token)
- **Queue**: Laravel Queue (database driver)
- **Notifications**: Laravel Mail

## Database
- **Primary**: MySQL 8.0+
- **Migrations**: Laravel Migrations

## Hosting (MVP)
- **Frontend**: Vercel / Netlify
- **Backend**: Shared hosting hoặc VPS (PHP-enabled)
- **Database**: MySQL managed hoặc local

## Dev Tools
- **Package Manager**: npm (FE), Composer (BE)
- **Linting**: ESLint + Prettier (FE), Pint (BE)
- **API Testing**: Thunder Client / Postman
- **Version Control**: Git + GitHub

## Rationale
- Laravel + React là stack phổ biến, AI hỗ trợ tốt
- Sanctum phù hợp SPA authentication
- TailwindCSS nhanh prototype, dễ customize
- MySQL đơn giản, hosting phổ biến ở VN
