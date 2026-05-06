import { ERAS } from '../data/civilizations'
import { formatYear, yearToEra } from '../utils/parseYearRange'

const MIN_YEAR = -5000
const MAX_YEAR =  1800
const RANGE    = MAX_YEAR - MIN_YEAR

const TIMELINE_ERA_BOUNDS = [
  { start: MIN_YEAR, end: -3000,    era: 'prehistoric' },
  { start: -3000,    end: -1200,    era: 'bronze-age'  },
  { start: -1200,    end: -500,     era: 'iron-age'    },
  { start: -500,     end:  500,     era: 'classical'   },
  { start:  500,     end: MAX_YEAR, era: 'medieval'    },
]

function pct(year) { return ((year - MIN_YEAR) / RANGE) * 100 }

const TIMELINE_GRADIENT = (() => {
  const stops = []
  TIMELINE_ERA_BOUNDS.forEach(({ start, end, era }) => {
    const color = ERAS.find(e => e.id === era)?.color || '#888'
    stops.push(`${color} ${pct(start).toFixed(1)}%`)
    stops.push(`${color} ${pct(end).toFixed(1)}%`)
  })
  return `linear-gradient(to right, ${stops.join(', ')})`
})()

const RULER_TICKS = [-4000, -3000, -2000, -1000, 0, 500, 1000, 1500]

export default function TimeSlider({
  timelineYear, onTimelineYear, onEraInfoClick,
}) {
  const currentEra   = yearToEra(timelineYear)
  const currentColor = ERAS.find(e => e.id === currentEra)?.color || '#888'
  const currentLabel = ERAS.find(e => e.id === currentEra)?.label || ''

  // Position floating label directly above the thumb
  const thumbPct = ((timelineYear - MIN_YEAR) / RANGE) * 100
  const labelLeft = `calc(${thumbPct.toFixed(2)}% + ${(9 - thumbPct * 0.18).toFixed(2)}px)`

  return (
    <div className="time-slider-panel timeline-mode">
      <div className="slider-header">
        <span className="slider-title">TIMELINE</span>
        <span className="slider-era-label" style={{ color: currentColor }}>
          {formatYear(timelineYear)}
        </span>
        <button
          className="tick-info-btn"
          onClick={() => onEraInfoClick?.(currentEra)}
          title={`About the ${currentLabel} era`}
          style={{ marginLeft: 'auto' }}
        >
          ⓘ
        </button>
      </div>

      <div className="slider-track-wrap timeline-track-wrap">
        <div
          className="slider-thumb-label"
          style={{ left: labelLeft, color: currentColor }}
        >
          {currentLabel}
        </div>
        <input
          type="range"
          min={MIN_YEAR}
          max={MAX_YEAR}
          step={50}
          value={timelineYear}
          onChange={e => onTimelineYear(Number(e.target.value))}
          className="slider-input"
          style={{ '--thumb-color': currentColor, background: TIMELINE_GRADIENT }}
        />
        <div className="timeline-ruler">
          {RULER_TICKS.map(y => (
            <span
              key={y}
              className="timeline-ruler-tick"
              style={{ left: `${pct(y).toFixed(1)}%` }}
            >
              {y === 0 ? '0' : formatYear(y)}
            </span>
          ))}
        </div>
        {TIMELINE_ERA_BOUNDS.slice(1).map(({ start, era }) => {
          const color = ERAS.find(e => e.id === era)?.color || '#888'
          return (
            <span
              key={era}
              className="timeline-era-marker"
              style={{ left: `${pct(start).toFixed(1)}%`, '--era-color': color }}
            />
          )
        })}
      </div>
    </div>
  )
}
