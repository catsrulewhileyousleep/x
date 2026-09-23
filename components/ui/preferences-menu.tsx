"use client";

import { Menu } from "@base-ui/react/menu";
import { Check, Settings2 } from "lucide-react";
import { useId } from "react";
import { useSound } from "@/components/sound";
import { popupSurface } from "@/components/ui/popover";

export function PreferencesMenu() {
  const { enabled, setEnabled, play } = useSound();
  const descriptionId = useId();

  return (
    <Menu.Root>
        <Menu.Trigger
          aria-label="Preferences"
          className="inline-grid size-11 place-items-center rounded-lg text-fg-muted transition-[color,background-color] duration-100 ease-out hover:bg-surface hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          <Settings2 aria-hidden="true" strokeWidth={1.75} className="size-4" />
        </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner side="bottom" align="end" sideOffset={6} collisionPadding={8}>
          <Menu.Popup
            aria-label="Preferences"
            className={`${popupSurface} w-72 origin-(--transform-origin) p-1.5 transition-[opacity,scale] duration-150 ease-out data-ending-style:opacity-0 data-starting-style:opacity-0 motion-safe:data-ending-style:scale-[0.96] motion-safe:data-starting-style:scale-[0.96] motion-reduce:transition-none`}
          >
            <p className="px-2 py-2 text-[13px] font-medium">Preferences</p>
            <Menu.CheckboxItem
              aria-label="Interface sounds"
              aria-describedby={descriptionId}
              checked={enabled}
              onCheckedChange={(next) => {
                setEnabled(next);
                if (next) play("toggle");
              }}
              closeOnClick={false}
              className="grid min-h-11 w-full cursor-default grid-cols-[1rem_minmax(0,1fr)] items-start gap-x-2.5 rounded-md px-2 py-2 text-left outline-none select-none data-highlighted:bg-surface focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus"
            >
              <span className="col-start-1 row-start-1 mt-0.5 text-fg">
              <Menu.CheckboxItemIndicator>
                <Check aria-hidden="true" strokeWidth={2.5} className="size-4" />
              </Menu.CheckboxItemIndicator>
              </span>
              <span className="col-start-2 row-start-1 min-w-0">
                <span className="block text-[13px] text-fg">Interface sounds</span>
                <span id={descriptionId} className="mt-0.5 block text-xs leading-snug text-fg-muted">
                  Off by default. Quiet feedback for actions.
                </span>
              </span>
            </Menu.CheckboxItem>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
