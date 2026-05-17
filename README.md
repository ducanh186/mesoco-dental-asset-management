# Mesoco Asset Management

Đây là hệ thống quản lý tài sản nội bộ cho Mesoco. Bạn có thể dùng app để xem tài sản, vị trí đặt tài sản, người đang chịu trách nhiệm, bảo trì, kiểm kê, đơn mua hàng, yêu cầu xử lý thiết bị và thanh lý tài sản.

Tài liệu này viết cho người mới. Mục tiêu là: tải code về, mở app bằng Docker, biết đăng nhập thử, biết vài lệnh hay dùng và biết xử lý những lỗi Docker phổ biến.

## 1. Cần Cài Gì Trước?

Bạn chỉ cần chuẩn bị:

- `Git`: dùng để tải code từ GitHub và cập nhật code mới.
- `Docker Desktop`: dùng để chạy app mà không cần tự cài PHP, Node.js, MySQL.
- Một terminal: trên Windows có thể dùng `PowerShell`.

Giải thích nhanh:

- `Git` là công cụ quản lý source code.
- `Docker` là công cụ đóng gói môi trường chạy app.
- `Container` là một "máy nhỏ" do Docker tạo ra để chạy từng phần của app.
- `Docker Compose` là cách bật nhiều container cùng lúc, ví dụ app Laravel, Vite và MySQL.

## 2. Lấy Code Từ GitHub


Nếu máy chưa có repo:

```powershell
cd D:\CODE
git clone <GITHUB_REPO_URL>
cd mesoco-dental-asset-management
```

Lệnh này làm gì?

- `cd D:\CODE`: đi vào thư mục bạn muốn để project.
- `git clone <GITHUB_REPO_URL>`: tải code từ GitHub về máy.
- `cd mesoco-dental-asset-management`: đi vào thư mục project vừa tải.

Nếu máy đã có repo và chỉ muốn kéo code mới nhất:

```powershell
cd D:\CODE\mesoco-dental-asset-management
git pull
```

Lệnh này làm gì?

- `git pull`: lấy thay đổi mới nhất từ GitHub về nhánh hiện tại.

Nếu `git pull` báo conflict, đừng xóa lung tung. Conflict nghĩa là cùng một file có thay đổi ở cả máy bạn và GitHub. Hãy nhờ người phụ trách repo kiểm tra trước khi sửa.

## 3. Chạy App Bằng Docker

Cách dễ nhất trên Windows là dùng script có sẵn.

Mở `PowerShell`, đi vào project:

```powershell
cd D:\CODE\mesoco-dental-asset-management
```

Chạy setup lần đầu:

```powershell
scripts\docker-setup.bat
```

Lệnh này làm gì?

- Kiểm tra Docker Desktop đã bật chưa.
- Xóa container cũ nếu có.
- Build image Docker mới.
- Bật app, Vite và MySQL.
- Tạo database và dữ liệu demo.

Sau khi chạy xong, mở:

```text
http://localhost:8000
```

Script cũng tự tìm IP Wi-Fi/LAN của laptop và in thêm link dạng:

```text
Backend:   http://192.168.x.x:8000
Frontend:  http://192.168.x.x:5173
```

Laptop có thể mở `localhost`. Điện thoại hoặc máy khác cùng Wi-Fi thì dùng link `192.168.x.x`.

Tài khoản demo:

| Vai trò | Username | Password |
| --- | --- | --- |
| Manager | `E1001` | `password` |
| Technician | `E1002` | `password` |
| Employee | `E1003` | `password` |
| Frontdesk | `E1004` | `password` |
| Warehouse | `E1005` | `password` |

Ghi chú quan trọng: đăng nhập bằng `Username`, ví dụ `E1001`, không dùng email.

## 4. Mở Lại App Sau Khi Đã Setup

Những lần sau, nếu Docker đã từng setup rồi, chạy:

```powershell
scripts\docker-start.bat
```

Lệnh này làm gì?

- Bật lại các container.
- Tự tìm IP hiện tại của laptop để tạo link QR dùng được cho thiết bị cùng Wi-Fi.
- Chạy migration mới nếu có.
- Xóa cache Laravel để tránh lỗi cấu hình cũ.

Muốn tắt app:

```powershell
scripts\docker-stop.bat
```

Lệnh này làm gì?

- Dừng container.
- Dữ liệu Docker volume vẫn còn, nên lần sau bật lại vẫn dùng tiếp được.

Muốn reset sạch dữ liệu demo:

```powershell
scripts\docker-reset.bat
```

