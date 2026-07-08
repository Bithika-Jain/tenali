# Feature BC: Version 0.1 - Initial Directory Setup & Database Schema
**Author**: Bithika Jain (@Bithika-Jain)

## Purpose
Establish the storage structure, directory hierarchy, and JSON schema validation format for conceptual multiple-choice questions.

## Key Decisions
- **Isolated Question Storage**
  - Stored questions inside a dedicated root directory (`conceptual/questions/`) rather than nested in server utilities, keeping the DB queries isolated.
- **Strict JSON Schema**
  - Defined a static structure containing unique `id`, `topic`, `question`, `options` (an array of exactly 4 strings), `answerOption` (A-D), `answerText`, and a detailed `explanation`.

## Implementation
- Added `conceptual/questions/` directory.
- Added draft schema files.

## Status

Introduced
- Folder structures for question seeding
- Initial JSON schema specifications

Removed
- (None)

Superseded by
- Version 0.2

---

# Feature BC: Version 0.2 - Backend Caching & Indexer
**Author**: Bithika Jain (@Bithika-Jain)

## Purpose
Parse, load, and index all conceptual JSON questions into memory on backend server startup to prevent repetitive disk I/O.

## Key Decisions
- **One-Time Startup Cache**
  - Chose to load and index all question files synchronously once at server startup into a global array (`conceptualQuestions`) to avoid disk read latency during active quiz sessions.

## Implementation
- Modified `server/index.js` to add the `loadConceptual` loader function.

## Status

Introduced
- Server-side question caching mechanism

Removed
- (None)

Superseded by
- Version 0.3

---

# Feature BC: Version 0.3 - API Gateway & Topic Resolver
**Author**: Bithika Jain (@Bithika-Jain)

## Purpose
Expose Express endpoints to fetch random conceptual questions filtered by topic.

## Key Decisions
- **Dynamic Topic Filtering**
  - Created a resolver endpoint `GET /conceptual-api/question` returning questions matching the `topic` query param.
- **Graceful Failure Fallback**
  - Designed the API to return a `404` or error response if the topic database is missing, allowing the client to recognize the failure and proceed with a calculation question.

## Implementation
- Modified `server/index.js` to register `GET /conceptual-api/question`.
- Modified `client/vite.config.js` to proxy `/conceptual-api` routes.

## Status

Introduced
- `GET /conceptual-api/question` endpoint
- Proxy routing configuration

Removed
- (None)

Superseded by
- Version 0.4

---

# Feature BC: Version 0.4 - Milestone Checkpoints & Fetching
**Author**: Bithika Jain (@Bithika-Jain)

## Purpose
Trigger conceptual queries dynamically during the adaptive quiz lifecycle.

## Key Decisions
- **Milestone Detection**
  - Configured generated quiz components to flag milestones at specific query bounds (every 5th question: `questionNumber % 5 === 0`).
- **Silent Standard Fallback**
  - Programmed the client-side fetch wrapper to catch fetch errors and silently fall back to querying standard calculation questions, preventing UI crashes.

## Implementation
- Modified `client/src/App.jsx` to integrate `isMilestone` checks inside the loading routine.

## Status

Introduced
- Milestone-based query triggers
- Client fallback error handling

Removed
- (None)

Superseded by
- Version 0.5

---

# Feature BC: Version 0.5 - Validation Endpoint & Verification
**Author**: Bithika Jain (@Bithika-Jain)

## Purpose
Implement backend checks to validate student choice selection and return correct answer feedback.

## Key Decisions
- **Uppercase Badge Comparison**
  - Implemented `POST /conceptual-api/check` using simple uppercase letter matching (`A`, `B`, `C`, `D`) rather than raw text matching to avoid character encoding mismatches.

## Implementation
- Modified `server/index.js` to register `POST /conceptual-api/check`.

## Status

Introduced
- `POST /conceptual-api/check` endpoint

Removed
- (None)

Superseded by
- Version 0.6

---

# Feature BC: Version 0.6 - Interactive MCQ UI Render
**Author**: Bithika Jain (@Bithika-Jain)

