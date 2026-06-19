import { useState, useCallback, useEffect } from 'react'
import MapView from './components/MapView'
import TimeSlider from './components/TimeSlider'
import MythPopup from './components/MythPopup'
import Legend from './components/Legend'
import SearchBar from './components/SearchBar'
import AboutModal from './components/AboutModal'
import ThemeBar from './components/ThemeBar'
import MigrationPopup from './components/MigrationPopup'
import ConstellationView from './components/ConstellationView'
import CompareView from './components/CompareView'
import EraInfoCard from './components/EraInfoCard'
import { civilizations, ERAS } from './data/civilizations'
import { myths } from './data/myths'
import { yearToEra } from './utils/parseYearRange'
import { trackCiv, trackTheme } from './data/analytics'

// Computed once from static data
const ALL_THEME_COUNT = new Set(civilizations.flatMap(c => myths[c.mythId]?.themes ?? [])).size
function pickRandomCiv(excludeId = null) {
  const pool = civilizations.filter(c => c.id !== excludeId)
  return pool[Math.floor(Math.random() * pool.length)]
}

// Find the pair of civs (from different regions) that share the most themes.
// Returns [idA, idB] picked randomly from the top 25 such pairs.
function pickSurprisePair(excludePair = null) {
  const eligible = civilizations.filter(c => myths[c.mythId]?.themes?.length)
  const pairs = []
  for (let i = 0; i < eligible.length; i++) {
    for (let j = i + 1; j < eligible.length; j++) {
      const a = eligible[i], b = eligible[j]
      if (a.region === b.region) continue
      const shared = myths[a.mythId].themes.filter(t => myths[b.mythId].themes.includes(t))
      if (shared.length >= 2) pairs.push({ a, b, n: shared.length })
    }
  }
  pairs.sort((x, y) => y.n - x.n)
  const pool = pairs.slice(0, 25).filter(p =>
    !excludePair || !(
      (p.a.id === excludePair[0] && p.b.id === excludePair[1]) ||
      (p.a.id === excludePair[1] && p.b.id === excludePair[0])
    )
  )
  if (!pool.length) return null
  const pick = pool[Math.floor(Math.random() * pool.length)]
  return [pick.a.id, pick.b.id]
}

