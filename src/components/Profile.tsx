/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  User, 
  Settings, 
  Github, 
  Linkedin, 
  Award, 
  CheckCircle2, 
  Calendar, 
  Save, 
  FileText, 
  MessageSquare, 
  Search,
  Sparkles,
  RefreshCw,
  ArrowLeft
} from "lucide-react";
import { UserProfile, ResumeAnalysis, MockInterviewSession } from "../types";

interface ProfileProps {
  user: UserProfile;
  resumes: ResumeAnalysis[];
  interviews: MockInterviewSession[];
  onUpdateProfile: (updated: Partial<UserProfile>) => Promise<void>;
  onBack?: () => void;
}

export default function Profile({ user, resumes, interviews, onUpdateProfile, onBack }: ProfileProps) {
  
  // Local form states
  const [fullName, setFullName] = useState(user.fullName);
  const [headline, setHeadline] = useState(user.headline || "");
  const [bio, setBio] = useState(user.bio || "");
  const [targetRole, setTargetRole] = useState(user.targetRole || "");
  const [githubUrl, setGithubUrl] = useState(user.githubUrl || "");
  const [linkedinUrl, setLinkedinUrl] = useState(user.linkedinUrl || "");
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMsg(null);

    try {
      await onUpdateProfile({
        fullName,
        headline,
        bio,
        targetRole,
        githubUrl,
        linkedinUrl
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to update profile settings.");
    } finally {
      setIsSaving(false);
    }
  };

  // Static gamified placement badges
  const achievements = [
    {
      id: "ach_ats",
      name: "ATS Conqueror",
      desc: "Earned by achieving an ATS score of 80% or greater.",
      unlocked: resumes.some((r) => (r.atsReport?.totalScore || 0) >= 80),
      badge: "🎯"
    },
    {
      id: "ach_mock",
      name: "Mock Sprint Pioneer",
      desc: "Earned by completing your first conversational mock interview session.",
      unlocked: interviews.length > 0,
      badge: "🏅"
    },
    {
      id: "ach_perfect",
      name: "Communication Titan",
      desc: "Unlocked if speech confidence score markers score 18/20 or higher.",
      unlocked: interviews.some((i) => {
        return Object.values(i.answers || {}).some((ans) => {
          return (ans.evaluation?.confidence || 0) >= 18;
        });
      }),
      badge: "🗣"
    },
    {
      id: "ach_veteran",
      name: "Active Career Roadmap",
      desc: "Unlocked by synthesizing a customized career path timeline.",
      unlocked: true, // Auto unlocked as user profile completes setup
      badge: "🗺"
    }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Back to Dashboard navigation */}
      {onBack && (
        <div className="text-left">
          <button 
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 text-xs text-slate-400 hover:text-indigo-300 transition-all duration-200 shadow-sm animate-fade-in"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </button>
        </div>
      )}

      {/* Header */}
      <div className="text-left space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight">User Account & Achievements</h1>
        <p className="text-slate-400 text-sm">
          Customize your targeted placement configurations, review saved historical sprints, and showcase earned preparation credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form: Profile Settings: span 7 */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md text-left">
          
          <h2 className="text-base font-bold font-mono text-slate-401 uppercase text-slate-400 tracking-tight flex items-center gap-2 pb-3 border-b border-slate-850">
            <Settings className="w-4 h-4 text-indigo-400" />
            Vetting Config Settings
          </h2>

          <form onSubmit={handleSave} className="space-y-5 mt-6 text-xs">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-slate-400 font-mono">Full Legal Name</label>
                <input 
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 outline-none focus:border-indigo-600 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-400 font-mono">Headline Bio / Education</label>
                <input 
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Sophomore CS Student at State University"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 outline-none focus:border-indigo-600 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-slate-400 font-mono">Target Career Role Placement</label>
                <input 
                  type="text"
                  required
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 outline-none focus:border-indigo-600 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-400 font-mono">Registered Email (Read Only)</label>
                <input 
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full px-4 py-3 bg-slate-950/60 border border-slate-900 text-slate-500 rounded-xl outline-none select-none cursor-not-allowed font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-slate-400 font-mono">Personal Professional Biography Summary</label>
              <textarea 
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share bullet points detailing target tech skills, portfolio focus layers, and specific interview categories..."
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 outline-none focus:border-indigo-600 transition resize-none placeholder-slate-650"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-slate-400 font-mono flex items-center gap-1.5">
                  <Github className="w-3.5 h-3.5" />
                  GitHub Url Profile
                </label>
                <input 
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-400 font-mono flex items-center gap-1.5">
                  <Linkedin className="w-3.5 h-3.5" />
                  LinkedIn Url Profile
                </label>
                <input 
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 outline-none"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-950/20 border border-rose-900 text-rose-300 rounded-xl">
                {errorMsg}
              </div>
            )}

            {saveSuccess && (
              <div className="p-3 bg-emerald-950/20 border border-emerald-900 text-emerald-400 rounded-xl font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Vetting settings updated persistently!
              </div>
            )}

            <button 
              type="submit"
              disabled={isSaving}
              className="px-5 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 font-medium hover:from-indigo-500 hover:to-purple-500 transition shadow-md disabled:opacity-40 flex items-center gap-2 text-xs text-white"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving details...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 hover:scale-110 transition" />
                  Save configurations
                </>
              )}
            </button>

          </form>

        </div>

        {/* Right Column: Achievements & Badges checklist: span 5 */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md text-left space-y-5">
            <h2 className="text-base font-bold font-mono text-slate-402 uppercase text-slate-400 tracking-tight flex items-center gap-2 pb-3 border-b border-slate-850">
              <Award className="w-4 h-4 text-cyan-400" />
              Earned Vetting Achievements
            </h2>

            <div className="space-y-4">
              {achievements.map((ach) => (
                <div 
                  key={ach.id}
                  className={`p-4 rounded-xl border transition-all flex items-start gap-4 ${
                    ach.unlocked 
                      ? "bg-indigo-950/15 border-indigo-900/40 text-left" 
                      : "bg-slate-950/50 border-slate-900 text-left opacity-55"
                  }`}
                >
                  <div className="text-3xl p-2.5 rounded-xl bg-slate-950 border border-slate-900 shadow-inner">
                    {ach.badge}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-bold text-slate-200">{ach.name}</h4>
                      {ach.unlocked ? (
                        <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-900 uppercase">UNLOCKED</span>
                      ) : (
                        <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-900 text-slate-500 border border-slate-850 uppercase">LOCKED</span>
                      )}
                    </div>
                    <p className="text-[10.5px] text-slate-450 leading-snug text-slate-400">{ach.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
