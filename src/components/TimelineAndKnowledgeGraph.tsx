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
  Share2,
  Activity,
  Pill,
  HeartPulse,
  User,
  FlaskConical,
  Info
} from "lucide-react";

interface TimelineAndKnowledgeGraphProps {
  record: MedicalRecord;
  onLoadDemoData?: () => void;
}

interface GraphNode {
  id: string;
  label: string;
  subtitle?: string;
  type: "patient" | "condition" | "symptom" | "medication" | "lab";
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  x: number;
  y: number;
  radius: number;
  parentId?: string;
}

interface GraphEdge {
  from: string;
  to: string;
  label?: string;
}

export const TimelineAndKnowledgeGraph: React.FC<TimelineAndKnowledgeGraphProps> = ({ record, onLoadDemoData }) => {

  const [activeSubTab, setActiveSubTab] = useState<"graph" | "timeline">("graph");
  const [expandedDocId, setExpandedDocId] = useState<string | null>(
    record.documents[0]?.document_id || null
  );
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>("p1");
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // SVG Canvas dimensions
  const width = 850;
  const height = 480;
  const centerX = width / 2;
  const centerY = height / 2;

  // Build semantic multi-tiered node positions
  const patientNode: GraphNode = {
    id: "p1",
    label: record.patient.name.value || "Patient Record",
    subtitle: `${record.patient.age.value || 42} yrs, ${record.patient.sex.value || "Female"}`,
    type: "patient",
    color: "#8B5CF6",
    bgColor: "#F5F3FF",
    borderColor: "#8B5CF6",
    textColor: "#6D28D9",
    x: centerX,
    y: centerY,
    radius: 32,
  };

  // Conditions Tier (Inner Left Orbit)
  const conditions = record.patient.conditions || [];
  const conditionNodes: GraphNode[] = conditions.map((c, i) => {
    const angle = Math.PI + (i - (conditions.length - 1) / 2) * 0.55;
    const r = 145;
    return {
      id: `cond_${i}`,
      label: c.value,
      subtitle: "Diagnosed Condition",
      type: "condition",
      color: "#3B82F6",
      bgColor: "#EFF6FF",
      borderColor: "#3B82F6",
      textColor: "#1D4ED8",
      x: centerX + r * Math.cos(angle),
      y: centerY + r * Math.sin(angle),
      radius: 20,
      parentId: "p1",
    };
  });

  // Symptoms Tier (Inner Bottom Orbit)
  const symptoms = record.patient.symptoms || [];
  const symptomNodes: GraphNode[] = symptoms.map((s, i) => {
    const angle = (Math.PI / 2) + (i - (symptoms.length - 1) / 2) * 0.45;
    const r = 145;
    return {
      id: `symp_${i}`,
      label: s.value,
      subtitle: "Reported Symptom",
      type: "symptom",
      color: "#F43F5E",
      bgColor: "#FFF1F2",
      borderColor: "#F43F5E",
      textColor: "#BE123C",
      x: centerX + r * Math.cos(angle),
      y: centerY + r * Math.sin(angle),
      radius: 18,
      parentId: "p1",
    };
  });

  // Medications Tier (Outer Left Orbit - linked to conditions or patient)
  const medications = record.patient.medications || [];
  const medicationNodes: GraphNode[] = medications.map((m, i) => {
    const angle = Math.PI - 0.4 + (i - (medications.length - 1) / 2) * 0.5;
    const r = 240;
    const parentCond = conditionNodes[i % Math.max(1, conditionNodes.length)];
    return {
      id: `med_${i}`,
      label: m.value,
      subtitle: "Active Medication",
      type: "medication",
      color: "#10B981",
      bgColor: "#ECFDF5",
      borderColor: "#10B981",
      textColor: "#047857",
      x: centerX + r * Math.cos(angle),
      y: centerY + r * Math.sin(angle),
      radius: 18,
      parentId: parentCond ? parentCond.id : "p1",
    };
  });

  // Lab Biomarkers Tier (Right Orbit)
  const labs = record.documents.flatMap((d) => d.extracted_results).slice(0, 6);
  const labNodes: GraphNode[] = labs.map((l, i) => {
    const angle = -Math.PI / 3 + (i / Math.max(1, labs.length - 1)) * (Math.PI * 0.7);
    const r = 245;
    const isAbnormal = l.status === "Low" || l.status === "High";
    return {
      id: `lab_${i}`,
      label: `${l.test_name}: ${l.value} ${l.unit}`,
      subtitle: `Status: ${l.status}`,
      type: "lab",
      color: isAbnormal ? "#F59E0B" : "#0EA5E9",
      bgColor: isAbnormal ? "#FEF3C7" : "#F0F9FF",
      borderColor: isAbnormal ? "#F59E0B" : "#0EA5E9",
      textColor: isAbnormal ? "#B45309" : "#0369A1",
      x: centerX + r * Math.cos(angle),
      y: centerY + r * Math.sin(angle),
      radius: 18,
      parentId: conditionNodes.length > 0 && isAbnormal ? conditionNodes[0].id : "p1",
    };
  });

  const allNodes: GraphNode[] = [
    patientNode,
    ...conditionNodes,
    ...symptomNodes,
    ...medicationNodes,
    ...labNodes,
  ];

  // Build semantic edges
  const edges: GraphEdge[] = [];
  allNodes.forEach((node) => {
    if (node.parentId) {
      edges.push({
        from: node.parentId,
        to: node.id,
        label:
          node.type === "medication"
            ? "treats"
            : node.type === "lab"
            ? "monitors"
            : "presents",
      });
    }
  });

  // Highlight active connections
  const activeNodeId = hoveredNodeId || selectedNodeId;
  const connectedNodeIds = new Set<string>();
  if (activeNodeId) {
    connectedNodeIds.add(activeNodeId);
    edges.forEach((e) => {
      if (e.from === activeNodeId) connectedNodeIds.add(e.to);
      if (e.to === activeNodeId) connectedNodeIds.add(e.from);
    });
  }

  const selectedNode = allNodes.find((n) => n.id === selectedNodeId) || patientNode;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-[#0EA5E9]" aria-hidden="true" />
            Clinical Timeline & Knowledge Graph (FR9 & FR10)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Explore multi-tiered semantic relationship mappings and chronological report history across patient data.
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

      {/* KNOWLEDGE GRAPH (FR10) */}
      {activeSubTab === "graph" && (
        <div id="graph-subpanel" role="tabpanel" className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-md space-y-6">
          {/* Graph Legend Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-[#0EA5E9]" aria-hidden="true" />
              <h3 className="text-sm font-bold text-gray-800">Semantic Patient Intelligence Graph</h3>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5"><Circle className="w-3 h-3 fill-[#8B5CF6] text-[#8B5CF6]" /> Patient</span>
              <span className="flex items-center gap-1.5"><Circle className="w-3 h-3 fill-[#3B82F6] text-[#3B82F6]" /> Condition</span>
              <span className="flex items-center gap-1.5"><Circle className="w-3 h-3 fill-[#F43F5E] text-[#F43F5E]" /> Symptom</span>
              <span className="flex items-center gap-1.5"><Circle className="w-3 h-3 fill-[#10B981] text-[#10B981]" /> Medication</span>
              <span className="flex items-center gap-1.5"><Circle className="w-3 h-3 fill-[#0EA5E9] text-[#0EA5E9]" /> Lab Biomarker</span>
            </div>
          </div>

          {/* SVG Multi-Tier Canvas */}
          <div className="relative min-h-[420px] sm:min-h-[480px] bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-center p-2 sm:p-4 overflow-hidden">
            <svg className="w-full h-[420px] sm:h-[480px]" viewBox={`0 0 ${width} ${height}`}>
              <defs>
                <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.08" />
                </filter>
              </defs>

              {/* Render Relationships (Edges) */}
              {edges.map((edge, i) => {
                const source = allNodes.find((n) => n.id === edge.from);
                const target = allNodes.find((n) => n.id === edge.to);
                if (!source || !target) return null;

                const isConnected =
                  !activeNodeId ||
                  (connectedNodeIds.has(source.id) && connectedNodeIds.has(target.id));

                const midX = (source.x + target.x) / 2;
                const midY = (source.y + target.y) / 2;

                return (
                  <g key={`edge_${i}`} className="transition-opacity duration-300">
                    <line
                      x1={source.x}
                      y1={source.y}
                      x2={target.x}
                      y2={target.y}
                      stroke={isConnected ? "#94A3B8" : "#E2E8F0"}
                      strokeWidth={isConnected ? (activeNodeId ? "2.5" : "1.5") : "1"}
                      strokeDasharray={edge.from === "p1" ? "4 3" : "none"}
                      opacity={isConnected ? 0.95 : 0.2}
                    />
                    {edge.label && isConnected && (
                      <g transform={`translate(${midX}, ${midY})`}>
                        <rect
                          x="-22"
                          y="-8"
                          width="44"
                          height="14"
                          rx="4"
                          fill="#FFFFFF"
                          stroke="#CBD5E1"
                          strokeWidth="0.8"
                        />
                        <text
                          x="0"
                          y="2"
                          textAnchor="middle"
                          fill="#64748B"
                          fontSize="9"
                          fontWeight="600"
                          className="select-none font-mono"
                        >
                          {edge.label}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Render Nodes */}
              {allNodes.map((node) => {
                const isPatient = node.id === "p1";
                const isSelected = selectedNodeId === node.id;
                const isHovered = hoveredNodeId === node.id;
                const isDimmed = activeNodeId && !connectedNodeIds.has(node.id);

                return (
                  <g
                    key={node.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Graph node ${node.label}, type ${node.type}`}
                    onClick={() => setSelectedNodeId(node.id)}
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedNodeId(node.id);
                      }
                    }}
                    className={`cursor-pointer transition-all duration-300 focus-visible:outline-none ${
                      isDimmed ? "opacity-25" : "opacity-100"
                    }`}
                  >
                    {/* Node Outer Halo / Ring */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={node.radius + (isSelected || isHovered ? 6 : 2)}
                      fill={node.bgColor}
                      stroke={node.borderColor}
                      strokeWidth={isSelected ? 3 : 2}
                      filter="url(#shadow)"
                      className="transition-all duration-200"
                    />

                    {/* Node Inner Core Dot */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={node.radius - 8}
                      fill={node.color}
                      fillOpacity={0.85}
                    />

                    {/* Node Label Card Backdrop */}
                    <g transform={`translate(${node.x}, ${node.y + node.radius + 14})`}>
                      <rect
                        x={-Math.min(100, node.label.length * 4.2 + 12) / 2}
                        y="-10"
                        width={Math.min(100, node.label.length * 4.2 + 12)}
                        height="20"
                        rx="10"
                        fill="#FFFFFF"
                        stroke={isSelected ? node.borderColor : "#E2E8F0"}
                        strokeWidth={isSelected ? "1.5" : "1"}
                        filter="url(#shadow)"
                      />
                      <text
                        x="0"
                        y="3"
                        textAnchor="middle"
                        fill={node.textColor}
                        fontSize="10"
                        fontWeight="700"
                        className="select-none font-sans"
                      >
                        {node.label.length > 22 ? node.label.slice(0, 20) + "..." : node.label}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>

            {/* Selected Node Details Drawer Bar */}
            <div className="w-full bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-2">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-xs shrink-0"
                  style={{ backgroundColor: selectedNode.color }}
                >
                  {selectedNode.type === "patient" && <User className="w-5 h-5" />}
                  {selectedNode.type === "condition" && <HeartPulse className="w-5 h-5" />}
                  {selectedNode.type === "symptom" && <Activity className="w-5 h-5" />}
                  {selectedNode.type === "medication" && <Pill className="w-5 h-5" />}
                  {selectedNode.type === "lab" && <FlaskConical className="w-5 h-5" />}
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    {selectedNode.label}
                    <span
                      className="px-2 py-0.5 rounded-md text-[10px] uppercase font-mono font-semibold"
                      style={{ backgroundColor: selectedNode.bgColor, color: selectedNode.textColor }}
                    >
                      {selectedNode.type}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">{selectedNode.subtitle}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 font-mono self-end sm:self-center">
                <Info className="w-4 h-4 text-[#0EA5E9]" /> Click any node to inspect relationships & clinical provenance
              </div>
            </div>
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

          {record.documents.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl space-y-3 my-4">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto" aria-hidden="true" />
              <p className="text-sm font-bold text-gray-800">No Medical Reports Uploaded</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Upload a lab report in <strong>Tab 2 (Report Processing)</strong> to view chronological report timelines.
              </p>
              {onLoadDemoData && (
                <button
                  type="button"
                  onClick={onLoadDemoData}
                  className="px-3.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-[#0EA5E9] border border-sky-300 rounded-lg text-xs font-bold transition focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none"
                >
                  🧪 Load Demo Sample Data
                </button>
              )}
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {record.documents.map((doc) => {
                const isExpanded = expandedDocId === doc.document_id;

              return (
                <div key={doc.document_id} className="relative space-y-2">
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
                      <div className="pt-3 border-t border-slate-200 space-y-3 text-xs">
                        {doc.mini_summary && (
                          <div className="bg-sky-50 border border-sky-200 text-sky-900 rounded-lg p-2.5 font-sans">
                            <span className="font-bold">Report Summary: </span>{doc.mini_summary}
                          </div>
                        )}

                        <div className="space-y-1.5">
                          <div className="font-bold text-slate-700 font-mono uppercase text-[10px]">Extracted Biomarkers ({doc.extracted_results.length}):</div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {doc.extracted_results.map((l) => (
                              <div key={l.id} className="bg-white border border-slate-200 rounded-lg p-2 flex items-center justify-between font-mono">
                                <div>
                                  <span className="font-bold text-slate-800">{l.test_name}</span>
                                  <div className="text-[10px] text-slate-500">{l.value} {l.unit}</div>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  l.status === "Low" ? "bg-amber-100 text-amber-800" :
                                  l.status === "High" ? "bg-red-100 text-red-800" :
                                  "bg-emerald-100 text-emerald-800"
                                }`}>
                                  {l.status}
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
          )}
        </div>
      )}
    </div>
  );
};

