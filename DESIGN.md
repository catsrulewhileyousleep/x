# Nguyên tắc thiết kế

"Less, but better." Mỗi quyết định dưới đây gắn với một chỗ cụ thể trong code; nếu một thứ không phục vụ việc tìm và đánh giá tool, nó không có mặt.

## Dieter Rams — 10 nguyên tắc

| Nguyên tắc | Áp dụng |
| --- | --- |
| Đổi mới | Health Score công khai công thức ngay trên từng trang tool, không phải điểm hộp đen. |
| Hữu ích | List view thay cho grid card: quét được tên, điểm, stars, license theo cột dọc. |
| Thẩm mỹ | Một font (Inter Tight), thang đơn sắc OKLCH, một màu accent. |
| Dễ hiểu | Header cột bắt buộc; không con số nào tự giải thích. |
| Không phô trương | Không badge, không shadow, không icon trang trí; chỉ hairline giữa các dòng. |
| Trung thực | Repo archived, mới hoặc thiếu dữ liệu hiện "Chưa đủ dữ liệu", không đoán điểm. License không nhận diện được ghi rõ nguồn xác minh. |
| Bền lâu | Trang tĩnh (SSG), không phụ thuộc xu hướng "terminal aesthetic". |
| Kỹ đến chi tiết | `tabular-nums`, số căn phải thẳng header, `text-wrap: balance/pretty`, subset tiếng Việt. |
| Thân thiện môi trường | Không có component library; JS phía client chỉ cho search, lọc, sắp xếp. |
| Càng ít thiết kế càng tốt | Mỗi trang một H1, một danh sách, một hành động chính. |

## Don Norman — thiết kế lấy con người làm trung tâm

- **Affordance & signifier**: cả dòng là link thật (`<a>` phủ dòng), hover đổi nền; mũi tên sort chỉ hiện ở cột đang sắp xếp; link ngoài có ↗.
- **Feedback**: đếm kết quả qua `role="status"`, pill hiện số tool khớp theo từ khóa hiện tại.
- **Mapping**: bấm vào header cột nào thì sắp xếp cột đó.
- **Constraints**: dữ liệu sai tham chiếu (category, alternative, snapshot) làm build thất bại thay vì tạo link chết.
- **Mô hình khái niệm**: Health Score chỉ có hai thành phần, dễ nhớ và giải thích được.

## Jakob Nielsen — 10 heuristic

| Heuristic | Áp dụng |
| --- | --- |
| Hiển thị trạng thái hệ thống | Ngày cập nhật dữ liệu ở trang chủ, trang tool và footer. |
| Khớp với thế giới thực | Tiếng Việt, ngày định dạng `vi-VN`, thuật ngữ dev giữ nguyên (stars, license). |
| Quyền kiểm soát | `Esc` xóa từ khóa, "xóa bộ lọc" trong trạng thái rỗng, filter không đổi URL. |
| Nhất quán | Cùng một component list view cho trang chủ, category, alternative-to và "Tool tương tự". |
| Phòng lỗi | Search khớp cả tag và license; giá trị thiếu luôn xếp cuối khi sort. |
| Nhận biết thay vì ghi nhớ | Header cột luôn hiển thị; pill hiện số lượng. |
| Linh hoạt | Phím `/` để focus ô tìm kiếm; hỗ trợ bàn phím đầy đủ. |
| Tối giản | Không có gì ngoài tên, tagline, điểm, stars, license trong một dòng. |
| Giúp phục hồi lỗi | Trạng thái rỗng nêu từ khóa và cách thoát; danh mục trống được coi là lỗi dữ liệu, có link tải lại và báo lỗi. |
| Trợ giúp & tài liệu | Trang `/health-score` giải thích công thức, giới hạn và nguồn. |

## John Maeda — Laws of Simplicity

| Luật | Áp dụng |
| --- | --- |
| Reduce | Bỏ contributors khỏi trang tool vì API GitHub không trả số chính xác cho repo lớn. |
| Organize | Category là nhóm bằng chữ, không bằng màu. |
| Time | Không chuyển động trừ đổi nền khi hover (100ms) và xoay chevron (tôn trọng `prefers-reduced-motion`). |
| Learn | Nhìn một dòng là hiểu mọi dòng. |
| Differences | Màu chỉ dành cho trạng thái: accent cho pill đang chọn, ba màu health cho mức điểm. |
| Context | Khoảng trắng rộng quanh H1, dày đặc trong danh sách. |
| Emotion | Chữ lớn, tracking âm ở heading tạo cá tính mà không cần trang trí. |
| Trust | Mỗi trang alternative-to cần ít nhất 3 tool có câu "vì sao thay thế được" do người biên tập viết. |
| Failure | Một số thứ để lại: light mode, ⌘K, form submit thuộc giai đoạn sau. |
| The One | Bớt những thứ hiển nhiên, thêm những thứ có ý nghĩa. |

## Token màu

Giá trị lấy từ brief (§6), đã đo độ tương phản WCAG trên nền thực tế:

| Cặp | Tỉ lệ |
| --- | --- |
| `--text-primary` / `--bg-base` | 18,99 |
| `--text-secondary` / `--bg-base` | 5,52 |
| `--text-secondary` / `--bg-surface` (dòng hover) | 5,07 |
| `--accent` / `--bg-surface` (số đếm trong pill đang chọn) | 4,82 |
| `--focus-ring` / `--bg-surface` | 7,26 |

Chữ trắng trên nền `--accent` chỉ đạt 3,61, nên pill đang chọn dùng viền accent thay vì nền accent.
