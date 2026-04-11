import type { CheckIn, TemplateQuestion } from "@/lib/db/types";

export function LastCheckinDetail({ checkIn, questions, enabledQuestions }: {
  checkIn: CheckIn | null;
  questions: TemplateQuestion[];
  enabledQuestions: string[];
}) {
  if (!checkIn) {
    return (
      <div className="rounded-xl bg-white p-5">
        <h3 className="text-md font-bold text-black">Last Check-in</h3>
        <p className="mt-3 text-md text-dark-grey">No check-ins recorded yet.</p>
      </div>
    );
  }

  const date = new Date(checkIn.date + "T00:00:00");
  const formatted = date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const enabledSet = new Set(enabledQuestions);
  const activeQuestions = questions.filter((q) => enabledSet.has(q.key));

  function formatValue(q: TemplateQuestion, val: unknown): string {
    if (val === undefined || val === null) return "—";
    if (q.type === "yes_no") return val === true ? "Yes" : "No";
    if (q.type === "multi_choice" && Array.isArray(val)) return val.join(", ");
    if (q.type === "number" && q.unit) return `${val} ${q.unit}`;
    if (q.type === "bp") return String(val);
    return String(val);
  }

  return (
    <div className="rounded-xl bg-white p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-md font-bold text-black">Last Check-in</h3>
        <span className="text-base text-dark-grey">{formatted}</span>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        {activeQuestions.map((q) => {
          const val = checkIn.responses[q.key];
          const display = formatValue(q, val);
          const isYes = q.type === "yes_no" && val === true;
          const isNo = q.type === "yes_no" && val === false;

          return (
            <div key={q.key} className="flex items-center gap-2 text-md">
              {q.type === "yes_no" && (
                <span className={`flex size-5 items-center justify-center rounded-full text-white text-2xs ${isYes ? "bg-primary" : "bg-red"}`}>
                  {isYes ? "✓" : "✕"}
                </span>
              )}
              {q.type !== "yes_no" && (
                <span className="size-1.5 rounded-full bg-primary shrink-0" />
              )}
              <span className="text-dark-grey truncate">{q.label.replace(/\?$/, "")}</span>
              <span className="ml-auto shrink-0 font-medium text-black">{display}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
