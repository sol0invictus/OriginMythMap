import { ERAS, civilizations } from '../data/civilizations'
import { myths } from '../data/myths'

export default function Legend({ selectedEra, onEraClick, showAll, filterTheme }) {
  const allThemes = [...new Set(
    civilizations.flatMap(c => myths[c.mythId]?.themes || [])
  )].sort()

  const activeCivs = filterTheme
    ? civilizations.filter(c => myths[c.mythId]?.themes?.includes(filterTheme))
    : null

  return (
    <div className="legend">
      {filterTheme ? (
        <>
          <div className="legend-title">Theme: {filterTheme}</div>
          <ul className="legend-civs" style={{ marginLeft: 0 }}>
            {activeCivs.map(c => {
              const era = ERAS.find(e => e.id === c.era)
              return (
                <li key={c.id} style={{ '--era-color': era?.color }}>
                  {c.name}
                  <span className="legend-date">{c.era}</span>
                </li>
              )
            })}
          </ul>
        </>
      ) : (
        <>
          <div className="legend-title">Civilizations</div>
          {ERAS.map(era => {
            const civs = civilizations.filter(c => c.era === era.id)
            const isActive = era.id === selectedEra && !showAll
            return (
              <div
                key={era.id}
                className={`legend-era ${isActive ? 'active' : ''}`}
                onClick={() => onEraClick(era.id)}
              >
                <div className="legend-era-header">
                  <span className="legend-dot" style={{ background: era.color }} />
                  <span className="legend-era-name">{era.label}</span>
                  <span className="legend-era-count">{civs.length}</span>
                </div>
                {(isActive || showAll) && (
                  <ul className="legend-civs">
                    {civs.map(c => (
                      <li key={c.id} style={{ '--era-color': era.color }}>
                        {c.name}
                        <span className="legend-date">{c.dateRange}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}
