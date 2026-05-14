# Report Full Extract for Code Reference

## Mục đích

File này chứa toàn bộ nội dung đã trích từ PDF báo cáo gốc, dùng để đối chiếu khi code và khi kiểm tra xem repo hiện tại đã bám đúng yêu cầu báo cáo hay chưa.

File này phù hợp cho các nhu cầu sau:

- Tra cứu yêu cầu nghiệp vụ, vai trò, luồng xử lý, mô hình hóa hệ thống.
- Đối chiếu tên bảng, tên trường, kiểu dữ liệu và ý nghĩa nghiệp vụ trong báo cáo.
- So sánh thuật ngữ trong báo cáo với tên model hoặc table thực tế trong codebase.

## Nguồn

- PDF gốc: `C:\Users\AL\Downloads\KLTN_DamThiNguyen_15.05.2026.docx (1).pdf`
- Markdown trích xuất trung gian: `C:\Users\AL\Downloads\KLTN_DamThiNguyen_15.05.2026.docx (1).md`

## Cách dùng nhanh

- Tìm `3.1.2. Yêu cầu chức năng của hệ thống` để xem requirement chức năng.
- Tìm `3.1.3. Yêu cầu phi chức năng của hệ thống` để xem yêu cầu phi chức năng.
- Tìm `3.3.2.` để xem toàn bộ bảng dữ liệu cùng kiểu dữ liệu và giải thích.
- Tìm `3.2.4.` để xem DFD và luồng dữ liệu nghiệp vụ.

## Map nhanh giữa báo cáo và code

| Báo cáo | Trong code | Ghi chú |
| --- | --- | --- |
| `Roles` | `Role` | Bảng quyền và vai trò |
| `Users` | `User` | Tài khoản đăng nhập và role binding |
| `Categories` | `Category` | Phân loại tài sản |
| `Assets` | `Asset` | Thực thể tài sản chính |
| `Locations` | `Location` | Vị trí tài sản |
| `Suppliers` | `Supplier` | Nhà cung cấp |
| `PurchaseOrders` | `PurchaseOrder` | Đơn mua sắm |
| `OrderDetails` | `PurchaseOrderItem` | Tên trong code dùng `Item`, không dùng `Detail` |
| `Assignments` | `Assignment` và `AssetAssignment` | `Assignment` là legacy, `AssetAssignment` là scope active theo phòng ban |
| `AssignmentDetails` | `AssignmentDetail` | Chi tiết bàn giao |
| `Returns` | `AssetReturn` | Model tên rõ hơn, table vẫn là `returns` |
| `ReturnDetails` | không thấy model riêng cùng tên | Repo hiện nghiêng sang `AssetCheckin` và các bảng assignment/return hiện có |
| `Maintenance` | `MaintenanceEvent` | Code dùng event-level model |
| `MaintenanceDetails` | `MaintenanceDetail` | Chi tiết xử lý bảo trì |
| `Disposals` | `Disposal` | Thu hủy hoặc thanh lý |
| `DisposalDetails` | `DisposalDetail` | Chi tiết từng tài sản trong disposal |
| `Inventory` | `InventoryCheck` | Đợt kiểm kê |
| `InventoryDetails` | `InventoryCheckItem` | Code dùng `Item`, không dùng `Detail` |

## Lưu ý đối chiếu

- Báo cáo dùng một số thuật ngữ legacy hoặc thiên về mô hình học thuật; codebase hiện tại đã chuẩn hóa theo scope quản lý tài sản IT theo phòng ban.
- Không phải mọi tên bảng trong báo cáo đều trùng 1:1 với tên model trong repo.
- Khi báo cáo và code khác tên, ưu tiên đối chiếu theo nghĩa nghiệp vụ trước, sau đó mới so khớp theo table hoặc model name.
- Các chỗ lệch tên cần chú ý nhất là `OrderDetails`, `Returns`, `InventoryDetails`, `Assignments`.

<!-- markdownlint-disable MD004 MD007 MD012 MD030 MD032 MD034 -->

## Toàn bộ nội dung trích xuất

ĐẠI HỌC KINH TẾ QUỐC DÂN
TRƯỜNG CÔNG NGHỆ

KHOA HỆ THỐNG THÔNG TIN QUẢN LÝ

KHÓA LUẬN TỐT NGHIỆP

TÊN ĐỀ TÀI: XÂY DỰNG PHẦN MỀM QUẢN LÝ
TÀI SẢN THIẾT BỊ IT TẠI CÔNG TY CỔ PHẦN
CÔNG NGHỆ VÀ GIẢI PHÁP MESOCO

Họ và tên sinh viên:  Đàm Thị Nguyên

Giảng viên hướng dẫn  : ThS. Trần Dũng Khánh

HÀ NỘI, NĂM 2026


ĐẠI HỌC KINH TẾ QUỐC DÂN
TRƯỜNG CÔNG NGHỆ

KHOA HỆ THỐNG THÔNG TIN QUẢN LÝ

KHÓA LUẬN TỐT NGHIỆP

TÊN ĐỀ TÀI: XÂY DỰNG PHẦN MỀM QUẢN LÝ TÀI
SẢN THIẾT BỊ IT TẠI CÔNG TY CỔ PHẨN CÔNG
NGHỆ VÀ GIẢI PHÁP MESOCO

                        Họ và tên sinh viên       : Đàm Thị Nguyên

                        Mã sinh viên                  : 11224796

                        Chuyên ngành               : Hệ thống thông tin quản lý

                        Lớp                                 : Hệ thống thông tin quản lý 64B

                        Khóa                               : 64

                        Giảng viên hướng dẫn  : ThS. Trần Dũng Khánh

HÀ NỘI, NĂM 2026


1

LỜI CẢM ƠN

     Lời đầu tiên, em xin bày tỏ lòng biết ơn sâu sắc tới ThS. Trần Dũng Khánh,
người  đã  tận  tình  hướng  dẫn,  chỉ bảo và hỗ trợ em trong suốt quá trình thực
hiện  đề  tài.  Thầy  không  chỉ  truyền đạt cho em những kiến thức chuyên môn
quý  báu  mà  còn  giúp  em  rèn  luyện  tinh thần nghiên cứu nghiêm túc, tư duy
logic  và  cách  tiếp cận vấn đề một cách khoa học. Sự tận tâm và trách nhiệm
của thầy là nguồn động lực lớn giúp em vượt qua những khó khăn, hoàn thiện
đề tài và mở rộng hiểu biết và chuyên môn của mình

Trong  quá  trình  nghiên  cứu  và  triển  khai,  do  còn  hạn  chế  về  kinh
nghiệm  và  kiến  thức  thực  tiễn,  bài  làm  của  em  sẽ  không  tránh  khỏi  những
thiếu  sót.  Em  rất  mong  nhận  được  những  ý  kiến  đóng  góp  và  phản  hồi  của
quý thầy cô để em có thể hoàn thiện hơn trong tương lai.

Em xin chân thành cảm ơn!


2

MỤC LỤC

LỜI MỞ ĐẦU
CHƯƠNG 1: TỔNG QUAN VỀ CƠ SỞ THỰC TẬP VÀ ĐƠN VỊ
TRIỂN KHAI ĐỀ TÀI

1.1. Giới thiệu về cơ sở thực tập - Công ty cổ phần công nghệ và giải
pháp Mesoco

1.1.1. Giới thiệu chung về công ty
1.1.2. Cơ cấu tổ chức công ty

1

2

2
2
2

1.2. Giới thiệu về đơn vị triển khai đề tài – Công ty cổ phần công nghệ
và giải pháp Mesoco

1.2.1. Thông tin cơ bản
1.2.2. Đối tượng sử dụng
1.2.3. Mục tiêu ứng dụng CNTT
1.3. Giới thiệu về đề tài nghiên cứu
1.3.1. Lý do lựa chọn đề tài
1.3.2. Mục tiêu nghiên cứu
1.3.3. Phương pháp nghiên cứu
1.3.4. Đối tượng và phạm vi nghiên cứu
1.3.5. Đối tượng hưởng lợi thông qua đề tài

CHƯƠNG 2
CƠ SỞ LÝ THUYẾT VÀ CÁC CÔNG CỤ THỰC HIỆN ĐỀ TÀI

2.1. Cơ sở lý thuyết

2.2. Các công cụ hỗ trợ thực hiện đề tài

2.1.1. Khái niệm về Quản lý tài sản công nghệ thông tin (IT Asset
Management - ITAM)
2.1.2. Kiến thức về hệ thống thông tin và quản lý
2.1.3. Khái niệm cơ bản về website
2.1.4. Kiến thức về quản lý cơ sở dữ liệu

10
11
12
13
14
14
15
16
17
18
CHƯƠNG 3: XÂY DỰNG WEBSITE QUẢN LÝ TÀI SẢN THIẾT BỊ

2.2.1. Draw.io - công cụ thiết kế các sơ đồ mô hình hóa website
2.2.2. Ngôn ngữ lập trình sử dụng
2.2.3. Hệ quản trị cơ sở dữ liệu SQL Server
2.2.4. Công cụ thiết kế giao diện - Figma
2.2.5. Visual Studio Code (phiên bản 2022)

3
3
4
6
6
6
7
7
8
9
10
10
10


3

IT TẠI CÔNG TY CỔ PHẦN CÔNG NGHỆ VÀ GIẢI PHÁP
MESOCO

3.1. Mô tả bài toán và xác định yêu cầu

3.1.1. Mô tả bài toán
3.1.2. Yêu cầu chức năng của hệ thống
3.1.3. Yêu cầu phi chức năng của hệ thống

3.2. Mô hình hoá hệ thống

3.2.1. Sơ đồ luồng thông tin IFD

3.2.1.1. Sơ đồ luồng thông tin IFD Tạo đơn hàng
3.2.1.2. Sơ đồ luồng thông tin IFD bàn giao thiết bị
3.2.1.3. Sơ đồ luồng thông tin IFD thu hồi thiết bị
3.2.1.4. Sơ đồ luồng thông tin IFD yêu cầu sửa chữa
3.2.1.5. Sơ đồ luồng thông tin IFD kiểm kê thiết bị
3.2.1.6. Sơ đồ luồng thông tin IFD đề xuất thu hủy

3.2.2. Sơ đồ ngữ cảnh CD
3.2.3. Sơ đồ chức năng BFD
3.2.4. Sơ đồ luồng dữ liệu DFD

3.2.4.1. Sơ đồ luồng dữ liệu DFD mức 0
3.2.4.2. Sơ đồ luồng dữ liệu DFD - mức 1

a) Sơ đồ luồng dữ liệu mức 1: Quản lý danh mục
b) Sơ đồ luồng dữ liệu mức 1: Quản lý Đơn hàng
c) Sơ đồ luồng dữ liệu mức 1: Quản lý vận hành
d) Sơ đồ luồng dữ liệu mức 1: Quản lý bảo trì

3.3. Thiết kế cơ sở dữ liệu

3.3.1. Sơ đồ quan hệ thực thể ERD
3.3.2. Các bảng dữ liệu

3.3.2.1. Bảng Roles (Vai trò)
3.3.2.2. Bảng Users (Người dùng)
3.3.2.3. Bảng Categories (Loại tài sản)
3.3.2.4. Bảng Assets (Tài sản)
3.3.2.5. Bảng Locations (Vị trí)
3.3.2.6. Bảng Suppliers (Nhà cung cấp)
3.3.2.7. Bảng PurchaseOrders (Đơn hàng)
3.3.2.8. Bảng OrderDetails (Chi tiết đơn mua)

20
20
20
20
22
23
23
23
25
27
28
30
32
33
35
38
38
41
41
42
43
45
48
48
49
49
50
51
52
54
55
56
57


4

3.3.2.9. Bảng Assignments (Phiếu bàn giao)
3.3.2.10. Bảng AssignmentDetails (Chi tiết phiếu bàn giao)
3.3.2.11. Bảng Thu hồi (Returns)
3.3.2.12. Bảng ReturnDetails (Chi tiết thu hồi)
3.3.2.13. Bảng Maintenance (Phiếu bảo trì)
3.3.2.14. Bảng MaintenanceDetails (Chi tiết bảo trì)
3.3.2.15. Bảng Disposals (Phiếu thu hủy)
3.3.2.16. Bảng DisposalDetails (Chi tiết thu hủy)
3.3.2.17. Bảng Kiểm kê (Inventory)
3.3.2.18. Bảng InventoryDetails (Chi tiết kiểm kê)

3.3.3. Thiết kế giao diện

3.3.3.1. Giao diện trang giới thiệu
3.3.3.2. Giao diện đăng ký
3.3.3.3. Giao diện trang dashboard
3.3.3.4. Giao diện tổng hợp các vụ án
3.3.3.5. Giao diện chi tiết của vụ án
3.3.3.6. Giao diện phân loại vụ án
3.3.3.7. Giao diện nguyên đơn/bị đơn
3.3.3.8. Giao diện luật sư
3.3.3.9. Giao diện câu hỏi
3.3.3.10. Giao diện đặt lịch

3.3.4. Kiểm thử, triển khai và bảo trì ứng dụng web

3.3.4.1. Kiểm thử hệ thống
3.3.4.2. Kế hoạch triển khai hệ thống
3.3.4.3. Hướng dẫn sử dụng hệ thống cho người dùng
3.3.4.4. Chính sách bảo trì và nâng cấp hệ thống

3.4. Kiểm thử

3.4.1. Kế hoạch kiểm thử
3.4.2. Mục tiêu kiểm thử
3.4.3. Kịch bản kiểm thử
3.4.4. Báo cáo kiểm thử

3.5. Cài đặt và triển khai

3.5.1. Mô hình hệ thống

59
60
61
62
64
65
66
67
68
69
70
70
70
71
72
72
73
74
74
76
77
78
78
79
80
80
81
81
82
82
84
85
85


5

3.5.2. Cách hoạt động của hệ thống
3.5.3. Yêu cầu về cài đặt phần cứng
3.5.4. Đào tạo, hướng dẫn người dùng sử dụng

3.5.4.1. Mục tiêu đào tạo
3.5.4.2. Phương pháp đào tạo

KẾT LUẬN
TÀI LIỆU THAM KHẢO

87
87
88
88
88
90
92


6

DANH MỤC TỪ VIẾT TẮT

STT  Chữ viết tắt

Nguyên nghĩa

1

2

3

4

5

6

7

8

9

10

11

12

13

ACID

Tính chất giao dịch trong CSDL

AI

API

CDN

CORS

CSS

DB

DTO

Trí tuệ nhân tạo

Giao diện lập trình ứng dụng

Mạng phân phối nội dung

Chia sẻ tài nguyên giữa các nguồn

Ngôn ngữ định kiểu trang web

Cơ sở dữ liệu

Đối tượng truyền dữ liệu

HTTPS

Giao thức truyền tải siêu văn bản bảo mật

JWT

RBAC

SSL

SVG

Mã thông báo dạng JSON

Phân quyền theo vai trò

Lớp bảo mật truyền tải

Định dạng ảnh vector


7

DANH MỤC HÌNH

Hình 1.1: Logo công ty Luật TNHH Quốc tế Bình An
Hình 1.2: Sơ đồ cơ cấu tổ chức công ty luật Bình An
Hình 3.1: Giao diện giới thiệu
Hình 3.2: Giao diện đăng ký
Hình 3.3: Giao diện xác thực đăng ký
Hình 3.4: Giao diện dashboard
Hình 3.5: Giao diện dashboard
Hình 3.6: Giao diện tổng hợp các vụ án
Hình 3.7: Giao diện chi tiết của vụ án
Hình 3.8: Giao diện chi tiết tài liệu vụ án
Hình 3.9: Giao diện phân loại vụ án
Hình 3.10: Giao diện nguyên đơn/bị đơn
Hình 3.11: Giao diện luật sư
Hình 3.12: Giao diện thông tin luật sư
Hình 3.13: Giao diện câu hỏi cho luật sư
Hình 3.14: Giao diện đặt lịch tư vấn
Hình 3.15: Giao diện tình trạng câu hỏi từ phía người dùng
Hình 3.16: Giao diện thông báo câu hỏi
Hình 3.17: Giao diện trả lời câu hỏi của luật sư
Hình 3.18: Giao diện thông báo câu trả lời
Hình 3.19: Giao diện đặt lịch
Hình 3.20: Giao diện chi tiết lịch hẹn của luật sư

2
3
46
46
47
47
48
49
50
50
51
52
52
53
53
54
55
55
56
56
57
58


8

DANH MỤC SƠ ĐỒ

Sơ đồ 3.1: Sơ đồ luồng thông tin IFD tiếp nhận tư vấn
Sơ đồ 3.2: Sơ đồ luồng thông tin IFD đặt lịch hẹn
Sơ đồ 3.3: Sơ đồ luồng thông tin IFD quản lý hồ sơ
Sơ đồ 3.4: Sơ đồ luồng thông tin IFD quản lý người dùng
Sơ đồ 3.5: Sơ đồ ngữ cảnh CD
Sơ đồ 3.6: Sơ đồ chức năng BFD
Sơ đồ 3.7: Sơ đồ luồng dữ liệu DFD - mức 0
Sơ đồ 3.8: Sơ đồ luồng dữ liệu DFD - mức 1: Quản lý danh mục
Sơ đồ 3.9: Sơ đồ luồng dữ liệu DFD - mức 1: Quản lý hồ sơ vụ án
Sơ đồ 3.10: Sơ đồ luồng dữ liệu DFD - mức 1: Quản lý câu hỏi
Sơ đồ 3.11: Sơ đồ luồng dữ liệu DFD - mức 1: Quản lý đặt lịch
Sơ đồ 3.12: Sơ đồ quan hệ thực thể ERD

22
23
24
26
27
28
30
33
34
35
35
36


1

LỜI MỞ ĐẦU

      Trong bối cảnh chuyển đổi số đang diễn ra mạnh mẽ trên toàn cầu, công
nghệ  thông  tin  (CNTT)  đã  và  đang  trở  thành  yếu  tố  cốt  lõi  giúp  các  doanh
nghiệp  nâng  cao  năng  lực  cạnh  tranh  và  tối  ưu  hóa  hoạt  động  quản  lý.  Đặc
biệt,  việc  quản  lý  tài  sản  thiết  bị  CNTT  như  máy  tính,  máy  chủ  và  thiết  bị
mạng  ngày  càng  trở  nên  quan  trọng,  đòi  hỏi  các  tổ  chức phải có những giải
pháp quản lý hiệu quả, minh bạch và chính xác.
     Tại  Công  ty  Cổ  phần  công  nghệ  và  giải  pháp  Mesoco,  cùng  với  sự phát
triển  về  quy  mô  và  hệ  thống  hạ  tầng  công  nghệ,  số  lượng tài sản thiết bị IT
ngày càng gia tăng cả về chủng loại lẫn giá trị. Tuy nhiên, phương thức quản
lý truyền thống còn tồn tại nhiều hạn chế như khó kiểm soát vòng đời thiết bị,
thiếu tính đồng bộ dữ liệu, dễ xảy ra thất thoát và gây khó khăn trong công tác
kiểm kê, bảo trì cũng như lập kế hoạch đầu tư.
Xuất phát từ thực tiễn đó, việc xây dựng một hệ thống quản lý tài sản thiết bị
IT  trên  nền  tảng  web  là  hết  sức  cần  thiết.  Hệ  thống  này  không  chỉ  giúp  tự
động  hóa  quy  trình  quản  lý, theo dõi và kiểm soát tài sản một cách hiệu quả
mà  còn  hỗ  trợ  các  phòng  ban  trong  việc  phối  hợp  vận  hành,  nâng  cao  tính
minh bạch và tối ưu chi phí.
     Vì vậy, đề tài khóa luận “Xây dựng phần mềm quản lý tài sản thiết bị IT
tại  Công ty Mesoco” được lựa chọn nhằm nghiên cứu, thiết kế và phát triển
một  hệ  thống  quản  lý  phù  hợp với nhu cầu thực tế của doanh nghiệp. Đề tài
hướng  đến  việc  xây  dựng  một  nền tảng trực quan, dễ sử dụng, đảm bảo tính
bảo mật và khả năng mở rộng, góp phần nâng cao hiệu quả quản lý tài sản và
hỗ trợ quá trình chuyển đổi số tại doanh nghiệp.
Trong quá trình thực hiện đề tài, mặc dù đã có nhiều cố gắng, song do hạn chế
về  thời  gian  và  kinh  nghiệm,  khóa  luận  khó  tránh  khỏi những thiếu sót. Rất
mong nhận được sự góp ý của thầy cô để đề tài được hoàn thiện hơn.
Xin chân thành cảm ơn!


2

CHƯƠNG  1:  TỔNG  QUAN  VỀ CƠ SỞ THỰC TẬP VÀ ĐƠN VỊ
TRIỂN KHAI ĐỀ TÀI

1.1. Giới thiệu về cơ sở thực tập - Công ty cổ phần công nghệ và giải pháp
Mesoco

1.1.1. Giới thiệu chung về công ty

     Hình 1.1: Logo Công ty cổ phần công nghệ và giải pháp Mesoco

(Nguồn: Công ty cổ phần công nghệ và giải pháp Mesoco)

   Tên giao dịch: CÔNG TY CỔ PHẦN CÔNG NGHỆ VÀ GIẢI PHÁP
   Tên viết tắt: MESOCO
   Triết lý kinh doanh: " Tối ưu hóa giá trị - Gia tăng vòng đời "
    Giá  trị  cốt  lõi:  Đặt  tính  chính  xác,  an  toàn  dữ  liệu  và  tối  ưu  quản  lý  làm
trọng tâm trong mọi giải pháp.
    Công ty Cổ phần Công nghệ và Giải pháp Mesoco là đơn vị cung cấp giải
pháp  công  nghệ quốc tế có sự hiện diện mạnh mẽ tại Việt Nam. Với đội ngũ
chuyên gia chất lượng cao, công ty tập trung vào việc tư vấn và triển khai các
giải  pháp  chuyển  đổi  số  toàn  diện  cho  các  doanh  nghiệp  lớn  trên  toàn  cầu.
Các  dịch  vụ  trọng  tâm  của  đơn  vị  này  bao  gồm  phát  triển  phần  mềm  tùy
chỉnh, tư vấn giải pháp đám mây (Cloud), phân tích dữ liệu và đặc biệt là quy
trình  kiểm  thử  (Testing)  chuyên  nghiệp  để  đảm  bảo  chất  lượng  hệ  thống  ở
mức cao nhất .

1.1.2. Cơ cấu tổ chức công ty

1.1.2.1. Cơ cấu tổ chức công ty

Chi tiết vai trò các bộ phận trong hệ thống:

-  Ban Giám đốc:


3

Phê duyệt các đơn hàng nhập thiết bị mới.

Phê duyệt các đề xuất thanh lý/thu hủy tài sản khi chất lượng dưới 75%.

Giám sát tổng thể bức tranh tài chính và hạ tầng IT của công ty.

-  Bộ phận Quản lý Kho & bàn giao:

Nhập kho: Tiếp nhận thiết bị, dán mã QR Code để số hóa thông tin ngay từ
đầu.

Định danh: Khai báo cấu hình, ngày mua, bảo hành vào hệ thống để bắt đầu
tính khấu hao.

-  Bộ phận Vận hành & Kỹ thuật (kỹ thuật viên):

bàn giao: Thực hiện gán thiết bị cho nhân viên. Đây là bên trực tiếp cập
nhật trạng thái "Sử dụng" hoặc "Sẵn sàng".

Bảo trì: Đóng vai trò là những người thực hiện "Ticket" bảo trì định kỳ (vệ
sinh máy, thay keo) và sửa chữa khi có sự cố.

Thu hồi: Khi nhân viên nghỉ, bộ phận này kiểm tra tình trạng máy trước khi
đưa về trạng thái "Null" (trống người dùng) trên hệ thống.

-  Bộ phận Kiểm soát & Tài chính (Giám sát):

Kiểm kê: Đối soát giữa số liệu trên hệ thống và thực tế tại các phòng ban.

Đánh giá: Tính toán giá trị còn lại (khấu hao). Nếu thiết bị hỏng hóc hoặc
quá cũ (điểm chất lượng thấp), họ sẽ là bên đưa ra đề xuất thanh lý để tối
ưu chi phí vận hành.

1.2. Giới thiệu về đơn vị triển khai đề tài – Công ty cổ phần công nghệ và
giải pháp Mesoco

  1.2.1. Thông tin cơ bản

Đơn vị triển khai đề tài chính là Công ty cổ phần công nghệ và giải

pháp Mesoco, có trụ sở tại Hà Nội, hoạt động trong lĩnh vực phát triển phần
mềm, chuyển đổi số và cung cấp giải pháp công nghệ như cloud và hệ thống
doanh nghiệp; công ty có quy mô hàng trăm nhân sự kỹ thuật, nhiều văn
phòng trong và ngoài nước, phục vụ khách hàng tại các thị trường như Nhật
Bản, Mỹ và châu Âu. Đơn vị công nghệ chuyên triển khai hệ thống quản lý tài


4

sản thiết bị IT nhằm kiểm soát toàn bộ vòng đời thiết bị từ mua sắm, bàn giao,
sử dụng đến thu hồi và thanh lý; đồng thời hỗ trợ quản lý cấu hình, phân bổ
thiết bị cho nhân sự, theo dõi khấu hao tài chính, đảm bảo an toàn bảo mật
thông tin và tuân thủ tiêu chuẩn kỹ thuật, qua đó giúp doanh nghiệp tối ưu chi
phí, nâng cao hiệu quả vận hành và minh bạch trong quản lý tài sản số.

Về quy trình nghiệp vụ, vòng đời một tài sản gồm:

1.  Mua sắm đơn hàng
2.
3.
4.
5.
6.

Bàn giao
Sửa chữa/ bảo trì
Thu hồi
Kiểm kê
Thu hủy

1.2.2. Đối tượng sử dụng

(1). Ngân hàng và Tổ chức Tài chính

Đối với ngân hàng, phần cứng IT là Tài sản cố định đặc biệt cần sự chính xác
tuyệt đối về vị trí và định danh.

Đối tượng quản lý chính: Hệ thống máy chủ (Servers), máy ATM, máy
POS, thiết bị mạng (Switches/Routers), máy tính chuyên dụng tại quầy
giao dịch.

-  Mục đích sử dụng hệ thống:

Định vị tài sản: Biết chính xác vị trí vật lý đến từng tầng, từng phòng
hoặc từng chi nhánh của thiết bị để phục vụ kiểm kê bắt buộc của Ngân
hàng Nhà nước.

