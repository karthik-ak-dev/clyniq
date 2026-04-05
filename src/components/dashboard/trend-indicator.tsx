import type { Trend } from "@/lib/db/types";

// ─── Trend Indicator ───────────────────────────────────────
// Small badge showing compliance trend direction.
// Green = improving, gray = stable, red = worsening.

const TREND_CONFIG = {
  improving: { label: "↑ Improving", className: "text-green-600 bg-green-50" },
  stable: { label: "→ Stable", className: "text-gray-500 bg-gray-100" },
  worsening: { label: "↓ Worsening", className: "text-red-600 bg-red-50" },
} as const;

export function TrendIndicator({ trend }: { trend: Trend }) {
  const config = TREND_CONFIG[trend];

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-600 ${config.className}`}
    >
      {config.label}
    </span>
  );
}
