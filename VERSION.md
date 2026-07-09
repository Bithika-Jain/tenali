# Feature BC: Version 1.0 - Conceptual MCQ Variants
**Author**: Bithika Jain (@Bithika-Jain)

## Overview
- **Feature Name**: Conceptual Multiple-Choice Variants
- **Target SRS ID**: `Feature BC`
- **Author**: Bithika Jain (@Bithika-Jain)

## Feature Description
The Conceptual MCQ Variants feature integrates conceptual multiple-choice check-ins directly into adaptive math quizzes. It checks student comprehension of core math rules, definitions, and theorems (e.g., fraction division, negative/zero indices) rather than just mechanical calculations, triggering checkpoints at milestone intervals (such as every 5th question or level promotion). If a conceptual database is missing, the system gracefully falls back to standard calculation questions.

## Final Architecture (v1.0)
- **Component 1: Cached JSON Databases (`conceptual/questions/*.json`)**
  - Statically defined question banks representing 6 initial topics.
- **Component 2: Server API Endpoints (`server/index.js`)**
  - Startup database loader cache.
  - `GET /conceptual-api/question?topic=<topic>&difficulty=<diff>&exclude=<exclude_list>`: Fetches unseen questions.
  - `POST /conceptual-api/check`: Validates choice selections and returns correct answer explanations.
- **Component 3: Interactive MCQ Quiz Components (`client/src/App.jsx`)**
  - Adaptable UI cards for choice options A, B, C, and D in generated quiz apps (`makeQuizApp`) and custom quiz modules (`FractionAddApp`).
  - Keydown shortcuts (`A`-`D`, `Enter`).
- **Data flow**
  - Client checks for milestone -> fetches from `/conceptual-api/question` -> renders card layout -> validates choice via `/conceptual-api/check` -> returns correct answer reveal and explanation.
- **State management**
  - Uses React local state (`question`, `answer`, `revealed`, `isCorrect`, `feedback`) and ref counters (`questionNumber`, `adaptScoreRef`) to sync progress without re-renders.
- **Failure handling**
  - Catches fetch failures on the frontend to automatically request standard calculation questions, guaranteeing uninterrupted quiz sessions.

## Technical Evolution

### v0.0
- Initial concept of introducing conceptual math questions.

### v0.1
- Established root folder `conceptual/questions/` and defined the strict JSON question schema (`id`, `topic`, `question`, `options`, `answerOption`, `answerText`, `explanation`).

### v0.2
- Implemented startup caching in `server/index.js` via the `loadConceptual` indexer, storing parsed files into memory.

### v0.3
- Exposed the `GET /conceptual-api/question` endpoint and added proxy configurations in `client/vite.config.js`.

### v0.4
- Integrated milestones (`questionNumber % 5 === 0`) and silent fallbacks into the generated quiz component factory (`makeQuizApp`).

### v0.5
- Implemented uppercase character matching validations under `POST /conceptual-api/check`.

### v0.6
- Developed conditional MCQ UI rendering in the frontend, displaying interactive choice cards (A, B, C, D) using Tailwind-free CSS variables for layout and card status highlights.

### v0.7
- Integrated the Solve action to fetch explanations from `generateExplanation` and calibrated adaptive score changes (`+0.25` for correct, `-0.35` for incorrect/solve).

### v0.8
- Added keydown listeners (`A`, `B`, `C`, `D`, `Enter`) and ID-based client-passed `exclude` list parameters to prevent duplicate questions.

### v0.9
- Ported milestone triggers and MCQ UI render layers to the custom `FractionAddApp` and seeded 10 question databases for the 6 primary math topics.

## Final Design Philosophy
The feature evolved from an initial concept of separate quizzes to an integrated, milestone-driven check-in mechanism. By using a single monolithic factory in `App.jsx`, we successfully injected conceptual checks across 45+ math modules with zero duplicate code. Choosing custom JSON databases over auto-generation ensured high-quality, pedagogical MCQ choices targeting student misconceptions. The graceful fallback mechanism separates content generation from client-side execution, guaranteeing stability even if new topic databases are not yet seeded.

---

## v1.0 Scope and Limitations

### Shipped
- Fully functional MCQ quiz variants across the adaptive quiz factory (`makeQuizApp`) and custom `FractionAddApp`.
- 10 seeded JSON database files for 6 primary math topics.
- Touchless keyboard navigation support (`A`-`D`, `Enter`).
- Detailed step-wise correct answer explanation panel.
- Exclude list parameters for duplicate prevention.

### Deferred
- Automated mathematical diagram generation inside options.
- Dynamic MCQ generation based on individual student mistake history logs.

### Known limitations
- Conceptual MCQ variants are currently restricted to Adaptive mode (to maintain fast drilling flow in static modes).
- Initial database seeding is restricted to 6 core topics (Fraction Addition, Indices, Linear Equations, Trigonometry, Basic Arithmetic, and Quadratic Formula), with other topics rolling out gradually.

---

## Verification

### Automated Tests
- Checked backend database loads and route responses via unit scripts:
  `node test_quick.js` (all tests passed).
- Built production client package:
  `npm run build` (successful compilation without errors/warnings).

### Manual Verification Steps
1. Open the adaptive quiz dashboard and initiate the Fraction Addition quiz.
2. Advance through calculation questions to reach Question 5 (milestone).
3. Confirm that the numeric input field is hidden and replaced by 4 styled choice cards (A, B, C, D).
4. Hover over choices to verify interactive highlights. Click/select a choice, then press `Enter` (or press keyboard key `A`, `B`, `C`, or `D` then `Enter`).
5. Confirm correct feedback display, green/red highlight states, and step-wise explanation reveal.

---

## Acceptance Criteria
- [x] Supports multiple-choice options (A, B, C, D) dynamically mapped inside the question renderer engine.
- [x] Loads conceptual logic definitions from static JSON question databases.
- [x] Verifies selected choices via client-side state and backend check handlers.
- [x] Explanations avoid paragraphs exceeding 3 lines.
- [x] Gracefully falls back to calculation questions if the database is missing.

---

## Feature Demo

### Figure 1
![MCQ Choice Cards rendering in Fraction quiz](./assets/mcq_prompt_view.png)

*The conceptual check-in card UI with choice options replacing the standard input field.*

### Figure 2
<video src="./assets/mcq_demo.mp4" controls width="100%"></video>

*Dynamic green/red card coloring and explanation text displayed upon submitting a choice.*

---

## Appendix: Implementation Notes
- **Adaptive Score Math**: Correct choices increment difficulty score by `+0.25`, incorrect answers or Solves decrement it by `-0.35` to stabilize student level.
- **Vite Proxy configuration**: Extends proxy rules to direct all conceptual routes to port 4000.