Quản lý cấu hình vật lý: Theo dõi lịch sử thay thế linh kiện (ví dụ: thay
ổ cứng cho Server, nâng cấp RAM máy trạm).

Bảo trì ngăn ngừa: Thiết lập lịch bảo trì định kỳ cho các thiết bị phần
cứng quan trọng để tránh hỏng hóc gây gián đoạn giao dịch
(Downtime).

 (2). Doanh nghiệp lớn (Enterprises)


5

Với doanh nghiệp lớn, hệ thống là công cụ điều phối và luân chuyển tài sản
giữa một cộng đồng nhân sự khổng lồ.

-  Đối tượng quản lý chính: Laptop, màn hình, máy chiếu, máy in, thiết bị

di động bàn giao cho nhân viên.

-  Mục đích sử dụng hệ thống:

Tối ưu hóa kho dự phòng (Buffer Stock): Hệ thống cho biết chính xác
số lượng máy tính còn trong kho để điều phối ngay cho nhân viên mới
mà không cần mua sắm gấp, lãng phí ngân sách.

Quản lý điều chuyển nội bộ: Theo dõi lộ trình của thiết bị khi di chuyển
giữa các phòng ban hoặc từ văn phòng này sang văn phòng khác mà
không bị thất lạc.

Kế hoạch thay thế (Refresh Cycle): Dựa trên ngày đưa vào sử dụng, hệ
thống tự động lập danh sách các thiết bị đã cũ (ví dụ dùng trên 4 năm)
để lên kế hoạch thu hồi và thanh lý hàng loạt.

(3). Doanh nghiệp vừa và nhỏ (SMEs)

SMEs sử dụng hệ thống như một bộ máy chống thất thoát và bảo vệ vốn đầu
tư.

-  Đối tượng quản lý chính: Máy tính văn phòng, thiết bị mạng cơ bản,

phụ kiện.

-  Mục đích sử dụng hệ thống:

Ràng buộc trách nhiệm cá nhân: Ghi nhận biên bản bàn giao vật lý
(kèm ảnh chụp tình trạng máy lúc giao) để đảm bảo nhân viên có trách
nhiệm giữ gìn đồ đạc.

Thu hồi khi nghỉ việc: Chốt danh sách mọi món đồ (đến từng sợi dây
cáp) mà nhân viên phải trả lại trước khi hoàn tất thủ tục nghỉ việc.

Quản lý bảo hành nhà cung cấp: Hệ thống lưu trữ thông tin nhà cung
cấp và thời hạn bảo hành phần cứng. Khi máy hỏng, nhân viên chỉ cần
tra cứu là biết gửi đi bảo hành ở đâu, giúp tiết kiệm chi phí sửa chữa
bên ngoài.

Hệ thống này sẽ hoạt động như một "Thẻ căn cước tài sản": Mỗi thiết bị có
một mã (QRcode), chỉ cần quét mã là ra toàn bộ lịch sử: Mua từ ai - Ai đang
dùng - Đã sửa gì - Còn bảo hành không - Đang đặt ở đâu.


6

1.2.3. Mục tiêu ứng dụng CNTT

    Kiến trúc mục tiêu: Xây dựng hệ thống quản lý tập trung, đồng bộ dữ
liệu theo thời gian thực, dễ mở rộng và tích hợp với các hệ thống nội bộ
khác của doanh nghiệp như nhân sự, quản lý công việc hoặc hệ thống xác
thực người dùng.

    Môi trường triển khai: Hệ thống có khả năng triển khai trên hạ tầng nội
bộ hoặc nền tảng điện toán đám mây, đảm bảo tính ổn định, bảo mật và khả
năng truy cập linh hoạt cho nhiều nhóm người dùng.

   Quản trị và chia sẻ dữ liệu: Đảm bảo dữ liệu tài sản được lưu trữ tập
trung, phân quyền rõ ràng theo vai trò sử dụng. Hệ thống cần hỗ trợ thông
báo tự động, quản lý trạng thái thiết bị theo thời gian thực, đảm bảo tính
chính xác của dữ liệu và đáp ứng nhu cầu vận hành liên tục trong doanh
nghiệp.

   Tối ưu chi phí và nâng cao hiệu quả quản lý: Hạn chế thất thoát tài sản,
nâng cao khả năng kiểm soát hạ tầng IT và hỗ trợ nhà quản lý đưa ra quyết
định nhanh chóng, chính xác dựa trên dữ liệu tập trung.

1.3. Giới thiệu về đề tài nghiên cứu

1.3.1. Lý do lựa chọn đề tài

     Trong  quá  trình  vận  hành  doanh  nghiệp,  việc  quản  lý  tài  sản  thiết  bị  IT
thường  được  thực  hiện  thủ công thông qua bảng tính hoặc nhiều công cụ rời
rạc,  dẫn  đến  khó khăn trong việc theo dõi tình trạng thiết bị, lịch sử sử dụng
và  quá  trình bàn giao, thu hồi. Điều này dễ gây thất thoát tài sản, thiếu minh
bạch thông tin và mất nhiều thời gian trong công tác kiểm kê, bảo trì hoặc thu
hồi thiết bị.

     Bên  cạnh  đó,  số  lượng  tài  sản  công  nghệ  trong  doanh  nghiệp  ngày  càng
tăng cùng với nhu cầu quản lý tập trung, chính xác và cập nhật theo thời gian
thực.  Vì  vậy,  việc  xây  dựng  hệ  thống  quản  lý  tài  sản  thiết  bị  IT là cần thiết
nhằm  số  hóa  toàn  bộ  vòng đời tài sản, nâng cao hiệu quả quản lý, tối ưu chi
phí vận hành và hỗ trợ phối hợp giữa Nhân sự, Kỹ thuật viên và Quản lý một
cách đồng bộ, minh bạch hơn.

      Ngoài  ra, đề tài còn có ý nghĩa thực tiễn cao khi góp phần nâng cao khả
năng  quản  trị  hạ  tầng  công  nghệ  thông  tin,  giảm  khối  lượng  công  việc  thủ
công và tạo nền tảng cho quá trình chuyển đổi số trong doanh nghiệp.

 1.3.2. Mục tiêu nghiên cứu


7

     Mục tiêu cốt lõi của nghiên cứu này là xây dựng và triển khai một hệ thống
quản lý tài sản IT tập trung nhằm số hóa toàn diện vòng đời của thiết bị công
nghệ  trong  doanh  nghiệp.  Nghiên  cứu hướng tới việc thay thế hoàn toàn các
phương thức quản lý thủ công, rời rạc bằng một nền tảng dữ liệu thống nhất,
nơi mọi biến động của tài sản từ khâu nhập kho ban đầu, bàn giao đến thu hồi
đều được ghi nhận theo thời gian thực. Bằng cách thiết lập một quy trình làm
việc tự động, hệ thống không chỉ dừng lại ở việc lưu trữ thông tin mà còn trở
thành  công cụ điều phối nhịp nhàng giữa bộ phận Nhân sự, Kỹ thuật viên và
cấp  Quản  lý,  giúp  loại  bỏ  các  rào  cản  về  thông  tin  và tăng cường tính trách
nhiệm trong việc sử dụng tài sản công.

      Đi sâu vào khía cạnh vận hành, nghiên cứu tập trung tối ưu hóa các nghiệp
vụ kỹ thuật và hành chính thông qua việc ứng dụng công nghệ nhận diện hiện
đại  như mã QR hoặc Barcode. Điều này giúp các Kỹ thuật viên dễ dàng truy
xuất  lịch  sử  bảo  trì,  sửa chữa và theo dõi tình trạng sức khỏe của thiết bị, từ
đó  chủ động thực hiện các hoạt động bảo dưỡng định kỳ để duy trì hiệu suất
hạ tầng IT. Đồng thời, hệ thống giải quyết triệt để bài toán chống thất thoát tài
sản bằng cách thắt chặt quy trình bàn giao dài hạn và thu hồi thiết bị khi nhân
viên nghỉ việc, đảm bảo mọi tài sản đều được định vị và xác định chủ thể chịu
trách nhiệm rõ ràng trong suốt quá trình sử dụng.

      Cuối  cùng,  nghiên  cứu  hướng  đến  việc  cung  cấp một giải pháp quản trị
thông  minh  cho  cấp  Quản  lý  thông  qua  hệ  thống  báo  cáo  tự  động  và  minh
bạch. Thông qua việc phân tích dữ liệu về khấu hao, tần suất hư hỏng và hiệu
quả sử dụng thực tế, hệ thống hỗ trợ ban lãnh đạo đưa ra các quyết định chính
xác  về  việc  tái  đầu  tư  hoặc thanh lý tài sản khi hết giá trị sử dụng. Mục tiêu
sau cùng là tối ưu hóa chi phí vận hành (OPEX) và chi phí đầu tư (CAPEX),
giúp  doanh  nghiệp  không  chỉ  bảo  toàn  được  giá  trị  tài sản mà còn nâng cao
năng lực cạnh tranh thông qua một hạ tầng công nghệ được quản lý khoa học
và bền vững.

 1.3.3. Phương pháp nghiên cứu

      Thu thập định tính: Thông tin được thu thập thông qua phỏng vấn bán cấu
trúc các nhóm vai trò (Quản lý, kỹ thuật viên, nhân viên) nghiên cứu sẽ tổng
hợp các yêu cầu nghiệp vụ đặc thù, từ đó làm rõ các bài toán về thất thoát tài
sản, khó khăn trong kiểm kê và nhu cầu báo cáo thực tế. Những dữ liệu định
tính và định lượng này đóng vai trò là nền tảng quan trọng để xác lập phạm vi
tính năng và các mục tiêu kỹ thuật cần ưu tiên của hệ thống.

      Mô  hình  hóa  yêu  cầu:  Các  dữ  liệu  thu  thập  được  chuyển  thành  mô hình
nghiệp vụ bằng các công cụ như CD, BFD, DFD và Use Case, nhằm xác định
tác nhân, luồng thông tin, kho dữ liệu và ranh giới của hệ thống. Việc mô hình


8

hóa không chỉ giúp chuẩn hóa quy trình bàn giao, thu hồi và bảo trì tài sản mà
còn  đảm  bảo  cấu trúc dữ liệu được thiết kế tối ưu, giúp các thành viên trong
dự án và các bên liên quan có cái nhìn thống nhất về cách thức vận hành của
phần mềm trước khi đi vào xây dựng chi tiết.

     Thiết kế và nguyên mẫu: Dựa trên yêu cầu đã mô hình hóa, đề tài tiến hành
thiết  kế  cơ  sở  dữ  liệu  và  xây  dựng  giao  diện  nguyên  mẫu  bằng  Figma  cho
từng  nhóm người dùng. Nguyên mẫu giúp hình dung trước luồng thao tác và
kiểm tra mức độ phù hợp với nghiệp vụ.

     Đánh giá và kiểm thử: Hệ thống được kiểm tra thông qua kiểm thử nghiêm
ngặt  để  đảm  bảo  tính  ổn  định  và  độ  tin  cậy  trước  khi  vận  hành  chính  thức.
Phương  pháp  này  bao  gồm  việc  kiểm  thử  đơn  vị,  kiểm  thử  tích  hợp  và  đặc
biệt là kiểm thử chấp nhận người dùng (UAT) để xác nhận hệ thống hoạt động
đúng  theo  các  kịch  bản  nghiệp  vụ  đã đặt ra. Kết quả kiểm thử sẽ được phân
tích  để  đánh  giá  mức  độ  đáp ứng mục tiêu giảm thiểu thời gian vận hành và
tính  chính  xác  trong công tác kiểm kê. Đây là bước then chốt để nghiệm thu
kết quả nghiên cứu, đồng thời rút ra các bài học kinh nghiệm để hoàn thiện và
nâng cấp hệ thống trong tương lai.

1.3.4. Đối tượng và phạm vi nghiên cứu

       Đối tượng nghiên cứu của đề tài tập trung vào hai thành phần cốt lõi: thực
thể  tài  sản  thiết  bị  IT  và  các  quy  trình  nghiệp  vụ  xoay  quanh  vòng  đời  của
chúng tại Công ty cổ phẩn và công nghệ Mesoco. Về mặt thực thể, nghiên cứu
xem xét toàn bộ các danh mục thiết bị công nghệ trong doanh nghiệp bao gồm
phần  cứng  (máy  tính, máy chủ, thiết bị mạng, thiết bị ngoại vi) và các thông
tin  định  danh  đi  kèm  như  cấu  hình,  mã  tài  sản,  thời  hạn  bảo hành và giá trị
khấu  hao.  Về mặt nghiệp vụ, đối tượng nghiên cứu chính là các luồng tương
tác giữa ba nhóm người dùng trọng yếu: bộ phận Nhân sự với vai trò quản lý
biến động người dùng, đội ngũ Kỹ thuật viên chịu trách nhiệm vận hành, bảo
trì và cấp quản lý với nhu cầu giám sát, phê duyệt. Việc tập trung vào sự giao
thoa  giữa  tài  sản và con người giúp nghiên cứu xây dựng được một mô hình
quản trị toàn diện và sát với thực tế vận hành.

        Phạm vi nghiên cứu về mặt nội dung giới hạn trong việc số hóa các giai
đoạn  chính  của  vòng  đời  tài  sản  IT,  bắt  đầu  từ  thời điểm tạo đơn hàng mới,
bàn giao cho đến khi thu hồi, sửa chữa và thanh lý. Nghiên cứu không đi sâu
vào  các  nghiệp  vụ  kế  toán  chuyên  sâu  hay  quản  lý  tài  chính  doanh  nghiệp
tổng thể, mà chỉ tập trung vào việc giải quyết bài toán chống thất thoát, minh
bạch  hóa  lịch sử sử dụng và tối ưu hóa hiệu suất thiết bị. Về mặt công nghệ,
phạm  vi  nghiên  cứu  bao  gồm  việc  ứng  dụng các kỹ thuật nhận diện di động
như  mã  QR/Barcode  để  hỗ  trợ  kiểm kê thực tế và xây dựng giao diện tương


9

tác  trên  nền  tảng  web  hoặc  ứng  dụng  nhằm  đảm  bảo  tính  linh  hoạt  cho  kỹ
thuật viên khi di chuyển.

      Về phạm vi không gian và thời gian, nghiên cứu được triển khai áp dụng
tại  Công  ty  cổ  phẩn  và  công nghệ Mesoco có hệ thống hạ tầng IT tập trung,
nơi phát sinh nhu cầu quản lý thiết bị một cách khoa học để thay thế phương
thức  thủ  công  rời  rạc.  Nghiên  cứu  xem  xét  dữ  liệu  trong  suốt  vòng  đời  vận
hành của thiết bị, từ lúc phát sinh nhu cầu mua sắm cho đến khi thiết bị không
còn khả năng sử dụng và bị loại bỏ khỏi hệ thống. Giới hạn này giúp đề tài tập
trung nguồn lực vào việc xây dựng một giải pháp chuyên biệt cho hạ tầng IT,
đảm bảo tính khả thi cao trong việc chuyển đổi số và nâng cao năng lực quản
lý hạ tầng kỹ thuật cho tổ chức.

 1.3.5. Đối tượng hưởng lợi thông qua đề tài

●  Nhân  viên:  Gửi  yêu  cầu  bàn  giao  và theo dõi trạng thái thiết bị nhanh

chóng, minh bạch.

●  Kỹ  thuật  viên/Bộ phận IT: Dễ dàng quản lý, bảo trì và kiểm kê tài sản

trên hệ thống tập trung.

●  Quản lý doanh nghiệp: Theo dõi và thống kê tài sản hiệu quả, hỗ trợ ra

quyết định quản lý.

●  Doanh nghiệp: Tối ưu quản lý tài sản, giảm thất thoát và nâng cao hiệu

quả vận hành.

●  Nhà cung cấp: Hỗ trợ phối hợp đặt hàng và cập nhật trạng thái thiết bị

rõ ràng hơn.


10

CHƯƠNG 2

CƠ SỞ LÝ THUYẾT VÀ CÁC CÔNG CỤ THỰC HIỆN ĐỀ TÀI

2.1. Cơ sở lý thuyết

2.1.1.  Khái  niệm  về  Quản  lý  tài  sản  công  nghệ  thông  tin  (IT  Asset
Management - ITAM)

-

Lý thuyết quản lý tài sản (Asset Management):

Quản lý tài sản là quá trình theo dõi, kiểm soát và tối ưu việc sử dụng tài sản
trong  suốt  vòng  đời  của  chúng, từ khâu nhập kho, bàn giao, sử dụng, bảo trì
cho  đến  thu  hồi  và  thanh  lý.  Việc  quản  lý  hiệu quả giúp doanh nghiệp giảm
thất thoát, tối ưu chi phí và nâng cao hiệu suất sử dụng tài sản.

Lý thuyết hệ thống thông tin quản lý (Management Information System

-
- MIS):

Hệ  thống  thông  tin  quản lý hỗ trợ thu thập, lưu trữ, xử lý và cung cấp thông
tin phục vụ công tác quản lý và ra quyết định. Trong hệ thống quản lý tài sản
IT, MIS giúp dữ liệu được quản lý tập trung, đồng bộ và dễ dàng tra cứu theo
thời gian thực.

-

Lý thuyết cơ sở dữ liệu tập trung:

Dữ  liệu  tài  sản được lưu trữ trên hệ thống cơ sở dữ liệu tập trung nhằm đảm
bảo  tính  nhất quán, bảo mật và hỗ trợ truy xuất thông tin nhanh chóng. Điều
này  giúp  giảm  sai  sót  khi  quản  lý  thủ  công  và  tăng  khả  năng  kiểm  soát  dữ
liệu.

-

Quy trình quản lý vòng đời tài sản IT:

Vòng đời tài sản bao gồm các giai đoạn: nhập kho, bàn giao, sử dụng, bảo trì,
kiểm  kê,  thu  hồi  và  thanh  lý.  Việc  áp  dụng  mô  hình  quản  lý  vòng  đời  giúp
doanh nghiệp theo dõi đầy đủ trạng thái và lịch sử của từng thiết bị.

-

Lý thuyết phân quyền và bảo mật hệ thống:

Hệ thống áp dụng cơ chế phân quyền theo vai trò như Nhân sự, Kỹ thuật viên
và  Quản  lý  nhằm  đảm  bảo người dùng chỉ được truy cập các chức năng phù
hợp. Đồng thời, các biện pháp bảo mật giúp bảo vệ dữ liệu tài sản và thông tin
nội bộ doanh nghiệp.

-

Ứng dụng công nghệ thông tin trong chuyển đổi số doanh nghiệp:


11

Việc áp dụng CNTT vào quản lý tài sản giúp tự động hóa quy trình nghiệp vụ,
nâng  cao  hiệu  quả  vận  hành,  giảm  chi  phí  quản  lý  và  tăng  tính  minh  bạch
trong hoạt động doanh nghiệp.

2.1.2. Kiến thức về hệ thống thông tin và quản lý

      Hệ thống thông tin quản lý là tập hợp các thành phần gồm con người, dữ
liệu,  quy  trình và công nghệ được xây dựng nhằm thu thập, xử lý, lưu trữ và
cung  cấp  thông  tin  phục  vụ  hoạt  động  quản  lý  trong  tổ  chức.  Trong  doanh
nghiệp, hệ thống thông tin giúp hỗ trợ quản lý dữ liệu tập trung, tăng khả năng
phối  hợp  giữa  các  bộ  phận  và  hỗ  trợ  nhà  quản  lý  đưa  ra  quyết  định  nhanh
chóng, chính xác.

    Ngoài  ra,  việc  ứng  dụng  kiến  thức  quản  lý  còn  giúp  tối  ưu  quy trình vận
hành  nội  bộ,  nâng  cao  tính  minh  bạch  trong  quản  lý  tài sản, giảm thất thoát
thiết bị và nâng cao hiệu quả sử dụng hạ tầng công nghệ thông tin trong doanh
nghiệp.

- Nguyên tắc vận hành MIS trong doanh nghiệp

     Hệ thống thông tin quản lý (MIS - Management Information System) trong
quản lý tài sản thiết bị IT được vận hành dựa trên nguyên tắc thu thập, xử lý,
lưu trữ và cung cấp thông tin một cách chính xác, kịp thời và tập trung nhằm
hỗ trợ công tác quản lý tài sản trong doanh nghiệp.

Thu thập dữ liệu tập trung:

●
   Mọi thông tin liên quan đến tài sản như nhập kho, bàn giao, bàn giao, bảo
trì, kiểm kê và thu hồi đều được cập nhật trực tiếp trên hệ thống nhằm đảm
bảo dữ liệu đồng bộ và hạn chế sai sót do quản lý thủ công.

Xử lý và cập nhật theo thời gian thực:

●
   Hệ thống tự động cập nhật trạng thái tài sản khi phát sinh nghiệp vụ, giúp
người dùng dễ dàng theo dõi tình trạng thiết bị và lịch sử sử dụng tại mọi thời
điểm.

Phân quyền và kiểm soát truy cập:

●
Người dùng được phân quyền theo vai trò như Nhân sự, Kỹ thuật viên và
Quản lý để đảm bảo tính bảo mật và kiểm soát dữ liệu phù hợp với chức năng
công việc.

Minh bạch và truy vết thông tin:

●
Mọi thao tác trên hệ thống đều được lưu lại nhằm hỗ trợ kiểm tra, đối chiếu
và truy xuất lịch sử thay đổi tài sản khi cần thiết.

Hỗ trợ ra quyết định quản lý:

●
Hệ thống cung cấp báo cáo, thống kê và thông báo liên quan đến tình trạng tài


12

sản, giúp nhà quản lý đánh giá hiệu quả sử dụng thiết bị và đưa ra quyết định
kịp thời.

Đảm bảo tính ổn định và bảo mật dữ liệu:

●
Dữ liệu tài sản được lưu trữ an toàn, có cơ chế sao lưu và bảo vệ thông tin
nhằm đảm bảo hoạt động liên tục và hạn chế rủi ro mất dữ liệu trong doanh
nghiệp.

 - Lợi ích định lượng điển hình

Hệ thống quản lý tài sản thiết bị IT giúp giảm đáng kể thời gian xử lý công
việc thủ công, nâng cao độ chính xác trong quản lý dữ liệu và hạn chế thất
thoát tài sản. Nhờ khả năng theo dõi và cập nhật trạng thái thiết bị theo thời
gian thực, doanh nghiệp có thể tối ưu chi phí vận hành, rút ngắn thời gian
kiểm kê và nâng cao hiệu quả phối hợp giữa các bộ phận trong quá trình quản
lý tài sản IT.

2.1.3. Khái niệm cơ bản về website

Hệ thống được tiếp cận theo kiến trúc 3 lớp: UI - API - CSDL.

-  Thành phần và cơ chế chính
●  Giao diện (UI):

    Là lớp giao diện trực tiếp tương tác với người dùng như Nhân sự, Kỹ thuật
viên và Quản lý. Lớp này có nhiệm vụ hiển thị dữ liệu, tiếp nhận thao tác
người dùng và hỗ trợ các chức năng như quản lý tài sản, bàn giao, kiểm kê,
theo dõi trạng thái thiết bị và xem báo cáo.

●  Dịch vụ (API)

    Là lớp trung gian xử lý toàn bộ nghiệp vụ của hệ thống. API chịu trách
nhiệm tiếp nhận yêu cầu từ giao diện, kiểm tra dữ liệu, xử lý logic nghiệp vụ,
phân quyền người dùng và trao đổi dữ liệu với cơ sở dữ liệu. Đây là thành
phần giúp kết nối giữa giao diện và hệ thống lưu trữ dữ liệu một cách bảo mật
và đồng bộ.

●  Dữ liệu( CSDL)

     Là nơi lưu trữ toàn bộ dữ liệu liên quan đến tài sản thiết bị IT như thông
tin thiết bị, lịch sử bàn giao, bàn giao, bảo trì, kiểm kê và thu hồi tài sản. Dữ
liệu được quản lý tập trung nhằm đảm bảo tính chính xác, an toàn và hỗ trợ
truy xuất nhanh chóng khi cần thiết.

-  Yêu cầu phi chức năng

     Yêu cầu về hiệu năng và khả dụng:
Hệ thống cần đảm bảo khả năng xử lý ổn định với nhiều người dùng truy cập


13

đồng thời, phản hồi nhanh trong các thao tác tra cứu, cập nhật và thống kê dữ
liệu. Đồng thời, hệ thống phải hoạt động liên tục, hạn chế gián đoạn và hỗ trợ
sao lưu dữ liệu nhằm đảm bảo tính sẵn sàng trong quá trình vận hành.

     Yêu cầu về khả dụng người dùng:
Giao diện hệ thống cần thân thiện, dễ sử dụng và phù hợp với nhiều nhóm
người dùng như Nhân sự, Kỹ thuật viên và Quản lý. Các chức năng được bố
trí rõ ràng, hỗ trợ tra cứu nhanh, thông báo trực quan và thao tác thuận tiện
nhằm nâng cao trải nghiệm sử dụng.

     Yêu cầu về bảo mật:
Hệ thống phải áp dụng cơ chế xác thực và phân quyền người dùng theo vai trò
nhằm kiểm soát quyền truy cập dữ liệu. Đồng thời, dữ liệu cần được lưu trữ
an toàn, có cơ chế sao lưu và ghi nhận lịch sử thao tác để đảm bảo tính bảo
mật, minh bạch và hạn chế rủi ro mất mát thông tin.

2.1.4. Kiến thức về quản lý cơ sở dữ liệu

    Trong hệ thống quản lý tài sản thiết bị IT, quản lý cơ sở dữ liệu đóng vai trò
quan  trọng  trong  việc  lưu  trữ,  xử  lý  và  khai  thác  thông  tin  tài  sản một cách
hiệu quả. Kiến thức về quản lý cơ sở dữ liệu trong hệ thống bao gồm thiết kế
dữ liệu, vận hành cơ sở dữ liệu và tối ưu hiệu suất xử lý dữ liệu.

    Thiết kế dữ liệu là quá trình xây dựng cấu trúc dữ liệu phù hợp với nghiệp
vụ quản lý tài sản thiết bị IT. Dữ liệu được tổ chức thành các bảng như thông
tin  thiết  bị,  người  sử  dụng,  đơn  hàng,  sửa  chữa,  kiểm  kê và thu hủy tài sản.
Quá  trình  thiết  kế  cần  xác  định  các  khóa  chính,  khóa  ngoại  và  mối quan hệ
giữa  các  bảng  nhằm  đảm  bảo  tính  liên  kết,  tránh  trùng lặp dữ liệu và hỗ trợ
truy xuất thông tin chính xác. Ngoài ra, việc chuẩn hóa dữ liệu giúp nâng cao
khả năng quản lý và mở rộng hệ thống trong tương lai.

     Vận hành cơ sở dữ liệu liên quan đến việc quản lý và duy trì hoạt động ổn