Lệnh này làm gì?

- Xóa dữ liệu Docker cũ.
- Tạo lại database từ đầu.
- Seed lại dữ liệu demo.

## 5. Các Lệnh Docker Hay Dùng

Nếu bạn muốn gõ lệnh Docker trực tiếp, hãy đi vào thư mục `docker` trước:

```powershell
cd D:\CODE\mesoco-dental-asset-management\docker
```

Bật app:

```powershell
docker compose up -d --wait
```

`up -d` nghĩa là bật container ở chế độ chạy nền. `--wait` nghĩa là chờ Docker báo service đã sẵn sàng rồi mới trả terminal về cho bạn.

Bật app và build lại image:

```powershell
docker compose up -d --build --wait
```

Dùng khi vừa pull code mới, sửa `Dockerfile`, sửa dependency hoặc app chạy không đúng bản mới. Lần đầu chạy có thể mất vài phút vì container cần cài Composer dependency vào Docker volume.

Tắt app:

```powershell
docker compose down
```

Lệnh này dừng và gỡ container, nhưng không xóa volume dữ liệu.

Xem container đang chạy:

```powershell
docker compose ps
```

Lệnh này giúp kiểm tra container nào đang `running`, container nào bị `exited`.

Xem log app:

```powershell
docker compose logs -f app
```

`logs` là nhật ký chạy app. `-f` nghĩa là tiếp tục theo dõi log mới.

Chạy migration:

```powershell
docker compose exec -T app php artisan migrate
```

Lệnh này cập nhật cấu trúc database theo migration Laravel.

Seed lại dữ liệu demo:

```powershell
docker compose exec -T app php artisan db:seed --class=DatabaseSeeder
```

Lệnh này tạo lại dữ liệu mẫu như tài khoản `E1001 / password`.

Reset database thật sạch:

```powershell
docker compose exec -T app php artisan migrate:fresh --seed
```

Lệnh này xóa bảng cũ, tạo lại bảng mới và seed dữ liệu. Chỉ dùng cho local/dev, không dùng bừa trên production.

## 6. Các Cổng Cần Nhớ

| URL | Dùng để làm gì |
| --- | --- |
| `http://localhost:8000` | Mở app chính |
| `http://localhost:5173` | Vite dev server cho frontend |
| `localhost:3307` | MySQL trên máy host |

Nếu chỉ muốn dùng app, ưu tiên mở:

```text
http://localhost:8000
```

### Test QR bằng điện thoại trong mạng nội bộ

Khi test QR ở máy local, cần nhớ một điểm rất dễ nhầm: `localhost` trên laptop và `localhost` trên điện thoại là 2 máy khác nhau.

Vì vậy app không nên in QR bằng link:

```text
http://localhost:8000/asset-portal/...
```

Điện thoại quét link đó sẽ mở `localhost` của chính điện thoại, không phải laptop.

Project đã xử lý chuyện này trong script Docker. Khi bạn chạy `scripts\docker-setup.bat` hoặc `scripts\docker-start.bat`, script sẽ tự tìm IP thật của laptop và cấu hình app sinh QR bằng link dạng:

```text
http://192.168.x.x:8000/asset-portal/...
```

Nhờ vậy điện thoại cùng Wi-Fi có thể quét QR và mở trang tài sản trên app đang chạy ở laptop.

Cách test đúng cho tính năng này:

1. Bật app trên laptop bằng `scripts\docker-start.bat`.
2. Nhìn dòng `Backend` mà script in ra, ví dụ `http://192.168.123.5:8000`.
3. Mở app trên laptop bằng `http://localhost:8000` hoặc bằng đúng link IP ở trên.
4. Đăng nhập bằng tài khoản demo, ví dụ `E1001 / password`.
5. Mở danh sách tài sản, xem QR hoặc in nhãn QR của một tài sản.
6. Dùng điện thoại cùng Wi-Fi quét QR.
7. Điện thoại sẽ mở link `http://192.168.x.x:8000/asset-portal/...` và xem được trang tài sản.

Muốn lấy IP laptop cho dễ, chạy:

```powershell
scripts\show-lan-ip.bat
```

Script này in ra các URL dạng:

```text
Backend:   http://192.168.x.x:8000
Frontend:  http://192.168.x.x:5173
```

Chỉ dùng các URL này khi laptop và điện thoại cùng mạng Wi-Fi. Nếu mạng công ty chặn thiết bị truy cập lẫn nhau, QR vẫn đúng nhưng điện thoại sẽ không vào được laptop. Khi đó hãy đổi sang cùng một Wi-Fi khác hoặc dùng hotspot cá nhân.

