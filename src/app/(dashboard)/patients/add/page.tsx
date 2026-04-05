"use client";

import { useRouter } from "next/navigation";
import { AddPatientForm } from "@/components/forms/add-patient-form";

// ─── Add Patient Page ──────────────────────────────────────
// Matched to design/doc_flow/add_patient.png:
//   - Back button, title, subtitle
//   - Form: name, phone, condition, create button

export default function AddPatientPage() {
  const router = useRouter();

  return (
    <div className="max-w-lg mx-auto">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="text-sm text-[#7c3aed] font-600 mb-4 flex items-center gap-1"
      >
        ← Back
      </button>

      {/* Header */}
      <h1 className="text-2xl font-800 text-gray-900">Add New Patient</h1>
      <p className="text-sm text-gray-500 mt-1 mb-6">
        Fill in the details to start tracking
      </p>

      {/* Form */}
      <AddPatientForm />
    </div>
  );
}