định của hệ thống dữ liệu trong quá trình sử dụng. Hệ thống cần hỗ trợ thêm,
sửa,  xóa  và  tra  cứu  dữ  liệu  tài  sản  một  cách  nhanh  chóng  và  an toàn. Đồng
thời,  cơ  sở  dữ  liệu  phải  đảm  bảo  tính  toàn vẹn dữ liệu, phân quyền truy cập
cho từng người dùng và thực hiện sao lưu dữ liệu định kỳ nhằm hạn chế mất
mát  thông  tin.  Việc  giám sát hoạt động cơ sở dữ liệu cũng giúp phát hiện và
xử lý kịp thời các lỗi phát sinh trong hệ thống.

      Tối ưu cơ sở dữ liệu nhằm nâng cao tốc độ xử lý và hiệu suất hoạt động
của hệ thống quản lý tài sản thiết bị IT. Các biện pháp tối ưu bao gồm tạo chỉ
mục  (index)  cho  các  trường  dữ  liệu  thường  xuyên  truy  vấn,  tối  ưu  câu lệnh
SQL,  giảm  dữ liệu dư thừa và cải thiện cấu trúc bảng dữ liệu. Ngoài ra, việc
phân chia dữ liệu hợp lý và kiểm soát tài nguyên hệ thống giúp tăng khả năng


14

xử lý khi số lượng tài sản và người dùng ngày càng lớn. Nhờ đó, hệ thống có
thể  hoạt  động ổn định, đáp ứng nhanh các yêu cầu tra cứu và quản lý tài sản
trong doanh nghiệp.

2.2. Các công cụ hỗ trợ thực hiện đề tài

2.2.1. Draw.io - công cụ thiết kế các sơ đồ mô hình hóa website

     Draw.io (diagrams.net) là công cụ hỗ trợ thiết kế sơ đồ trực tuyến được sử
dụng  phổ  biến  trong  phân  tích  và  thiết  kế  hệ  thống.  Công  cụ  cho  phép  xây
dựng  nhiều  loại  sơ  đồ  như  sơ  đồ  luồng  dữ  liệu  (DFD),  sơ  đồ  Use  Case,
Activity Diagram, ERD và các mô hình quản lý hệ thống khác một cách trực
quan  và  dễ  sử  dụng.  Draw.io  mang  lại  nhiều lợi ích nhờ giao diện kéo – thả
đơn  giản,  hỗ  trợ  thiết  kế  nhanh  chóng  và  cung  cấp  nhiều mẫu sơ đồ có sẵn,
giúp  tiết  kiệm thời gian xây dựng mô hình. Ngoài ra, công cụ còn hỗ trợ lưu
trữ  trực  tuyến trên Google Drive, OneDrive hoặc lưu trực tiếp trên máy tính,
giúp dễ dàng quản lý và chia sẻ tài liệu.

     Điểm khác biệt của Draw.io là hoàn toàn miễn phí nhưng vẫn đáp ứng đầy
đủ các chức năng phục vụ mô hình hóa hệ thống chuyên nghiệp. Công cụ hoạt
động  trực  tiếp  trên  trình  duyệt  web mà không cần cài đặt phức tạp và hỗ trợ
xuất  sơ đồ dưới nhiều định dạng như PNG, PDF, SVG và XML phục vụ cho
việc  báo  cáo  và  in  ấn.  Trong  đề  tài  quản  lý tài sản thiết bị IT, Draw.io được
lựa chọn vì giao diện thân thiện, dễ thao tác và phù hợp để thiết kế các sơ đồ
phân  tích  hệ  thống  như  sơ  đồ  ngữ  cảnh,  sơ  đồ  phân  rã  chức  năng  và  sơ  đồ
DFD. Công cụ còn hỗ trợ chỉnh sửa linh hoạt, giúp dễ dàng cập nhật mô hình
trong quá trình phát triển hệ thống.

      Bên  cạnh  những  ưu  điểm,  Draw.io  vẫn  tồn  tại  một  số hạn chế như giao
diện  có  thể  trở  nên khó quản lý khi thiết kế sơ đồ quá lớn hoặc có nhiều đối
tượng. Một số tính năng cộng tác nhóm và quản lý phiên bản chưa mạnh bằng
các  công  cụ  chuyên  nghiệp  như  Microsoft  Visio  hoặc  Lucidchart.  Ngoài  ra,
việc căn chỉnh sơ đồ đôi khi còn mang tính thủ công nên có thể làm giảm tính
đồng đều của mô hình. Để khắc phục các hạn chế này, người dùng có thể chia
sơ đồ lớn thành nhiều sơ đồ nhỏ để dễ quản lý hơn, đồng thời sử dụng các tính
năng căn chỉnh tự động, lưới và nhóm đối tượng để tăng tính nhất quán cho sơ
đồ. Việc lưu trữ phiên bản định kỳ trên Google Drive hoặc Git cũng giúp hạn
chế mất dữ liệu và hỗ trợ quản lý thay đổi hiệu quả hơn.

2.2.2. Ngôn ngữ lập trình sử dụng

-  Chi tiết Backend

   Giải pháp Backend được xây dựng dựa trên ngôn ngữ PHP và framework
Laravel nhằm xử lý các luồng nghiệp vụ phức tạp. Hệ thống đóng vai trò


15

trung tâm trong việc quản lý yêu cầu từ người dùng, điều phối dữ liệu, thiết
lập quyền hạn và cung cấp hệ thống API đồng bộ.

●  Thành phần kỹ thuật: PHP 8.2, Laravel 12 kết hợp Laravel Sanctum.

●  Cơ sở lựa chọn: Framework này cung cấp cấu trúc mã nguồn chặt

chẽ, tối ưu cho việc tổ chức logic và tương tác cơ sở dữ liệu. Laravel
còn tích hợp sẵn các module bảo mật và xác thực, giúp đẩy nhanh
tiến độ hoàn thiện dự án.

-  Chi tiết Frontend

   Giao diện người dùng sử dụng nền tảng JavaScript/JSX với thư viện
React để kiến tạo các thành phần hiển thị, đi kèm công cụ Vite nhằm tối ưu
hóa hiệu suất trong quá trình lập trình web.

●  Thành phần kỹ thuật: React 19, Vite 7, Tailwind CSS, Axios và

React Router DOM.

●  Cơ sở lựa chọn: React hỗ trợ chia nhỏ giao diện thành các thành

phần có tính tái sử dụng cao, rất phù hợp với hệ thống đa chức năng.
Vite đảm bảo tốc độ phản hồi nhanh và quy trình đóng gói sản phẩm
mượt mà.

-  Cấu trúc Dữ liệu

   Trong giai đoạn phát triển, SQLite được sử dụng để lưu trữ toàn bộ thông
tin về tài sản IT, lịch trình bảo trì, hồ sơ kiểm kê và các chứng từ liên quan
đến mua sắm hay thanh lý.

●  Thành phần kỹ thuật: SQLite.
●  Cơ sở lựa chọn: Đây là giải pháp lưu trữ tinh gọn, không đòi hỏi thiết
lập máy chủ phức tạp, giúp việc triển khai và thử nghiệm các tính
năng quản lý tài sản diễn ra nhanh chóng và hiệu quả.

-  Đảm bảo Chất lượng

   Để nâng cao độ tin cậy, các công cụ kiểm thử tự động được áp dụng
xuyên suốt nhằm phát hiện sớm các sai sót tiềm ẩn trong mã nguồn.

●  Thành phần kỹ thuật: PHPUnit, Vite build cùng các script xác thực

đa ngôn ngữ (i18n).

●  Cơ sở lựa chọn: Việc phối hợp kiểm tra logic backend và độ ổn định
của frontend giúp duy trì tính chính xác của dữ liệu và trải nghiệm
người dùng trước khi hệ thống chính thức vận hành.

2.2.3. Hệ quản trị cơ sở dữ liệu SQL Server


16

     SQL Server là hệ quản trị cơ sở dữ liệu quan hệ (RDBMS) do Microsoft
phát triển, dùng để lưu trữ, quản lý và xử lý dữ liệu trong các hệ thống phần
mềm. SQL Server hỗ trợ truy vấn dữ liệu, bảo mật, sao lưu và quản lý dữ
liệu tập trung một cách ổn định và hiệu quả. Hệ thống quản lý tài sản thiết
bị IT sử dụng hệ quản trị cơ sở dữ liệu Microsoft SQL Server để lưu trữ,
quản lý và truy xuất dữ liệu tập trung. SQL Server hỗ trợ xử lý dữ liệu ổn
định, bảo mật cao và đáp ứng tốt nhu cầu quản lý dữ liệu trong môi trường
doanh nghiệp.

-  Lợi ích:

    SQL Server giúp quản lý dữ liệu tập trung, tăng tốc độ truy xuất thông
tin, hỗ trợ sao lưu và phục hồi dữ liệu hiệu quả. Ngoài ra, hệ quản trị này
còn giúp đảm bảo tính toàn vẹn dữ liệu, hỗ trợ phân quyền người dùng và
nâng cao hiệu quả vận hành hệ thống.

-  Đặc trưng khác biệt:

    SQL Server có khả năng tích hợp tốt với các công nghệ của Microsoft,
hỗ trợ quản lý dữ liệu lớn, tối ưu truy vấn và cung cấp nhiều công cụ quản
trị trực quan. Hệ thống cũng hỗ trợ bảo mật nhiều lớp và khả năng mở rộng
linh hoạt theo quy mô doanh nghiệp.

-  Lý do lựa chọn:

    SQL Server được lựa chọn do có độ ổn định cao, dễ triển khai, phù hợp
với mô hình quản lý doanh nghiệp và hỗ trợ tốt cho các hệ thống quản lý tài
sản. Đồng thời, hệ quản trị này có tài liệu phong phú, cộng đồng hỗ trợ lớn
và dễ dàng bảo trì trong quá trình phát triển hệ thống.

-  Hạn chế:

     SQL Server có thể yêu cầu cấu hình phần cứng tương đối cao khi dữ
liệu lớn hoặc số lượng truy cập tăng mạnh. Ngoài ra, chi phí bản quyền ở
một số phiên bản có thể cao đối với doanh nghiệp quy mô nhỏ.

-  Cách khắc phục:

Hệ thống có thể tối ưu cơ sở dữ liệu, sử dụng cơ chế indexing, backup định
kỳ và tối ưu truy vấn để nâng cao hiệu năng. Đồng thời, doanh nghiệp có
thể lựa chọn phiên bản phù hợp với quy mô sử dụng hoặc triển khai trên hạ
tầng tối ưu nhằm giảm chi phí vận hành.

2.2.4. Công cụ thiết kế giao diện - Figma

Figma là công cụ thiết kế giao diện trực quan, cho phép xây dựng bản

phác thảo, bố cục và mô phỏng luồng thao tác của người dung. Figma là


17

công cụ thiết kế giao diện UI/UX hỗ trợ xây dựng giao diện và prototype
cho hệ thống quản lý tài sản thiết bị IT.

-  Lợi ích:

Hỗ trợ thiết kế giao diện trực quan, làm việc nhóm theo thời gian thực

và dễ dàng trao đổi giữa thiết kế và lập trình.

-  Đặc trưng khác biệt:

Hoạt động trên nền tảng web, không cần cài đặt phức tạp và cho phép

nhiều người cùng chỉnh sửa trên một dự án.

-  Lý do lựa chọn:

Figma dễ sử dụng, hỗ trợ thiết kế nhanh, phù hợp với quy trình phát

triển phần mềm và giúp tiết kiệm thời gian xây dựng giao diện.

-  Hạn chế:

Phụ thuộc vào kết nối Internet và một số tính năng nâng cao yêu cầu tài

khoản trả phí.

-  Cách khắc phục:

Sử dụng phiên bản phù hợp với nhu cầu dự án, tối ưu tài nguyên thiết

kế và đảm bảo kết nối mạng ổn định trong quá trình làm việc.

2.2.5. Visual Studio Code (phiên bản 2022)

Visual Studio Code (VS Code) là một trình soạn thảo mã nguồn nhẹ
nhưng mạnh mẽ, được phát triển bởi Microsoft và hỗ trợ đa nền tảng. Công
cụ này cho phép lập trình viên viết mã bằng nhiều ngôn ngữ khác nhau như
JavaScript, TypeScript, Java, Python… đồng thời cung cấp một hệ sinh thái
tiện ích mở rộng phong phú. Trong đề tài này, Visual Studio Code được sử
dụng làm môi trường phát triển chính cho cả backend và frontend, hỗ trợ
kết nối với kho mã GitHub, theo dõi phiên bản mã nguồn cũng như kiểm
thử các API thông qua các tiện ích tích hợp.

Visual Studio Code là môi trường phát triển mã nguồn được sử dụng để

xây dựng và quản lý hệ thống quản lý tài sản thiết bị IT.

-  Lợi ích:

Hỗ trợ lập trình nhanh, quản lý mã nguồn hiệu quả và tích hợp nhiều

công cụ hỗ trợ phát triển phần mềm.

-  Đặc trưng khác biệt:


18

Giao diện nhẹ, dễ sử dụng, hỗ trợ nhiều ngôn ngữ lập trình và có kho

tiện ích mở rộng (Extensions) phong phú.

-  Lý do lựa chọn:

Visual Studio Code được chọn vì tính phổ biến, dễ sử dụng và khả năng

tối ưu quy trình phát triển phần mềm. Đây là công cụ miễn phí, hoạt động
tốt trên nhiều hệ điều hành và đặc biệt phù hợp với các nhóm phát triển nhỏ
như nhóm thực hiện đề tài. Việc tích hợp Git, terminal và tiện ích kiểm thử
giúp VS Code trở thành môi trường “tất cả trong một”, hỗ trợ hiệu quả từ
lập trình đến kiểm thử.

-  Hạn chế và cách khắc phục:

Mặc dù có nhiều ưu điểm, Visual Studio Code cũng có nhược điểm là

việc cài đặt quá nhiều tiện ích mở rộng có thể khiến công cụ chạy chậm
hoặc tiêu tốn nhiều tài nguyên hệ thống. Để khắc phục, nhóm chỉ cài đặt
các tiện ích thật sự cần thiết phục vụ cho lập trình backend, frontend và
kiểm thử API. Điều này giúp đảm bảo VS Code hoạt động ổn định và đạt
hiệu suất tối ưu trong suốt quá trình phát triển.


19

CHƯƠNG 3: XÂY DỰNG WEBSITE QUẢN LÝ TÀI SẢN THIẾT BỊ IT
TẠI CÔNG TY CỔ PHẦN CÔNG NGHỆ VÀ GIẢI PHÁP MESOCO

3.1. Mô tả bài toán và xác định yêu cầu

3.1.1. Mô tả bài toán

Tại  Công  ty  cổ phẩn công nghệ và giải pháp Mesoco số lượng tài sản và
thiết bị IT như máy tính, laptop, màn hình, thiết bị mạng và các phụ kiện công
nghệ  ngày  càng  tăng.  Tuy  nhiên,  việc  quản  lý  hiện  nay  chủ  yếu  được  thực
hiện  thủ  công  thông  qua  bảng  tính  hoặc  giấy  tờ  rời  rạc,  gây khó khăn trong
việc  theo  dõi  tình  trạng  thiết  bị,  lịch  sử  bàn giao, bảo trì và kiểm kê tài sản.
Điều này dễ dẫn đến thất thoát tài sản, thiếu minh bạch thông tin và mất nhiều
thời gian trong quá trình quản lý.

Xuất phát từ thực tế đó, bài toán đặt ra là xây dựng website quản lý tài sản
thiết bị IT nhằm số hóa toàn bộ quy trình quản lý tài sản trong doanh nghiệp.
Hệ thống hỗ trợ quản lý các nghiệp vụ như nhập kho, bàn giao, bàn giao, thu
hồi,  bảo  trì,  kiểm  kê  và  thanh  lý  thiết  bị.  Đồng  thời, website cho phép phân
quyền  người  dùng  theo  vai trò như Nhân sự, Kỹ thuật viên và Quản lý, giúp
dữ liệu được quản lý tập trung, minh bạch và dễ dàng tra cứu.

Ngoài  ra,  hệ  thống  còn  hỗ  trợ  theo  dõi  trạng  thái  tài  sản  theo  thời  gian
thực,  lưu  trữ  lịch  sử  sử  dụng  thiết  bị  và  cung cấp báo cáo thống kê phục vụ
công tác quản lý. Qua đó giúp doanh nghiệp tối ưu chi phí vận hành, nâng cao
hiệu quả quản lý hạ tầng IT và giảm khối lượng công việc thủ công trong quá
trình vận hành nội bộ.

 3.1.2. Yêu cầu chức năng của hệ thống


20

Dựa  trên  kết  quả  khảo  sát  và phân tích nghiệp vụ tại Công ty cổ phần
công  nghệ  và  giải  pháp  Mesoco,  các  yêu  cầu  chức  năng  chính  được  xác
định như sau:

-  Quản lý danh mục và hồ sơ

Hệ thống hỗ trợ quản lý danh mục và hồ sơ tài sản thiết bị IT một cách
tập  trung  và  đồng  bộ.  Các  thông  tin được lưu trữ bao gồm mã tài sản, tên
thiết bị, loại thiết bị, cấu hình, nhà cung cấp, ngày mua, thời hạn bảo hành,
giá trị tài sản và trạng thái sử dụng. Hệ thống cũng hỗ trợ quản lý thông tin
nhà cung cấp như tên đơn vị cung cấp, thông tin liên hệ và lịch sử cung cấp
thiết bị. Ngoài ra, hệ thống còn quản lý thông tin nhân viên, phòng ban và
lịch sử liên quan đến quá trình sử dụng tài sản nhằm hỗ trợ tra cứu, theo dõi
và quản lý thiết bị hiệu quả hơn trong doanh nghiệp.

-  Quản lý đơn hàng

Hệ thống hỗ trợ quản lý quá trình nhập kho thiết bị mới từ nhà cung cấp
và  cập  nhật  thông  tin  tài  sản  lên  hệ  thống.  Mỗi  thiết bị được khởi tạo mã
định  danh  duy  nhất  như  Asset  Tag  hoặc  QR  Code  để  thuận  tiện  cho  việc
theo  dõi  và  quản  lý.  Đồng  thời,  hệ  thống lưu trữ các thông tin quan trọng
như cấu hình thiết bị, ngày mua, thời hạn bảo hành và giá trị tài sản.

-  Quản lý vận hành

Hệ  thống  hỗ  trợ  bàn  giao  thiết bị cho nhân viên sử dụng dài hạn. Mỗi
tài sản được gắn với người sử dụng cụ thể nhằm đảm bảo trách nhiệm bảo
quản trong quá trình làm việc. Khi nhân viên nghỉ việc hoặc không còn nhu
cầu sử dụng, hệ thống thực hiện thu hồi thiết bị, cập nhật trạng thái tài sản
và đưa thông tin người được bàn giao về null để sẵn sàng cho lần bàn giao
tiếp theo.

-  Quản lý bảo trì

Hệ thống hỗ trợ theo dõi và quản lý quá trình bảo trì, sửa chữa thiết bị
IT.  Hệ  thống  tự  động nhắc lịch bảo trì định kỳ như vệ sinh máy tính, thay
keo  tản  nhiệt  hoặc  kiểm  tra  hệ  thống  Server sau mỗi 6 tháng. Khi thiết bị
gặp sự cố, trạng thái sẽ được chuyển sang “Đang sửa chữa”, đồng thời lưu
lại  lịch  sử  hư  hỏng,  chi  phí  sửa  chữa  và  tình  trạng  thiết  bị  sau  sửa  chữa
nhằm hỗ trợ theo dõi khấu hao và hiệu quả sử dụng tài sản.

-  Quản lý kiểm kê & thu hủy

Hệ  thống  hỗ  trợ  kiểm  kê  tình trạng thực tế của tài sản và cập nhật kết
quả  lên  hệ  thống  nhằm  đảm  bảo  tính  chính  xác  của  dữ  liệu  quản  lý.  Khi


21

mức độ hư hỏng hoặc khấu hao của tài sản đạt từ 75% trở lên, hệ thống sẽ
đề  xuất  thu  hủy  lên quản lý để xem xét xử lý. Đối với các thiết bị quá cũ,
hỏng không thể sửa chữa hoặc hết giá trị sử dụng, hệ thống hỗ trợ ghi nhận
quá trình thanh lý hoặc tiêu hủy và loại bỏ tài sản khỏi danh sách đang hoạt
động.

-  Báo cáo và thống kê

Hệ thống hỗ trợ tổng hợp và thống kê dữ liệu tài sản thiết bị IT nhằm

phục vụ công tác quản lý và theo dõi hoạt động vận hành trong doanh
nghiệp. Các báo cáo bao gồm số lượng tài sản đang sử dụng, tài sản đang
sửa chữa, tài sản đã thu hồi hoặc thanh lý, tình trạng khấu hao và lịch sử
bàn giao thiết bị theo nhân viên hoặc phòng ban. Ngoài ra, hệ thống còn hỗ
trợ thống kê chi phí sửa chữa, bảo trì và tình trạng sử dụng tài sản theo thời
gian, giúp nhà quản lý dễ dàng đánh giá hiệu quả sử dụng thiết bị và đưa ra
quyết định phù hợp.

3.1.3. Yêu cầu phi chức năng của hệ thống

Yêu cầu phi chức năng (Non-Functional Requirements) mô tả các đặc
tính, tiêu chuẩn kỹ thuật và yếu tố vận hành cần thiết để đảm bảo hệ thống
hoạt động ổn định, hiệu quả và bảo mật. Các yêu cầu này không trực tiếp thể
hiện qua chức năng, nhưng đóng vai trò nền tảng giúp hệ thống đạt chất lượng
cao, dễ bảo trì và mở rộng trong tương lai.

-  Hiệu năng (Performance)

Hệ thống cần đảm bảo tốc độ xử lý nhanh và phản hồi ổn định khi nhiều
người dùng truy cập đồng thời. Các thao tác như tìm kiếm, cập nhật trạng thái
tài sản, thống kê và xuất báo cáo cần được thực hiện trong thời gian ngắn
nhằm đảm bảo hiệu quả vận hành.

-  Tính bảo mật (Security)

Hệ thống phải áp dụng cơ chế xác thực tài khoản và phân quyền người
dùng theo vai trò như Nhân sự, Kỹ thuật viên và Quản lý. Dữ liệu tài sản cần
được bảo vệ an toàn, hạn chế truy cập trái phép và hỗ trợ lưu lại lịch sử thao
tác để đảm bảo tính minh bạch..

-  Tính khả dụng và độ tin cậy (Availability & Reliability)

Hệ thống cần hoạt động ổn định, hạn chế lỗi trong quá trình sử dụng và
đảm bảo tính chính xác của dữ liệu. Đồng thời, hệ thống phải có cơ chế sao
lưu và phục hồi dữ liệu nhằm giảm thiểu rủi ro mất mát thông tin khi xảy ra
sự cố.


22

-  Tính dễ sử dụng (Usability)

Giao diện hệ thống cần trực quan, dễ thao tác và phù hợp với nhiều nhóm

người dùng khác nhau. Các chức năng phải được bố trí rõ ràng, hỗ trợ tìm
kiếm nhanh và giúp người dùng dễ dàng tiếp cận trong quá trình sử dụng.

-  Tính bảo trì và mở rộng (Maintainability & Scalability)

Hệ thống cần được xây dựng theo kiến trúc dễ bảo trì, thuận tiện cho việc
nâng cấp và bổ sung chức năng mới trong tương lai. Ngoài ra, hệ thống phải
có khả năng mở rộng để đáp ứng số lượng người dùng và dữ liệu ngày càng
tăng của doanh nghiệp.

-  Tính tương thích (Compatibility)

Website cần hoạt động ổn định trên các trình duyệt phổ biến như Google
Chrome, Microsoft Edge, Mozilla Firefox và Safari. Hệ thống tương thích tốt
với các hệ điều hành thông dụng (Windows, macOS, Android, iOS) và hỗ trợ
kết nối API với các hệ thống bên thứ ba như cổng thanh toán hoặc lưu trữ dữ
liệu đám mây. Hệ thống cần hoạt động ổn định trên nhiều trình duyệt và môi
trường triển khai khác nhau, đồng thời hỗ trợ tích hợp với các hệ thống nội bộ
hoặc công cụ quản lý khác của doanh nghiệp khi cần thiết.

-  Sao lưu và phục hồi dữ liệu (Backup & Recovery)

Cơ sở dữ liệu được sao lưu tự động hàng ngày và định kỳ hàng tuần vào
kho lưu trữ bảo mật riêng biệt. Hệ thống phải có khả năng phục hồi toàn bộ
dữ liệu trong vòng 24 giờ khi xảy ra sự cố. Các phiên bản sao lưu được kiểm
tra định kỳ để đảm bảo tính toàn vẹn của dữ liệu.

-  Tính an toàn và kiểm soát truy cập (Audit & Logging)

Hệ thống cần ghi nhận lịch sử thao tác của người dùng như đăng nhập,
cập nhật dữ liệu, bàn giao hoặc thu hồi tài sản nhằm hỗ trợ kiểm tra, giám sát
và đảm bảo tính minh bạch trong quá trình sử dụng. Quản trị viên có thể xem,
lọc và truy vết các hoạt động này để phát hiện kịp thời các hành vi bất thường
hoặc sai phạm.

-  Tính ổn định và khôi phục sau lỗi (Fault Tolerance)

Hệ thống cần đảm bảo khả năng hoạt động ổn định, hạn chế gián đoạn khi

phát sinh lỗi. Trong trường hợp xảy ra sự cố, hệ thống phải có khả năng khôi
phục nhanh để giảm ảnh hưởng đến hoạt động quản lý tài sản của doanh
nghiệp.

3.2. Mô hình hoá hệ thống

3.2.1. Sơ đồ luồng thông tin IFD


23

3.2.1.1. Sơ đồ luồng thông tin IFD Tạo đơn hàng

