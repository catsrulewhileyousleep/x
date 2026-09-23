import Link from "next/link";
import { Directory } from "@/components/directory";
import { categories, snapshotAt, toRow, tools, toolsInCategory } from "@/lib/data";
import { formatDate, repoUrl } from "@/lib/format";

export default function Home() {
  return (
    <>
      <h1 className="max-w-[16ch] text-[2.5rem] leading-[1.05] font-semibold tracking-[-0.035em] text-balance sm:text-[3.5rem]">
        Công cụ AI mã nguồn mở, chọn lọc kỹ.
      </h1>
      <p className="mt-5 max-w-[60ch] text-[15px] text-pretty text-fg-muted">
        {tools.length} dự án được kiểm tra thủ công. Health Score tính từ stars và commit gần nhất,
        dữ liệu ngày {formatDate(snapshotAt)}.{" "}
        <Link href="/health-score" className="text-fg underline decoration-fg-muted hover:decoration-fg">
          Xem cách tính
        </Link>
      </p>

      <div className="mt-12">
        <Directory
          rows={tools.map((t) => toRow(t))}
          categories={categories
            .filter((c) => toolsInCategory(c.slug).length > 0)
            .map(({ slug, name }) => ({ slug, name }))}
          contributeUrl={`${repoUrl}/issues`}
        />
      </div>
    </>
  );
}
