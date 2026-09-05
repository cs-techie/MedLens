"use client";

import React, { useState } from "react";
import { MedicalRecord } from "@/types/medlens";
import {
  GitBranch,
  Calendar,
  FileText,
  ChevronDown,
  ChevronUp,
  Circle,
  Share2
} from "lucide-react";

interface TimelineAndKnowledgeGraphProps {
  record: MedicalRecord;
}

export const TimelineAndKnowledgeGraph: React.FC<TimelineAndKnowledgeGraphProps> = ({ record }) => {
  const [activeSubTab, setActiveSubTab] = useState<"graph" | "timeline">("graph");
  const [expandedDocId, setExpandedDocId] = useState<string | null>(
    record.documents[0]?.document_id || null
  );
  const [selectedNode, setSelectedNode] = useState<{ id: string; label: string; type: string } | null>(null);

  // Build nodes and edges for Knowledge Graph Lite
  const patientNode = { id: "p1", label: record.patient.name.value, type: "patient", color: "#A78BFA" };

  const conditionNodes = record.patient.conditions.map((c, i) => ({
    id: `c_${i}`,
    label: c.value,
    type: "condition",
    color: "#60A5FA",
  }));

  const symptomNodes = record.patient.symptoms.map((s, i) => ({
    id: `s_${i}`,
    label: s.value,
    type: "symptom",
    color: "#F87171",
  }));

  const medicationNodes = record.patient.medications.map((m, i) => ({
    id: `m_${i}`,
    label: m.value,
    type: "medication",
    color: "#34D399",
  }));

  const labNodes = record.documents
    .flatMap((d) => d.extracted_results)
    .slice(0, 6)
    .map((l, i) => ({
      id: `l_${i}`,
      label: `${l.test_name}: ${l.value} ${l.unit}`,
      type: "lab",
      color: "#00E5FF",
    }));

  const allNodes = [patientNode, ...conditionNodes, ...symptomNodes, ...medicationNodes, ...labNodes];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-[#0EA5E9]" aria-hidden="true" />
            Clinical Timeline & Knowledge Graph Lite (FR9 & FR10)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Explore chronological event history and visual relationship mappings over structured patient data.
          </p>
        </div>

        {/* Sub-tab Switcher */}
        <div role="tablist" aria-label="Knowledge graph or timeline view" className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0 self-start md:self-auto">
          <button
            role="tab"
            aria-selected={activeSubTab === "graph"}
            aria-controls="graph-subpanel"
            onClick={() => setActiveSubTab("graph")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none transition flex items-center gap-1.5 min-h-[36px] ${
              activeSubTab === "graph"
                ? "bg-white text-[#0EA5E9] shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Share2 className="w-3.5 h-3.5" aria-hidden="true" /> Knowledge Graph (FR10)
          </button>
          <button
            role="tab"
            aria-selected={activeSubTab === "timeline"}
            aria-controls="timeline-subpanel"
            onClick={() => setActiveSubTab("timeline")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none transition flex items-center gap-1.5 min-h-[36px] ${
              activeSubTab === "timeline"
                ? "bg-white text-[#0EA5E9] shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" aria-hidden="true" /> Timeline View (FR9)
          </button>
        </div>
      </div>

      {/* KNOWLEDGE GRAPH LITE (FR10) */}
      {activeSubTab === "graph" && (
        <div id="graph-subpanel" role="tabpanel" className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-[#0EA5E9]" aria-hidden="true" />
              <h3 className="text-sm font-bold text-gray-800">Patient Intelligence Graph</h3>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono font-semibold text-slate-600">
              <span className="flex items-center gap-1"><Circle className="w-2.5 h-2.5 fill-purple-500 text-purple-500" aria-hidden="true" /> Patient</span>
              <span className="flex items-center gap-1"><Circle className="w-2.5 h-2.5 fill-[#0EA5E9] text-[#0EA5E9]" aria-hidden="true" /> Condition</span>
              <span className="flex items-center gap-1"><Circle className="w-2.5 h-2.5 fill-[#22C55E] text-[#22C55E]" aria-hidden="true" /> Medication</span>
              <span className="flex items-center gap-1"><Circle className="w-2.5 h-2.5 fill-[#14B8A6] text-[#14B8A6]" aria-hidden="true" /> Lab Value</span>
            </div>
          </div>

          {/* SVG Force Layout Relationship Graph */}
          <div className="relative min-h-[350px] sm:min-h-[420px] bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center p-2 sm:p-4 overflow-hidden">
            <svg className="w-full h-[350px] sm:h-[400px]" viewBox="0 0 800 400">
              {/* Lines from Patient (400, 200) to surrounding nodes */}
              {allNodes.map((node, i) => {
                if (node.id === "p1") return null;
                const angle = ((i - 1) / (allNodes.length - 1)) * 2 * Math.PI;
                const radius = 140;
                const x = 400 + radius * Math.cos(angle);
                const y = 200 + radius * Math.sin(angle);

                return (
                  <g key={`edge_${node.id}`}>
                    <line
                      x1={400}
                      y1={200}
                      x2={x}
                      y2={y}
                      stroke="#CBD5E1"
                      strokeWidth="2"
                      strokeDasharray="4 2"
                    />
                  </g>
                );
              })}

              {/* Render Nodes */}
              {allNodes.map((node, i) => {
                const isPatient = node.id === "p1";
                const angle = isPatient ? 0 : ((i - 1) / (allNodes.length - 1)) * 2 * Math.PI;
                const radius = isPatient ? 0 : 140;
                const x = isPatient ? 400 : 400 + radius * Math.cos(angle);
                const y = isPatient ? 200 : 200 + radius * Math.sin(angle);

                return (
                  <g
                    key={node.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Graph node ${node.label}, type ${node.type}`}
                    onClick={() => setSelectedNode(node)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedNode(node);
                      }
                    }}
                    className="cursor-pointer group focus-visible:outline-none"
                  >
                    <circle
                      cx={x}
                      cy={y}
                      r={isPatient ? 28 : 18}
                      fill={node.color}
                      fillOpacity={0.25}
                      stroke={node.color}
                      strokeWidth={isPatient ? 3 : 2}
                      className="transition-all duration-300 group-hover:scale-125 group-focus-visible:stroke-sky-600 group-focus-visible:stroke-4"
                    />
                    <text
                      x={x}
                      y={y + (isPatient ? 45 : 32)}
                      textAnchor="middle"
                      fill="#1E293B"
                      fontSize={isPatient ? "12" : "10"}
                      fontWeight={isPatient ? "700" : "600"}
                      className="select-none font-mono"
                    >
                      {node.label.length > 20 ? node.label.slice(0, 18) + "..." : node.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Selected Node Details Popover */}
            {selectedNode && (
              <div role="status" className="absolute bottom-4 right-4 bg-white border border-slate-200 rounded-xl p-3 shadow-lg text-xs space-y-1 max-w-xs font-mono animate-fadeIn">
                <div className="text-[#0EA5E9] font-bold">{selectedNode.label}</div>
                <div className="text-slate-500">Node Type: {selectedNode.type}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CHRONOLOGICAL TIMELINE VIEW (FR9) */}
      {activeSubTab === "timeline" && (
        <div id="timeline-subpanel" role="tabpanel" className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-md space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#0EA5E9]" aria-hidden="true" />
              <h3 className="text-sm font-bold text-gray-800">Chronological Medical Report History</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500 font-semibold">
              Sorted by Report Date
            </span>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {record.documents.map((doc) => {
              const isExpanded = expandedDocId === doc.document_id;
              return (
                <div key={doc.document_id} className="relative space-y-2">
                  {/* Timeline node icon dot */}
                  <div className="absolute -left-[29px] top-1.5 w-4 h-4 rounded-full bg-[#0EA5E9] border-4 border-white shadow-xs" aria-hidden="true" />

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      aria-label={`Toggle report details for ${doc.filename}`}
                      onClick={() => setExpandedDocId(isExpanded ? null : doc.document_id)}
                      className="w-full flex items-center justify-between text-left focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none rounded-lg p-1"
                    >
                      <div className="space-y-0.5">
                        <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#0EA5E9]" aria-hidden="true" />
                          {doc.filename}
                        </div>
                        <div className="text-xs text-slate-500 font-mono">
                          Date: {new Date(doc.upload_date).toLocaleDateString()} • {doc.extracted_results.length} Extracted Parameters
                        </div>
                      </div>

                      <div className="text-slate-400 hover:text-slate-700">
                        {isExpanded ? <ChevronUp className="w-4 h-4" aria-hidden="true" /> : <ChevronDown className="w-4 h-4" aria-hidden="true" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="pt-3 border-t border-slate-200 space-y-3 text-xs animate-fadeIn">
                        <div className="p-3 bg-white border border-slate-200 rounded-lg text-slate-700 leading-relaxed font-mono">
                          <strong className="text-[#0EA5E9] block mb-1">Mini Summary:</strong>
                          {doc.mini_summary || "Document parsed and indexed."}
                        </div>

                        <div className="space-y-1">
                          <strong className="text-slate-500 block font-mono text-[10px] uppercase font-bold">
                            Extracted Findings:
                          </strong>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {doc.extracted_results.map((l) => (
                              <div
                                key={l.id}
                                className="p-2 bg-white rounded border border-slate-200 flex justify-between font-mono text-[11px]"
                              >
                                <span className="font-bold text-gray-800">{l.test_name}</span>
                                <span className="text-[#0EA5E9] font-bold">
                                  {l.value} {l.unit} ({l.status})
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
