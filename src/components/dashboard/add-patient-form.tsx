"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// ─── Types ───────────────────────────────────────────────
type FormData = {
  // Step 1
  name: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  // Step 2
  condition: string;
  notes: string;
  bloodType: string;
  allergies: string;
  currentMedications: string;
  preExistingConditions: string;
  // Step 3
  status: string;
};

type FieldErrors = Partial<Record<keyof FormData, string>>;

const INITIAL_DATA: FormData = {
  name: "",
  dateOfBirth: "",
  gender: "",
  phone: "",
  email: "",
  address: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  condition: "",
  notes: "",
  bloodType: "",
  allergies: "",
  currentMedications: "",
  preExistingConditions: "",
  status: "new",
};

const STEPS = [
  { number: 1, title: "Patient Information", description: "Personal details and contact information" },
  { number: 2, title: "Condition & Medical", description: "Condition setup and medical profile" },
  { number: 3, title: "Review & Confirm", description: "Review all details and finalize" },
];

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Prefer not to say" },
];

const BLOOD_TYPE_OPTIONS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

// ─── Validation ──────────────────────────────────────────
function validateStep1(data: FormData): FieldErrors {
  const errors: FieldErrors = {};
  if (!data.name.trim()) errors.name = "Full name is required";
  if (!data.phone.trim()) errors.phone = "Phone number is required";
  else if (!/^\d{10}$/.test(data.phone)) errors.phone = "Please enter a valid 10-digit mobile number";
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = "Invalid email address";
  if (data.emergencyContactPhone && !/^\d{10}$/.test(data.emergencyContactPhone))
    errors.emergencyContactPhone = "Please enter a valid 10-digit mobile number";
  return errors;
}

function validateStep2(data: FormData): FieldErrors {
  const errors: FieldErrors = {};
  if (!data.condition) errors.condition = "Please select a condition";
  return errors;
}

// ─── Sub-components ──────────────────────────────────────

