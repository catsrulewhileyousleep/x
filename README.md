# AI Directory

Danh mục nhỏ, được tuyển chọn thủ công các công cụ AI mã nguồn mở, kèm Health Score minh bạch. Nguyên tắc thiết kế: [DESIGN.md](DESIGN.md).

## Chạy

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm test       # Health Score
pnpm lint && pnpm build
```

## Dữ liệu

- `data/tools.json`: nội dung biên tập (tagline, mô tả, `alternativeTo` kèm câu "vì sao thay thế được").
- `data/categories.json`, `data/alternatives.json`: danh mục và sản phẩm đóng nguồn làm điểm so sánh.
- `data/github-snapshot.json`: sinh tự động, không sửa tay. Làm mới bằng:

```bash
GITHUB_TOKEN=... pnpm snapshot
```

Trang `/alternative-to/[slug]` chỉ được tạo khi có ít nhất 3 tool; category dưới 2 tool bị `noindex`. Tham chiếu sai (category, alternative, repo chưa có snapshot) làm build thất bại.

Đặt `NEXT_PUBLIC_SITE_URL` khi deploy để canonical, sitemap và JSON-LD dùng đúng domain.