export default function App() {
  const [selectedEra, setSelectedEra] = useState('bronze-age')
  const [selectedCiv, setSelectedCiv] = useState(null)
  const [showAll, setShowAll] = useState(false)
  const [filterTheme, setFilterTheme] = useState(null)
  const [showAbout, setShowAbout] = useState(false)
  const [showMigrations, setShowMigrations] = useState(false)
  const [selectedMigration, setSelectedMigration] = useState(null)
  const [showConstellation, setShowConstellation] = useState(false)
  // Phase 12: compare state
  const [compareCivs, setCompareCivs] = useState(null)   // [idA, idB] | null
  const [pendingCompare, setPendingCompare] = useState(null) // civId | null
  const [compareSelect, setCompareSelect] = useState(false)  // "pick two" mode active
  // Theme — light by default, persisted; applied to <html data-theme>
  const [theme, setTheme] = useState(() => localStorage.getItem('omm-theme') || 'light')
  // Phase 13: timeline + influence state
  const [timelineMode] = useState(true)
  const [timelineYear, setTimelineYear] = useState(-2000)
  const [showInfluences, setShowInfluences] = useState(false)
  const [eraInfoId, setEraInfoId] = useState(null)
  const [showHint, setShowHint] = useState(() => !localStorage.getItem('omm-visited'))

  const dismissHint = useCallback(() => {
    setShowHint(false)
    localStorage.setItem('omm-visited', '1')
  }, [])

  // Apply + persist theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('omm-theme', theme)
  }, [theme])
  const toggleTheme = useCallback(() => setTheme(t => (t === 'light' ? 'dark' : 'light')), [])

  // On mount: check URL hash — single civ (#id) or compare pair (#idA+idB)
  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (!hash) return
    if (hash.includes('+')) {
      const [id1, id2] = hash.split('+')
      const c1 = civilizations.find(c => c.id === id1)
      const c2 = civilizations.find(c => c.id === id2)
      if (c1 && c2) { setCompareCivs([id1, id2]); return }
    }
    const civ = civilizations.find(c => c.id === hash)
    if (civ) { setSelectedCiv(civ); setSelectedEra(civ.era) }
  }, [])

  // Keep URL hash in sync
  useEffect(() => {
    if (compareCivs) {
      history.replaceState(null, '', `#${compareCivs[0]}+${compareCivs[1]}`)
      document.title = 'Comparing Myths | Origin Myth Map'
    } else if (selectedCiv) {
      history.replaceState(null, '', `#${selectedCiv.id}`)
    } else {
      history.replaceState(null, '', window.location.pathname)
      document.title = 'Origin Myth Map'
    }
  }, [selectedCiv, compareCivs])

  // Analytics tracking
  useEffect(() => { if (selectedCiv)  trackCiv(selectedCiv.id) }, [selectedCiv])
  useEffect(() => { if (filterTheme)  trackTheme(filterTheme)  }, [filterTheme])

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        if (compareCivs) { setCompareCivs(null); return }
        if (pendingCompare || compareSelect) { setPendingCompare(null); setCompareSelect(false); return }
        if (selectedMigration) { setSelectedMigration(null); return }
        if (selectedCiv) { setSelectedCiv(null); return }
        if (showAbout) { setShowAbout(false); return }
        if (showConstellation) { setShowConstellation(false); return }
        return
      }
      if (selectedCiv || showAbout || selectedMigration || compareCivs || pendingCompare || compareSelect) return
      if (timelineMode) {
        if (e.key === 'ArrowRight') { setShowAll(false); setTimelineYear(y => Math.min(1800, y + 100)) }
        if (e.key === 'ArrowLeft')  { setShowAll(false); setTimelineYear(y => Math.max(-5000, y - 100)) }
        return
      }
      const idx = ERAS.findIndex(era => era.id === selectedEra)
      if (e.key === 'ArrowRight' && idx < ERAS.length - 1) handleEraChange(ERAS[idx + 1].id)
      if (e.key === 'ArrowLeft'  && idx > 0)               handleEraChange(ERAS[idx - 1].id)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [selectedCiv, showAbout, selectedMigration, selectedEra, compareCivs, pendingCompare, compareSelect, timelineMode])

  const handleCivClick = useCallback((civ) => {
    dismissHint()
    // Second pick of a compare pair → open the comparison
    if (pendingCompare && civ.id !== pendingCompare) {
      setCompareCivs([pendingCompare, civ.id])
      setPendingCompare(null)
      setCompareSelect(false)
      return
    }
    // First pick while in "choose two" mode
    if (compareSelect) {
      setPendingCompare(civ.id)
      return
    }
    setSelectedCiv(civ)
  }, [pendingCompare, compareSelect])

  // Begin single-civ compare selection flow (closes popup, waits for second pick)
  const handleStartCompare = useCallback((civId) => {
    setSelectedCiv(null)
    setCompareSelect(false)
    setPendingCompare(civId)
  }, [])

  // Header "Compare" — enter pick-two-civilizations mode
  const handleStartCompareFlow = useCallback(() => {
    setSelectedCiv(null)
    setSelectedMigration(null)
    setPendingCompare(null)
    setCompareSelect(true)
  }, [])

  const cancelCompareSelect = useCallback(() => {
    setPendingCompare(null)
    setCompareSelect(false)
  }, [])

  // Directly open compare view with two known civs
  const handleOpenCompare = useCallback((idA, idB) => {
    setSelectedCiv(null)
    setCompareCivs([idA, idB])
  }, [])

  const handleRandomMyth = useCallback(() => {
    const civ = pickRandomCiv(selectedCiv?.id)
    if (civ) handleCivClick(civ)
  }, [selectedCiv, handleCivClick])

  // Surprise Me: pick a random cross-cultural pair and open compare
  const handleSurpriseMe = useCallback(() => {
    const pair = pickSurprisePair(compareCivs)
    if (pair) setCompareCivs(pair)
  }, [compareCivs])


  const handleClose = useCallback(() => {
    setSelectedCiv(null)
  }, [])

  const handleEraChange = (eraId) => {
    setShowAll(false)
    setFilterTheme(null)
    setSelectedEra(eraId)
  }

  const handleThemeFilter = (theme) => {
    setFilterTheme(prev => prev === theme ? null : theme)
    setShowAll(false)
  }

  const handleShowAll = () => {
    setShowAll(v => !v)
    setFilterTheme(null)
  }

  // Scrubbing the timeline re-engages era filtering, so "All Eras" acts as a
  // momentary override the slider releases rather than a sticky state.
  const handleTimelineYear = useCallback((y) => {
    setShowAll(false)
    setTimelineYear(y)
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1 className="app-title">Origin Myth Map</h1>
          <div className="subtitle-row">
            <p className="app-subtitle">{civilizations.length} civilizations · {ERAS.length} eras · {ALL_THEME_COUNT} themes</p>
            <button className="random-myth-btn" onClick={handleRandomMyth} title="Open a random myth">Random</button>
          </div>
        </div>
        <div className="header-center">
          <SearchBar onSelect={handleCivClick} />
        </div>
        <div className="header-right">
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            aria-label="Toggle light/dark theme"
          >
            {theme === 'light' ? '☾' : '☀'}
          </button>
          {filterTheme && (
            <div className="active-filter">
              <span>
                Theme: <strong>{filterTheme}</strong>
                {' · '}
                <span className="filter-count">
                  {civilizations.filter(c => myths[c.mythId]?.themes?.includes(filterTheme)).length} civs
                </span>
              </span>
              <button onClick={() => setFilterTheme(null)}>✕</button>
            </div>
          )}
          <button
            className={`show-all-btn ${showAll ? 'active' : ''}`}
            onClick={handleShowAll}
            title="Show civilizations from all eras simultaneously"
          >
            All Eras
            <span className="show-all-indicator" />
          </button>
          <button
            className={`constellation-toggle-btn ${showConstellation ? 'active' : ''}`}
            onClick={() => setShowConstellation(v => !v)}
            title="Toggle the lines-of-influence network"
          >
            Network
          </button>
          <button
            className={`compare-surprise-header-btn ${compareSelect || pendingCompare ? 'active' : ''}`}
            onClick={handleStartCompareFlow}
            title="Pick two civilizations to compare side by side"
          >
            Compare
          </button>
          <button
            className={`migration-toggle-btn ${showMigrations ? 'active' : ''}`}
            onClick={() => setShowMigrations(v => !v)}
            title="Toggle human migration routes"
          >
            Migration Paths
          </button>
          <button
            className={`influence-toggle-btn ${showInfluences ? 'active' : ''}`}
            onClick={() => setShowInfluences(v => !v)}
            title="Toggle myth lineage arrows — documented cultural borrowing"
          >
            Lineage
          </button>
          <button className="about-btn" onClick={() => setShowAbout(true)} title="About this project">
            ?
          </button>
        </div>
      </header>

      <ThemeBar filterTheme={filterTheme} onThemeFilter={handleThemeFilter} />

      {/* Compare selection banner — first pick, then second pick */}
      {(pendingCompare || compareSelect) && (() => {
        const pCiv = pendingCompare ? civilizations.find(c => c.id === pendingCompare) : null
        return (
          <div className="compare-pending-banner">
            <span className="pending-text">
              {pCiv
                ? <>Now click a second civilization to compare with <strong>{pCiv.name}</strong></>
                : <>Click the first civilization to compare</>}
            </span>
            <button className="pending-cancel" onClick={cancelCompareSelect}>✕ Cancel</button>
          </div>
        )
      })()}

      <main className={`app-main${showConstellation ? ' constellation-mode' : ''}`}>
        <div className="view-panel view-panel-map">
          <MapView
            selectedEra={selectedEra}
            onCivClick={handleCivClick}
            showAll={showAll}
            filterTheme={filterTheme}
            showMigrations={showMigrations}
            onMigrationClick={setSelectedMigration}
            selectedCiv={selectedCiv}
            timelineYear={timelineMode ? timelineYear : null}
            showInfluences={showInfluences}
            theme={theme}
          />
          <Legend
            selectedEra={selectedEra}
            onEraClick={handleEraChange}
            showAll={showAll}
            filterTheme={filterTheme}
            timelineYear={timelineMode ? timelineYear : null}
            selectedCivId={selectedCiv?.id}
          />
          {showHint && (
            <div className="first-visit-hint">
              <div className="hint-body">
                <span className="hint-line">✦ Click any glowing region to explore its creation myth</span>
                <span className="hint-line">◎ Use the era slider below to travel through time</span>
              </div>
              <button className="hint-dismiss" onClick={dismissHint} aria-label="Dismiss">✕</button>
            </div>
          )}
        </div>
        <div className="view-panel view-panel-constellation">
          {showConstellation && (
            <ConstellationView
              filterTheme={filterTheme}
              onCivSelect={handleCivClick}
              onThemeFilter={handleThemeFilter}
            />
          )}
        </div>
      </main>

      <footer className="app-footer">
        <TimeSlider
          timelineYear={timelineYear}
          onTimelineYear={handleTimelineYear}
          onEraInfoClick={setEraInfoId}
        />
        <div className="app-byline">Sunny Guha</div>
      </footer>

      {selectedCiv && (
        <MythPopup
          civilization={selectedCiv}
          onClose={handleClose}
          onCivSelect={handleCivClick}
          onThemeFilter={handleThemeFilter}
          onStartCompare={handleStartCompare}
          onOpenCompare={handleOpenCompare}
        />
      )}

      {compareCivs && (
        <CompareView
          civIds={compareCivs}
          onClose={() => setCompareCivs(null)}
          onViewFull={(civ) => { setCompareCivs(null); setSelectedCiv(civ); setSelectedEra(civ.era) }}
          onSurpriseMe={handleSurpriseMe}
        />
      )}

      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}

      {eraInfoId && (
        <EraInfoCard
          eraId={eraInfoId}
          onClose={() => setEraInfoId(null)}
          onCivSelect={handleCivClick}
        />
      )}

      {selectedMigration && (
        <MigrationPopup
          migration={selectedMigration}
          onClose={() => setSelectedMigration(null)}
          onCivSelect={handleCivClick}
        />
      )}
    </div>
  )
}
