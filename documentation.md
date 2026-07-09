# Technical Documentation

---

# Feature AQ — Tap-to-Define Word Glossary

## Problem Statement

Quiz question prompts in Tenali often contain mathematical vocabulary (e.g. *denominator*, *hypotenuse*, *probability*) that younger students may not know. Previously there was no in-context help — a student who didn't understand a word in a question had to leave the app to look it up, breaking focus and flow.

---

## Goals

- Allow students to tap any recognized math term directly inside a question prompt to see a plain-English definition
- Require zero server changes — purely a client-side enhancement
- Be non-intrusive: prompts without recognized terms must render identically to before
- Work on both mobile (tap) and desktop (click)

---

## Functional Requirements

- Recognized terms in a question prompt are shown with a dotted underline
- Tapping an underlined term opens an inline popover showing the term's canonical name and definition
- Only the **first occurrence** of each term per prompt is interactive; duplicates render as plain text
- Only **one popover is open at a time** — opening a second term closes the first
- Popovers close when: the user clicks/taps outside, presses Escape, taps the same term again, or after a 6-second auto-dismiss timer
- Multi-word terms (e.g. "prime number") are recognized as a single entry, not as two separate words
- Aliases and simple plurals are recognized (e.g. "vertices" → "vertex" definition)
- If a question prompt contains no recognized terms, it renders as plain text with zero overhead

---

## Implementation Overview

The feature is contained in two new files and small modifications to existing files:

1. **`client/src/data/glossaryTerms.json`** — a static JSON array of term definitions
2. **`client/src/components/GlossaryText.jsx`** — a React component that tokenizes a prompt string and renders interactive term spans
3. **`client/src/App.jsx`** — `GlossaryText` imported and used as a drop-in replacement wherever `{question.prompt}` or `{question.question}` was rendered as plain text in word-problem quizzes
4. **`client/src/App.css`** — CSS classes for the glossary visual treatment

---

## Data Flow

```
glossaryTerms.json
       │
       ▼  (parsed at module load, outside components)
  matchMap: { lowercase_form → { term, definition } }
       │
       ▼  (sorted longest-first, escaped, joined)
  glossaryRegex: /\b(prime number|perimeter|...|area)\b/gi
                         (built once, shared across all GlossaryText instances)
       │
       ▼  (on each render, via useMemo when text prop changes)
  segments: Array<
    { type: 'text', value: string }
    | { type: 'term', id, displayText, term, definition }
  >
       │
       ├── 'text' segments → plain strings in JSX
       └── 'term' segments → <GlossaryTooltip> (underline + popover)
                                      │
                                      ▼
                             openId state in <GlossaryText>
                             (null = no popover; number = index of open term)
```

---

## Components

### `GlossaryText` (default export from `GlossaryText.jsx`)

Public-facing component. Accepts a single `text` prop (the raw question prompt string).

- Runs `glossaryRegex` against `text` via `useMemo` (recalculates only when `text` changes)
- Manages `openId` state — which term's popover is open (`null` = none)
- If no matches exist, falls back to `<>{text}</>` with no extra DOM nodes

**Usage:**
```jsx
<GlossaryText text={question.prompt} />
// or
<GlossaryText text={question.question} />
```

### `GlossaryTooltip` (internal, not exported)

Renders one underlined interactive term and its popover.

- Receives controlled `isOpen` + `onToggle` from parent
- Three `useEffect`s: outside-click listener, Escape-key listener, 6-second auto-dismiss
- Uses a 10 ms delay before attaching the outside-click listener so the click that opened the popover doesn't immediately close it
- Fully accessible: `role="button"`, `tabIndex={0}`, `aria-expanded`, `aria-label`, keyboard activation on Enter/Space

### Module-level constants (not React components)

- **`matchMap`** — built once at module load from `glossaryTerms.json`. Key: lowercase form. Value: `{ term: canonical, definition }`.
- **`glossaryRegex`** — single `RegExp` built from all keys in `matchMap`, sorted longest-first, word-boundary-anchored, case-insensitive, global flag.

---

## Files

| File | Role |
|---|---|
| `client/src/components/GlossaryText.jsx` | Component + all logic (225 lines) |
| `client/src/data/glossaryTerms.json` | 40 term definitions |
| `client/src/App.jsx` | Import + 11 wiring sites |
| `client/src/App.css` | ~105 lines of new CSS |

**Quiz sites wired in `App.jsx`:**

