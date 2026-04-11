"use client";

import { useState } from "react";
import type { Patient, DoctorPatient, TrackingTemplate } from "@/lib/db/types";

export function ProfileCard({
  patient,
  doctorPatient,
  template,
}: {
  patient: Patient;
  doctorPatient: DoctorPatient;
  template: TrackingTemplate;
}) {
  const [copied, setCopied] = useState(false);

  const initials = patient.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const createdDate = new Date(doctorPatient.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const copyLink = () => {
    const magicLink = `${window.location.origin}/p/${doctorPatient.magicToken}`;
    navigator.clipboard.writeText(magicLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl bg-white p-5">
      {/* Avatar + Name */}
      <div className="flex flex-col items-center">
        <div className="flex size-24 items-center justify-center rounded-full border-[3px] border-primary bg-primary-light">
          <span className="text-3xl font-bold text-primary">{initials}</span>
        </div>
        <h2 className="mt-3 text-2xl font-bold text-black tracking-tighter">{patient.name}</h2>
        <p className="mt-0.5 text-md text-dark-grey capitalize">
          {doctorPatient.condition} Patient
        </p>

        {/* Badges */}
        <div className="mt-3 flex items-center gap-2">
          <span className="rounded-sm bg-primary-light px-2.5 py-1 text-base font-medium text-primary-dark">
            PT-{patient.id.slice(-4).toUpperCase()}
          </span>
          <span className={`rounded-2xl px-2.5 py-1 text-base font-medium capitalize text-white ${
            doctorPatient.status === "inactive" ? "bg-red" : "bg-primary"
          }`}>
            {doctorPatient.status}
          </span>
        </div>
      </div>

      {/* Info Rows */}
      <div className="mt-5 flex flex-col gap-3 rounded-lg bg-surface py-3">
        <div className="flex items-baseline gap-3 px-3 text-md">
          <span className="w-24 shrink-0 text-dark-grey">Condition</span>
          <span className="font-medium capitalize text-black">{doctorPatient.condition}</span>
        </div>
        <div className="border-t border-border" />
        <div className="flex items-baseline gap-3 px-3 text-md">
          <span className="w-24 shrink-0 text-dark-grey">Member Since</span>
          <span className="font-medium text-black">{createdDate}</span>
        </div>
      </div>

      {/* Copy Magic Link */}
      <button
        onClick={copyLink}
        className={`mt-4 w-full rounded-md px-3 py-2.5 text-md font-medium transition-all text-center ${
          copied
            ? "bg-primary text-white"
            : "bg-primary-light text-primary-dark hover:bg-primary-hover"
        }`}
      >
        {copied ? "Copied to clipboard!" : "Copy Check-in Link"}
      </button>
    </div>
  );
}
