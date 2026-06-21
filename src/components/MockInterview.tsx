/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Play, 
  MessageSquare, 
  Timer, 
  Award, 
  Mic, 
  MicOff, 
  Send, 
  ChevronRight, 
  CheckCircle, 
  AlertCircle, 
  Activity, 
  RefreshCw, 
  Compass, 
  Check, 
  Eye,
  ArrowLeft,
  ExternalLink,
  Sparkles,
  HelpCircle,
  Lightbulb,
  X as PanelRightClose
} from "lucide-react";
import { InterviewType, InterviewQuestion, AnswerEvaluation, MockInterviewSession } from "../types";
import { playClickSound, playSuccessSound } from "../utils/audio";

interface MockInterviewProps {
  resumeText: string;
  targetRole: string;
  onInterviewComplete: (session: MockInterviewSession) => void;
  previousSessions: MockInterviewSession[];
  onBack?: () => void;
}

export default function MockInterview({ resumeText, targetRole, onInterviewComplete, previousSessions, onBack }: MockInterviewProps) {
  const [interviewType, setInterviewType] = useState<InterviewType>("Technical");
  const [showTips, setShowTips] = useState(false);
  
  // Targeted Preparation Checklist state
  const [prepChecklist, setPrepChecklist] = useState({
    resumeAnalyzed: !!(resumeText && resumeText.trim().length > 50),
    curriculumPlanned: false,
    starPatternStudied: false,
    sampleReviewWatched: false
  });
  const [micLockedWarning, setMicLockedWarning] = useState<string | null>(null);

  // Session tracking states
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswerText, setUserAnswerText] = useState("");
  const [isMicSimulating, setIsMicSimulating] = useState(false);
  const [micVolume, setMicVolume] = useState<number[]>(Array(12).fill(1));
  const [timeSpent, setTimeSpent] = useState(0);

  // Real microphone states
  const [isRealMicMode, setIsRealMicMode] = useState(false);
  const [isRecordingReal, setIsRecordingReal] = useState(false);
  const [realAudioUrl, setRealAudioUrl] = useState<string | null>(null);
  const [recDuration, setRecDuration] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const recIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const realMediaRecorderRef = useRef<any | null>(null);
  const realChunksRef = useRef<Blob[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  // Clean raw stream trackers on action state resets
  const stopAllRecordingStreams = () => {
    if (recIntervalRef.current) clearInterval(recIntervalRef.current);
    if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);

    if (realMediaRecorderRef.current && realMediaRecorderRef.current.state !== "inactive") {
      try {
        realMediaRecorderRef.current.stop();
      } catch (e) {
        console.warn("Stopping media recorder failed", e);
      }
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close().catch(() => {});
      } catch (e) {}
      audioCtxRef.current = null;
    }

    setIsRecordingReal(false);
  };

  // Reset recording state per question index increase
  useEffect(() => {
    setRealAudioUrl(null);
    setRecDuration(0);
    setMicError(null);
  }, [currentQuestionIndex]);

  // Clean on unmount
  useEffect(() => {
    return () => {
      stopAllRecordingStreams();
    };
  }, []);
  
  // Loading & error flags
  const [loading, setLoading] = useState(false);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [isFinalizingReport, setIsFinalizingReport] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Completed answers list
  interface TempAnswer {
    answerText: string;
    isSpeech: boolean;
    timeSpentSeconds: number;
    evaluation?: AnswerEvaluation;
  }
  const [sessionAnswers, setSessionAnswers] = useState<{ [qId: string]: TempAnswer }>({});

  // Finished session viewer state (select existing sessions to look at)
  const [selectedSessionReview, setSelectedSessionReview] = useState<MockInterviewSession | null>(
    previousSessions.length > 0 ? previousSessions[0] : null
  );

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer run loop
  useEffect(() => {
    if (activeSessionId && !isSubmittingAnswer && !isFinalizingReport) {
      timerRef.current = setInterval(() => {
        setTimeSpent((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeSessionId, isSubmittingAnswer, isFinalizingReport]);

  // Audio wave visualizer simulation loop
  useEffect(() => {
    if (isMicSimulating) {
      audioIntervalRef.current = setInterval(() => {
        setMicVolume(() => Array(12).fill(0).map(() => Math.floor(Math.random() * 28) + 2));
      }, 120);
    } else {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      setMicVolume(Array(12).fill(1));
    }
    return () => {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    };
  }, [isMicSimulating]);

  // Launch a new session
  const handleStartSession = async () => {
    stopAllRecordingStreams();
    setLoading(true);
    setErrorMsg(null);
    setSelectedSessionReview(null);
    setSessionAnswers({});
    setCurrentQuestionIndex(0);
    setUserAnswerText("");
    setTimeSpent(0);

    try {
      const response = await fetch("/api/interview/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewType,
          resumeText,
          targetRole
        })
      });

      if (!response.ok) {
        throw new Error("Failed to load interview questions from backend helper.");
      }

      const data = await response.json();
      setQuestions(data.questions);
      setActiveSessionId(data.sessionId);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to generate mock runtime questions. Check connection or API Key.");
    } finally {
      setLoading(false);
    }
  };

  // Mic simulation helper (mocks voice typing)
  const toggleMicSimulation = () => {
    if (!isMicSimulating) {
      setIsMicSimulating(true);
      // Mock typing speech text slowly
      const indexMockPhrases = [
        "Specifically for this system design requirement, I would implement an isolated pub sub architecture separating the high load database writes. By writing to Apache Kafka queues first, we decouple the write operations from the active UI nodes, ensuring zero blockages for our transactional workflows. For queries we can cache read paths using micro Redis sets with dynamic cache invalidations...",
        "Regarding conflict resolutions, I usually apply the STAR methodology. In my last portfolio project, we had structural inconsistencies in our database migrations. I assembled our contributors, proposed a clean SQLite local fallback, validated the types across TypeScript modules, and deployed smoothly within 24 hours. The conflict was immediately mitigated with enhanced architectural compliance...",
        "Since our business logic mandates high security thresholds, I favor standard OAuth authorization parameters followed by encrypted JWT headers attached strictly on the server-side proxy routes. We never save raw secrets inside client scripts. In React, we proxy API endpoints internally, mitigating script insertion vectors and keeping tokens guarded behind container environment flags..."
      ];
      const randomSel = indexMockPhrases[Math.floor(Math.random() * indexMockPhrases.length)];
      
      let cursor = 0;
      const t = setInterval(() => {
        if (cursor < randomSel.length) {
          setUserAnswerText(() => randomSel.substring(0, cursor + 5));
          cursor += 5;
        } else {
          clearInterval(t);
          setIsMicSimulating(false);
        }
      }, 80);
    } else {
      setIsMicSimulating(false);
    }
  };

  // Open candidate questions in a new popup browser window
  const openInNewWindow = () => {
    playClickSound();
    const win = window.open("", "_blank", "width=650,height=600,scrollbars=yes,resizable=yes");
    if (win) {
      win.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${interviewType} Mock - Active Set</title>
            <style>
              body {
                background-color: #0b1329;
                color: #e2e8f0;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                margin: 0;
                padding: 32px 24px;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
              }
              h2 {
                color: #818cf8;
                font-size: 20px;
                font-weight: 700;
                border-bottom: 1px solid #1e293b;
                padding-bottom: 12px;
                margin-top: 0;
                margin-bottom: 24px;
                text-transform: uppercase;
                letter-spacing: 0.05em;
              }
              .question-card {
                background-color: #0f172a;
                border: 1px solid #1e293b;
                border-radius: 12px;
                padding: 16px 20px;
                margin-bottom: 16px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
              }
              .number {
                font-size: 11px;
                text-transform: uppercase;
                font-weight: bold;
                letter-spacing: 0.1em;
                color: #a5b4fc;
                margin-bottom: 6px;
              }
              .prompt {
                font-size: 14px;
                line-height: 1.6;
                color: #cbd5e1;
                margin: 0;
              }
              .meta {
                margin-top: 10px;
                display: flex;
                gap: 12px;
                font-size: 11px;
                color: #64748b;
                font-family: monospace;
              }
              .meta span {
                background-color: #1e293b;
                padding: 2px 6px;
                border-radius: 4px;
              }
              .footer {
                text-align: center;
                font-size: 11px;
                color: #475569;
                margin-top: 40px;
                border-t: 1px solid #1e293b;
                padding-top: 16px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>${interviewType} Active Session Questions</h2>
              ${questions.map((q, idx) => `
                <div class="question-card">
                  <div class="number">Question ${idx + 1}</div>
                  <p class="prompt">${q.question}</p>
                  <div class="meta">
                    <span>Category: ${q.category || interviewType}</span>
                    <span>Keywords: ${q.expectedKeywords?.slice(0, 3).join(", ") || "Technical focus"}</span>
                  </div>
                </div>
              `).join("")}
              <div class="footer">
                Compiled via InterviewAce AI Suite. Utilize this set during your active session.
              </div>
            </div>
          </body>
        </html>
      `);
      win.document.close();
    } else {
      alert("Opening questions window blocked! Please allow popups for active interview questions in a new window.");
    }
  };

  // Toggle real voice recording
  const handleToggleRealRecording = async () => {
    playClickSound();

    if (isRecordingReal) {
      stopAllRecordingStreams();
      return;
    }

    setMicError(null);
    realChunksRef.current = [];
    setRecDuration(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Web Audio API frequency analysis
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const audioCtx = new AudioContextClass();
        audioCtxRef.current = audioCtx;

        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 32;
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateRealVolume = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);

          // Map frequency values to standard visualizer heights (2px to 30px)
          const newVolume = Array.from(dataArray)
            .slice(0, 12)
            .map((val) => Math.max(2, Math.floor((val / 255) * 28)));

          while (newVolume.length < 12) {
            newVolume.push(2);
          }
          setMicVolume(newVolume);
          animationFrameIdRef.current = requestAnimationFrame(updateRealVolume);
        };
        animationFrameIdRef.current = requestAnimationFrame(updateRealVolume);
      }

      // Initialize media recorder
      const options = { mimeType: "audio/webm" };
      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(stream, options);
      } catch (e) {
        recorder = new MediaRecorder(stream);
      }

      realMediaRecorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          realChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(realChunksRef.current, { type: recorder.mimeType || "audio/webm" });
        const audioUrl = URL.createObjectURL(blob);
        setRealAudioUrl(audioUrl);

        // Notify user about voice capture status
        setUserAnswerText((prev) => {
          const companionNote = prev ? "\n\n" : "";
          return prev + `${companionNote}[Audio response registered. Ready for speech-to-text transcription]`;
        });
      };

      recorder.start(100);
      setIsRecordingReal(true);

      recIntervalRef.current = setInterval(() => {
        setRecDuration((prev) => prev + 1);
      }, 1000);

    } catch (err: any) {
      console.error("Microphone access failed", err);
      setMicError(err.message || "Microphone access denied. Please grant permissions in your browser bar.");
      setIsRealMicMode(false);
    }
  };

  // Submit single answer evaluation
  const handleSubmitAnswer = async () => {
    if (!userAnswerText.trim() || isSubmittingAnswer) return;

    setIsSubmittingAnswer(true);
    setErrorMsg(null);
    const currQ = questions[currentQuestionIndex];

    try {
      const response = await fetch("/api/interview/evaluate-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: currQ.question,
          answerText: userAnswerText
        })
      });

      if (!response.ok) {
        throw new Error("Evaluator endpoint failed.");
      }

      const data = await response.json();
      
      const answerRecord: TempAnswer = {
        answerText: userAnswerText,
        isSpeech: false,
        timeSpentSeconds: timeSpent,
        evaluation: data.evaluation
      };

      setSessionAnswers((prev) => ({
        ...prev,
        [currQ.id]: answerRecord
      }));

      // If there are more questions, go to next
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setUserAnswerText("");
        setTimeSpent(0);
      } else {
        // All answered! Automatically trigger overall wrap up evaluation
        await handleWrapUpSession({ ...sessionAnswers, [currQ.id]: answerRecord });
      }

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to submit response. Please retry.");
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  // Terminate full session and compile overall aggregate feedback
  const handleWrapUpSession = async (finalAnswers: { [qId: string]: TempAnswer }) => {
    setIsFinalizingReport(true);
    try {
      const response = await fetch("/api/interview/finalize-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: activeSessionId,
          type: interviewType,
          questions: questions,
          answers: finalAnswers
        })
      });

      if (!response.ok) {
        throw new Error("Finalize endpoint crashed.");
      }

      const finalSession: MockInterviewSession = await response.json();
      playSuccessSound();
      onInterviewComplete(finalSession);
      setSelectedSessionReview(finalSession);
      setActiveSessionId(null);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Synthesizing full mock analytics failed.");
    } finally {
      setIsFinalizingReport(false);
    }
  };

  const getSubScoreColor = (score: number) => {
    if (score >= 25 || (score < 25 && score >= 16)) return "text-emerald-400";
    return "text-amber-400";
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

      {/* Header text */}
      <div className="text-left space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight">AI Placement Mock Interviews</h1>
        <p className="text-slate-400 text-sm">
          Select standard categories to launch challenging mock conversations. Our scoring matches core corporate vetting requirements.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Setup Panel & History list: span 4 */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-5 text-left">
            <h2 className="text-base font-bold font-mono text-slate-400 uppercase tracking-tight flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              Configure Mock Spray
            </h2>

            {!activeSessionId ? (
              <>
                <div className="space-y-2.5">
                  <label className="block text-xs font-mono text-slate-400">Choose Interview Category</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["HR", "Technical", "Behavioral", "Domain-Specific"] as InterviewType[]).map((type) => (
                      <button
                        key={type}
                        onClick={() => { playClickSound(); setInterviewType(type); }}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition duration-200 text-center ${
                          interviewType === type 
                            ? "bg-indigo-950 border-indigo-500 text-indigo-300" 
                            : "bg-slate-950 border-slate-900 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 text-xs text-slate-400 leading-snug">
                  Target Role setting: <span className="text-indigo-400 font-mono font-bold">"{targetRole || "Software Developer"}"</span>. Questions will adjust adaptively using keyword variables drawn from the active resume.
                </div>

                {errorMsg && (
                  <div className="p-3 bg-rose-950/20 border border-rose-900 rounded-lg text-xs text-rose-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button 
                  onClick={() => { playClickSound(); handleStartSession(); }}
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 font-medium hover:from-indigo-500 hover:to-purple-500 transition-all flex items-center justify-center gap-2 text-sm shadow-md"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Generating Custom Questions ...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      Begin Active Session
                    </>
                  )}
                </button>
              </>
            ) : (
              <div className="p-4 rounded-xl bg-slate-950 border border-purple-950 text-center space-y-4">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping mx-auto" />
                <h3 className="text-xs font-mono font-bold text-slate-300 uppercase">Interactive Interview Session Active</h3>
                <p className="text-xs text-slate-500 leading-snug">
                  Currently answering Question {currentQuestionIndex + 1} of 5. Finish responses and submit to proceed.
                </p>
                <div className="text-2xl font-mono text-purple-400 font-bold">
                  {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, "0")}
                </div>
              </div>
            )}
          </div>

          {/* Targeted Preparation Checklist */}
          {!activeSessionId && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-slate-900/60 to-indigo-950/20 border border-slate-800/80 space-y-4 text-left shadow-lg"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-tight flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  Targeted Prep Checklist
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                  (prepChecklist.resumeAnalyzed && prepChecklist.curriculumPlanned && prepChecklist.starPatternStudied && prepChecklist.sampleReviewWatched)
                    ? "bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 animate-pulse"
                    : "bg-amber-950/80 border border-amber-500/30 text-amber-500"
                }`}>
                  {(prepChecklist.resumeAnalyzed && prepChecklist.curriculumPlanned && prepChecklist.starPatternStudied && prepChecklist.sampleReviewWatched) ? "READY FOR VOICE" : "PREPARATION PENDING"}
                </span>
              </div>
              
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Complete these target checklist tasks to unlock professional **Voice / Microphone Assessment** modes and begin advanced interactive oral interviews.
              </p>

              <div className="space-y-3 pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer group">
                  <input 
                    type="checkbox"
                    checked={prepChecklist.resumeAnalyzed}
                    onChange={(e) => {
                      playClickSound();
                      setPrepChecklist(prev => ({ ...prev, resumeAnalyzed: e.target.checked }));
                    }}
                    className="w-3.5 h-3.5 mt-0.5 rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500 accent-indigo-500"
                  />
                  <div className="text-[11px]">
                    <span className={`block font-medium ${prepChecklist.resumeAnalyzed ? 'text-indigo-400 line-through' : 'text-slate-300 group-hover:text-slate-200'}`}>
                      1. Analyze Active Placement Resume
                    </span>
                    <span className="text-[10px] text-slate-500 block leading-tight">
                      ATS Audit scan & Indian recruitment standards check.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer group">
                  <input 
                    type="checkbox"
                    checked={prepChecklist.curriculumPlanned}
                    onChange={(e) => {
                      playClickSound();
                      setPrepChecklist(prev => ({ ...prev, curriculumPlanned: e.target.checked }));
                    }}
                    className="w-3.5 h-3.5 mt-0.5 rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500 accent-indigo-500"
                  />
                  <div className="text-[11px]">
                    <span className={`block font-medium ${prepChecklist.curriculumPlanned ? 'text-indigo-400 line-through' : 'text-slate-300 group-hover:text-slate-200'}`}>
                      2. Synthesize Career Learning Roadmap
                    </span>
                    <span className="text-[10px] text-slate-500 block leading-tight">
                      Establish custom milestone steps & dynamic timelines.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer group">
                  <input 
                    type="checkbox"
                    checked={prepChecklist.starPatternStudied}
                    onChange={(e) => {
                      playClickSound();
                      setPrepChecklist(prev => ({ ...prev, starPatternStudied: e.target.checked }));
                    }}
                    className="w-3.5 h-3.5 mt-0.5 rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500 accent-indigo-500"
                  />
                  <div className="text-[11px]">
                    <span className={`block font-medium ${prepChecklist.starPatternStudied ? 'text-indigo-400 line-through' : 'text-slate-300 group-hover:text-slate-200'}`}>
                      3. Study STAR Answering Pacing
                    </span>
                    <span className="text-[10px] text-slate-500 block leading-tight">
                      Address Situation, Task, Action, and Results systematically.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer group">
                  <input 
                    type="checkbox"
                    checked={prepChecklist.sampleReviewWatched}
                    onChange={(e) => {
                      playClickSound();
                      setPrepChecklist(prev => ({ ...prev, sampleReviewWatched: e.target.checked }));
                    }}
                    className="w-3.5 h-3.5 mt-0.5 rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500 accent-indigo-500"
                  />
                  <div className="text-[11px]">
                    <span className={`block font-medium ${prepChecklist.sampleReviewWatched ? 'text-indigo-400 line-through' : 'text-slate-300 group-hover:text-slate-200'}`}>
                      4. Practice Speaking & Verbal Speed
                    </span>
                    <span className="text-[10px] text-slate-500 block leading-tight">
                      Speak clearly without excessive vocal pauses or fillers.
                    </span>
                  </div>
                </label>
              </div>
            </motion.div>
          )}

          {/* History selection index */}
          {previousSessions.length > 0 && (
            <div className="p-5 rounded-2xl bg-slate-900/20 border border-slate-800/60 text-left">
              <h3 className="text-xs font-mono text-slate-400 uppercase mb-3">Mock Session History</h3>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {previousSessions.map((ses) => (
                  <div 
                    key={ses.id}
                    onClick={() => {
                      if (!activeSessionId) {
                        playClickSound();
                        setSelectedSessionReview(ses);
                      }
                    }}
                    className={`p-3.5 rounded-xl border transition flex justify-between items-center ${
                      activeSessionId ? "opacity-40 pointer-events-none" : ""
                    } ${
                      selectedSessionReview?.id === ses.id 
                        ? "bg-slate-900 border-purple-500/20" 
                        : "bg-slate-950/60 border-slate-900 hover:bg-slate-900/40"
                    }`}
                  >
                    <div>
                      <span className="block text-xs font-bold text-slate-200">
                        {ses.type} Mock Session
                      </span>
                      <span className="block text-[9px] text-slate-500 font-mono">
                        {new Date(ses.startedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`block text-xs font-mono font-bold text-purple-400`}>
                        {ses.overallScore}/100
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Active Workspace or Reports: span 8 */}
        <div className="lg:col-span-8">
          
          <AnimatePresence mode="wait">
            {activeSessionId ? (
              // Active interview workspace
              <motion.div 
                key="workspace-run"
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="p-6 md:p-8 rounded-2xl border border-indigo-950 bg-slate-900/30 backdrop-blur-md space-y-6 text-left"
              >
                
                {/* Status Indicator */}
                <div className="flex justify-between items-center pb-3 border-b border-slate-800/60">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                    <span className="text-xs font-mono text-indigo-300 font-semibold">{interviewType} SESSION TRACK</span>
                    <button
                      onClick={openInNewWindow}
                      className="inline-flex items-center gap-1.2 px-2.5 py-1 rounded bg-indigo-950/85 hover:bg-indigo-900 border border-indigo-800/60 text-[10px] text-indigo-200 hover:text-white transition shadow-sm font-semibold cursor-pointer"
                      title="Open full set of interview questions in a new popup window"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                      Open questions in new window
                    </button>
                  </div>
                  <span className="text-xs font-mono text-slate-500">
                    Question {currentQuestionIndex + 1} of 5
                  </span>
                </div>

                {/* Question bubble */}
                <div className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-900/30 shadow-md">
                  <span className="block text-[9px] font-mono text-indigo-400 mb-1 uppercase tracking-widest">Question prompt:</span>
                  <p className="text-sm md:text-base font-semibold leading-relaxed text-slate-100">
                    {questions[currentQuestionIndex]?.question}
                  </p>
                </div>

                {/* Input Area */}
                <div className="space-y-4">
                  <motion.div 
                    animate={
                      (isMicSimulating || isRecordingReal)
                        ? { 
                            borderColor: ["rgba(244, 63, 94, 0.2)", "rgba(244, 63, 94, 0.6)", "rgba(244, 63, 94, 0.2)"], 
                            boxShadow: [
                              "0 0 0px rgba(244, 63, 94, 0)", 
                              "0 0 12px rgba(244, 63, 94, 0.15)", 
                              "0 0 0px rgba(244, 63, 94, 0)"
                            ] 
                          }
                        : { 
                            borderColor: "rgba(30, 41, 59, 1)", 
                            boxShadow: "0 0 0px rgba(0, 0, 0, 0)" 
                          }
                    }
                    transition={{ 
                      duration: 2, 
                      repeat: (isMicSimulating || isRecordingReal) ? Infinity : 0, 
                      ease: "easeInOut" 
                    }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-xl border border-dashed text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400 font-medium">Input Mode:</span>
                      <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                        <button
                          onClick={() => {
                            playClickSound();
                            setIsRealMicMode(false);
                            stopAllRecordingStreams();
                          }}
                          className={`px-2 py-1 rounded text-[10px] font-bold transition ${
                            !isRealMicMode 
                              ? "bg-indigo-600 text-white shadow-sm" 
                              : "text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          Demo Simulation
                        </button>
                        <button
                          onClick={() => {
                            playClickSound();
                            const isChecklistCompleted = prepChecklist.resumeAnalyzed && prepChecklist.curriculumPlanned && prepChecklist.starPatternStudied && prepChecklist.sampleReviewWatched;
                            if (!isChecklistCompleted) {
                              setMicLockedWarning("🔒 Complete all steps in the Targeted Preparation Checklist (left panel) to unlock live voice assessment rounds!");
                              setTimeout(() => setMicLockedWarning(null), 5000);
                            } else {
                              setIsRealMicMode(true);
                              setMicLockedWarning(null);
                            }
                          }}
                          className={`px-2 py-1 rounded text-[10px] font-bold transition ${
                            isRealMicMode 
                              ? "bg-indigo-600 text-white shadow-sm" 
                              : "text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          Real Microphone
                        </button>
                      </div>
                    </div>

                    <div>
                      {!isRealMicMode ? (
                        <motion.button 
                          onClick={() => { playClickSound(); toggleMicSimulation(); }}
                          animate={isMicSimulating ? {
                            scale: [1, 1.03, 1],
                            boxShadow: ["0 0 0px rgba(239, 68, 68, 0)", "0 0 12px rgba(239, 68, 68, 0.4)", "0 0 0px rgba(239, 68, 68, 0)"]
                          } : {}}
                          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border flex items-center gap-1.5 transition ${
                            isMicSimulating 
                              ? "bg-rose-950/80 border-rose-800 text-rose-300 shadow-md" 
                              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {isMicSimulating ? (
                            <>
                              <div className="relative flex items-center justify-center">
                                <motion.span
                                  animate={{ scale: [1, 2.2, 1], opacity: [0.6, 0, 0.6] }}
                                  transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                                  className="absolute w-3.5 h-3.5 bg-rose-500/40 rounded-full"
                                />
                                <MicOff className="w-3.5 h-3.5 text-rose-400 relative z-10" />
                              </div>
                              <span className="flex items-center gap-1">
                                Stop Simulated Speech
                                <motion.span 
                                  animate={{ opacity: [1, 0.2, 1] }} 
                                  transition={{ repeat: Infinity, duration: 0.8 }} 
                                  className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block"
                                />
                              </span>
                            </>
                          ) : (
                            <>
                              <Mic className="w-3.5 h-3.5" />
                              Simulate Voice Input
                            </>
                          )}
                        </motion.button>
                      ) : (
                        <motion.button 
                          onClick={handleToggleRealRecording}
                          animate={isRecordingReal ? {
                            scale: [1, 1.04, 1],
                            boxShadow: ["0 0 0px rgba(239, 68, 68, 0)", "0 0 15px rgba(239, 68, 68, 0.5)", "0 0 0px rgba(239, 68, 68, 0)"]
                          } : {}}
                          transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border flex items-center gap-1.5 transition ${
                            isRecordingReal 
                              ? "bg-rose-950/80 border-rose-800 text-rose-300 shadow-md" 
                              : "bg-indigo-950/60 border-indigo-900/50 text-indigo-300 hover:text-indigo-200"
                          }`}
                        >
                          {isRecordingReal ? (
                            <>
                              <div className="relative flex items-center justify-center">
                                <motion.span
                                  animate={{ scale: [1, 2.2, 1], opacity: [0.6, 0, 0.6] }}
                                  transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                                  className="absolute w-3.5 h-3.5 bg-rose-500/40 rounded-full"
                                />
                                <MicOff className="w-3.5 h-3.5 text-rose-400 relative z-10" />
                              </div>
                              <span className="flex items-center gap-1">
                                Stop Voice Recording ({recDuration}s)
                                <motion.span 
                                  animate={{ opacity: [1, 0.2, 1] }} 
                                  transition={{ repeat: Infinity, duration: 0.8 }} 
                                  className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block"
                                />
                              </span>
                            </>
                          ) : (
                            <>
                              <Mic className="w-3.5 h-3.5 text-emerald-400" />
                              Start Live Recording
                            </>
                          )}
                        </motion.button>
                      )}
                    </div>
                  </motion.div>

                  {micLockedWarning && (
                    <motion.div 
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-xl bg-amber-950/30 border border-amber-900/40 text-[11px] leading-snug text-amber-300 font-mono flex items-start gap-2.5 shadow-sm"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                      <span>{micLockedWarning}</span>
                    </motion.div>
                  )}

                  {micError && (
                    <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/30 text-[10px] text-rose-400 font-mono flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                      <span>{micError}</span>
                    </div>
                  )}

                  {/* Audio visualizer bar group */}
                  {(isMicSimulating || isRecordingReal) && (
                    <div className="flex items-center justify-center gap-[4px] py-1 bg-slate-950/40 rounded-xl border border-slate-900 h-10">
                      {micVolume.map((vol, index) => (
                        <div 
                          key={index} 
                          className="w-1 bg-gradient-to-t from-indigo-500 to-cyan-400 rounded-full transition-all duration-75"
                          style={{ height: `${vol}px` }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Playback client for real recording */}
                  {realAudioUrl && (
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-dashed border-indigo-950 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in">
                      <div className="text-left">
                        <span className="block text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wide">
                          🎤 Recorded Practice Voice Playback
                        </span>
                        <p className="text-[11px] text-slate-400 font-mono">
                          Listen to your response to evaluate speed & structure!
                        </p>
                      </div>
                      <audio src={realAudioUrl} controls className="h-8 max-w-full accent-indigo-600" />
                    </div>
                  )}

                  <textarea 
                    rows={6}
                    value={userAnswerText}
                    onChange={(e) => setUserAnswerText(e.target.value)}
                    placeholder={
                      isRealMicMode 
                        ? "Speak your response clearly while live recording. Your recorded audio waveform is persistent and playable so you can practice speech pacing and technical pronunciation!"
                        : "Formulate your response using clear technical definitions, past context projects, and the STAR format. Or click 'Simulate Voice Input' to populate a high-quality model response!"
                    }
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs md:text-sm font-mono text-slate-300 outline-none focus:border-indigo-600 transition resize-none placeholder-slate-600"
                  />
                </div>

                {/* Action buttons */}
                <div className="flex justify-between items-center pt-2">
                  <span className="text-[10px] text-slate-500 font-mono leading-none">
                    Expected guidelines: {questions[currentQuestionIndex]?.expectedKeywords?.slice(0, 3)?.join(", ")}
                  </span>
                  
                  <button 
                    onClick={() => { playClickSound(); handleSubmitAnswer(); }}
                    disabled={isSubmittingAnswer || !userAnswerText.trim()}
                    className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold shadow-md transition disabled:opacity-40 flex items-center gap-1.5"
                  >
                    {isSubmittingAnswer ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Evaluating...
                      </>
                    ) : (
                      <>
                        Confirm and Submit
                        <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>

              </motion.div>
            ) : isFinalizingReport ? (
              // Aggregating complete score mock scanner
              <div className="p-8 rounded-2xl border border-purple-950/60 bg-slate-900/20 backdrop-blur-md h-[550px] flex flex-col items-center justify-center text-center space-y-6">
                <div className="relative w-28 h-28 flex items-center justify-center bg-purple-950/10 rounded-full border border-purple-800/40 animate-pulse">
                  <Award className="w-12 h-12 text-purple-400" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold font-mono tracking-tight text-white animate-pulse">Aggregating Final Session Performance...</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto shadow-sm">
                    Our AI models are compiling strengths, verbal omissions, and grammatical pacing to generate a detailed preparation roadmap feedback sprint.
                  </p>
                </div>
              </div>
            ) : selectedSessionReview ? (
              // Finished report screen
              <motion.div 
                key="report-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 text-left"
              >
                
                {/* Aggregate Score header card */}
                <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900/90 via-purple-950/20 to-slate-900/95 border border-purple-900/30 shadow-xl flex flex-col sm:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-4">
                    <div className="p-4 rounded-xl bg-purple-600 shrink-0">
                      <Award className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <span className="text-[10px] text-purple-400 font-mono font-bold leading-none">MOCK SESSION SUCCESS</span>
                      <h3 className="text-xl font-extrabold text-[#F8FAFC]">
                        {selectedSessionReview.type} Mock Performance
                      </h3>
                      <p className="text-xs text-slate-500">
                        Conducted on {new Date(selectedSessionReview.startedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="text-center sm:text-right">
                    <span className="block text-[9px] font-mono text-slate-400 uppercase leading-none">Overall session Score</span>
                    <span className="text-4xl font-black text-purple-400 tracking-tight">{selectedSessionReview.overallScore}/100</span>
                  </div>
                </div>

                {/* Sub sections: aggregate details */}
                <div className="p-6 rounded-2xl bg-slate-900/30 border border-slate-800/80 space-y-6">
                  <h4 className="text-sm font-bold text-slate-200">Session Evaluation Synthesis</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Strengths */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">Overarching Strengths</span>
                      <div className="p-4 rounded-xl bg-emerald-950/10 border border-emerald-950/30 space-y-2">
                        {selectedSessionReview.overallReport?.strengths?.map((str, i) => (
                          <div key={i} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
                            <span className="text-emerald-400 font-bold font-mono">✓</span>
                            <span>{str}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Weaknesses */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider block">Areas to Improve</span>
                      <div className="p-4 rounded-xl bg-rose-950/10 border border-rose-950/30 space-y-2">
                        {selectedSessionReview.overallReport?.weaknesses?.map((wea, i) => (
                          <div key={i} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
                            <span className="text-rose-400 font-bold font-mono">⚠</span>
                            <span>{wea}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/*Suggestions and roadmap lists*/}
                  {selectedSessionReview.overallReport?.suggestions && (
                    <div className="pt-4 border-t border-slate-800/65 grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Action Plan suggestions */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider block">Tactical Action Plan</span>
                        <ul className="space-y-2 list-none">
                          {selectedSessionReview.overallReport.actionPlan?.map((ap, i) => (
                            <li key={i} className="text-xs text-slate-400 leading-snug">
                              <span className="font-bold text-indigo-400 mr-1.5 font-mono">{i + 1}.</span> {ap}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Actionable Micro tasks: checkboxes */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider block">Recommended Practice Micro Tasks</span>
                        <div className="space-y-2">
                          {selectedSessionReview.overallReport.microTasks?.map((task, idx) => {
                            return (
                              <label 
                                key={task.id || idx}
                                className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-950 hover:bg-slate-900 transition border border-slate-900 text-left select-none cursor-pointer"
                              >
                                <input 
                                  type="checkbox"
                                  defaultChecked={task.checked}
                                  className="w-4 h-4 rounded text-indigo-600 focus:ring-opacity-0 focus:outline-none"
                                />
                                <span className="text-xs text-slate-300 font-medium leading-tight">{task.name}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  )}
                </div>

                {/* Sub collapsible list of exact questions & critique responses answered during session */}
                <div className="space-y-3.5">
                  <h4 className="text-xs font-mono font-bold text-slate-400 uppercase">Collateral Q&A Evaluation breakdown</h4>
                  
                  {selectedSessionReview.questions?.map((q, idx) => {
                    const ans = selectedSessionReview.answers?.[q.id];
                    if (!ans) return null;
                    
                    return (
                      <div key={q.id} className="p-5 rounded-xl bg-slate-900/25 border border-slate-800 space-y-4">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="text-[9px] font-mono text-purple-400 font-bold uppercase">Candidate Response {idx + 1}:</span>
                            <h5 className="text-xs md:text-sm font-semibold text-slate-200 mt-0.5 leading-snug">{q.question}</h5>
                          </div>
                          
                          <div className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-right shrink-0">
                            <span className="block text-[8px] font-mono text-slate-500 uppercase leading-none">score</span>
                            <span className="font-bold text-xs tracking-tight text-white">{ans.evaluation?.finalScore || 70}/100</span>
                          </div>
                        </div>

                        <div className="p-3 bg-slate-950 rounded border border-slate-900 text-xs text-slate-400 font-mono italic leading-snug">
                          "{ans.answerText}"
                        </div>

                        {ans.evaluation && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2 border-t border-slate-800/60 leading-normal">
                            <div className="md:col-span-2 space-y-1">
                              <p className="font-mono text-[9px] text-[#06B6D4] uppercase font-bold">Interviewer Critique:</p>
                              <p className="text-slate-400 text-[11.5px] leading-relaxed">{ans.evaluation.critique}</p>
                            </div>
                            
                            <div className="space-y-1">
                              <p className="font-mono text-[9px] text-indigo-400 uppercase font-bold">Rubrics Score:</p>
                              <div className="space-y-1 text-[10px] text-slate-500">
                                <p className="flex justify-between"><span>Technical:</span> <span className="font-bold text-slate-300">{ans.evaluation.technicalAccuracy}/30</span></p>
                                <p className="flex justify-between"><span>Communication:</span> <span className="font-bold text-slate-300">{ans.evaluation.communication}/20</span></p>
                                <p className="flex justify-between"><span>Confidence:</span> <span className="font-bold text-slate-300">{ans.evaluation.confidence}/20</span></p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Consecutive Rounds Quick Launch Widget */}
                <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 to-indigo-950/20 border border-slate-800/80 space-y-4 shadow-md">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                    <h4 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-tight">Challenge Next Placement Round</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Standard campus recruitment vetting processes require clearance across multiple rounds. Complete other critical parameters to secure your diagnostic metrics:
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    {(["HR", "Technical", "Behavioral", "Domain-Specific"] as InterviewType[])
                      .filter((t) => t !== selectedSessionReview.type)
                      .map((type) => (
                        <button
                          key={type}
                          onClick={() => {
                            playClickSound();
                            // Reset review state, select the new interview category
                            setSelectedSessionReview(null);
                            setInterviewType(type);
                            window.scrollTo({ top: 120, behavior: "smooth" });
                          }}
                          className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-left hover:bg-slate-900/90 transition-all group flex items-center justify-between"
                        >
                          <div>
                            <span className="block text-xs font-bold font-mono text-indigo-300 group-hover:text-indigo-200">
                              {type} Assessment
                            </span>
                            <span className="text-[9px] text-slate-500 block leading-tight mt-0.5">
                              Setup dynamic set of questions.
                            </span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 transition" />
                        </button>
                      ))}
                  </div>
                </div>

              </motion.div>
            ) : (
              // Empty initial area view state
              <div className="p-12 rounded-2xl border-2 border-dashed border-slate-800 text-center h-[520px] flex flex-col items-center justify-center space-y-4">
                <MessageSquare className="w-16 h-16 text-slate-700 stroke-1" />
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-400">Mock Workspace Ready</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                    Select a category and launch high-fidelity questions on the left. The compiler will structure questions custom-fit to test your target role experience indices.
                  </p>
                </div>
              </div>
            )}
          </AnimatePresence>

        </div>

      </div>

      {/* Floating Action Button for Quick Tips */}
      <div className="fixed bottom-6 right-6 z-40">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { playClickSound(); setShowTips(true); }}
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-350 hover:to-indigo-400 text-slate-950 font-black tracking-tight shadow-[0_0_20px_rgba(34,211,238,0.35)] text-xs uppercase"
        >
          <Lightbulb className="w-4 h-4 fill-current animate-bounce" />
          <span>Quick Tips</span>
        </motion.button>
      </div>

      {/* Slide-out Sidebar Drawer Panel */}
      <AnimatePresence>
        {showTips && (
          <>
            {/* Backdrop opacity layer overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTips(false)}
              className="fixed inset-0 bg-slate-950 z-50 cursor-pointer"
            />

            {/* Sidebar main slide-in canvas drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-slate-950 border-l border-slate-805 border-slate-800 shadow-[0_0_30px_rgba(0,0,0,0.8)] z-50 flex flex-col overflow-y-auto text-left"
            >
              {/* Sidebar Header */}
              <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-950/20 to-slate-950">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold font-mono text-xs uppercase">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    expert interview briefing
                  </div>
                  <h3 className="text-lg font-bold text-slate-100 flex items-center gap-1.5 font-mono">
                    Interview Category Tips
                  </h3>
                </div>
                <button
                  onClick={() => { playClickSound(); setShowTips(false); }}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition"
                >
                  <PanelRightClose className="w-4 h-4" />
                </button>
              </div>

              {/* Sidebar Content */}
              <div className="p-6 space-y-6 flex-1">
                {/* Visual active category tag card */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-indigo-900/40 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Selected Category</span>
                    <h4 className="text-sm font-black text-slate-200 tracking-tight">{interviewType} Interview Mode</h4>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-indigo-950 border border-indigo-800 text-indigo-300">ACTIVE</span>
                </div>

                <div className="space-y-4">
                  <h5 className="text-xs font-mono font-bold text-slate-400 uppercase flex items-center gap-2">
                    <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                    Strategic context & guidance:
                  </h5>
                  
                  {/* Contextual guidance switcher */}
                  {interviewType === "HR" && (
                    <div className="space-y-3">
                      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-850 space-y-1.5 transition">
                        <span className="text-emerald-400 font-bold text-xs uppercase font-mono">1. Authenticity & Structure</span>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          HR evaluations test behavioral integration, communication clarity, salary expectation matching, and general motivators. Ensure you speak with proactive ownership.
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-850 space-y-1.5 transition">
                        <span className="text-emerald-400 font-bold text-xs uppercase font-mono">2. Core Vetting Goals</span>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          They seek answers to: "Why us? Why now? Do you fit our standards? Are you a culture add?" Learn the corporate motto and weave it organically into your intro.
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-850 space-y-1.5 transition">
                        <span className="text-emerald-400 font-bold text-xs uppercase font-mono">3. HR Battle-Tested Rule</span>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Be humble but direct. Frame any resume gaps or tech limitations around continuous online upskilling and aggressive growth achievements.
                        </p>
                      </div>
                    </div>
                  )}

                  {interviewType === "Technical" && (
                    <div className="space-y-3">
                      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-850 space-y-1.5 transition">
                        <span className="text-cyan-400 font-bold text-xs uppercase font-mono">1. Logical Vocalization</span>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Explain your approach BEFORE writing any code. State details about selected patterns, average/worst complexities, and memory impacts clearly.
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-850 space-y-1.5 transition">
                        <span className="text-cyan-400 font-bold text-xs uppercase font-mono">2. Defend Against Edge Cases</span>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Explicitly call out empty lists, single items, null nodes, or duplicate keys. This signals meticulous, production-ready engineering discipline.
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-850 space-y-1.5 transition">
                        <span className="text-cyan-400 font-bold text-xs uppercase font-mono">3. Technical Battle-Tested Rule</span>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Trace dry examples on input test-cases explicitly. Avoid landing on non-optimized solutions without mentioning alternative trade-offs first.
                        </p>
                      </div>
                    </div>
                  )}

                  {interviewType === "Behavioral" && (
                    <div className="space-y-3">
                      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-850 space-y-1.5 transition">
                        <span className="text-indigo-400 font-bold text-xs uppercase font-mono">1. The S.T.A.R. Framework</span>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Strictly layout: **Situation** (brief background), **Task** (the specific problem/assignment), **Action** (the exact engineering steps *you* took, 50% weight), and **Result** (the quantified business outcomes).
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-850 space-y-1.5 transition">
                        <span className="text-indigo-400 font-bold text-xs uppercase font-mono">2. Ownership vs. Blame</span>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          When describing failure or conflict, avoid criticizing peers or managers. Focus on system limitations, scope ambiguities, and constructive compromises you drove.
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-850 space-y-1.5 transition">
                        <span className="text-indigo-400 font-bold text-xs uppercase font-mono">3. Behavioral Battle-Tested Rule</span>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Focus your stories on "I did", not just "We did". Share honest key lessons from past oversights to display mature, highly reflective professional growth.
                        </p>
                      </div>
                    </div>
                  )}

                  {interviewType === "Domain-Specific" && (
                    <div className="space-y-3">
                      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-850 space-y-1.5 transition">
                        <span className="text-amber-400 font-bold text-xs uppercase font-mono">1. System-Level Architecture</span>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Articate distributed configurations: CDN layers, reverse proxies, database replicas, caching strategies, horizontal scaling rules, and message queues.
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-850 space-y-1.5 transition">
                        <span className="text-amber-400 font-bold text-xs uppercase font-mono">2. Ecosystem Constraints</span>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Demonstrate deep domain expertise in the target engineering track (e.g. low-level thread control, cloud ingress, or client security measures).
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-850 space-y-1.5 transition">
                        <span className="text-amber-400 font-bold text-xs uppercase font-mono">3. Domain Battle-Tested Rule</span>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Reference actual production-focused technologies (e.g. Redis hashes, Elasticsearch shards, Kafka stream indexes) to solidify your senior profile.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Close instruction tip footer */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 text-[10px] text-slate-500 font-mono leading-relaxed">
                  💡 Tips automatically refresh when you switch interview types in the Mock Interview module. Keeping this open while reviewing question evaluations is highly recommended!
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