Sơ đồ 3.1 mô tả sơ đồ luồng thông tin IFD của quy trình đặt hàng và nhập
kho  tại  Công  ty  Cổ  phần  công  nghệ  và  giải  pháp  Mesoco.  Sơ  đồ  được  chia
thành ba giai đoạn bao gồm: Bắt đầu, Trong quá trình và Kết thúc, đồng thời
thể hiện rõ trách nhiệm và luồng thông tin giữa các tác nhân: Hệ thống, Quản
lý và Nhà cung cấp.


24

Sơ đồ 3.1: Sơ đồ luồng thông tin IFD Tạo đơn hàng

(Nguồn tại Công ty Cổ phần công nghệ và giải pháp Mesoco)

-  Giai đoạn Bắt đầu:

Quy trình khởi đầu từ phía Quản lý với hành động gửi yêu cầu tạo đơn
hàng mới vào hệ thống. Ngay sau đó, Hệ thống đóng vai trò trung gian tiếp
nhận và lưu trữ toàn bộ thông tin đơn hàng vào cơ sở dữ liệu. Để hoàn tất
bước thiết lập, Hệ thống tự động gửi một email thông báo đến Nhà cung cấp,
chính thức kích hoạt luồng giao tiếp giữa doanh nghiệp và đơn vị cung ứng.

-  Giai đoạn Trong quá trình:

Đây là giai đoạn phối hợp chặt chẽ để đảm bảo tiến độ đơn hàng. Nhà

cung cấp sau khi nhận email sẽ phản hồi để xác nhận đơn và hẹn ngày giao
hàng cụ thể. Dựa trên thông tin này, Quản lý tiến hành đọc mail và cập nhật
ngày giao dự kiến vào Hệ thống. Lúc này, Hệ thống tự động chuyển trạng thái
đơn hàng sang "Chờ giao hàng" và duy trì việc theo dõi; khi gần đến ngày
hẹn, Hệ thống sẽ tự động gửi email nhắc nhở Nhà cung cấp một lần nữa để họ
phản hồi và xác nhận việc giao hàng thực tế.

-  Giai đoạn Kết thúc:

 Giai đoạn cuối tập trung vào công tác hậu cần và kiểm soát chất lượng
khi hàng hóa được chuyển đến. Quản lý trực tiếp nhận hàng vật lý, chụp ảnh
minh chứng và tiến hành kiểm tra số lượng cũng như chất lượng. Nếu hàng
hóa không đạt yêu cầu, luồng thông tin sẽ chuyển ngược lại phía Nhà cung
cấp để thực hiện thủ tục trả hàng qua email. Ngược lại, nếu hàng hóa đạt
chuẩn, Quản lý thực hiện xác nhận nhập kho; khi đó, Hệ thống sẽ tự động cập
nhật trạng thái cuối cùng là "Giao hàng thành công" và đồng bộ hóa dữ liệu
các thiết bị đạt chuẩn vào danh mục quản lý.

3.2.1.2. Sơ đồ luồng thông tin IFD bàn giao thiết bị

Hình 3.2 trình bày sơ đồ luồng thông tin IFD của quy trình bàn giao thiết
bị tại Công ty Cổ phần công nghệ và giải pháp Mesoco. Quy trình được mô tả
theo ba giai đoạn: Bắt đầu, Trong quá trình và Kết thúc, đồng thời thể hiện sự
tương  tác  giữa  ba  tác  nhân  chính  gồm  Nhân  viên,  Hệ thống, Quản lý và Kỹ
thuật viên.


25

Sơ đồ 3.2: Sơ đồ luồng thông tin IFD bàn giao thiết bị

(Nguồn: Công ty Cổ phần công nghệ và giải pháp Mesoco)

-  Giai đoạn bắt đầu

Nhân  viên  thực  hiện  gửi  phiếu  yêu  cầu  bàn  giao  thiết  bị  lên hệ thống
khi  có  nhu  cầu  chuyển giao tài sản hoặc thiết bị IT. Sau khi tiếp nhận yêu
cầu, hệ thống tự động tạo phiếu yêu cầu bàn giao ở trạng thái chờ duyệt và
chuyển  thông  tin  đến  quản  lý  để  xem  xét.  Đây là bước khởi tạo quy trình
nhằm đảm bảo mọi hoạt động bàn giao đều được ghi nhận và kiểm soát trên
hệ thống.

-  Giai đoạn trong quá trình xử lý

Quản lý tiến hành kiểm tra nội dung yêu cầu bàn giao thiết bị. Nếu yêu
cầu  không  hợp  lệ hoặc chưa đầy đủ thông tin, quản lý từ chối duyệt và hệ
thống gửi phản hồi lý do từ chối cho nhân viên để chỉnh sửa hoặc bổ sung.
Nếu yêu cầu hợp lệ, quản lý thực hiện duyệt phiếu bàn giao và tạo lệnh bàn
giao  thiết  bị  cho  kỹ  thuật  viên  xử  lý.  Sau  đó,  kỹ  thuật viên tiến hành bàn
giao  thiết  bị  thực  tế  và  xác  nhận  việc  bàn  giao  đã  hoàn  thành  theo  đúng
thông tin được phê duyệt.

-  Giai đoạn kết thúc


26

Sau khi kỹ thuật viên xác nhận bàn giao thành công, hệ thống tiến hành
cập nhật trạng thái của thiết bị trong cơ sở dữ liệu. Đồng thời, hệ thống ghi
nhận  thông  tin  người  đang  sử  dụng  thiết  bị  mới  nhằm  phục  vụ  công  tác
quản  lý  tài  sản  và  theo  dõi  lịch  sử  sử  dụng.  Cuối  cùng,  toàn bộ thông tin
bàn giao được lưu trữ trên hệ thống và nhân viên nhận được thông báo xác
nhận bàn giao thành công, kết thúc quy trình.

3.2.1.3. Sơ đồ luồng thông tin IFD thu hồi thiết bị

Hình 3.3 trình bày sơ đồ luồng thông tin IFD của quy trình thu hồi thiết
bị tại Công ty Cổ phần công nghệ và giải pháp Mesoco. Quy trình được mô
tả  theo  ba  giai  đoạn:  Bắt  đầu,  Trong  quá  trình  và  Kết  thúc,  đồng thời thể
hiện  sự  tương tác giữa ba tác nhân chính gồm Nhân viên, Hệ thống, Quản
lý và Kỹ thuật viên.

Sơ đồ 3.3: Sơ đồ luồng thông tin IFD thu hồi thiết bị

(Nguồn: Công ty Cổ phần công nghệ và giải pháp Mesoco)

-  Giai đoạn bắt đầu

Nhân viên gửi phiếu yêu cầu thu hồi thiết bị lên hệ thống khi cần hoàn
trả  hoặc  thu  hồi  tài  sản  IT  đang  sử  dụng.  Sau  khi  tiếp  nhận  yêu  cầu,  hệ
thống tạo phiếu thu hồi ở trạng thái chờ duyệt và chuyển thông tin đến quản


27

lý để xem xét. Giai đoạn này giúp đảm bảo mọi yêu cầu thu hồi thiết bị đều
được ghi nhận đầy đủ và quản lý tập trung trên hệ thống.

-  Giai đoạn trong quá trình xử lý

Quản  lý  kiểm  tra  và  đánh  giá  yêu  cầu  thu  hồi  thiết  bị.  Nếu  yêu  cầu
không  hợp  lệ  hoặc  thiếu  thông  tin  cần  thiết,  quản  lý  từ  chối  duyệt  và  hệ
thống  gửi  phản  hồi  lý  do  từ  chối  cho  nhân  viên.  Nếu  yêu  cầu  được  chấp
nhận, quản lý tiến hành duyệt phiếu thu hồi và tạo lệnh thu hồi thiết bị cho
kỹ thuật viên thực hiện. Kỹ thuật viên sau đó tiến hành thu hồi thiết bị thực
tế,  xác  nhận  đã  nhận  lại  thiết  bị và kiểm tra tình trạng thiết bị sau khi thu
hồi để đánh giá mức độ sử dụng, hư hỏng hoặc khả năng tái sử dụng.

-  Giai đoạn kết thúc

Sau khi quá trình thu hồi hoàn tất, hệ thống ghi nhận tình trạng thiết bị
và cập nhật trạng thái mới của tài sản trong cơ sở dữ liệu. Đồng thời, toàn
bộ  thông  tin  liên  quan  đến  quá  trình  thu  hồi  được  lưu  trữ  nhằm  phục  vụ
việc  tra  cứu  và  quản  lý  lịch  sử  thiết  bị.  Cuối  cùng,  nhân  viên  nhận  được
thông báo xác nhận thu hồi thành công, kết thúc quy trình thu hồi thiết bị.

3.2.1.4. Sơ đồ luồng thông tin IFD yêu cầu sửa chữa

Sơ  đồ  3.4  thể  hiện  sơ  đồ luồng thông tin IFD mô tả quy trình yêu cầu
sửa  chữa  và  xử  lý  yêu  cầu  tại  Công  ty  Cổ  phần  công  nghệ  và  giải  pháp
Mesoco. Quy trình được mô tả theo ba giai đoạn: Bắt đầu, Trong quá trình
và  Kết  thúc, đồng thời thể hiện sự tương tác giữa bốn tác nhân chính gồm
Nhân viên, Hệ thống, Quản lý và Kỹ thuật viên.


28

Sơ đồ 3.4: Sơ đồ luồng thông tin IFD yêu cầu sửa chữa

(Nguồn: Công ty Cổ phần công nghệ và giải pháp Mesoco)

-  Giai đoạn bắt đầu

Nhân  viên  gửi  phiếu  yêu  cầu  sửa  chữa  thiết  bị  lên  hệ  thống  khi  phát
hiện thiết bị gặp sự cố hoặc hư hỏng trong quá trình sử dụng. Hệ thống tiếp
nhận  yêu  cầu và tạo phiếu sửa chữa ở trạng thái chờ duyệt, sau đó chuyển
thông tin đến quản lý để xem xét. Giai đoạn này nhằm đảm bảo các yêu cầu
sửa chữa được ghi nhận đầy đủ và xử lý theo đúng quy trình quản lý tài sản
thiết bị IT.

-  Giai đoạn trong quá trình xử lý

Quản  lý  tiến  hành  kiểm  tra  nội  dung  yêu  cầu  sửa  chữa.  Nếu  yêu  cầu
không  hợp  lệ  hoặc  không  đủ  điều  kiện  xử  lý, quản lý từ chối duyệt và hệ
thống gửi thông báo phản hồi cho nhân viên. Nếu yêu cầu được phê duyệt,
quản  lý  duyệt  phiếu  sửa  chữa  và  sắp xếp kỹ thuật viên thực hiện xử lý sự
cố, đồng thời cập nhật trạng thái thiết bị trên hệ thống. Kỹ thuật viên sau đó
tiến  hành  kiểm  tra  sơ  bộ  thiết  bị  để  xác  định  nguyên  nhân  hư  hỏng,  ghi


29

nhận các thay thế linh kiện nếu có và thực hiện nội dung sửa chữa hoặc bảo
trì thiết bị theo yêu cầu.

-  Giai đoạn kết thúc

Sau khi việc sửa chữa hoàn tất, hệ thống cập nhật nhật ký sửa chữa để
lưu  lại  toàn  bộ  thông  tin xử lý thiết bị. Đồng thời, tình trạng thiết bị được
cập nhật lại nhằm phản ánh trạng thái hoạt động mới sau sửa chữa hoặc bảo
trì.  Cuối  cùng,  nhân  viên  thực  hiện  nghiệm  thu  và  xác  nhận  hoàn  tất  sửa
chữa, kết thúc quy trình sửa chữa thiết bị.

3.2.1.5. Sơ đồ luồng thông tin IFD kiểm kê thiết bị

Sơ  đồ  3.5  thể  hiện  sơ  đồ luồng thông tin IFD mô tả quy trình yêu cầu
kiểm  kê  tại  Công  ty  Cổ  phần  công  nghệ  và  giải  pháp  Mesoco.  Quy  trình
được  mô  tả  theo  ba giai đoạn: Bắt đầu, Trong quá trình và Kết thúc, đồng
thời thể hiện sự tương tác giữa ba tác nhân chính gồm Quản lý, Hệ thống và
Kỹ thuật viên.


30

Sơ đồ 3.5: Sơ đồ luồng thông tin IFD kiểm kê tài sản

(Nguồn: Công ty Cổ phần công nghệ và giải pháp Mesoco)

-  Giai đoạn bắt đầu

Quản lý thực hiện yêu cầu thiết lập thời gian và phạm vi kiểm kê thiết
bị trên hệ thống nhằm xác định kế hoạch kiểm kê tài sản trong từng đợt cụ
thể. Sau khi tiếp nhận yêu cầu, hệ thống tự động tổng hợp và tạo danh sách
các thiết bị cần kiểm kê, sau đó chuyển thông tin cho kỹ thuật viên để tiến
hành kiểm tra thực tế. Giai đoạn này giúp đảm bảo hoạt động kiểm kê được
tổ  chức  đúng thời gian, đúng phạm vi và đúng đối tượng thiết bị cần quản
lý.

-  Giai đoạn trong quá trình xử lý

Kỹ thuật viên thực hiện kiểm kê các thiết bị theo danh sách được cung
cấp, đồng thời đối chiếu dữ liệu thực tế với thông tin đang lưu trên hệ thống
nhằm  xác  định  tính  chính  xác  của  tài sản. Sau đó, kỹ thuật viên tiến hành
đánh giá tỷ lệ khấu hao của từng thiết bị dựa trên tình trạng sử dụng thực tế.
Hệ  thống  tiếp  nhận  kết  quả  đánh  giá  và  kiểm  tra  điều  kiện  khấu  hao  của
thiết bị. Nếu tỷ lệ khấu hao nhỏ hơn mức quy định, hệ thống ghi nhận nhật
ký kiểm kê để lưu lại toàn bộ thông tin kiểm tra và đánh giá thiết bị.

-  Giai đoạn kết thúc

Trong trường hợp thiết bị có tỷ lệ khấu hao lớn hơn hoặc bằng 75%, hệ
thống tự động đề xuất thu hủy thiết bị nhằm hỗ trợ xử lý các tài sản không
còn đáp ứng yêu cầu sử dụng. Đồng thời, yêu cầu thu hủy thiết bị được tạo
và chuyển đến quản lý để xem xét xử lý theo quy định. Đối với các thiết bị
vẫn  còn  khả  năng  sử  dụng,  hệ  thống  lưu  kết  quả  kiểm  kê  nhằm  phục  vụ
công tác quản lý, theo dõi và tra cứu lịch sử tài sản về sau.

3.2.1.6. Sơ đồ luồng thông tin IFD đề xuất thu hủy

Sơ đồ 3.6 thể hiện sơ đồ luồng thông tin IFD mô tả quy trình yêu cầu thu
hủy tại Công ty Cổ phần công nghệ và giải pháp Mesoco. Quy trình được mô
tả theo ba giai đoạn: Bắt đầu, Trong quá trình và Kết thúc, đồng thời thể hiện
sự tương tác giữa ba tác nhân chính gồm Hệ thống, Quản lý và Kỹ thuật viên.


31

Sơ đồ 3.6: Sơ đồ luồng thông tin IFD đề xuất thu hủy

(Nguồn: Công ty Cổ phần công nghệ và giải pháp Mesoco)

-  Giai đoạn bắt đầu

     Hệ thống tạo yêu cầu thu hủy thiết bị ở trạng thái chờ duyệt khi phát
sinh các thiết bị không còn đáp ứng yêu cầu sử dụng hoặc có tỷ lệ khấu hao
cao.  Sau  đó,  yêu  cầu  được  chuyển  đến  quản  lý  để  xem  xét  và  phê duyệt.
Khi  yêu  cầu  được  chấp  nhận,  quản  lý thực hiện duyệt yêu cầu thu hủy và
chuyển lệnh xử lý cho kỹ thuật viên thực hiện thu hủy hoặc thanh lý thiết bị
theo quy định.

-  Giai đoạn trong quá trình xử lý

     Kỹ thuật viên tiếp nhận lệnh thu hủy và tiến hành thực hiện việc thu
hủy hoặc thanh lý thiết bị thực tế. Sau khi hoàn tất, kỹ thuật viên xác nhận
việc thu hủy hoặc thanh lý trên hệ thống nhằm đảm bảo thông tin xử lý tài
sản  được  cập  nhật chính xác. Hệ thống tiếp nhận kết quả xác nhận và tiến
hành  cập  nhật  trạng  thái  mới  của  thiết  bị  để  phản  ánh việc thiết bị không
còn được sử dụng trong doanh nghiệp.

-  Giai đoạn kết thúc

     Sau khi trạng thái thiết bị được cập nhật, hệ thống ghi nhận toàn bộ
thông tin liên quan đến quá trình thu hủy hoặc thanh lý thiết bị nhằm phục
vụ  công  tác  quản  lý  và  kiểm  tra  sau  này.  Đồng  thời,  lịch  sử  thu  hủy  của


32

thiết bị được lưu trữ trong cơ sở dữ liệu để hỗ trợ tra cứu, theo dõi vòng đời
tài sản và quản lý hồ sơ thiết bị trong hệ thống.

3.2.2. Sơ đồ ngữ cảnh CD

Sơ đồ 3.7: Sơ đồ ngữ cảnh CD

(Nguồn: Công ty Cổ phần công nghệ và giải pháp Mesoco)

Sơ đồ luồng dữ liệu tổng thể (Context Diagram – CD) mô tả mối quan
hệ trao đổi dữ liệu giữa Website quản lý tài sản thiết bị IT với các tác nhân
bên  ngoài  gồm  Nhân  viên,  Quản  lý,  Kỹ  thuật  viên  và  Nhà  cung  cấp.  Hệ
thống  đóng  vai  trò  trung  tâm  trong  việc  tiếp  nhận,  xử  lý,  lưu  trữ và phản
hồi  thông  tin  liên  quan  đến  toàn  bộ  vòng  đời  của  tài  sản thiết bị IT trong
doanh  nghiệp,  từ  khâu  đơn  hàng,  vận  hành,  sửa  chữa cho đến kiểm kê và
thu hủy tài sản.

-  Nhân viên

Nhân viên là đối tượng trực tiếp sử dụng các thiết bị và tài sản IT trong
doanh  nghiệp,  đồng  thời  tương  tác  với  phần  mềm  quản  lý  tài sản để thực
hiện các yêu cầu liên quan đến thiết bị. Thông qua hệ thống, nhân viên gửi
phiếu yêu cầu bàn giao hoặc thu hồi thiết bị khi phát sinh nhu cầu sử dụng
hoặc hoàn trả tài sản. Ngoài ra, khi thiết bị gặp sự cố, nhân viên có thể gửi
yêu cầu sửa chữa để được hỗ trợ xử lý. Sau khi tiếp nhận yêu cầu, hệ thống
sẽ  phản  hồi  trạng  thái  xử  lý,  kết  quả  phê  duyệt  hoặc  thông  tin  sửa  chữa
nhằm giúp nhân viên theo dõi tình trạng yêu cầu của mình. Việc quản lý tập
trung trên hệ thống giúp đảm bảo mọi hoạt động sử dụng tài sản đều được
lưu trữ và kiểm soát đầy đủ.

-  Quản lý


33

Quản  lý  là  tác  nhân  chịu  trách  nhiệm  giám  sát  và  điều  hành  toàn  bộ
hoạt động quản lý tài sản thiết bị IT trong doanh nghiệp. Quản lý tương tác
với  hệ  thống  để  thực  hiện  các nghiệp vụ như phê duyệt yêu cầu bàn giao,
sửa  chữa,  thu  hồi  hoặc  thu  hủy  thiết  bị  do  nhân  viên  gửi  lên.  Đồng  thời,
quản  lý  cũng  cập  nhật  thông  tin  danh  mục  thiết  bị  và  nhà  cung  cấp, thực
hiện  tạo  đơn  hàng  mới  khi  doanh  nghiệp  có  nhu  cầu  mua  sắm  tài  sản IT.
Ngoài ra, quản lý có thể gửi yêu cầu báo cáo hoặc thống kê để theo dõi tình
trạng sử dụng tài sản, tình trạng khấu hao và hiệu quả quản lý thiết bị trong
doanh nghiệp. Hệ thống sẽ gửi thông báo về các yêu cầu chờ duyệt, kết quả
cập  nhật  thông  tin  và  các  báo  cáo  tổng  hợp  nhằm  hỗ  trợ  quản  lý  đưa  ra
quyết định nhanh chóng và chính xác.

-  Kỹ thuật viên

Kỹ  thuật  viên  là  người  trực  tiếp  thực  hiện  các  công việc kỹ thuật liên
quan  đến  tài  sản  thiết  bị  IT.  Sau  khi  nhận  thông  tin  từ  hệ  thống, kỹ thuật
viên thực hiện kiểm kê thiết bị định kỳ nhằm đối chiếu dữ liệu tài sản thực
tế với dữ liệu lưu trữ trên hệ thống. Đồng thời, kỹ thuật viên tiến hành kiểm
tra,  bảo  trì hoặc sửa chữa các thiết bị gặp sự cố theo yêu cầu từ nhân viên
hoặc quản lý. Sau quá trình xử lý, kỹ thuật viên cập nhật tình trạng bảo trì,
sửa chữa và kết quả kiểm kê thực tế lên hệ thống để phục vụ việc theo dõi
vòng  đời tài sản. Ngoài ra, kỹ thuật viên cũng tiếp nhận danh sách thiết bị
cần bảo trì hoặc sửa chữa từ hệ thống để thực hiện công việc theo đúng kế
hoạch quản lý tài sản của doanh nghiệp.

-  Nhà cung cấp

Nhà  cung  cấp  là  đơn  vị  bên  ngoài  chịu  trách nhiệm cung cấp thiết bị,
linh  kiện hoặc các dịch vụ liên quan đến tài sản IT cho doanh nghiệp. Khi
có  nhu  cầu  mua  sắm  thiết  bị  mới,  hệ  thống  sẽ  gửi  mail  đặt  hàng đến nhà
cung  cấp  để  thực  hiện  cung  ứng  thiết  bị  theo  yêu  cầu.  Sau  khi  tiếp  nhận
thông  tin  đơn  hàng,  nhà  cung  cấp  phản  hồi  lại  tình  trạng  xử  lý,  thông tin
giao hàng hoặc kết quả cung cấp thiết bị thông qua email hoặc dữ liệu cập
nhật  về  hệ  thống.  Việc  trao  đổi  thông  tin  giữa  hệ  thống  và  nhà  cung  cấp
giúp  doanh  nghiệp  kiểm  soát  tốt quá trình đặt hàng, mua sắm, thay thế và
bổ sung thiết bị IT.

-  Phần mềm quản lý tài sản thiết bị IT

Phần  mềm  quản  lý  tài  sản  thiết  bị  IT  đóng  vai  trò  là  trung  tâm  xử  lý
toàn bộ dữ liệu và nghiệp vụ liên quan đến tài sản trong doanh nghiệp. Hệ
thống tiếp nhận các yêu cầu từ nhân viên, quản lý và kỹ thuật viên để xử lý
các hoạt động như bàn giao, thu hồi, sửa chữa, kiểm kê và thu hủy thiết bị.
Đồng  thời,  hệ  thống  hỗ  trợ  tạo  đơn  hàng  mua  sắm  thiết  bị  mới,  quản  lý


34

thông tin nhà cung cấp và theo dõi trạng thái xử lý đơn hàng. Ngoài ra, hệ
thống thực hiện lưu trữ thông tin tài sản, cập nhật trạng thái thiết bị, quản lý
lịch sử sử dụng và hỗ trợ tạo báo cáo thống kê phục vụ công tác quản lý tài
sản IT trong doanh nghiệp.

 3.2.3. Sơ đồ chức năng BFD

Sơ đồ 3.8: Sơ đồ chức năng BFD

(Nguồn: Công ty Cổ phần công nghệ và giải pháp Mesoco)

Hệ thống Quản lý tài sản thiết bị IT được xây dựng nhằm hỗ trợ doanh
nghiệp quản lý toàn bộ vòng đời của tài sản và thiết bị công nghệ thông tin
từ quá trình đặt đơn hàng, sử dụng, bảo trì cho đến kiểm kê và thu hủy. Hệ
thống  được  tổ  chức  thành  nhiều  phân  hệ  chức  năng  nhằm  đảm  bảo  việc
quản lý tài sản được thực hiện đồng bộ, chính xác và hiệu quả.

-  Quản lý danh mục và hồ sơ

Phân hệ quản lý danh mục và hồ sơ hỗ trợ quản lý các thông tin cơ bản
liên  quan  đến  tài  sản  thiết  bị  IT  trong  doanh  nghiệp.  Hệ  thống  cho  phép
quản  lý  hồ  sơ  người  sử  dụng  thiết  bị  nhằm  theo  dõi  thông  tin  nhân  viên
đang sử dụng tài sản. Đồng thời, phân hệ còn hỗ trợ quản lý danh mục thiết
bị, quản lý vị trí sử dụng hoặc lưu trữ tài sản và quản lý thông tin nhà cung
cấp. Việc quản lý tập trung các dữ liệu nền tảng giúp doanh nghiệp dễ dàng
tra cứu thông tin, đồng bộ dữ liệu và nâng cao hiệu quả quản lý tài sản.

-  Quản lý đơn hàng


35

Phân hệ quản lý đơn hàng hỗ trợ doanh nghiệp trong quá trình mua sắm
và  tiếp  nhận  thiết  bị  IT  mới.  Hệ  thống  cho  phép  quản  lý  hoạt  động  nhập
kho  thiết  bị  sau  khi  mua  sắm  và  theo  dõi  trạng  thái  đơn  hàng  trong  từng
giai đoạn xử lý. Thông qua phân hệ này, doanh nghiệp có thể kiểm soát tốt
quá trình đặt hàng, tiếp nhận thiết bị và cập nhật tình trạng mua sắm tài sản
nhằm đảm bảo thiết bị được cung cấp đúng yêu cầu và đúng thời gian.

-  Quản lý vận hành

Phân  hệ  quản  lý  vận  hành  hỗ  trợ  theo  dõi  quá  trình  sử  dụng  và  luân
chuyển  thiết  bị  trong doanh nghiệp. Hệ thống cho phép quản lý hoạt động
bàn giao thiết bị cho nhân viên sử dụng cũng như quản lý việc thu hồi thiết
bị  khi  không  còn  nhu cầu sử dụng hoặc khi nhân viên thay đổi vị trí công
tác. Phân hệ này giúp doanh nghiệp kiểm soát chính xác thiết bị đang được
sử  dụng  bởi  ai,  ở  đâu  và  trong  trạng  thái  nào  nhằm  hạn  chế thất thoát tài
sản.

