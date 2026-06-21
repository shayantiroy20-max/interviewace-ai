# InterviewAce AI 🎯
### AI-Powered Resume Analyzer & Interview Coach Suite

**InterviewAce AI** is a corporate-grade, full-stack placement preparation platform engineered to help students optimize their resume ATS alignments, take challenging interactive mock interviews, analyze verbal and technical responses, and synthesize tailored weekly curriculum agendas.

---

## 🚀 Key Deliverables & Modules

1. **Resume Parser & ATS Auditor**: Multi-section evaluation checking Project detail levels, Experience scope, and Keywords against recruitment parameters to score resumes out of 100 points.
2. **Conversational Mock Sprints**: Real-time simulated interviews (HR, Tech, Behavior, Domain) which customize challenging questions centered adaptively around uploaded resume details.
3. **Multi-rubric Speech Evaluator**: Evaluates answers based on five axes (Technical accuracy, Communication structure, Vocal confidence flags, Grammar correctness, Direct relevance).
4. **Iterative Feedback loop**: Maps strengths, bullet gaps, alternative phrasings, and complete model answers alongside targeted daily practice checklists.
5. **Interactive roadmap timeline**: Outputs certification pathways and customized portfolio projects based on student career goals.
6. **Custom Vector Analytics**: Glowing high-fidelity custom Radar, Bar, and Line charts charting weekly score improvements.

---

## 🎨 System Architecture

```
                 +-------------------+
                 |    User/Browser   |
                 +---------+---------+
                           |
                           v (Vite SPA Engine / Tailwind / Motion)
                 +---------+---------+
                 |   Express Backend | (Port 3000 Node Router)
                 +---------+---------+
                           |
      +--------------------+--------------------+
      |                                         |
      v                                         v
+-----+---------------+                 +-------+-------------+
|   AI LLM Engine     |                 | Durable State JSON  |
| (Structured Parsing)|                 |  (data/db.json)     |
+---------------------+                 +---------------------+
```

---

## 🛠️ API Routing Map

* `POST /api/analyze-resume`: Decodes, sanitizes, and evaluates student resume documents alongside high-density target career roles.
* `POST /api/interview/generate-questions`: Generates 5 Challenging mock questions tailored specifically to candidate experience segments.
* `POST /api/interview/evaluate-answer`: Scores individual speech/text lines using weighted parameters totaling exactly 100.
* `POST /api/interview/finalize-session`: Generates overarching weaknesses, custom micro tasks, and action maps based on Mock Sprints.
* `POST /api/roadmap/generate`: Drafts a 4-Phase educational milestone curriculum mapping required technical challenges.

---

## 🏆 Presentation Deck Outline (PPT Content)

* **Slide 1: Title Slide**
  * Brand: *InterviewAce AI*
  * Tagline: "AI-Powered Resume Analyzer & Interview Coach Suite"
* **Slide 2: The Core Problem**
  * Placement processes are highly gated. Standard ATS scanners drop 75% of applicants before review, and generic mock runs lack individual career alignments.
* **Slide 3: The InterviewAce AI Solution**
  * Direct structural parsers scoring ATS benchmarks, combined with dual-tier evaluation loops scoring conversational accuracy, speed, and phrasings.
* **Slide 4: Modern Technical Stack**
  * Frontend: React / Tailwind v4 / Motion / Lucide vectors.
  * Backend: Node.js Express server / Specialized AI Language Model Engine.
  * Storage: Persistent State Database synchronization (`data/db.json`).
* **Slide 5: Business Model & Future Scope**
  * SaaS Premium tiers for university licensing, off-campus placement tracks, and integrations with recruitment portals.

---

## 🎬 Demo Video Scripts (3-Minute Timeline)

* **[0:00 - 0:45] Intro & Landing Showcase**
  * *"Meet InterviewAce AI, your 24/7 personal tech recruiter. We begin on our premium glassmorphic landing homepage detailing our recruitment success rates and active workspace loop..."*
* **[0:45 - 1:30] Resume Parsing and ATS Audit**
  * *"Let's upload our student profile. We paste our raw text and click Analyze. Our scanner laser animation initiates, and within seconds our AI engine outputs our structured ATS score. We see explicit gaps, strengths list, and recommended industry keywords..."*
* **[1:30 - 2:15] Adaptive Technical Mock Interview**
  * *"Now we launch our Technical Mock sprint. Our backend adaptively compiles 5 challenging questions based on our parsed React project experience. We simulate our voice input response, and instantly receive critiques..."*
* **[2:15 - 3:00] Career Roadmaps and Analytics**
  * *"We save our mock run, and InterviewAce automatically drafts our personalized study curriculum. Our analytics panel shows our weekly trajectory index. We are now placement ready!"*

---

## 📦 Setting Up Workspace & Launching

1. Setup environment variables:
   Create a `.env` file at the root:
2. Build the server bundler assets:
   ```bash
   npm run build
   ```
3. Boot development or production containers:
   ```bash
   npm run dev
   # or
   npm run start
   ```

---
*InterviewAce AI: Forged for Hackathons and Enterprise recruitment passing certification.*
