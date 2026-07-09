# Current Context

## Project

**Tenali** — an adaptive math quiz platform for students. A monolithic full-stack app: Express server (`server/index.js`, ~9 000 lines) algorithmically generates questions across 69+ puzzle types; a single-file React client (`client/src/App.jsx`, ~50 000 lines) handles all UI. No React Router — routing is a `useState` in the root `App` component. Live at `tenali.fun`.

---

## Active Feature

**Feature AQ — Tap-to-Define Word Glossary (Phase 3: Learn These Words pre-quiz section)**

Branch: `feat/tap-to-define-word-glossary`

**Phase 1:** In-question glossary — recognized terms in a question prompt are underlined and tappable; tapping shows a definition in an inline popover. (14 wiring sites)

**Phase 2:** Glossary expansion — 40 → 250 unique term definitions covering the full GCSE/IGCSE math vocabulary. (3 additional wirings: CustomApp default branch, Tatsavit1App, RiyaApp)

**Phase 3 (current):** Pre-quiz "Learn These Words" section — on the topic setup page (welcome-box), before "Start Quiz", display a small list of curated glossary terms relevant to the selected topic. Tapping a term opens the SAME popover as inside questions (single glossary system, single source of truth for definitions). Section is fully optional — students can skip it and press Start Quiz immediately.

---

## Current Objective

Phase 3 implementation complete; documentation updated; awaiting user self-review.

---

## Current Progress

| Task | Status |
|---|---|
| Phase 1 — `GlossaryText.jsx` component | ✅ Done |
| Phase 1 — `glossaryTerms.json` (40 terms) | ✅ Done |
| Phase 1 — CSS for in-question glossary | ✅ Done |
| Phase 1 — 11 in-question wiring sites | ✅ Done |
| Phase 2 — 3 additional in-question wirings | ✅ Done |
| Phase 2 — glossary expansion (40 → 250 terms) | ✅ Done |
| Phase 3 — `topicGlossaryMap.json` (64 topics) | ✅ Done |
| Phase 3 — `KeyTerms.jsx` component | ✅ Done |
| Phase 3 — `GlossaryText.jsx` exports (matchMap, GlossaryTooltip) | ✅ Done |
| Phase 3 — 21 standalone + 2 factory + 44 factory-call wirings | ✅ Done |
| Phase 3 — CSS for `learn-these-words-section` + above-flip | ✅ Done |
| Phase 3 — Documentation (this entry) | ✅ Done |
| Phase 3 — Self-review | 🔄 In progress (user) |
| Committed to branch (Phase 1 + 2 + 3) | ⬜ Pending (user will commit) |
| Merged to main | ⬜ Pending |
| Deployed to `tenali.fun` | ⬜ Pending |

**Total in-question wirings:** 14 sites in `client/src/App.jsx`.
**Total pre-quiz section wirings:** 21 standalone apps + 44 factory calls = 65 quiz types covered.
**Total glossary terms:** 250 unique canonicals.
**Total curated topic→term mappings:** 64 topics × 3-9 terms each = 326 references.

---

## Files Currently Involved (Phase 3)

**New files:**
- `client/src/data/topicGlossaryMap.json` — topic → term-key mapping (64 topics, 326 references)
- `client/src/components/KeyTerms.jsx` — section component (~60 lines)

**Modified files (Phase 3):**
- `client/src/components/GlossaryText.jsx` — added `export` to `matchMap`; added optional `wrapperClassName` prop to `GlossaryTooltip` (zero behavior changes to in-question glossary)
- `client/src/App.jsx` — added `import KeyTerms`; 21 standalone + 2 factory + 44 factory-call wiring lines; `topicKey` parameter added to both factory signatures
- `client/src/App.css` — added `.glossary-term-wrapper--above` flip rule + matching animation keyframe + `.learn-these-words-section` / `.learn-these-words-title` / `.learn-these-words-list` styling (~65 new lines)

**Not modified this phase:** `server/index.js`, `package.json`, `package-lock.json`, `client/vite.config.js`, `client/src/index.css`, `client/src/data/glossaryTerms.json`.

---

## Current Architecture Summary

```
client/src/
├── App.jsx                  ← all quiz components; 14 in-question + 65 pre-quiz wirings
├── App.css                  ← in-question glossary + Learn These Words styles
├── components/
│   ├── GlossaryText.jsx     ← exports: default GlossaryText, matchMap, GlossaryTooltip
│   └── KeyTerms.jsx         ← NEW: Learn These Words section component
└── data/
    ├── glossaryTerms.json   ← 250 unique term definitions (single source of truth)
    └── topicGlossaryMap.json ← NEW: 64 topics → term-key mapping
```

