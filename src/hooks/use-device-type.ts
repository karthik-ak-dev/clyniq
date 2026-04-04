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
// SSR-safe: defaults to "mobile" since the primary audience
// is patients on their phones. This prevents a flash where
// desktop content briefly shows on mobile during hydration.
//
// Usage:
//   const deviceType = useDeviceType();
//   if (deviceType === "mobile") { ... }

export type DeviceType = "mobile" | "desktop";

const MOBILE_BREAKPOINT = 768; // Aligns with Tailwind's md: breakpoint

export function useDeviceType(): DeviceType {
  const [deviceType, setDeviceType] = useState<DeviceType>("mobile");

  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${MOBILE_BREAKPOINT}px)`);

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setDeviceType(e.matches ? "desktop" : "mobile");
    };

    // Set initial value from actual viewport
    handleChange(mql);

    // Listen for breakpoint crosses
    mql.addEventListener("change", handleChange as EventListener);
    return () =>
      mql.removeEventListener("change", handleChange as EventListener);
  }, []);

  return deviceType;
}
