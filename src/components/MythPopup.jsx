import { useEffect } from 'react'
import { myths } from '../data/myths'
import { ERAS, civilizations } from '../data/civilizations'

function getRelated(myth, currentId) {
  if (!myth?.themes?.length) return []
  return civilizations
    .filter(c => c.id !== currentId)
    .map(c => {
      const m = myths[c.mythId]
      if (!m?.themes) return null
      const shared = m.themes.filter(t => myth.themes.includes(t))
      return shared.length ? { civ: c, myth: m, shared } : null
    })
    .filter(Boolean)
    .sort((a, b) => b.shared.length - a.shared.length)
    .slice(0, 5)
}

function countConnections(myth, currentId) {
  if (!myth?.themes?.length) return 0
  return civilizations.filter(c => {
    if (c.id === currentId) return false
    const m = myths[c.mythId]
    return m?.themes?.some(t => myth.themes.includes(t))
  }).length
}

export default function MythPopup({ civilization, onClose, onCivSelect, onThemeFilter }) {
  if (!civilization) return null
  const myth = myths[civilization.mythId]
  const era  = ERAS.find(e => e.id === civilization.era)
  if (!myth) return null

  const related     = getRelated(myth, civilization.id)
  const connections = countConnections(myth, civilization.id)

  useEffect(() => {
    const prev = document.title
    document.title = `${myth.civilization} — ${myth.title} | Origin Myth Map`
    return () => { document.title = prev }
  }, [myth])

  const handleShare = () => {
    const url = `${window.location.origin}${window.location.pathname}#${civilization.id}`
    navigator.clipboard.writeText(url).catch(() => {})
  }

  return (
    <div className="myth-popup-overlay" onClick={onClose}>
      <div className="myth-popup" onClick={e => e.stopPropagation()}>
        <button className="myth-close" onClick={onClose} aria-label="Close">✕</button>

        {/* Illustration banner */}
        <div
          className="myth-illustration"
          style={{ '--era-color': era?.color || '#888' }}
          aria-label={`Illustration for ${civilization.name}`}
        >
          <div className="myth-illustration-inner">
            <div className="myth-illustration-glyph">{getGlyph(civilization.id)}</div>
            <div className="myth-illustration-caption">
              {civilization.name}
              <span className="myth-illustration-note">Illustration — Wikimedia Commons</span>
            </div>
          </div>
          {connections > 0 && (
            <div className="myth-connections-badge" title="Myths sharing at least one theme">
              <span className="connections-num">{connections}</span>
              <span className="connections-label">connected myths</span>
            </div>
          )}
        </div>

        <div className="myth-header" style={{ borderColor: era?.color }}>
          <div className="myth-meta">
            <span className="myth-era-badge" style={{ background: era?.color }}>
              {era?.label} · {civilization.dateRange}
            </span>
            <span className="myth-region">{civilization.region}</span>
            <button className="myth-share-btn" onClick={handleShare} title="Copy share link">
              ↗ Share
            </button>
          </div>
          <h2 className="myth-civ-name">{myth.civilization}</h2>
          <h3 className="myth-title">"{myth.title}"</h3>
        </div>

        <div className="myth-body">
          <p className="myth-summary">{myth.summary}</p>

          <details className="myth-full-text">
            <summary>Read the full myth</summary>
            <div className="myth-full-content">
              {myth.fullText.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </details>

          {myth.themes?.length > 0 && (
            <div className="myth-themes">
              {myth.themes.map(t => (
                <button
                  key={t}
                  className="theme-tag"
                  title={`Filter map to "${t}" myths`}
                  onClick={() => { onThemeFilter(t); onClose() }}
                >
                  {t}
                </button>
              ))}
            </div>
          )}

          {related.length > 0 && (
            <div className="myth-related">
              <div className="myth-related-title">Related myths</div>
              <ul className="myth-related-list">
                {related.map(({ civ, myth: m, shared }) => (
                  <li key={civ.id} className="myth-related-item">
                    <button
                      className="myth-related-btn"
                      onClick={() => { onClose(); onCivSelect(civ) }}
                    >
                      <div className="related-civ-name">{civ.name}</div>
                      <div className="related-myth-title">"{m.title}"</div>
                    </button>
                    <div className="related-shared-themes">
                      {shared.map(t => (
                        <span key={t} className="related-theme">{t}</span>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function getGlyph(id) {
  const glyphs = {
    sumer: '𒀭', egypt: '𓂀', 'vedic-india': 'ॐ', 'shang-china': '龍',
    zoroastrian: '𐬀', canaan: '𐤀', nubia: '𓇯', korea: '☯',
    'aboriginal-australia': '◉', 'san-people': '✦',
    greece: 'Ω', maya: '𝕄', rome: 'SPQR', celtic: '᚛', yoruba: '✵',
    norse: 'ᚱ', 'hindu-puranic': '꩜', 'japan-shinto': '⛩', slavic: '⊕', maori: '᭡',
    aztec: '☀', inca: '🌄', haudenosaunee: '🐢', polynesian: '🌊',
  }
  return glyphs[id] || '◈'
}
