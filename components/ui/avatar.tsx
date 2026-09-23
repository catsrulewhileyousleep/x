"use client";

import { Avatar as Base } from "@base-ui/react/avatar";

/**
 * Project logo with a lettered fallback when the image is missing or fails. The fallback waits
 * briefly so a fast-loading logo never flashes a letter first.
 */
export function Avatar({ src, name, size = 20 }: { src: string | null; name: string; size?: number }) {
  return (
    <Base.Root
      className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[5px] bg-surface align-middle font-medium text-fg-muted outline outline-1 -outline-offset-1 outline-image-outline select-none"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.5) }}
    >
      {src && (
        <Base.Image
          src={`${src}&s=${size * 2}`}
          alt=""
          width={size}
          height={size}
          className="size-full object-cover"
        />
      )}
      <Base.Fallback delay={src ? 600 : 0} aria-hidden="true">
        {name.charAt(0).toUpperCase()}
      </Base.Fallback>
    </Base.Root>
  );
}
