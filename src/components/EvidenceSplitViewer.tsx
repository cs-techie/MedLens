"use client";

import React, { useState } from "react";
import { DocumentRecord } from "@/types/medlens";
import {
  Eye,
  FileText,
  Crosshair,
  ChevronRight,
  Info
} from "lucide-react";

interface EvidenceSplitViewerProps {
  documents: DocumentRecord[];
}

export const EvidenceSplitViewer: React.FC<EvidenceSplitViewerProps> = ({ documents }) => {
  const [selectedDocId, setSelectedDocId] = useState<string>(
    documents[0]?.document_id || ""
  );
  const [activeLabId, setActiveLabId] = useState<string | null>(null);

  const activeDoc = documents.find((d) => d.document_id === selectedDocId) || documents[0];
  const activeLab = activeDoc?.extracted_results.find((l) => l.id === activeLabId);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header & Doc Switcher */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <Eye className="w-5 h-5 text-[#0EA5E9]" aria-hidden="true" />
            Evidence-Linked Split-Pane Viewer (&quot;Show Source&quot; FR7)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Click any structured lab parameter on the right to pinpoint and highlight its exact OCR source location on the left document.
          </p>
        </div>

        {/* Document Selector Dropdown */}
        {documents.length > 1 && (
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
            <FileText className="w-4 h-4 text-[#0EA5E9]" aria-hidden="true" />
            <label htmlFor="evidence-doc-select" className="sr-only">Select document for evidence viewer</label>
            <select
              id="evidence-doc-select"
              aria-label="Select document for evidence viewer"
              value={selectedDocId}
              onChange={(e) => {
                setSelectedDocId(e.target.value);
                setActiveLabId(null);
              }}
              className="bg-transparent text-xs text-gray-800 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none font-mono font-semibold"
            >
              {documents.map((doc) => (
                <option key={doc.document_id} value={doc.document_id}>
                  {doc.filename}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {!activeDoc ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          No medical report documents uploaded. Please upload a report in Tab 2.
        </div>
      ) : (
        /* Split-Pane View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT PANE: Source Document & Visual OCR Text (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0EA5E9]" aria-hidden="true" />
                <h3 className="text-sm font-bold text-gray-800">
                  Document View: <span className="font-mono text-[#0EA5E9]">{activeDoc.filename}</span>
                </h3>
              </div>
              <span className="text-[10px] px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-slate-600 font-mono font-semibold">
                Page {activeDoc.page_count} of {activeDoc.page_count}
              </span>
            </div>

            {/* Document Content View */}
            <div className="relative min-h-[380px] sm:min-h-[480px] bg-slate-50 rounded-xl p-3 sm:p-5 border border-slate-200 font-mono text-xs text-slate-800 overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {activeDoc.raw_ocr_text.split("\n").map((line, idx) => {
                const isLineHighlighted =
                  activeLab?.bounding_box?.text_snippet &&
                  line.toLowerCase().includes(
                    activeLab.bounding_box.text_snippet.toLowerCase().slice(0, 15)
                  );

                return (
                  <div
                    key={idx}
                    className={`py-1 px-2 rounded transition-all duration-300 ${
                      isLineHighlighted
                        ? "bg-sky-100 text-sky-900 border-l-4 border-[#0EA5E9] shadow-xs font-bold"
                        : "hover:bg-slate-100"
                    }`}
                  >
                    <span className="text-slate-400 select-none mr-3 inline-block w-6 text-right font-normal">
                      {idx + 1}
                    </span>
                    <span>{line}</span>
                  </div>
                );
              })}

              {/* Bounding box simulated highlight overlay */}
              {activeLab?.bounding_box && (
                <div
                  className="absolute left-4 right-4 bg-sky-500/10 border-2 border-[#0EA5E9] rounded-lg pointer-events-none transition-all duration-300 flex items-center justify-end px-3 py-1"
                  style={{
                    top: `${Math.min(activeLab.bounding_box.y * 5 + 60, 400)}px`,
                  }}
                >
                  <span className="text-[9px] font-mono bg-[#0EA5E9] text-white px-2 py-0.5 rounded font-bold shadow-xs">
                    Source Box: {activeLab.test_name} ({activeLab.confidence}%)
                  </span>
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#0EA5E9]" aria-hidden="true" />
              <span>Simulated bounding region coordinate highlighting (FR7). Click right pane items to trigger jump.</span>
            </div>
          </div>

          {/* RIGHT PANE: Extracted Structured Data (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-[#0EA5E9]" aria-hidden="true" />
                Structured Extracted Fields
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-sky-50 text-[#0EA5E9] border border-sky-200 font-mono font-semibold">
                Click Field to Highlight Source
              </span>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {activeDoc.extracted_results.map((lab) => {
                const isSelected = activeLabId === lab.id;

                return (
                  <div
                    key={lab.id}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isSelected}
                    aria-label={`Highlight source for ${lab.test_name}, value ${lab.value} ${lab.unit}`}
                    onClick={() => setActiveLabId(lab.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setActiveLabId(lab.id);
                      }
                    }}
                    className={`p-4 rounded-xl border transition cursor-pointer space-y-2 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none ${
                      isSelected
                        ? "bg-sky-50 border-[#0EA5E9] shadow-md ring-1 ring-[#0EA5E9]"
                        : "bg-slate-50 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                        {lab.test_name}
                      </span>

                      {lab.status === "Low" && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-300">
                          ↓ Low
                        </span>
                      )}
                      {lab.status === "High" && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-[#EF4444] border border-red-300">
                          ↑ High
                        </span>
                      )}
                      {lab.status === "Normal" && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-[#22C55E] border border-emerald-300">
                          ✓ Normal
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline justify-between pt-1">
                      <div className="flex items-baseline gap-1 font-mono">
                        <span className="text-base font-extrabold text-[#0EA5E9]">{lab.value}</span>
                        <span className="text-xs text-slate-500">{lab.unit}</span>
                      </div>

                      <span className="text-[11px] font-mono text-slate-500">
                        Range: <strong className="text-slate-800">{lab.reference_range?.raw_text || "None"}</strong>
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[10px] font-mono text-slate-500">
                      <span className="text-[#0EA5E9] font-semibold">ai_extracted ({lab.confidence}%)</span>
                      <span className="text-[#0EA5E9] font-bold flex items-center gap-0.5">
                        Jump to Page {lab.page} <ChevronRight className="w-3 h-3" aria-hidden="true" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
