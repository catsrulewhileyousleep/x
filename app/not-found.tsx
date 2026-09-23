import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-[60ch]">
      <h1 className="text-[2.25rem] leading-[1.1] font-semibold tracking-[-0.03em]">Không tìm thấy trang</h1>
      <p className="mt-4 text-[15px] text-fg-muted">
        Đường dẫn có thể đã đổi, hoặc tool chưa được đăng.{" "}
        <Link href="/" className="text-fg underline decoration-fg-muted hover:decoration-fg">
          Về danh sách tool
        </Link>
      </p>
    </div>
  );
}
