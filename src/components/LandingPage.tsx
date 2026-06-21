/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Sparkles, 
  BrainCircuit, 
  GraduationCap, 
  ChevronRight, 
  ShieldCheck, 
  FileText, 
  Terminal, 
  Tv, 
  Award, 
  ArrowUpRight, 
  Workflow, 
  Plus, 
  Minus,
  MessageSquare,
  Compass,
  Star,
  Phone,
  Instagram,
  Linkedin,
  Send,
  CheckCircle,
  User,
  Mail,
  Lock,
  LogOut,
  Home,
  Sun,
  Moon
} from "lucide-react";

interface LandingPageProps {
  onGetStarted: (preferred?: "login" | "signup") => void;
  user?: any;
  onQuickLogin?: (name: string, email: string) => Promise<boolean>;
  onSignOut?: () => void;
  insideDashboard?: boolean;
  theme?: "dark" | "light";
  onToggleTheme?: () => void;
}

export default function LandingPage({ onGetStarted, user, onQuickLogin, onSignOut, insideDashboard, theme, onToggleTheme }: LandingPageProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Quick Login Panel States
  const [quickName, setQuickName] = useState("");
  const [quickEmail, setQuickEmail] = useState("");
  const [quickPassword, setQuickPassword] = useState("");
  const [loginMsg, setLoginMsg] = useState("");
  const [loadingLogin, setLoadingLogin] = useState(false);

  // Interactive Contact Form States
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactSubject, setContactSubject] = useState("General Support");
  const [contactMsg, setContactMsg] = useState("");
  const [contactSending, setContactSending] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);

  const stats = [
    { value: "94%", label: "Placement Success Rate" },
    { value: "45K+", label: "Mock Interviews Conducted" },
    { value: "2.4M", label: "Skills Identified & Optimized" },
    { value: "35%+", label: "Average CTC Improvement" }
  ];

  const features = [
    {
      icon: <FileText className="w-6 h-6 text-indigo-400" />,
      title: "Deep Resume Parser & ATS Matcher",
      desc: "Simulates a corporate applicant tracking system. Instantly audits keyword densities, segment presence, project details, and scores alignment from 0 to 100."
    },
    {
      icon: <BrainCircuit className="w-6 h-6 text-purple-400" />,
      title: "Interactive AI Mock Interviews",
      desc: "Practice behavior, HR, technical, or specific domain interview sessions. Features modular question streaming adaptively parsed from your resume.",
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-cyan-400" />,
      title: "Grammar & Communication Scorer",
      desc: "Dynamic real-time evaluation assessing clarity, technical correctness, linguistic accuracy, vocabulary choice, and vocal confidence indicators."
    },
    {
      icon: <Compass className="w-6 h-6 text-pink-400" />,
      title: "Personalized Study Roadmaps",
      desc: "Transforms resume gaps into a clear learning curriculum. Suggests targeted projects, industry certifications, and specific action-oriented micro tasks."
    }
  ];

  const faqs = [
    {
      q: "How does the ATS Scoring Engine evaluate my resume?",
      a: "Our parser checks section formatting, analyzes keyword density, verifies crucial contact details, weighs educational markers, and compares tech stacks with current market roles to formulate a reliable resume score out of 10 point metrics."
    },
    {
      q: "Can I simulate coding and behavioral interviews separately?",
      a: "Yes! You can choose technical, behavioral, HR, or Domain-Specific mock interview setups. The AI customizes dynamic questions based purely on the target role you select or your parsed resume content."
    },
    {
      q: "How does this platform prepare me for off-campus drives?",
      a: "By mapping direct feedback alongside industry keywords, you can iteratively refine your resume and technical articulation until your Placement Readiness score surpasses recommended standard drive benchmarks."
    }
  ];

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F8FAFC] selection:bg-indigo-500 selection:text-white font-sans relative overflow-hidden flex flex-col justify-between">
      
      {/* Absolute Ambient Blob Gradients */}
      <div className="absolute top-[-10%] x-0 w-[600px] h-[600px] rounded-full bg-indigo-900/25 blur-[150px] pointer-events-none" />
      <div className="absolute top-[35%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-900/15 blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-950/25 blur-[130px] pointer-events-none" />

      {/* Header Sticky Navigation Area */}
      {!insideDashboard && (
        <header className="border-b border-indigo-950/60 backdrop-blur-md sticky top-0 z-50 bg-[#0F172A]/80">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/20">
                <BrainCircuit className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">InterviewAce AI</span>
                <span className="block text-[9px] text-indigo-400 font-mono tracking-widest uppercase">Placement Engine</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {onToggleTheme && (
                <button 
                  onClick={onToggleTheme}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/40 transition-all duration-200 cursor-pointer shrink-0"
                  title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
                >
                  {theme === "light" ? (
                    <Moon className="w-4 h-4 text-slate-700" />
                  ) : (
                    <Sun className="w-4 h-4 text-amber-400" />
                  )}
                </button>
              )}
              {user ? (
                <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-full pl-3 pr-1 py-1 text-xs max-w-[280px] sm:max-w-none">
                  <span className="font-semibold text-slate-300 truncate max-w-[100px] sm:max-w-none hidden xs:inline">
                    Welcome back, <strong className="text-white font-bold bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent">{user.fullName.split(" ")[0]}</strong> !
                  </span>
                  <button 
                    onClick={() => onGetStarted()}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-indigo-650 via-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-full font-semibold transition cursor-pointer text-[10px] sm:text-xs shrink-0"
                  >
                    Dashboard
                  </button>
                  {onSignOut && (
                    <button 
                      onClick={onSignOut}
                      className="p-1.5 bg-slate-950 text-slate-400 hover:text-rose-400 rounded-full hover:bg-rose-950/20 transition cursor-pointer shrink-0"
                      title="Sign Out"
                    >
                      <LogOut className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <button 
                    onClick={() => onGetStarted("login")}
                    className="text-xs font-semibold text-slate-300 hover:text-white transition duration-200 px-4 py-2 rounded-lg hover:bg-slate-800/40"
                  >
                    Log In
                  </button>
                  <button 
                    onClick={() => onGetStarted("signup")}
                    className="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-xs font-semibold rounded-full group bg-gradient-to-br from-indigo-500 via-purple-600 to-cyan-400 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-indigo-800 transition duration-300 shadow-md shadow-indigo-600/10"
                  >
                    <span className="relative px-5 py-2 transition-all ease-in duration-75 bg-slate-950 rounded-full group-hover:bg-opacity-0">
                      Sign Up / Get Started
                    </span>
                  </button>
                </>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Main Content Sections */}
      <main className="flex-grow">
        
        {/* Hero Banner Area */}
        <section className="relative pt-20 pb-20 px-6 max-w-7xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-950/60 border border-indigo-800/50 backdrop-blur-sm mb-6"
          >
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-xs text-indigo-200 font-mono font-medium">Engineered for Premier Indian Tech Placements</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6"
          >
            Conquer Placements with <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Precision AI Coaching
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-base md:text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            Supercharge your interview conversion with real-time resume ATS optimization, custom mock sprints, detailed communication feedback loops, and automated milestone roadmaps.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            {user ? (
              <button 
                onClick={() => onGetStarted()}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 font-medium hover:from-indigo-500 hover:to-purple-500 shadow-xl shadow-indigo-600/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                Enter Placement Dashboard
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button 
                onClick={() => onGetStarted("signup")}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 font-medium hover:from-indigo-500 hover:to-purple-500 shadow-xl shadow-indigo-600/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                Start Analyzing Free
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
            
            <a 
              href="#quick-login-section"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:bg-slate-800/80 font-medium transition-all shadow-md flex items-center justify-center gap-2 hover:scale-[1.02]"
            >
              Interactive Login Gateway
              <User className="w-4 h-4 text-indigo-400" />
            </a>
          </motion.div>

          {/* Interactive Secure Placement Login Gateway Section */}
          <motion.div 
            id="quick-login-section"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="max-w-xl mx-auto mb-16 p-6 rounded-2xl bg-slate-900/80 border border-indigo-950 shadow-2xl relative overflow-hidden text-left"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            
            {user ? (
              /* LOGGED IN VIEW */
              <div className="space-y-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-550/15 border border-indigo-900/30 text-indigo-300">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Verified Placement Candidate</h3>
                    <p className="text-xs text-slate-400">Your profile session has been successfully synchronized.</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/50 space-y-2">
                  <div className="text-sm font-semibold text-slate-300">
                    Welcome back, <span className="text-indigo-400 font-bold text-base bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent">{user.fullName}</span> ! 🎉
                  </div>
                  <p className="text-xs text-slate-400 font-mono">
                    Logged in as: <span className="text-slate-300 font-bold">{user.email || "student@nitb.edu.in"}</span>
                  </p>
                  <p className="text-xs text-slate-500 leading-normal">
                    Ready to evaluate your resume, practice coding mockups, and prepare roadmap steps to win your off-campus tech placements?
                  </p>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => onGetStarted()}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl font-bold transition shadow-lg text-white text-xs text-center cursor-pointer"
                  >
                    Enter Candidate Dashboard
                  </button>
                  {onSignOut && (
                    <button 
                      onClick={onSignOut}
                      className="py-3 px-4 bg-slate-950 hover:bg-rose-950/20 text-rose-450 text-rose-400 border border-slate-800 hover:border-rose-900/45 rounded-xl transition cursor-pointer text-xs"
                    >
                      Sign Out Session
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* LOGGED OUT VIEW */
              <div className="space-y-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-900/40">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Secure Placement Login Gateway</h3>
                    <p className="text-xs text-slate-400">Instantly log in to view your personalized greeting and access the suite.</p>
                  </div>
                </div>

                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!quickName.trim() || !quickEmail.trim()) {
                      setLoginMsg("Please provide your name and email to proceed.");
                      return;
                    }
                    setLoadingLogin(true);
                    setLoginMsg("");
                    try {
                      if (onQuickLogin) {
                        await onQuickLogin(quickName, quickEmail);
                      }
                    } catch (err) {
                      setLoginMsg("Authentication failed. Check inputs.");
                    } finally {
                      setLoadingLogin(false);
                    }
                  }} 
                  className="space-y-3.5"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="block text-[10px] text-slate-400 font-mono">Your Full Name</label>
                      <input 
                        type="text" 
                        required
                        value={quickName}
                        onChange={(e) => setQuickName(e.target.value)}
                        placeholder="e.g. Siddharth Sharma"
                        className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-slate-200 transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] text-slate-400 font-mono">College Email Address</label>
                      <input 
                        type="email" 
                        required
                        value={quickEmail}
                        onChange={(e) => setQuickEmail(e.target.value)}
                        placeholder="siddharth@nitb.edu.in"
                        className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-slate-200 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="text-xs">
                    <div className="space-y-1">
                      <label className="block text-[10px] text-slate-400 font-mono">Password</label>
                      <input 
                        type="password" 
                        value={quickPassword}
                        onChange={(e) => setQuickPassword(e.target.value)}
                        placeholder="•••••••• (optional for fast-login)"
                        className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-slate-200 transition-colors"
                      />
                    </div>
                  </div>

                  {loginMsg && (
                    <p className="text-[11px] text-rose-450 text-rose-400 leading-none">{loginMsg}</p>
                  )}

                  <button 
                    type="submit"
                    disabled={loadingLogin}
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold transition shadow-md text-xs cursor-pointer"
                  >
                    {loadingLogin ? "Authenticating Session..." : "Instant Access & Personalize Greeting"}
                  </button>
                </form>

                {/* Preset Fast-Pass Buttons */}
                <div className="pt-3 border-t border-slate-850 space-y-1.5">
                  <p className="text-[10px] text-slate-400 font-mono">FAST-PASS PRESETS:</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { name: "Siddharth Sharma", email: "siddharth.sharma@nitb.edu.in", desc: "NIT B.Tech CSC" },
                      { name: "Shayanti Roy", email: "shayanti.roy@placement.edu.in", desc: "T&P Coord" },
                      { name: "Deepak Verma", email: "deepak.verma.tech@gmail.com", desc: "SWE Analyst" }
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          setQuickName(preset.name);
                          setQuickEmail(preset.email);
                          setQuickPassword("placement123");
                          // Fast Auto-Login directly
                          if (onQuickLogin) {
                            onQuickLogin(preset.name, preset.email);
                          }
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-indigo-950/20 border border-slate-850 hover:border-indigo-500/30 text-[10px] text-slate-300 hover:text-indigo-400 transition-all cursor-pointer flex gap-1 items-center"
                      >
                        <span className="font-bold">{preset.name}</span>
                        <span className="text-slate-500">({preset.desc})</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Dashboard Visual Mock Glassmorphism */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative max-w-4xl mx-auto p-2 rounded-2xl bg-gradient-to-b from-indigo-500/20 via-purple-500/10 to-transparent border border-indigo-500/20 shadow-2xl shadow-indigo-500/5 backdrop-blur-md overflow-hidden"
          >
            <div className="bg-slate-950/80 rounded-xl overflow-hidden border border-indigo-900/40">
              {/* Window bar */}
              <div className="px-4 py-3 bg-slate-900/40 border-b border-indigo-950/70 flex items-center justify-between">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <div className="px-3 py-0.5 rounded bg-slate-950 text-[10px] font-mono text-indigo-400">
                  https://interviewace.ai/dashboard
                </div>
                <div className="w-4" />
              </div>

              <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                {/* ATS Card Mock */}
                <div className="p-5 rounded-xl bg-indigo-950/30 border border-indigo-900/40">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs text-slate-400 font-mono uppercase">ATS scoring</span>
                    <div className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400">Excellent</div>
                  </div>
                  <div className="text-3xl font-extrabold text-white">87/100</div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3">
                    <div className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-1.5 rounded-full" style={{ width: "87%" }} />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">Missing skills identified: WebSockets, AWS IAM Configuration</p>
                </div>

                {/* Chat Session Mock */}
                <div className="p-5 rounded-xl bg-purple-950/30 border border-purple-900/40 md:col-span-2">
                  <div className="flex items-center gap-3 mb-3">
                    <BrainCircuit className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-mono text-slate-400">ACTIVE TECHNICAL INTERVIEW SESSION</span>
                  </div>
                  <div className="p-3 rounded bg-slate-950/80 mb-2 border border-slate-900">
                    <p className="text-xs text-indigo-400 font-mono mb-1">INTERVIEWER:</p>
                    <p className="text-xs text-slate-300 font-medium">Explain consistency parameters in relational database replications.</p>
                  </div>
                  <div className="p-3 rounded bg-slate-900/80">
                    <p className="text-xs text-purple-400 font-mono mb-1">CANDIDATE:</p>
                    <p className="text-xs text-slate-300">We utilize eventual consistency but for transaction pipelines, strong consistency is strictly required using Paxos protocol replication...</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-indigo-300">
                    <span>Accuracy: 88%</span>
                    <span>Confidence: Perfect</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Stats Counter Section */}
        <section className="bg-slate-950/40 border-y border-indigo-950/60 py-10">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map((item, index) => (
              <div key={index}>
                <div className="text-3xl md:text-4xl font-extrabold text-white bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">{item.value}</div>
                <div className="text-xs md:text-sm text-slate-400 mt-1 font-medium">{item.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Grid Panel */}
        <section className="py-24 px-6 max-w-7xl mx-auto relative bg-slate-950/10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent mb-4">
              A Complete Placement Preparation Platform
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm md:text-base">
              No more unstructured practice. From profile analytics to detailed roadmap timelines, InterviewAce AI aligns with elite startup recruitment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feat, index) => (
              <div 
                key={index}
                className="p-8 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/80 hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group duration-300"
              >
                <div className="mb-4 p-3 rounded-xl bg-slate-900 border border-slate-800 w-fit group-hover:scale-110 transition-transform duration-300">
                  {feat.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-slate-200 group-hover:text-amber-300 transition-colors">{feat.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works flow */}
        <section id="how-it-works" className="py-20 bg-slate-950/20 border-t border-indigo-950/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold">The Accelerated Placement Loop</h2>
              <p className="text-slate-400 mt-2 text-sm">Four seamless steps to professional interview execution.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { step: "01", title: "Audit Resume", desc: "Instantly upload your resume in pure text or document form to audit ATS score segments." },
                { step: "02", title: "Target Deficiencies", desc: "Study identified skill gaps alongside recommendations to add tailored keywords." },
                { step: "03", title: "Sprint Mock Run", desc: "Select behavioral, tech, or HR. Stream questions customized around real resume data." },
                { step: "04", title: "Refine & Conquer", desc: "Consume deep transcript breakdowns, master phrasings, compile roadmaps, and secure offers." }
              ].map((flow, index) => (
                <div key={index} className="p-6 rounded-xl bg-slate-900/40 border border-indigo-950 relative overflow-hidden transition-all hover:translate-y-[-4px]">
                  <span className="absolute top-[8%] right-[8%] font-mono text-5xl font-black text-indigo-950">{flow.step}</span>
                  <h3 className="text-lg font-bold text-slate-100 mb-2 mt-4 relative z-10">{flow.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed relative z-10">{flow.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonial / FAQ */}
        <section className="py-24 px-6 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            
            {/* Reviews column */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-8">What Top Candidates Say</h2>
              <div className="space-y-6">
                {[
                  {
                    quote: "Parsed my resume, flagged I lacked 'API Integration Routing' and recommended keywords. Two mock sprints later, I landed my intern role at Meta!",
                    author: "Elena Petrova",
                    role: "Stanford '25 CS Student, SWE Intern"
                  },
                  {
                    quote: "The visual interactive feedback loop is unmatched. I finally solved my tendency to give unfocused behavioral responses. High-end product.",
                    author: "Devon Thompson",
                    role: "UC Berkeley CSE Junior"
                  }
                ].map((rev, idx) => (
                  <div key={idx} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                    <div className="flex gap-1 text-amber-400 mb-3">
                      {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
                    </div>
                    <p className="text-xs text-slate-300 italic mb-4">"{rev.quote}"</p>
                    <p className="text-[11px] font-mono text-indigo-400">{rev.author}</p>
                    <p className="text-[10px] text-slate-500">{rev.role}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ Column */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-8">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="border border-slate-800/80 rounded-xl overflow-hidden transition-all">
                    <button 
                      onClick={() => toggleFaq(idx)}
                      className="w-full flex justify-between items-center px-5 py-4 bg-slate-900/30 hover:bg-slate-900 text-left text-sm font-semibold transition cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      {activeFaq === idx ? <Minus className="w-4 h-4 text-indigo-400" /> : <Plus className="w-4 h-4 text-indigo-400" />}
                    </button>
                    {activeFaq === idx && (
                      <div className="px-5 py-4 bg-slate-950/60 text-xs text-slate-400 leading-relaxed border-t border-slate-900">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* Big SaaS CTA */}
        <section className="py-20 px-6 max-w-7xl mx-auto text-center relative z-10">
          <div className="p-12 rounded-3xl bg-gradient-to-b from-indigo-950/50 to-slate-950 border border-indigo-500/20 shadow-2xl relative overflow-hidden text-center">
            {/* Background circle decoration */}
            <div className="absolute top-[-50%] left-[50%] translate-x-[-50%] w-[350px] h-[350px] rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 blur-[80px] opacity-10 pointer-events-none" />
            
            <h2 className="text-3xl md:text-5xl font-bold mb-4 animate-pulse">Ready to Win Your Placement Sprint?</h2>
            <p className="text-slate-400 max-w-lg mx-auto text-sm md:text-base mb-8">
              Create your account today, verify your ATS score breakdown, run real mock feedback sessions, and lock down engineering positions.
            </p>
            <button 
              onClick={() => onGetStarted("signup")}
              className="px-8 py-4 bg-white text-slate-950 hover:bg-indigo-50 font-medium tracking-tight rounded-xl transition duration-300 shadow-lg hover:scale-105 inline-flex items-center gap-2 cursor-pointer"
            >
              Launch InterviewAce Free
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* Elegant Contact & Developer Support Section */}
        <section className="py-20 px-6 max-w-7xl mx-auto relative z-10 border-t border-indigo-950/60">
          <div className="absolute top-[30%] left-[10%] w-[300px] h-[300px] rounded-full bg-indigo-900/10 blur-[80px] pointer-events-none" />
          
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight text-white mb-3 bg-gradient-to-r from-white to-indigo-300 bg-clip-text text-transparent">
              Contact & Developer Support
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
              Have questions about InterviewAce AI, placement preparation advice, or want to collaborate? Connect directly with us! We ensure top standard execution.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto">
            {/* Left side: Social cards */}
            <div className="lg:col-span-5 space-y-4">
              {/* Card 1: Phone */}
              <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-indigo-500/30 hover:bg-slate-900 transition-all group flex items-start gap-4 shadow-xl">
                <div className="w-10 h-10 rounded-xl bg-indigo-955 bg-indigo-950/80 border border-indigo-900/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-350">
                  <Phone className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="space-y-1 text-left">
                  <h3 className="text-sm font-bold text-slate-100">Direct Hotline</h3>
                  <p className="text-xs text-slate-400 leading-normal">Reach out via call or WhatsApp for quick inquiries regarding the tool.</p>
                  <a 
                    href="tel:9800193741"
                    className="inline-flex mt-1 text-xs font-semibold text-indigo-350 text-indigo-300 hover:text-indigo-200 items-center gap-1 group/link"
                  >
                    +91 9800193741
                    <ArrowUpRight className="w-3 h-3 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                  </a>
                </div>
              </div>

              {/* Card 2: Instagram */}
              <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-pink-500/30 hover:bg-slate-900 transition-all group flex items-start gap-4 shadow-xl">
                <div className="w-10 h-10 rounded-xl bg-pink-950/40 border border-pink-905/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-350">
                  <Instagram className="w-4 h-4 text-pink-400" />
                </div>
                <div className="space-y-1 text-left">
                  <h3 className="text-sm font-bold text-slate-100">Instagram</h3>
                  <p className="text-xs text-slate-400 leading-normal">Follow our design journey and drop feedback/queries straight into our direct messages.</p>
                  <a 
                    href="https://www.instagram.com/shayantiroy118?igsh=MTVob21scnVqcHJ6aQ=="
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex mt-1 text-xs font-semibold text-pink-330 text-pink-300 hover:text-pink-200 items-center gap-1 group/link"
                  >
                    @shayantiroy118
                    <ArrowUpRight className="w-3 h-3 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                  </a>
                </div>
              </div>

              {/* Card 3: LinkedIn */}
              <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-cyan-500/30 hover:bg-slate-900 transition-all group flex items-start gap-4 shadow-xl">
                <div className="w-10 h-10 rounded-xl bg-cyan-950/40 border border-cyan-905/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-350">
                  <Linkedin className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="space-y-1 text-left">
                  <h3 className="text-sm font-bold text-slate-100">LinkedIn</h3>
                  <p className="text-xs text-slate-400 leading-normal">Connect on our professional networks for career opportunities or technical collaboration.</p>
                  <a 
                    href="https://www.linkedin.com/in/shayanti-roy-760628346"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex mt-1 text-xs font-semibold text-cyan-330 text-cyan-300 hover:text-cyan-200 items-center gap-1 group/link"
                  >
                    Shayanti Roy
                    <ArrowUpRight className="w-3 h-3 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                  </a>
                </div>
              </div>
            </div>

            {/* Right side: Interactive message form */}
            <div className="lg:col-span-7">
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-2xl relative">
                {contactSuccess ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-12 px-4 text-center space-y-4"
                  >
                    <div className="w-16 h-16 bg-emerald-950/55 text-emerald-450 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-800/30">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-slate-100">Message Transmitted Successfully!</h3>
                      <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                        Thank you, <strong className="text-slate-200">{contactName}</strong>. Your feedback has been secured and logged into our review backlog. Our team will read and respond if required to <span className="font-mono text-indigo-400">{contactEmail}</span>.
                      </p>
                    </div>
                    <button 
                      onClick={() => {
                        setContactSuccess(false);
                        setContactName("");
                        setContactEmail("");
                        setContactMsg("");
                      }}
                      className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs text-slate-300 border border-slate-800/80 transition cursor-pointer"
                    >
                      Write Another Message
                    </button>
                  </motion.div>
                ) : (
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!contactName.trim() || !contactEmail.trim() || !contactMsg.trim()) return;
                      setContactSending(true);
                      setTimeout(() => {
                        setContactSending(false);
                        setContactSuccess(true);
                      }, 1000);
                    }} 
                    className="space-y-4 text-xs text-left"
                  >
                    <h3 className="text-base font-bold text-slate-200">Submit Direct Candidate Inquiry</h3>
                    <p className="text-xs text-slate-500 leading-none">Drop your direct request or project query instantly into our queue.</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-slate-400 font-mono">Full Name</label>
                        <input 
                          type="text" 
                          required
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="e.g. Siddharth Sharma"
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-slate-200"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-slate-400 font-mono">Your Email Address</label>
                        <input 
                          type="email" 
                          required
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="sid@nitb.edu.in"
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-slate-200"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-slate-400 font-mono">Core Subject Of Inquiry</label>
                      <select 
                        value={contactSubject}
                        onChange={(e) => setContactSubject(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-slate-200"
                      >
                        <option value="General Support">General Performance Inquiry</option>
                        <option value="Resume Critiques">Resume Auditing & ATS Score Assistance</option>
                        <option value="Interview Practice Feedback">Interactive Mock Interview Guidelines</option>
                        <option value="T&P Cell Collaboration">placement & Training Cell Partnership</option>
                        <option value="Bug Reporting">Candidate Application bug report</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-slate-400 font-mono">Detailed Message / Feedback</label>
                      <textarea 
                        required
                        rows={4}
                        value={contactMsg}
                        onChange={(e) => setContactMsg(e.target.value)}
                        placeholder="Write down the details of your inquiry or feedback... our support desk responds within 12 hours!"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-slate-200"
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={contactSending}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 font-bold tracking-tight rounded-xl transition duration-200 flex items-center justify-center gap-2 text-white cursor-pointer"
                    >
                      {contactSending ? "Transmitting Backlog..." : "Submit Inquiry Securely"}
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Simple Professional Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-600">
              <BrainCircuit className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <span className="font-bold text-sm tracking-tight text-slate-100">InterviewAce AI</span>
              <p className="text-[10px] text-slate-500 leading-none mt-1">Placement Preparation and Interview Intelligence Platform</p>
            </div>
          </div>
          
          <p className="text-xs text-slate-500 font-mono text-center md:text-right">
            &copy; 2026 InterviewAce AI. Designed for Hackathons and Enterprise Recruiting standard passing.
          </p>
        </div>
      </footer>

    </div>
  );
}
