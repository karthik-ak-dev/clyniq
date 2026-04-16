import type { CheckIn, TemplateQuestion } from "@/lib/db/types";

export function LastCheckinDetail({ checkIn, questions, enabledQuestions }: {
  checkIn: CheckIn | null;
  questions: TemplateQuestion[];
  enabledQuestions: string[];
}) {
  if (!checkIn) {
    return (
      <div className="flex h-140 flex-col rounded-xl bg-white p-5">
        <h3 className="text-2xl font-bold text-black tracking-tighter">Last Check-in</h3>
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
    if (val === undefined || val === null || val === "") return "—";
    if (q.type === "yes_no") return val === true ? "Yes" : "No";
    if (q.type === "multi_choice" && Array.isArray(val)) return val.length > 0 ? val.join(", ") : "—";
    if (q.type === "number" && q.unit) return `${val} ${q.unit}`;
    if (q.type === "bp") return String(val);
    return String(val);
  }

  function shortLabel(label: string): string {
    return label
      .replace(/\?$/, "")
      .replace(/^Did you /, "")
      .replace(/^What was your /, "")
      .replace(/^What's your /, "")
      .replace(/^What time did you /, "")
      .replace(/^How was your /, "")
      .replace(/^How are you /, "")
      .replace(/^Any /, "")
      .replace(/ today$/, "");
  }

  return (
    <div className="flex h-140 flex-col rounded-xl bg-white p-5">
      <div className="flex items-center justify-between shrink-0">
        <h3 className="text-2xl font-bold text-black tracking-tighter">Last Check-in</h3>
        <span className="text-base text-dark-grey">{formatted}</span>
      </div>

      <div className="mt-3 flex flex-col gap-0.5 overflow-y-auto min-h-0">
        {activeQuestions.map((q) => {
          const val = checkIn.responses[q.key];
          const display = formatValue(q, val);
          const noResponse = val === undefined || val === null || val === "";
          const isYes = q.type === "yes_no" && val === true;

          return (
            <div key={q.key} className="flex items-center justify-between py-1.5 text-md">
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <span className="size-1.5 shrink-0 rounded-full bg-dark-grey" />
                <span className="text-dark-grey truncate">{shortLabel(q.label)}</span>
              </div>
              <span className={`shrink-0 font-medium ${
                noResponse ? "text-light-grey" :
                q.type === "yes_no" ? (isYes ? "text-primary" : "text-red") :
                "text-black"
              }`}>
                {display}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
