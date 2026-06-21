/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Compass, 
  MapPin, 
  BookOpen, 
  Award, 
  Layout, 
  Code2, 
  ArrowRight, 
  RefreshCw, 
  CheckCircle2, 
  ExternalLink,
  Plus, 
  X,
  Target,
  ArrowLeft,
  Check
} from "lucide-react";
import { CareerRoadmap, LearningNode } from "../types";
import { playClickSound, playSuccessSound } from "../utils/audio";

interface CareerRoadmapProps {
  currentSkills: string[];
  targetRole: string;
  onRoadmapGenerated: (roadmap: CareerRoadmap) => void;
  previousRoadmaps: CareerRoadmap[];
  onBack?: () => void;
  checkedMilestones?: { [nodeId: string]: boolean };
  onToggleMilestone?: (nodeId: string) => void;
}

export default function CareerRoadmapView({ 
  currentSkills, 
  targetRole, 
  onRoadmapGenerated, 
  previousRoadmaps, 
  onBack,
  checkedMilestones,
  onToggleMilestone
}: CareerRoadmapProps) {
  const [role, setRole] = useState(targetRole || "Software Developer");
  const [careerGoal, setCareerGoal] = useState("Acquire a senior engineering placement within 4 months");
  const [learningMonths, setLearningMonths] = useState(4);
  const [skillsInput, setSkillsInput] = useState("");
  const [skillsList, setSkillsList] = useState<string[]>(currentSkills.length > 0 ? currentSkills : ["React", "JavaScript", "SQL"]);
  
  // States for generation loading & select history
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedRoadmap, setSelectedRoadmap] = useState<CareerRoadmap | null>(
    previousRoadmaps.length > 0 ? previousRoadmaps[0] : null
  );

  const suggestedDomains = [
    "Computer Science",
    "Mechanical Engineer",
    "Civil Engineer",
    "Electrical Engineer",
    "Chemical Engineer"
  ];

  // States to add custom skill to localized array list
  const handleAddSkill = () => {
    playClickSound();
    if (skillsInput.trim() && !skillsList.includes(skillsInput.trim())) {
      setSkillsList((prev) => [...prev, skillsInput.trim()]);
      setSkillsInput("");
    }
  };

  const handleRemoveSkill = (sk: string) => {
    playClickSound();
    setSkillsList((prev) => prev.filter((s) => s !== sk));
  };

  const handleGenerateRoadmap = async () => {
    setLoading(true);
    setErrorMsg(null);
    setSelectedRoadmap(null);

    try {
      const response = await fetch("/api/roadmap/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          careerGoal,
          currentSkills: skillsList,
          targetRole: role,
          years: learningMonths
        })
      });

      if (!response.ok) {
        throw new Error("Failed to compile custom roadmap layout.");
      }

      const result: CareerRoadmap = await response.json();
      playSuccessSound();
      onRoadmapGenerated(result);
      setSelectedRoadmap(result);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Something went wrong generating curriculum. Verify dynamic engine parameters.");
    } finally {
      setLoading(false);
    }
  };

  // Milestone checklists inside timeline nodes for interactiveness
  const [nodeCheckedState, setNodeCheckedState] = useState<{ [nodeId: string]: boolean }>({});
  const toggleNodeState = (nodeId: string) => {
    playClickSound();
    if (onToggleMilestone) {
      onToggleMilestone(nodeId);
    } else {
      setNodeCheckedState((prev) => ({
        ...prev,
        [nodeId]: !prev[nodeId]
      }));
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Back to Dashboard navigation */}
      {onBack && (
        <div className="text-left">
          <button 
            onClick={() => { playClickSound(); onBack(); }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 text-xs text-slate-400 hover:text-indigo-300 transition-all duration-200 shadow-sm animate-fade-in"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </button>
        </div>
      )}

      {/* Header title */}
      <div className="text-left space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight">AI Placement Roadmap Curator</h1>
        <p className="text-slate-400 text-sm">
          Map custom learning timelines of software courses, certifications, and projects custom synthesized around your career metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left column Settings panel: span 4 */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-5 text-left">
            <h2 className="text-base font-bold font-mono text-slate-400 uppercase tracking-tight flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              Configure Roadmaps
            </h2>

            <div className="space-y-2">
              <label className="block text-xs font-mono text-slate-400">Target Role / Engineering Domain</label>
              <input 
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Mechanical Engineer, Civil Engineer, Frontend Developer"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none focus:border-indigo-600 transition"
              />
              <div className="pt-1.5 space-y-1">
                <span className="text-[10px] text-slate-500 font-mono block">Suggested Engineering Domains:</span>
                <div className="flex flex-wrap gap-1.5">
                  {suggestedDomains.map((domain) => (
                    <button
                      key={domain}
                      type="button"
                      onClick={() => {
                        playClickSound();
                        setRole(domain);
                      }}
                      className={`px-2 py-1 rounded-lg text-[9px] font-mono border transition ${
                        role === domain 
                          ? "bg-indigo-950/60 border-indigo-500/45 text-indigo-300"
                          : "bg-slate-950 border-slate-900 text-slate-400 hover:text-slate-200 hover:border-slate-800"
                      }`}
                    >
                      {domain}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-mono text-slate-400">Placement Career Goal</label>
              <input 
                type="text"
                value={careerGoal}
                onChange={(e) => setCareerGoal(e.target.value)}
                placeholder="e.g. Pass off-campus FAANG criteria before September"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none focus:border-indigo-600 transition"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-mono text-slate-400">Preparation Duration</label>
              <select 
                value={learningMonths}
                onChange={(e) => setLearningMonths(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-250 text-slate-300 outline-none focus:border-indigo-600 transition"
              >
                <option value={3}>3 Months Sprint</option>
                <option value={4}>4 Months Standard</option>
                <option value={6}>6 Months Comprehensive</option>
              </select>
            </div>

            {/* Custom Interactive Skills adder */}
            <div className="space-y-3">
              <label className="block text-xs font-mono text-slate-400">Validate Your Current Skills</label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddSkill(); }}}
                  placeholder="e.g. Next.js, Redux, AWS"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none"
                />
                <button 
                  onClick={handleAddSkill}
                  className="px-3 py-2 bg-indigo-950 border border-indigo-900 text-xs text-indigo-300 rounded-xl hover:bg-slate-800 font-bold transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Tag mapping */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {skillsList.map((sk) => (
                  <span 
                    key={sk}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-950 text-[10px] font-mono text-slate-300 border border-slate-900"
                  >
                    {sk}
                    <X 
                      className="w-3 h-3 text-slate-500 hover:text-rose-400 cursor-pointer" 
                      onClick={() => handleRemoveSkill(sk)}
                    />
                  </span>
                ))}
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-950/20 border border-rose-900 text-xs text-rose-300 rounded-lg">
                {errorMsg}
              </div>
            )}

            <button 
              onClick={() => { playClickSound(); handleGenerateRoadmap(); }}
              disabled={loading || skillsList.length === 0}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 font-medium hover:from-indigo-500 hover:to-purple-500 transition shadow-lg text-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Mapping Node Timeline...
                </>
              ) : (
                <>
                  <Compass className="w-4 h-4" />
                  Synthesize Curriculum
                </>
              )}
            </button>
          </div>

          {/* History tracker */}
          {previousRoadmaps.length > 0 && (
            <div className="p-5 rounded-2xl bg-slate-900/20 border border-slate-800/60 text-left">
              <h3 className="text-xs font-mono text-slate-400 uppercase mb-3">Saved Roadmaps</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {previousRoadmaps.map((rm) => (
                  <div 
                    key={rm.id}
                    onClick={() => { playClickSound(); setSelectedRoadmap(rm); }}
                    className={`p-3 rounded-xl border cursor-pointer transition flex justify-between items-center ${
                      selectedRoadmap?.id === rm.id 
                        ? "bg-slate-900 border-[#06B6D4]/30" 
                        : "bg-slate-950/60 border-slate-900 hover:bg-slate-900/40"
                    }`}
                  >
                    <div>
                      <span className="block text-xs font-bold text-slate-200">
                        {rm.targetRole}
                      </span>
                      <span className="block text-[9px] text-slate-500 font-mono">
                        {rm.estimatedMonths} Months Curriculum
                      </span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-900 font-bold font-mono text-right">Roadmap</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column Timelines view pane: span 8 */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {loading ? (
              // Roadmap Loading state
              <div className="p-10 rounded-2xl border border-indigo-950 bg-slate-900/20 backdrop-blur-md h-[550px] flex flex-col items-center justify-center text-center space-y-6">
                <div className="relative w-28 h-28 flex items-center justify-center rounded-full bg-cyan-950/10 border border-cyan-800/30 animate-pulse">
                  <Compass className="w-12 h-12 text-cyan-400" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold font-mono text-white animate-pulse">Designing Iterative Learning Path...</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto shadow-sm">
                    The curriculum engine is processing your target goals and technology background to create a standard 4-phase sequence matching off-campus recruitment metrics.
                  </p>
                </div>
              </div>
            ) : selectedRoadmap ? (
              // Active timeline visual board
              <motion.div 
                key="timeline-dashboard"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8 text-left"
              >
                
                {/* Header overview card */}
                <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900/90 via-cyan-950/20 to-slate-900/95 border border-cyan-900/35 shadow-xl flex flex-col sm:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-4">
                    <div className="p-4 rounded-xl bg-cyan-500 shrink-0">
                      <Compass className="w-8 h-8 text-white animate-spin" style={{ animationDuration: '6s' }} />
                    </div>
                    <div>
                      <span className="text-[10px] text-cyan-400 font-mono font-bold leading-none">ROLE PROGRESSION ACTIVE</span>
                      <h3 className="text-xl font-extrabold text-[#F8FAFC]">
                        {selectedRoadmap.targetRole} Roadmap
                      </h3>
                      <p className="text-xs text-slate-400 leading-tight mt-0.5 max-w-md">Goal: {selectedRoadmap.careerGoal}</p>
                    </div>
                  </div>

                  <div className="text-center sm:text-right">
                    <span className="block text-[9px] font-mono text-slate-500 uppercase leading-none">duration index</span>
                    <span className="text-3xl font-black text-cyan-400 tracking-tight">{selectedRoadmap.estimatedMonths} Months</span>
                  </div>
                </div>

                {/* Grid holding Certifications & Capstones recommended */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/*Certifications list*/}
                  <div className="p-5 bg-slate-900/30 border border-slate-800 rounded-2xl space-y-3">
                    <h4 className="text-xs font-mono font-bold text-slate-405 uppercase tracking-tight text-slate-400 flex items-center gap-1.5 pb-2 border-b border-slate-800/60">
                      <Award className="w-4 h-4 text-cyan-400" />
                      Recommended Core Certifications
                    </h4>
                    <ul className="space-y-2">
                      {selectedRoadmap.certificationsToGet?.map((cert, index) => (
                        <li key={index} className="p-2.5 rounded-lg bg-slate-950 border border-slate-900 text-xs text-slate-300 font-medium flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span>{cert}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/*Capstone Project recommended*/}
                  <div className="p-5 bg-slate-900/30 border border-slate-800 rounded-2xl space-y-3">
                    <h4 className="text-xs font-mono font-bold text-slate-405 uppercase tracking-tight text-slate-400 flex items-center gap-1.5 pb-2 border-b border-slate-800/60">
                      <Code2 className="w-4 h-4 text-indigo-400" />
                      Target Portfolio Capstones
                    </h4>
                    
                    <div className="space-y-3 overflow-y-auto max-h-48 pr-1">
                      {selectedRoadmap.projectsToBuild?.map((proj, idx) => (
                        <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-900 space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-[11px] font-bold text-slate-200">{proj.title}</span>
                            <span className="text-[8px] font-mono px-1 bg-indigo-950 text-indigo-400 border border-indigo-900 rounded">{proj.difficulty}</span>
                          </div>
                          <p className="text-[10px] text-slate-550 text-slate-400 leading-snug">{proj.summary}</p>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {proj.tech?.map((t, idx2) => (
                              <span key={idx2} className="text-[8px] font-mono text-slate-500 bg-slate-900 px-1 rounded">{t}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Visual Roadmap TIMELINE Nodes list */}
                <div className="space-y-5">
                  <div className="flex items-center justify-between pb-1">
                    <h4 className="text-xs font-mono font-bold text-slate-400 uppercase">Step-by-step curriculum phases</h4>
                  </div>

                  {(() => {
                    const totalNodes = selectedRoadmap.roadmapNodes?.length || 0;
                    const activeCheckedCount = selectedRoadmap.roadmapNodes?.reduce((acc, node) => {
                      const checked = checkedMilestones ? !!checkedMilestones[node.id] : !!nodeCheckedState[node.id];
                      return acc + (checked ? 1 : 0);
                    }, 0) || 0;
                    const completionPercentage = totalNodes > 0 ? Math.round((activeCheckedCount / totalNodes) * 100) : 0;

                    return (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-5 rounded-2xl bg-gradient-to-r from-slate-900/60 to-indigo-950/20 border border-slate-800 space-y-3"
                      >
                        <div className="flex justify-between items-center text-xs font-mono">
                          <span className="text-slate-300 font-bold flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-cyan-400 animate-pulse" />
                            CURRICULUM MILESTONE TRAJECTORY
                          </span>
                          <span className="text-cyan-400 font-semibold">{activeCheckedCount} of {totalNodes} Phases Cleared ({completionPercentage}%)</span>
                        </div>

                        {/* Framer Motion Animating Progress Track */}
                        <div className="h-3.5 w-full rounded-full bg-slate-950 overflow-hidden border border-slate-900 relative">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${completionPercentage}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-cyan-400 via-indigo-550 to-purple-500 relative"
                          >
                            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:15px_15px] animate-[pulse_2s_infinite]" />
                          </motion.div>
                        </div>

                        <div className="text-[10px] text-slate-500 leading-snug flex items-center gap-1.5 font-mono">
                          <span>✓</span>
                          <span>Every checked phase milestone dynamically scales your overall **Placement Readiness Score** on the workspace dashboard.</span>
                        </div>
                      </motion.div>
                    );
                  })()}
                  
                  <div className="space-y-6 relative pl-6 border-l border-slate-800/80">
                    {selectedRoadmap.roadmapNodes?.map((node, i) => {
                      const isChecked = checkedMilestones ? !!checkedMilestones[node.id] : !!nodeCheckedState[node.id];
                      
                      return (
                        <div key={node.id} className="relative text-left space-y-3 relative">
                          
                          {/* Circle waypoint node connector */}
                          <div 
                            onClick={() => toggleNodeState(node.id)}
                            className={`absolute left-[-31.5px] top-1.5 w-4 h-4 rounded-full border-2 cursor-pointer flex items-center justify-center transition-all ${
                              isChecked 
                                ? "bg-cyan-400 border-cyan-400 text-slate-950 shadow-[0_0_8px_rgba(34,211,238,0.4)]" 
                                : "bg-slate-950 border-slate-800 hover:border-slate-400"
                            }`}
                          >
                            {isChecked && <Check className="w-2.5 h-2.5 stroke-[3px]" />}
                          </div>

                           <div className={`p-5 rounded-2xl border transition-all ${isChecked ? "bg-cyan-950/5 border-cyan-900/30 shadow-md shadow-cyan-950/10" : "bg-slate-900/35 border-slate-800"}`}>
                             {/* Phase & Month Header */}
                             <div className="flex justify-between items-center pb-2 border-b border-slate-800/40">
                               <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">{node.phase}</span>
                               <div className="flex items-center gap-3">
                                 {/* Interactive checkbox with beautiful state labels */}
                                 <label className="flex items-center gap-1.5 cursor-pointer group">
                                   <input 
                                     type="checkbox"
                                     checked={isChecked}
                                     onChange={() => toggleNodeState(node.id)}
                                     className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500 accent-cyan-500 cursor-pointer text-cyan-600"
                                   />
                                   <span className={`text-[10px] font-mono font-bold transition duration-200 ${isChecked ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-400"}`}>
                                     {isChecked ? "PHASE CLEARED" : "MARK COMPLETE"}
                                   </span>
                                 </label>
                                 <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-cyan-400 border border-slate-900">{node.duration}</span>
                               </div>
                             </div>

                            {/* Node Title */}
                            <h5 className="text-sm font-extrabold text-slate-200 mt-3">{node.title}</h5>

                            {/* Node detail items split columns */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 pt-1 text-xs">
                              <div className="space-y-1.5">
                                <span className="text-[9px] font-mono text-slate-500 uppercase font-bold block">Skills to acquire:</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {node.skills?.map((sk, idx3) => (
                                    <span key={idx3} className="text-[9px] font-mono bg-slate-950 px-2 py-0.5 rounded text-indigo-300">{sk}</span>
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-1.5">
                                <span className="text-[9px] font-mono text-slate-500 uppercase font-bold block">Phase challenges:</span>
                                <ul className="space-y-1">
                                  {node.challenges?.map((chal, idx4) => (
                                    <li key={idx4} className="text-[10px] text-slate-400 inline-flex items-start gap-1.5 leading-snug">
                                      <span className="text-cyan-500 font-bold">•</span>
                                      <span>{chal}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            {/* Recommended dynamic resources */}
                            {node.resources && node.resources.length > 0 && (
                              <div className="mt-4 pt-3 border-t border-slate-800/40">
                                <span className="text-[9px] font-mono text-slate-500 uppercase font-bold block mb-2">Recommended Study Resources:</span>
                                <div className="flex flex-wrap gap-2">
                                  {node.resources.map((res, rIdx) => (
                                    <a 
                                      key={rIdx}
                                      href={res.url || "https://wikipedia.org"}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1.5 text-[10px] text-slate-300 hover:text-white bg-slate-950 border border-slate-850 px-3 py-1.5 rounded-lg hover:border-slate-700 transition"
                                    >
                                      <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                                      <span className="font-medium">{res.name}</span>
                                      {res.url && <ExternalLink className="w-2.5 h-2.5 text-slate-500" />}
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}

                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>

              </motion.div>
            ) : (
              // Empty initial results state
              <div className="p-12 rounded-2xl border-2 border-dashed border-slate-800 text-center h-[520px] flex flex-col items-center justify-center space-y-4">
                <Compass className="w-16 h-16 text-slate-700 stroke-1" />
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-400">Roadmap Display Panel</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                    Set up your target tech parameters and prep months on the left. Click "Curriculum" to draft interactive phase tasks styled around your candidate milestones.
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
