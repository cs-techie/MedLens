"use client";

import React, { useState } from "react";
import { initialMedicalRecord, emptyMedicalRecord } from "@/lib/store";
import { MedicalRecord, PatientProfile, DocumentRecord, AISummary } from "@/types/medlens";
import { LandingPage } from "@/components/LandingPage";
import { IntakeForm } from "@/components/IntakeForm";
import { ReportUploader } from "@/components/ReportUploader";
import { ClinicalDashboard } from "@/components/ClinicalDashboard";
import { EvidenceSplitViewer } from "@/components/EvidenceSplitViewer";
import { AISummaryViewer } from "@/components/AISummaryViewer";
import { TimelineAndKnowledgeGraph } from "@/components/TimelineAndKnowledgeGraph";
import {
  Activity,
  UserCheck,
  FileText,
  LayoutDashboard,
  Eye,
  Sparkles,
  GitBranch,
  ShieldAlert,
  Globe,
  Menu,
  X,
  Database
} from "lucide-react";

export default function Home() {
  const [currentView, setCurrentView] = useState<"landing" | "app">("landing");
  const [record, setRecord] = useState<MedicalRecord>(emptyMedicalRecord);
  const [activeTab, setActiveTab] = useState<
    "intake" | "upload" | "dashboard" | "evidence" | "summary" | "timeline"
  >("intake");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLoadDemoRecord = () => {
    setRecord(initialMedicalRecord);
  };


  const handleSaveProfile = (updatedProfile: PatientProfile) => {
    setRecord((prev) => ({
      ...prev,
      patient: updatedProfile,
    }));
  };

  const handleDocumentExtracted = (newDoc: DocumentRecord) => {
    setRecord((prev) => {
      const existingIdx = prev.documents.findIndex(
        (d) => d.document_id === newDoc.document_id
      );
      let updatedDocs = [...prev.documents];
      if (existingIdx >= 0) {
        updatedDocs[existingIdx] = newDoc;
      } else {
        updatedDocs = [newDoc, ...updatedDocs];
      }
      return {
        ...prev,
        documents: updatedDocs,
      };
    });
  };

  const handleVerifyField = (docId: string, labId: string) => {
    setRecord((prev) => {
      const updatedDocs = prev.documents.map((doc) => {
        if (doc.document_id !== docId) return doc;
        const updatedLabs = doc.extracted_results.map((lab) => {
          if (lab.id !== labId) return lab;
          return { ...lab, verified: true };
        });
        return { ...doc, extracted_results: updatedLabs };
      });
      return { ...prev, documents: updatedDocs };
    });
  };

  const handleEditField = (docId: string, labId: string, newValue: number | string) => {
    setRecord((prev) => {
      const updatedDocs = prev.documents.map((doc) => {
        if (doc.document_id !== docId) return doc;
        const updatedLabs = doc.extracted_results.map((lab) => {
          if (lab.id !== labId) return lab;
          const historyItem = {
            original_value: lab.value,
            corrected_value: newValue,
            corrected_at: new Date().toISOString(),
            corrected_by: "human_reviewer",
          };
          return {
            ...lab,
            value: newValue,
            verified: true,
            edit_history: [...(lab.edit_history || []), historyItem],
          };
        });
        return { ...doc, extracted_results: updatedLabs };
      });
      return { ...prev, documents: updatedDocs };
    });
  };

  const handleSummaryGenerated = (summary: AISummary) => {
    setRecord((prev) => ({
      ...prev,
      ai_summary: summary,
    }));
  };

  const navItems = [
    { id: "intake", label: "1. Patient Intake (FR1)", icon: UserCheck, color: "text-[#0EA5E9]" },
    { id: "upload", label: "2. Report Processing (FR2/FR4)", icon: FileText, color: "text-[#14B8A6]" },
    { id: "dashboard", label: "3. Dashboard & Provenance (FR3/FR5)", icon: LayoutDashboard, color: "text-[#22C55E]" },
    { id: "evidence", label: "4. Evidence Split-Pane (FR7)", icon: Eye, color: "text-[#0EA5E9]" },
    { id: "summary", label: "5. AI Summary & Safety (FR6)", icon: Sparkles, color: "text-[#F59E0B]" },
    { id: "timeline", label: "6. Timeline & Knowledge Graph (FR9/10)", icon: GitBranch, color: "text-[#14B8A6]" },
  ] as const;

  if (currentView === "landing") {
    return <LandingPage onLaunchApp={() => setCurrentView("app")} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Top Banner Disclaimer */}
      <aside
        aria-label="Clinical Decision Support Disclaimer"
        className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-center text-xs font-medium text-amber-900 flex items-center justify-center gap-2"
      >
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
        <span>
          <strong>MedLens Decision-Support Disclaimer:</strong> This system provides structured evidence extraction and non-diagnostic summaries. It does not provide medical diagnosis or treatment plans.
        </span>
      </aside>

      {/* Main Header */}
      <header role="banner" className="border-b border-slate-200 bg-white sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0EA5E9] to-[#14B8A6] flex items-center justify-center shadow-md shadow-sky-500/20 shrink-0">
              <Activity className="w-6 h-6 text-white font-bold" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-bold text-gray-800 tracking-tight">MedLens AI</h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 font-mono font-semibold">
                  Clinical Intelligence Dashboard
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                AI Clinical Intelligence Pipeline & Structured Patient Record
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Quick Demo Data Loader Button */}
            <button
              onClick={handleLoadDemoRecord}
              aria-label="Load demo sample patient data"
              title="Pre-fill sample patient intake & lab report for testing"
              className="px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-300 text-sky-700 text-xs font-bold flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none transition min-h-[38px] shadow-xs"
            >
              <Database className="w-3.5 h-3.5 text-[#0EA5E9]" aria-hidden="true" />
              <span>Load Demo Data</span>
            </button>

            {/* View Switcher Button */}
            <button
              onClick={() => setCurrentView("landing")}
              aria-label="Return to landing page"
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-semibold flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none transition min-h-[38px]"
            >
              <Globe className="w-3.5 h-3.5 text-sky-600" aria-hidden="true" />
              <span className="hidden xs:inline">Landing Page</span>
            </button>

            {/* Active Patient Summary Chip */}
            <div className="hidden md:flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
              <div className={`w-2.5 h-2.5 rounded-full ${record.patient.name.value ? "bg-[#22C55E] animate-pulse" : "bg-amber-400"}`} aria-hidden="true" />
              <div>
                <span className="text-slate-500">Patient: </span>
                {record.patient.name.value ? (
                  <>
                    <strong className="text-gray-800">{record.patient.name.value}</strong>
                    <span className="text-slate-500 ml-1">
                      ({record.patient.age.value} yrs, {record.patient.sex.value})
                    </span>
                  </>
                ) : (
                  <span className="text-amber-700 font-semibold italic">Intake Pending (Tab 1)</span>
                )}
              </div>
            </div>


            {/* Mobile Navigation Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label="Toggle navigation menu"
              className="md:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu Drawer */}
        {mobileMenuOpen && (
          <div id="mobile-menu" className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2 shadow-lg">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Pipeline Navigation
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? "bg-sky-50 text-[#0EA5E9] border border-sky-300 font-bold"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${item.color}`} aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Feature Navigation Tabs (Desktop / Tablet) */}
      <nav aria-label="Pipeline Views" className="hidden md:block border-b border-slate-200 bg-white">
        <div role="tablist" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 overflow-x-auto py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                role="tab"
                id={`tab-${item.id}`}
                aria-selected={isActive}
                aria-controls={`panel-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none min-h-[40px] ${
                  isActive
                    ? "bg-sky-50 text-[#0EA5E9] border border-sky-300 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon className={`w-4 h-4 ${item.color}`} aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Content Body */}
      <main role="main" className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div id={`panel-${activeTab}`} role="tabpanel" aria-labelledby={`tab-${activeTab}`}>
          {activeTab === "intake" && (
            <IntakeForm initialProfile={record.patient} onSaveProfile={handleSaveProfile} />
          )}

          {activeTab === "upload" && (
            <ReportUploader onDocumentExtracted={handleDocumentExtracted} />
          )}

          {activeTab === "dashboard" && (
            <ClinicalDashboard
              record={record}
              onVerifyField={handleVerifyField}
              onEditField={handleEditField}
              onLoadDemoData={handleLoadDemoRecord}
            />
          )}

          {activeTab === "evidence" && (
            <EvidenceSplitViewer
              documents={record.documents}
              onLoadDemoData={handleLoadDemoRecord}
            />
          )}

          {activeTab === "summary" && (
            <AISummaryViewer
              record={record}
              onSummaryGenerated={handleSummaryGenerated}
              onLoadDemoData={handleLoadDemoRecord}
            />
          )}

          {activeTab === "timeline" && (
            <TimelineAndKnowledgeGraph
              record={record}
              onLoadDemoData={handleLoadDemoRecord}
            />
          )}

        </div>
      </main>

      {/* Footer */}
      <footer role="contentinfo" className="border-t border-slate-200 bg-white py-4 px-4 text-center text-xs text-slate-500">
        MedLens AI Clinical Intelligence Dashboard • Grounded, Traceable, Non-Diagnostic Clinical Decision Support
      </footer>
    </div>
  );
}
