/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  headline?: string;
  avatarUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  targetRole?: string;
  bio?: string;
  joinedAt: string;
}

export interface ATSBreakdown {
  contactInfo: number; // Max 10
  education: number; // Max 15
  projects: number; // Max 15
  skills: number; // Max 20
  experience: number; // Max 15
  certifications: number; // Max 10
  keywords: number; // Max 10
  formatting: number; // Max 5
  totalScore: number; // Max 100
}

export interface ResumeAnalysis {
  id: string;
  analyzedAt: string;
  parsedData: {
    name?: string;
    email?: string;
    phone?: string;
    education: Array<{ degree: string; institution: string; year: string }>;
    projects: Array<{ title: string; tech: string[]; description: string }>;
    skills: string[];
    experience: Array<{ role: string; company: string; duration: string; bulletPoints: string[] }>;
    certifications: string[];
  };
  atsReport: ATSBreakdown;
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  formattingSuggestions: string[];
  recommendedKeywords: string[];
  keywordDensity: Array<{ keyword: string; count: number; recommendCount: number }>;
}

export type InterviewType = "HR" | "Technical" | "Behavioral" | "Domain-Specific";

export interface InterviewQuestion {
  id: string;
  question: string;
  category: string;
  expectedKeywords: string[];
  durationLimitSeconds?: number;
}

export interface MockAnswers {
  [questionId: string]: {
    answerText: string;
    isSpeech: boolean;
    timeSpentSeconds: number;
    evaluation?: AnswerEvaluation;
  };
}

export interface AnswerEvaluation {
  technicalAccuracy: number; // Max 30
  communication: number; // Max 20
  confidence: number; // Max 20
  relevance: number; // Max 15
  grammar: number; // Max 15
  finalScore: number; // Max 100
  critique: string;
  betterPhrasings: string[];
  suggestedAnswer: string;
}

export interface MockInterviewSession {
  id: string;
  type: InterviewType;
  startedAt: string;
  completedAt?: string;
  questions: InterviewQuestion[];
  answers: MockAnswers;
  overallScore?: number;
  overallReport?: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    actionPlan: string[];
    microTasks: Array<{ id: string; name: string; checked: boolean }>;
  };
}

export interface LearningNode {
  id: string;
  phase: string;
  title: string;
  skills: string[];
  duration: string;
  resources: Array<{ name: string; url?: string; type: "course" | "book" | "doc" }>;
  challenges: string[];
}

export interface CareerRoadmap {
  id: string;
  createdAt: string;
  careerGoal: string;
  targetRole: string;
  currentSkills: string[];
  estimatedMonths: number;
  roadmapNodes: LearningNode[];
  certificationsToGet: string[];
  projectsToBuild: Array<{ title: string; tech: string[]; difficulty: string; summary: string }>;
}

export interface DashboardMetrics {
  resumeScore: number;
  atsScore: number;
  interviewScore: number;
  communicationScore: number;
  placementReadinessScore: number;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  type: "upload" | "interview" | "evaluation" | "roadmap" | "profile" | "achievement";
  title: string;
  description: string;
  scoreDelta?: number;
}

export interface UserSession {
  user: UserProfile | null;
  resumes: ResumeAnalysis[];
  interviews: MockInterviewSession[];
  roadmaps: CareerRoadmap[];
  activities: ActivityLog[];
}