Nếu máy có nhiều card mạng và script chọn sai IP, có thể chỉ định IP thủ công trước khi start:

```powershell
$env:MESOCO_HOST_IP = "192.168.123.5"
scripts\docker-start.bat
```

Sau khi đổi Wi-Fi hoặc đổi IP, chạy lại `scripts\docker-start.bat` để QR mới dùng IP hiện tại.

Ghi chú về khấu hao: khi tài sản có khấu hao lớn hơn 75%, hệ thống chỉ đưa vào nhóm đề xuất theo dõi/thu hủy ở màn `Disposal`. App không tự thanh lý, không tự xóa vị trí và không tự đổi trạng thái nếu người dùng chưa bấm thao tác thu hủy.

## 7. Khi Pull Code Mới Từ GitHub

Quy trình an toàn:

```powershell
cd D:\CODE\mesoco-dental-asset-management
git status
git pull
scripts\docker-start.bat
```

Lệnh này làm gì?

- `git status`: xem máy bạn đang có file nào thay đổi chưa commit không.
- `git pull`: lấy code mới từ GitHub.
- `scripts\docker-start.bat`: bật lại app, chạy migration nếu có và seed lại dữ liệu demo.
- `scripts\show-lan-ip.bat`: xem IP laptop để test QR hoặc app từ thiết bị cùng Wi-Fi.

Nếu code mới có thay đổi dependency hoặc Docker:

```powershell
cd D:\CODE\mesoco-dental-asset-management\docker
docker compose up -d --build --wait
```

Sau đó mở lại:

```text
http://localhost:8000
```

## 8. Lỗi Docker Phổ Biến Và Cách Xử Lý

### Lỗi 1: Docker Desktop chưa bật

Dấu hiệu:

```text
Docker Desktop is not running
```

Cách xử lý:

1. Mở Docker Desktop.
2. Chờ tới khi Docker báo đang chạy.
3. Chạy lại lệnh setup/start.

Kiểm tra nhanh:

```powershell
docker info
```

Nếu lệnh này chạy ra thông tin Docker là ổn.

### Lỗi 2: Cổng 8000 hoặc 5173 đã bị dùng

Dấu hiệu:

```text
port is already allocated
```

Cách xử lý nhanh:

```powershell
cd D:\CODE\mesoco-dental-asset-management\docker
docker compose down
docker compose up -d --wait
```

Nếu vẫn lỗi, có thể máy đang có app khác dùng cùng cổng. Đóng app đó hoặc đổi port trong `docker/docker-compose.yml`.

### Lỗi 3: MySQL chưa sẵn sàng

Dấu hiệu:

```text
SQLSTATE[HY000] [2002] Connection refused
```

Cách xử lý:

```powershell
cd D:\CODE\mesoco-dental-asset-management\docker
docker compose ps
docker compose logs -f db
```

Nếu database vẫn đang khởi động, chờ thêm 30-60 giây rồi chạy lại:

```powershell
docker compose exec -T app php artisan migrate
```

### Lỗi 4: Đăng nhập `E1001 / password` không được

Nguyên nhân thường gặp: database chưa được seed dữ liệu demo.

Cách xử lý:

```powershell
cd D:\CODE\mesoco-dental-asset-management\docker
docker compose exec -T app php artisan db:seed --class=DatabaseSeeder
```

Nếu vẫn không được, reset sạch database local:

```powershell
docker compose exec -T app php artisan migrate:fresh --seed
```

### Lỗi 5: Pull image quá chậm hoặc timeout

Dấu hiệu:

```text
TLS handshake timeout
```

Cách xử lý:

```powershell
docker pull mysql:8.0
docker compose up -d --build --wait
```

Nếu lỗi nằm ở image khác, thay `mysql:8.0` bằng tên image đang báo lỗi.

### Lỗi 6: App chạy nhưng giao diện nhìn như bản cũ

Cách xử lý:

```powershell
cd D:\CODE\mesoco-dental-asset-management\docker
docker compose exec -T app php artisan config:clear
docker compose exec -T app php artisan cache:clear
docker compose up -d --build --wait
```

Lệnh này xóa cache Laravel và build lại image.

### Lỗi 7: `vendor/autoload.php` bị thiếu

Dấu hiệu:

```text
require(/var/www/html/vendor/autoload.php): Failed to open stream
```

