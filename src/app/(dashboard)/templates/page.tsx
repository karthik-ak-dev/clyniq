"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { apiFetch } from "@/lib/api-client";
import type { TemplateQuestion } from "@/lib/db/types";

type Template = {
  id: string;
  condition: string;
  name: string;
  questions: TemplateQuestion[];
  isDefault: boolean;
};

// Question type labels + icons
const QUESTION_META: Record<string, { label: string; color: string }> = {
  yes_no: { label: "Y/N Question", color: "#7c3aed" },
  choice: { label: "Choice", color: "#7c3aed" },
  multi_choice: { label: "Multiple Choice", color: "#7c3aed" },
  number: { label: "Input", color: "#7c3aed" },
  text: { label: "Text Input", color: "#7c3aed" },
  scale: { label: "Scale", color: "#7c3aed" },
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
        const all = [...(d || []), ...(o || [])];
        setTemplates(all);
        if (all.length > 0) setExpanded(all[0].id);
      } catch { /* silent */ }
      finally { setLoading(false); }
    }
    fetchTemplates();
  }, []);

  return (
    <div>
      <PageHeader title="Check-in Templates" />

      {/* Main card — 3D raised */}
      <div
        style={{
          paddingBottom: "2px",
          background: "linear-gradient(180deg, #d4cce4 0%, #cdc4de 100%)",
          borderRadius: "1rem",
          boxShadow: "0 8px 28px rgba(124,58,237,0.07), 0 2px 4px rgba(0,0,0,0.03)",
        }}
      >
        <div className="rounded-2xl overflow-hidden" style={{ background: "#f0ecfa" }}>

          {loading ? (
            <div className="text-center py-24" style={{ color: "#8e8aa0", fontWeight: 400 }}>
              <p className="text-[0.92rem]">Loading templates...</p>
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-20 px-8">
              <p className="text-[0.95rem] mb-1.5" style={{ fontWeight: 600, color: "#2d2b3d" }}>No templates found</p>
              <p className="text-[0.82rem]" style={{ fontWeight: 400, color: "#8e8aa0" }}>Run the seed script to create default templates</p>
            </div>
          ) : (
            <div>
              {/* Template tabs */}
              <div className="flex gap-2 px-5 pt-4 pb-3">
                {templates.map((t) => {
                  const isActive = expanded === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setExpanded(t.id)}
                      className="transition-all"
                    >
                      {isActive ? (
                        <div style={{
                          padding: "1px 1px 3px 1px",
                          background: "linear-gradient(180deg, #9061d9, #7c3aed)",
                          borderRadius: "0.75rem",
                          boxShadow: "0 2px 8px rgba(124,58,237,0.2)",
                        }}>
                          <div
                            className="px-4 py-2 rounded-xl text-[0.84rem]"
                            style={{ fontWeight: 600, color: "white", background: "linear-gradient(135deg, #a78bfa, #8b5cf6)" }}
                          >
                            {t.condition === "diabetes" ? "Diabetes" : "Obesity"}
                          </div>
                        </div>
                      ) : (
                        <div style={{
                          padding: "1px 1px 3px 1px",
                          background: "linear-gradient(180deg, #cdc4de, #c2b8d6)",
                          borderRadius: "0.75rem",
                        }}>
                          <div
                            className="px-4 py-2 rounded-xl text-[0.84rem]"
                            style={{ fontWeight: 500, color: "#5a5773", background: "#f6f3fc" }}
                          >
                            {t.condition === "diabetes" ? "Diabetes" : "Obesity"}
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Active template content */}
              {templates.filter((t) => t.id === expanded).map((template) => (
                <div key={template.id} className="px-5 pb-4">
                  {/* Template info */}
                  <div className="flex items-start justify-between mb-4 px-1">
                    <div>
                      <div className="flex items-center gap-2.5 mb-1">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="1.5" width="14" height="15" rx="2" />
                          <line x1="5.5" y1="6" x2="12.5" y2="6" />
                          <line x1="5.5" y1="9.5" x2="12.5" y2="9.5" />
                          <line x1="5.5" y1="13" x2="9.5" y2="13" />
                        </svg>
                        <h2 className="text-[1rem]" style={{ fontWeight: 600, color: "#2d2b3d" }}>{template.name}</h2>
                      </div>
                      <p className="text-[0.82rem] pl-7" style={{ fontWeight: 400, color: "#8e8aa0" }}>
                        {template.condition === "diabetes"
                          ? "Daily tracking questions for diabetes patients — medication, diet, activity, and vitals."
                          : "Daily tracking questions for obesity patients — diet, exercise, weight, and lifestyle."}
                      </p>
                    </div>
                    {/* Three-dot menu placeholder */}
                    <button
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all hover:bg-[#ece7f8]"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="#8e8aa0">
                        <circle cx="3" cy="8" r="1.5" />
                        <circle cx="8" cy="8" r="1.5" />
                        <circle cx="13" cy="8" r="1.5" />
                      </svg>
                    </button>
                  </div>

                  {/* Questions list — 3D raised container */}
                  <div
                    style={{
                      padding: "1px 1px 3px 1px",
                      background: "linear-gradient(180deg, #cdc4de, #c2b8d6)",
                      borderRadius: "0.75rem",
                      boxShadow: "0 3px 10px rgba(124,58,237,0.06)",
                    }}
                  >
                    <div className="rounded-xl overflow-hidden" style={{ background: "#f6f3fc" }}>
                      {template.questions.sort((a, b) => a.order - b.order).map((q, idx) => (
                        <div
                          key={q.key}
                          className="flex items-center gap-3.5 px-5 py-3.5"
                          style={{ borderBottom: idx < template.questions.length - 1 ? "1px solid #ece7f8" : "none" }}
                        >
                          {/* Check icon */}
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                            style={{ background: "rgba(124,58,237,0.1)" }}
                          >
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M2.5 6.5l2.5 2.5 4.5-5" />
                            </svg>
                          </div>

                          {/* Question label + options preview */}
                          <div className="flex-1 min-w-0">
                            <p className="text-[0.84rem] truncate" style={{ fontWeight: 500, color: "#2d2b3d" }}>
                              {q.label}
                            </p>
                            {q.options && (
                              <div className="flex gap-1.5 mt-1 flex-wrap">
                                {q.options.slice(0, 4).map((opt) => (
                                  <span
                                    key={opt}
                                    className="px-2 py-0.5 rounded-md text-[0.7rem]"
                                    style={{ fontWeight: 500, color: "#7c3aed", background: "#ede9f8" }}
                                  >
                                    {opt}
                                  </span>
                                ))}
                                {q.options.length > 4 && (
                                  <span className="text-[0.7rem]" style={{ fontWeight: 400, color: "#8e8aa0" }}>
                                    +{q.options.length - 4} more
                                  </span>
                                )}
                              </div>
                            )}
                            {q.unit && (
                              <span className="text-[0.72rem] mt-0.5 block" style={{ fontWeight: 400, color: "#8e8aa0" }}>
                                Unit: {q.unit}
                              </span>
                            )}
                          </div>

                          {/* Type badge */}
                          <span
                            className="shrink-0 text-[0.72rem] px-2.5 py-1 rounded-lg"
                            style={{
                              fontWeight: 500,
                              color: "#8e8aa0",
                              background: "#ede9f8",
                            }}
                          >
                            {QUESTION_META[q.type]?.label || q.type}
                          </span>

                          {/* Toggle — visual only in MVP */}
                          <div
                            className="w-10 h-6 rounded-full shrink-0 flex items-center px-0.5"
                            style={{ background: "linear-gradient(135deg, #a78bfa, #8b5cf6)", boxShadow: "0 2px 4px rgba(124,58,237,0.2)" }}
                          >
                            <div
                              className="w-5 h-5 rounded-full ml-auto"
                              style={{ background: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer stats */}
                  <div className="flex items-center gap-4 mt-3 px-1">
                    <span className="text-[0.78rem]" style={{ fontWeight: 500, color: "#8e8aa0" }}>
                      {template.questions.length} Default Questions
                    </span>
                    <span className="text-[0.78rem]" style={{ fontWeight: 500, color: "#8e8aa0" }}>
                      {template.questions.filter((q) => q.type === "yes_no" || q.type === "choice").length} Scored
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
