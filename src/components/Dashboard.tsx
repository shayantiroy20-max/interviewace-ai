/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { 
  Sparkles, 
  TrendingUp, 
  FileText, 
  MessageSquare, 
  Play, 
  MapPin, 
  Compass, 
  History, 
  AlertCircle,
  Clock,
  UserCheck,
  CheckCircle2,
  ListRestart,
  Download
} from "lucide-react";
import { UserProfile, DashboardMetrics, ActivityLog, ResumeAnalysis, MockInterviewSession, CareerRoadmap } from "../types";
import { playClickSound, playSuccessSound } from "../utils/audio";
import { generatePerformanceReportPDF } from "../utils/pdfGenerator";

interface DashboardProps {
  user: UserProfile;
  metrics: DashboardMetrics;
  activities: ActivityLog[];
  resumes?: ResumeAnalysis[];
  interviews?: MockInterviewSession[];
  roadmaps?: CareerRoadmap[];
  onNavigate: (view: string) => void;
  onClearActivities: () => void;
}

export default function Dashboard({ 
  user, 
  metrics, 
  activities, 
  resumes = [], 
  interviews = [], 
  roadmaps = [], 
  onNavigate, 
  onClearActivities 
}: DashboardProps) {

  const latestResume = resumes.length > 0 ? resumes[0] : undefined;
  const latestInterview = interviews.length > 0 ? interviews[0] : undefined;
  const latestRoadmap = roadmaps.length > 0 ? roadmaps[0] : undefined;
  
  // Scoring status color helper
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400 bg-emerald-950/40 border-emerald-800/30";
    if (score >= 60) return "text-amber-400 bg-amber-950/40 border-amber-800/30";
    return "text-rose-400 bg-rose-950/40 border-rose-800/30";
  };

  const getScoreRingColor = (score: number) => {
    if (score >= 80) return "stroke-emerald-400";
    if (score >= 60) return "stroke-amber-400";
    return "stroke-rose-400";
  };

  // Static recommended prep checklists
  const recommendedChecklists = [
    { title: "Upload / Update Latest Resume Text", done: metrics.atsScore > 0, action: "Go to Analyzer", view: "resume" },
    { title: "Complete Technical Mock Interview Session", done: metrics.interviewScore > 0, action: "Launch Sprints", view: "interview" },
    { title: "Formulate Your Customized Learning Roadmap", done: metrics.placementReadinessScore > 50, action: "Plan Curriculum", view: "roadmap" },
    { title: "Polish Core Communication and Accent Patterns", done: metrics.communicationScore > 70, action: "Record HR Session", view: "interview" }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Top Banner section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 md:p-8 rounded-2xl bg-gradient-to-r from-slate-900/90 via-indigo-950/20 to-slate-900/95 border border-indigo-950 shadow-xl backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[300px] h-full bg-indigo-500/5 blur-[50px] pointer-events-none" />
        
        <div className="space-y-2 text-left relative z-10 w-full md:w-3/4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-950 border border-indigo-800 text-[10px] text-indigo-300 font-mono">
            <Sparkles className="w-3 h-3 text-amber-400 animate-spin" />
            PLACEMENT ECOSYSTEM ONLINE
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
            Welcome back, <span className="bg-gradient-to-r from-indigo-300 to-purple-400 bg-clip-text text-transparent">{user.fullName}</span>!
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
            Targeting Role: <span className="text-indigo-300 font-medium font-mono">{user.targetRole || "Software Engineer Intern"}</span>. Your overall diagnostic dashboard evaluates custom resumes, mock scores, and micro curriculum milestones. 
          </p>
        </div>

        <div className="relative z-10 shrink-0 flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <button 
            onClick={() => {
              playSuccessSound();
              generatePerformanceReportPDF(user, metrics, latestResume, latestInterview, latestRoadmap);
            }}
            className="w-full sm:w-auto px-4 py-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono font-bold hover:border-indigo-500/50 hover:text-indigo-300 hover:bg-slate-900 text-slate-300 transition duration-150 flex items-center justify-center gap-2 shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            Download Summary PDF
          </button>

          <button 
            onClick={() => { playClickSound(); onNavigate("interview"); }}
            className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 font-medium hover:from-indigo-500 hover:to-purple-500 text-xs sm:text-sm tracking-tight shadow-md flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            Interview Practice Run
          </button>
        </div>
      </div>

      {/* Main Scoring Grid */}
      <div>
        <h2 className="text-lg font-bold font-mono tracking-tight text-slate-400 uppercase mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-400" />
          placement readiness diagnostic scores
        </h2>
        
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: "Overall Resume Score", value: metrics.resumeScore, desc: "Evaluates standard bullet sections" },
            { label: "ATS Matching Score", value: metrics.atsScore, desc: "Specific keywords & formatting alignment" },
            { label: "Mock Interview Score", value: metrics.interviewScore, desc: "Accuracy across completed sessions" },
            { label: "Linguistic & Vocab", value: metrics.communicationScore, desc: "Clarity, pace, and response strength" },
            { label: "Placement Readiness", value: metrics.placementReadinessScore, desc: "Global index out of 100", highlight: true }
          ].map((score, idx) => {
            const pct = score.value;
            const circum = 2 * Math.PI * 34; // r=34
            const offset = circum - (pct / 100) * circum;
            
            return (
              <div 
                key={idx} 
                className={`p-5 rounded-2xl border bg-slate-900/60 backdrop-blur-sm transition-all flex flex-col justify-between ${
                  score.highlight 
                    ? "col-span-2 lg:col-span-1 border-indigo-500/20 shadow-lg shadow-indigo-550/5 bg-gradient-to-b from-indigo-950/20 to-slate-900/60" 
                    : "border-slate-800"
                }`}
              >
                <div>
                  <p className="text-xs text-slate-400 font-semibold tracking-tight h-8 leading-tight">{score.label}</p>
                  <p className="text-[10px] text-slate-500 leading-none mt-1">{score.desc}</p>
                </div>

                <div className="my-5 flex items-center justify-center relative">
                  {/* Custom SVG Circular Progress */}
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle cx="40" cy="40" r="34" className="stroke-slate-800 fill-none" strokeWidth="4" />
                    <motion.circle 
                      cx="40" 
                      cy="40" 
                      r="34" 
                      className={`fill-none ${getScoreRingColor(pct)}`} 
                      strokeWidth="5"
                      strokeDasharray={circum}
                      initial={{ strokeDashoffset: circum }}
                      animate={{ strokeDashoffset: offset }}
                      transition={{ duration: 1, delay: idx * 0.1 }}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-lg font-black tracking-tight">{pct}%</span>
                  </div>
                </div>

                <div className={`mt-2 py-1 px-2.5 rounded-lg border text-[10px] text-center font-bold tracking-tight uppercase ${getScoreColor(pct)}`}>
                  {pct >= 80 ? "Pass (Elite)" : pct >= 60 ? "Improvement Needed" : "Deficient"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two-Column split details layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recommendation checklist & Sprints progress: span 2 */}
        <div className="lg:col-span-2 space-y-8">
          <div className="p-6 rounded-2xl bg-slate-900/30 border border-slate-800/80">
            <h3 className="text-lg font-bold mb-4 flex items-center justify-between">
              <span>Targeted Preparation Checklist</span>
              <span className="text-xs text-indigo-400 font-mono">Steps to Unlock 85%+</span>
            </h3>

            <div className="space-y-3.5">
              {recommendedChecklists.map((chk, index) => (
                <div 
                  key={index} 
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border transition-all ${
                    chk.done 
                      ? "bg-slate-950/40 border-emerald-950/65" 
                      : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700"
                  }`}
                >
                  <div className="flex gap-3 text-left">
                    {chk.done ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-700 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className={`text-xs sm:text-sm font-semibold ${chk.done ? "text-slate-400 line-through" : "text-slate-300"}`}>{chk.title}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Recommended metric targets & roadmap steps</p>
                    </div>
                  </div>

                  {!chk.done && (
                    <button 
                      onClick={() => { playClickSound(); onNavigate(chk.view); }}
                      className="px-3.5 py-1.5 rounded-lg text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-900 hover:bg-slate-800/60 transition shrink-0 align-self-start sm:align-self-auto"
                    >
                      {chk.action}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Hub Navigation Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div 
              onClick={() => { playClickSound(); onNavigate("resume"); }}
              className="p-5 rounded-xl border border-slate-800 bg-slate-900/30 hover:border-indigo-500/20 active:bg-slate-900/50 transition cursor-pointer text-left group"
            >
              <FileText className="w-5 h-5 text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-slate-200">Audit ATS Resume</p>
              <p className="text-[10px] text-slate-500 mt-1">Upload and let the ATS compiler audit strengths, weaknesses, formatting gaps, and density metrics.</p>
            </div>

            <div 
              onClick={() => { playClickSound(); onNavigate("interview"); }}
              className="p-5 rounded-xl border border-slate-800 bg-slate-900/30 hover:border-purple-500/20 active:bg-slate-900/50 transition cursor-pointer text-left group"
            >
              <MessageSquare className="w-5 h-5 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-slate-200">Launch Mock Loop</p>
              <p className="text-[10px] text-slate-500 mt-1">Simulate highly complex, live-timed corporate conversations. Get instant sentence audits.</p>
            </div>

            <div 
              onClick={() => { playClickSound(); onNavigate("roadmap"); }}
              className="p-5 rounded-xl border border-slate-800 bg-slate-900/30 hover:border-cyan-500/20 active:bg-slate-900/50 transition cursor-pointer text-left group"
            >
              <Compass className="w-5 h-5 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-slate-200">Prepare Roadmap</p>
              <p className="text-[10px] text-slate-500 mt-1">Synthesize goals into step-by-step phases, required certification courses, and projects.</p>
            </div>
          </div>
        </div>

        {/* Recent logs and achievements: span 1 */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/30 border border-slate-800/80 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800/60">
              <span className="text-xs font-bold font-mono text-slate-400 flex items-center gap-2">
                <History className="w-4 h-4 text-purple-400" />
                RECENT ACTIVITY FEED
              </span>
              <button 
                onClick={() => { playClickSound(); onClearActivities(); }}
                className="text-[10px] hover:text-rose-400 text-slate-500 transition duration-150 flex items-center gap-1"
              >
                <ListRestart className="w-3 h-3" />
                Reset
              </button>
            </div>

            <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
              {activities.length === 0 ? (
                <div className="text-center py-10 text-slate-600 space-y-2">
                  <AlertCircle className="w-8 h-8 mx-auto stroke-slate-700" />
                  <p className="text-xs font-mono">No recent activity logged.</p>
                </div>
              ) : (
                activities.map((act, index) => {
                  const dateStr = new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  
                  return (
                    <div key={act.id} className="flex gap-3 text-left relative group">
                      {/* Vertical connector line */}
                      {index < activities.length - 1 && (
                        <div className="absolute left-2.5 top-6 bottom-[-20px] w-[1px] bg-slate-800 group-hover:bg-slate-700 transition" />
                      )}
                      
                      <div className="w-5 h-5 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 mt-1 relative z-10">
                        <Clock className="w-2.5 h-2.5 text-slate-500" />
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-300 leading-tight">{act.title}</p>
                          {act.scoreDelta && act.scoreDelta > 0 && (
                            <span className="text-[9px] px-1 py-0.5 rounded font-mono bg-indigo-950 text-indigo-400">+{act.scoreDelta} PTS</span>
                          )}
                        </div>
                        <p className="text-[10.5px] text-slate-500 leading-snug">{act.description}</p>
                        <span className="block text-[8.5px] font-mono text-slate-600">{dateStr}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/60 text-center">
              <span className="text-[10px] text-slate-650 font-mono tracking-tight uppercase flex items-center justify-center gap-1.5 leading-none">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                Durable session state active
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
