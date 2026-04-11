import type { PatientStatus, Condition, Trend } from "@/lib/db/types";

// ─── Status Badge ─────────────────────────────────────────
// Tag badges  = subtle fill, no border, rounded-lg, ~32px height
// Status badge = bold fill, rounded-full pill, ~32px height

type BadgeVariant =
  | { type: "status"; value: PatientStatus }
  | { type: "condition"; value: Condition }
  | { type: "trend"; value: Trend }
  | { type: "compliance"; value: number };

const STATUS_STYLES: Record<PatientStatus, { bg: string; text: string; label: string }> = {
  active: { bg: "bg-[#35BFA3]", text: "text-white", label: "Active" },
  inactive: { bg: "bg-[#E63D4B]", text: "text-white", label: "Inactive" },
  new: { bg: "bg-[#35BFA3]", text: "text-white", label: "New" },
};

const CONDITION_STYLES: Record<Condition, { bg: string; text: string; label: string }> = {
  diabetes: { bg: "bg-[#E4F2D3]", text: "text-[#0E4D41]", label: "Diabetes" },
  obesity: { bg: "bg-[#E4F2D3]", text: "text-[#0E4D41]", label: "Obesity" },
};

export function StatusBadge(props: BadgeVariant) {
  // Status — filled pill
  if (props.type === "status") {
    const style = STATUS_STYLES[props.value];
    return (
      <span className={`inline-flex items-center rounded-[20px] px-2.5 py-1.5 text-[11px] font-medium leading-[1.3] ${style.bg} ${style.text}`}>
        {style.label}
      </span>
    );
  }

  // Condition — light green tag
  if (props.type === "condition") {
    const style = CONDITION_STYLES[props.value];
    return (
      <span className={`inline-flex items-center rounded-md px-2.5 py-1.5 text-[11px] font-medium leading-[1.3] ${style.bg} ${style.text}`}>
        {style.label}
      </span>
    );
  }

  // Trend — light grey tag
  if (props.type === "trend") {
    const labels: Record<Trend, string> = {
      improving: "Improving",
      stable: "Stable",
      worsening: "Worsening",
    };
    return (
      <span className="inline-flex items-center rounded-md bg-surface px-2.5 py-1.5 text-[11px] font-medium leading-[1.3] text-dark-grey">
        {labels[props.value]}
      </span>
    );
  }

  // Compliance — grey tag
  return (
    <span className="inline-flex items-center rounded-md bg-border px-2.5 py-1.5 text-[11px] font-medium leading-[1.3] text-black">
      {props.value}%
    </span>
  );
}
