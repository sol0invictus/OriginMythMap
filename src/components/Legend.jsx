import { useEffect, useRef } from 'react'
import { ERAS, civilizations } from '../data/civilizations'
import { myths } from '../data/myths'
import { parseYearRange, formatYear } from '../utils/parseYearRange'

// Approximate year bounds per era — used to scale the active-centuries bar
const ERA_YEAR_BOUNDS = {
  prehistoric:    [-15000, -3000],
  'bronze-age':   [-3000,  -1200],
  'iron-age':     [-1200,  -500],
  classical:      [-500,    500],
  medieval:       [500,     1800],
}

function CenturiesBar({ dateRange, eraId, eraColor }) {
  const [civStart, civEnd] = parseYearRange(dateRange)
  const [eraStart, eraEnd] = ERA_YEAR_BOUNDS[eraId] || [-10000, 2000]
  const span = eraEnd - eraStart

  const clampedStart = Math.max(civStart, eraStart)
  const clampedEnd   = Math.min(civEnd,   eraEnd)
  if (clampedEnd <= clampedStart) return null

  const leftPct  = ((clampedStart - eraStart) / span * 100).toFixed(1)
  const widthPct = Math.max(4, ((clampedEnd - clampedStart) / span * 100)).toFixed(1)

  return (
    <div className="civ-century-bar-track" title={`${formatYear(civStart)} – ${formatYear(civEnd)}`}>
      <div
        className="civ-century-bar-fill"
        style={{
          left: `${leftPct}%`,
          width: `${widthPct}%`,
          background: eraColor,
        }}
      />
    </div>
  )
}

export default function Legend({ selectedEra, onEraClick, showAll, filterTheme, timelineYear, selectedCivId }) {
  const activeItemRef = useRef(null)
  useEffect(() => {
    activeItemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [selectedCivId])
  const activeCivs = filterTheme
    ? civilizations.filter(c => myths[c.mythId]?.themes?.includes(filterTheme))
    : null

  // In timeline mode, show civs active at this year
  const timelineCivs = timelineYear != null
    ? civilizations.filter(c => {
        const [s, e] = parseYearRange(c.dateRange)
        if (s < -5000) return timelineYear <= -5000
        return s <= timelineYear && timelineYear <= e
      })
    : null

  if (timelineYear != null) {
    return (
      <div className="legend">
        <div className="legend-title">
          Active at {formatYear(timelineYear)}
          <span className="legend-era-count" style={{ marginLeft: 6 }}>{timelineCivs.length}</span>
        </div>
        <ul className="legend-civs" style={{ marginLeft: 0 }}>
          {timelineCivs.map(c => {
            const era = ERAS.find(e => e.id === c.era)
            return (
              <li key={c.id} ref={c.id === selectedCivId ? activeItemRef : null}
                  className={c.id === selectedCivId ? 'legend-civ-active' : ''}
                  style={{ '--era-color': era?.color }}>
                {c.name}
                <span className="legend-date">{c.dateRange}</span>
              </li>
            )
          })}
        </ul>
      </div>
    )
  }

  return (
    <div className="legend">
      {filterTheme ? (
        <>
          <div className="legend-title">Theme: {filterTheme}</div>
          <ul className="legend-civs" style={{ marginLeft: 0 }}>
            {activeCivs.map(c => {
              const era = ERAS.find(e => e.id === c.era)
              return (
                <li key={c.id} ref={c.id === selectedCivId ? activeItemRef : null}
                    className={c.id === selectedCivId ? 'legend-civ-active' : ''}
                    style={{ '--era-color': era?.color }}>
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
                      <li key={c.id} ref={c.id === selectedCivId ? activeItemRef : null}
                          className={c.id === selectedCivId ? 'legend-civ-active' : ''}
                          style={{ '--era-color': era.color }}>
                        {c.name}
                        <span className="legend-date">{c.dateRange}</span>
                        <CenturiesBar dateRange={c.dateRange} eraId={era.id} eraColor={era.color} />
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
