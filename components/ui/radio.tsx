"use client";

import { Radio as Base } from "@base-ui/react/radio";
import { RadioGroup as BaseGroup } from "@base-ui/react/radio-group";
import { optionRow } from "@/components/ui/checkbox";

const circle =
  "flex size-4 shrink-0 items-center justify-center rounded-full border border-fg-muted transition-[border-color] duration-100 ease-out data-checked:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

export function RadioGroup<T extends string | number>({
  label,
  value,
  onValueChange,
  children,
}: {
  label: string;
  value: T;
  onValueChange: (value: T) => void;
  children: React.ReactNode;
}) {
  return (
    <BaseGroup
      aria-label={label}
      value={value}
      onValueChange={(v) => onValueChange(v as T)}
      className="flex flex-col"
    >
      {children}
    </BaseGroup>
  );
}

export function Radio({
  value,
  disabled,
  count,
  children,
}: {
  value: string | number;
  disabled?: boolean;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <label className={optionRow}>
      <Base.Root value={value} disabled={disabled} className={circle}>
        <Base.Indicator className="flex size-2 rounded-full bg-accent data-unchecked:hidden" />
      </Base.Root>
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {count != null && <span className="text-fg-muted tabular-nums">{count}</span>}
    </label>
  );
}