## Purpose
Replace calculation text boxes with a styled multiple-choice card selection UI.

## Key Decisions
- **Dynamic UI Swapping**
  - Programmed the quiz component to verify if `question.isConceptual` is true. If active, it hides the text inputs and renders a structured layout of 4 option cards.
- **Theme-Aligned Feedback Coloring**
  - Used Tailwind-free CSS variables to color cards (green for correct, red/green blend for incorrect) and highlight badges.

## Implementation
- Modified `client/src/App.jsx` (`makeQuizApp`) to conditionally render the option card grid.

## Status

Introduced
- Clickable MCQ option card selection panel

Removed
- (None)

Superseded by
- Version 0.7

---

# Feature BC: Version 0.7 - Solve Explanation & Adaptive Scoring
**Author**: Bithika Jain (@Bithika-Jain)

## Purpose
Integrate the Solve button for conceptual questions and set up adaptive level adjustments.

## Key Decisions
- **Solve Route Binding**
  - Overrode Solve click handlers to hit the backend verification route with an empty answer, fetching the correct option and the detailed explanation.
- **Tuned Adaptive Score Adjustments**
  - Programmed correct answers to award `+0.25` to the adaptive score, and incorrect/solved inputs to subtract `-0.35` to stabilize difficulty levels.

## Implementation
- Modified `client/src/App.jsx` to update Solve handlers and scoring rules.
- Modified `server/index.js` (`generateExplanation`) to parse conceptual step-wise explanations.

## Status

Introduced
- MCQ Solve explanation reveals
- Tuned MCQ adaptive scoring math

Removed
- (None)

Superseded by
- Version 0.8

---

# Feature BC: Version 0.8 - Keyboard Navigation & Duplicate Prevention
**Author**: Bithika Jain (@Bithika-Jain)

## Purpose
Implement keyboard listener controls for touchless answering and filter out recently answered questions.

## Key Decisions
- **Event Listeners for Choices**
  - Added window keydown event listeners to bind keyboard keys `A`, `B`, `C`, and `D` for selecting cards, and `Enter` to submit.
- **Client-Passed Exclude Filter**
  - Client sends an `exclude` list parameter containing answered question IDs, which the backend uses to filter the cache array and prevent duplication.

## Implementation
- Modified `client/src/App.jsx` to bind keydown shortcuts and build `exclude` query strings.
- Modified `server/index.js` to parse exclude parameters and filter questions.

## Status

Introduced
- Keyboard shortcut options selection (`A`-`D`, `Enter`)
- Question duplicate prevention filters

Removed
- (None)

Superseded by
- Version 0.9

---

# Feature BC: Version 0.9 - Custom Quiz App & 6-Topic Seeding
**Author**: Bithika Jain (@Bithika-Jain)

## Purpose
Replicate MCQ behaviors for custom quiz components and seed initial question databases.

## Key Decisions
- **FractionAddApp Integration**
  - Re-implemented the MCQ card render and keyboard listeners inside `FractionAddApp` because it bypassed the generated factory structure.
- **Pedagogical Seeding for 6 Topics**
  - Authored 10 conceptual question sets covering Fractions, Indices, Linear Equations, Trigonometry, Basic Arithmetic, and Quadratic Formula to address critical theoretical bottlenecks.

## Implementation
- Modified `client/src/App.jsx` to integrate MCQ checks inside `FractionAddApp`.
- Added 10 JSON database files under `conceptual/questions/`.
- Added `DESIGN_RATIONALE.md` and `HOWTO_EXTEND.md`.

## Status

Introduced
- Custom Fraction Addition MCQ layout
- 10 seeded JSON database files
- Reviewer documentation guides

Removed
- (None)

Superseded by
- (None)

---

## Appendix: Implementation Notes
- **Linter Alignment**: Ensured code styling is aligned with standard ES6 rules and doesn't conflict with ESLint rules (unused vars, impure functions).
- **Static serving**: Serves compiled assets under `client/dist` where standard Express routing handles index mapping.
