/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  FileText, 
  Upload, 
  Award, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Sparkles, 
  RefreshCw, 
  Target, 
  Flame, 
  BookOpen, 
  Briefcase,
  ArrowLeft
} from "lucide-react";
import { ResumeAnalysis } from "../types";
import { playClickSound, playSuccessSound } from "../utils/audio";

// Indian-standard top-tier sample resume for testing
const SAMPLE_RESUME_TEXT = `
SIDDHARTH SHARMA
siddharth.sharma.coder@gmail.com | +91 98305 27491 | Bengaluru, India
GitHub: github.com/sid-sharma | CodeChef: codechef.com/users/sid_sharma | LinkedIn: linkedin.com/in/sid-sharma

EDUCATION
National Institute of Technology (NIT) | B.Tech in Computer Science and Engineering
CGPA: 8.76 / 10.00 | 2023 - 2027

SKILLS
Computer Science Fundamentals: Data Structures & Algorithms (DSA), Object-Oriented Programming (OOPs), DBMS, Computer Networks
Frontend: React, TypeScript, Redux Toolkit, Tailwind CSS, ES6+ Javascript
Backend: Node.js, Express, JDBC, RESTful APIs
Databases & Dev Tools: PostgreSQL, MongoDB, MySql, Redis, Git, Postman

PROJECTS
UPI Payments Routing Orchestrator | React, Node.js, Express, Redis, PostgreSQL
- Designed and engineered an optimized UPI transaction routing simulator preventing double-spend situations.
- Integrated Redis pub/sub queue patterns to achieve transaction processing and lock validation under 85ms.
- Built a front-end telemetry board to view simulate peak placement loads and active transaction states.

Railway Ticket Concurrency System | Node.js, Express, MongoDB, WebSockets
- Created a reliable seat-locker service that resolves high-volume concurrent booking racing conditions.
- Implemented real-time train status dashboards using robust, responsive socket channels.

EXPERIENCE
Summer Software Engineering Intern - Razorpay | May 2025 - July 2025
- Contributed to core transaction checkout elements, resolving 3 high-priority production front-end bugs.
- Iteratively optimized internal payment merchant dashboards, accelerating API data retrieval size by 30%.
- Participated in weekly standups and code reviews with Bengaluru based payments core engineering peers.
`;

interface ResumeAnalyzerProps {
  onAnalysisSuccess: (analysis: ResumeAnalysis) => void;
  previousAnalyses: ResumeAnalysis[];
  onBack?: () => void;
}