-  Quản lý bảo trì

Phân  hệ  quản  lý  bảo  trì  hỗ  trợ  doanh  nghiệp  theo  dõi  tình  trạng  hoạt
động của thiết bị và thực hiện các hoạt động bảo trì, sửa chữa khi cần thiết.
Hệ  thống  cho  phép  quản  lý  sửa  chữa  thiết  bị,  quản  lý  bảo  trì  định  kỳ  và
theo  dõi  mức  độ  khấu  hao  của  tài  sản  trong  quá  trình  sử  dụng.  Nhờ  đó,
doanh nghiệp có thể kịp thời phát hiện các thiết bị gặp sự cố, lập kế hoạch
bảo trì phù hợp và kéo dài tuổi thọ sử dụng của thiết bị IT.

-  Quản lý kiểm kê và thu hủy

Phân  hệ  quản  lý  kiểm  kê  và  thu  hủy  hỗ  trợ  doanh  nghiệp  thực  hiện
kiểm kê tài sản định kỳ nhằm đối chiếu dữ liệu thực tế với thông tin lưu trữ
trên  hệ  thống.  Đồng  thời,  hệ  thống  cũng  hỗ  trợ  quản  lý  việc  thu  hủy  các
thiết bị đã hư hỏng nặng, lỗi thời hoặc không còn đáp ứng nhu cầu sử dụng.
Phân  hệ  này  giúp  đảm  bảo  tính  chính  xác  của  dữ  liệu  tài  sản  và  hỗ  trợ
doanh nghiệp quản lý hiệu quả vòng đời thiết bị IT.

-  Báo cáo và thống kê

Phân  hệ  báo  cáo  và  thống  kê  hỗ  trợ  tổng  hợp  và  phân tích dữ liệu tài
sản  nhằm  phục  vụ  công  tác  quản  lý  và  ra  quyết  định.  Hệ  thống  cung cấp
các báo cáo về tình hình sử dụng tài sản, báo cáo phân tích vòng đời thiết bị
và dự báo rủi ro trong quá trình sử dụng. Ngoài ra, hệ thống còn hỗ trợ tạo
báo cáo tổng hợp giúp nhà quản lý dễ dàng theo dõi tình trạng tài sản, đánh
giá hiệu quả sử dụng và xây dựng kế hoạch quản lý tài sản phù hợp với nhu
cầu của doanh nghiệp


36

 3.2.4. Sơ đồ luồng dữ liệu DFD

3.2.4.1. Sơ đồ luồng dữ liệu DFD mức 0

Sơ đồ 3.9: Sơ đồ luồng dữ liệu DFD - mức 0

(Nguồn: Công ty cổ phần công nghệ và giải pháp Mesoco)

-  Tiến trình 1.0 – Quản lý danh mục & hồ sơ

Tiến  trình  1.0  thực  hiện  chức  năng  quản  lý  danh  mục  và  hồ  sơ  tài  sản
trong  hệ  thống.  Tác  nhân  tham  gia  chính  trong  tiến  trình  này  là  Quản  lý.


37

Quản lý có nhiệm vụ gửi các yêu cầu cập nhật hồ sơ tài sản, cập nhật thông
tin  nhà  cung  cấp,  loại  tài  sản  và  danh  mục  vị  trí  sử  dụng  tài  sản  vào  hệ
thống.  Sau  khi  tiếp  nhận  yêu  cầu,  hệ  thống  sẽ xử lý và trả về kết quả cập
nhật hồ sơ cũng như kết quả cập nhật danh mục. Toàn bộ thông tin sau khi
xử  lý  sẽ  được  lưu  trữ  trong kho dữ liệu “Danh mục hồ sơ” nhằm phục vụ
cho việc tra cứu và quản lý tài sản về sau.

-  Tiến trình 2.0 – Quản lý đơn hàng

Tiến  trình  2.0  thực  hiện  chức  năng  quản  lý  đơn  hàng:  Quản  lý tạo đơn
hàng mua thiết bị mới và gửi lên hệ thống. Sau khi thiết bị được nhập kho,
hệ thống cập nhật trạng thái đơn hàng, lưu thông tin tài sản và thực hiện tạo
mã  QR  cho  từng  thiết  bị  nhằm  hỗ  trợ  quản  lý,  tra  cứu  và kiểm kê tài sản
nhanh chóng.

Tác  nhân  tham  gia  gồm  Quản  lý, kỹ thuật viên và hệ thống. Quản lý là
người  thực  hiện  tạo  và  theo  dõi  các đơn hàng mua sắm thiết bị IT trên hệ
thống  nhằm  đảm  bảo  quá  trình  mua  sắm  được  thực  hiện  đúng  nhu  cầu
doanh nghiệp. Sau khi thiết bị được tiếp nhận, kỹ thuật viên thực hiện nhập
kho và gắn mã QR cho từng thiết bị để hỗ trợ việc quản lý, kiểm kê và tra
cứu  thông  tin  tài  sản  dễ  dàng  hơn.  Hệ thống quản lý tài sản thiết bị IT có
nhiệm vụ tiếp nhận và xử lý thông tin đơn hàng, lưu trữ dữ liệu tài sản đồng
thời tự động tạo mã QR cho thiết bị nhằm phục vụ công tác quản lý tài sản
trong doanh nghiệp.

-  Tiến trình 3.0 – Quản lý vận hành

Tiến trình 3.0 thực hiện chức năng quản lý quá trình sử dụng và vận hành
tài sản trong hệ thống. Các tác nhân tham gia gồm Nhân viên, kỹ thuật viên
và quản lý.

●  Nhân viên gửi yêu cầu bàn giao/thu hồi thiết bị đến hệ thống và nhận

phản hồi về kết quả xử lý yêu cầu bàn giao/ thu hồi.

●  Kỹ  thuật  viên  thực  hiện  lệnh  bàn  giao  hoặc  thu  hồi  thiết  bị  và  cập

nhật trạng thái thiết bị trong quá trình sử dụng.

●  Quản  lý  có nhiệm vụ phê duyệt các yêu cầu vận hành hoặc sử dụng

tài sản trước khi tài sản được bàn giao cho nhân viên.

Sau  khi  xử lý, thông tin vận hành và trạng thái tài sản sẽ được cập nhật

vào kho dữ liệu “Tài sản” để theo dõi tình trạng sử dụng thiết bị.

-  Tiến trình 4.0 – Quản lý bảo trì

Tiến trình 4.0 thực hiện chức năng quản lý bảo trì và sửa chữa tài sản khi

phát sinh sự cố. Các tác nhân tham gia gồm Nhân viên và Kỹ thuật viên.


38

●  Nhân  viên  là  người  gửi  yêu  cầu  sửa  chữa  thiết  bị  đến  hệ  thống  và

nhân phản hồi về thông tin sửa chữa.

●  Kỹ  thuật  viên  tiếp  nhận  danh  sách  thiết  bị  cần  sửa  chữa,  thực  hiện

bảo trì và cập nhật trạng thái thiết bị sau khi xử lý.

Trong  quá  trình  bảo trì, kỹ thuật viên sẽ cập nhật trạng thái thiết bị, ghi
nhật  ký  sửa  chữa  và  nội  dung  bảo  trì  vào  hệ  thống.  Sau  khi  hoàn  tất,  hệ
thống  phản  hồi  thông  tin xử lý sự cố cho nhân viên. Tất cả dữ liệu bảo trì
đều  được lưu trong kho dữ liệu “Tài sản” nhằm phục vụ cho việc theo dõi
lịch sử sửa chữa thiết bị.

-  Tiến trình 5.0 Quản lý kiểm kê / thu hồi

Tiến trình 5.0 thực hiện chức năng kiểm kê, thu hồi và thanh lý tài sản

trong hệ thống. Các tác nhân tham gia gồm Kỹ thuật viên và Quản lý.

●  Kỹ thuật viên gửi đề xuất kiểm kê định kỳ, thực hiện kiểm kê thực tế

và cập nhật kết quả kiểm kê vào hệ thống.

●  Quản lý thực hiện xác nhận thu hồi tài sản và ban hành lệnh thu hồi

hoặc thanh lý tài sản khi cần thiết.

Sau khi xử lý, hệ thống cập nhật thông tin thu hồi tài sản vào kho dữ liệu
“Tài sản”. Tiến trình này giúp doanh nghiệp kiểm soát số lượng, tình trạng
và vòng đời sử dụng của tài sản một cách hiệu quả.

-  Tiến trình 6.0  Báo cáo & thống kê

Tiến trình 6.0 thực hiện chức năng tổng hợp dữ liệu và lập báo cáo thống
kê cho toàn bộ hệ thống quản lý tài sản. Tác nhân tham gia trong tiến trình
này là Quản lý.

Quản  lý gửi yêu cầu xem báo cáo và thống kê đến hệ thống để theo dõi
tình  hình  sử  dụng  tài  sản,  công  tác  bảo  trì, kiểm kê và thu hồi tài sản. Hệ
thống sẽ tổng hợp dữ liệu từ các tiến trình khác, tạo nội dung báo cáo thống
kê  và  lưu  vào  kho dữ liệu “Báo cáo”. Các báo cáo này hỗ trợ nhà quản lý
trong  việc  đánh  giá  hiệu  quả  quản lý tài sản và đưa ra các quyết định phù
hợp.

3.2.4.2. Sơ đồ luồng dữ liệu DFD - mức 1


39

a) Sơ đồ luồng dữ liệu mức 1: Quản lý danh mục

Sơ đồ 3.10: Sơ đồ luồng dữ liệu DFD - mức 1: Quản lý danh mục

(Nguồn: Công ty cổ phần công nghệ và giải pháp Mesoco)

Mô tả hoạt động

-  Quản lý hồ sơ (1.1)

Quản lý thực hiện thao tác thêm/cập nhật hồ sơ vào tiến trình Hồ sơ.
  Sau  khi  xử  lý,  hệ  thống trả về kết quả cập nhật hồ sơ cho Quản lý. Nhân
viên/kĩ thuật viên có thể gửi yêu cầu xem thông tin hồ sơ đến tiến trình Hồ
sơ.  Hệ  thống  phản  hồi  bằng  thông tin hồ sơ tương ứng. Dữ liệu hồ sơ sau
khi xử lý được lưu vào kho dữ liệu Danh mục/hồ sơ.

-  Quản lý danh mục (1.2)

Quản lý gửi yêu cầu cập nhật danh mục đến tiến trình Danh mục.

  Sau  khi  cập  nhật  thành công, hệ thống trả về danh sách danh mục đã cập
nhật cho Quản lý. Thông tin danh mục cũng được lưu vào kho dữ liệu Danh
mục/hồ sơ.

-   Quản lý vị trí (1.3)

Quản lý gửi yêu cầu cập nhật vị trí đến tiến trình Vị trí. Sau khi xử lý,
hệ  thống  phản  hồi  kết quả cập nhật vị trí cho Quản lý. Dữ liệu vị trí được
cập nhật và lưu trong kho dữ liệu Danh mục/hồ sơ.

-  Quản lý nhà cung cấp (1.4)


40

Quản  lý  thực hiện thêm/cập nhật thông tin nhà cung cấp vào tiến trình
Nhà cung cấp. Hệ thống trả lại thông tin nhà cung cấp sau khi xử lý. Thông
tin nhà cung cấp cũng được lưu vào kho dữ liệu Danh mục/hồ sơ.

b) Sơ đồ luồng dữ liệu mức 1: Quản lý Đơn hàng

Sơ đồ 3.11: Sơ đồ luồng dữ liệu DFD - mức 1: Quản lý đơn hàng

(Nguồn: Công ty cổ phần công nghệ và giải pháp Mesoco)

Mô tả hoạt động

-  Lập đơn đặt hàng( 2.1)

Hoạt động lập đơn đặt hàng được thực hiện khi doanh nghiệp phát sinh
nhu  cầu mua mới thiết bị IT. Quản lý tạo đơn đặt hàng trên hệ thống bằng
cách  nhập  thông  tin  thiết bị cần mua, số lượng và các thông tin liên quan.
Sau  khi  tiếp  nhận  dữ  liệu,  hệ  thống  thực  hiện  gửi  mail  đặt  hàng  đến  nhà


41

cung  cấp  để  xác  nhận  thông  tin  mua  sắm.  Nhà  cung  cấp  sau  đó  phản hồi
thông tin đơn hàng thông qua email và hệ thống cập nhật kết quả phản hồi
để quản lý theo dõi. Toàn bộ thông tin đơn hàng mới được lưu vào cơ sở dữ
liệu tài sản nhằm phục vụ quá trình nhập kho và quản lý thiết bị sau này.

-  Theo dõi nhận hàng( 2.2)

Hoạt động theo dõi nhận hàng hỗ trợ quản lý kiểm soát trạng thái xử lý
đơn hàng sau khi đã gửi yêu cầu mua sắm đến nhà cung cấp. Hệ thống tiếp
nhận phản hồi xác nhận từ nhà cung cấp về tình trạng giao hàng, thời gian
tiếp nhận hoặc các thay đổi liên quan đến đơn hàng. Dựa trên các phản hồi
này, hệ thống cập nhật thông tin đơn hàng và gửi kết quả cập nhật cho quản
lý nhằm hỗ trợ theo dõi tiến độ mua sắm thiết bị. Thông tin nhận hàng sau
đó được liên kết với dữ liệu tài sản để chuẩn bị cho quá trình nhập kho.

-  Nhập kho( 2.3)

Sau khi thiết bị được giao đầy đủ từ nhà cung cấp, hoạt động nhập kho
được  thực  hiện  nhằm  cập  nhật  thiết  bị  mới  vào  hệ  thống  quản  lý  tài  sản.
Quản  lý  hoặc  kỹ  thuật  viên  thực  hiện  thêm  mới  hoặc  cập  nhật  thông  tin
thiết bị trên hệ thống. Hệ thống tiếp nhận dữ liệu, lưu thông tin thiết bị vào
kho  tài  sản và cập nhật danh sách thiết bị mới. Đồng thời, hệ thống hỗ trợ
tạo và gắn mã QR cho từng thiết bị nhằm phục vụ công tác quản lý, tra cứu
và kiểm kê tài sản trong doanh nghiệp.

c) Sơ đồ luồng dữ liệu mức 1: Quản lý vận hành


42

Sơ đồ 3.12: Sơ đồ luồng dữ liệu DFD - mức 1: Quản lý vận hành

(Nguồn: Công ty cổ phần công nghê và giải pháp Mesoco)

Mô tả hoạt động

-  Tiếp nhận và phê duyệt yêu cầu (3.1)

Nhân  viên  gửi  phiếu  yêu  cầu  bàn giao đến tiến trình Tiếp nhận & phê
duyệt  yêu  cầu  để  đăng  ký  sử dụng thiết bị hoặc tài sản. Tiến trình chuyển
phiếu yêu cầu chờ duyệt cho Quản lý để xem xét và phê duyệt. Sau khi xử
lý,  Quản lý phản hồi kết quả phê duyệt cho hệ thống. Thông tin phiếu yêu
cầu được lưu vào kho dữ liệu Tài sản nhằm phục vụ quản lý và tra cứu sau
này.

-  Cập nhật trạng thái bàn giao (3.2)

Sau khi yêu cầu được duyệt, Quản lý gửi lệnh bàn giao thiết bị đến tiến

trình Cập nhật trạng thái bàn giao.

Tiến trình này thực hiện:

●  Cập nhật trạng thái thiết bị

●  Ghi nhận thông tin bàn giao


43

●  Lưu lịch sử sử dụng tài sản

Kĩ  thuật  viên  hỗ  trợ  bàn  giao  thiết  bị cho nhân viên và cập nhật trạng
thái khi cần bảo trì hoặc ngừng sử dụng. Sau khi hoàn tất, hệ thống gửi lại
kết  quả  bàn  giao  thiết bị cho Quản lý. Dữ liệu trạng thái thiết bị được cập
nhật vào kho dữ liệu Tài sản.

-  Theo dõi thu hồi (3.3)

Quản lý gửi lệnh thu hồi thiết bị đến tiến trình Theo dõi thu hồi khi cần

thu hồi tài sản từ người sử dụng. Kĩ thuật viên thực hiện:

●  Cập nhật trạng thái thiết bị

●  Theo dõi tình trạng thiết bị

●  Quản lý danh sách thiết bị thu hồi

Tiến  trình  trả  về  kết  quả thu hồi thiết bị cho Quản lý sau khi hoàn tất.
Thông tin thu hồi được cập nhật vào kho dữ liệu Tài sản nhằm đảm bảo dữ
liệu tài sản luôn chính xác và đồng bộ.

d) Sơ đồ luồng dữ liệu mức 1: Quản lý bảo trì

Sơ đồ 3.13: Sơ đồ luồng dữ liệu DFD - mức 1: Quản lý bảo trì

(Nguồn: Công ty cổ phần công nghê và giải pháp Mesoco)


44

Mô tả hoạt động

-  Tiếp nhận yêu cầu sửa chữa( 4.1)

Hoạt  động  tiếp  nhận  yêu  cầu  sửa  chữa  được  thực  hiện  khi  nhân  viên
phát sinh nhu cầu sửa chữa thiết bị IT đang sử dụng. Nhân viên gửi yêu cầu
sửa chữa cùng thông tin thiết bị lên hệ thống để được xử lý. Hệ thống tiếp
nhận  yêu  cầu,  lưu  thông  tin  sửa  chữa  và  gửi  thông  báo  yêu  cầu sửa chữa
đến  quản  lý  để  theo  dõi.  Sau  khi  quá  trình sửa chữa hoàn tất, kết quả sửa
chữa sẽ được cập nhật và phản hồi lại cho nhân viên nhằm đảm bảo người
dùng nắm được tình trạng thiết bị của mình.

-  Thực hiện sửa chữa( 4.2)

Sau khi tiếp nhận yêu cầu sửa chữa, quản lý tiến hành xem xét và phân
công  kỹ  thuật  viên  thực  hiện  xử  lý  thiết  bị.  Hệ  thống  cung  cấp  thông  tin
thiết  bị  cần  sửa  chữa  cho  kỹ  thuật viên để tiến hành kiểm tra và sửa chữa
thực tế. Trong quá trình xử lý, kỹ thuật viên cập nhật thông tin sửa chữa và
ghi nhận nhật ký sửa chữa lên hệ thống nhằm phục vụ công tác theo dõi và
quản lý lịch sử bảo trì thiết bị.

-  Lập lịch bảo trì định kỳ( 4.3)

Hoạt động lập lịch bảo trì định kỳ hỗ trợ doanh nghiệp theo dõi và bảo
trì  thiết  bị  theo  kế  hoạch  nhằm hạn chế sự cố phát sinh trong quá trình sử
dụng.  Hệ  thống  cung  cấp  danh  sách  các  thiết  bị  cần  bảo  trì  định  kỳ  cho
quản  lý  và  kỹ  thuật  viên.  Dựa  trên  thông  tin  này,  kỹ  thuật  viên  thực hiện
kiểm  tra  thiết  bị  theo  lịch  và  cập  nhật  danh  sách  bảo  trì  định  kỳ  lên  hệ
thống. Sau khi hoàn tất, kết quả bảo trì được gửi về cho quản lý để theo dõi
tình trạng hoạt động của thiết bị.

-  Sửa chữa và bảo trì hoàn tất( 4.4)

Sau  khi  quá  trình sửa chữa hoặc bảo trì được thực hiện xong, kỹ thuật
viên  cập  nhật  trạng  thái  sửa  chữa  và  trạng  thái  thiết  bị  lên  hệ  thống.  Hệ
thống ghi nhận thông tin hoàn tất sửa chữa, cập nhật dữ liệu tài sản và lưu
trữ  lịch  sử  bảo  trì  thiết  bị.  Đồng  thời,  hệ  thống  gửi  thông  báo  sửa  chữa
thành  công  đến  nhân  viên  để  xác  nhận  quá  trình  xử  lý  đã  hoàn  tất.  Nhân
viên sau đó thực hiện nghiệm thu thiết bị và tiếp tục sử dụng theo nhu cầu
công việc.

f) Sơ đồ luồng dữ liệu mức 1: Quản lý kiểm kê& thu hủy


45

Sơ đồ 3.14: Sơ đồ luồng dữ liệu DFD - mức 1: Quản lý kiểm kê & thu hủy

(Nguồn: Công ty cổ phần công nghê và giải pháp Mesoco)

Mô tả hoạt động

-  Lập kế hoạch kiểm kê( 5.1)

Hoạt  động  lập  kế  hoạch  kiểm kê được thực hiện nhằm xây dựng danh
sách thiết bị cần kiểm kê và xác định thời gian thực hiện kiểm kê tài sản IT
trong  doanh  nghiệp.  Quản  lý dựa trên thông tin báo cáo sự cố thiết bị, kết
quả sửa chữa và dữ liệu tài sản trên hệ thống để lập kế hoạch kiểm kê phù
hợp.  Sau  khi  kế  hoạch  được  tạo, hệ thống lưu thông tin và cung cấp danh
sách kiểm kê phục vụ cho quá trình kiểm tra thực tế thiết bị.

-  Kiểm kê và đánh giá tình trạng thiết bị( 5.2)

Dựa  trên  danh  sách  kiểm  kê  do  quản  lý  cung  cấp,  kỹ  thuật  viên  tiến
hành kiểm tra thực tế thiết bị và đối chiếu với dữ liệu tài sản trên hệ thống.
Quá trình kiểm kê bao gồm kiểm tra tình trạng hoạt động, mức độ hư hỏng,
khấu  hao  và  khả  năng  tiếp  tục  sử  dụng  của  thiết  bị.  Sau  khi  hoàn  tất,  kỹ
thuật viên cập nhật thông tin kiểm kê và kết quả đánh giá tình trạng thiết bị
lên hệ thống. Hệ thống ghi nhận kết quả kiểm kê, lưu dữ liệu tài sản và gửi
kết quả kiểm kê cho quản lý để theo dõi và xử lý tiếp theo.

-  Đề xuất thu hủy( 5.3)


46

Đối với các thiết bị hư hỏng nặng, lỗi thời hoặc không còn khả năng sử
dụng sau quá trình kiểm kê, hệ thống hỗ trợ tạo danh sách đề xuất thu hủy
thiết  bị  gửi  đến  quản  lý  xem  xét.  Quản  lý  kiểm  tra danh sách thiết bị cần
thu  hủy  và  thực  hiện  phê  duyệt  theo  quy  trình  quản  lý  tài  sản  của  doanh
nghiệp. Sau khi hoàn tất, kết quả thu hủy thiết bị được cập nhật lại trên hệ
thống nhằm phục vụ theo dõi vòng đời tài sản.

-  Thực hiện thu hủy thiết bị (5.4)

Tiến trình này tiếp nhận yêu cầu thu hủy đã được phê duyệt từ quản lý.
Kỹ  thuật  viên  thực  hiện  thu  hủy  thiết  bị  thực  tế  và cập nhật thông tin thu
hủy  lên  hệ  thống.  Hệ  thống sau đó ghi nhận trạng thái thiết bị đã thu hủy,
lưu  lịch  sử  xử  lý  tài  sản  và  phản  hồi  kết  quả thực hiện cho quản lý nhằm
phục vụ công tác quản lý vòng đời tài sản IT.

3.3. Thiết kế cơ sở dữ liệu

3.3.1. Sơ đồ quan hệ thực thể ERD

Sơ đồ 3.12: Sơ đồ quan hệ thực thể ERD


47

(Nguồn: Công ty cổ phần công nghệ và giải pháp Mesoco)

3.3.2. Các bảng dữ liệu

3.3.2.1. Bảng Roles (Vai trò)

      Bảng này dùng để định nghĩa các nhóm quyền hạn khác nhau trong hệ
thống  quản  lý  IT.  Trong  một  tổ  chức,  không  phải  ai  cũng  có  quyền  hạn
giống nhau đối với tài sản; bảng này giúp phân biệt rõ giữa người có quyền
phê duyệt mua sắm (Quản lý IT), người thực hiện sửa chữa (Kỹ thuật viên),
và người chỉ sử dụng thiết bị (Nhân viên). Việc tách riêng bảng vai trò giúp
hệ thống linh hoạt hơn trong việc kiểm soát truy cập và bảo mật dữ liệu tài
sản.

Bảng 3.1: Bảng Roles (Vai trò)

STT

Tên trường

Kiểu dữ liệu

Mô tả

1

2

RoleID

INT

Khóa chính, tự tăng (1,1).

RoleName

NVARCHAR(50)

Tên vai trò (Admin, Staff, ...), không
để trống.

(Nguồn: Công ty cổ phần công nghệ và giải pháp Mesoco)

Gồm những trường dữ liệu:

●  RoleID  (Mã vai trò): Khóa chính, thường là kiểu số nguyên tự tăng,

dùng để định danh duy nhất cho từng cấp bậc quyền hạn.

●  RoleName (Tên vai trò): Lưu tên gọi của nhóm quyền (ví dụ: Admin,
Technician,  Staff).  Tên  này  giúp  hệ  thống thực hiện kiểm tra quyền
(Authorization) trước khi người dùng thực hiện một thao tác như xóa
hoặc thanh lý thiết bị.

3.3.2.2. Bảng Users (Người dùng)

      Bảng Users dùng để quản lý hồ sơ chi tiết của toàn bộ nhân viên và kỹ
thuật viên có tương tác với hệ thống quản lý tài sản IT. Đây là cơ sở để xác
định  trách  nhiệm  cá  nhân:  ai  đang  giữ  thiết  bị  nào,  ai  là  người  phê duyệt
phiếu bảo trì, và ai đã thực hiện đợt kiểm kê gần nhất. Ngoài việc phục vụ


48

đăng nhập, bảng này còn là cầu nối để liên kết tài sản với chủ sở hữu cụ thể
trong đơn vị.

Bảng 3.2: Bảng Users (Người dùng)

STT

Tên trường

Kiểu dữ liệu

Mô tả

1

2

3

4

5

6

UserID

Int

Khóa chính, mã định danh ngườ
dùng.

Username

VARCHAR(50)

Tên đăng nhập, duy nhất, không đ
trống.

Password

VARCHAR(255)

Mật khẩu (đã mã hóa), không để
trống.

FullName

NVARCHAR(100)

Họ và tên đầy đủ.

Email

VARCHAR(100)

Địa chỉ email liên hệ.

RoleID

INT

Khóa ngoại tham chiếu đến bảng
Roles.

