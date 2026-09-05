"use client";

import React, { useEffect, useRef } from "react";
import { ExtractedLabResult } from "@/types/medlens";
import {
  X,
  HelpCircle,
  FileText,
  ShieldAlert,
  BookOpen
} from "lucide-react";

interface ExplainValueModalProps {
  result: ExtractedLabResult | null;
  onClose: () => void;
}

export const ExplainValueModal: React.FC<ExplainValueModalProps> = ({ result, onClose }) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Keyboard accessibility: listen for Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    // Focus close button on open
    closeButtonRef.current?.focus();
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!result) return null;

  // Safe, informational explanations (non-diagnostic)
  const getTestExplanation = (testName: string): string => {
    const lower = testName.toLowerCase();
    if (lower.includes("hemoglobin")) {
      return "Hemoglobin is an iron-rich protein in red blood cells that carries oxygen throughout the body. Values below the reported range indicate lower oxygen-carrying capacity.";
    }
    if (lower.includes("ferritin")) {
      return "Serum ferritin reflects total stored iron levels in body tissue. Values below the document's reference range indicate depleted iron reserves.";
    }
    if (lower.includes("tibc") || lower.includes("iron binding")) {
      return "Total Iron Binding Capacity (TIBC) measures the blood's capacity to bind iron with transferrin. Elevated values typically occur when iron stores are low.";
    }
    if (lower.includes("hematocrit")) {
      return "Hematocrit measures the percentage of total blood volume occupied by red blood cells.";
    }
    if (lower.includes("tsh") || lower.includes("thyroid")) {
      return "Thyroid Stimulating Hormone (TSH) is produced by the pituitary gland to regulate thyroid activity.";
    }
    if (lower.includes("glucose")) {
      return "Fasting glucose measures blood sugar concentration after a period of fasting.";
    }
    if (lower.includes("cholesterol") || lower.includes("ldl") || lower.includes("hdl")) {
      return "Lipid profiles measure circulation of fats and cholesterol proteins in the bloodstream.";
    }
    return `${testName} is a standard clinical laboratory measurement evaluated against the document's stated reference interval.`;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="explain-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-5 sm:space-y-6 relative overflow-hidden text-[#1F2937] my-8">
        {/* Soft background tint */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#0EA5E9]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#0EA5E9]/10 text-[#0EA5E9] border border-[#0EA5E9]/20">
              <HelpCircle className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3 id="explain-modal-title" className="text-base font-bold text-[#1F2937]">
                Explain This Value (FR8)
              </h3>
              <p className="text-xs text-slate-500">Non-Diagnostic Educational Context</p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-xl text-slate-400 hover:text-[#1F2937] hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none transition min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Value Details Card */}
        <div className="p-4 bg-slate-50/80 border border-slate-200 rounded-xl space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-bold text-[#1F2937]">{result.test_name}</span>
            <span className="px-2.5 py-0.5 rounded bg-[#0EA5E9]/10 text-[#0EA5E9] text-[10px] border border-[#0EA5E9]/20 font-mono font-medium">
              source: {result.source} ({result.confidence}%)
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#0EA5E9] font-mono">{result.value}</span>
            <span className="text-sm text-slate-500 font-medium">{result.unit}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block">Stated Reference Range:</span>
              <strong className="text-[#1F2937] font-mono">
                {result.reference_range?.raw_text || "Range not provided"}
              </strong>
            </div>

            <div>
              <span className="text-slate-500 block">Computed Status (FR4):</span>
              {result.status === "Low" && (
                <span className="font-bold text-[#0EA5E9]">↓ Low</span>
              )}
              {result.status === "High" && (
                <span className="font-bold text-[#EF4444]">↑ High</span>
              )}
              {result.status === "Normal" && (
                <span className="font-semibold text-[#22C55E]">✓ Normal</span>
              )}
              {result.status === "Range not provided" && (
                <span className="text-slate-400">Range not provided</span>
              )}
            </div>
          </div>
        </div>

        {/* Safe Educational Explanation */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#14B8A6]">
            <BookOpen className="w-4 h-4" aria-hidden="true" /> What does this lab metric mean?
          </div>
          <p className="text-xs text-slate-700 bg-teal-50/50 p-3.5 rounded-xl border border-teal-100 leading-relaxed">
            {getTestExplanation(result.test_name)}
          </p>
        </div>

        {/* Provenance & Source Citation */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1 font-mono">
          <div className="flex items-center gap-1 text-[#1F2937] font-medium">
            <FileText className="w-3.5 h-3.5 text-[#0EA5E9]" aria-hidden="true" />
            <span>Source Citation:</span>
          </div>
          <div>Report Page: {result.page} • Location Coordinates: ({result.bounding_box?.x}%, {result.bounding_box?.y}%)</div>
          <div>Human Verification: {result.verified ? "Verified ✓" : "Unverified (Pending Review)"}</div>
        </div>

        {/* Mandatory Safety Disclaimer */}
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800">
          <ShieldAlert className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            <strong>Safety Disclaimer:</strong> This explanation is educational only and does not diagnose disease or suggest medical therapy. Consult a licensed physician to interpret lab results in full clinical context.
          </span>
        </div>
      </div>
    </div>
  );
};
