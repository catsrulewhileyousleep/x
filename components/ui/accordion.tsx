"use client";

import { Accordion as Base } from "@base-ui/react/accordion";
import { Plus } from "lucide-react";

export function Accordion({ items }: { items: { title: string; content: React.ReactNode }[] }) {
  return (
    <Base.Root className="divide-y divide-hairline" defaultValue={[items[0]?.title]}>
      {items.map((item) => (
        <Base.Item value={item.title} key={item.title}>
          <Base.Header render={<h3 />}>
            <Base.Trigger className="group flex min-h-14 w-full items-center justify-between gap-4 rounded-md py-4 text-left text-[15px] font-medium hover:text-fg-muted">
              {item.title}
              <Plus aria-hidden="true" className="size-4 shrink-0 transition-transform duration-150 group-data-panel-open:rotate-45 motion-reduce:transition-none" strokeWidth={1.75} />
            </Base.Trigger>
          </Base.Header>
          <Base.Panel className="accordion-panel overflow-hidden">
            <div className="pb-5 pr-6 text-[15px] leading-relaxed text-pretty text-fg-muted">{item.content}</div>
          </Base.Panel>
        </Base.Item>
      ))}
    </Base.Root>
  );
}
