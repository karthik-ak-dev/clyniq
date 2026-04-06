"use client";

import { AddPatientForm } from "@/components/forms/add-patient-form";

export default function AddPatientPage() {
  return (
    <div>
      <h1 className="text-[1.35rem] mb-5" style={{ fontWeight: 600, color: "#2d2b3d" }}>Add Patient</h1>

      {/* Form card */}
      <div
        className="bg-white rounded-2xl"
        style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.03), 0 6px 24px rgba(124,58,237,0.03)" }}
      >
        <AddPatientForm />
      </div>
    </div>
  );
}