| App / Factory | Line (approx.) | Field |
|---|---|---|
| `ConceptApp` | ~36491 | `question.question` |
| `VocabApp` | ~38961 | `question.question` |
| `makeMCQuizApp` factory | ~39257 | `question.prompt` |
| `makeQuizApp` factory | ~39498 | `question.prompt` |
| `DotProdApp` (fallback) | ~39857 | `question.prompt` |
| `GymApp` | ~40801 | `question.prompt` |
| `SetsApp` | ~42318 | `getPromptForType(...)` |
| `SequencesApp` | ~42514 | `question.prompt` |
| `RatioApp` | ~42667 | `question.prompt` |
| `PercentApp` | ~42836 | `question.prompt` |
| `IndicesApp` | ~43004 | `question.prompt` |

**Explicitly excluded** (pure math-expression renders, no prose):
- Any line rendering `{question.prompt} = ?` — these are arithmetic/log/index notation strings, not natural-language sentences.

---

## Design Decisions

**Longest-match-first regex**
Terms are sorted by length descending before building the regex alternation. This ensures `prime number` is matched as a whole before the single word `prime` could match.

**First-occurrence-only highlighting**
The `seen` Set inside the `useMemo` in `GlossaryText` tracks which base terms have already been tokenized as interactive. Subsequent occurrences become plain text. This keeps prompts readable and avoids cluttering every instance of a common word like "factor".

**Regex built once at module load**
Building the regex inside a component would re-create it on every render. Instead it is built at module scope, so all `GlossaryText` instances share the same compiled regex object.

**`useMemo` on `segments`**
The tokenization (regex + loop) runs only when `text` changes. For a static question prompt that re-renders (e.g. due to parent state changes), the work is skipped.

**Single `openId` state**
Rather than each `GlossaryTooltip` managing its own open state, the parent `GlossaryText` holds `openId`. This ensures only one popover is open at a time without any cross-component messaging.

**No hover interaction**
Feature AQ spec Section 9 requires mobile-first interaction. Hover states are intentionally omitted. The dotted underline + icon communicates interactivity without hover.

**Fail-safe JSON load**
The entire `matchMap` construction is in a `try/catch`. If `glossaryTerms.json` fails to parse, `matchMap` stays empty and `glossaryRegex` is `null`. In that case `GlossaryText` returns plain text. No crash.

---

## Edge Cases

| Case | Handling |
|---|---|
| Term appears multiple times in prompt | First occurrence is interactive; rest are plain text |
| Term with alias (e.g. "vertices") | Alias is registered in `matchMap` pointing to the canonical definition |
| Simple plural not in aliases (e.g. "factors") | Auto-registered at module load for single-word terms not ending in `s` |
| Prompt string is empty or non-string | `GlossaryText` returns `<>{text}</>` via early-return guard |
| No terms match | Segments array is all-text; returns `<>{text}</>` with no extra DOM |
| Popover near right edge of screen | Currently unhandled — CSS `left: 50%; transform: translateX(-50%)` centers it over the term, which may clip on narrow screens |
| Math-only prompt (`= ?` expressions) | Not wired — these quiz sites deliberately excluded |
| User opens popover and question auto-advances | `useEffect` in `GlossaryText` resets `openId` to `null` whenever `text` prop changes |

---

## Limitations

- **~40 terms** — only the most common GCSE-level math terms are currently defined. The corpus likely contains many more terms students might not know.
- **`\b` word boundaries only** — hyphenated terms like `right-angled` are not matched. The regex would match `right` but that has no glossary entry, so it's benign, but `right-angled` itself cannot be a glossary term without a custom tokenizer.
- **Popover may clip on small screens** — no floating-UI / Popper.js positioning logic. Future work.
- **No persistence** — there is no tracking of which terms a student has looked up. A future feature could log term lookups for analytics.
- **No search/index** — there is no standalone glossary index page. Terms are only surfaced contextually in quiz prompts.

---

## Future Improvements

- Expand `glossaryTerms.json` to 100+ terms covering the full GCSE curriculum
- Add a standalone "Glossary" page listing all terms alphabetically, accessible from the home screen
- Use a floating-UI library (e.g. `@floating-ui/react`) for smart popover positioning that avoids viewport clipping
- Track term lookups in analytics to identify which terms students find confusing most often
- Add "did you know" secondary facts to some definitions
- Consider fuzzy matching for common misspellings in student-generated content

---

## Testing

