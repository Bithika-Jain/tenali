# Feature BC: Version 0.1 - Conceptual MCQ Variants
**Author**: Bithika Jain (@Bithika-Jain)

## Purpose
Traditional math quizzes in Tenali focus heavily on numerical calculations (computation). This version introduces conceptual Multiple Choice Questions (MCQs) to test theoretical comprehension of rules, definitions, and theorems inside the adaptive quiz loop at specific milestones, ensuring students understand the underlying math concepts rather than just applying procedural formulas.

## Key Decisions
- **Milestone MCQ Injection**
  - The client-side quiz renderer dynamically checks if the question is conceptual and swaps out the standard numerical text input field with styled cards representing options A, B, C, and D.
  - This was chosen over creating separate standalone conceptual quizzes because integrating check-ins directly into existing quizzes provides a unified learning experience without disrupting the student's quiz flow.
- **Static JSON Question Databases**
  - Seeded static JSON files under `conceptual/questions/` containing structured question prompts, choices, correct options, and detailed explanations.
  - This custom-authored approach was chosen over algorithmic question generation because high-quality conceptual questions must target specific student misconceptions, which are qualitative and difficult to generate programmatically.
- **Graceful Fallback & Extensible Scoping**
  - The frontend and backend are fully generic and ready to serve conceptual MCQs for all 40+ topics. If a topic's database is missing, the system automatically falls back to standard calculation questions.
  - We scoped the initial databases to 6 core topics (`fractionadd`, `indices`, `lineareq`, `trig`, `basicarith`, `qformula`) to guarantee pedagogical quality while ensuring the platform is ready for gradual rollout.

## Implementation
- **Added**:
  - `conceptual/questions/` directory with initial question banks.
  - `DESIGN_RATIONALE.md` explaining technical details and scoping trade-offs.
  - `HOWTO_EXTEND.md` detailing instructions for content authors to add new topics.
- **Modified**:
  - `server/index.js` to cache databases at startup and expose the `/conceptual-api` routes.
  - `client/src/App.jsx` in the quiz factory (`makeQuizApp`) and custom `FractionAddApp` to query milestones, render MCQ cards, and handle input states.
  - `client/vite.config.js` to register the proxy.

## Status

Introduced
- Conceptual milestone detection (`questionNumber % 5 === 0`)
- Dynamic MCQ choice selection layout and visual cards
- Keyboard shortkey shortcuts (`A`, `B`, `C`, `D`, and `Enter`)

Removed
- (None)

Superseded by
- (None)

---

## Appendix: Implementation Notes
- **Adaptive Scoring Mechanics**: Correct answers award a gentle climb of `+0.25` to the adaptive score, whereas wrong answers or clicking "Solve" trigger a `-0.35` drop to stabilize student difficulty level.
- **Duplicate Prevention**: The backend uses an `exclude` list parameters query from the client state to filter out recently served questions.
- **Solve Integration**: Clicking "Solve" queries the backend validation route with an empty selection to pull the correct choice badge and trigger the detailed explanation reveal.