function FormField({ label, error, required, children }: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-md font-medium text-black">
        {label}
        {required && <span className="text-red ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-base text-red">{error}</p>}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, error, type = "text", prefix }: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  type?: string;
  prefix?: string;
}) {
  return (
    <div className={`flex items-center rounded-lg transition-colors ${error ? "bg-red-subtle ring-1 ring-red" : "bg-surface focus-within:ring-1 focus-within:ring-primary"}`}>
      {prefix && (
        <span className="flex items-center border-r border-border px-3 text-md text-dark-grey">{prefix}</span>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 flex-1 bg-transparent px-3 text-md font-normal text-black placeholder:text-dark-grey outline-none"
      />
    </div>
  );
}

function TextArea({ value, onChange, placeholder, rows = 3 }: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full rounded-lg bg-surface px-3 py-3 text-md font-normal text-black placeholder:text-dark-grey outline-none transition-colors focus:ring-1 focus:ring-primary"
    />
  );
}

function RadioGroup({ value, onChange, options }: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const cols = options.length <= 2 ? "grid-cols-2" : "grid-cols-3";
  return (
    <div className={`grid ${cols} gap-3`}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex cursor-pointer items-center justify-between rounded-lg px-4 py-3 text-md transition-colors ${
            value === opt.value
              ? "bg-primary-subtle ring-1 ring-primary text-black"
              : "bg-surface text-black hover:bg-border/50"
          }`}
        >
          <span>{opt.label}</span>
          <span className={`flex size-5 items-center justify-center rounded-full border-2 transition-colors ${
            value === opt.value ? "border-primary" : "border-border"
          }`}>
            {value === opt.value && <span className="size-2.5 rounded-full bg-primary" />}
          </span>
        </button>
      ))}
    </div>
  );
}

function SelectInput({ value, onChange, options, placeholder, error }: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  error?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`h-11 w-full cursor-pointer appearance-none rounded-lg px-3 pr-8 text-md font-normal text-black outline-none transition-colors bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22m3%204.5%203%203%203-3%22%20stroke%3D%22%23292929%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_10px_center] bg-no-repeat ${
        error ? "bg-red-subtle ring-1 ring-red" : "bg-surface focus:ring-1 focus:ring-primary"
      }`}
    >
      <option value="">{placeholder || "Select..."}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  );
}

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex flex-col gap-0">
      {STEPS.map((step, i) => {
        const isActive = step.number === currentStep;
        const isCompleted = step.number < currentStep;
        const isLast = i === STEPS.length - 1;

        return (
          <div key={step.number} className="flex gap-3">
            {/* Circle + Line */}
            <div className="flex flex-col items-center">
              <div className={`flex size-8 shrink-0 items-center justify-center rounded-full text-md font-bold transition-colors ${
                isActive ? "bg-primary text-white" :
                isCompleted ? "bg-primary text-white" :
                "bg-border text-dark-grey"
              }`}>
                {isCompleted ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M11.667 3.5L5.25 9.917 2.333 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : step.number}
              </div>
              {!isLast && (
                <div className={`w-0.5 flex-1 min-h-8 ${isCompleted ? "bg-primary" : "bg-border"}`} />
              )}
            </div>

            {/* Title + Description */}
            <div className="pb-8">
              <p className={`text-lg font-bold leading-tight ${isActive || isCompleted ? "text-black" : "text-dark-grey"}`}>
                {step.title}
              </p>
              <p className="mt-0.5 text-base text-dark-grey leading-normal">
                {step.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Step Content ────────────────────────────────────────

function Step1Content({ data, errors, onChange }: {
  data: FormData;
  errors: FieldErrors;
  onChange: (field: keyof FormData, value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-8">
      {/* Personal Info */}
      <div>
        <h3 className="text-2xl font-bold text-black tracking-tighter">Personal Info</h3>
        <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
          <FormField label="Full Name" required error={errors.name}>
            <TextInput value={data.name} onChange={(v) => onChange("name", v)} placeholder="e.g. Ravi Kumar" error={errors.name} />
          </FormField>
          <FormField label="Date of Birth">
            <div className="relative">
              <input
                type="date"
                value={data.dateOfBirth}
                onChange={(e) => onChange("dateOfBirth", e.target.value)}
                className="h-11 w-full rounded-lg bg-surface px-3 text-md font-normal text-black outline-none transition-colors focus:ring-1 focus:ring-primary [&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              />
            </div>
          </FormField>
        </div>
        <div className="mt-5">
          <FormField label="Gender">
            <RadioGroup value={data.gender} onChange={(v) => onChange("gender", v)} options={GENDER_OPTIONS} />
          </FormField>
        </div>
      </div>

      {/* Contact Info */}
      <div>
        <h3 className="text-2xl font-bold text-black tracking-tighter">Contact Info</h3>
        <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
          <FormField label="Phone Number" required error={errors.phone}>
            <TextInput value={data.phone} onChange={(v) => onChange("phone", v)} placeholder="Enter 10-digit mobile number" prefix="+91" error={errors.phone} />
          </FormField>
          <FormField label="Email Address" error={errors.email}>
            <TextInput type="email" value={data.email} onChange={(v) => onChange("email", v)} placeholder="patient@email.com" error={errors.email} />
          </FormField>
        </div>
        <div className="mt-5">
          <FormField label="Address">
            <TextArea value={data.address} onChange={(v) => onChange("address", v)} placeholder="e.g. 123 Baker Street, Mumbai 400001" rows={2} />
          </FormField>
        </div>
      </div>

      {/* Emergency Contact */}
      <div>
        <h3 className="text-2xl font-bold text-black tracking-tighter">Emergency Contact</h3>
        <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
          <FormField label="Name">
            <TextInput value={data.emergencyContactName} onChange={(v) => onChange("emergencyContactName", v)} placeholder="e.g. Priya Kumar" />
          </FormField>
          <FormField label="Phone Number" error={errors.emergencyContactPhone}>
            <TextInput value={data.emergencyContactPhone} onChange={(v) => onChange("emergencyContactPhone", v)} placeholder="Enter 10-digit mobile number" prefix="+91" error={errors.emergencyContactPhone} />
          </FormField>
        </div>
      </div>
    </div>
  );
}

function Step2Content({ data, errors, onChange }: {
  data: FormData;
  errors: FieldErrors;
  onChange: (field: keyof FormData, value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-8">
      {/* Condition Setup */}
      <div>
        <h3 className="text-2xl font-bold text-black tracking-tighter">Condition Setup</h3>
        <p className="mt-1 text-md text-dark-grey">Select the chronic condition to track for this patient.</p>
        <div className="mt-4">
          <FormField label="Condition" required error={errors.condition}>
            <RadioGroup
              value={data.condition}
              onChange={(v) => onChange("condition", v)}
              options={[
                { value: "diabetes", label: "Diabetes" },
                { value: "obesity", label: "Obesity" },
              ]}
            />
          </FormField>
        </div>
        <div className="mt-5">
          <FormField label="Doctor Notes">
            <TextArea value={data.notes} onChange={(v) => onChange("notes", v)} placeholder="Any notes about this patient's condition, treatment plan, or special considerations..." rows={3} />
          </FormField>
        </div>
      </div>

      {/* Medical Profile */}
      <div>
        <h3 className="text-2xl font-bold text-black tracking-tighter">Medical Profile</h3>
        <p className="mt-1 text-md text-dark-grey">Optional medical information for better context.</p>
        <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
          <FormField label="Blood Type">
            <SelectInput value={data.bloodType} onChange={(v) => onChange("bloodType", v)} options={BLOOD_TYPE_OPTIONS} placeholder="Select blood type" />
          </FormField>
          <FormField label="Known Allergies">
            <TextInput value={data.allergies} onChange={(v) => onChange("allergies", v)} placeholder="e.g. Penicillin, Peanuts" />
          </FormField>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
          <FormField label="Current Medications">
            <TextArea value={data.currentMedications} onChange={(v) => onChange("currentMedications", v)} placeholder="e.g. Metformin 500mg, Insulin" rows={2} />
          </FormField>
          <FormField label="Pre-existing Conditions">
            <TextArea value={data.preExistingConditions} onChange={(v) => onChange("preExistingConditions", v)} placeholder="e.g. Hypertension, Thyroid" rows={2} />
          </FormField>
        </div>
      </div>
    </div>
  );
}

function Step3Content({ data, onChange }: { data: FormData; onChange: (field: keyof FormData, value: string) => void }) {
  const sections = [
    {
      title: "Patient Information",
      rows: [
        { label: "Full Name", value: data.name },
        { label: "Date of Birth", value: data.dateOfBirth || "—" },
        { label: "Gender", value: data.gender ? data.gender.charAt(0).toUpperCase() + data.gender.slice(1) : "—" },
        { label: "Phone", value: data.phone },
        { label: "Email", value: data.email || "—" },
        { label: "Address", value: data.address || "—" },
      ],
    },
    {
      title: "Emergency Contact",
      rows: [
        { label: "Name", value: data.emergencyContactName || "—" },
        { label: "Phone", value: data.emergencyContactPhone || "—" },
      ],
    },
    {
      title: "Condition & Medical",
      rows: [
        { label: "Condition", value: data.condition ? data.condition.charAt(0).toUpperCase() + data.condition.slice(1) : "—" },
        { label: "Blood Type", value: data.bloodType || "—" },
        { label: "Allergies", value: data.allergies || "—" },
        { label: "Medications", value: data.currentMedications || "—" },
        { label: "Pre-existing", value: data.preExistingConditions || "—" },
        { label: "Notes", value: data.notes || "—" },
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-2xl font-bold text-black tracking-tighter">Review Details</h3>
        <p className="mt-1 text-md text-dark-grey">Please review all the information before submitting.</p>
      </div>

      {sections.map((section) => (
        <div key={section.title} className="rounded-lg bg-surface p-4">
          <h4 className="text-md font-bold text-black mb-3">{section.title}</h4>
          <div className="flex flex-col gap-2">
            {section.rows.map((row) => (
              <div key={row.label} className="flex items-baseline gap-3 text-md">
                <span className="w-28 shrink-0 text-dark-grey">{row.label}</span>
                <span className="font-medium text-black">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Status */}
      <div className="rounded-lg bg-surface p-4">
        <h4 className="text-md font-bold text-black mb-3">Settings</h4>
        <button
          type="button"
          onClick={() => onChange("status", data.status === "active" ? "new" : "active")}
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <span className={`flex size-5 items-center justify-center rounded-md border-2 transition-colors ${
            data.status === "active" ? "border-primary bg-primary" : "border-border"
          }`}>
            {data.status === "active" && (
              <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                <path d="M11.667 3.5L5.25 9.917 2.333 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </span>
          <span className="text-md text-black">Set as Active Patient</span>
        </button>
      </div>
    </div>
  );
}

// ─── Main Form ───────────────────────────────────────────

export function AddPatientForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<FormData>(INITIAL_DATA);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const onChange = (field: keyof FormData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleNext = () => {
    let stepErrors: FieldErrors = {};
    if (currentStep === 1) stepErrors = validateStep1(data);
    if (currentStep === 2) stepErrors = validateStep2(data);

    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    setErrors({});
    setCurrentStep((s) => Math.min(s + 1, 3));
  };

  const handlePrevious = () => {
    setCurrentStep((s) => Math.max(s - 1, 1));
  };

  const handleDiscard = () => {
    router.push("/patients");
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError("");

    try {
      const body: Record<string, unknown> = {
        name: data.name,
        phone: `+91${data.phone}`,
        condition: data.condition,
        status: data.status || "new",
      };

      // Only send non-empty optional fields
      if (data.dateOfBirth) body.dateOfBirth = data.dateOfBirth;
      if (data.gender) body.gender = data.gender;
      if (data.email) body.email = data.email;
      if (data.address) body.address = data.address;
      if (data.emergencyContactName) body.emergencyContactName = data.emergencyContactName;
      if (data.emergencyContactPhone) body.emergencyContactPhone = `+91${data.emergencyContactPhone}`;
      if (data.bloodType) body.bloodType = data.bloodType;
      if (data.allergies) body.allergies = data.allergies;
      if (data.currentMedications) body.currentMedications = data.currentMedications;
      if (data.preExistingConditions) body.preExistingConditions = data.preExistingConditions;
      if (data.notes) body.notes = data.notes;

      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await res.json();

      if (!res.ok) {
        setSubmitError(result.error || "Failed to create patient");
        return;
      }

      router.push("/patients");
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Mobile: Title + Step progress bar */}
      <div className="mb-2 lg:hidden">
        <h2 className="text-3xl font-bold text-black tracking-tight">Register New Patient</h2>
        <p className="mt-1 text-md text-dark-grey leading-normal">
          Enter all required patient details to create a new compliance tracking record.
        </p>
      </div>
      <div className="mb-4 flex items-center gap-2 lg:hidden">
        <span className="text-base text-dark-grey">Step {currentStep}/3</span>
        <div className="flex flex-1 gap-1.5">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                step.number <= currentStep ? "bg-primary" : "bg-border"
              }`}
            />
          ))}
        </div>
      </div>

      {/* ─── Single Card: (Title + Stepper) | Form ──────── */}
      <div className="rounded-xl bg-white">
        <div className="flex flex-col lg:flex-row">

          {/* Left: Title + Stepper (desktop) — inside card */}
          <div className="hidden w-65 shrink-0 border-r border-border p-6 lg:flex lg:flex-col">
            <h2 className="text-3xl font-bold text-black tracking-tight">Register New Patient</h2>
            <p className="mt-1.5 text-md text-dark-grey leading-normal">
              Enter all required patient details to create a new compliance tracking record.
            </p>
            <div className="mt-16">
              <StepIndicator currentStep={currentStep} />
            </div>
          </div>

          {/* Right: Form content — inside card */}
          <div className="min-w-0 flex-1 p-6">
            {/* Step header */}
            <div className="mb-6">
              <p className="text-base text-primary font-medium">Step {currentStep}/3</p>
              <h3 className="text-2xl font-bold text-black tracking-tighter mt-1">
                {STEPS[currentStep - 1].title}
              </h3>
              <p className="mt-1 text-md text-dark-grey">{STEPS[currentStep - 1].description}</p>
            </div>

            <div className="border-t border-border pt-6">
              {currentStep === 1 && <Step1Content data={data} errors={errors} onChange={onChange} />}
              {currentStep === 2 && <Step2Content data={data} errors={errors} onChange={onChange} />}
              {currentStep === 3 && <Step3Content data={data} onChange={onChange} />}
            </div>

            {/* Submit error */}
            {submitError && (
              <div className="mt-4 rounded-md bg-red-subtle p-3 text-md text-red">{submitError}</div>
            )}

            {/* Action buttons — inside the card, at the bottom */}
            <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
              <div className="flex items-center gap-4">
                {currentStep > 1 && (
                  <button
                    onClick={handlePrevious}
                    className="h-10 rounded-md border border-border bg-white px-5 text-md font-medium text-black transition-colors hover:bg-surface"
                  >
                    Previous
                  </button>
                )}
                <button
                  onClick={handleDiscard}
                  className="text-md font-medium text-black hover:text-primary-dark transition-colors"
                >
                  Discard
                </button>
              </div>

              <div>
                {currentStep < 3 ? (
                  <button
                    onClick={handleNext}
                    className="h-10 rounded-md bg-primary px-6 text-md font-medium text-white transition-colors hover:bg-primary-dark"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="h-10 rounded-md bg-primary px-6 text-md font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
                  >
                    {submitting ? "Creating..." : "Submit"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