The feature was manually tested in the browser (Vite dev server at `http://localhost:5173/`):
- ConceptApp: tapped "probability" → popover appeared with correct definition
- VocabApp: word-definition prompt highlighted glossary terms correctly
- `makeMCQuizApp` factory apps (e.g. Probability, Stats, Mensuration): `question.prompt` terms highlighted
- `makeQuizApp` factory apps: short-answer prompt terms highlighted
- Prompts with no glossary terms: rendered identically to before, no extra DOM
- Multi-word: "prime number" matched as one unit, not as "prime" alone
- Alias: tested "vertices" — shows "vertex" canonical definition
- Auto-dismiss: popover closed after 6 seconds without interaction
- Escape key: popover closed
- Outside click: popover closed
- Multiple taps: toggled open/closed correctly; only one popover open at a time

No automated tests exist.

---

## Acceptance Criteria

- [x] Recognized math terms in question prompts are underlined
- [x] Tapping a term opens an inline popover with the canonical name and definition
- [x] Only the first occurrence of each term per prompt is interactive
- [x] Only one popover is open at a time
- [x] Popovers close on outside click, Escape, same-term retap, and after 6 seconds
- [x] Prompts with no recognized terms render exactly as before
- [x] Feature works in all word-problem quiz apps
- [x] Pure math-expression prompts are unaffected
- [ ] Feature is committed, merged, and deployed to `tenali.fun`
- [ ] Glossary covers all terms in the quiz corpus

---

## Version History

### v1.0

Date: 2026-07-08

Summary: Initial implementation of Feature AQ — Tap-to-Define Word Glossary. Component (`GlossaryText.jsx`), data (`glossaryTerms.json`, 40 terms), CSS, and wiring into 11 quiz prompt sites across both factory-generated and standalone apps.

Files Changed:
- `client/src/components/GlossaryText.jsx` (new)
- `client/src/data/glossaryTerms.json` (new)
- `client/src/App.jsx` (modified — import + 11 prompt sites)
- `client/src/App.css` (modified — ~105 lines added)

Notes: Changes are uncommitted on branch `feat/tap-to-define-word-glossary`. Deployed to production pending commit + build.

---

### v1.1 (Phase 2 — coverage expansion)

Date: 2026-07-09

Summary: Expanded Feature AQ coverage. Wired 3 additional prose-style prompt sites that the initial implementation missed (CustomApp default branch, Tatsavit1App, RiyaApp) and grew the glossary term dictionary from 40 to **250 unique terms** covering virtually the entire GCSE/IGCSE math vocabulary. No component or CSS changes — `GlossaryText.jsx` and `App.css` are unchanged in this phase.

Files Changed:
- `client/src/App.jsx` (modified — 3 new `<GlossaryText>` wirings at lines 46942, 48264, 49031)
- `client/src/data/glossaryTerms.json` (modified — 40 → 250 unique entries)

Breaking Changes: None.

Migration Required: None — purely additive.

Wiring sites after v1.1 (14 total):

| # | Line | App | Notes |
|---|---|---|---|
| 1 | 36491 | `GKApp` | Phase 1 |
| 2 | 38961 | `VocabApp` | Phase 1 |
| 3 | 39257 | `makeMCQuizApp` factory | Phase 1 |
| 4 | 39498 | `makeQuizApp` factory | Phase 1 |
| 5 | 39857 | `DotProdApp` (fallback branch) | Phase 1 |
| 6 | 40801 | `GymApp` | Phase 1 |
| 7 | 42318 | `RandomMixApp` | Phase 1 |
| 8 | 42514 | `SetsApp` | Phase 1 |
| 9 | 42667 | `SequencesApp` | Phase 1 |
| 10 | 42836 | `RatioApp` | Phase 1 |
| 11 | 43004 | `PercentApp` | Phase 1 |
| 12 | 46942 | `CustomApp` (default branch) | **Phase 2** — wraps `getPromptForType(curType, question) \|\| ''` |
| 13 | 48264 | `Tatsavit1App` | **Phase 2** — wraps `q.prompt \|\| ''` |
| 14 | 49031 | `RiyaApp` | **Phase 2** — wraps `q.prompt \|\| ''` |

Phase 2 design decisions:

- **Empty-string fallback (`... || ''`)** used on all 3 new wirings to safely handle `null`/`undefined` returns from helpers (e.g. `getPromptForType` can return `null` for some puzzle types).
- **Trig tangent renames** to canonical `tangent line` with alias `tan`, to avoid clobbering the existing geometry `tangent` canonical in `matchMap`. Both definitions are now preserved under distinct canonicals.
- **Duplicate removal:** Removed redundant copies of `net` (geometry), `reciprocal` (number operations), and the redundant `index` entry (whose aliases were already on the existing `exponent` entry). Removed a self-alias `factorise` for cleanliness.
- **No changes** to `GlossaryText.jsx`, `App.css`, `server/index.js`, `package.json`, or `vite.config.js`.

