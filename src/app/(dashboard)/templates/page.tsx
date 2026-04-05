"use client";

import { useState, useEffect } from "react";
import type { TemplateQuestion } from "@/lib/db/types";

// ─── Templates Page ────────────────────────────────────────
// Read-only view of default tracking templates.
// Matched to design/doc_flow/templates.png:
//   - Template cards showing name, condition, question count
//   - Expandable detail showing all questions

type Template = {
  id: string;
  condition: string;
  name: string;
  questions: TemplateQuestion[];
  isDefault: boolean;
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTemplates() {
      try {
        // Fetch both conditions
        const [diabetesRes, obesityRes] = await Promise.all([
          fetch("/api/templates?condition=diabetes"),
          fetch("/api/templates?condition=obesity"),
        ]);
        const [diabetesJson, obesityJson] = await Promise.all([
          diabetesRes.json(),
          obesityRes.json(),
        ]);

        const all = [
          ...(diabetesJson.success ? diabetesJson.data : []),
          ...(obesityJson.success ? obesityJson.data : []),
        ];
        setTemplates(all);
      } catch {
        // Silent fail
      } finally {
        setLoading(false);
      }
    }

    fetchTemplates();
  }, []);

  const questionTypeIcon = (type: string) => {
    switch (type) {
      case "yes_no": return "✅";
      case "choice": return "🔘";
      case "multi_choice": return "☑️";
      case "number": return "🔢";
      case "text": return "📝";
      case "scale": return "📊";
      default: return "•";
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-800 text-gray-900 mb-5">Tracking Templates</h1>

      <div className="space-y-4">
        {templates.map((template) => {
          const isExpanded = expanded === template.id;
          const conditionBadge =
            template.condition === "diabetes" ? "badge-diabetes" : "badge-obesity";

          return (
            <div key={template.id} className="card overflow-hidden">
              {/* Template header — clickable to expand */}
              <button
                onClick={() => setExpanded(isExpanded ? null : template.id)}
                className="w-full p-5 flex items-center gap-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-700 text-gray-900">
                      {template.name}
                    </span>
                    <span className={conditionBadge}>
                      {template.condition === "diabetes" ? "Diabetes" : "Obesity"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {template.questions.length} questions
                  </p>
                </div>
                <span className="text-gray-400 text-sm">
                  {isExpanded ? "▲" : "▼"}
                </span>
              </button>

              {/* Expanded: question list */}
              {isExpanded && (
                <div className="px-5 pb-5 border-t border-gray-100">
                  <p className="text-xs font-600 text-gray-400 uppercase tracking-wide mt-4 mb-3">
                    Questions
                  </p>
                  <div className="space-y-2">
                    {template.questions
                      .sort((a, b) => a.order - b.order)
                      .map((q) => (
                        <div
                          key={q.key}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <span className="text-lg">
                            {questionTypeIcon(q.type)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-500 text-gray-700 truncate">
                              {q.label}
                            </p>
                            <p className="text-xs text-gray-400">
                              {q.type.replace("_", " ")}
                              {q.unit ? ` (${q.unit})` : ""}
                              {q.options ? ` — ${q.options.join(", ")}` : ""}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
