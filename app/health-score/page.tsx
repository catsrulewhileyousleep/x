import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { snapshotAt, tools } from "@/lib/data";
import { formatDate, formatNumber } from "@/lib/format";
import { FORMULA_VERSION, FRESH_DAYS, MIN_REPO_AGE_DAYS, STALE_DAYS, WEIGHTS } from "@/lib/health";

export const metadata: Metadata = {
  title: "Cách tính Health Score",
  description: "Công thức, trọng số, nguồn dữ liệu và giới hạn của Health Score.",
  alternates: { canonical: "/health-score" },
};

const maxStars = Math.max(...tools.map((t) => t.stars ?? 0));

export default function HealthScorePage() {
  return (
    <article className="max-w-[65ch]">
      <Breadcrumbs items={[{ name: "Health Score", href: "/health-score" }]} />
      <h1 className="mt-6 text-[2.25rem] leading-[1.1] font-semibold tracking-[-0.03em]">
        Cách tính Health Score
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-pretty text-fg-muted">
        Health Score là chỉ báo tham khảo để quét nhanh mức độ hoạt động của một repo, không phải đánh giá
        chất lượng. Phiên bản {FORMULA_VERSION} chỉ dùng hai dữ liệu GitHub thu thập được ổn định.
      </p>

      <Section title="Công thức">
        <table className="w-full text-left tabular-nums">
          <thead className="text-[13px] text-fg-muted">
            <tr className="border-b border-hairline">
              <th className="py-2 font-normal">Tiêu chí</th>
              <th className="py-2 text-right font-normal">Trọng số</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-hairline">
              <td className="py-2">Popularity</td>
              <td className="py-2 text-right">{WEIGHTS.popularity * 100}%</td>
            </tr>
            <tr>
              <td className="py-2">Maintenance</td>
              <td className="py-2 text-right">{WEIGHTS.maintenance * 100}%</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-3 text-fg-muted">Điểm = 0,4 × Popularity + 0,6 × Maintenance, làm tròn đến số nguyên.</p>
      </Section>

      <Section title="Popularity">
        <p>
          Số stars theo thang log, so với repo nhiều stars nhất trong tập dữ liệu hiện tại (
          {formatNumber(maxStars)} stars): 100 × log(1 + stars) / log(1 + stars lớn nhất). Thang log giữ cho
          khoảng cách giữa 1.000 và 10.000 stars có ý nghĩa bằng khoảng cách giữa 10.000 và 100.000.
        </p>
      </Section>

      <Section title="Maintenance">
        <p>
          Tính từ ngày commit gần nhất trên nhánh mặc định: 100 điểm nếu trong {FRESH_DAYS} ngày, giảm tuyến
          tính về 0 ở mốc {STALE_DAYS} ngày, sau đó giữ 0. Số ngày được đo tới thời điểm lấy dữ liệu, không
          phải thời điểm bạn đọc trang.
        </p>
      </Section>

      <Section title="Khi nào không chấm điểm">
        <p>Trang hiển thị “Chưa đủ dữ liệu” thay vì đoán điểm khi repo:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 marker:text-fg-muted">
          <li>đã được lưu trữ (archived) hoặc không còn công khai,</li>
          <li>mới hơn {MIN_REPO_AGE_DAYS} ngày,</li>
          <li>thiếu số stars, ngày tạo hoặc ngày commit.</li>
        </ul>
      </Section>

      <Section title="Điểm này không nói gì">
        <p>
          Stars đo mức độ được chú ý, không đo chất lượng. Một commit mới không chứng minh dự án được bảo trì
          tốt. Các tiêu chí như contributors, issue và pull request, tài liệu chỉ được thêm khi đã định nghĩa
          rõ nguồn, cửa sổ đo và cách xử lý dữ liệu thiếu.
        </p>
      </Section>

      <Section title="Mức điểm">
        <ul className="space-y-1.5">
          <Level className="bg-health-high" label="Từ 70 trở lên" />
          <Level className="bg-health-mid" label="Từ 40 đến 69" />
          <Level className="bg-health-low" label="Dưới 40" />
        </ul>
        <p className="mt-3 text-fg-muted">Màu chỉ giúp quét nhanh; con số luôn hiển thị kèm theo.</p>
      </Section>

      <Section title="Nguồn và cập nhật">
        <p>
          Dữ liệu lấy từ GitHub REST API, lần gần nhất ngày {formatDate(snapshotAt)}. Công thức phiên bản{" "}
          {FORMULA_VERSION}; mọi thay đổi công thức sẽ tăng số phiên bản.
        </p>
      </Section>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12 text-[15px] leading-relaxed text-pretty">
      <h2 className="mb-3 font-medium">{title}</h2>
      {children}
    </section>
  );
}

function Level({ className, label }: { className: string; label: string }) {
  return (
    <li className="flex items-center gap-2">
      <span aria-hidden="true" className={`size-1.5 rounded-full ${className}`} />
      {label}
    </li>
  );
}