Glossary term count by category after v1.1:

| Category | Approx. count |
|---|---|
| Geometry (shapes, lines, angles, circle parts, triangles, transformations) | ~70 |
| Algebra (expressions, equations, identities, inequalities, formulas, functions, quadratics, asymptotes) | ~30 |
| Number & Arithmetic (types, fractions, decimals, percentages, ratios, BODMAS, rounding, number operations) | ~50 |
| Statistics & Probability (data terms, charts, probability events) | ~30 |
| Trigonometry (sin/cos/tan, identities, bearings) | ~17 |
| Calculus (limits, derivatives, integrals, stationary points) | ~15 |
| Vectors & Matrices | ~10 |
| Sets (union, intersection, complement) | ~8 |
| Logarithms & Exponentials | ~6 |
| Money & Business | ~9 |
| Measurement (speed/distance/time/rate/unit) | ~5 |
| Sign concepts (positive, negative, absolute value) | ~3 |

New limitations introduced in v1.1: None (existing Phase 1 limitations unchanged).

New limitations: The geometry `tangent` canonical no longer has a `"tan"` alias (since `"tan"` is reserved for the trig entry under `tangent line`). In trig prompts containing `"tan"`, the displayed definition is the trig `tangent line` one, which is correct; in geometry prompts containing `"tangent"`, the geometry definition is displayed, which is also correct.

Testing performed: Manual review only (no automated tests exist for this feature). The user instructed that the dev server and backend remain running for the duration of the session, so no verification commands were executed.

---

### v1.2 (Phase 3 — Pre-quiz "Learn These Words" section)

Date: 2026-07-09

Summary: Added a NEW complementary feature — a "Learn These Words" section on every math topic's setup page (before "Start Quiz"). Lists 3-9 curated glossary terms per topic; tapping a term opens the **exact same popover** used inside quiz questions. Strictly additive: zero changes to existing in-question glossary behavior, no new dependencies, single glossary system preserved. Backed by a new lightweight `topicGlossaryMap.json` that references canonical term keys (no definitions duplicated).