(Nguồn: Công ty cổ phần công nghệ và giải pháp Mesoco)

Gồm những trường dữ liệu:

●  UserID  (Mã  người  dùng):  Khóa  chính,  thường  là mã nhân viên của
công  ty  (ví  dụ:  NV001),  dùng  để  định  danh  duy  nhất  cho  mỗi  cá
nhân.

●  Username & Password: Thông tin tài khoản và mật khẩu (đã mã hóa)

để người dùng truy cập vào phần mềm quản lý.


49

●  FullName (Họ và tên): Tên đầy đủ của nhân viên để hiển thị trên các

biên bản bàn giao hoặc thu hồi thiết bị IT.

●  Email:  Địa  chỉ  email  công  vụ,  dùng  để  gửi  thông  báo  tự  động  khi

thiết bị sắp hết hạn bảo hành hoặc nhắc lịch kiểm kê.

●  RoleID  (Mã  vai  trò):  Khóa  ngoại  liên  kết  với  bảng  Roles.  Trường
này quyết định giao diện và chức năng mà người dùng đó được phép
thấy (ví dụ: Nhân viên chỉ thấy thiết bị mình đang giữ, còn IT Admin
sẽ thấy toàn bộ kho thiết bị của công ty).

3.3.2.3. Bảng Categories (Loại tài sản)

      Bảng này dùng để phân nhóm các thiết bị IT theo tính chất kỹ thuật và
mục  đích sử dụng. Trong môi trường IT, việc phân loại này rất quan trọng
để  áp  dụng  các  chính  sách  bảo  trì  và  bảo  mật  khác  nhau  (ví  dụ:  Nhóm
Server  cần  chế  độ  bảo  trì  24/7,  nhóm  Laptop  cần  chính  sách  bảo  mật  dữ
liệu  di  động).  Nó  giúp  quản  lý  danh  mục  thiết  bị  một  cách  hệ  thống,  từ
phần cứng (PC, Monitor) đến các thiết bị mạng (Router, Switch) và thiết bị
ngoại vi.

Bảng 3.3: Bảng Categories (Loại tài sản)

STT

Tên trường

Kiểu dữ liệu

Mô tả

1

CategoryID

int

Khóa chính, mã loại tài sản.

2

CategoryName

NVARCHAR(100)

Tên loại (Laptop, PC, Bàn ghế...).

3

Description

NVARCHAR(255)

Mô tả chi tiết về loại tài sản.

(Nguồn: Công ty cổ phần công nghệ và giải pháp Mesoco)

Gồm những trường dữ liệu:

●  CategoryID:  Khóa  chính  để  định  danh  nhóm  (ví  dụ:  LPT  - Laptop,

SVR - Server, NW - Network).

●  CategoryName: Tên gọi chi tiết của nhóm thiết bị.


50

●  Description:  Ghi  chú  về quy chuẩn kỹ thuật hoặc mục đích sử dụng
chung của nhóm (ví dụ: "Thiết bị cấp cho nhân viên làm việc từ xa").

3.3.2.4. Bảng Assets (Tài sản)

Đây  là  bảng  cốt  lõi  lưu  trữ  "lý  lịch"  chi  tiết  của  từng  thiết  bị  IT  cụ  thể.
Trong quản lý thiết bị IT, bảng này không chỉ lưu thông tin hành chính mà
còn  tập  trung  mạnh  vào  các  thông  số  kỹ  thuật và trạng thái vận hành. Nó
cho  phép  đội  ngũ  IT  theo  dõi  từ  cấu  hình  phần  cứng,  thời  hạn  bản
quyền/bảo hành cho đến giá trị khấu hao, giúp đưa ra quyết định nâng cấp
hoặc thay thế thiết bị một cách chính xác dựa trên hiệu suất và tuổi thọ.

Bảng 3.4: Bảng Assets (Tài sản)

STT

Tên trường

Kiểu dữ liệu

Mô tả

1

2

3

4

5

6

7

AssetID

int

Khóa chính, mã tài sản duy nhất.

AssetName

NVARCHAR(100)

Tên thiết bị/tài sản.

SerialNumber

VARCHAR(50)

Số Serial, duy nhất.

Model

NVARCHAR(100)

Đời máy/Model sản phẩm.

Configuration

NVARCHAR(255)

Thông tin cấu hình chi tiết.

Status

VARCHAR(20)

Trạng thái (Available, Assigned,
Repairing, Disposed).

PurchasePrice

DECIMAL(18,2)

Giá mua tài sản.


51

8

WarrantyExpiry

DATE

Ngày hết hạn bảo hành.

9

CurrentDepreciationRate

FLOAT

Tỷ lệ khấu hao hiện tại

(mặc định 0).

10

CategoryID

11

LocationID

int

int

Khóa ngoại tham chiếu bảng
Categories.

Khóa ngoại tham chiếu bảng
Locations.

Bảng bao gồm trường dữ liệu:

(Nguồn: Công ty cổ phần công nghệ Mesoco)

●  AssetID: Khóa chính.
●  AssetName: Tên định danh.
●  SerialNumber:  Mã  duy  nhất  từ  nhà  sản  xuất, cực kỳ quan trọng để tra

cứu lịch sử bảo hành và bản quyền phần mềm đi kèm.

●  Model: Đời máy cụ thể của thiết bị.
●  Configuration  (Cấu  hình  chi  tiết):  Lưu  thông  số  quan trọng như CPU,
RAM,  ổ  cứng  (SSD/HDD),  địa  chỉ  MAC  hoặc  các  đặc  tính  kỹ  thuật
khác.

●  Status:  Ghi  nhận  thiết  bị  đang:  Available  (Trong  kho),  Assigned  (Đã
bàn  giao  cho  nhân  viên),  Repairing  (Đang  sửa  chữa)  hoặc  Disposed
(Đã thu hủy).

●  PurchasePrice: Giá trị ban đầu của thiết bị.
●  WarrantyExpiry: Mốc thời gian để IT lên kế hoạch gia hạn bảo trì hoặc

thay mới để tránh rủi ro gián đoạn công việc.

●  CurrentDepreciationRate:  Phản  ánh  giá  trị  còn lại của thiết bị sau thời

gian sử dụng.

●  CategoryID  &  LocationID:  Liên  kết  để  biết  thiết  bị  thuộc  loại  nào và

đang nằm ở vị trí nào.

3.3.2.5. Bảng Locations (Vị trí)


52

Bảng này dùng để quản lý sự phân bổ vật lý của các thiết bị IT trong hạ tầng
của  doanh  nghiệp.  Thông  tin  này  giúp kỹ thuật viên IT nhanh chóng định vị
thiết bị khi có sự cố hoặc thực hiện bảo trì định kỳ/ kiểm kê tại chỗ.

Bảng 3.5: Bảng locations (Vị trí)

STT

Tên trường

Kiểu dữ liệu

Mô tả

1

LocationID

int

Khóa chính. Mã định danh duy

nhất cho vị trí.

2

LocationName

NVARCHAR(100)

Tên của vị trí (Ví dụ: Phòng họp

A, Kho trung tâm).

(Nguồn:Công ty cổ phần công nghệ Mesoco)

Các trường dữ liệu bao gồm:

●  LocationID:  Khóa  chính  định  danh  địa  điểm  (ví  dụ:  DC-01,

OFFICE-HANOI).

●  LocationName:  Tên  chi  tiết  nơi đặt thiết bị (ví dụ: Phòng Server Tầng

5, Kho dự phòng linh kiện).

3.3.2.6. Bảng Suppliers (Nhà cung cấp)

Bảng  này  dùng  để  quản  lý  danh  sách  các  đối  tác,  đại  lý hoặc nhà sản
xuất  cung  cấp  thiết  bị  và  dịch  vụ  IT  cho  doanh  nghiệp.  Việc  lưu  trữ  này
giúp  bộ  phận IT nhanh chóng tìm được đầu mối liên hệ khi có sự cố phần
cứng xảy ra.

Bảng 3.6: Bảng Suppliers (Nhà cung cấp)

STT

Tên trường

Kiểu dữ liệu

Mô tả

1

SupplierID

int

Khóa chính. Mã định danh duy nhất cho


53

 nhà cung cấp.

2

SupplierName

NVARCHAR(50)

Tên đầy đủ của đơn vị cung cấp.

3

Contact

VARCHAR(50)

Thông tin liên hệ (Số điện thoại/Người
đại diện).

4

Address

NVARCHAR(255)

Địa chỉ trụ sở của nhà cung cấp.

(Nguồn: Công ty cổ phần công nghệ Mesoco)

Gồm những trường dữ liệu:

●  SupplierID: Khóa chính dùng để định danh duy nhất từng đối tác.
●  SupplierName: Tên đầy đủ của công ty hoặc đại lý cung cấp.
●  Contact:  Số  điện  thoại  hoặc  tên  người  đại  diện  kinh  doanh/hỗ  trợ  kỹ

thuật.

●  Address: Địa chỉ văn phòng hoặc trung tâm bảo hành của nhà cung cấp

để gửi thiết bị khi cần sửa chữa.

3.3.2.7. Bảng PurchaseOrders (Đơn hàng)

Bảng  này dùng để quản lý các lệnh mua sắm thiết bị IT theo từng đợt.
Nó  đóng  vai  trò  là  chứng  từ gốc ghi nhận việc phê duyệt ngân sách và kế
hoạch  trang  bị  thiết  bị  mới.  Bảng  này  giúp  nhà  quản  lý  theo  dõi tổng chi
phí  mua  hàng  cho  hạ  tầng  IT  theo  thời  gian,  kiểm  soát  trạng thái của các
đơn  nhập  hàng  đang  về,  và xác định ai là người có thẩm quyền phê duyệt
các đơn đặt mua này.

Bảng 3.7: Bảng PurchaseOrders (Đơn hàng)

STT

Tên trường

Kiểu dữ liệu

Mô tả


54

1

OrderID

int

Khóa chính. Mã định danh duy nhất cho
đơn hàng.

2

OrderDate

DATETIME

Ngày lập đơn (Mặc định là thời gian
hiện tại).

3

TotalAmount

DECIMAL(18, 2)

Tổng giá trị của toàn bộ đơn hàng.

4

Status

NVARCHAR(50)

Trạng thái đơn hàng (Ví dụ: Chờ duyệt,
Đã giao).

5

SupplierID

int

Khóa ngoại. Liên kết tới bảng Nhà cung
cấp.

6

ApprovedBy

VARCHAR(20)

Khóa ngoại. Liên kết tới người dùng
phê duyệt đơn.

(Nguồn: Công ty cổ phần công nghệ Mesoco)

Gồm những trường dữ liệu gì:

●  OrderID: Khóa chính định danh cho mỗi lần nhập hàng.

●  OrderDate:  Thời  điểm  thực  hiện  lệnh  mua,  dùng  để  tính  toán  thời

gian chờ hàng (Lead time).

●  TotalAmount: Tổng giá trị của toàn bộ đơn hàng sau khi cộng tất cả

các thiết bị.

●  Status: Ghi nhận đơn hàng đang ở giai đoạn nào.

●  SupplierID: Khóa ngoại liên kết để biết đơn hàng này mua từ đơn vị

nào.


55

●  ApprovedBy: Khóa ngoại liên kết với bảng Users, xác định cấp quản

lý nào đã ký duyệt chi khoản tiền này.

3.3.2.8. Bảng OrderDetails (Chi tiết đơn mua)

Bảng  OderDetails  là  bảng  trung  gian  giữa  tài  sản  và  đơn  đặt  mua. Vì
một  đơn  hàng có thể bao gồm nhiều loại thiết bị IT khác nhau (ví dụ: một
đơn mua gồm 10 laptop, 5 màn hình), bảng này dùng để bóc tách chi tiết số
lượng và đơn giá của từng mặt hàng đó. Đây là cơ sở để đối soát khi hàng
về  kho  và  là  căn  cứ  để  hệ  thống  tự  động  khởi  tạo  các  bản  ghi  mới  trong
bảng tài sản (Assets) với các thông số giá mua tương ứng.

Bảng 3.8: Bảng OrderDetails (Chi tiết đơn mua)

STT

Tên trường

Kiểu dữ liệu

Mô tả

1  OrderDetailID

INT

Khóa chính. Tự động tăng (Identity 1,1).

2

OrderID

3

AssetID

int

int

Khóa ngoại. Liên kết tới bảng Đơn đặt
mua.

Khóa ngoại. Liên kết tới tài sản (Có thể
để trống).

4

DeviceName

NVARCHAR(200)

Tên thiết bị ghi trên đơn hàng.

5

6

7

Quantity

INT

Số lượng đặt mua.

UnitPrice

DECIMAL(18, 2)

Đơn giá cho mỗi đơn vị tài sản.

SubTotal

AS (Q*U)

Trường tính toán. Thành tiền = Số lượng
* Đơn giá.


56

(Nguồn: Công ty cổ phần công nghệ Mesoco)

Các trường gồm:

●  OrderDetailID:  Khóa  chính  tự  tăng  để  quản  lý  từng  dòng  trong  đơn

hàng.

●  OrderID:  Khóa  ngoại  liên  kết  với  bảng  PurchaseOrders  để  biết  dòng

này thuộc đơn hàng nào.

●  DeviceName:  Tên  gọi  chung  của  loại  thiết  bị  đang mua (ví dụ: Chuột

Logitech G102).

●  Quantity: Số lượng đơn vị thiết bị được đặt mua.
●  UnitPrice (Đơn giá): Giá tiền của một đơn vị thiết bị tại thời điểm mua.
●  SubTotal:  Trường  tính  toán  tự  động  (Quantity  *  UnitPrice)  để  ra tổng

tiền cho danh mục đó.

●  AssetID:  Khóa  ngoại  (có  thể  để  trống  lúc  mới  đặt  hàng)  dùng để liên
kết ngược lại bảng Assets sau khi thiết bị đã được nhập kho và dán mã
định danh.

3.3.2.9. Bảng Assignments (Phiếu bàn giao)

    Bảng  này  dùng  để  quản  lý  các  sự  kiện bàn giao thiết bị IT cho nhân
viên  sử  dụng.  Trong  quản  lý  IT,  đây  là  chứng  từ quan trọng xác lập trách
nhiệm  của  cá  nhân  đối  với  tài  sản  công  ty.  Nó  giúp  bộ  phận  IT  theo  dõi
được ai đang giữ những gì, bàn giao vào thời điểm nào và ai là người chịu
trách  nhiệm  phê  duyệt  việc  bàn  giao  đó.  Điều  này  cực  kỳ  quan  trọng  để
đảm bảo thiết bị được giao đúng người, đúng mục đích công việc.

Bảng 3.9: Bảng Assignments (Phiếu bàn giao)

STT

Tên trường

Kiểu dữ liệu

Mô tả

1

AssignmentID

int

Khóa chính. Mã định danh duy nhất ch
phiếu bàn giao.

2

StaffID

int

Khóa ngoại. Mã nhân viên nhận tài sản

bảng Users).


57

3

AdminID

int

Khóa ngoại. Mã người quản lý thực hiệ
bàn giao.

4

AssignDate

DATETIME

Ngày bàn giao (Mặc định lấy ngày hiệ
tại).

5

Note

NVARCHAR(255)

Ghi chú thêm về đợt bàn giao.

6

ApprovedBy

VARCHAR(20)

Khóa ngoại. Mã người phê duyệt lệnh b

giao này.

(Nguồn: Công ty cổ phần công nghệ Mesoco)

Bảng gồm các trường:

●  AssignmentID  (Mã  phiếu  giao):  Khóa  chính  dùng  để định danh

duy nhất đợt bàn giao.

●  StaffID  (Người  nhận):  Khóa  ngoại  liên  kết  với  bảng  Users, xác

định nhân viên được cấp thiết bị.

●  AdminID (Người thực hiện): Khóa ngoại liên kết với bảng Users,

xác định kỹ thuật viên IT trực tiếp bàn giao máy.

●  AssignDate (Ngày giao): Thời điểm thiết bị bắt đầu được chuyển

giao cho người dùng.

●  ApprovedBy:  Khóa  ngoại  xác  định  cấp  quản  lý  phê  duyệt  việc
cấp thiết bị (ví dụ: Trưởng phòng IT hoặc Giám đốc bộ phận).

3.3.2.10. Bảng AssignmentDetails (Chi tiết phiếu bàn giao)

Bảng trung gian của Tài sản và bàn giao, dùng để liệt kê cụ thể từng mã

tài sản trong phiếu đó. Đặc biệt, nó dùng để ghi lại hiện trạng vật lý của
thiết bị tại thời điểm giao, làm căn cứ đối chiếu khi nhân viên trả lại thiết bị
sau này.

Bảng 3.10: Bảng AssignmentDetails (Chi tiết phiếu bàn giao)


58

S
TT

Tên trường

Kiểu dữ liệu

Mô tả

1

AssignDetailID

INT

Khóa chính. Tự động tăng

(Identity 1,1).

2

AssignmentID

int

Khóa ngoại. Liên kết tới mã
phiếu bàn giao chính.

3

AssetID

int

Khóa ngoại. Mã tài sản cụ thể

được bàn giao.

(Nguồn: Công ty cổ phần công nghệ Mesoco)

Bảng gồm các trường:

●  AssignDetailID: Khóa chính tự tăng của bảng chi tiết.
●  AssignmentID: Khóa ngoại liên kết với phiếu bàn giao tổng.
●  AssetID: Khóa ngoại liên kết với bảng Assets, xác định chính xác

thiết bị cụ thể (thông qua số Serial/Mã định danh).

3.3.2.11. Bảng Thu hồi (Returns)

     Bảng này dùng để ghi nhận việc nhân viên hoàn trả thiết bị IT về cho bộ
phận quản lý (thường xảy ra khi nhân viên nghỉ việc, đổi máy mới hoặc thiết
bị bị hỏng cần thu hồi để sửa chữa). Bảng này giúp hệ thống cập nhật lại trạng
thái  thiết  bị  trong  kho,  chấm  dứt  trách  nhiệm  của  người  sử  dụng  đối với tài
sản đó và ghi lại lý do tại sao thiết bị được trả về để phục vụ báo cáo vòng đời
tài sản.

Bảng 3.11: Bảng Thu hồi (Returns)


59

STT

Tên trường

Kiểu dữ liệu

Mô tả

1

ReturnID

2

AssignmentID

3

StaffID

4

AdminID

int

int

int

int

Khóa chính. Mã định danh duy
nhất cho phiếu thu hồi.

Khóa ngoại. Liên kết ngược lại
mã phiếu bàn giao ban đầu.

Khóa ngoại. Mã nhân viên trả tài
sản.

Khóa ngoại. Mã người nhận lại
tài sản vào kho.

5

ReturnDate

DATETIME

Ngày thực hiện thu hồi (Mặc
định lấy ngày hiện tại).

6

Reason

NVARCHAR(255)

Lý do thu hồi (Ví dụ: Nghỉ việc,
Đổi thiết bị mới).

7

ApprovedBy

VARCHAR(20)

Khóa ngoại. Mã người phê duyệt
việc thu hồi.

(Nguồn: Công ty cổ phần công nghệ Mesoco)

Các trường dữ liệu bao gồm:

●  ReturnID  (Mã  phiếu  thu  hồi):  Khóa  chính  định  danh  cho  mỗi  lần  thu

nhận lại tài sản.


60

●  AssignmentID:  Khóa  ngoại  liên kết với phiếu bàn giao ban đầu để đối

chiếu luồng giao - nhận.

●  ReturnDate  (Ngày  thu  hồi):  Thời  điểm  thiết  bị  được  nhập  lại vào kho

IT.

●  Reason (Lý do): Diễn giải nguyên nhân thu hồi.
●  AdminID  &  ApprovedBy:  Xác  định  người  tiếp  nhận  và  người  phê

duyệt kết thúc đợt sử dụng tài sản này.

3.3.2.12. Bảng ReturnDetails (Chi tiết thu hồi)

    Bảng này dùng để kiểm kê tình trạng thực tế của từng linh kiện, thiết bị khi
được trả về. Trong lĩnh vực IT, việc này cực kỳ quan trọng để phát hiện sớm
các hư hại do lỗi người dùng hoặc hao mòn tự nhiên. Thông tin ở đây sẽ giúp
bộ phận IT quyết định xem thiết bị đó có thể tái bàn giao cho người khác ngay
hay phải chuyển sang quy trình sửa chữa/bảo trì.

Bảng 3.12: Bảng ReturnDetails (Chi tiết thu hồi)

STT

Tên trường

Kiểu dữ liệu

Mô tả

1

ReturnDetailID

INT

Khóa chính. Tự động tăng (Identit
1,1).

2

3

ReturnID

int

Khóa ngoại. Liên kết tới mã phiếu
thu hồi chính.

AssetID

int

Khóa ngoại. Mã tài sản được thu h

4

ConditionOnReturn

NVARCHAR(255)

Tình trạng tài sản lúc trả (Ví dụ:
Hỏng màn hình, trầy xước).

5

Note

NVARCHAR(255)

Các ghi chú đặc biệt khác nếu có

(Nguồn: Công ty cổ phần công nghệ Mesoco)


61

Gồm những trường dữ liệu gì:

●  ReturnDetailID: Khóa chính tự tăng.
●  ReturnID: Khóa ngoại liên kết với phiếu thu hồi tổng.
●  AssetID: Khóa ngoại liên kết với thiết bị được thu hồi.
●  ConditionOnReturn (Tình trạng khi nhận): Ghi nhận trạng thái thực tế
lúc trả (ví dụ: "Màn hình bị đốm trắng", "Bàn phím liệt phím Enter").
●  Note (Ghi chú): Các thông tin phát sinh khác trong quá trình kiểm tra

máy khi nhận lại.

3.3.2.13. Bảng Maintenance (Phiếu bảo trì)

Ghi nhận các đợt sửa chữa, bảo dưỡng định kỳ hoặc khắc phục sự cố phần
cứng/phần mềm. Bảng này giúp quản lý chi phí vận hành và theo dõi thời gian
thiết  bị  tạm  ngưng  hoạt  động  (downtime).  Thông  tin  này  rất  quan  trọng  để
đánh giá tổng chi phí sở hữu (TCO) của một thiết bị IT.

Bảng 3.13: Bảng Maintenance (Phiếu bảo trì)

STT

Tên trường

Kiểu dữ liệu

Mô tả

1

MaintenanceID

2

TechnicianID

int

int

Khóa chính. Mã định danh cho
đợt bảo trì.

Khóa ngoại. Kỹ thuật viên chịu
trách nhiệm sửa chữa.

3

4

5

StartDate

DATETIME

Ngày bắt đầu đưa đi bảo trì/sửa
chữa.

EndDate

DATETIME

Ngày hoàn thành bảo trì.

TotalCost

DECIMAL(18, 2)

Tổng chi phí của đợt bảo trì này.


62

6

ApprovedBy

VARCHAR(20)

Khóa ngoại. Người phê duyệt chi
phí/phiếu bảo trì.

(Nguồn: Công ty cổ phần công nghệ Mesoco)

Các trường dữ liệu bao gồm:

●  MaintenanceID: Khóa chính định danh đợt bảo trì.
●  TechnicianID: Khóa ngoại (Users) xác định kỹ thuật viên thực hiện.
●  StartDate: Ngày bắt đầu đưa thiết bị đi sửa chữa.
●  EndDate: Ngày hoàn thành và đưa thiết bị trở lại hoạt động.
●  TotalCost: Tổng chi phí sửa chữa, thay thế linh kiện.
●  ApprovedBy:  Khóa  ngoại  (Users)  xác  định  quản  lý  phê  duyệt  chi  phí

sửa chữa.

3.3.2.14. Bảng MaintenanceDetails (Chi tiết bảo trì)

Lưu trữ chi tiết các lỗi cụ thể và hành động khắc phục cho từng thiết bị
trong  một  đợt  bảo  trì  lớn. Nó giúp bộ phận IT biết chính xác bộ phận nào
của  thiết  bị  hay  hỏng  (ví  dụ:  Thay  pin  cho  Laptop  A,  thay  bàn  phím  cho
Laptop B).

Bảng 3.14: Bảng MaintenanceDetails (Chi tiết bảo trì)

STT

Tên trường

Kiểu dữ liệu

Mô tả

1

MaintDetailID

INT

Khóa chính. Tự động tăng
(Identity 1,1).

2

MaintenanceID

3

AssetID

int

int

Khóa ngoại. Liên kết tới phiếu
bảo trì tổng.

Khóa ngoại. Mã tài sản được
sửa chữa.


63

4

5

Issue

NVARCHAR(255)

Mô tả lỗi hoặc vấn đề cần xử lý.

Action

NVARCHAR(255)

Cách thức đã xử lý (Ví dụ: Thay
pin, cài lại Win).

6

Cost

DECIMAL(18, 2)

Chi phí sửa chữa riêng cho tài sả
này.

(Nguồn: Công ty cổ phần công nghệ Mesoco)

Các trường dữ liệu bao gồm:

