"use client";

import React, { useState } from "react";
import { MedicalRecord, ExtractedLabResult } from "@/types/medlens";
import { ExplainValueModal } from "@/components/ExplainValueModal";
import {
  LayoutDashboard,
  UserCheck,
  Tag,
  HelpCircle,
  Edit2,
  ShieldCheck,
  ListFilter,
  Check
} from "lucide-react";

interface ClinicalDashboardProps {
  record: MedicalRecord;
  onVerifyField: (docId: string, labId: string) => void;
  onEditField: (docId: string, labId: string, newValue: number | string) => void;
}

export const ClinicalDashboard: React.FC<ClinicalDashboardProps> = ({
  record,
  onVerifyField,
  onEditField,
}) => {
  const [selectedExplainResult, setSelectedExplainResult] = useState<ExtractedLabResult | null>(null);
  const [editingResultId, setEditingResultId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const allLabResults = record.documents.flatMap((doc) =>
    doc.extracted_results.map((lab) => ({ ...lab, docId: doc.document_id, filename: doc.filename }))
  );

  const filteredResults = allLabResults.filter((lab) => {
    if (statusFilter === "abnormal") return lab.status === "Low" || lab.status === "High";
    if (statusFilter === "unverified") return !lab.verified;
    return true;
  });

  const handleStartEdit = (lab: ExtractedLabResult) => {
    setEditingResultId(lab.id);
    setEditValue(String(lab.value));
  };

  const handleSaveEdit = (docId: string, labId: string) => {
    if (!editValue.trim()) return;
    const num = parseFloat(editValue);
    onEditField(docId, labId, isNaN(num) ? editValue : num);
    setEditingResultId(null);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-[#0EA5E9]" aria-hidden="true" />
              Structured Clinical Record & Provenance Dashboard (FR3 & FR5)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Canonical patient record compiled from intake forms and extracted lab documents. Every field carries verifiable source metadata.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-sky-50 text-[#0EA5E9] border border-sky-200 flex items-center gap-1">
            <Tag className="w-3 h-3" aria-hidden="true" /> User Fields
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-teal-50 text-[#14B8A6] border border-teal-200 flex items-center gap-1">
            <Tag className="w-3 h-3" aria-hidden="true" /> AI Extracted
          </span>
        </div>
      </div>

      {/* Patient Profile Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-md space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#0EA5E9]" aria-hidden="true" />
            <h3 className="text-base font-bold text-gray-800">Patient Profile & History</h3>
          </div>
          <span className="px-2.5 py-0.5 rounded bg-sky-50 text-[#0EA5E9] text-xs font-semibold border border-sky-200 font-mono">
            source: user (100% confidence)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Patient Name</span>
            <div className="text-base font-bold text-gray-900">{record.patient.name.value}</div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Age & Sex</span>
            <div className="text-base font-bold text-gray-900">
              {record.patient.age.value} yrs • {record.patient.sex.value}
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1 sm:col-span-2">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Reported Symptoms</span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {record.patient.symptoms.map((s, i) => (
                <span key={i} className="px-2.5 py-0.5 bg-sky-100 text-sky-900 border border-sky-300 rounded text-xs font-semibold">
                  {s.value}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Extracted Lab Findings Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-gray-800">Extracted Laboratory Results</h3>
            <p className="text-xs text-slate-500">Structured parameters extracted from uploaded documents with reference range analysis.</p>
          </div>

          {/* Filter dropdown */}
          <div className="flex items-center gap-2">
            <ListFilter className="w-4 h-4 text-slate-500" aria-hidden="true" />
            <label htmlFor="status-filter-select" className="sr-only">Filter lab results by status</label>
            <select
              id="status-filter-select"
              aria-label="Filter lab results by status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none"
            >
              <option value="all">All Parameters ({allLabResults.length})</option>
              <option value="abnormal">Out of Range Only</option>
              <option value="unverified">Unverified Only</option>
            </select>
          </div>
        </div>

        {/* Results Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs text-slate-700 min-w-[640px]">
            <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider font-mono text-[10px] border-b border-slate-200">
              <tr>
                <th scope="col" className="px-4 py-3">Test Parameter</th>
                <th scope="col" className="px-4 py-3">Result Value</th>
                <th scope="col" className="px-4 py-3">Stated Reference Range (FR4)</th>
                <th scope="col" className="px-4 py-3">Range Status</th>
                <th scope="col" className="px-4 py-3">Provenance & Verification</th>
                <th scope="col" className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredResults.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400 italic">
                    No matching lab results found for filter condition.
                  </td>
                </tr>
              ) : (
                filteredResults.map((lab) => (
                  <tr key={lab.id} className="hover:bg-slate-50 transition">
                    {/* Test Name */}
                    <td className="px-4 py-3.5 font-bold text-gray-900">
                      <div>{lab.test_name}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">{lab.filename}</div>
                    </td>

                    {/* Value with Edit capability */}
                    <td className="px-4 py-3.5 font-mono text-sm">
                      {editingResultId === lab.id ? (
                        <div className="flex items-center gap-1">
                          <label htmlFor={`edit-input-${lab.id}`} className="sr-only">Edit value for {lab.test_name}</label>
                          <input
                            id={`edit-input-${lab.id}`}
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-20 px-2 py-1 bg-white border border-[#0EA5E9] rounded text-gray-900 text-xs font-mono focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none"
                          />
                          <button
                            type="button"
                            aria-label={`Save edited value for ${lab.test_name}`}
                            onClick={() => handleSaveEdit(lab.docId, lab.id)}
                            className="p-1.5 bg-[#0EA5E9] text-white rounded-lg hover:bg-sky-600 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none"
                          >
                            <Check className="w-4 h-4" aria-hidden="true" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-baseline gap-1">
                          <span className="text-[#0EA5E9] font-bold">{lab.value}</span>
                          <span className="text-slate-500 text-xs">{lab.unit}</span>
                          {lab.edit_history && lab.edit_history.length > 0 && (
                            <span className="text-[9px] px-1 py-0.2 bg-amber-100 text-[#F59E0B] rounded border border-amber-300 ml-1 font-bold">
                              Edited
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Stated Reference Range */}
                    <td className="px-4 py-3.5 font-mono text-slate-700">
                      {lab.reference_range?.raw_text ? (
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800">
                          {lab.reference_range.raw_text}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Range not provided</span>
                      )}
                    </td>

                    {/* Range Status */}
                    <td className="px-4 py-3.5">
                      {lab.status === "Low" && (
                        <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-sky-100 text-sky-800 border border-sky-300 inline-flex items-center gap-1">
                          ↓ Low
                        </span>
                      )}
                      {lab.status === "High" && (
                        <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-red-100 text-[#EF4444] border border-red-300 inline-flex items-center gap-1">
                          ↑ High
                        </span>
                      )}
                      {lab.status === "Normal" && (
                        <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-[#22C55E] border border-emerald-300 inline-flex items-center gap-1">
                          ✓ Normal
                        </span>
                      )}
                      {lab.status === "Range not provided" && (
                        <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-300 inline-flex items-center gap-1">
                          Range not provided
                        </span>
                      )}
                    </td>

                    {/* Provenance & Human Verification Flag */}
                    <td className="px-4 py-3.5 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-sky-50 text-[#0EA5E9] text-[10px] border border-sky-200 font-mono font-semibold">
                          source: ai_extracted ({lab.confidence}%)
                        </span>

                        {lab.verified ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-[#22C55E] text-[10px] border border-emerald-200 font-bold inline-flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" aria-hidden="true" /> Verified
                          </span>
                        ) : (
                          <button
                            type="button"
                            aria-label={`Mark ${lab.test_name} as verified`}
                            onClick={() => onVerifyField(lab.docId, lab.id)}
                            className="px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 text-[#F59E0B] text-[10px] border border-amber-200 font-bold focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none transition"
                          >
                            Mark Verified
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Action buttons */}
                    <td className="px-4 py-3.5 text-right space-x-2">
                      <button
                        type="button"
                        aria-label={`Explain value for ${lab.test_name}`}
                        onClick={() => setSelectedExplainResult(lab)}
                        className="px-2.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-[#0EA5E9] border border-sky-200 text-xs font-semibold focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none transition inline-flex items-center gap-1 min-h-[36px]"
                      >
                        <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" /> Explain
                      </button>

                      <button
                        type="button"
                        aria-label={`Edit value for ${lab.test_name}`}
                        onClick={() => handleStartEdit(lab)}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none transition inline-flex items-center justify-center min-w-[36px] min-h-[36px]"
                        title="Edit value"
                      >
                        <Edit2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Explain Value Modal Micro-interaction (FR8) */}
      <ExplainValueModal
        result={selectedExplainResult}
        onClose={() => setSelectedExplainResult(null)}
      />
    </div>
  );
};
