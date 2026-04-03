import { civilizations } from '../data/civilizations'

export default function MigrationPopup({ migration, onClose, onCivSelect }) {
  if (!migration) return null

  const relatedCivs = (migration.relatedCivIds || [])
    .map(id => civilizations.find(c => c.id === id))
    .filter(Boolean)

  return (
    <div className="migration-popup-overlay" onClick={onClose}>
      <div className="migration-popup" onClick={e => e.stopPropagation()}>
        <button className="myth-close" onClick={onClose} aria-label="Close">✕</button>

        <div className="migration-popup-header" style={{ '--route-color': migration.color }}>
          <div className="migration-route-line">
            <span className="migration-route-dot" />
            <span className="migration-route-dash" />
            <span className="migration-route-dot" />
          </div>
          <div className="migration-popup-meta">
            <span className="migration-era-badge">{migration.dateRange}</span>
          </div>
          <h2 className="migration-popup-title">{migration.label}</h2>
        </div>

        <div className="migration-popup-body">
          <p className="migration-description">{migration.description}</p>

          {migration.mythLink && (
            <div className="migration-myth-link">
              <div className="migration-myth-link-label">Myth connection</div>
              <p>{migration.mythLink}</p>
            </div>
          )}

          {relatedCivs.length > 0 && (
            <div className="migration-related">
              <div className="migration-related-label">Related civilizations on this map</div>
              <div className="migration-related-civs">
                {relatedCivs.map(civ => (
                  <button
                    key={civ.id}
                    className="migration-civ-btn"
                    style={{ '--route-color': migration.color }}
                    onClick={() => { onClose(); onCivSelect(civ) }}
                  >
                    {civ.name}
                    <span className="migration-civ-era">{civ.era}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
