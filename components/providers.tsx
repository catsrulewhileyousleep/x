"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { SoundProvider } from "@/components/sound";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SoundProvider>
      <TooltipProvider>{children}</TooltipProvider>
    </SoundProvider>
  );
}
