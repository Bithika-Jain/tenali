/**
 * KeyTerms.jsx — Learn These Words section for the topic setup page.
 *
 * Renders a lightweight list of clickable glossary terms relevant to the
 * currently selected topic. Tapping a term opens the SAME popover used inside
 * quiz questions (via GlossaryTooltip from GlossaryText.jsx), so there is
 * exactly one glossary system and one source of truth for definitions.
 *
 * Data flow:
 *   topicGlossaryMap.json  →  array of canonical glossary term keys per topic
 *   glossaryTerms.json      →  definitions (single source of truth)
 *   matchMap (exported from GlossaryText.jsx) → looked up for each term key
 *
 * Edge cases:
 *   - topicKey has no entry in topicGlossaryMap → returns null (section hidden)
 *   - every listed term is missing from matchMap → returns null (section hidden)
 *   - some terms missing → silently skipped, section still rendered with what's left
 */

import { useState, useMemo } from 'react'
import topicGlossaryMap from '../data/topicGlossaryMap.json'
import { GlossaryTooltip, matchMap } from './GlossaryText'

// Self-contained state-owning wrapper around GlossaryTooltip so each chip
// tracks its own open/close. Uses the same DOM, CSS classes, and behavior as
// the in-question glossary.
function TermChip({ entry }) {
  const [isOpen, setIsOpen] = useState(false)
  const handleToggle = () => setIsOpen(prev => !prev)
  return (
    <GlossaryTooltip
      displayText={entry.term}
      term={entry.term}
      definition={entry.definition}
      isOpen={isOpen}
      onToggle={handleToggle}
      wrapperClassName="glossary-term-wrapper--above"
    />
  )
}

export default function KeyTerms({ topicKey }) {
  // Look up the curated term-key list for this topic
  const termKeys = useMemo(
    () => (topicGlossaryMap && topicKey ? (topicGlossaryMap[topicKey] || []) : []),
    [topicKey]
  )

  // Resolve each key against the live matchMap; silently drop missing keys.
  const validEntries = useMemo(() => {
    const seen = new Set()
    const out = []
    for (const key of termKeys) {
      const entry = matchMap[String(key).toLowerCase()]
      if (!entry) continue
      // Avoid duplicate chips if the curated list happens to contain synonyms
      // that resolve to the same canonical entry.
      const dedupeKey = entry.term.toLowerCase()
      if (seen.has(dedupeKey)) continue
      seen.add(dedupeKey)
      out.push(entry)
    }
    return out
  }, [termKeys])

  if (validEntries.length === 0) return null

  return (
    <div className="learn-these-words-section">
      <h3 className="learn-these-words-title">Learn These Words</h3>
      <ul className="learn-these-words-list">
        {validEntries.map(entry => (
          <li key={entry.term}>
            <TermChip entry={entry} />
          </li>
        ))}
      </ul>
    </div>
  )
}