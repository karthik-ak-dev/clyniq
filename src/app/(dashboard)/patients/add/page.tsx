"use client";

import { AddPatientForm } from "@/components/forms/add-patient-form";
import { PageHeader } from "@/components/dashboard/page-header";

export default function AddPatientPage() {
  return (
    <div>
      <PageHeader title="Add Patient" />

      {/* Form card — 3D raised */}
      <div
        style={{
          paddingBottom: "2px",
          background: "linear-gradient(180deg, #d4cce4 0%, #cdc4de 100%)",
          borderRadius: "1rem",
          boxShadow: "0 8px 28px rgba(124,58,237,0.07), 0 2px 4px rgba(0,0,0,0.03)",
        }}
      >
        <div className="rounded-2xl overflow-hidden" style={{ background: "#f0ecfa" }}>
          <AddPatientForm />
        </div>
      </div>
    </div>
  );
}
