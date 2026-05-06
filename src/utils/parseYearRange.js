/**
 * Parse a civilizations dateRange string into a [startYear, endYear] pair.
 * Years are signed integers: negative = BCE, positive = CE.
 *
 * Handles formats:
 *   "70,000+ BCE"       → [-70000, 0]
 *   "3500–2000 BCE"     → [-3500, -2000]
 *   "600 BCE–400 CE"    → [-600, 400]
 *   "793–1100 CE"       → [793, 1100]
 *   "500 BCE–476 CE"    → [-500, 476]
 */
export function parseYearRange(dateRange) {
  if (!dateRange) return [-10000, 2000]
  // normalise separators
  const s = dateRange.replace(/,/g, '').replace(/[–\u2013]/g, '-').trim()

  // "70000+ BCE"
  const pre = s.match(/^(\d+)\+\s*BCE/i)
  if (pre) return [-parseInt(pre[1]), 0]

  // "600 BCE-400 CE"
  const cross = s.match(/^(\d+)\s*BCE\s*-\s*(\d+)\s*CE/i)
  if (cross) return [-parseInt(cross[1]), parseInt(cross[2])]

  // "3500-2000 BCE"
  const bce = s.match(/^(\d+)\s*-\s*(\d+)\s*BCE/i)
  if (bce) return [-parseInt(bce[1]), -parseInt(bce[2])]

  // "100-700 CE"
  const ce = s.match(/^(\d+)\s*-\s*(\d+)\s*CE/i)
  if (ce) return [parseInt(ce[1]), parseInt(ce[2])]

  // bare "X-Y" fallback — treat as CE
  const plain = s.match(/^(\d+)\s*-\s*(\d+)/)
  if (plain) return [parseInt(plain[1]), parseInt(plain[2])]

  return [-10000, 2000]
}

export function formatYear(y) {
  if (y === 0) return '1 CE'
  if (y < 0) return `${Math.abs(y).toLocaleString()} BCE`
  return `${y.toLocaleString()} CE`
}

// Which era a given year falls into (for starfield/UI color purposes)
export function yearToEra(y) {
  if (y < -3000) return 'prehistoric'
  if (y < -1200) return 'bronze-age'
  if (y < -500)  return 'iron-age'
  if (y < 500)   return 'classical'
  return 'medieval'
}