**Single glossary invariant** — there is exactly ONE definition source (`glossaryTerms.json`) and exactly ONE popover component (`GlossaryTooltip`). The in-question `<GlossaryText>` and the pre-quiz `<KeyTerms>` both read from the same `matchMap` and render the same `GlossaryTooltip`. Updating a definition in `glossaryTerms.json` automatically updates both surfaces.

**Pre-quiz section data flow:**
1. App setup page mounts → calls `<KeyTerms topicKey="trigonometry" />`
2. `KeyTerms` reads `topicGlossaryMap.json` (static import) → finds `["sine", "cosine", "tangent line", ...]`
3. For each term key, looks up `matchMap[key.toLowerCase()]`; skips if undefined
4. Deduplicates by canonical term name (in case synonyms resolve to the same entry)
5. Renders `<h3>Learn These Words</h3>` + `<ul>` of `<TermChip>` entries
6. If zero valid entries → returns `null` → entire section hidden
7. Each chip is a self-contained `TermChip` that renders `GlossaryTooltip` with `wrapperClassName="glossary-term-wrapper--above"` so the popover opens above the chip
8. Tapping a chip → controlled `useState` flips `isOpen` → same popover behavior as in-question (outside-click close, Escape close, 6s auto-dismiss, keyboard accessible)

---

## Wiring sites — Pre-quiz "Learn These Words" section (65 total)

**21 standalone math apps:**
AdditionApp, BasicArithApp, QuadraticApp, MultiplyApp, DotProdApp, SquaringApp, SetsApp, SequencesApp, RatioApp, PercentApp, IndicesApp, SurdsApp, FractionAddApp, SqrtApp, PolyMulApp, PolyFactorApp, PrimeFactorApp, QFormulaApp, SimulApp, FuncEvalApp, LineEqApp.

**44 factory-generated math apps (via `topicKey` config in `makeQuizApp` / `makeMCQuizApp`):**
TrigApp, IneqApp, CoordGeomApp, ProbApp, StatsApp, MatrixApp, VectorsApp, TransformApp, MensurApp, BearingsApp, LogApp, DiffApp, BasesApp, CircleThApp, IntegApp, StdFormApp, BoundsApp, SDTApp, VariationApp, HcfLcmApp, ProfitLossApp, RoundingApp, BinomialApp, ComplexApp, AnglesApp, TrianglesApp, CongruenceApp, PythagApp, PolygonsApp, SimilarityApp, LinearEqApp, DecimalsApp, PermCombApp, LimitsApp, InvTrigApp, RemFactorApp, HeronApp, SharesApp, BankingApp, GSTApp, SectionApp, LinProgApp, CircMeasureApp, ConicsApp, DiffEqApp.

**Intentionally NOT wired (per Q11):** CustomApp, RandomMixApp, GymApp, TatsavitApp, Tatsavit1App, RiyaApp, TatsavitLineApp, BridgeApp, TenthApp, Chapter1-24App, GuessNumberApp, TwinHuntApp, the 7 Gym-* MCQ factory apps (GymDecimals, FuncGym, DotProdGym, FracAddGym, LinEqGym, IndicesGym, PolyGym). GKApp and VocabApp also not wired (would auto-hide anyway since no entries for their keys in topicGlossaryMap.json).

---

## Immediate Next Tasks

- [ ] Wait for user self-review
- [ ] User will commit all three phases to branch (LLM does not commit per project git rules)
- [ ] User will merge to main and rebuild for deployment

---

## Current Blockers

None — awaiting user self-review.

---

## Definition of Done

**Phase 1 (in-question glossary):**
- [x] All word-problem quiz prompts in the app highlight recognized glossary terms
- [x] Tapping any highlighted term shows the correct, readable definition
- [x] Pure math-expression renders (e.g. `5³ = ?`) are not affected
- [x] Popovers close on: outside click, Escape key, 6-second auto-dismiss, retap
- [x] Only the first occurrence of each term per prompt is interactive
- [x] Glossary covers all common GCSE/IGCSE math vocabulary (250 unique entries)

**Phase 3 (pre-quiz Learn These Words):**
- [x] A "Learn These Words" section appears on the topic setup page of every curated math topic
- [x] Each listed term is tappable and opens the existing in-question popover (same look-and-feel)
- [x] Section is hidden if the topic has no entries or all entries are missing from the glossary
- [x] No regressions to existing in-question glossary behavior
- [x] No new npm dependencies, no backend changes
- [x] Existing CSS variables reused; minimal new CSS (~65 lines)
- [x] Single glossary system — one source of truth for definitions, one popover component

**Deployment:**
- [ ] All three phases committed, merged to main, and deployed to `tenali.fun`