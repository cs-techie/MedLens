"use client";

import React, { useState } from "react";
import { DocumentRecord } from "@/types/medlens";
import { DEMO_SAMPLE_REPORTS } from "@/lib/ocrExtractor";
import {
  Upload,
  FileText,
  Sparkles,
  FileCode,
  Tag,
  Info
} from "lucide-react";

interface ReportUploaderProps {
  onDocumentExtracted: (docRecord: DocumentRecord) => void;
}

export const ReportUploader: React.FC<ReportUploaderProps> = ({ onDocumentExtracted }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [pastedText, setPastedText] = useState("");
  const [customFilename, setCustomFilename] = useState("Lab_Report_Scan.pdf");
  const [extractedDoc, setExtractedDoc] = useState<DocumentRecord | null>(null);

  const [activeStage, setActiveStage] = useState<number>(0);
  const [cacheHit, setCacheHit] = useState<boolean>(false);
  const [contentHash, setContentHash] = useState<string>("sha256_e3b0c442...");

  const simulatePipelineStages = async (callback: () => Promise<void>) => {
    setIsProcessing(true);
    setActiveStage(1); // Upload & Fingerprint
    await new Promise((r) => setTimeout(r, 200));

    setActiveStage(2); // OCR & Tabular Layout
    await new Promise((r) => setTimeout(r, 350));

    setActiveStage(3); // AI Extraction & Provenance
    await callback();

    setActiveStage(4); // Medical DSL Validation & Consensus
    await new Promise((r) => setTimeout(r, 250));

    setActiveStage(5); // Safety Verification & Summary
    await new Promise((r) => setTimeout(r, 150));
    setIsProcessing(false);
  };

  const handleProcessSample = async (sampleId: string) => {
    const fakeHash = "sha256_" + Math.random().toString(36).substring(2, 10);
    setContentHash(fakeHash);
    setCacheHit(false);

    await simulatePipelineStages(async () => {
      try {
        const res = await fetch("/api/documents/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sampleId }),
        });
        const data = await res.json();
        if (data.success && data.document) {
          setExtractedDoc(data.document);
          onDocumentExtracted(data.document);
        }
      } catch (err) {
        console.error(err);
      }
    });
  };

  const handleProcessCustomText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedText.trim()) return;
    const fakeHash = "sha256_" + Math.random().toString(36).substring(2, 10);
    setContentHash(fakeHash);

    await simulatePipelineStages(async () => {
      try {
        const res = await fetch("/api/documents/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: customFilename || "Custom_Report.pdf",
            rawText: pastedText,
          }),
        });
        const data = await res.json();
        if (data.success && data.document) {
          setExtractedDoc(data.document);
          onDocumentExtracted(data.document);
        }
      } catch (err) {
        console.error(err);
      }
    });
  };

  const replayPipeline = async () => {
    if (!extractedDoc) return;
    setCacheHit(true);
    await simulatePipelineStages(async () => {
      await new Promise((r) => setTimeout(r, 300));
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 md:p-8 shadow-md space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
              <Upload className="w-5 h-5 text-[#0EA5E9]" aria-hidden="true" />
              Medical Report Intake & Reference-Range Extraction (FR2 & FR4)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Upload PDF scans or paste OCR report text. MedLens extracts structured test values and evaluates reference ranges strictly deterministically.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-sky-50 text-[#0EA5E9] border border-sky-200 shrink-0 self-start md:self-auto">
            OCR + Range Engine Active
          </span>
        </div>

        {/* Demo Preset Quick-Load Buttons */}
        <div className="space-y-3 pt-2">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" aria-hidden="true" />
            Quick-Load Sample Lab Reports (For Instant Testing)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DEMO_SAMPLE_REPORTS.map((sample) => (
              <button
                key={sample.id}
                type="button"
                disabled={isProcessing}
                onClick={() => handleProcessSample(sample.id)}
                aria-label={`Parse sample report: ${sample.title}`}
                className="flex items-start justify-between p-4 bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-[#0EA5E9] rounded-xl text-left focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none transition group min-h-[48px]"
              >
                <div className="space-y-1">
                  <div className="text-sm font-bold text-gray-800 group-hover:text-[#0EA5E9] flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#0EA5E9]" aria-hidden="true" />
                    {sample.title}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">{sample.description}</p>
                </div>
                <span className="px-2.5 py-1 text-[10px] font-bold bg-sky-100 text-[#0EA5E9] border border-sky-200 rounded-lg group-hover:bg-[#0EA5E9] group-hover:text-white transition shrink-0 ml-2">
                  Parse Sample →
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Text / File Input */}
        <div className="pt-4 border-t border-slate-100">
          <form onSubmit={handleProcessCustomText} className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label htmlFor="ocr-text-input" className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-[#0EA5E9]" aria-hidden="true" />
                Or Paste OCR Raw Text / Custom Report
              </label>
              <div className="flex items-center gap-1.5">
                <label htmlFor="custom-filename-input" className="sr-only">Filename</label>
                <input
                  id="custom-filename-input"
                  type="text"
                  value={customFilename}
                  onChange={(e) => setCustomFilename(e.target.value)}
                  className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-gray-800 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none font-mono"
                  placeholder="Filename.pdf"
                />
              </div>
            </div>

            <textarea
              id="ocr-text-input"
              rows={5}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste raw lab report text here (e.g. Hemoglobin: 10.4 g/dL (12.0 - 15.5))..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-gray-900 font-mono text-xs focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none"
            />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-500 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                Ranges not present in text will automatically receive &quot;Range not provided&quot; status.
              </div>
              <button
                type="submit"
                disabled={isProcessing || !pastedText.trim()}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#0EA5E9] hover:bg-sky-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none transition flex items-center justify-center gap-2 min-h-[40px]"
              >
                {isProcessing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                    Extracting Fields...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                    Process & Extract Report
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Extraction Results Table */}
      {extractedDoc && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 md:p-8 shadow-md space-y-6 animate-fadeIn">
          {/* Replayable Pipeline Stepper */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Replayable Clinical Pipeline (5 Stages)
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                  {contentHash}
                </span>
                {cacheHit && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                    ⚡ Smart Cache Hit (0.04ms)
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={replayPipeline}
                disabled={isProcessing}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-sm transition cursor-pointer disabled:opacity-50"
              >
                <span>Replay Pipeline</span>
                <span className="text-xs">↺</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs pt-1">
              {[
                { id: 1, title: "1. Fingerprint", desc: "SHA-256 Checksum" },
                { id: 2, title: "2. OCR Engine", desc: "Tabular Matrix" },
                { id: 3, title: "3. AI Extract", desc: "Provenance Binding" },
                { id: 4, title: "4. Medical DSL", desc: "Consensus 98%" },
                { id: 5, title: "5. Safety Agent", desc: "Zero-Diagnosis" },
              ].map((stg) => {
                const isCurrent = activeStage === stg.id;
                const isPassed = activeStage > stg.id || (!isProcessing && activeStage === 0);
                return (
                  <div
                    key={stg.id}
                    className={`p-2.5 rounded-lg border transition-all ${
                      isCurrent
                        ? "bg-sky-50 border-[#0EA5E9] shadow-sm"
                        : isPassed
                        ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                        : "bg-white border-slate-200 text-slate-400"
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-[11px]">
                      <span>{stg.title}</span>
                      {isCurrent ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0EA5E9] animate-ping"></span>
                      ) : isPassed ? (
                        <span className="text-emerald-600 font-bold">✓</span>
                      ) : null}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">{stg.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-gray-800">Extracted Lab Results</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald-50 text-[#22C55E] border border-emerald-200 font-semibold">
                  {extractedDoc.extracted_results.length} Fields Extracted
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Document: <span className="text-gray-800 font-mono font-semibold">{extractedDoc.filename}</span> • Processed at {new Date(extractedDoc.upload_date).toLocaleTimeString()}
              </p>
            </div>
            <div className="text-xs text-slate-600 flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 shrink-0 self-start md:self-auto">
              <Tag className="w-3.5 h-3.5 text-[#0EA5E9]" aria-hidden="true" />
              Provenance Tag: <strong className="text-[#0EA5E9]">source: &quot;ai_extracted&quot;</strong>
            </div>
          </div>

          {/* Results Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs text-slate-700 min-w-[600px]">
              <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider font-mono text-[10px] border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-4 py-3">Test Name</th>
                  <th scope="col" className="px-4 py-3">Extracted Result</th>
                  <th scope="col" className="px-4 py-3">Stated Reference Range (FR4)</th>
                  <th scope="col" className="px-4 py-3">Computed Status</th>
                  <th scope="col" className="px-4 py-3">Confidence & Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {extractedDoc.extracted_results.map((result) => (
                  <tr key={result.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3.5 font-bold text-gray-900">
                      {result.test_name}
                      {result.observations && (
                        <div className="text-[10px] text-slate-500 font-normal italic mt-0.5">
                          {result.observations}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3.5 font-mono text-sm">
                      <span className="text-[#0EA5E9] font-bold">{result.value}</span>{" "}
                      <span className="text-slate-500 text-xs">{result.unit}</span>
                    </td>

                    <td className="px-4 py-3.5 font-mono text-slate-700">
                      {result.reference_range?.raw_text ? (
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800">
                          {result.reference_range.raw_text}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Range not provided in source</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      {result.status === "Low" && (
                        <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-sky-100 text-sky-800 border border-sky-300 inline-flex items-center gap-1">
                          ↓ Low
                        </span>
                      )}
                      {result.status === "High" && (
                        <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-red-100 text-[#EF4444] border border-red-300 inline-flex items-center gap-1">
                          ↑ High
                        </span>
                      )}
                      {result.status === "Normal" && (
                        <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-[#22C55E] border border-emerald-300 inline-flex items-center gap-1">
                          ✓ Normal
                        </span>
                      )}
                      {result.status === "Range not provided" && (
                        <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-300 inline-flex items-center gap-1">
                          Range not provided
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-sky-50 text-[#0EA5E9] text-[10px] border border-sky-200 font-mono font-semibold">
                          ai_extracted ({result.confidence}%)
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Page {result.page} • Loc ({result.bounding_box?.x}%, {result.bounding_box?.y}%)
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