●  MaintDetailID: Khóa chính tự tăng.
●  MaintenanceID: Khóa ngoại liên kết với bảng bảo trì.
●  AssetID: Khóa ngoại (Assets) xác định thiết bị được sửa.
●  Issue: Mô tả lỗi (ví dụ: "Ổ cứng bị bad sector", "Máy quá nóng").
●  Action: Mô tả hành động xử lý (ví dụ: "Thay ổ cứng SSD 256GB", "Vệ

sinh và tra keo tản nhiệt").

●  Cost: Chi phí sửa chữa cho thiết bị này.

3.3.2.15. Bảng Disposals (Phiếu thu hủy)

Quản lý việc loại bỏ các thiết bị IT đã hết vòng đời sử dụng, lỗi thời hoặc hư
hỏng  không  thể  phục  hồi.  Bảng  này  ghi  nhận  tổng  giá  trị  thanh  lý  thu  hồi
được hoặc các chứng từ liên quan đến việc tiêu hủy rác thải điện tử an toàn.

Bảng 3.15: Bảng Disposals (Phiếu thu hủy)

STT

Tên trường

Kiểu dữ liệu

Mô tả

1

DisposalID

int

Khóa chính. Mã định danh duy nh
cho phiếu thanh lý.


64

2

AdminID

int

Khóa ngoại. Người lập phiếu than
lý (từ bảng Users).

3

DisposalDate

DATETIME

Ngày thực hiện thanh lý (Mặc địn
là ngày hiện tại).

4

TotalValue

DECIMAL(18, 2)

Tổng giá trị thu hồi được từ việc
thanh lý (nếu có).

5

Notes

NVARCHAR(255)

Ghi chú lý do hoặc phương thức
thanh lý.

6

ApprovedBy

VARCHAR(20)

Khóa ngoại. Người có thẩm quyề
phê duyệt việc thanh lý.

(Nguồn: Công ty cổ phần công nghệ Mesoco)

Các trường dữ liệu bao gồm:

DisposalID: Khóa chính định danh đợt thanh lý.
AdminID: Khóa ngoại (Users) người thực hiện thủ tục loại biên.
DisposalDate: Ngày chính thức thanh lý/tiêu hủy.
TotalValue: Số tiền thu về từ việc bán thanh lý thiết bị cũ.
Notes: Ghi chú về phương thức tiêu hủy.
ApprovedBy: Người phê duyệt quyết định loại bỏ tài sản khỏi hệ thống.

3.3.2.16. Bảng DisposalDetails (Chi tiết thu hủy)

Liệt kê danh sách chính xác các mã thiết bị (AssetID) nằm trong diện thanh lý
lần này để hệ thống cập nhật trạng thái cuối cùng và ngưng tính khấu hao cho
các thiết bị đó.

Bảng 3.16: Bảng DisposalDetails (Chi tiết thu hủy)


65

STT

Tên trường

Kiểu dữ liệu

Mô tả

1

DisposalDetailID

INT

Khóa chính. Tự động tăng (Ident

1,1).

2

DisposalID

int

Khóa ngoại. Liên kết tới phiếu
thanh lý chính.

3

AssetID

int

Khóa ngoại. Mã tài sản bị thanh

(Nguồn: Công ty cổ phần công nghệ Mesoco)

Các trường dữ liệu bao gồm:

●  DisposalDetailID: Khóa chính tự tăng.
●  DisposalID: Khóa ngoại liên kết với phiếu thanh lý tổng.
●  AssetID: Khóa ngoại (Assets) xác định thiết bị cụ thể bị loại bỏ.

3.3.2.17. Bảng Kiểm kê (Inventory)

   Bảng này lưu trữ thông tin kiểm kê tài sản

Bảng 3.17: Bảng Kiểm kê (Inventory)

STT

Tên trường

Kiểu dữ liệu

Mô tả

1

2

CheckID

int

Khóa chính. Mã định danh cho đ

kiểm kê.

StartDate

DATETIME

Ngày bắt đầu thực hiện kiểm kê


66

3

TechnicianID

int

Khóa ngoại. Người chịu trách
nhiệm chính đợt kiểm kê.

4

ApprovedBy

VARCHAR(20)

Khóa ngoại. Người phê duyệt kế
quả kiểm kê.

(Nguồn: Công ty cổ phần công nghệ Mesoco)

Các trường dữ liệu bao gồm:

●  CheckID: Khóa chính định danh đợt kiểm kê.
●  StartDate: Ngày thực hiện đợt kiểm kê.
●  TechnicianID: Khóa ngoại (Users) xác định người thực hiện kiểm kê.
●  ApprovedBy: Khóa ngoại (Users) xác định người phê duyệt kết quả sau

cùng.

3.3.2.18. Bảng InventoryDetails (Chi tiết kiểm kê)

Ghi  nhận  hiện  trạng  thực  tế của từng thiết bị tại thời điểm kiểm tra so
với dữ liệu trên hệ thống. Đây là cơ sở để phát hiện các trường hợp thiết bị
IT  bị  thất  lạc,  mất  mát  hoặc  hỏng  hóc  mà  chưa  được  báo  cáo  từ  người
dùng.

Bảng 3.18: Bảng InventoryDetails (Chi tiết kiểm kê)

STT

Tên trường

Kiểu dữ liệu

Mô tả

1

InvDetailID

INT

Khóa chính. Tự động tăng
(Identity 1,1).

2

CheckID

int

Khóa ngoại. Liên kết tới đợt
kiểm kê tương ứng.


67

3

AssetID

int

Khóa ngoại. Mã tài sản được
kiểm tra.

4

StatusInReality

NVARCHAR(100)

Tình trạng thực tế

5

Note

NVARCHAR(255)

Ghi chú chi tiết về sai lệch hoặ
hiện trạng tài sản.

(Nguồn: Công ty cổ phần công nghệ Mesoco)

Các trường dữ liệu bao gồm:

●  InvDetailID: Khóa chính tự tăng.
●  CheckID: Khóa ngoại liên kết với đợt kiểm kê.
●  AssetID: Khóa ngoại (Assets) xác định thiết bị đang được kiểm tra.
●  StatusInReality: Tình trạng thực tế.
●  Note: Các quan sát đặc biệt (ví dụ: "Nhân viên tự ý thay đổi linh kiện",

"Mất sạc đi kèm").

3.3.3. Thiết kế giao diện

3.3.3.1. Giao diện trang giới thiệu

Giao diện hiển thị trang giới thiệu của Văn phòng Luật sư Quốc tế Bình
An.  Ở  phần  đầu trang là thanh điều hướng với logo “Binh An Law” có chức
năng trở lại trang chính khi được bấm vào cùng các nút Log in và Register để
người dùng đăng nhập hoặc tạo tài khoản.

Hình 3.1: Giao diện giới thiệu

(Nguồn:)

3.3.3.2. Giao diện đăng ký


68

Hình 3.2: Giao diện đăng ký

(Nguồn:)

Hình 3.3: Giao diện xác thực đăng ký

(Nguồn: Công)

Người dùng khi muốn đăng ký sẽ phải nhập địa chỉ email và sau đó bấm vào
“Send Verification Code” để tiến hành xác thực danh tính. Sau đó người dùng
sẽ  tiến  hành  chọn  tên  đăng  nhập  (Username)  và  mật  khẩu  (Password)  cùng
việc  nhập  mã  xác  thực  (Verification  Code).  Nếu  trùng  thông  tin  đăng  nhập
hoặc mã xác thực sai, hệ thống sễ cảnh báo và yêu cầu thay đổi thông tin đăng
nhập và mã xác thực cho phù hợp.

3.3.3.3. Giao diện trang dashboard

Hình 3.4: Giao diện dashboard

(Nguồn: Công ty Luật TNHH Quốc tế Bình An)

Hình 3.5: Giao diện dashboard

(Nguồn: Công ty Luật TNHH Quốc tế Bình An)

Màn hình Dashboard cung cấp cái nhìn tổng quan về hoạt động của hệ thống,
giúp người dùng nhanh chóng nắm bắt tình trạng xử lý hồ sơ pháp lý. Tại đây,
người  dùng  có  thể  thấy  tổng  số  vụ  án,  tổng số danh mục và tổng số chủ thể
(Persons) đã được tạo trong hệ thống. Phía dưới là biểu đồ thống kê số lượng
vụ án theo từng tháng trong 12 tháng gần nhất, hỗ trợ quản trị viên và luật sư
theo dõi xu hướng xử lý vụ việc, khối lượng công việc theo thời gian và đánh
giá mức độ tăng trưởng hồ sơ.

Ở phần tiếp theo của Dashboard, hệ thống hiển thị biểu đồ phân loại các chủ
thể theo vai trò (nguyên đơn, bị đơn, luật sư), giúp người dùng dễ dàng quan
sát cơ cấu thành phần tham gia trong các vụ việc. Bên cạnh đó, mục "Recent


69

Activity"  ghi  nhận  và  hiển  thị các hoạt động cập nhật hồ sơ gần nhất, hỗ trợ
theo  dõi  tiến  độ  xử  lý  theo  thời  gian  thực.  Cuối  cùng,  biểu  đồ  “Cases  by
Category”  thống  kê  số  lượng  vụ  án  theo từng nhóm danh mục pháp lý, giúp
người dùng nhanh chóng đánh giá lĩnh vực nào phát sinh nhiều hồ sơ nhất để
có kế hoạch phân bổ nguồn lực phù hợp.

3.3.3.4. Giao diện tổng hợp các vụ án

Hình 3.6: Giao diện tổng hợp các vụ án

(Nguồn: Công ty Luật TNHH Quốc tế Bình An)

Màn hình Cases cung cấp danh sách toàn bộ hồ sơ vụ việc đang được quản lý
trong  hệ  thống. Người dùng có thể sử dụng thanh tìm kiếm để tra cứu nhanh
theo tên vụ án hoặc tên tòa án; đồng thời lọc hồ sơ theo danh mục pháp lý và
theo  trạng  thái  xử  lý.  Mỗi  thẻ  vụ  án  hiển  thị  ngắn  gọn  thông  tin quan trọng
như  loại  vụ  việc,  tòa  án thụ lý và trạng thái hiện tại, giúp luật sư và quản trị
viên dễ dàng nhận diện và theo dõi tiến độ.Ngoài việc duyệt danh sách, người
dùng có thể chọn View Details để xem chi tiết hồ sơ, tài liệu và các thông tin
liên  quan.  Nút  Add New Case hỗ trợ tạo mới vụ việc khi cần cập nhật hồ sơ
vào hệ thống. Giao diện được thiết kế trực quan, chia bố cục rõ ràng để người
dùng nhanh chóng thao tác và quản lý số lượng lớn vụ án một cách hiệu quả.

3.3.3.5. Giao diện chi tiết của vụ án


70

Trang  Case  Details  hiển  thị  toàn  bộ  thông  tin  chi  tiết  của  một  vụ  án,  giúp
người  dùng  theo  dõi  tiến  độ  và  nội  dung  xử  lý một cách đầy đủ. Phần Case
Information trình bày các dữ liệu chính như tòa án thụ lý, địa điểm, danh mục
pháp  lý  và  mô  tả  tình  huống  vụ  việc.  Bên  cạnh  đó, khối Metadata ghi nhận
thời điểm tạo và cập nhật hồ sơ, hỗ trợ kiểm soát thay đổi và theo dõi lịch sử
làm việc.

Bên  dưới, mục Associated Persons cho phép người dùng xem danh sách luật
sư hoặc các bên liên quan trong vụ án, đồng thời có thể quản lý danh sách này
khi  cần.  Khu  vực  Case  Files  hiển  thị  các  tài  liệu  đi  kèm  hồ  sơ  và cung cấp
chức năng Upload File để tải lên tài liệu mới. Nhờ bố cục rõ ràng và thao tác
trực  quan,  người  dùng  có  thể  dễ  dàng  theo  dõi,  cập  nhật và quản lý toàn bộ
thông tin của một vụ án ngay tại một màn hình duy nhất.

Hình 3.7: Giao diện chi tiết của vụ án

(Nguồn: Công ty Luật TNHH Quốc tế Bình An)

Khi  người  dùng  chọn  một  tài  liệu  trong  Case  Files,  hệ  thống  sẽ  mở  cửa  sổ
xem  trước  (Preview)  như  hình  trên.  Tại  đây,  tài  liệu  PDF được hiển thị trực
tiếp  trên  giao  diện,  cho  phép  người  dùng  xem  nội  dung  mà  không  cần  tải
xuống.  Thanh  công  cụ  phía  trên  hỗ  trợ  các  thao  tác  như  phóng  to,  thu  nhỏ,
chuyển trang, tìm kiếm trong tài liệu và theo dõi tổng số trang, giúp việc đọc
và  tra cứu trở nên thuận tiện hơn.Cửa sổ preview hoạt động độc lập với màn
hình  chính,  vì  vậy  người  dùng  có thể đóng lại bất cứ lúc nào để quay về chi
tiết  vụ  án.  Tính  năng  này  hỗ  trợ  luật  sư và quản trị viên xem nhanh tài liệu,
kiểm tra nội dung và đối chiếu thông tin một cách hiệu quả, đặc biệt khi xử lý
nhiều tập hồ sơ trong cùng một phiên làm việc.

Hình 3.8: Giao diện chi tiết tài liệu vụ án

(Nguồn: Công ty Luật TNHH Quốc tế Bình An)

3.3.3.6. Giao diện phân loại vụ án

Hình 3.9: Giao diện phân loại vụ án


71

(Nguồn: Công ty Luật TNHH Quốc tế Bình An)

Màn  hình  Categories  hiển  thị  danh  sách  các  danh  mục pháp lý mà hệ thống
đang quản lý, giúp người dùng dễ dàng phân loại và tìm kiếm hồ sơ theo từng
lĩnh vực. Mỗi danh mục được trình bày dưới dạng thẻ (card) kèm mô tả ngắn
gọn nội dung, hỗ trợ người dùng nhận biết nhanh đặc điểm của từng nhóm vụ
việc.  Thanh  tìm  kiếm  phía  trên  cho  phép  lọc  danh  mục  theo tên để truy cập
nhanh hơn khi số lượng danh mục nhiều.

Người dùng có thể nhấn View Details để xem thông tin chi tiết hoặc cập nhật
danh mục. Với quyền quản trị viên, nút Add New Category hỗ trợ thêm danh
mục mới khi công ty phát sinh lĩnh vực pháp lý mới. Giao diện được thiết kế
trực quan nhằm đảm bảo việc quản lý danh mục diễn ra thuận tiện, nhất quán
và phù hợp với cấu trúc hồ sơ pháp lý trong hệ thống.

3.3.3.7. Giao diện nguyên đơn/bị đơn

Màn  hình  Persons  hiển  thị  danh  sách  toàn bộ các cá nhân liên quan đến các
vụ  án,  bao  gồm  nguyên  đơn, bị đơn và các chủ thể khác. Người dùng có thể
sử  dụng  thanh  tìm  kiếm  để  tra  cứu  theo  tên  hoặc  lọc  theo  vai trò thông qua
menu  All  Roles,  giúp  nhanh  chóng  xác  định  đối  tượng  cần  quản  lý.  Mỗi  cá
nhân được hiển thị dưới dạng thẻ, bao gồm tên và vai trò pháp lý để dễ dàng
phân biệt.

Khi cần xem hoặc chỉnh sửa thông tin chi tiết của một cá nhân, người dùng có
thể  chọn  View  Details.  Với  quyền  quản  trị,  nút  Add  New  Person  cho  phép
thêm  mới  chủ  thể vào hệ thống khi phát sinh vụ việc mới. Giao diện rõ ràng
và  trực  quan  giúp  người  dùng  quản  lý  danh  sách  người  tham  gia  một  cách
thuận tiện, đảm bảo dữ liệu phục vụ cho từng hồ sơ vụ án luôn được cập nhật
đầy đủ.

Hình 3.10: Giao diện nguyên đơn/bị đơn

(Nguồn: Công ty Luật TNHH Quốc tế Bình An)

3.3.3.8. Giao diện luật sư

Hình 3.11: Giao diện luật sư


72

(Nguồn: Công ty Luật TNHH Quốc tế Bình An)

Màn  hình  Lawyers  hiển  thị  danh  sách  các  luật  sư đang làm việc tại công ty,
giúp  người  dùng  dễ  dàng  tìm  kiếm  và  theo  dõi  thông  tin  liên  hệ  của  từng
người.  Thanh  tìm  kiếm  hỗ  trợ  lọc  theo  tên  luật  sư,  trong  khi  mỗi  thẻ  (card)
hiển  thị  tên  và  email  để  nhận  diện  nhanh.  Với  quyền  quản trị viên, nút Add
New Lawyer cho phép thêm luật sư mới vào hệ thống, phục vụ quản lý nhân
sự và phân công công việc. Người dùng có thể chọn View Details để xem chi
tiết hồ sơ và các vụ án mà luật sư đang phụ trách.

Hình 3.12: Giao diện thông tin luật sư

(Nguồn: Công ty Luật TNHH Quốc tế Bình An)

Trang  Lawyer  Details  cung  cấp  thông  tin  đầy  đủ  về  một  luật  sư,  bao  gồm
danh sách vụ án đang được phân công (Assigned Cases) cùng quyền truy cập
nhanh từng hồ sơ qua nút View Case. Người dùng có thể gửi câu hỏi trực tiếp
đến luật sư (Ask a Question), đặt lịch tư vấn (Book Appointment), hoặc phân
công  thêm  vụ  án  mới  (Assign  to  Case).  Biểu  đồ  Case Category Distribution
bên  dưới  hiển  thị  cơ  cấu  vụ  án theo lĩnh vực pháp lý mà luật sư đang xử lý,
giúp  đánh  giá  chuyên  môn  và  khối  lượng  công  việc  của  họ  một  cách  trực
quan.

Hình 3.13: Giao diện câu hỏi cho luật sư

(Nguồn: Công ty Luật TNHH Quốc tế Bình An)

Cửa sổ Ask a Question cho phép người dùng gửi câu hỏi trực tiếp đến luật sư
mình chọn để được tư vấn nhanh chóng. Phần To Lawyer hiển thị tên luật sư
phụ trách, được chọn tự động từ trang trước hoặc người dùng có thể thay đổi
nếu muốn. Bên dưới, người dùng nhập nội dung câu hỏi vào ô Your Question
với đầy đủ thông tin cần được hỗ trợ.

Sau khi hoàn tất, nhấn Send Question để gửi câu hỏi đến hệ thống; luật sư sẽ
nhận  được  thông  báo  và  phản  hồi  khi  xử  lý  xong.  Nếu  muốn  quay  lại  mà
không gửi, người dùng có thể chọn Cancel. Giao diện được thiết kế đơn giản,
rõ ràng giúp quá trình đặt câu hỏi diễn ra thuận tiện và nhanh chóng.


73

Hình 3.14: Giao diện đặt lịch tư vấn

(Nguồn: Công ty Luật TNHH Quốc tế Bình An)

Ở tab Lawyers, người dùng có thể xem thông tin về các luật sư đang công tác
tại  công  ty.  Và  ở  màn  hình  chi  tiết  thông  tin  của  luật  sư, người dùng có thể
thấy những vụ án mà luật sư đó tham gia để đánh giá mực độ phù hợp của luật
sư  đó  đối  với  vấn  đề  của  bản  thân.  Từ  đó,  người  dùng  có  thể sử dụng chức
năng  Hỏi  “Ask a Question”, khi đó câu hỏi của người dùng sẽ được gửi trực
tiếp tới người luật sư đó và chỉ người luật sư đó mới có quyền trả lời câu hỏi
đó. Và khi cần đặt lịch gặp trực tiếp, người dùng có thể sử dụng tính năng Đặt
lịch  “Book  Appointment”  và  chờ  luật  sư  “Đồng  ý”  hoặc  “Từ  chối”  buổi  tư
vấn riêng đó.

Bên dưới, ô Notes cho phép người dùng bổ sung ghi chú hoặc mô tả ngắn về
nội dung cần tư vấn. Khi hoàn tất, người dùng nhấn Book Appointment để gửi
yêu  cầu  đặt  lịch;  luật  sư  sẽ  nhận  được  thông  báo  và  quyết  định  chấp  nhận
hoặc  từ  chối  cuộc  hẹn.  Nếu  không  muốn  tiếp  tục,  người  dùng  có  thể  nhấn
Cancel  để  quay  lại.  Giao  diện  được  thiết  kế  rõ  ràng  nhằm  hỗ  trợ  đặt  lịch
nhanh chóng và thuận tiện.

3.3.3.9. Giao diện câu hỏi

Hình 3.15: Giao diện tình trạng câu hỏi từ phía người dùng

(Nguồn: Công ty Luật TNHH Quốc tế Bình An)

Hình 3.16: Giao diện thông báo câu hỏi

(Nguồn: Công ty Luật TNHH Quốc tế Bình An)

Hình 3.17: Giao diện trả lời câu hỏi của luật sư

(Nguồn: Công ty Luật TNHH Quốc tế Bình An)


74

Hình 3.18: Giao diện thông báo câu trả lời

(Nguồn: Công ty Luật TNHH Quốc tế Bình An)

Màn hình My Questions hiển thị danh sách các câu hỏi mà người dùng đã gửi
cho luật sư. Mỗi câu hỏi được hiển thị kèm nội dung tóm tắt, tên luật sư nhận
câu  hỏi  và  thời  gian  gửi,  giúp  người dùng dễ dàng theo dõi. Nhãn trạng thái
như  Pending  cho  biết  câu  hỏi  đang chờ luật sư phản hồi. Người dùng có thể
nhấn  vào  từng  câu  hỏi  để  xem  chi  tiết  hoặc  kiểm  tra  câu  trả  lời  khi  có  cập
nhật.

Ngoài ra, nút Ask a New Question cho phép người dùng gửi thêm câu hỏi mới
bất cứ lúc nào. Giao diện được bố trí đơn giản, tập trung vào việc theo dõi tiến
trình  xử  lý  câu  hỏi, giúp người dùng quản lý các yêu cầu tư vấn pháp lý của
mình một cách rõ ràng và thuận tiện.

3.3.3.10. Giao diện đặt lịch

Hình 3.19: Giao diện đặt lịch

(Nguồn: Công ty Luật TNHH Quốc tế Bình An)

Màn  hình  My  Appointments hiển thị toàn bộ các lịch hẹn mà người dùng đã
đặt  với  luật  sư.  Mỗi  lịch  được  thể  hiện  dưới  dạng thẻ với thông tin gồm tên
luật  sư,  ngày  và  giờ  hẹn,  cùng  trạng  thái  như  Pending  để  cho  biết cuộc hẹn
đang  chờ  luật  sư  xác  nhận.  Giao  diện  giúp  người  dùng  dễ  dàng  theo  dõi và
quản lý danh sách lịch hẹn của mình theo thời gian.

Nút  Book  Appointment  ở  góc  phải  cho  phép  người  dùng  đặt  thêm  lịch  hẹn
mới khi cần. Khi chọn vào một lịch hẹn, người dùng có thể xem thông tin chi
tiết  hoặc  kiểm  tra  trạng  thái  cập  nhật.  Việc  trình  bày  đơn  giản  và  trực  quan
giúp quá trình theo dõi, kiểm soát và đặt lịch tư vấn pháp lý diễn ra thuận tiện
và rõ ràng.


75

Hình 3.20: Giao diện chi tiết lịch hẹn của luật sư

(Nguồn: Công ty Luật TNHH Quốc tế Bình An)

Màn  hình  Appointment  Request  dành  cho  luật  sư  hiển  thị  toàn  bộ  thông tin
của  một  cuộc  hẹn  do  khách  hàng  gửi  lên. Luật sư có thể xem tên người yêu
cầu,  thời  gian  đề  xuất  và  ghi  chú  mà  khách  hàng  cung  cấp,  giúp  đánh  giá
nhanh nội dung buổi tư vấn. Đây là bước quan trọng trước khi xác nhận hoặc
từ chối lịch hẹn.

Ở cuối màn hình, luật sư có hai lựa chọn: Accept để chấp nhận buổi hẹn hoặc
Reject nếu không thể tiếp nhận. Khi luật sư đưa ra quyết định, hệ thống sẽ cập
nhật  trạng  thái  cuộc  hẹn  và  thông  báo  lại  cho  khách  hàng.  Giao  diện  được
thiết  kế  đơn  giản,  rõ  ràng  để  giúp  luật  sư  xử  lý  các  yêu  cầu  đặt  lịch  nhanh
chóng và hiệu quả.

3.3.4. Kiểm thử, triển khai và bảo trì ứng dụng web

3.3.4.1. Kiểm thử hệ thống

Công  đoạn  kiểm  thử  được  xem  là  một  bước  quan  trọng  trong  toàn  bộ  quy
trình  phát  triển  phần  mềm,  nhằm  đánh  giá tính đúng đắn, đầy đủ và ổn định
của hệ thống trước khi đưa vào vận hành chính thức tại Công ty Luật TNHH
Quốc tế Bình An.

Việc  kiểm  thử  không  chỉ  nhằm  phát  hiện  và  khắc  phục các lỗi lập trình, mà
còn  giúp  xác  minh  xem  phần  mềm  có  thực  sự  đáp  ứng  được  các  yêu  cầu
nghiệp vụ đã được phân tích, đặc biệt là trong công tác quản lý hồ sơ vụ việc,
lịch hẹn và trao đổi với khách hàng.

Quá trình kiểm thử được tiến hành theo các cấp độ sau:

- Kiểm thử đơn vị (Unit Testing): được các lập trình viên thực hiện trong giai
đoạn phát triển, kiểm tra riêng từng hàm hoặc module (ví dụ: chức năng đăng


76

nhập,  thêm  hồ  sơ, đặt lịch hẹn) để đảm bảo tính đúng đắn của từng phần mã
nguồn.

-  Kiểm  thử  tích  hợp  (Integration  Testing):  nhằm  xác  định  sự  tương  tác giữa
các module trong hệ thống. Ví dụ: khi người dùng cập nhật thông tin hồ sơ ở
giao diện React, dữ liệu cần được đồng bộ và lưu trữ chính xác trong cơ sở dữ
liệu MySQL thông qua API của Spring Boot.

- Kiểm thử hệ thống (System Testing): được thực hiện sau khi các module đã
tích  hợp  hoàn  chỉnh,  nhằm  đánh  giá  tổng  thể  toàn  bộ  website dưới các khía
cạnh như tốc độ phản hồi, bảo mật thông tin, khả năng tương thích với nhiều
thiết bị và trình duyệt khác nhau.

-  Kiểm  thử  chấp  nhận  người  dùng  (User  Acceptance  Testing  -  UAT):  giai
đoạn  cuối cùng, do chính nhân viên và luật sư tại Công ty Bình An tham gia
trải  nghiệm thực tế. Mục tiêu của giai đoạn này là xác định xem hệ thống có
thân thiện, dễ thao tác và phù hợp với nghiệp vụ pháp lý tại đơn vị hay không.

Tất cả kết quả kiểm thử được ghi nhận trong báo cáo lỗi và nhật ký kiểm thử,
giúp đội phát triển đánh giá và khắc phục toàn diện trước khi chính thức triển
khai.

3.3.4.2. Kế hoạch triển khai hệ thống

Việc  triển  khai  hệ  thống  đánh  dấu  giai  đoạn  chuyển  đổi  từ  môi  trường  phát
triển sang môi trường vận hành thực tế tại Công ty Luật Bình An. Đây là giai
đoạn quan trọng, đòi hỏi sự chuẩn bị kỹ lưỡng về hạ tầng kỹ thuật, dữ liệu và
nhân sự vận hành.

Kế hoạch triển khai được tiến hành theo các bước cụ thể:

- Chuẩn bị môi trường triển khai

Thiết  lập  máy  chủ chạy ứng dụng (Application Server) và máy chủ cơ sở dữ
liệu  (Database  Server),  cài  đặt  và  cấu  hình  môi  trường  Java,  MySQL,  cùng
với việc tích hợp chứng chỉ SSL để bảo mật kênh truyền dữ liệu.

- Cài đặt và cấu hình hệ thống

Đưa mã nguồn lên máy chủ, cài đặt các gói phụ thuộc (dependencies) và cấu
hình kết nối giữa backend Spring Boot và frontend React. Đồng thời thiết lập
domain, tường lửa và các chính sách an toàn mạng.


77

- Khởi tạo dữ liệu ban đầu

Nhập  các thông tin nền tảng như danh mục lĩnh vực pháp lý (dân sự, thương
mại,  lao  động,...),  danh  sách  người  dùng,  tài  khoản  quản  trị  và nhóm quyền
(Admin, Luật sư, Nhân viên).

- Chạy thử và tinh chỉnh

Hệ  thống  được  triển  khai  thử  nghiệm  trong  phạm  vi  nội  bộ,  trước  tiên  tại
phòng quản lý hồ sơ. Sau khi thu thập phản hồi từ người dùng thật, nhóm kỹ
thuật sẽ điều chỉnh hiệu năng, bố cục giao diện và xử lý các lỗi phát sinh.

Hình  thức  triển  khai được lựa chọn là triển khai theo từng giai đoạn (Phased
Deployment).  Ở  giai  đoạn  đầu,  hệ  thống  chỉ áp dụng thử với một nhóm nhỏ
người  dùng nội bộ. Khi hệ thống hoạt động ổn định và phản hồi tích cực, việc
triển  khai  mới được mở rộng cho toàn bộ nhân viên trong công ty. Cách tiếp
cận này giúp giảm rủi ro, tránh gián đoạn quy trình làm việc và đảm bảo việc
chuyển đổi sang nền tảng số hóa diễn ra thuận lợi.

3.3.4.3. Hướng dẫn sử dụng hệ thống cho người dùng

Để đảm bảo hệ thống được vận hành hiệu quả, việc đào tạo và hướng dẫn sử
dụng  cho  người  dùng  là  yếu  tố  bắt  buộc.  Website  được  thiết  kế  với  nhiều
nhóm  người  dùng  khác  nhau  nên tài liệu hướng dẫn sẽ được biên soạn riêng
biệt:

- Hướng dẫn dành cho Luật sư: mô tả chi tiết quy trình tra cứu hồ sơ, cập nhật
tiến độ xử lý vụ việc, ghi chú thông tin khách hàng và lên lịch tư vấn.

- Hướng dẫn dành cho Nhân viên quản trị: trình bày cách thức tạo tài khoản,
gán quyền, quản lý dữ liệu và giám sát hoạt động trong hệ thống.

Các  tài  liệu  được  trình  bày  rõ  ràng,  có  hình  ảnh  minh  họa  và ví dụ thao tác
thực tế, giúp người dùng dễ dàng làm quen dù không có nền tảng kỹ thuật.

Ngoài ra, công ty có thể tổ chức buổi tập huấn nội bộ hoặc đào tạo trực tuyến
qua  Zoom,  giúp  nhân  viên trải nghiệm thao tác trực tiếp, đồng thời ghi nhận
phản hồi để tối ưu giao diện và quy trình vận hành.

Việc  đầu  tư  cho  công  tác  hướng  dẫn  sử  dụng  không  chỉ  giúp  tiết  kiệm  thời
gian  làm  quen  hệ  thống,  mà  còn  góp  phần  nâng  cao hiệu suất làm việc, hạn
chế sai sót khi nhập liệu và tăng khả năng chấp nhận công nghệ trong toàn tổ
chức.


78

3.3.4.4. Chính sách bảo trì và nâng cấp hệ thống

Sau khi hệ thống chính thức đưa vào hoạt động, công tác bảo trì, cập nhật và
nâng cấp cần được duy trì thường xuyên nhằm đảm bảo phần mềm hoạt động
ổn định, bảo mật và phù hợp với sự thay đổi trong nghiệp vụ pháp lý.

Chính sách bảo trì được chia thành ba nhóm chính:

- Bảo trì khắc phục (Corrective Maintenance)

Tiếp nhận phản hồi và khắc phục lỗi kỹ thuật, sự cố hệ thống.

Thiết lập kênh hỗ trợ người dùng qua biểu mẫu hoặc email nội bộ để báo cáo
lỗi.

Cam  kết  thời  gian  xử  lý  nhanh  đối  với  các  lỗi  nghiêm trọng ảnh hưởng đến
việc truy cập hoặc lưu trữ hồ sơ.

- Bảo trì thích ứng (Adaptive Maintenance)

Điều  chỉnh  hệ  thống  để  tương  thích  với  các  bản  cập  nhật  của  trình  duyệt,
framework hoặc máy chủ.

Bổ  sung  cấu  hình  bảo  mật  mới,  thay  đổi  thông số khi hạ tầng công ty có sự
mở rộng hoặc chuyển đổi sang nền tảng điện toán đám mây.

- Bảo trì nâng cấp và hoàn thiện (Perfective Maintenance)

Thu  thập  ý  kiến  cải  tiến  từ  người  dùng  thực  tế  để  mở  rộng  chức  năng  như
thống kê số lượng vụ việc, lưu trữ hồ sơ điện tử, chatbot hỗ trợ pháp lý, hoặc
tích hợp API gửi email tự động.

Nâng  cao  giao  diện  người  dùng  theo  hướng  trực  quan,  dễ  thao tác và tương
thích tốt trên các thiết bị di động.

Cập nhật các phiên bản mới định kỳ 6-12 tháng/lần, giúp hệ thống luôn được
cải tiến và đáp ứng nhu cầu phát triển lâu dài của Công ty Luật Bình An.

Chính  sách  bảo  trì  toàn  diện không chỉ đảm bảo hệ thống hoạt động liên tục
và an toàn, mà còn thể hiện tầm nhìn phát triển bền vững trong việc ứng dụng
công nghệ vào quản lý hồ sơ pháp lý của công ty.

3.4. Kiểm thử


79

3.4.1. Kế hoạch kiểm thử

Bảng 3.12: Kế hoạch kiểm thử

Tên kế hoạch

Kiểm thử hệ thống quản lý hồ sơ pháp lý và tương tác
khách hàng tại Công ty Luật TNHH Quốc tế Bình An

Mô tả kế hoạch

Kiểm thử website theo phương pháp hộp đen (Black-box
Testing), tập trung vào kiểm tra chức năng, quy trình
nghiệp vụ và tính ổn định của hệ thống.

Loại dự án  Website quản lý hồ sơ pháp lý

Thời gian kế
hoạch

Ngày bắt
đầu

(Nguồn: Tác giả, 2026)

3.4.2. Mục tiêu kiểm thử

05/11/2025  Ngày kết thúc  09/11/2025

Quá trình kiểm thử được thực hiện nhằm đảm bảo các chức năng chính của hệ
thống  vận  hành  đúng  yêu  cầu  và  phù hợp với nghiệp vụ pháp lý tại Công ty
Bình An. Các nhóm chức năng trọng tâm được kiểm tra bao gồm:

-  -Kiểm  thử  chức  năng  quản  lý  hồ sơ vụ án: tạo mới vụ án, chỉnh sửa thông
tin, phân loại theo lĩnh vực pháp lý, cập nhật trạng thái xử lý.

 Kiểm thử chức năng quản lý người dùng và vai trò: thêm luật sư, gán hồ sơ,
cập nhật thông tin cá nhân của nguyên đơn/bị đơn.

-  Kiểm  thử  chức  năng  xử  lý  tệp  tin:  tải  lên  tài  liệu  chứng  cứ,  xem  trước
(preview) file PDF, xóa tệp và kiểm tra tính toàn vẹn dữ liệu.

- Kiểm thử chức năng lịch hẹn: tạo yêu cầu đặt lịch, luật sư xác nhận hoặc từ
chối lịch hẹn.

- Kiểm thử chức năng trao đổi thông tin: gửi câu hỏi đến luật sư, luật sư phản
hồi, hiển thị lịch sử trao đổi.

- Kiểm thử giao diện và điều hướng: kiểm tra liên kết, menu chức năng, hiệu
năng tải dữ liệu và sự tương thích trên nhiều trình duyệt.

3.4.3. Kịch bản kiểm thử


80

Bảng 3.13: Kịch bản kiểm thử

Mã
kịch
bản

Tên  kịc
bản  kiểm
thử

Điều
kiệ
thực hiện

L01  Đăng  nhậ

hệ thống

diệ
nhậ

Giao
đăng
đã mở

L02  Thêm  mớ
hồ sơ vụ án

Đăng  nhậ
với  vai  tr
luật  sư  hoặ
quản trị

L03  Cập

thông
hồ sơ

nhậ
ti

ít  nhấ
Có
một  hồ  s
hợp lệ

L04  Tải  lên  tệ

tài liệu

Đã  chọn  h
sơ cụ thể

Mô tả

Dữ liệu mẫu

Kết quả mon
đợi

Người  dùn
tà
nhập
khoản hợp l
để  truy  cậ
hệ thống

Tạo mới mộ
vụ  án  và  lư
vào hệ thốn

s
Luật
chỉnh
sử
mô  tả  hoặ
trạng  thái  v
án

Người  dùn
lên  fil
tải
PDF  chứn
cứ

khoản

-  Tài
dang
- Mật khẩu: 122

Đăng
nhậ
thành  công  v
chuyển
đế
Dashboard

-  Tên  vụ  án:  V
đánh  bạc  qu
mạng
-  Danh  mục
Hình sự

-  Trạng
Đang xử lý

thá

Hệ
thốn
thông  báo  tạ
thành  công  v
hiển  thị  hồ  s
tron
mới
danh sách

Hệ  thống  lư
thay đổi và cậ
nhật  đúng  và
hồ sơ

-
File
danh_bac_online
.pdf

File  hiển
trong
sách,
trước được

th
dan
xem

L05  Xem  trướ

tài liệu

Hồ  sơ có tệ
đính kèm

-
File
Người  dùn
danh_bac_online
mở  preview
.pdf
file PDF

Tệp hiển thị r
qu
thông
xem
khung
trước

L06  Thêm  mớ
s
nhân
(luật sư)

Đăng  nhậ
tà
bằng
khoản admi

Tạo mới mộ
luật  sư  tron
hệ thống

-  Tên:  Nguyễ
Văn A
-
Emai
a.lawyer@firm.v
n-

Hệ
thốn
bá
thông
thành  công  v
hiển  thị  tron
sác
danh
Lawyers


81

Mã
kịch
bản

Tên  kịc
bản  kiểm
thử

Điều
kiệ
thực hiện

Mô tả

Dữ liệu mẫu

Kết quả mon
đợi

Hệ  thống  tạ
yêu  cầu
lịc
hẹn,  trạng  thá
“Pending”

Trạng  thái  lịc
hẹn  được  cậ
nhật đúng

Hệ  thống  gử
công
thành
hiển  thị  trạn
thái  chờ  phả
hồi

L07  Đặt

lịc
hẹn với luậ
sư

Người  dùn
đã
đăn
nhập

Khách  hàn
chọn  ngày
giờ  và  đặ
lịch hẹn

Ngày

-
12/11/2025
- Giờ: 10:00

L08  Luật  sư xá
nhận
lịc
hẹn

Luật sư đăn
nhập  và  c
yêu cầu mớ

Luật sư chấ
nhận hoặc t
chối lịch

-  Trạng  thái mớ
Accepted

L09  Gửi câu hỏ

tư vấn

Người  dùn
đăn
đã
nhập

Nhập
nộ
dung câu hỏ
và  gửi  đế
luật sư

-  Nội  dung:  “Tô
bị  lừa  đảo  onlin
cần  xử
th
nào?”

lý

(Nguồn: Tác giả, 2025)

3.4.4. Báo cáo kiểm thử

Bảng 3.14: Báo cáo kiểm thử

Thành công  9

Đã kiểm thử

Thất bại

Tổng số

0

9

Đang chờ

0

Đang kiểm thử  0

Bị chặn

0

Tổng kiểm thử  9


82

(Nguồn: Tác giả, 2025)

3.5. Cài đặt và triển khai

3.5.1. Mô hình hệ thống

Hình 3.21: Mô hình hệ thống

(Nguồn: Tác giả, 2026)

Mô tả chi tiết mô hình

- Tầng Front-end (Presentation Tier - Lớp giao diện)

Chức năng:  Đây  là  lớp  trực  tiếp  tương  tác với người dùng như luật sư, nhân
viên  và khách hàng nội bộ. Tầng giao diện chịu trách nhiệm hiển thị toàn bộ
thông  tin,  tiếp  nhận  thao  tác (tạo hồ sơ vụ án, gửi câu hỏi, đặt lịch hẹn, xem
tài liệu…) và gửi yêu cầu đến backend dưới dạng HTTP Request. Dữ liệu trả
về thường ở dạng JSON và được xử lý để cập nhật UI theo thời gian thực.

Công nghệ:  Hệ  thống sử dụng ReactJS, phù hợp cho xây dựng các ứng dụng
web có tính tương tác cao. React hỗ trợ cơ chế cập nhật linh hoạt, giúp người


83

dùng  thao  tác  nhanh  với  số  lượng  lớn  dữ  liệu  như  danh  sách  vụ  án,  tài  liệu
pháp lý, thông tin câu hỏi - phản hồi.

- Tầng Backend (Application Tier - Lớp ứng dụng)

Chức năng: Đây là “bộ não” xử lý toàn bộ hoạt động nghiệp vụ của hệ thống.
Backend  tiếp  nhận  yêu  cầu  từ  frontend,  kiểm  tra,  xử  lý  logic  pháp  lý  (phân
công  luật  sư,  phân  loại hồ sơ, cập nhật trạng thái vụ án…), truy xuất dữ liệu
và trả kết quả về giao diện.

Công nghệ: Hệ thống sử dụng Spring Boot, một framework mạnh mẽ phù hợp
với  các  ứng  dụng  yêu cầu tính bảo mật cao, khả năng xử lý ổn định và phân
lớp  rõ  ràng.  Spring  Boot  hỗ  trợ  tốt  cho  xây  dựng  API,  quản  lý  người dùng,
xác thực - phân quyền và tích hợp với các dịch vụ bổ sung.

Các thành phần chính:

Controller: Nhận request từ giao diện (tạo hồ sơ, đặt lịch…), kiểm tra tính hợp
lệ và chuyển tiếp đến service.

Service: Chứa logic nghiệp vụ chính như xử lý tài liệu, phân công luật sư, cập
nhật tiến độ vụ án.

Repository:  Tương  tác  với  cơ sở dữ liệu MySQL để lưu trữ - truy vấn thông
tin hồ sơ.

Entity:  Đại  diện  cho  các  bảng  dữ  liệu  như  Cases,  Persons,  Lawyers,
Appointments hoặc Documents.

- Dịch vụ bên thứ ba (Third-party Services)

Hệ thống có thể tích hợp một số dịch vụ hỗ trợ:

Email SMTP: gửi thông báo lịch hẹn, thông báo phản hồi câu hỏi từ luật sư.

Cloud Storage (S3 / Firebase): lưu trữ tài liệu pháp lý dung lượng lớn và đảm
bảo an toàn.

- Tầng dữ liệu (Data Tier)

Chức năng: Lưu trữ toàn bộ thông tin hồ sơ vụ án, tài liệu đính kèm, thông tin
người tham gia, lịch hẹn, câu hỏi và các thay đổi trong hệ thống.


84

Công nghệ: Hệ thống sử dụng MySQL, phù hợp cho dữ liệu dạng quan hệ, dễ
mở rộng và tối ưu khi truy vấn số lượng lớn hồ sơ pháp lý.

3.5.2. Cách hoạt động của hệ thống

- Người dùng thao tác trên giao diện

Luật sư xem danh sách hồ sơ, tài liệu

Nhân viên tạo vụ án mới, cập nhật thông tin

Khách hàng gửi câu hỏi hoặc đặt lịch hẹn

Frontend gửi yêu cầu đến Backend

Các thao tác được gửi đi dưới dạng các HTTP Request như GET (lấy dữ liệu),
POST (tạo mới), PUT (cập nhật), DELETE (xóa).

Backend xử lý yêu cầu

Controller tiếp nhận và kiểm tra dữ liệu

Service thực hiện logic nghiệp vụ

Repository truy xuất hoặc cập nhật dữ liệu trong MySQL

Gọi dịch vụ ngoài nếu cần (Email, lưu trữ tài liệu…)

Backend trả kết quả lại cho Frontend

Kết quả được gửi trả về dạng JSON.

- Frontend cập nhật giao diện

Người dùng sẽ thấy thay đổi theo thời gian thực (ví dụ: hồ sơ mới xuất hiện,
lịch hẹn chuyển sang trạng thái “Đã xác nhận”…).

3.5.3. Yêu cầu về cài đặt phần cứng

Hệ  thống  được  triển  khai  trên  nền  tảng  cloud  hosting  để  đảm  bảo  khả  năng
truy cập từ xa, hỗ trợ nhiều người dùng và đảm bảo tính bảo mật.


85

Cấu hình máy chủ đề xuất:

- CPU: 2 nhân xử lý

- RAM: 4GB

- Lưu trữ: 150-250GB SSD

- Bảo mật: SSL, chống DDoS, tường lửa web ứng dụng

Cấu hình này đáp ứng tốt cho số lượng hồ sơ pháp lý trung bình, đồng thời hỗ
trợ tải lên tài liệu dung lượng lớn mà không ảnh hưởng đến hiệu năng.

Ngoài ra, nhóm phát triển sử dụng các máy tính cấu hình trung bình (RAM ≥
8GB) để lập trình, kiểm thử và vận hành thử nghiệm.

3.5.4. Đào tạo, hướng dẫn người dùng sử dụng

3.5.4.1. Mục tiêu đào tạo

Giúp nhân viên và luật sư nắm rõ quy trình sử dụng hệ thống quản lý hồ sơ.

Đảm  bảo  người  dùng  hiểu  chức  năng  xem  -  cập  nhật  hồ  sơ,  tải  lên  tài  liệu,
phản hồi câu hỏi và xử lý lịch hẹn.

Đảm  bảo  hệ  thống  được  vận hành chính xác, hạn chế sai sót trong nhập liệu
và quản lý.

3.5.4.2. Phương pháp đào tạo

- Đối với quản trị viên và luật sư

+ Hướng dẫn trực tiếp kết hợp thực hành:

Nhân viên kỹ thuật hướng dẫn chi tiết thao tác như tạo vụ án, phân công luật
sư, xử lý tệp tài liệu.

+ Buổi demo hệ thống:

Cho phép người dùng trải nghiệm các tình huống giả lập như tiếp nhận khách
hàng, cập nhật tiến độ hoặc xem tài liệu.

+ Hỗ trợ sau đào tạo:


86

Cung  cấp  tài  liệu  PDF,  video  hướng  dẫn  và  nhóm  hỗ  trợ  nội  bộ để giải đáp
các thắc mắc phát sinh.

- Đối với khách hàng sử dụng cổng thông tin

+ Tài liệu và video hướng dẫn cơ bản:

Đăng ký tài khoản, gửi câu hỏi, đặt lịch hẹn, xem phản hồi.

+ Hướng dẫn trực tuyến trên website:

Xuất bản mục FAQ và các video ngắn giải thích thao tác.


87

KẾT LUẬN

Sau quá trình nghiên cứu, phân tích và thiết kế, đề tài “Phân tích và thiết kế
website hỗ trợ quản lý hồ sơ pháp lý tại Công ty Luật TNHH Quốc tế Bình
An”  đã  hoàn  thành  được  những  mục  tiêu  cốt  lõi  đặt  ra.  Hệ  thống  được  xây
dựng  đã  góp  phần  giải  quyết  những  tồn  tại  trong  công  tác  quản  lý  hồ sơ và
tương  tác khách hàng, giúp doanh nghiệp từng bước chuyển đổi từ hình thức
quản  lý  thủ  công  sang  nền  tảng  số  hóa  chuyên  nghiệp,  hiện  đại  và  dễ  vận
hành. Website được phân tích, mô hình hóa và thiết kế đầy đủ các chức năng
chính  như  quản  lý  hồ  sơ  vụ  việc,  thông  tin  khách  hàng,  lịch  hẹn,  câu  hỏi  -
phản hồi, cùng các yêu cầu phi chức năng về bảo mật, hiệu năng và khả năng
mở  rộng. Bên cạnh đó, việc xây dựng các sơ đồ IFD, CD, BFD, DFD và mô
hình  cơ  sở  dữ  liệu  đã  tạo  nền  tảng  vững  chắc  cho  quá  trình  phát  triển phần
mềm trong thực tế. Giao diện người dùng được thiết kế thân thiện, trực quan,
thuận tiện cho cả luật sư và nhân viên hành chính, giúp nâng cao hiệu quả làm
việc,  giảm  thiểu  sai  sót  và  tăng  tính  chuyên  nghiệp  trong  quy  trình  quản  lý
pháp lý của công ty.

Tuy  nhiên,  đề  tài  vẫn  còn  tồn  tại  một  số  hạn  chế  nhất  định.  Do  phạm  vi và
thời  gian  thực  hiện  có  giới  hạn,  hệ  thống  hiện  mới  dừng  ở mức mô hình và
thử nghiệm các chức năng cơ bản, chưa tích hợp đầy đủ những tính năng nâng
cao  như  thống  kê,  báo  cáo  tự  động  hay  lưu  trữ  hồ  sơ  điện  tử  có  chữ  ký số.
Giao  diện  còn  mang tính đơn giản, cần được tối ưu thêm về mặt trải nghiệm
người  dùng,  đặc  biệt  trên  các  thiết bị di động. Quá trình kiểm thử với người
dùng  thực  tế  vẫn  chưa  được  triển  khai  rộng  rãi  nên  các  phản  hồi  từ  nhiều
nhóm đối tượng sử dụng còn hạn chế. Ngoài ra, hệ thống cũng cần bổ sung cơ
chế  sao  lưu  dữ  liệu  tự  động  và  phân  quyền  chi  tiết  hơn  để đảm bảo an toàn
thông tin và tính bảo mật cao nhất cho dữ liệu khách hàng.

Trong thời gian tới, hệ thống có thể được tiếp tục phát triển theo nhiều hướng
mở  rộng  nhằm  hoàn  thiện  và  nâng  cao  hơn  nữa  hiệu  quả  ứng dụng. Cụ thể,
cần  tích  hợp  các  chức  năng  như  tải  lên và quản lý hồ sơ pháp lý điện tử, bổ
sung chatbot tư vấn pháp luật thông minh sử dụng trí tuệ nhân tạo, phát triển
module thống kê - báo cáo hiệu suất làm việc, cũng như triển khai phiên bản
di động giúp luật sư và khách hàng có thể truy cập nhanh chóng mọi lúc, mọi
nơi.  Đồng  thời,  việc  mở  rộng  khả  năng  tương  tác với khách hàng qua email
hoặc  SMS  thông  báo  tự  động sẽ giúp tăng tính chuyên nghiệp và giảm thiểu
sai sót trong liên hệ.

Tổng thể, đề tài không chỉ mang ý nghĩa thực tiễn đối với hoạt động của Công
ty Luật TNHH Quốc tế Bình An mà còn là cơ hội giúp em vận dụng toàn diện


88

kiến thức về phân tích, thiết kế hệ thống thông tin và phát triển phần mềm vào
một tình huống nghiệp vụ cụ thể. Kết quả đạt được thể hiện rõ khả năng ứng
dụng  công  nghệ  trong  lĩnh  vực  pháp  lý,  đồng  thời  mở  ra  hướng  đi  mới cho
việc  xây  dựng  các  hệ  thống  quản  lý  thông  tin  pháp luật hiện đại, an toàn và
hiệu quả hơn trong tương lai.

Cuối cùng, em xin gửi lời cảm ơn chân thành đến Công ty Luật TNHH Quốc
tế  Bình  An  đã  tạo điều kiện thuận lợi và hỗ trợ em trong suốt quá trình thực
tập,  giúp  em  có  cơ  hội tiếp cận thực tế và vận dụng kiến thức chuyên ngành
vào  công  việc  cụ  thể.  Em cũng xin bày tỏ lòng biết ơn sâu sắc đến TS. Trần
Quang  Yên,  người  thầy  đã  luôn  tận  tình  chỉ  bảo,  định  hướng  và  đồng  hành
cùng  em  trong  suốt  quá  trình  nghiên cứu và hoàn thiện khóa luận tốt nghiệp
này.  Sự  hướng  dẫn  và  động  viên  của  thầy là nguồn động lực to lớn giúp em
hoàn thành tốt đề tài này.


89

TÀI LIỆU THAM KHẢO

Connolly,  T.,  &  Begg,  C.  (2020).  Database  systems:  A  practical

Draw.io  Team.  (2023). Draw.io user manual: Diagramming for system

Fowler, M. (2003). UML distilled: A brief guide to the standard object

Giáo  trình  Hệ  thống  thông  tin quản lý. (n.d.). Trường Đại học Kinh tế

Kendall,  K.  E.,  &  Kendall,  J.  E.  (2019).  Systems  analysis  and  design

Figma  Community.  (2024).  Design  system  and  prototyping  handbook.

Figma Inc. (2024). Design system and prototyping guide.
Flanagan,  D.  (2020).  JavaScript:  The  definitive  guide  (7th  ed.).

1.
approach to design, implementation and management (6th ed.). Pearson.
2.
design. diagrams.net Documentation.
3.
Figma Inc.
4.
5.
O’Reilly Media.
6.
modeling language (3rd ed.). Addison-Wesley.
7.
Quốc dân, Hà Nội.
8.
(10th ed.). Pearson.
9.
10.  McConnell,  S.  (2004).  Code  complete:  A  practical  handbook  of
software construction (2nd ed.). Microsoft Press.
11.  Mozilla  Developer  Network.  (2024).  HTML,  CSS  and  JavaScript  web
standards.
12.  MySQL  Documentation.  (2023).  MySQL  8.0  developer  reference
manual. Oracle Corporation.
13.  Silberschatz, A., Korth, H. F., & Sudarshan, S. (2020). Database system
concepts (7th ed.). McGraw-Hill.
14.  Sommerville,  I.  (2020).  Software  engineering  (10th  ed.).  Pearson
Education.
15.  Spring Boot Team. (2024). Spring Boot 3.0 reference guide.
16.  Trần  Thị  Song  Minh.  (2019).  Giáo  trình  Phân  tích  thiết  kế  hệ  thống
thông tin. NXB Đại học Kinh tế Quốc dân.

Kỹ nghệ phần mềm. (n.d.). NXB Đại học Kinh tế Quốc dân, Hà Nội.