export default function ResumeAnalyzer({ onAnalysisSuccess, previousAnalyses, onBack }: ResumeAnalyzerProps) {
  const [resumeText, setResumeText] = useState("");
  const [targetRole, setTargetRole] = useState("Full Stack Software Engineer");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"ats" | "details" | "missing" | "keywords">("ats");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Track selected active analysis
  const [selectedAnalysis, setSelectedAnalysis] = useState<ResumeAnalysis | null>(
    previousAnalyses.length > 0 ? previousAnalyses[0] : null
  );

  // Trigger analysis call to server
  const handleAnalyze = async (textToAnalyze: string = resumeText) => {
    setErrorMsg(null);
    if (!textToAnalyze || textToAnalyze.trim().length < 50) {
      setErrorMsg("Please paste or load a valid, detailed resume content (at least 50 characters).");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: textToAnalyze,
          targetRole: targetRole
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to analyze resume.");
      }

      const result: ResumeAnalysis = await response.json();
      playSuccessSound();
      onAnalysisSuccess(result);
      setSelectedAnalysis(result);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Something went wrong during parsing. Verify configuration is active.");
    } finally {
      setLoading(false);
    }
  };

  const loadSample = () => {
    playClickSound();
    setResumeText(SAMPLE_RESUME_TEXT);
    setErrorMsg(null);
  };

  const getScoreGrade = (score: number) => {
    if (score >= 80) return { label: "ATS Pass", color: "text-emerald-400 bg-emerald-950/40 border-emerald-800", rating: "Excellent" };
    if (score >= 60) return { label: "Ready to Apply (Borderline)", color: "text-amber-400 bg-amber-950/40 border-amber-800", rating: "Average" };
    return { label: "ATS Rejected", color: "text-rose-400 bg-rose-950/40 border-rose-800", rating: "Action Required" };
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Back to Dashboard navigation */}
      {onBack && (
        <div className="text-left">
          <button 
            onClick={() => { playClickSound(); onBack(); }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 text-xs text-slate-400 hover:text-indigo-300 transition-all duration-200 shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </button>
        </div>
      )}

      {/* Header section */}
      <div className="text-left space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-550/15 border border-indigo-900/30 text-[10px] text-indigo-300 font-mono">
          🇮🇳 Indian Campus & Off-Campus Placement Standards
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">AI Resume Analyzer & ATS Scorer</h1>
        <p className="text-slate-400 text-sm">
          Audit your resume alignment against tech recruiters in major Indian hubs (Bengaluru, Hyderabad, Gurugram, Pune). Evaluate CGPA scales, DSA core elements, and industry certifications.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Upload & Input area: span 5 */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md space-y-5">
            <h2 className="text-base font-bold font-mono tracking-tight text-slate-400 uppercase flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              Upload Resume Content
            </h2>

            <div className="space-y-3.5">
              <label className="block text-xs font-mono text-slate-400">Target Career Placement Role</label>
              <input 
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Full Stack React Developer"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 outline-none focus:border-indigo-600 transition"
              />
            </div>

            <div className="space-y-2 text-left">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-mono text-slate-400">Paste Full Resume Text</label>
                <button 
                  onClick={loadSample}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium tracking-tight flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-amber-400 animate-bounce" />
                  Load High-Spec Sample
                </button>
              </div>

              <textarea 
                rows={11}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste the raw text of your resume here, including Education, Skills, Projects, Experience, and Certifications..."
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 outline-none focus:border-indigo-600 transition resize-none placeholder-slate-600"
              />
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-800 text-xs text-rose-300 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <p>{errorMsg}</p>
              </div>
            )}

            <button 
              onClick={() => { playClickSound(); handleAnalyze(); }}
              disabled={loading || !resumeText.trim()}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-medium tracking-tight shadow-lg hover:scale-[1.01] transition-all disabled:opacity-40 disabled:hover:scale-100 flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Compiling & Auditing Sector Metrics...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Analyze & Calculate score
                </>
              )}
            </button>
          </div>

          {/* Previous History List */}
          {previousAnalyses.length > 0 && (
            <div className="p-5 rounded-2xl bg-slate-900/20 border border-slate-800/60 text-left">
              <h3 className="text-xs font-mono text-slate-400 uppercase mb-3">Analysis History</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {previousAnalyses.map((an) => (
                  <div 
                    key={an.id}
                    onClick={() => setSelectedAnalysis(an)}
                    className={`p-3 rounded-xl border cursor-pointer transition flex justify-between items-center ${
                      selectedAnalysis?.id === an.id 
                        ? "bg-slate-900 border-indigo-500/20" 
                        : "bg-slate-950/60 border-slate-900 hover:bg-slate-900/40"
                    }`}
                  >
                    <div>
                      <span className="block text-xs font-bold text-slate-200">
                        {an.parsedData.name || "Default Candidate"}
                      </span>
                      <span className="block text-[10px] text-slate-500">
                        {new Date(an.analyzedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-sm tracking-tight text-white">{an.atsReport?.totalScore || 70}%</span>
                      <span className="block text-[8px] font-mono text-indigo-400 leading-none">ATS Score</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Visualizing Results: span 7 */}
        <div className="lg:col-span-7">
          
          <AnimatePresence mode="wait">
            {loading ? (
              // Loading/Scanning layout
              <motion.div 
                key="loading-scanner"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="p-10 rounded-2xl border border-indigo-950/60 bg-slate-900/20 backdrop-blur-md h-[550px] flex flex-col items-center justify-center text-center space-y-6"
              >
                <div className="relative w-32 h-32 rounded-full border border-indigo-800/40 flex items-center justify-center overflow-hidden">
                  {/* Glowing core */}
                  <div className="absolute w-24 h-24 rounded-full bg-indigo-500/10 blur-[20px] animate-pulse" />
                  <FileText className="w-12 h-12 text-indigo-400 absolute" />
                  
                  {/* Active Scanning laser bar */}
                  <motion.div 
                    className="absolute left-0 right-0 h-[2px] bg-cyan-400 shadow-[0_0_8px_cyan]"
                    animate={{ top: ["10%", "90%", "10%"] }}
                    transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold font-mono tracking-tight text-slate-200 animate-pulse">Running Structural Parsing Engine...</h3>
                  <p className="text-xs text-slate-400 max-w-sm">
                    The placement parsing engine is decoding your resume sectors, computing overall bullet metrics, evaluating experiences, and filtering high-density ATS keyword arrays.
                  </p>
                </div>

                <div className="w-48 bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-900">
                  <motion.div 
                    className="bg-indigo-500 h-full rounded-full"
                    animate={{ width: ["10%", "95%", "10%"] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                  />
                </div>
              </motion.div>
            ) : selectedAnalysis ? (
              // Results dashboard
              <motion.div 
                key="results-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 text-left"
              >
                
                {/* Score Summary Banner */}
                <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900/90 via-indigo-950/20 to-slate-900/95 border border-indigo-900/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
                  
                  {/* Circle Score */}
                  <div className="flex items-center gap-4 text-left">
                    <div className="relative flex items-center justify-center">
                      <svg className="w-24 h-24 transform -rotate-90">
                        <circle cx="48" cy="48" r="42" className="stroke-slate-800 fill-none" strokeWidth="6" />
                        <circle 
                          cx="48" 
                          cy="48" 
                          r="42" 
                          className="stroke-indigo-500 fill-none" 
                          strokeWidth="8"
                          strokeDasharray={2 * Math.PI * 42}
                          strokeDashoffset={2 * Math.PI * 42 - (selectedAnalysis.atsReport.totalScore / 100) * (2 * Math.PI * 42)}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute text-center">
                        <span className="text-2xl font-black">{selectedAnalysis.atsReport.totalScore}</span>
                        <span className="block text-[8px] font-mono text-slate-500 uppercase leading-none">ATS Score</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-medium text-indigo-400">ANALYSIS COMPLETE</span>
                      <h3 className="text-xl font-extrabold text-[#F8FAFC]">
                        {selectedAnalysis.parsedData.name || "Alex Rivera"}
                      </h3>
                      <div className="flex gap-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${getScoreGrade(selectedAnalysis.atsReport.totalScore).color}`}>
                          {getScoreGrade(selectedAnalysis.atsReport.totalScore).label}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 pt-0.5">Rating: {getScoreGrade(selectedAnalysis.atsReport.totalScore).rating}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-[10px] font-mono text-slate-400 uppercase">education level</p>
                    <p className="text-xs font-bold text-slate-300">
                      {selectedAnalysis.parsedData.education?.[0]?.degree || "CS Bachelor's"}
                    </p>
                    <p className="text-[10px] text-slate-500">{selectedAnalysis.parsedData.education?.[0]?.institution || "State University"}</p>
                  </div>
                </div>

                {/* Sub Tab selection */}
                <div className="border-b border-indigo-950/60 flex gap-2">
                  {[
                    { id: "ats", label: "ATS Score Breakdown" },
                    { id: "details", label: "Strengths & Gaps" },
                    { id: "missing", label: "Missing Skills" },
                    { id: "keywords", label: "Keyword Densities" }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-4 py-2.5 text-xs font-bold tracking-tight border-b-2 transition duration-200 capitalize ${
                        activeTab === tab.id 
                          ? "border-indigo-500 text-indigo-300" 
                          : "border-transparent text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab content area */}
                <div className="p-6 rounded-2xl bg-slate-900/30 border border-slate-800/80 min-h-[300px]">
                  
                  {activeTab === "ats" && (
                    <div className="space-y-5">
                      <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                        <Target className="w-4 h-4 text-indigo-400" />
                        Weighted Rubric Calculations (Goal: 100)
                      </h4>
                      
                      <div className="space-y-4">
                        {[
                          { key: "contactInfo", label: "Contact Information", max: 10 },
                          { key: "education", label: "Education Credentials", max: 15 },
                          { key: "projects", label: "Interactive Projects", max: 15 },
                          { key: "skills", label: "Explicit Skill Sections", max: 20 },
                          { key: "experience", label: "Internships & Experience", max: 15 },
                          { key: "certifications", label: "Earned Certifications", max: 10 },
                          { key: "keywords", label: "Target Keywords Matching", max: 10 },
                          { key: "formatting", label: "Formatting Alignment", max: 5 }
                        ].map((rub) => {
                          const pts = (selectedAnalysis.atsReport as any)[rub.key] || 0;
                          const pct = (pts / rub.max) * 100;
                          
                          return (
                            <div key={rub.key} className="space-y-1.5 text-xs">
                              <div className="flex justify-between items-center text-slate-300 font-medium">
                                <span>{rub.label}</span>
                                <span className="font-mono text-indigo-300 font-bold">{pts} / {rub.max} PTS</span>
                              </div>
                              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-900">
                                <motion.div 
                                  className="bg-indigo-500 h-2 rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{ duration: 0.8 }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {activeTab === "details" && (
                    <div className="space-y-6">
                      {/* Strengths */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-mono font-bold tracking-tight text-emerald-400 uppercase flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4" />
                          Key Outstanding Strengths
                        </h4>
                        <ul className="space-y-2">
                          {selectedAnalysis.strengths.map((str, i) => (
                            <li key={i} className="text-xs text-slate-300 bg-emerald-950/20 px-3.5 py-2 rounded-lg border border-emerald-950/40 leading-relaxed">
                              {str}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Gaps / weaknesses */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-mono font-bold tracking-tight text-rose-400 sniper uppercase flex items-center gap-1.5">
                          <XCircle className="w-4 h-4" />
                          Missing Content or Structural Gaps
                        </h4>
                        <ul className="space-y-2">
                          {selectedAnalysis.weaknesses.map((wea, i) => (
                            <li key={i} className="text-xs text-slate-300 bg-rose-950/20 px-3.5 py-2 rounded-lg border border-rose-950/40 leading-relaxed">
                              {wea}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Formatting suggestions */}
                      {selectedAnalysis.formattingSuggestions && selectedAnalysis.formattingSuggestions.length > 0 && (
                        <div className="space-y-3 pt-2">
                          <h4 className="text-xs font-mono font-bold tracking-tight text-indigo-300 uppercase flex items-center gap-1.5">
                            <Flame className="w-4 h-4" />
                            Impact & Formatting Adjustments
                          </h4>
                          <ul className="space-y-2">
                            {selectedAnalysis.formattingSuggestions.map((sug, i) => (
                              <li key={i} className="text-xs text-slate-400 leading-snug">
                                <span className="font-bold text-slate-300">•</span> {sug}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "missing" && (
                    <div className="space-y-5">
                      <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-900/40 text-left space-y-2">
                        <span className="text-[10px] font-mono text-indigo-300 uppercase font-bold">advanced intelligence assessment</span>
                        <p className="text-xs text-slate-400">
                          These technical competencies are highly expected by placement recruiters hiring for the <span className="font-bold text-slate-200">"{targetRole}"</span> position. Learn online, build quick portfolio projects, and append them!
                        </p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {selectedAnalysis.missingSkills.map((skill, index) => (
                          <div 
                            key={index}
                            className="p-3 rounded-xl bg-slate-950 border border-slate-900 hover:border-slate-800 transition text-left flex items-center gap-2"
                          >
                            <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                            <span className="text-xs font-bold text-slate-300 tracking-tight">{skill}</span>
                          </div>
                        ))}
                      </div>

                      {selectedAnalysis.recommendedKeywords && selectedAnalysis.recommendedKeywords.length > 0 && (
                        <div className="pt-4 border-t border-slate-800/60">
                          <h5 className="text-[11px] font-mono text-slate-500 uppercase mb-3">recommended high-impact keywords to add</h5>
                          <div className="flex flex-wrap gap-2">
                            {selectedAnalysis.recommendedKeywords.map((kw, i) => (
                              <span key={i} className="px-2.5 py-1 rounded bg-slate-900 text-[10px] font-mono text-indigo-400 border border-slate-800">
                                {kw}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "keywords" && (
                    <div className="space-y-5">
                      <h4 className="text-sm font-bold text-slate-200">Analyze Keyword Balance</h4>
                      <p className="text-xs text-slate-400">
                        Over-stuffing looks spammy, while under-representing key technologies drops search metrics. Aim to meet target recommends.
                      </p>

                      <div className="space-y-3.5">
                        {selectedAnalysis.keywordDensity && selectedAnalysis.keywordDensity.length > 0 ? (
                          selectedAnalysis.keywordDensity.map((kd, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs p-3 rounded-lg bg-slate-950/60 border border-slate-900">
                              <span className="font-mono text-slate-300 font-bold">{kd.keyword}</span>
                              <div className="flex items-center gap-4">
                                <span className="text-slate-500">Detected: <span className="font-bold text-[#F8FAFC]">{kd.count}</span></span>
                                <span className="text-slate-500">Target: <span className="font-bold text-indigo-400">{kd.recommendCount}</span></span>
                                
                                {kd.count >= kd.recommendCount ? (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-900 font-bold">Balanced</span>
                                ) : (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-950/50 text-rose-400 border border-rose-900/50 font-bold">Add More</span>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-10 text-slate-650 space-y-1">
                            <p className="text-xs">No dense keywords mapped.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </div>

              </motion.div>
            ) : (
              // Empty initial card State
              <div className="p-12 rounded-2xl border-2 border-dashed border-slate-800 text-center h-[550px] flex flex-col items-center justify-center space-y-4">
                <FileText className="w-16 h-16 text-slate-700 stroke-1" />
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-400">Ready for Diagnostic Audit</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                    Paste your resume and select a target career path on the left. Click "Analyze" to stream structured ATS estimations instantly via our diagnostic engine.
                  </p>
                </div>
              </div>
            )}
          </AnimatePresence>

        </div>

      </div>

    </div>
  );
}
