import { useEffect } from 'react'
import { ERAS, civilizations } from '../data/civilizations'
import { ERA_INFO } from '../data/eraInfo'

export default function EraInfoCard({ eraId, onClose, onCivSelect }) {
  const era  = ERAS.find(e => e.id === eraId)
  const info = ERA_INFO[eraId]
  const civs = civilizations.filter(c => c.era === eraId)

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  if (!era || !info) return null

  return (
    <div className="era-card-overlay" onClick={onClose}>
      <div className="era-card" onClick={e => e.stopPropagation()}>
        <button className="era-card-close" onClick={onClose} aria-label="Close">✕</button>

        <div className="era-card-header" style={{ '--era-color': era.color }}>
          <span className="era-card-era-label" style={{ background: era.color }}>
            {era.label}
          </span>
          <h2 className="era-card-title">{info.title}</h2>
          <p className="era-card-subtitle">{info.subtitle} · {era.range}</p>
        </div>

        <div className="era-card-body">
          <p className="era-card-context">{info.context}</p>

          <div className="era-card-section">
            <div className="era-card-section-title">Key Historical Developments</div>
            <ul className="era-card-developments">
              {info.keyDevelopments.map((d, i) => (
                <li key={i} className="era-card-dev-item">
                  <span className="era-dev-bullet" style={{ color: era.color }}>◈</span>
                  {d}
                </li>
              ))}
            </ul>
          </div>

          <div className="era-card-section">
            <div className="era-card-section-title">
              {civs.length} Civilization{civs.length !== 1 ? 's' : ''} on This Map
            </div>
            <div className="era-card-civs">
              {civs.map(c => (
                <button
                  key={c.id}
                  className="era-card-civ-btn"
                  style={{ '--era-color': era.color }}
                  onClick={() => { onClose(); onCivSelect(c) }}
                >
                  <span className="era-civ-name">{c.name}</span>
                  <span className="era-civ-date">{c.dateRange}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
