# Database Guide

Migration Laravel là nguồn sự thật. Không rewrite migration lịch sử và không drop bảng/cột cũ trong cleanup thông thường.

## Seed Data

Seeder active phải tạo dữ liệu IT:

- Laptop, desktop, monitor, server, network, printer, peripheral.
- Phòng ban như IT Operations, IT Support, Finance, Sales, Operations, Engineering.
- Supplier thiết bị IT.
- Maintenance theo phần mềm, phần cứng, kiểm tra định kỳ, sửa chữa.
- Inventory valuation với purchase cost, useful life, salvage value và warranty.

## Schema Export

`schema.sql` được export từ SQLite database tạm sau khi chạy migrate fresh. Không export từ database local có dữ liệu thật.

## Legacy

Bảng legacy có thể còn trong migration/schema vì lý do compatibility. Không dùng chúng cho UI hoặc API active mới.
