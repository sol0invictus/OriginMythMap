import { useMemo } from 'react'
import { myths } from '../data/myths'
import { ERAS, civilizations } from '../data/civilizations'
import { getHtmlGlyph } from '../utils/glyphs'

// Narrative descriptions for shared themes
const THEME_PARALLELS = {
  water:               'Both feature primordial waters or a great flood as a central creative force',
  void:                'Both begin in primordial void, chaos, or absolute darkness',
  sacrifice:           'Both make cosmic sacrifice the engine of creation',
  'creation-from-body':'Both describe the world formed from the body of a divine being',
  'cosmic-egg':        'Both employ the cosmic egg as the origin of the universe',
  'sky-earth':         'Both describe the primordial separation of sky from earth',
  fire:                'Both give sacred, generative significance to fire',
  sun:                 'Both place the sun at the center of cosmic or divine order',
  flood:               'Both feature a great destructive flood within the mythic cycle',
  chaos:               'Both begin in a state of primordial chaos that must be ordered',
  trickster:           'Both feature a trickster deity who shapes or disrupts creation',
  underworld:          'Both describe a realm beneath the earth inhabited by the dead',
  hero:                'Both involve a champion who battles chaos to establish the world',
  serpent:             'Both feature a primordial serpent as a fundamental cosmic force',
  'word-creation':     'Both hold that creation begins with divine speech or sacred sound',
  'earth-diver':       'Both tell of a being diving below primordial waters to bring up solid ground',
  twins:               'Both feature divine twin beings at the heart of creation',
  darkness:            'Both begin in original, generative darkness before light exists',
  ancestors:           'Both root cosmic order in the deeds of primordial ancestral beings',
  land:                'Both understand the land itself as sacred and spiritually animate',
  dualism:             'Both organize the cosmos around two opposing creative forces',
  transformation:      'Both make transformation and shapeshifting the mechanism of creation',
  cycles:              'Both emphasize cyclical time, world renewal, and seasonal return',
  ages:                'Both describe successive world-ages or cosmic epochs of creation',
  dance:               'Both connect creation or maintenance of the world to sacred dance',
  maize:               'Both connect human origins to sacred plants and the earth\'s fertility',
}


function MythPanel({ civ, myth, era, sharedThemes, onViewFull }) {
  return (
    <div className="compare-myth-panel">
      <div
        className="compare-myth-banner"
        style={{ '--era-color': era?.color || '#888' }}
      >
        <div className="compare-myth-glyph">{getHtmlGlyph(civ.id)}</div>
        <div className="compare-myth-banner-info">
          <span className="myth-era-badge" style={{ background: era?.color }}>
            {era?.label} · {civ.dateRange}
          </span>
          <span className="myth-region">{civ.region}</span>
        </div>
      </div>
      <div className="compare-myth-body">
        <h3 className="compare-civ-name">{myth.civilization}</h3>
        <h4 className="compare-myth-title">"{myth.title}"</h4>
        <p className="compare-myth-summary">{myth.summary}</p>

        {myth.themes?.length > 0 && (
          <div className="compare-myth-themes">
            {myth.themes.map(t => (
              <span
                key={t}
                className={`compare-theme-tag ${sharedThemes.includes(t) ? 'shared' : 'unique'}`}
              >
                {t}
              </span>
            ))}
          </div>
        )}

        <button className="compare-view-full-btn" onClick={() => onViewFull(civ)}>
          Read full myth →
        </button>
      </div>
    </div>
  )
}

export default function CompareView({ civIds, onClose, onViewFull, onSurpriseMe }) {
  const [idA, idB] = civIds
  const civA = civilizations.find(c => c.id === idA)
  const civB = civilizations.find(c => c.id === idB)
  const mythA = civA ? myths[civA.mythId] : null
  const mythB = civB ? myths[civB.mythId] : null
  const eraA  = civA ? ERAS.find(e => e.id === civA.era) : null
  const eraB  = civB ? ERAS.find(e => e.id === civB.era) : null

  const sharedThemes = useMemo(() => {
    if (!mythA?.themes || !mythB?.themes) return []
    return mythA.themes.filter(t => mythB.themes.includes(t))
  }, [mythA, mythB])

  const parallels = sharedThemes.map(t => THEME_PARALLELS[t]).filter(Boolean)

  const totalThemes = useMemo(() => {
    const all = new Set([...(mythA?.themes || []), ...(mythB?.themes || [])])
    return all.size
  }, [mythA, mythB])

  if (!civA || !civB || !mythA || !mythB) return null

  const handleShare = () => {
    const url = `${window.location.origin}${window.location.pathname}#${idA}+${idB}`
    navigator.clipboard.writeText(url).catch(() => {})
  }

  return (
    <div className="compare-overlay" onClick={onClose}>
      <div className="compare-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="compare-header">
          <div className="compare-title">
            <span className="compare-label">Comparing</span>
            <span className="compare-civ-a" style={{ color: eraA?.color }}>
              {civA.name}
            </span>
            <span className="compare-divider">↔</span>
            <span className="compare-civ-b" style={{ color: eraB?.color }}>
              {civB.name}
            </span>
          </div>
          <div className="compare-header-actions">
            <button className="compare-action-btn" onClick={onSurpriseMe} title="Try a random pairing">
              🎲 Surprise Me
            </button>
            <button className="compare-action-btn" onClick={handleShare} title="Copy share link">
              ↗ Share
            </button>
            <button className="compare-close-btn" onClick={onClose} aria-label="Close comparison">✕</button>
          </div>
        </div>

        {/* Main panels */}
        <div className="compare-body">
          <div className="compare-panels">
            <MythPanel
              civ={civA} myth={mythA} era={eraA}
              sharedThemes={sharedThemes}
              onViewFull={onViewFull}
            />

            {/* Center score strip */}
            <div className="compare-center-strip">
              <div className="compare-score-ring">
                <span className="score-num">{sharedThemes.length}</span>
                <span className="score-total">/{totalThemes}</span>
              </div>
              <div className="compare-score-label">themes shared</div>
              {sharedThemes.length > 0 && (
                <div className="compare-shared-tags">
                  {sharedThemes.map(t => (
                    <span key={t} className="compare-shared-tag">{t}</span>
                  ))}
                </div>
              )}
            </div>

            <MythPanel
              civ={civB} myth={mythB} era={eraB}
              sharedThemes={sharedThemes}
              onViewFull={onViewFull}
            />
          </div>

          {/* Structural parallels */}
          {parallels.length > 0 ? (
            <div className="compare-parallels">
              <div className="compare-parallels-title">Structural Parallels</div>
              <ul className="compare-parallels-list">
                {parallels.map((p, i) => (
                  <li key={i} className="compare-parallel-item">
                    <span className="parallel-glyph">◈</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="compare-no-shared">
              These myths approach creation from entirely different angles — no overlapping themes.
              This divergence itself reveals the range of human answers to the same primal question.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
