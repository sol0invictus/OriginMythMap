import { useEffect } from 'react'
import { myths } from '../data/myths'
import { ERAS, civilizations, MYTH_TYPES } from '../data/civilizations'
import { influences } from '../data/influences'
import { getHtmlGlyph } from '../utils/glyphs'

// Documented cultural lineage for a civilization, drawn from influences.js.
// ancestors = traditions this one grew out of (to === id);
// descendants = traditions it shaped (from === id).
function getLineage(civId) {
  const ancestors = influences
    .filter(i => i.to === civId)
    .map(i => ({ civ: civilizations.find(c => c.id === i.from), label: i.label, key: i.id }))
    .filter(x => x.civ)
  const descendants = influences
    .filter(i => i.from === civId)
    .map(i => ({ civ: civilizations.find(c => c.id === i.to), label: i.label, key: i.id }))
    .filter(x => x.civ)
  return { ancestors, descendants }
}

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

export default function MythPopup({ civilization, onClose, onCivSelect, onThemeFilter, onStartCompare, onOpenCompare }) {
  if (!civilization) return null
  const myth = myths[civilization.mythId]
  const era  = ERAS.find(e => e.id === civilization.era)
  if (!myth) return null

  const related     = getRelated(myth, civilization.id)
  const connections = countConnections(myth, civilization.id)
  const mythType    = myth.category ? MYTH_TYPES[myth.category] : null
  const { ancestors, descendants } = getLineage(civilization.id)
  const hasLineage  = ancestors.length > 0 || descendants.length > 0

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
          className={`myth-illustration${myth.imageUrl ? ' has-image' : ''}`}
          style={{
            '--era-color': era?.color || '#888',
            ...(myth.imageUrl ? { backgroundImage: `url(${myth.imageUrl})` } : {}),
          }}
          aria-label={`Illustration for ${civilization.name}`}
        >
          <div className="myth-illustration-inner">
            <div className="myth-illustration-glyph">{getHtmlGlyph(civilization.id)}</div>
            <div className="myth-illustration-caption">
              {civilization.name}
              {myth.imageUrl
                ? <span className="myth-illustration-note">Image — Wikimedia Commons</span>
                : <span className="myth-illustration-note">Artwork pending — Wikimedia Commons</span>
              }
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
            {onStartCompare && (
              <button
                className="myth-compare-btn"
                onClick={() => onStartCompare(civilization.id)}
                title="Compare this myth with another"
              >
                ↔ Compare
              </button>
            )}
          </div>
          <h2 className="myth-civ-name">{myth.civilization}</h2>
          <h3 className="myth-title">"{myth.title}"</h3>
          {mythType && (
            <div
              className="myth-type-badge"
              title={`Creation-myth type: ${mythType.label} — ${mythType.tagline}`}
            >
              <span className="myth-type-icon" aria-hidden="true">{mythType.icon}</span>
              <span className="myth-type-text">
                <span className="myth-type-label">{mythType.label}</span>
                <span className="myth-type-tagline">{mythType.tagline}</span>
              </span>
            </div>
          )}
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

          {myth.relatedTexts?.length > 0 && (
            <div className="myth-sources">
              <div className="myth-sources-title">Sources</div>
              <ul className="myth-sources-list">
                {myth.relatedTexts.map((src, i) => (
                  <li key={i} className="myth-source-item">
                    <span className="source-type">{src.type}</span>
                    {src.url
                      ? <a href={src.url} target="_blank" rel="noopener noreferrer" className="source-link">{src.title}</a>
                      : <span className="source-title">{src.title}</span>
                    }
                    {src.author && <span className="source-author">{src.author}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {hasLineage && (
            <div className="myth-lineage">
              <div className="myth-lineage-title">Lineage</div>
              {ancestors.length > 0 && (
                <div className="lineage-group">
                  <div className="lineage-group-label">
                    <span className="lineage-arrow">⇠</span> Descended from
                  </div>
                  <ul className="lineage-list">
                    {ancestors.map(({ civ, label, key }) => (
                      <li key={key}>
                        <button
                          className="lineage-btn is-ancestor"
                          onClick={() => { onClose(); onCivSelect(civ) }}
                          title={`Open ${civ.name}`}
                        >
                          <span className="lineage-civ">{civ.name}</span>
                          <span className="lineage-label">{label}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {descendants.length > 0 && (
                <div className="lineage-group">
                  <div className="lineage-group-label">
                    <span className="lineage-arrow is-descendant">⇢</span> Influenced
                  </div>
                  <ul className="lineage-list">
                    {descendants.map(({ civ, label, key }) => (
                      <li key={key}>
                        <button
                          className="lineage-btn is-descendant"
                          onClick={() => { onClose(); onCivSelect(civ) }}
                          title={`Open ${civ.name}`}
                        >
                          <span className="lineage-civ">{civ.name}</span>
                          <span className="lineage-label">{label}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {related.length > 0 && (
            <div className="myth-related">
              <div className="myth-related-title">Related myths</div>
              <ul className="myth-related-list">
                {related.map(({ civ, myth: m, shared }) => (
                  <li key={civ.id} className="myth-related-item">
                    <div className="myth-related-row">
                      <button
                        className="myth-related-btn"
                        onClick={() => { onClose(); onCivSelect(civ) }}
                      >
                        <div className="related-civ-name">{civ.name}</div>
                        <div className="related-myth-title">"{m.title}"</div>
                      </button>
                      {onOpenCompare && (
                        <button
                          className="myth-related-compare-btn"
                          title={`Compare with ${civ.name}`}
                          onClick={() => onOpenCompare(civilization.id, civ.id)}
                        >
                          ↔
                        </button>
                      )}
                    </div>
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

