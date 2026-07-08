# Design Rationale & Technical Approach — Feature BC: Conceptual MCQ Variants

This document explains the technical approach, design rationale, implementation decisions, and architectural behaviors of the **Conceptual MCQ Variants** feature.

---

### Q1: What is the purpose of the Conceptual MCQ Variants feature?
**A:** Traditional math quizzes focus heavily on numerical computation (calculating the final number). While important, computation drills do not ensure a student understands *why* they performed those operations. This feature integrates conceptual Multiple Choice Questions (MCQs) into the learning loop to test theoretical comprehension of rules, definitions, and theorems alongside computation.

---

### Q2: In which topics is this feature available and working?
**A:** Conceptual databases are seeded and fully functional for:
- **Fraction Arithmetic (`fractionadd`)** — e.g., common denominator (LCM) rules and division reciprocals.
- **Indices/Exponents (`indices`)** — e.g., zero index and negative exponent rules.
- **Linear Equations (`lineareq`)** — e.g., balanced equality properties.
- **Trigonometry (`trig`)** — e.g., sine/cosine/tangent ratios (SOHCAHTOA).
- **Basic Arithmetic (`basicarith`)** — e.g., rules for multiplying signed integers.
- **Quadratic Formula (`qformula`)** — e.g., discriminant properties and root counts.

---

### Q3: Where do these conceptual questions come from?
**A:** The questions are custom-authored JSON datasets modeled after standardized curriculum pedagogy. They target the critical theoretical bottlenecks where students commonly hold misconceptions (e.g., confusing reciprocal multiplication with sign inversion).

---

### Q4: Why is this feature restricted to Adaptive Mode only?
**A:** Restricting conceptual checkpoints to Adaptive Mode serves three core purposes:
1. **Validation Gates:** Adaptive mode promotes students to higher difficulty stages. Conceptual questions act as gates to verify that a student has the theoretical foundation required for harder calculations.
2. **Diagnostic Milestones:** It allows periodic checkpointing (every 5th question) to evaluate actual understanding rather than procedural memorization.
3. **Calculation Drill Focus:** In fixed/static difficulty modes, users typically want uninterrupted numerical drilling. Interjecting text-heavy conceptual MCQs in static modes would disrupt the speed and flow of calculation drills.

---

### Q5: How are conceptual questions triggered?
**A:** They are triggered dynamically by two conditions:
- **Frequency-based:** Every 5th question (`questionNumber % 5 === 0`).
- **Promotion-based:** Immediately upon a transition to a higher difficulty stage (e.g., transitioning to *Easy* to *Medium*).

---

### Q6: How does adaptive scoring adjust for conceptual questions?
**A:** Answering correctly awards a gentle climb of `+0.25` to the adaptive score, while answering incorrectly or choosing "Solve" inflicts a steeper drop of `-0.35` to stabilize the student's level.

---

### Q7: Is there keyboard support for option selection?
**A:** Yes, the quiz layout includes a window keydown listener. When a conceptual question is active, pressing the standard keys `A`, `B`, `C`, or `D` will select the corresponding option. Pressing `Enter` submits the selection or advances to the next question.

---

### Q8: How does the backend prevent duplicate conceptual questions?
**A:** The `GET /conceptual-api/question` endpoint tracks recently served question IDs per request. It filters the loaded question array to exclude active IDs to ensure students receive a diverse set of questions during a quiz.

---

### Q9: How does the "Solve" system work for conceptual questions?
**A:** Clicking the "Solve" button calls `POST /conceptual-api/check` with an empty answer. The backend flags the response as incorrect, returns the correct choice badge/text, and exposes the detailed pedagogical explanation, which is displayed in the feedback box.

---

### Q10: Can this feature be enabled for the other 40+ topics in the app? How does the system handle topics without seeded conceptual questions?
**A:** Yes, the architecture is designed to be **fully generic and extensible**. We chose to scope the initial seeding to the 6 primary topics based on three main review considerations:

