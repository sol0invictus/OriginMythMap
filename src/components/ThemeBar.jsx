import { THEME_SHORTCUTS, civilizations } from '../data/civilizations'
import { myths } from '../data/myths'

// Count how many civs match each theme
const themeCounts = Object.fromEntries(
  THEME_SHORTCUTS.map(({ theme }) => [
    theme,
    civilizations.filter(c => myths[c.mythId]?.themes?.includes(theme)).length,
  ])
)

export default function ThemeBar({ filterTheme, onThemeFilter }) {
  return (
    <div className="theme-bar">
      <span className="theme-bar-label">Quick themes</span>
      <div className="theme-bar-buttons">
        {THEME_SHORTCUTS.map(({ theme, label, icon }) => (
          <button
            key={theme}
            className={`theme-shortcut ${filterTheme === theme ? 'active' : ''}`}
            onClick={() => onThemeFilter(filterTheme === theme ? null : theme)}
            title={`${label} — ${themeCounts[theme]} civilizations`}
          >
            <span className="shortcut-icon">{icon}</span>
            <span className="shortcut-label">{label}</span>
            <span className="shortcut-count">{themeCounts[theme]}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
