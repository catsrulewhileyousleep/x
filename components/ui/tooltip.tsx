"use client";

import { Tooltip as Base } from "@base-ui/react/tooltip";

/** One provider for the whole app, so moving between triggers opens the next tooltip instantly. */
export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <Base.Provider delay={500}>{children}</Base.Provider>;
}

/**
 * A supplementary label for sighted mouse and keyboard users. Base UI disables tooltips on touch,
 * so nothing a reader needs may live only here: it repeats or refines what is already on the page.
 */
export function Tooltip({
  content,
  children,
  side = "top",
}: {
  content: React.ReactNode;
  children: React.ReactElement;
  side?: "top" | "bottom" | "left" | "right";
}) {
  return (
    <Base.Root>
      <Base.Trigger render={children} />
      <Base.Portal>
        <Base.Positioner side={side} sideOffset={6} collisionPadding={8}>
          <Base.Popup className="max-w-64 origin-(--transform-origin) rounded-md bg-fg px-2 py-1 text-xs leading-snug text-canvas transition-[opacity,scale] duration-100 ease-out data-ending-style:opacity-0 data-instant:transition-none data-starting-style:opacity-0 motion-safe:data-ending-style:scale-[0.96] motion-safe:data-starting-style:scale-[0.96]">
            {content}
          </Base.Popup>
        </Base.Positioner>
      </Base.Portal>
    </Base.Root>
  );
}
