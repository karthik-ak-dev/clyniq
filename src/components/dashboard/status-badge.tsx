import type { PatientStatus, Condition, Trend } from "@/lib/db/types";

// ─── Status Badge ─────────────────────────────────────────
// Tag badges  = subtle fill, no border, rounded-sm (6px)
// Status badge = bold fill, rounded-2xl (20px) pill

type BadgeVariant =
  | { type: "status"; value: PatientStatus }
  | { type: "condition"; value: Condition }
  | { type: "trend"; value: Trend }
  | { type: "compliance"; value: number };

const STATUS_STYLES: Record<PatientStatus, { bg: string; text: string; label: string }> = {
  active: { bg: "bg-primary", text: "text-white", label: "Active" },
  inactive: { bg: "bg-red", text: "text-white", label: "Inactive" },
  new: { bg: "bg-primary", text: "text-white", label: "New" },
};

const CONDITION_STYLES: Record<Condition, { bg: string; text: string; label: string }> = {
  diabetes: { bg: "bg-primary-light", text: "text-primary-dark", label: "Diabetes" },
  obesity: { bg: "bg-primary-light", text: "text-primary-dark", label: "Obesity" },
};

export function StatusBadge(props: BadgeVariant) {
  // Status — filled pill
  if (props.type === "status") {
    const style = STATUS_STYLES[props.value];
    return (
      <span className={`inline-flex items-center rounded-2xl px-2.5 py-1.5 text-base font-medium leading-normal ${style.bg} ${style.text}`}>
        {style.label}
      </span>
    );
  }

  // Condition — light green tag
  if (props.type === "condition") {
    const style = CONDITION_STYLES[props.value];
    return (
      <span className={`inline-flex items-center rounded-sm px-2.5 py-1.5 text-base font-medium leading-normal ${style.bg} ${style.text}`}>
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
      <span className="inline-flex items-center rounded-sm bg-surface px-2.5 py-1.5 text-base font-medium leading-normal text-dark-grey">
        {labels[props.value]}
      </span>
    );
  }

  // Compliance — grey tag
  return (
    <span className="inline-flex items-center rounded-sm bg-border px-2.5 py-1.5 text-base font-medium leading-normal text-black">
      {props.value}%
    </span>
  );
}
