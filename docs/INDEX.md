# 📚 TÀI LIỆU DỰ ÁN - MESOCO DENTAL

> Hệ thống quản lý tài sản nha khoa - Laravel 12 + React 19

---

## 🚀 Bắt Đầu Nhanh

Nếu bạn là **người mới** hoặc **máy mới**, bắt đầu từ đây:

### Option A: Docker (Infra Test - Phase 0)
```bash
cd docker
docker compose up -d
docker compose exec app php artisan migrate --seed
# Open http://localhost:8000
```
> Docker config is frozen. Only for validating containerized runtime.

### Option B: Quick Smoke Test (Local Dev)
```bash
scripts\demo.bat
```
> Uses SQLite. Runs migrate/seed/routes/tests. Does NOT start servers.
> For full dev, run manually: `php artisan serve` + `npm run dev`

---

## 📖 Tài Liệu Chi Tiết

### 2. [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) ⭐ QUAN TRỌNG
**Cấu trúc project & workflow**
- Giải thích từng folder
- Files quan trọng
- Workflow thông thường
- Quick reference commands

**Đọc file này khi:**
- Muốn hiểu cấu trúc project
- Tìm file cần sửa
- Học workflow dev hàng ngày

---

### 3. [STACK.md](STACK.md)
**Tech stack chi tiết**
- Laravel 12.48.1 + PHP 8.4
- React 19 + Vite 6
- TailwindCSS 4
- MySQL 8.0
- Docker Compose

**Đọc file này khi:**
- Muốn hiểu công nghệ đang dùng
- Tìm hiểu về packages/libraries
- Đánh giá tech choices

---

### 4. [DECISIONS.md](DECISIONS.md)
**Kiến trúc & quyết định kỹ thuật**
- Tại sao chọn Laravel/React
- Sanctum SPA auth strategy
- Docker containerization rationale
- Database design decisions

**Đọc file này khi:**
- Muốn hiểu "tại sao" (không phải "làm sao")
- Đánh giá architecture
- Onboard technical team members

---

### 5. [VIBE_CODE_PLAYBOOK.md](VIBE_CODE_PLAYBOOK.md)
**Quy tắc phát triển cho AI agents**
- Code generation guidelines
- Never patterns
- Laravel conventions
- React best practices

**Đọc file này khi:**
- Làm việc với AI coding assistants
- Cần enforce coding standards
- Review AI-generated code

---

## 🗂️ Files Khác

### [archive/](archive/)
Các tài liệu cũ đã lỗi thời:
- `vision.md` - Vision ban đầu
- `UI_MAP.md` - UI wireframes
- `API_CONTRACT.md` - API specs draft
- `CONTRIBUTING.md` - Contribution guide
- `SECURITY_CHECKLIST.md` - Security checklist

**Không cần đọc, giữ lại để tham khảo**

---

## 🎯 Đọc Theo Vai Trò

### 👤 Người Dùng / QA Tester
```
1. README.md (Quickstart + Troubleshooting)
2. docs/PROJECT_STRUCTURE.md (Hiểu workflow)
```

### 👨‍💻 Frontend Developer
```
1. README.md
2. PROJECT_STRUCTURE.md (Focus: resources/js/)
3. STACK.md (React/Vite section)
```

### 🔧 Backend Developer
```
1. README.md
2. PROJECT_STRUCTURE.md (Focus: app/, routes/, database/)
3. STACK.md (Laravel section)
4. DECISIONS.md (Auth strategy)
```

### 🏗️ DevOps / Infra
```
1. README.md (Docker troubleshooting)
2. PROJECT_STRUCTURE.md (docker/ folder)
3. STACK.md (Infrastructure section)
```

### 🧑‍💼 Project Manager / Tech Lead
```
1. README.md (Overview)
2. DECISIONS.md (Architecture)
3. STACK.md (Tech choices)
4. PROJECT_STRUCTURE.md (Workflow)
```

### 🤖 AI Agent / Copilot
```
1. VIBE_CODE_PLAYBOOK.md (Rules)
2. PROJECT_STRUCTURE.md (Context)
3. DECISIONS.md (Constraints)
```

---

## 📋 Checklist Onboarding

### Ngày 1: Setup
- [ ] Đọc README.md
- [ ] Chạy `scripts\docker-setup.bat`
- [ ] Login thử với E0001/password
- [ ] Xem README.md phần "Gặp lỗi?"

### Ngày 2: Tìm hiểu codebase
- [ ] Đọc PROJECT_STRUCTURE.md
- [ ] Browse code trong `resources/js/`
- [ ] Browse code trong `app/Http/Controllers/`
- [ ] Chạy thử edit UI (LoginPage.jsx)

### Ngày 3: Hiểu architecture
- [ ] Đọc STACK.md
- [ ] Đọc DECISIONS.md
- [ ] Hiểu Sanctum SPA auth flow
- [ ] Test API với `/api/me`

### Ngày 4: Dev workflow
- [ ] Tạo branch mới
- [ ] Implement 1 small feature
- [ ] Test local
- [ ] Git commit/push

### Ngày 5: Troubleshooting
- [ ] Đọc README.md phần "Gặp lỗi?"
- [ ] Thử reset với `scripts\docker-reset.bat`
- [ ] Xem logs: `docker compose logs app`
- [ ] Debug 1 lỗi cố ý

---

## 🆘 Cần Giúp Đỡ?

### Lỗi Setup / Docker
👉 [README.md](../README.md) - Phần "🆘 Gặp Lỗi?"

### Không Tìm Thấy File
👉 [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - Giải thích từng folder

### Không Hiểu Công Nghệ
👉 [STACK.md](STACK.md) - Tech stack chi tiết

### Không Hiểu Quyết Định Kỹ Thuật
👉 [DECISIONS.md](DECISIONS.md) - Architecture rationale

### AI Agent Không Tuân Thủ Quy Tắc
👉 [VIBE_CODE_PLAYBOOK.md](VIBE_CODE_PLAYBOOK.md) - Code generation rules

---

## 🔄 Cập Nhật Tài Liệu

**Quy tắc:**
1. Luôn cập nhật docs khi thay đổi code
2. Không duplicate thông tin giữa các file
3. Link đến file khác thay vì copy-paste
4. Đánh dấu ngày cập nhật ở cuối mỗi file

**Format:**
```markdown
---
**Cập nhật:** Jan 23, 2026 - Phase 0.5 Devpack
```

---

## 📞 Liên Hệ

**Escalate khi:**
- Lỗi không có trong SETUP_GUIDE.md
- Cần thay đổi architecture
- Cần access production
- Security issues

---

**Phase hiện tại:** Phase 7 - Maintenance + Off-Service Lock ✅
**Cập nhật:** Jan 27, 2026

---

## 📋 Phase Documentation

| Phase | API Doc | Pack | Regression |
|-------|---------|------|------------|
| 6 - Inventory & Valuation | [API_PHASE6.md](API_PHASE6.md) | [PHASE6_PACK.md](PHASE6_PACK.md) | [REGRESSION_PHASE6.md](REGRESSION_PHASE6.md) |
| 7 - Maintenance + Lock | [API_PHASE7.md](API_PHASE7.md) | [PHASE7_PACK.md](PHASE7_PACK.md) | [REGRESSION_PHASE7.md](REGRESSION_PHASE7.md) |
