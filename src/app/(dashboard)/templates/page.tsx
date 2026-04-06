"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api-client";
import type { TemplateQuestion } from "@/lib/db/types";

// ─── Templates Page ────────────────────────────────────────
// Polished read-only template list with layered cards.

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
        const [d, o] = await Promise.all([
          apiFetch<Template[]>("/api/templates?condition=diabetes"),
          apiFetch<Template[]>("/api/templates?condition=obesity"),
        ]);
        setTemplates([...(d || []), ...(o || [])]);
      } catch { /* silent */ }
      finally { setLoading(false); }
    }
    fetchTemplates();
  }, []);

  const typeIcon: Record<string, string> = {
    yes_no: "✅", choice: "🔘", multi_choice: "☑️",
    number: "🔢", text: "📝", scale: "📊",
  };

  if (loading) return <div className="text-center py-16 text-gray-400 font-500">Loading...</div>;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-800 text-gray-900 mb-1">Tracking Templates</h1>
      <p className="text-[0.875rem] text-gray-400 font-500 mb-6">Default question sets for each condition</p>

      <div className="space-y-4">
        {templates.map((template) => {
          const isExpanded = expanded === template.id;
          const condStyle = template.condition === "diabetes"
            ? { bg: "#f5f3ff", text: "#7c3aed", border: "#ddd6fe" }
            : { bg: "#fdf2f8", text: "#db2777", border: "#fbcfe8" };

          return (
            <div
              key={template.id}
              className="bg-white rounded-2xl overflow-hidden"
              style={{
                boxShadow: "0 2px 0 rgba(139,92,246,0.06), 0 4px 16px rgba(0,0,0,0.04)",
                border: "1px solid rgba(139,92,246,0.06)",
              }}
            >
              <button
                onClick={() => setExpanded(isExpanded ? null : template.id)}
                className="w-full px-6 py-5 flex items-center gap-4 text-left hover:bg-gray-50/50 transition-colors"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: condStyle.bg }}
                >
                  <span className="text-lg">📋</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-700 text-gray-900">{template.name}</span>
                    <span
                      className="px-2.5 py-0.5 rounded-lg text-[0.7rem] font-700"
                      style={{ background: condStyle.bg, color: condStyle.text, border: `1px solid ${condStyle.border}` }}
                    >
                      {template.condition === "diabetes" ? "Diabetes" : "Obesity"}
                    </span>
                  </div>
                  <p className="text-[0.825rem] text-gray-400 font-500 mt-0.5">
                    {template.questions.length} questions
                  </p>
                </div>
                <span className="text-gray-400 text-sm transition-transform" style={{ transform: isExpanded ? "rotate(180deg)" : "none" }}>
                  ▼
                </span>
              </button>

              {isExpanded && (
                <div className="px-6 pb-6" style={{ borderTop: "1px solid rgba(139,92,246,0.06)" }}>
                  <p className="text-[0.7rem] font-700 text-gray-400 uppercase tracking-wider mt-4 mb-3">Questions</p>
                  <div className="space-y-2">
                    {template.questions.sort((a, b) => a.order - b.order).map((q) => (
                      <div
                        key={q.key}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl"
                        style={{ background: "#faf5ff", border: "1px solid rgba(139,92,246,0.06)" }}
                      >
                        <span className="text-base">{typeIcon[q.type] || "•"}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[0.875rem] font-600 text-gray-700 truncate">{q.label}</p>
                          <p className="text-[0.75rem] text-gray-400 font-500">
                            {q.type.replace("_", " ")}{q.unit ? ` · ${q.unit}` : ""}{q.options ? ` · ${q.options.join(", ")}` : ""}
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
