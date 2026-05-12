# Hướng Dẫn Tính Năng QR Tài Sản

Tài liệu này mô tả cách dùng QR trong hệ thống quản lý tài sản thiết bị IT tại Mesoco.

## Mục Tiêu

Mỗi thiết bị có:

- `AssetID`: ID nội bộ do hệ thống tự tăng.
- `qr_uid`: mã định danh QR duy nhất cho QR active hiện tại.
- `QRCode`: payload legacy để scanner nội bộ vẫn resolve được.

QR không chứa trực tiếp giá tiền, cấu hình hay nhật ký sửa chữa. QR chỉ dẫn người dùng tới portal tài sản. Hệ thống kiểm tra người đang đăng nhập rồi mới quyết định dữ liệu nào được hiển thị.

## Luồng Sử Dụng Trên Điện Thoại

1. Manager hoặc technician vào asset detail.
2. Bấm `Tạo lại QR` nếu thiết bị chưa có QR active.
3. In hoặc tải nhãn QR.
4. Dán QR lên thiết bị.
5. Nhân viên dùng điện thoại quét QR.
6. Nếu chưa đăng nhập, hệ thống chuyển tới màn login.
7. Đăng nhập thành công thì hệ thống quay lại đúng portal tài sản.
8. Portal hiển thị dữ liệu theo role.

## Dữ Liệu Theo Role

| Role | Dữ liệu được thấy khi quét QR |
| --- | --- |
| `employee` | Tên máy, mã tài sản, serial, model, cấu hình, trạng thái, bảo hành, vị trí, người đang sở hữu |
| `technician` | Toàn bộ phần employee + lần bảo trì cuối, nhật ký sửa chữa/bảo trì, tình trạng thiết bị, mức khấu hao, giá trị còn lại |
| `manager` | Toàn bộ phần technician + giá mua, ngày mua, nhà cung cấp và thông tin liên hệ |

## Vì Sao Không Dùng 3 QR Khác Nhau?

Hệ thống chỉ dùng một QR cho một thiết bị để tránh nhầm lẫn khi in/dán nhãn. Phân quyền nằm ở backend:

```text
Quét QR
-> mở /asset-portal/{qr_uid}
-> kiểm tra đăng nhập
-> kiểm tra role
-> trả đúng phần dữ liệu được phép xem
```

Nhờ vậy cùng một QR, nhưng nhân viên, kỹ thuật viên và quản lý sẽ nhìn thấy mức thông tin khác nhau.

## Cách Test Local

Trên PC:

1. Chạy Docker hoặc local dev server.
2. Đăng nhập manager `E1001/password`.
3. Vào `Assets`.
4. Mở chi tiết một thiết bị.
5. Bấm `Tạo lại QR`.
6. Kiểm tra QR card có `QR in ra`, `Payload nội bộ`, nút `Mở portal`, `In nhãn`, `Tải HTML`.

Trên điện thoại thật:

1. Đảm bảo điện thoại và PC cùng mạng LAN.
2. Dùng IP LAN của PC thay vì `localhost`.
3. Ví dụ URL đúng:

```text
http://192.168.1.20:8000/asset-portal/<qr_uid>
```

4. Mở URL hoặc quét QR.
5. Đăng nhập bằng tài khoản demo.
6. Kiểm tra dữ liệu hiển thị đúng theo role.

## Cách Test Scanner Nội Bộ

Màn `/qr-scan` nhận cả hai định dạng:

```text
MESOCO|ASSET|v1|<qr_uid>
```

và:

```text
http://<host>/asset-portal/<qr_uid>
```

Màn này phù hợp để test bằng PC hoặc scanner USB vì không phụ thuộc camera điện thoại.

## Quy Tắc Bảo Mật

- Portal QR bắt buộc đăng nhập.
- `employee` không thấy giá mua, nhà cung cấp hoặc nhật ký kỹ thuật.
- `technician` không thấy giá mua và nhà cung cấp.
- `manager` thấy toàn bộ dữ liệu.
- QR cũ dạng payload legacy vẫn resolve được để không phá nhãn đã in trước đó.
