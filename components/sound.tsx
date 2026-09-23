"use client";

import { createContext, useCallback, useContext, useSyncExternalStore } from "react";

export type SoundCue = "success" | "error" | "toggle" | "press";

type SoundContextValue = {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  play: (cue: SoundCue) => void;
};

const SoundContext = createContext<SoundContextValue | null>(null);
const STORAGE_KEY = "interface-sounds";
const VOLUME = 0.18;

let cuelumePromise: Promise<typeof import("cuelume")> | undefined;
let cuelumeApi: typeof import("cuelume") | undefined;
let sessionPreference: boolean | undefined;
const preferenceSubscribers = new Set<() => void>();

function loadCuelume() {
  if (!cuelumePromise) {
    cuelumePromise = import("cuelume")
      .then((api) => {
        cuelumeApi = api;
        return api;
      })
      .catch((error: unknown) => {
        cuelumePromise = undefined;
        throw error;
      });
  }

  return cuelumePromise;
}

function readPreference() {
  if (sessionPreference !== undefined) return sessionPreference;
  if (typeof window === "undefined") return false;

  try {
    return window.localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function subscribeToPreference(onChange: () => void) {
  preferenceSubscribers.add(onChange);
  return () => preferenceSubscribers.delete(onChange);
}

function updatePreference(next: boolean) {
  sessionPreference = next;

  try {
    if (next) window.localStorage.setItem(STORAGE_KEY, "true");
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {}

  preferenceSubscribers.forEach((onChange) => onChange());
}

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const enabled = useSyncExternalStore(subscribeToPreference, readPreference, () => false);

  const setEnabled = useCallback((next: boolean) => {
    updatePreference(next);
    cuelumeApi?.setEnabled(next);
  }, []);

  const play = useCallback((cue: SoundCue) => {
    if (!readPreference() || typeof window === "undefined") return;

    void loadCuelume()
      .then((api) => {
        const isEnabled = readPreference();
        api.setEnabled(isEnabled);
        if (!isEnabled) return;

        api.setVolume(VOLUME);
        api.play(cue);
      })
      .catch(() => {});
  }, []);

  return <SoundContext.Provider value={{ enabled, setEnabled, play }}>{children}</SoundContext.Provider>;
}

export function useSound() {
  const sound = useContext(SoundContext);
  if (!sound) throw new Error("useSound must be used within SoundProvider");
  return sound;
}
