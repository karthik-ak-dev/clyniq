"use client";

import { useState, useEffect } from "react";

// ─── Device Type Hook ──────────────────────────────────────
// Central hook for detecting mobile vs desktop viewport.
// Used by all patient-facing pages to show/hide content based
// on device type (e.g., mobile gets "Start Check-In", desktop
// gets "please use your mobile phone").
//
// Uses matchMedia instead of resize events — only fires when
// the breakpoint is actually crossed, no debouncing needed.
//
// Returns null during SSR/hydration (before mount), then the
// actual device type after mount. This prevents hydration
// mismatches — components should hide device-specific content
// until mounted is true.
//
// Usage:
//   const { deviceType, mounted } = useDeviceType();
//   if (!mounted) return <Loading />;
//   if (deviceType === "mobile") { ... }

export type DeviceType = "mobile" | "desktop";

const MOBILE_BREAKPOINT = 768; // Aligns with Tailwind's md: breakpoint

export function useDeviceType(): { deviceType: DeviceType; mounted: boolean } {
  const [deviceType, setDeviceType] = useState<DeviceType>("mobile");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${MOBILE_BREAKPOINT}px)`);

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setDeviceType(e.matches ? "desktop" : "mobile");
    };

    // Set initial value from actual viewport
    handleChange(mql);
    setMounted(true);

    // Listen for breakpoint crosses
    mql.addEventListener("change", handleChange as EventListener);
    return () =>
      mql.removeEventListener("change", handleChange as EventListener);
  }, []);

  return { deviceType, mounted };
}
