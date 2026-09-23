"use client";

import { Checkbox as Base } from "@base-ui/react/checkbox";
import { CheckboxGroup as BaseGroup } from "@base-ui/react/checkbox-group";
import { Check } from "lucide-react";

/** Row shared by checkbox and radio options: the whole row is the label and the hit area. */
export const optionRow =
  "flex min-h-9 cursor-pointer items-center gap-2.5 rounded-md px-2 text-[13px] select-none hover:bg-surface pointer-coarse:min-h-11 has-data-disabled:cursor-default has-data-disabled:opacity-40 has-data-disabled:hover:bg-transparent";

// Unchecked border uses the muted text color: 5.5:1 on the background, above the 3:1 required for controls.
const box =
  "flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-fg-muted text-white transition-[background-color,border-color] duration-100 ease-out data-checked:border-accent data-checked:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

export function CheckboxGroup({
  label,
  value,
  onValueChange,
  children,
}: {
  label: string;
  value: string[];
  onValueChange: (value: string[]) => void;
  children: React.ReactNode;
}) {
  return (
    <BaseGroup aria-label={label} value={value} onValueChange={onValueChange} className="flex flex-col">
      {children}
    </BaseGroup>
  );
}

export function Checkbox({
  value,
  disabled,
  count,
  children,
}: {
  value: string;
  disabled?: boolean;
  /** Shown right-aligned, for faceted filters. */
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <label className={optionRow}>
      <Base.Root value={value} disabled={disabled} className={box}>
        <Base.Indicator className="flex data-unchecked:hidden">
          <Check aria-hidden="true" strokeWidth={3} className="size-3" />
        </Base.Indicator>
      </Base.Root>
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {count != null && <span className="text-fg-muted tabular-nums">{count}</span>}
    </label>
  );
}
