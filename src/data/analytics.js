const KEY = 'omm-analytics'

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}') } catch { return {} }
}
function save(d) {
  try { localStorage.setItem(KEY, JSON.stringify(d)) } catch {}
}

export function trackCiv(id) {
  const d = load()
  d.civs = d.civs || {}
  d.civs[id] = (d.civs[id] || 0) + 1
  save(d)
}

export function trackTheme(theme) {
  const d = load()
  d.themes = d.themes || {}
  d.themes[theme] = (d.themes[theme] || 0) + 1
  save(d)
}

export function getStats() {
  const d = load()
  const topCivs   = Object.entries(d.civs   || {}).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const topThemes = Object.entries(d.themes  || {}).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const totalViews = Object.values(d.civs || {}).reduce((a, b) => a + b, 0)
  return { topCivs, topThemes, totalViews }
}
