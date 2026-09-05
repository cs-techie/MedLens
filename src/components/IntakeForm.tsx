"use client";

import React, { useState } from "react";
import { PatientProfile, ProvenanceField } from "@/types/medlens";
import { UserCheck, Plus, X, Tag, Clock, CheckCircle2 } from "lucide-react";

interface IntakeFormProps {
  initialProfile: PatientProfile;
  onSaveProfile: (updatedProfile: PatientProfile) => void;
}

export const IntakeForm: React.FC<IntakeFormProps> = ({
  initialProfile,
  onSaveProfile,
}) => {
  const [profile, setProfile] = useState<PatientProfile>(initialProfile);
  const [symptomInput, setSymptomInput] = useState("");
  const [allergyInput, setAllergyInput] = useState("");
  const [conditionInput, setConditionInput] = useState("");
  const [medicationInput, setMedicationInput] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const createProvenanceField = <T,>(value: T): ProvenanceField<T> => ({
    value,
    source: "user",
    confidence: 100,
    timestamp: new Date().toISOString(),
  });

  const handleTextChange = (field: keyof PatientProfile, val: string | number | null) => {
    setProfile((prev) => ({
      ...prev,
      [field]: createProvenanceField(val),
    }));
  };

  const handleAddChip = (
    field: "symptoms" | "allergies" | "conditions" | "medications",
    inputValue: string,
    setInputValue: (v: string) => void
  ) => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    setProfile((prev) => ({
      ...prev,
      [field]: [...prev[field], createProvenanceField(trimmed)],
    }));
    setInputValue("");
  };

  const handleRemoveChip = (
    field: "symptoms" | "allergies" | "conditions" | "medications",
    index: number
  ) => {
    setProfile((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(profile);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 md:p-8 shadow-md space-y-6">
      {/* Form Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#0EA5E9]" aria-hidden="true" />
              Patient Information Intake (FR1)
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-[#0EA5E9] border border-sky-200 flex items-center gap-1">
              <Tag className="w-3 h-3" aria-hidden="true" /> Source: User-Entered
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Capture self-reported medical history, current symptoms, and medications. Every field is versioned and tagged with 100% confidence user provenance.
          </p>
        </div>
        {savedSuccess && (
          <div role="status" className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-[#22C55E] border border-emerald-200 text-sm font-bold animate-pulse">
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> Intake Saved
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Demographics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="patient-full-name" className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center justify-between">
              Full Name
              <span className="text-[10px] text-sky-600 font-mono">user (100%)</span>
            </label>
            <input
              id="patient-full-name"
              type="text"
              required
              aria-required="true"
              value={profile.name.value}
              onChange={(e) => handleTextChange("name", e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-gray-900 text-sm focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none transition"
              placeholder="e.g. Alex Taylor"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="patient-age" className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center justify-between">
              Age
              <span className="text-[10px] text-sky-600 font-mono">user (100%)</span>
            </label>
            <input
              id="patient-age"
              type="number"
              min="0"
              max="120"
              value={profile.age.value ?? ""}
              onChange={(e) => handleTextChange("age", e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-gray-900 text-sm focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none transition"
              placeholder="e.g. 42"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2 md:col-span-1">
            <label htmlFor="patient-sex" className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center justify-between">
              Biological Sex
              <span className="text-[10px] text-sky-600 font-mono">user (100%)</span>
            </label>
            <select
              id="patient-sex"
              value={profile.sex.value}
              onChange={(e) => handleTextChange("sex", e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-gray-900 text-sm focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none transition"
            >
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Dynamic Chip Inputs: Symptoms & Conditions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Symptoms */}
          <div className="space-y-2">
            <label htmlFor="symptoms-input" className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center justify-between">
              Current Symptoms
              <span className="text-[10px] text-sky-600 font-mono">user (100%)</span>
            </label>
            <div className="flex gap-2">
              <input
                id="symptoms-input"
                type="text"
                value={symptomInput}
                onChange={(e) => setSymptomInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddChip("symptoms", symptomInput, setSymptomInput);
                  }
                }}
                className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-gray-900 text-sm focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none"
                placeholder="Add symptom (e.g. Fatigue)..."
              />
              <button
                type="button"
                aria-label="Add symptom"
                onClick={() => handleAddChip("symptoms", symptomInput, setSymptomInput)}
                className="px-3.5 py-2 bg-sky-50 hover:bg-sky-100 text-[#0EA5E9] border border-sky-200 rounded-xl text-sm font-bold transition flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none min-h-[40px]"
              >
                <Plus className="w-4 h-4" aria-hidden="true" /> Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 pt-1 min-h-[38px] p-2 bg-slate-50 rounded-xl border border-slate-200">
              {profile.symptoms.length === 0 ? (
                <span className="text-xs text-slate-400 italic p-1">No symptoms listed</span>
              ) : (
                profile.symptoms.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-100 text-sky-900 border border-sky-300 rounded-lg text-xs font-semibold"
                  >
                    <span>{item.value}</span>
                    <button
                      type="button"
                      aria-label={`Remove symptom ${item.value}`}
                      onClick={() => handleRemoveChip("symptoms", idx)}
                      className="hover:text-red-600 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none rounded transition"
                    >
                      <X className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Conditions */}
          <div className="space-y-2">
            <label htmlFor="conditions-input" className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center justify-between">
              Existing Conditions
              <span className="text-[10px] text-sky-600 font-mono">user (100%)</span>
            </label>
            <div className="flex gap-2">
              <input
                id="conditions-input"
                type="text"
                value={conditionInput}
                onChange={(e) => setConditionInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddChip("conditions", conditionInput, setConditionInput);
                  }
                }}
                className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-gray-900 text-sm focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none"
                placeholder="Add condition (e.g. Hypothyroidism)..."
              />
              <button
                type="button"
                aria-label="Add condition"
                onClick={() => handleAddChip("conditions", conditionInput, setConditionInput)}
                className="px-3.5 py-2 bg-sky-50 hover:bg-sky-100 text-[#0EA5E9] border border-sky-200 rounded-xl text-sm font-bold transition flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none min-h-[40px]"
              >
                <Plus className="w-4 h-4" aria-hidden="true" /> Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 pt-1 min-h-[38px] p-2 bg-slate-50 rounded-xl border border-slate-200">
              {profile.conditions.length === 0 ? (
                <span className="text-xs text-slate-400 italic p-1">No conditions listed</span>
              ) : (
                profile.conditions.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-100 text-teal-900 border border-teal-300 rounded-lg text-xs font-semibold"
                  >
                    <span>{item.value}</span>
                    <button
                      type="button"
                      aria-label={`Remove condition ${item.value}`}
                      onClick={() => handleRemoveChip("conditions", idx)}
                      className="hover:text-red-600 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none rounded transition"
                    >
                      <X className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Chip Inputs: Allergies & Medications */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Allergies */}
          <div className="space-y-2">
            <label htmlFor="allergies-input" className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center justify-between">
              Known Allergies
              <span className="text-[10px] text-sky-600 font-mono">user (100%)</span>
            </label>
            <div className="flex gap-2">
              <input
                id="allergies-input"
                type="text"
                value={allergyInput}
                onChange={(e) => setAllergyInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddChip("allergies", allergyInput, setAllergyInput);
                  }
                }}
                className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-gray-900 text-sm focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none"
                placeholder="Add allergy (e.g. Penicillin)..."
              />
              <button
                type="button"
                aria-label="Add allergy"
                onClick={() => handleAddChip("allergies", allergyInput, setAllergyInput)}
                className="px-3.5 py-2 bg-sky-50 hover:bg-sky-100 text-[#0EA5E9] border border-sky-200 rounded-xl text-sm font-bold transition flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none min-h-[40px]"
              >
                <Plus className="w-4 h-4" aria-hidden="true" /> Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 pt-1 min-h-[38px] p-2 bg-slate-50 rounded-xl border border-slate-200">
              {profile.allergies.length === 0 ? (
                <span className="text-xs text-slate-400 italic p-1">No allergies listed</span>
              ) : (
                profile.allergies.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-900 border border-red-300 rounded-lg text-xs font-semibold"
                  >
                    <span>{item.value}</span>
                    <button
                      type="button"
                      aria-label={`Remove allergy ${item.value}`}
                      onClick={() => handleRemoveChip("allergies", idx)}
                      className="hover:text-red-600 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none rounded transition"
                    >
                      <X className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Current Medications */}
          <div className="space-y-2">
            <label htmlFor="medications-input" className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center justify-between">
              Current Medications
              <span className="text-[10px] text-sky-600 font-mono">user (100%)</span>
            </label>
            <div className="flex gap-2">
              <input
                id="medications-input"
                type="text"
                value={medicationInput}
                onChange={(e) => setMedicationInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddChip("medications", medicationInput, setMedicationInput);
                  }
                }}
                className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-gray-900 text-sm focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none"
                placeholder="Add medication & dose..."
              />
              <button
                type="button"
                aria-label="Add medication"
                onClick={() => handleAddChip("medications", medicationInput, setMedicationInput)}
                className="px-3.5 py-2 bg-sky-50 hover:bg-sky-100 text-[#0EA5E9] border border-sky-200 rounded-xl text-sm font-bold transition flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none min-h-[40px]"
              >
                <Plus className="w-4 h-4" aria-hidden="true" /> Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 pt-1 min-h-[38px] p-2 bg-slate-50 rounded-xl border border-slate-200">
              {profile.medications.length === 0 ? (
                <span className="text-xs text-slate-400 italic p-1">No medications listed</span>
              ) : (
                profile.medications.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-semibold"
                  >
                    <span>{item.value}</span>
                    <button
                      type="button"
                      aria-label={`Remove medication ${item.value}`}
                      onClick={() => handleRemoveChip("medications", idx)}
                      className="hover:text-red-600 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none rounded transition"
                    >
                      <X className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Clinical Notes */}
        <div className="space-y-1.5">
          <label htmlFor="patient-notes" className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center justify-between">
            Additional Patient Notes / History Context
            <span className="text-[10px] text-sky-600 font-mono">user (100%)</span>
          </label>
          <textarea
            id="patient-notes"
            rows={3}
            value={profile.notes.value}
            onChange={(e) => handleTextChange("notes", e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-gray-900 text-sm focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none transition"
            placeholder="Add relevant patient narrative, doctor visit reasons, or prior history..."
          />
        </div>

        {/* Submit Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
            Last updated: {new Date().toLocaleTimeString()}
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 bg-[#0EA5E9] hover:bg-sky-600 text-white font-bold rounded-xl shadow-md focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none transition flex items-center justify-center gap-2 min-h-[44px]"
          >
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> Save Patient Intake Record
          </button>
        </div>
      </form>
    </div>
  );
};
