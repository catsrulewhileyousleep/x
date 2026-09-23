"use client";

import { Popover as Base } from "@base-ui/react/popover";

/** Popup surface shared by every popover and dialog, so they read as one family. */
export const popupSurface =
  "rounded-xl border border-hairline bg-canvas text-fg shadow-[0_12px_32px_-12px_rgb(0_0_0/0.35)] outline-none";

export function Popover({
  trigger,
  label,
  children,
}: {
  trigger: React.ReactElement;
  /** Accessible name of the popup. */
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Base.Root>
      <Base.Trigger render={trigger} />
      <Base.Portal>
        <Base.Positioner side="bottom" align="start" sideOffset={6} collisionPadding={8}>
          <Base.Popup
            aria-label={label}
            className={`${popupSurface} max-h-(--available-height) w-64 origin-(--transform-origin) overflow-y-auto overscroll-contain p-1.5 transition-[opacity,scale] duration-150 ease-out data-ending-style:opacity-0 data-starting-style:opacity-0 motion-safe:data-ending-style:scale-[0.96] motion-safe:data-starting-style:scale-[0.96]`}
          >
            {children}
          </Base.Popup>
        </Base.Positioner>
      </Base.Portal>
    </Base.Root>
  );
}
