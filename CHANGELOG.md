# Changelog

All notable changes to this project will be documented in this file.

## [0.1.3] - 2026-07-10

### Added
- **Minimalist Grid Dashboard Layout**:
  - Redesigned the Vachana user interface to reduce cognitive load.
  - Replaced the persistent sidebar panel with a modular, responsive dashboard grid of 18 square box divs.
  - Programmed smooth mouse hover scaling, border color shifts, and shadow glows on the dashboard boxes.
  - Configured tab workspaces to display in focused card views when clicked, with direct "← Back to Modules" navigation buttons.

## [0.1.2] - 2026-07-10

### Added
- **3 New General Math Literacy Exercises**:
  1. *Visual-to-Narrative*: Translate visual speed-time coordinate graphs into physical stories.
  2. *Error Communication*: Review algebraic steps, identify errors, and explain them.
  3. *Concept Simplification*: Simplify mathematical definitions (e.g. why $x^0 = 1$) for beginners.

## [0.1.1] - 2026-07-10

### Added
- **5 New Vachana Literacy Exercises**:
  1. *Numberless Problems*: Conceptual equation planner building algebraic structure without numerical distractions.
  2. *Schema Classifier*: Categorizing word problems into Total, Difference, or Change schemas.
  3. *Goal-State Predictor*: Identifying the ultimate target variable/calculation of word problems.
  4. *Syntactic Rewriter*: Restructuring passive operation steps into chronological active sequence.
  5. *Equation-to-Story*: Matching abstract mathematical equations with real-world scenarios.

## [0.1.0] - 2026-07-09

### Added
- **Vachana Mathematical Literacy Lab**: Integrated a client-side dedicated module for enhancing linguistic mathematical skills.
- **Header & Dropdown Integration**: Added the "Vachana" option to the featured apps list on the Home screen and the global hamburger menu dropdown.
- **Route Handler**: Configured a `/vachana` route listener inside the top-level `App` component.
- **Custom UI Style**: Implemented a two-column responsive sidebar layout leveraging Tenali's CSS variables and utility classes.
- **SVG Icon Pack**: Created a self-contained `VachanaIcons` React dictionary rendering professional SVG icons instead of default emojis.
- **13 Literacy Exercises**:
  1. *Vocab Explorer*: Contextual math vocabulary meanings, misconceptions, and prerequisite relations.
  2. *Sentence Dissector*: Text parser mapping grammar to variables and operators.
  3. *Translate English ➔ Math*: Equation builder workspace.
  4. *Inversion Detector*: Traps detector showing inline alerts for subtraction expressions.
  5. *Story Weaver*: Narrative reordering tool.
  6. *Dependency Graph*: Core prerequisite concept paths.
  7. *Readability Analyzer*: Real-time word, sentence, and syllable counter generating readability scores.
  8. *Pronoun Resolver*: Resolving ambiguous pronouns.
  9. *Noise Filter*: Sorting out redundant numeric details from speed/rate word problems.
  10. *Reading Traps*: Interactive handbook on translation fallacies.
  11. *Jumbled Words*: Ordering blocks to formulate English phrasing.
  12. *Paraphrase Matcher*: Connecting equivalent verbal expressions to equations.
  13. *Logical Modifiers*: Practice for prepositions like *respectively* and *inclusive*.

### Limitations & Known Ambiguities
- **Stateless/No Persistence**: Vachana exercise progress, current tab states, and accuracy statistics are not persisted in MongoDB. Navigating away or refreshing the browser resets the dashboard.
- **Static Content**: Most exercises in v0.1 rely on curated static data sets rather than algorithmic/procedural generation.
- **Syllable Counting Heuristic**: The Readability Analyzer estimates syllable count using a regex-based vowel group checker. Some irregular words may cause minor variances in Flesch-Kincaid Grade Level scores.
- **Equation Equivalence Check**: Translation checks are evaluated using normalized token sequences rather than a full mathematical AST solver. Alternative (but algebraically identical) expressions might not trigger as correct.
- **No Speech/Audio check**: Out-of-scope for v0.1 to avoid heavy third-party audio rendering packages.
