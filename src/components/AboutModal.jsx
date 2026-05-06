import { getStats } from '../data/analytics'
import { civilizations } from '../data/civilizations'
import { myths } from '../data/myths'

export default function AboutModal({ onClose }) {
  const { topCivs, topThemes, totalViews } = getStats()

  return (
    <div className="about-overlay" onClick={onClose}>
      <div className="about-modal" onClick={e => e.stopPropagation()}>
        <button className="myth-close" onClick={onClose} aria-label="Close">✕</button>

        <div className="about-header">
          <h2>Origin Myth Map</h2>
          <p className="about-tagline">A cartography of how humanity has explained itself</p>
        </div>

        <div className="about-body">
          <section>
            <h3>What is this?</h3>
            <p>
              An interactive world map of creation and origin myths — the stories civilizations
              told to explain where the universe, the earth, and humanity came from. Navigate
              through time using the era slider, click any highlighted region to read its myth,
              and use the theme filter to trace shared motifs across cultures.
            </p>
          </section>

          <section>
            <h3>Why origin myths?</h3>
            <p>
              Creation myths are among the most universal and revealing artifacts of any culture.
              They encode a civilization's deepest assumptions about the nature of reality, the
              relationship between humans and the cosmos, the origins of social order, and the
              meaning of suffering and death. Comparing them reveals both the extraordinary
              diversity of human imagination and its surprising convergences — flood myths,
              cosmic eggs, sky-earth separations, and creation-through-sacrifice appear across
              cultures with no known contact.
            </p>
          </section>

          <section>
            <h3>How to use it</h3>
            <ul>
              <li><strong>Era slider</strong> — move through five eras from Prehistoric to Early Modern</li>
              <li><strong>Click a region</strong> — opens the civilization's origin myth</li>
              <li><strong>Theme tags</strong> — click any tag (e.g. "sacrifice", "water") to filter the map to myths sharing that theme</li>
              <li><strong>All Eras</strong> — toggle in the header to see all civilizations at once, colored by era</li>
              <li><strong>Search</strong> — find by civilization name, myth title, theme, or region</li>
              <li><strong>Share</strong> — the URL updates when you open a myth; copy it to share a direct link</li>
            </ul>
          </section>

          <section>
            <h3>Sources & methodology</h3>
            <p>
              Myth summaries are drawn from primary sources and standard scholarly translations:
              the <em>Enuma Elish</em>, Hesiod's <em>Theogony</em>, the <em>Rigveda</em>,
              the <em>Popol Vuh</em> (Tedlock translation), the <em>Kojiki</em>, Snorri
              Sturluson's <em>Prose Edda</em>, the <em>Kumulipo</em>, and others.
              Geographic boundaries are approximate cultural regions, not political borders.
              Dates reflect the flourishing period of each tradition, not necessarily the
              date of earliest written record.
            </p>
          </section>

          <section>
            <h3>Coverage</h3>
            <div className="about-stats">
              <div className="about-stat"><span className="stat-num">24</span><span>Civilizations</span></div>
              <div className="about-stat"><span className="stat-num">5</span><span>Eras</span></div>
              <div className="about-stat"><span className="stat-num">6</span><span>Continents</span></div>
              <div className="about-stat"><span className="stat-num">40+</span><span>Themes</span></div>
            </div>
          </section>

          {totalViews > 0 && (
            <section>
              <h3>Your journey</h3>
              {topCivs.length > 0 && (
                <div className="analytics-row">
                  <span className="analytics-label">Most visited</span>
                  <div className="analytics-chips">
                    {topCivs.map(([id, count]) => {
                      const civ = civilizations.find(c => c.id === id)
                      return civ ? (
                        <span key={id} className="analytics-chip">
                          {civ.name}
                          <span className="analytics-count">{count}</span>
                        </span>
                      ) : null
                    })}
                  </div>
                </div>
              )}
              {topThemes.length > 0 && (
                <div className="analytics-row">
                  <span className="analytics-label">Top themes</span>
                  <div className="analytics-chips">
                    {topThemes.map(([theme, count]) => (
                      <span key={theme} className="analytics-chip">
                        {theme}
                        <span className="analytics-count">{count}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <p className="analytics-note">Stored locally in your browser. Never sent anywhere.</p>
            </section>
          )}

          <section className="about-footer-note">
            <p>
              This is a living project. Future additions will expand coverage, add historical
              map overlays, and cross-reference structural patterns across myth traditions.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