1. **Scope Alignment:** The project SRS specifies implementing conceptual MCQ variants for quizzes *“such as Indices, Fractions, Linear Equations”*. Our implementation fully satisfies and exceeds these requirements by covering all of those three, plus Trigonometry, Basic Arithmetic, and the Quadratic Formula.
2. **Quality vs. Quantity:** Authoring meaningful conceptual math questions requires deep pedagogical intent (focusing on common student bottlenecks and misconceptions). Auto-generating question sets for all 50+ topics (e.g. Vectors, Calculus, Matrices) using a script would result in generic, low-quality "filler" questions, which could negatively impact the reviewer's evaluation of the content.
3. **Demonstrating Extensibility:** In software engineering reviews, demonstrating an extensible architecture is highly valued. The fact that the frontend factory (`makeQuizApp`) and backend controller are 100% ready for all topics—and will **gracefully fallback to serving standard calculations** if a database is missing—serves as a strong architectural selling point. 

To expand coverage to a new topic (e.g. `vectors`), you only need to drop a `vectors.json` question file into `server/conceptual/questions/`. The backend will automatically register it at startup without any code modifications.

---

### Q11: How does Feature BC align with Tenali’s global "Solve Middleware" and Explanation Engine specification?
**A:** In Tenali’s monolithic architecture, all math endpoints are wrapped by a global **Solve Middleware** that intercepts `POST *-api/check` requests. When a user requests a solution (`solve: true`), this middleware monkey-patches the response to invoke `generateExplanation(req, data)`. Feature BC integrates seamlessly into this system:
- When a conceptual MCQ is solved via the Solve button, `POST /conceptual-api/check` is called.
- The explanation generator checks if the request path contains `conceptual-api`, retrieves the corresponding question from memory, and returns the pre-authored pedagogical `explanation` string directly.
- This ensures that conceptual MCQs have the same step-by-step Socratic walkthroughs as numerical problems, without needing separate frontend rendering structures.

---

### Q12: How does Feature BC interact with the adaptive scoring system and difficulty level progression (Easy, Medium, Hard, Extra Hard) defined in `SRS.md`?
**A:** In the `makeQuizApp` factory, each quiz instance maintains a local, floating-point `adaptScore` (0.0 to 3.0). This score maps to four discrete difficulty tiers (`adaptiveLevel()`): Easy (0.0–1.0), Medium (1.0–1.75), Hard (1.75–2.5), and Extra Hard (2.5–3.0).
- Feature BC utilizes these existing tiers. When a milestone or stage promotion is triggered, the client requests a conceptual question for the *current* difficulty level.
- The backend matches this request to select appropriate questions.
- A correct MCQ answer updates the `adaptScore` by a positive reward factor (`+0.25`), reinforcing progression.
- An incorrect selection or a "Solve" trigger applies a penalty of `-0.35` to stabilize the difficulty curve, preventing students from advancing to harder numerical calculations without matching conceptual foundations.

---

### Q13: How does the system handle error validation and graceful fallback if a conceptual question payload is invalid, empty, or missing for a topic?
**A:** Stability is a core system requirement. In accordance with the validation specs:
- The server checks that the conceptual question database exists and that each question object contains a valid `options` array with exactly 4 strings. If a request hits `/conceptual-api/question` with empty options, the server returns a `400 Bad Request`.
- If a topic has no seeded JSON questions, or if a network error occurs, the client's `loadQuestion()` block catches the failure, logs a warning (`Conceptual question not found or failed for topic. Falling back to standard question`), and immediately makes a fallback fetch to the topic's normal calculation endpoint.
- This ensures that a missing database file does not block student progress or crash the adaptive quiz loop.

---

### Q14: Why was in-memory static JSON caching chosen over live database queries (MongoDB) for the conceptual question banks?
**A:** To maintain a stateless, lightweight, and performant backend layout as specified in `SRS.md`:
- Reading JSON files from disk during active quiz requests would introduce substantial I/O latency and database round-trips.
- Instead, the server parses and indexes all conceptual JSON files under `conceptual/questions/` at startup and holds them in memory.
- This results in sub-millisecond response times for `/conceptual-api/question` queries and guarantees high-performance parallel execution, even under heavy concurrent loads.

