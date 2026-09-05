"use client";

import React, { useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Activity,
  Sparkles,
  ArrowUpRight,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Eye,
  GitBranch,
  Search,
  Lock,
  ChevronDown,
  Plus,
  X,
  Clock,
  Heart,
  Brain,
  Stethoscope,
  Star,
  Users,
  Award,
  Send,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface LandingPageProps {
  onLaunchApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunchApp }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeDoctorIndex, setActiveDoctorIndex] = useState(0);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Scroll animation hooks
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.15], [1, 0.9]);
  const scale = useTransform(scrollYProgress, [0, 0.15], [1, 0.98]);

  const doctors = [
    {
      name: "Dr. Olivia Laurent",
      role: "Chief Medical Officer & Neurologist",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=800&auto=format&fit=crop",
      badge: "Clinical Intelligence Review"
    },
    {
      name: "Dr. Ethan Williams",
      role: "Lead Cardiologist & Clinical Advisor",
      image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=800&auto=format&fit=crop",
      badge: "Lab Range Verification"
    },
    {
      name: "Dr. Noah Chen",
      role: "Orthopedic & Data Safety Auditor",
      image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=800&auto=format&fit=crop",
      badge: "Provenance Audit Specialist"
    }
  ];

  const testimonials = [
    {
      name: "Mark Lewis",
      role: "Caregiver & Family Advocate",
      text: "MedLens parsed my father's 8-page lab report in seconds. The split-pane evidence viewer let me click any lab value to jump right to its source on the PDF. Absolute game changer!",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop"
    },
    {
      name: "Sue Parker",
      role: "Patient",
      text: "I used to panic reading raw lab results online. MedLens clearly tagged every reference range without diagnosing me, giving me peace of mind before meeting my doctor.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop"
    },
    {
      name: "Dr. Lisa Nair",
      role: "General Physician",
      text: "The deterministic range engine is brilliant. No hallucinated ranges, clear provenance badges (user vs AI), and instant timeline trend graphs save me 15 minutes per consultation.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop"
    }
  ];

  const blogs = [
    {
      date: "Mar 20, 2026",
      title: "Understanding Lab Reference Ranges: Why Context Matters",
      snippet: "Discover how lab reference intervals are established and why automated deterministic status checking prevents misinterpretation.",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=600&auto=format&fit=crop"
    },
    {
      date: "May 24, 2026",
      title: "The Importance of Data Provenance in Medical AI Tools",
      snippet: "Why every AI-assisted health tool must visibly label user-entered data versus AI-extracted parameters for safety.",
      image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=600&auto=format&fit=crop"
    },
    {
      date: "Jan 6, 2026",
      title: "How Evidence-Linked Split View Viewers Improve Clinical Trust",
      snippet: "Connecting structured data directly to source OCR coordinates gives clinicians audit-level confidence.",
      image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=600&auto=format&fit=crop"
    }
  ];

  const faqs = [
    {
      q: "How can I process a new lab report in MedLens?",
      a: "Simply click 'Launch Pipeline App' in the top header, navigate to Tab 2 (Report Processing), and upload a PDF or image scan. You can also paste raw report text directly or select a preset demo lab sample."
    },
    {
      q: "How does MedLens guarantee reference ranges are never hallucinated?",
      a: "MedLens runs a deterministic, code-level rules engine that parses ranges explicitly stated in the uploaded report text. If no range is present in the source document, status is labeled 'Range not provided' — never inferred from general medical knowledge."
    },
    {
      q: "What does data provenance tagging mean in MedLens?",
      a: "Every data field displayed carries a mandatory origin tag: User-entered (100% confidence), AI-extracted (with OCR confidence percentage and page coordinates), or AI-generated (safety-constrained summary text)."
    },
    {
      q: "Does MedLens provide medical diagnosis or treatment plans?",
      a: "No. MedLens is explicitly a decision-support and data organization system. All AI summaries pass through automated post-generation safety post-filters that block diagnostic and prescriptive phrasing."
    },
    {
      q: "Can I verify or edit AI-extracted lab results?",
      a: "Yes! In Tab 3 (Dashboard), any AI-extracted field can be verified with a single click or manually edited. Corrections retain full audit revision history (original value, corrected value, timestamp)."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans overflow-x-hidden">
      {/* FLOATING GLASSMORPHISM NAVBAR */}
      <div className="fixed top-5 inset-x-0 z-50 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pointer-events-none">
        <header className="pointer-events-auto bg-white/90 backdrop-blur-xl border border-slate-200 rounded-full px-5 py-3 shadow-md flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#0EA5E9] to-[#14B8A6] flex items-center justify-center shadow-md shadow-sky-500/20">
              <Activity className="w-5 h-5 text-white font-black" />
            </div>
            <span className="text-lg font-black tracking-tight text-gray-800 flex items-center gap-1">
              Med<span className="text-[#0EA5E9]">Lens</span>
            </span>
          </div>

          {/* Navigation Text Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600">
            <a href="#hero" className="hover:text-[#0EA5E9] transition">Home</a>
            <a href="#about" className="hover:text-[#0EA5E9] transition">About Us</a>
            <a href="#services" className="hover:text-[#0EA5E9] transition">Services</a>
            <a href="#specialists" className="hover:text-[#0EA5E9] transition">Specialists</a>
            <a href="#testimonials" className="hover:text-[#0EA5E9] transition">Patient Stories</a>
            <a href="#faq" className="hover:text-[#0EA5E9] transition">FAQ</a>
          </nav>

          {/* Right Pill CTA Button */}
          <button
            onClick={onLaunchApp}
            className="px-4 py-2 rounded-full bg-[#0EA5E9] hover:bg-sky-600 text-white font-extrabold text-xs shadow-md shadow-sky-500/20 hover:scale-105 transition-all duration-300 flex items-center gap-2"
          >
            <span>Launch MedLens App</span>
            <div className="w-5 h-5 rounded-full bg-white text-[#0EA5E9] flex items-center justify-center text-[10px] shadow-xs">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </button>
        </header>
      </div>

      {/* HERO SECTION */}
      <section id="hero" className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div style={{ opacity, scale }} className="text-center space-y-6 max-w-4xl mx-auto">
          {/* Top Pill Tag */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-[#0EA5E9] text-xs font-bold shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#14B8A6]" />
            <span>AI CLINICAL INTELLIGENCE PIPELINE</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-black text-gray-800 tracking-tight leading-[1.15]"
          >
            Your Trusted{" "}
            <span className="text-[#0EA5E9]">
              Clinical Intelligence
            </span>{" "}
            Partner
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed"
          >
            Transforming fragmented medical reports into structured, evidence-backed patient records with zero hallucinated reference ranges and 100% verifiable data provenance.
          </motion.p>

          {/* Primary CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
          >
            <button
              onClick={onLaunchApp}
              className="px-8 py-4 rounded-full bg-[#0EA5E9] hover:bg-sky-600 text-white font-black text-sm shadow-lg shadow-sky-500/20 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <span>Explore Interactive Pipeline</span>
              <div className="w-6 h-6 rounded-full bg-white text-[#0EA5E9] flex items-center justify-center shadow-xs">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </button>
          </motion.div>
        </motion.div>

        {/* HERO MOCKUP CARD */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-14 max-w-5xl mx-auto relative"
        >
          {/* Main Card Container */}
          <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xl space-y-6">
            {/* Header bar */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-sky-50 text-[#0EA5E9] border border-sky-200">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-800">Live Medical Intelligence Dashboard</h3>
                  <span className="text-[10px] text-slate-500 font-mono">Patient: Eleanor Vance (42 yrs)</span>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-emerald-50 text-[#22C55E] text-xs font-mono border border-emerald-200 font-semibold">
                Grounded Extraction Active
              </span>
            </div>

            {/* Extracted Lab Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Hemoglobin</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                    ↓ Low
                  </span>
                </div>
                <div className="flex items-baseline gap-1 font-mono">
                  <span className="text-2xl font-extrabold text-[#0EA5E9]">10.4</span>
                  <span className="text-xs text-slate-500">g/dL</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-200 flex items-center justify-between">
                  <span>Stated Range: 12.0 - 15.5</span>
                  <span className="text-[#0EA5E9] font-semibold">ai_extracted (98%)</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Serum Ferritin</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                    ↓ Low
                  </span>
                </div>
                <div className="flex items-baseline gap-1 font-mono">
                  <span className="text-2xl font-extrabold text-[#0EA5E9]">8.5</span>
                  <span className="text-xs text-slate-500">ng/mL</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-200 flex items-center justify-between">
                  <span>Stated Range: 15.0 - 150.0</span>
                  <span className="text-[#22C55E] font-semibold">Verified ✓</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">TIBC</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                    ↑ High
                  </span>
                </div>
                <div className="flex items-baseline gap-1 font-mono">
                  <span className="text-2xl font-extrabold text-[#0EA5E9]">465</span>
                  <span className="text-xs text-slate-500">ug/dL</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-200 flex items-center justify-between">
                  <span>Stated Range: 250 - 425</span>
                  <span className="text-[#0EA5E9] font-semibold">ai_extracted (95%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Left Floating Stat Badge */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-6 -left-4 sm:-left-8 bg-white border border-slate-200 p-3.5 rounded-2xl shadow-lg flex items-center gap-3"
          >
            <div className="p-2.5 rounded-xl bg-emerald-50 text-[#22C55E] border border-emerald-200">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-black text-gray-800 font-mono">3,000+</div>
              <div className="text-[10px] text-slate-500 font-medium">Satisfied Patients & Clinicians</div>
            </div>
          </motion.div>

          {/* Right Floating Stat Badge */}
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-6 -right-4 sm:-right-8 bg-white border border-slate-200 p-3.5 rounded-2xl shadow-lg space-y-1.5 hidden sm:block"
          >
            <div className="flex items-center gap-1 text-[#F59E0B]">
              <Star className="w-3.5 h-3.5 fill-[#F59E0B]" />
              <Star className="w-3.5 h-3.5 fill-[#F59E0B]" />
              <Star className="w-3.5 h-3.5 fill-[#F59E0B]" />
              <Star className="w-3.5 h-3.5 fill-[#F59E0B]" />
              <Star className="w-3.5 h-3.5 fill-[#F59E0B]" />
              <span className="text-xs font-bold text-gray-800 ml-1 font-mono">4.9/5</span>
            </div>
            <div className="text-[11px] font-bold text-slate-700">24/7 Grounded Extraction</div>
          </motion.div>
        </motion.div>
      </section>

      {/* ABOUT US & STAT CARDS SECTION */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="px-3.5 py-1.5 rounded-full bg-sky-50 text-[#0EA5E9] border border-sky-200 text-xs font-mono font-bold">
            ABOUT MEDLENS
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-800 tracking-tight">
            Compassionate Care. <span className="text-[#0EA5E9]">Trusted Experts.</span>
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            At MedLens, we deliver expert medical intelligence tools with advanced deterministic reference range algorithms and compassionate patient safety guardrails.
          </p>
        </div>

        {/* 3 Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-6 rounded-3xl bg-white border border-slate-200 shadow-md space-y-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-[#0EA5E9] border border-sky-200 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div className="text-4xl font-black text-[#0EA5E9] font-mono">3,000+</div>
            <div className="text-sm font-bold text-gray-800">Patients & Records Parsed</div>
            <p className="text-xs text-slate-500">Structured patient history records compiled with 100% verifiable data provenance tagging.</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-6 rounded-3xl bg-[#0EA5E9] text-white shadow-md space-y-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center">
              <Brain className="w-6 h-6" />
            </div>
            <div className="text-4xl font-black font-mono">0</div>
            <div className="text-sm font-black">Hallucinated Ranges</div>
            <p className="text-xs font-medium text-sky-100">Deterministic code evaluates status strictly from report intervals — never invented by AI.</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-6 rounded-3xl bg-white border border-slate-200 shadow-md space-y-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#22C55E] border border-emerald-200 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div className="text-4xl font-black text-[#22C55E] font-mono">24/7</div>
            <div className="text-sm font-bold text-gray-800">Non-Diagnostic Decision Support</div>
            <p className="text-xs text-slate-500">Automated safety post-filters ensure output text remains informational, safe, and transparent.</p>
          </motion.div>
        </div>
      </section>

      {/* WHY PATIENTS TRUST US */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="px-3.5 py-1.5 rounded-full bg-teal-50 text-[#14B8A6] border border-teal-200 text-xs font-mono font-bold">
            WHY CLINICIANS & PATIENTS TRUST US
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-800 tracking-tight">
            Trusted Care, Every <span className="text-[#0EA5E9]">Step of the Way</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            whileHover={{ y: -6 }}
            className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-[#0EA5E9] transition space-y-3 shadow-md relative overflow-hidden group"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0EA5E9] border border-sky-200 flex items-center justify-center group-hover:bg-[#0EA5E9] group-hover:text-white transition">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-gray-800">Deterministic Engine</h4>
            <p className="text-xs text-slate-600 leading-relaxed">Status (Low/Normal/High) is derived strictly from ranges in source reports.</p>
            <div className="h-1 w-full bg-[#0EA5E9] absolute bottom-0 left-0" />
          </motion.div>

          <motion.div
            whileHover={{ y: -6 }}
            className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-[#22C55E] transition space-y-3 shadow-md relative overflow-hidden group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#22C55E] border border-emerald-200 flex items-center justify-center group-hover:bg-[#22C55E] group-hover:text-white transition">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-gray-800">Complete Provenance</h4>
            <p className="text-xs text-slate-600 leading-relaxed">Visible tagging for User-entered, AI-extracted, and AI-generated text.</p>
            <div className="h-1 w-full bg-[#22C55E] absolute bottom-0 left-0" />
          </motion.div>

          <motion.div
            whileHover={{ y: -6 }}
            className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-[#0EA5E9] transition space-y-3 shadow-md relative overflow-hidden group"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0EA5E9] border border-sky-200 flex items-center justify-center group-hover:bg-[#0EA5E9] group-hover:text-white transition">
              <Eye className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-gray-800">Evidence Split Viewer</h4>
            <p className="text-xs text-slate-600 leading-relaxed">Click any extracted lab result to jump to source OCR coordinates.</p>
            <div className="h-1 w-full bg-[#0EA5E9] absolute bottom-0 left-0" />
          </motion.div>

          <motion.div
            whileHover={{ y: -6 }}
            className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-[#14B8A6] transition space-y-3 shadow-md relative overflow-hidden group"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#14B8A6] border border-teal-200 flex items-center justify-center group-hover:bg-[#14B8A6] group-hover:text-white transition">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-gray-800">Safety Guardrails</h4>
            <p className="text-xs text-slate-600 leading-relaxed">Automated post-filters prevent diagnostic or prescriptive text.</p>
            <div className="h-1 w-full bg-[#14B8A6] absolute bottom-0 left-0" />
          </motion.div>
        </div>
      </section>

      {/* COMPREHENSIVE PIPELINE SERVICES */}
      <section id="services" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="px-3.5 py-1.5 rounded-full bg-sky-50 text-[#0EA5E9] border border-sky-200 text-xs font-mono font-bold">
            MEDICAL PIPELINE SERVICES
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-800 tracking-tight">
            Comprehensive <span className="text-[#0EA5E9]">Clinical Pipeline</span> Services
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-md space-y-4">
            <div className="p-3 w-fit rounded-2xl bg-sky-50 text-[#0EA5E9] border border-sky-200">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Patient Intake (FR1)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">Capture self-reported symptoms, conditions, allergies, and medications tagged with user provenance.</p>
            <button onClick={onLaunchApp} className="text-xs font-bold text-[#0EA5E9] flex items-center gap-1 hover:gap-2 transition">
              Explore Intake →
            </button>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-md space-y-4">
            <div className="p-3 w-fit rounded-2xl bg-emerald-50 text-[#22C55E] border border-emerald-200">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Report OCR & Extraction (FR2/4)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">Upload lab PDFs or image scans. OCR extracts text while LLM structures parameters with confidence scores.</p>
            <button onClick={onLaunchApp} className="text-xs font-bold text-[#22C55E] flex items-center gap-1 hover:gap-2 transition">
              Explore Extraction →
            </button>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-md space-y-4">
            <div className="p-3 w-fit rounded-2xl bg-amber-50 text-[#F59E0B] border border-amber-200">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Safe AI Summaries (FR6)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">Generate safe, plain-language summaries grounded strictly in structured record data with mandatory disclaimers.</p>
            <button onClick={onLaunchApp} className="text-xs font-bold text-[#F59E0B] flex items-center gap-1 hover:gap-2 transition">
              Explore AI Summary →
            </button>
          </div>
        </div>
      </section>

      {/* OUR SPECIALISTS SECTION */}
      <section id="specialists" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-6">
          <div className="space-y-2">
            <span className="px-3.5 py-1.5 rounded-full bg-teal-50 text-[#14B8A6] border border-teal-200 text-xs font-mono font-bold">
              EXPERT CARE YOU CAN TRUST
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-800 tracking-tight">
              Our <span className="text-[#0EA5E9]">Specialists</span> & Safety Auditors
            </h2>
          </div>

          {/* Carousel Arrows */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveDoctorIndex((prev) => (prev > 0 ? prev - 1 : doctors.length - 1))}
              className="p-3 rounded-full bg-white hover:bg-[#0EA5E9] text-slate-700 hover:text-white border border-slate-200 shadow-xs transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveDoctorIndex((prev) => (prev < doctors.length - 1 ? prev + 1 : 0))}
              className="p-3 rounded-full bg-white hover:bg-[#0EA5E9] text-slate-700 hover:text-white border border-slate-200 shadow-xs transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Doctor Profile Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {doctors.map((doc, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -8 }}
              className="rounded-3xl overflow-hidden border border-slate-200 bg-white relative group shadow-md"
            >
              <div className="h-80 w-full overflow-hidden">
                <img
                  src={doc.image}
                  alt={doc.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
              </div>

              <div className="p-6 bg-white space-y-2">
                <span className="px-2.5 py-1 rounded-full bg-sky-50 text-[#0EA5E9] text-[10px] font-mono border border-sky-200 font-semibold">
                  {doc.badge}
                </span>
                <h3 className="text-xl font-extrabold text-gray-800">{doc.name}</h3>
                <p className="text-xs text-slate-500 font-medium">{doc.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PATIENT STORIES / TESTIMONIALS */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="px-3.5 py-1.5 rounded-full bg-sky-50 text-[#0EA5E9] border border-sky-200 text-xs font-mono font-bold">
            PATIENT STORIES
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-800 tracking-tight">
            Trusted by Patients, <span className="text-[#0EA5E9]">Proven by Care</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <div key={idx} className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-md">
              <div className="flex items-center gap-1 text-[#F59E0B]">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#F59E0B]" />
                ))}
              </div>

              <p className="text-xs text-slate-700 leading-relaxed italic">
                &quot;{t.text}&quot;
              </p>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                <div>
                  <div className="text-xs font-bold text-gray-800">{t.name}</div>
                  <div className="text-[10px] text-slate-500 font-medium">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HEALTH INSIGHTS / BLOG SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="px-3.5 py-1.5 rounded-full bg-sky-50 text-[#0EA5E9] border border-sky-200 text-xs font-mono font-bold">
            HEALTH INSIGHTS
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-800 tracking-tight">
            Medical Articles & News <span className="text-[#0EA5E9]">for Better Health</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogs.map((b, idx) => (
            <div key={idx} className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-md space-y-4 group">
              <div className="h-48 w-full overflow-hidden relative">
                <img src={b.image} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 text-slate-800 text-[10px] font-mono border border-slate-200 font-semibold shadow-xs">
                  {b.date}
                </span>
              </div>
              <div className="p-6 space-y-2">
                <h4 className="text-base font-bold text-gray-800 group-hover:text-[#0EA5E9] transition">{b.title}</h4>
                <p className="text-xs text-slate-600 line-clamp-2">{b.snippet}</p>
                <button onClick={onLaunchApp} className="text-xs font-bold text-[#0EA5E9] flex items-center gap-1 pt-2 hover:gap-2 transition">
                  Read Article →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ ACCORDION SECTION */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <span className="px-3.5 py-1.5 rounded-full bg-sky-50 text-[#0EA5E9] border border-sky-200 text-xs font-mono font-bold">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-800 tracking-tight">
            Have Questions? <span className="text-[#0EA5E9]">We Have Answers.</span>
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="rounded-2xl bg-white border border-slate-200 overflow-hidden transition shadow-xs">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-gray-800 hover:text-[#0EA5E9]"
              >
                <span>{faq.q}</span>
                <div className="w-7 h-7 rounded-full bg-sky-50 text-[#0EA5E9] flex items-center justify-center shrink-0">
                  {openFaq === idx ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CALL TO ACTION BANNER */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="rounded-3xl bg-[#0EA5E9] text-white p-8 sm:p-12 text-center space-y-6 shadow-xl relative overflow-hidden">
          <span className="px-3.5 py-1.5 rounded-full bg-white text-[#0EA5E9] text-xs font-mono font-bold">
            GET STARTED TODAY
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Ready to Process & Structure Your Medical Reports?
          </h2>
          <p className="text-sm font-semibold max-w-xl mx-auto opacity-90">
            Launch the clinical workspace to upload lab reports, verify extracted parameters, and generate safe AI summaries.
          </p>

          <div className="flex items-center justify-center gap-3">
            <div className="h-0.5 w-16 bg-white/30" />
            <Heart className="w-5 h-5 text-white fill-white" />
            <div className="h-0.5 w-16 bg-white/30" />
          </div>

          <button
            onClick={onLaunchApp}
            className="px-8 py-4 rounded-full bg-gray-900 hover:bg-slate-800 text-white font-black text-sm shadow-lg hover:scale-105 transition-all duration-300 inline-flex items-center gap-2"
          >
            <span>Launch Clinical Workspace</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white pt-16 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0EA5E9] to-[#14B8A6] flex items-center justify-center">
                <Activity className="w-4 h-4 text-white font-black" />
              </div>
              <span className="text-lg font-black text-gray-800">MedLens AI</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Modern AI clinical intelligence pipeline for structured medical records, provenance auditability, and reference-range safety.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <input
                type="email"
                placeholder="Enter Email Id"
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#0EA5E9] flex-1"
              />
              <button className="p-2 rounded-xl bg-[#0EA5E9] text-white hover:bg-sky-600">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider font-mono">Quick Links</h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li><a href="#hero" className="hover:text-[#0EA5E9]">Home</a></li>
              <li><a href="#about" className="hover:text-[#0EA5E9]">About Us</a></li>
              <li><a href="#services" className="hover:text-[#0EA5E9]">Services</a></li>
              <li><a href="#specialists" className="hover:text-[#0EA5E9]">Specialists</a></li>
              <li><a href="#faq" className="hover:text-[#0EA5E9]">FAQ</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider font-mono">Our Services</h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li><button onClick={onLaunchApp} className="hover:text-[#0EA5E9]">Patient Intake (FR1)</button></li>
              <li><button onClick={onLaunchApp} className="hover:text-[#0EA5E9]">OCR & Extraction (FR2)</button></li>
              <li><button onClick={onLaunchApp} className="hover:text-[#0EA5E9]">Reference Engine (FR4)</button></li>
              <li><button onClick={onLaunchApp} className="hover:text-[#0EA5E9]">Split Evidence Viewer (FR7)</button></li>
              <li><button onClick={onLaunchApp} className="hover:text-[#0EA5E9]">AI Summary Safety (FR6)</button></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider font-mono">Contact Us</h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-[#0EA5E9]" /> +1 (800) 555-1234</li>
              <li className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-[#0EA5E9]" /> info@medlens.ai</li>
              <li className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-[#0EA5E9]" /> 245 Healthcare Avenue, NY</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 text-center text-xs text-slate-500 font-mono">
          Copyright © 2026 MedLens AI. All rights reserved. • Clinical Intelligence Light Theme
        </div>
      </footer>
    </div>
  );
};
