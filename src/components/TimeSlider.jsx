import { ERAS } from '../data/civilizations'

export default function TimeSlider({ selectedEra, onChange, showAll }) {
  const idx = ERAS.findIndex(e => e.id === selectedEra)

  return (
    <div className="time-slider-panel">
      <div className="slider-header">
        <span className="slider-title">ERA</span>
        {showAll ? (
          <span className="slider-era-label" style={{ color: '#aab0cc' }}>All Eras</span>
        ) : (
          <>
            <span className="slider-era-label" style={{ color: ERAS[idx].color }}>
              {ERAS[idx].label}
            </span>
            <span className="slider-range">{ERAS[idx].range}</span>
          </>
        )}
      </div>

      <div className="slider-track-wrap">
        <input
          type="range"
          min={0}
          max={ERAS.length - 1}
          value={idx}
          onChange={e => onChange(ERAS[Number(e.target.value)].id)}
          className="slider-input"
          style={{ '--thumb-color': showAll ? '#aab0cc' : ERAS[idx].color }}
          disabled={showAll}
        />
        <div className="slider-ticks">
          {ERAS.map((era, i) => (
            <button
              key={era.id}
              className={`slider-tick ${era.id === selectedEra && !showAll ? 'active' : ''}`}
              style={{
                left: `${(i / (ERAS.length - 1)) * 100}%`,
                '--era-color': era.color,
              }}
              onClick={() => onChange(era.id)}
              title={`${era.label} · ${era.range}`}
            >
              <span className="tick-dot" />
              <span className="tick-label">{era.label}</span>
              <span className="tick-range">{era.range}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