Nguyên nhân thường gặp: Composer dependency trong Docker volume chưa cài xong, nhưng bạn đã chạy `php artisan` quá sớm.

Cách xử lý:

```powershell
cd D:\CODE\mesoco-dental-asset-management\docker
docker compose up -d --build --wait
docker compose exec -T app test -f vendor/autoload.php
docker compose exec -T app php artisan migrate:fresh --seed
```

Nếu lệnh `test -f vendor/autoload.php` vẫn lỗi, cài lại Composer dependency trong container:

```powershell
docker compose exec -T app composer install --no-interaction --prefer-dist --optimize-autoloader
docker compose exec -T app test -f vendor/autoload.php
docker compose exec -T app php artisan migrate:fresh --seed
```

### Lỗi 8: Container bị `exited`

Kiểm tra trước:

```powershell
cd D:\CODE\mesoco-dental-asset-management\docker
docker compose ps
docker compose logs app
```

`ps` cho biết container nào bị tắt. `logs app` cho biết lý do app tắt.

## 9. Kiểm Tra Project Có Ổn Không

Các lệnh kiểm tra thường dùng:

```powershell
npm run check:i18n
npm run build
php artisan test
```

Lệnh này làm gì?

- `npm run check:i18n`: kiểm tra key ngôn ngữ frontend có bị thiếu không.
- `npm run build`: build frontend production để xem có lỗi compile không.
- `php artisan test`: chạy test backend Laravel.

Nếu muốn chạy test bên trong Docker:

```powershell
cd D:\CODE\mesoco-dental-asset-management\docker
docker compose exec -T app php artisan test
```

## 10. App Này Có Những Phần Chính Nào?

- `Asset Catalog`: danh mục tài sản như laptop, desktop, monitor, network device, server, printer và thiết bị văn phòng.
- `Responsible Handover`: theo dõi thiết bị đang ở vị trí nào và ai chịu trách nhiệm.
- `Maintenance`: quản lý bảo trì, sửa chữa, nâng cấp, vệ sinh hoặc thay linh kiện.
- `Inventory & Valuation`: kiểm kê, giá mua, khấu hao, giá trị còn lại và bảo hành.
- `Purchase Orders`: quản lý đơn mua thiết bị và nhà cung cấp.
- `Requests`: nhân viên gửi yêu cầu bàn giao, thu hồi hoặc xử lý sự cố thiết bị.
- `Disposal`: thanh lý hoặc loại bỏ tài sản không còn sử dụng.

## 11. Tài Khoản Demo

Sau khi seed dữ liệu, dùng các tài khoản sau để đăng nhập:

| Role | Username | Email | Password | Dùng để test |
| --- | --- | --- | --- | --- |
| manager | `E1001` | `manager@mesoco.vn` | `password` | Báo cáo, user, duyệt phiếu |
| technician | `E1002` | `technician@mesoco.vn` | `password` | Asset, maintenance, inventory |
| employee | `E1003` | `employee@mesoco.vn` | `password` | Xem thiết bị được giao, gửi request |
| employee | `E1004` | `frontdesk@mesoco.vn` | `password` | Test assignment |
| employee | `E1005` | `warehouse@mesoco.vn` | `password` | Test assignment kho |

## 12. Tài Liệu Khác

- [docs/README.md](docs/README.md): mục lục tài liệu.
- [docs/STACK.md](docs/STACK.md): stack và cách app chạy.
- [docs/DB_CONVENTIONS.md](docs/DB_CONVENTIONS.md): quy ước database.
- [docs/QR_FEATURE_GUIDE.md](docs/QR_FEATURE_GUIDE.md): hướng dẫn QR tài sản.
- [docs/RBAC_MATRIX.md](docs/RBAC_MATRIX.md): quyền theo role.
- [docs/ROLE_FEATURES.md](docs/ROLE_FEATURES.md): chức năng theo từng người dùng.
- [docs/SEED_DATA.md](docs/SEED_DATA.md): dữ liệu mẫu.
- [docs/CLASS_DIAGRAM.md](docs/CLASS_DIAGRAM.md): sơ đồ class.

## 13. Ghi Nhớ Ngắn

Nếu chỉ nhớ 4 dòng, hãy nhớ:

```powershell
cd D:\CODE\mesoco-dental-asset-management
git pull
scripts\docker-start.bat
start http://localhost:8000
```

Khi app lỗi, kiểm tra theo thứ tự:

```powershell
docker info
cd D:\CODE\mesoco-dental-asset-management\docker
docker compose ps
docker compose logs -f app
```
