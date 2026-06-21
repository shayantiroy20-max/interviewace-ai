import { jsPDF } from "jspdf";
import { UserProfile, DashboardMetrics, ResumeAnalysis, MockInterviewSession, CareerRoadmap } from "../types";

/**
 * Programmatically generates a premium, publication-grade Performance Report PDF.
 * Uses native vector drawing and automatic text layout wrapping for robust formatting.
 */
export function generatePerformanceReportPDF(
  user: UserProfile,
  metrics: DashboardMetrics,
  latestResume: ResumeAnalysis | undefined,
  latestInterview: MockInterviewSession | undefined,
  latestRoadmap: CareerRoadmap | undefined
) {
  // Create letter-size PDF in portrait (A4 size: 210mm x 297mm)
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin; // 170mm
  let y = 20; // Current vertical cursor coordinate
  let currentPage = 1;

  // Custom typography palettes
  const designPalette = {
    darkSlate: [15, 23, 42],      // Primary text & dark sections (Slate 900)
    indigo: [79, 70, 229],        // Primary accents & header (Indigo 600)
    emerald: [16, 185, 129],      // Positive scores / strengths (Emerald 500)
    rose: [244, 63, 94],          // Low scores / warnings (Rose 500)
    softGray: [241, 245, 249],    // Background shading (Slate 100)
    darkGray: [100, 116, 139],    // Secondary descriptions (Slate 500)
    lightIndigo: [224, 231, 255]  // Highlight pill boxes (Indigo 100)
  };

  // Helper macro: Page breaks with running footers
  const checkPageBreak = (spaceNeeded: number) => {
    if (y + spaceNeeded >= pageHeight - 25) {
      drawFooter();
      doc.addPage();
      currentPage++;
      y = 25; // standard starting point for new page
      drawHeader();
    }
  };

  const drawHeaderOnFirstPageOnly = () => {
    // Beautiful styled top bar
    doc.setFillColor(designPalette.darkSlate[0], designPalette.darkSlate[1], designPalette.darkSlate[2]);
    doc.rect(margin, y, contentWidth, 24, "F");

    // Header Branding Text
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("INTERVIEWACE", margin + 8, y + 9);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(199, 210, 254);
    doc.text("ELITE CAREER READY PORTFOLIO REPORT", margin + 8, y + 15);

    // Generation timestamp text right-aligned
    const genDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Generated: ${genDate}`, margin + contentWidth - 8, y + 12, { align: "right" });

    y += 32;
  };

  const drawHeaderOnOtherPages = () => {
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, y - 5, margin + contentWidth, y - 5);
    
    doc.setTextColor(designPalette.darkGray[0], designPalette.darkGray[1], designPalette.darkGray[2]);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text(`InterviewAce Portfolio Report | ${user.fullName}`, margin, y - 1);
    
    doc.text(`Page ${currentPage}`, margin + contentWidth, y - 1, { align: "right" });
    
    y += 6;
  };

  const drawHeader = () => {
    if (currentPage > 1) {
      drawHeaderOnOtherPages();
    }
  };

  const drawFooter = () => {
    const bottomY = pageHeight - 15;
    
    // Tiny subtle divider
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(margin, bottomY - 2, margin + contentWidth, bottomY - 2);

    doc.setTextColor(148, 163, 184);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7);
    doc.text("Confidential Performance Summary — Crafted dynamically for placement mentorship evaluation.", margin, bottomY + 2);
    
    doc.setFont("helvetica", "normal");
    doc.text(`Page ${currentPage}`, margin + contentWidth, bottomY + 2, { align: "right" });
  };

  // 1. First Page Header Setup
  drawHeaderOnFirstPageOnly();

  // 2. Candidate Overview Block
  doc.setFillColor(designPalette.softGray[0], designPalette.softGray[1], designPalette.softGray[2]);
  doc.rect(margin, y, contentWidth, 22, "F");
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(designPalette.darkSlate[0], designPalette.darkSlate[1], designPalette.darkSlate[2]);
  doc.text(user.fullName.toUpperCase(), margin + 6, y + 7);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(`Target Profession: ${user.targetRole || "Software Engineer Intern"}`, margin + 6, y + 13);
  doc.text(`Candidate Email Contact: ${user.email}`, margin + 6, y + 18);

  // Stats summary right column inside upper container
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(designPalette.indigo[0], designPalette.indigo[1], designPalette.indigo[2]);
  doc.text("PREPARATION LEVEL:", margin + contentWidth - 6, y + 8, { align: "right" });

  const readinessPct = metrics.placementReadinessScore;
  const readinessTier = readinessPct >= 80 ? "ELITE MASTER" : readinessPct >= 60 ? "COMPETENT DISCIPLINE" : "UNPREPARED WORKSPACE";
  doc.setFontSize(11);
  doc.setTextColor(readinessPct >= 80 ? designPalette.emerald[0] : readinessPct >= 60 ? designPalette.indigo[0] : designPalette.rose[0],
                   readinessPct >= 80 ? designPalette.emerald[1] : readinessPct >= 60 ? designPalette.indigo[1] : designPalette.rose[1],
                   readinessPct >= 80 ? designPalette.emerald[2] : readinessPct >= 60 ? designPalette.indigo[2] : designPalette.rose[2]);
  doc.text(`${readinessPct}% - ${readinessTier}`, margin + contentWidth - 6, y + 15, { align: "right" });

  y += 30;

  // 3. Score Breakdown Module (Grid of 5 metrics)
  checkPageBreak(35);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(designPalette.darkSlate[0], designPalette.darkSlate[1], designPalette.darkSlate[2]);
  doc.text("I. PLACEMENT DIAGNOSTIC INDEXES", margin, y);
  
  // Underline index header
  doc.setDrawColor(designPalette.indigo[0], designPalette.indigo[1], designPalette.indigo[2]);
  doc.setLineWidth(0.6);
  doc.line(margin, y + 2, margin + contentWidth, y + 2);
  
  y += 8;

  // Score boxes definitions
  const columns = [
    { label: "Resume Rating", val: metrics.resumeScore, detail: "Core Sections Layout" },
    { label: "ATS Keyword Align", val: metrics.atsScore, detail: "Matching Matrix Score" },
    { label: "Technical Interview", val: metrics.interviewScore, detail: "Subject Accuracy Rating" },
    { label: "Speech Clarity", val: metrics.communicationScore, detail: "Vocab & Speech Performance" },
    { label: "Overall Fitness", val: metrics.placementReadinessScore, detail: "Combined Index Ratio" }
  ];

  const colWidth = (contentWidth - 16) / 5; // spacing of columns
  const boxHeight = 22;

  columns.forEach((col, idx) => {
    const colX = margin + idx * (colWidth + 4);
    
    // Fill subtle grey card
    doc.setFillColor(designPalette.softGray[0], designPalette.softGray[1], designPalette.softGray[2]);
    doc.rect(colX, y, colWidth, boxHeight, "F");

    // Left micro accent line
    doc.setDrawColor(col.val >= 80 ? designPalette.emerald[0] : col.val >= 60 ? designPalette.indigo[0] : designPalette.rose[0],
                     col.val >= 80 ? designPalette.emerald[1] : col.val >= 60 ? designPalette.indigo[1] : designPalette.rose[1],
                     col.val >= 80 ? designPalette.emerald[2] : col.val >= 60 ? designPalette.indigo[2] : designPalette.rose[2]);
    doc.setLineWidth(1.2);
    doc.line(colX, y, colX, y + boxHeight);

    // Texts inside card
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(designPalette.darkGray[0], designPalette.darkGray[1], designPalette.darkGray[2]);
    doc.text(col.label, colX + 3, y + 5);

    // Big numerical index percentage
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(col.val >= 80 ? designPalette.emerald[0] : col.val >= 60 ? designPalette.darkSlate[0] : designPalette.rose[0],
                     col.val >= 80 ? designPalette.emerald[1] : col.val >= 60 ? designPalette.darkSlate[1] : designPalette.rose[1],
                     col.val >= 80 ? designPalette.emerald[2] : col.val >= 60 ? designPalette.darkSlate[2] : designPalette.rose[2]);
    doc.text(`${col.val}%`, colX + 3, y + 13);

    // Tiny metadata description
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(designPalette.darkGray[0], designPalette.darkGray[1], designPalette.darkGray[2]);
    
    // Wrap text inside small box width
    const wrappedLabel = doc.splitTextToSize(col.detail, colWidth - 5);
    doc.text(wrappedLabel, colX + 3, y + 18);
  });

  y += boxHeight + 12;

  // 4. ATS & Resume Details Section
  checkPageBreak(45);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(designPalette.darkSlate[0], designPalette.darkSlate[1], designPalette.darkSlate[2]);
  doc.text("II. LATEST RESUME ATS ANALYSIS SUMMARY", margin, y);
  
  doc.setDrawColor(designPalette.indigo[0], designPalette.indigo[1], designPalette.indigo[2]);
  doc.setLineWidth(0.6);
  doc.line(margin, y + 2, margin + contentWidth, y + 2);
  
  y += 8;

  if (latestResume) {
    // Left-col layout: Parse Details, Right-col layout: Keywords
    const halfWidth = (contentWidth - 8) / 2;
    
    // Strengths and Weaknesses
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(designPalette.emerald[0], designPalette.emerald[1], designPalette.emerald[2]);
    doc.text("RECOGNISED PORTFOLIO STRENGTHS:", margin, y);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(designPalette.darkSlate[0], designPalette.darkSlate[1], designPalette.darkSlate[2]);
    
    let strengthY = y + 4;
    const strengthsToShow = latestResume.strengths.slice(0, 3);
    if (strengthsToShow.length === 0) {
      doc.text("• No specific resume weaknesses detected. Sections are fully parsed.", margin + 3, strengthY);
      strengthY += 4.5;
    } else {
      strengthsToShow.forEach((str) => {
        const wrappedStr = doc.splitTextToSize(`• ${str}`, halfWidth - 5);
        doc.text(wrappedStr, margin + 2, strengthY);
        strengthY += (wrappedStr.length * 3.8);
      });
    }

    // Weaknesses Below
    let weaknessY = strengthY + 2;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(designPalette.rose[0], designPalette.rose[1], designPalette.rose[2]);
    doc.text("CONSTRUCTIVE CRITIQUE & IMPROVEMENTS:", margin, weaknessY);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(designPalette.darkSlate[0], designPalette.darkSlate[1], designPalette.darkSlate[2]);
    
    weaknessY += 4;
    const weaknessesToShow = latestResume.weaknesses.slice(0, 3);
    if (weaknessesToShow.length === 0) {
      doc.text("• Section layout conforms fully to standard formatting indices.", margin + 3, weaknessY);
      weaknessY += 4.5;
    } else {
      weaknessesToShow.forEach((wk) => {
        const wrappedWk = doc.splitTextToSize(`• ${wk}`, halfWidth - 5);
        doc.text(wrappedWk, margin + 2, weaknessY);
        weaknessY += (wrappedWk.length * 3.8);
      });
    }

    // Right Column contents: Keyword density or suggestions
    let rightY = y;
    const rightColX = margin + halfWidth + 8;
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(designPalette.indigo[0], designPalette.indigo[1], designPalette.indigo[2]);
    doc.text("MISSING INDUSTRY-CRITICAL KEYWORDS:", rightColX, rightY);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(designPalette.darkSlate[0], designPalette.darkSlate[1], designPalette.darkSlate[2]);
    
    rightY += 4;
    const missingToShow = latestResume.missingSkills.slice(0, 5);
    if (missingToShow.length === 0) {
      doc.text("• All standard technology descriptors match correctly.", rightColX + 3, rightY);
      rightY += 4.5;
    } else {
      missingToShow.forEach((sk) => {
        doc.setFillColor(designPalette.lightIndigo[0], designPalette.lightIndigo[1], designPalette.lightIndigo[2]);
        doc.rect(rightColX + 2, rightY - 3, halfWidth - 6, 4.5, "F");
        
        doc.setTextColor(designPalette.indigo[0], designPalette.indigo[1], designPalette.indigo[2]);
        doc.setFont("helvetica", "bold");
        doc.text(`+ Required Focus: ${sk}`, rightColX + 4, rightY + 0.5);
        rightY += 6;
      });
    }

    // Density matrix table title
    rightY += 2;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(designPalette.darkSlate[0], designPalette.darkSlate[1], designPalette.darkSlate[2]);
    doc.text("KEYWORD CLUSTER OCCURRENCE RATE:", rightColX, rightY);
    
    rightY += 4;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(designPalette.darkGray[0], designPalette.darkGray[1], designPalette.darkGray[2]);
    
    const densityToShow = latestResume.keywordDensity.slice(0, 4);
    if (densityToShow.length === 0) {
      doc.text("Keyword matching analyzer logs vacant.", rightColX + 2, rightY);
    } else {
      densityToShow.forEach((density) => {
        doc.text(`• ${density.keyword}`, rightColX + 2, rightY);
        doc.text(`State: ${density.count} found / ${density.recommendCount} recom.`, rightColX + halfWidth - 35, rightY, { align: "right" });
        rightY += 4;
      });
    }

    // Synchronize maximum heights to set downstream Y position
    const maxHeight = Math.max(weaknessY, rightY);
    y = maxHeight + 10;
  } else {
    // Placeholder message if no resume yet
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8.5);
    doc.setTextColor(designPalette.darkGray[0], designPalette.darkGray[1], designPalette.darkGray[2]);
    doc.text("No active custom resume parsed in this workspace yet. Progress the analyzer page run.", margin + 4, y + 4);
    y += 15;
  }

  // 5. Mock Interview Performance Section
  checkPageBreak(50);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(designPalette.darkSlate[0], designPalette.darkSlate[1], designPalette.darkSlate[2]);
  doc.text("III. CONTEXT MOCK INTERVIEW EVALUATIONS", margin, y);
  
  doc.setDrawColor(designPalette.indigo[0], designPalette.indigo[1], designPalette.indigo[2]);
  doc.setLineWidth(0.6);
  doc.line(margin, y + 2, margin + contentWidth, y + 2);
  
  y += 8;

  if (latestInterview) {
    doc.setFillColor(designPalette.softGray[0], designPalette.softGray[1], designPalette.softGray[2]);
    doc.rect(margin, y, contentWidth, 11, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(designPalette.indigo[0], designPalette.indigo[1], designPalette.indigo[2]);
    doc.text(`ACTIVE SESSION MODE: ${latestInterview.type} SPRINT RUN`, margin + 4, y + 7.5);
    
    const scoreVal = latestInterview.overallScore || 0;
    doc.setTextColor(scoreVal >= 80 ? designPalette.emerald[0] : scoreVal >= 60 ? designPalette.indigo[0] : designPalette.rose[0],
                     scoreVal >= 80 ? designPalette.emerald[1] : scoreVal >= 60 ? designPalette.indigo[1] : designPalette.rose[1],
                     scoreVal >= 80 ? designPalette.emerald[2] : scoreVal >= 60 ? designPalette.indigo[2] : designPalette.rose[2]);
    doc.text(`RATING: ${scoreVal}%`, margin + contentWidth - 4, y + 7.5, { align: "right" });

    y += 16;

    if (latestInterview.overallReport) {
      const halfWidth = (contentWidth - 8) / 2;
      let repY = y;

      // Strengths
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(designPalette.emerald[0], designPalette.emerald[1], designPalette.emerald[2]);
      doc.text("TECHNICAL VERBAL MASTERY STRENGTHS:", margin, repY);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(designPalette.darkSlate[0], designPalette.darkSlate[1], designPalette.darkSlate[2]);
      
      repY += 4;
      const interStrengths = latestInterview.overallReport.strengths.slice(0, 3);
      interStrengths.forEach((str) => {
        const wrapped = doc.splitTextToSize(`✔ ${str}`, halfWidth - 5);
        doc.text(wrapped, margin + 2, repY);
        repY += (wrapped.length * 3.8);
      });

      // Actions/Suggestions list
      repY += 2;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(designPalette.rose[0], designPalette.rose[1], designPalette.rose[2]);
      doc.text("VERBAL RECOVERY SUGGESTIONS & FAULTS:", margin, repY);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(designPalette.darkSlate[0], designPalette.darkSlate[1], designPalette.darkSlate[2]);
      
      repY += 4;
      const interWeaknesses = latestInterview.overallReport.weaknesses.slice(0, 3);
      interWeaknesses.forEach((wk) => {
        const wrapped = doc.splitTextToSize(`⚠ ${wk}`, halfWidth - 5);
        doc.text(wrapped, margin + 2, repY);
        repY += (wrapped.length * 3.8);
      });

      // Right column logic: Mentor Roadmap Actions & Micro tasks
      let rightY = y;
      const rightColX = margin + halfWidth + 8;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(designPalette.indigo[0], designPalette.indigo[1], designPalette.indigo[2]);
      doc.text("HIGH-IMPACT MOCK ACTION PLANS:", rightColX, rightY);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(designPalette.darkSlate[0], designPalette.darkSlate[1], designPalette.darkSlate[2]);
      
      rightY += 4;
      const interPlans = latestInterview.overallReport.actionPlan.slice(0, 3);
      interPlans.forEach((plan) => {
        const wrapped = doc.splitTextToSize(`→ ${plan}`, halfWidth - 5);
        doc.text(wrapped, rightColX + 2, rightY);
        rightY += (wrapped.length * 3.8);
      });

      // Micro task checklists
      rightY += 2;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(designPalette.darkSlate[0], designPalette.darkSlate[1], designPalette.darkSlate[2]);
      doc.text("PRACTICE TASKS COMMITTED:", rightColX, rightY);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(designPalette.darkSlate[0], designPalette.darkSlate[1], designPalette.darkSlate[2]);
      
      rightY += 4;
      const interTasks = latestInterview.overallReport.microTasks.slice(0, 4);
      interTasks.forEach((tsk) => {
        const chkMark = tsk.checked ? "☒" : "☐";
        doc.setFont("helvetica", tsk.checked ? "bold" : "normal");
        const wrapped = doc.splitTextToSize(`${chkMark} ${tsk.name}`, halfWidth - 5);
        doc.text(wrapped, rightColX + 2, rightY);
        rightY += (wrapped.length * 3.8);
      });

      y = Math.max(repY, rightY) + 10;
    } else {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8.5);
      doc.setTextColor(designPalette.darkGray[0], designPalette.darkGray[1], designPalette.darkGray[2]);
      doc.text("Active session results parsed successfully. Question-specific metrics saved to database logs.", margin + 4, y + 4);
      y += 14;
    }
  } else {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8.5);
    doc.setTextColor(designPalette.darkGray[0], designPalette.darkGray[1], designPalette.darkGray[2]);
    doc.text("No active mock sprint sessions compiled yet. Take practice runs in the Mock Interview component.", margin + 4, y + 4);
    y += 15;
  }

  // 6. Roadmap Progress Curriculum Section
  checkPageBreak(55);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(designPalette.darkSlate[0], designPalette.darkSlate[1], designPalette.darkSlate[2]);
  doc.text("IV. PERSONALIZED LEARNING ROADMAP PROGRESS", margin, y);
  
  doc.setDrawColor(designPalette.indigo[0], designPalette.indigo[1], designPalette.indigo[2]);
  doc.setLineWidth(0.6);
  doc.line(margin, y + 2, margin + contentWidth, y + 2);
  
  y += 8;

  if (latestRoadmap) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(designPalette.darkSlate[0], designPalette.darkSlate[1], designPalette.darkSlate[2]);
    doc.text(`Career Target Goal: ${latestRoadmap.careerGoal}`, margin, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text(`Estimated Duration Profile: ${latestRoadmap.estimatedMonths} Months Curriculum`, margin, y + 4);
    
    y += 10;

    // We list all the main roadmap nodes in a beautifully typeset vertical timeline table
    latestRoadmap.roadmapNodes.forEach((node, nodeIdx) => {
      checkPageBreak(30);

      // Node card box
      doc.setFillColor(designPalette.softGray[0], designPalette.softGray[1], designPalette.softGray[2]);
      doc.rect(margin, y, contentWidth, 18, "F");

      // Left blue phase block
      doc.setFillColor(designPalette.indigo[0], designPalette.indigo[1], designPalette.indigo[2]);
      doc.rect(margin, y, 2.5, 18, "F");

      doc.setTextColor(designPalette.indigo[0], designPalette.indigo[1], designPalette.indigo[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.text(node.phase.toUpperCase(), margin + 5, y + 5);

      doc.setTextColor(designPalette.darkSlate[0], designPalette.darkSlate[1], designPalette.darkSlate[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text(node.title, margin + 5, y + 9.5);

      doc.setTextColor(designPalette.darkGray[0], designPalette.darkGray[1], designPalette.darkGray[2]);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      
      const skillString = `Acquired Skills Focus: ${node.skills.join(", ")}`;
      const wrappedSkills = doc.splitTextToSize(skillString, contentWidth - 30);
      doc.text(wrappedSkills, margin + 5, y + 14);

      // Duration counter box right margin aligned
      doc.setFillColor(designPalette.lightIndigo[0], designPalette.lightIndigo[1], designPalette.lightIndigo[2]);
      doc.rect(margin + contentWidth - 28, y + 3, 23, 5, "F");
      
      doc.setTextColor(designPalette.indigo[0], designPalette.indigo[1], designPalette.indigo[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.text(node.duration, margin + contentWidth - 26, y + 6.5);

      y += 22;
    });

    // Certifications inside roadmap if existing
    if (latestRoadmap.certificationsToGet && latestRoadmap.certificationsToGet.length > 0) {
      checkPageBreak(18);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(designPalette.indigo[0], designPalette.indigo[1], designPalette.indigo[2]);
      doc.text("CORRESPONDING PREMIUM CREDENTIAL PATHS:", margin, y);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(designPalette.darkSlate[0], designPalette.darkSlate[1], designPalette.darkSlate[2]);
      
      y += 4.5;
      const certWrapped = doc.splitTextToSize(`• ${latestRoadmap.certificationsToGet.join("  |  • ")}`, contentWidth - 5);
      doc.text(certWrapped, margin + 2, y);
      y += (certWrapped.length * 4);
    }

  } else {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8.5);
    doc.setTextColor(designPalette.darkGray[0], designPalette.darkGray[1], designPalette.darkGray[2]);
    doc.text("No custom simulated roadmap generated yet. Request a roadmap in the AI Roadmap module.", margin + 4, y + 4);
    y += 15;
  }

  // Draw final footer checklist index on last page
  drawFooter();

  // Trigger browser automatic attachment download
  const cleanName = user.fullName.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  doc.save(`InterviewAce_Performance_Summary_${cleanName}.pdf`);
}
