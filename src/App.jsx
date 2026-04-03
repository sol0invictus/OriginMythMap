import { useState, useCallback, useEffect } from 'react'
import MapView from './components/MapView'
import TimeSlider from './components/TimeSlider'
import MythPopup from './components/MythPopup'
import Legend from './components/Legend'
import SearchBar from './components/SearchBar'
import AboutModal from './components/AboutModal'
import ThemeBar from './components/ThemeBar'
import MigrationPopup from './components/MigrationPopup'
import { civilizations } from './data/civilizations'

export default function App() {
  const [selectedEra, setSelectedEra] = useState('ancient')
  const [selectedCiv, setSelectedCiv] = useState(null)
  const [showAll, setShowAll] = useState(false)
  const [filterTheme, setFilterTheme] = useState(null)
  const [showAbout, setShowAbout] = useState(false)
  const [showMigrations, setShowMigrations] = useState(false)
  const [selectedMigration, setSelectedMigration] = useState(null)

  // On mount: check URL hash for a shared civilization link
  useEffect(() => {
    const id = window.location.hash.replace('#', '')
    if (id) {
      const civ = civilizations.find(c => c.id === id)
      if (civ) {
        setSelectedCiv(civ)
        setSelectedEra(civ.era)
      }
    }
  }, [])

  // Keep URL hash in sync with selected civ
  useEffect(() => {
    if (selectedCiv) {
      history.replaceState(null, '', `#${selectedCiv.id}`)
    } else {
      history.replaceState(null, '', window.location.pathname)
      document.title = 'Origin Myth Map'
    }
  }, [selectedCiv])

  const handleCivClick = useCallback((civ) => {
    setSelectedCiv(civ)
  }, [])

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

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1 className="app-title">Origin Myth Map</h1>
          <p className="app-subtitle">Creation stories from across the ancient world</p>
        </div>
        <div className="header-center">
          <SearchBar onSelect={handleCivClick} />
        </div>
        <div className="header-right">
          {filterTheme && (
            <div className="active-filter">
              <span>Theme: <strong>{filterTheme}</strong></span>
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
            className={`migration-toggle-btn ${showMigrations ? 'active' : ''}`}
            onClick={() => setShowMigrations(v => !v)}
            title="Toggle human migration routes"
          >
            ⟶ Migration Paths
          </button>
          <button className="about-btn" onClick={() => setShowAbout(true)} title="About this project">
            ?
          </button>
        </div>
      </header>

      <ThemeBar filterTheme={filterTheme} onThemeFilter={handleThemeFilter} />

      <main className="app-main">
        <MapView
          selectedEra={selectedEra}
          onCivClick={handleCivClick}
          showAll={showAll}
          filterTheme={filterTheme}
          showMigrations={showMigrations}
          onMigrationClick={setSelectedMigration}
        />
        <Legend
          selectedEra={selectedEra}
          onEraClick={handleEraChange}
          showAll={showAll}
          filterTheme={filterTheme}
        />
      </main>

      <footer className="app-footer">
        <TimeSlider
          selectedEra={selectedEra}
          onChange={handleEraChange}
          showAll={showAll || !!filterTheme}
        />
      </footer>

      {selectedCiv && (
        <MythPopup
          civilization={selectedCiv}
          onClose={handleClose}
          onCivSelect={handleCivClick}
          onThemeFilter={handleThemeFilter}
        />
      )}

      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}

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