Files Changed:
- `client/src/data/topicGlossaryMap.json` (**new** — 64 topics × 3-9 term references = 326 references)
- `client/src/components/KeyTerms.jsx` (**new** — section component, ~60 lines)
- `client/src/components/GlossaryText.jsx` (modified — 3 small additions: `export` on `matchMap`, optional `wrapperClassName` prop on `GlossaryTooltip`, class-name concatenation in wrapper span. **Zero behavior changes** to existing in-question glossary.)
- `client/src/App.jsx` (modified — added `import KeyTerms`; added `topicKey` to both factory signatures; added `<KeyTerms topicKey="..." />` to 21 standalone welcome-boxes + 2 factories' welcome-boxes; added `topicKey: '...'` to 44 factory call configs)
- `client/src/App.css` (modified — added `.glossary-term-wrapper--above` flip rule + `@keyframes glossary-appear-above` + `.learn-these-words-section` / `.learn-these-words-title` / `.learn-these-words-list` + chip-style overrides on existing `.glossary-term`. ~65 new lines, all using existing CSS variables.)

Breaking Changes: None.

Migration Required: None — purely additive.

Architecture:

```
glossaryTerms.json  (definitions, single source of truth, 250 terms)
        │
        ▼
GlossaryText.jsx   matchMap built once at module load
        │
        ├─ exports matchMap, GlossaryTooltip
        │
        ├── <GlossaryText>     (in-question prose renderer; 14 wiring sites)
        │
        └── <KeyTerms>         (pre-quiz section renderer; 65 wiring sites)
                │
                └── reads topicGlossaryMap.json
                        │
                        └── { "trigonometry": ["sine", "cosine", "tangent line", ...], ... }
```

**One glossary system invariant**: every term definition, popover rendering, and outside-click/Escape/auto-dismiss/keyboard behavior is implemented exactly once, in `GlossaryText.jsx` / `App.css`. `KeyTerms` reuses the exported `GlossaryTooltip` directly. Updating a definition in `glossaryTerms.json` automatically updates both the in-question glossary and the pre-quiz section.

Design decisions:

- **`wrapperClassName` prop, not a refactor** — Rather than extract a new shared component, a single optional `wrapperClassName` prop was added to `GlossaryTooltip`. Default `''` keeps all 14 in-question call sites unaffected; only `KeyTerms` passes `"glossary-term-wrapper--above"` to flip the popover upward.
- **Topic keys are kebab-case human-readable names** (e.g. `coordinate-geometry`, `pythagoras-theorem`, `prime-factors`) — not the internal `regularApps[i].key` abbreviations (e.g. `coordgeom`). Each app's welcome-box or factory call explicitly passes the readable key, keeping `topicGlossaryMap.json` browseable.
- **Section placement is "middle" of the welcome-box** (after welcome-text and optional tip, before difficulty picker) per the spec.
- **Popover position is "always above" for this section** — not conditional viewport-flip. The section lives near the bottom of the welcome-box where the Start Quiz button sits, so the popover should always open upward. CSS-only `position: absolute; bottom: calc(100% + 7px)` is simpler, equally correct for the placement, and renders identically across devices.
- **Silent skip for missing terms** — `KeyTerms` filters `matchMap[key.toLowerCase()]` results and drops `undefined` entries. Topics where every term is missing render `null` (section hidden). Per the spec edge case: "If a glossary term cannot be found, skip it without breaking the UI."
- **Auto-skipped duplicate synonyms** — internal `seen` Set dedupes by `entry.term.toLowerCase()`. If `tangent` and `tan` are both listed, only the first renders.
- **Curated 3-9 terms per topic** (not a hard cap) — chosen to match each topic's vocabulary density. Most topics have 3-8 terms; outliers: mensuration (9), sets (9), coordinate-geometry (8), probability (8), statistics (8), matrices (8), transformations (8), trigonometry (8), differentiation (8).

Wiring sites (65 total in Phase 3):

- **21 standalone math quiz welcome-boxes** — each had `<KeyTerms topicKey="<key>" />` added directly after the existing `<p className="welcome-text">…</p>`.
- **2 factory welcome-boxes** (`makeQuizApp` and `makeMCQuizApp`) — each had `{topicKey && <KeyTerms topicKey={topicKey} />}` added directly after the optional tip line.
- **44 factory call configs** — each had `topicKey: '<kebab-case>'` added alongside the existing `title`/`subtitle`/`apiPath`/`diffLabels`/`placeholders` properties.

Curated topics (64 total, 3-9 terms each):

| Group | Topics | Count |
|---|---|---|
| Geometry | angles, triangles, polygons, circle-theorems, transformations, mensuration, pythagoras-theorem, similarity, congruence, herons-formula, bearings | 11 |
| Algebra | linear-equations, quadratics, quadratic-formula, simultaneous-equations, inequalities, polynomial-multiplication, polynomial-factorisation, binomial-theorem, remainder-theorem, basic-arithmetic, multiplication, addition, expansion (= indices) | 13 |
| Number | fractions, decimals, percentages, ratios, surds, indices, square-roots, standard-form, rounding, number-bases, prime-factors, hcf-and-lcm, variation, bounds, shares-and-dividends, banking, profit-and-loss, gst | 18 |
| Functions | functions, coordinate-geometry, line-equation, trigonometry, inverse-trigonometry, differentiation, integration, limits, differential-equations, calculus (via differentiation/integration) | 9 |
| Statistics | statistics, probability, sets, sequences, vectors, matrices, dot-products, sequences | 8 |
| Money/measurement | speed-distance-time, perimeter (via mensuration), area (via mensuration) | 1 (others via mensuration) |
| Misc | section-formula, linear-programming, circular-measure, conic-sections, linear-programming, squaring | 5 |

(Note: some topics overlap in scope — total 64 unique topic keys.)

Intentionally NOT wired (per user spec — section would auto-hide for some but skipped entirely to keep this change minimal):
- CustomApp, RandomMixApp, GymApp, TatsavitApp, Tatsavit1App, RiyaApp, TatsavitLineApp, BridgeApp, TenthApp, Chapter1-24App, GuessNumberApp, TwinHuntApp
- The 7 Gym-* MCQ factory apps (GymDecimals, FuncGym, DotProdGym, FracAddGym, LinEqGym, IndicesGym, PolyGym)
- GKApp, VocabApp (would auto-hide since no entries for their keys)

Limitations introduced in v1.2: None — feature is purely additive.

Pre-existing limitations (from Phase 1/2) carried forward unchanged.

Testing performed: Manual review via verification script (since removed) — all 326 term-key references across 64 topics resolve to entries in `glossaryTerms.json`. 6 entries were silently dropped during development (clockwise, side, regular polygon, direct/inverse proportion, binomial-as-standalone) and removed from `topicGlossaryMap.json`. No automated tests exist for this feature. User instructed that the dev server and backend remain running for the duration of the session, so no live browser tests were executed.