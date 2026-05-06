# Implementation Roadmap

## Phase 1 — Interactive Map Foundation ✅
- [x] Scaffold React + Vite project
- [x] Install react-leaflet, leaflet
- [x] Basic map component (dark CartoDB basemap) with zoom/pan on world view
- [x] Era time slider UI (5 eras: Prehistoric → Early Modern)
- [x] 8 civilizations across eras with GeoJSON polygon overlays
- [x] Region colored by era, hover highlight effect
- [x] Click popup with civilization name, date range, era badge
- [x] Legend panel (right side) listing civilizations per era

## Phase 2 — Myth Content Database ✅
- [x] Myth data schema (id, title, civilization, summary, fullText, themes)
- [x] Myth entries for 8 civilizations (Sumer, Egypt, Vedic India, Shang China, Greece, Maya, Norse, Aztec)
- [x] Full myth text with multi-paragraph narrative
- [x] Theme tags on myths (water, chaos, sacrifice, etc.)

## Phase 3 — Expanded Coverage ✅
- [x] 24 total civilizations across all 5 eras
  - Prehistoric: Aboriginal Australia (Dreamtime), San People (/Kaggen)
  - Ancient: Sumer, Egypt, Vedic India, Shang China, Zoroastrian Persia, Canaan, Nubia/Kush, Gojoseon Korea
  - Classical: Greece, Maya, Rome (Ovid), Celtic Gaul, Yoruba
  - Medieval: Norse, Hindu Puranic, Japan Shinto, Slavic, Maori
  - Early Modern: Aztec, Inca, Haudenosaunee, Polynesia/Hawaii
- [x] Era slider date range tooltip on hover
- [x] "Show all eras" toggle

## Phase 4 — Features ✅
- [x] Search by civilization name, myth title, theme, or region
- [x] Filter by theme tag — clicking a tag filters the map to all matching civilizations
- [x] Cross-reference panel in popup — up to 5 related myths sorted by shared theme count
- [x] Mobile-responsive layout — stacked header, bottom-sheet popup, large touch targets
- [x] Share link — URL hash (#civ-id) syncs on popup open; deep links auto-open the correct popup

## Phase 5 — Polish ✅
- [x] Animated era transitions — overlay pane fades out/in (350ms) on era/filter change
- [x] Dynamic document.title per open myth (SEO + meaningful browser history)
- [x] About modal — project explanation, sources, methodology, usage guide, stats
- [x] Typography — Cinzel (headers) + EB Garamond (body)
- [x] Illustration banner in popup — decorative glyph + era-colored gradient, ready for artwork
- [ ] Migrate data to SQLite or Supabase (deferred — JSON sufficient at current scale)

---

## Phase 6 — Theme Connections ✅
- [x] **Theme arc overlay** — animated SVG arcs (staggered draw, gold glow) between all civilization
      centroids sharing the active theme; dots pulse at each endpoint; arcs redraw on map pan/zoom
- [x] **Hover resonance** — hovering a region pulses all other visible regions that share any theme
      with it (CSS keyframe animation via `getElement()` class toggle)
- [x] **"Most connected" badge** — connections count displayed in popup illustration banner
- [x] **Theme shortcut bar** — strip below header with 8 pre-set themes (Water & Flood, Sacrifice,
      Cosmic Body, Primordial Void, Sacred Fire, Cosmic Egg, Sky & Earth, Sun & Moon); each shows
      civilization count; clicking toggles the theme filter
- [x] **Theme constellation panel** — implemented as Phase 11

## Phase 7 — Visual Polish ✅
_Goal: make the map feel like a living artifact, not a data tool._

- [x] **Starfield background** — subtle animated star/particle canvas behind the Leaflet map for
      the prehistoric and ancient eras
- [x] **Region pulse on load** — newly loaded era regions animate in with a brief glow/expand
      rather than just a fade
- [x] **Era color gradient on slider** — fill the slider track with a gradient of all era colors
      left to right
- [x] **Popup slide-in animation** — popup animates in from the bottom (mobile) or from the right
      (desktop) rather than appearing instantly
- [x] **Custom map marker** for the selected/open civilization (small glowing dot at centroid)
- [x] **Sepia mode toggle** — sepia palette for an aged-map aesthetic (button in header)

## Phase 8 — Expanded Civilizations
_Target: 50+ civilizations. Priority additions:_

- [ ] Olmec (Mesoamerica, prehistoric/ancient) — jaguar transformation myth
- [ ] Minoan / Mycenaean (classical Aegean) — labyrinth and bull god
- [ ] Hittite (ancient Anatolia) — Kumarbi cycle, the god-swallowing myth
- [ ] Ancient Ethiopia / Axum (classical) — Queen of Sheba, Ark of the Covenant origin
- [ ] Tibetan Buddhist (medieval) — Kalachakra / Shambhala cosmology
- [ ] Zulu (early modern) — Unkulunkulu and the first humans from reeds
- [ ] Inuit / Yupik (early modern) — Sedna and the creation of sea creatures
- [ ] Hopi (early modern, North America) — emergence through four worlds
- [ ] Lakota / Sioux (early modern) — White Buffalo Calf Woman and the sacred hoop
- [ ] Ancient Philippines (classical) — Bathala and the bamboo couple
- [ ] Siberian / Evenki (prehistoric) — shamanic earth-diver creation
- [ ] Akkadian / Babylonian (ancient) — separate entry from Sumer, Marduk-focused
- [ ] Celtic Ireland (medieval) — Tuatha De Danann separate from Gaul entry
- [ ] Ancient Indonesia / Java (medieval) — Batara Guru creation myth
- [ ] Dogon / Mali (medieval West Africa) — Nommo and the cosmic egg

## Phase 9 — Migration Paths ✅
_Goal: overlay the human migration routes that carried origin myths across the world._

- [x] Animated dashed arrows with arrowheads per segment, flowing in travel direction
- [x] Glow backing on each segment; pulsing origin dot at route start
- [x] Wide invisible hit-target per segment for easy clicking
- [x] Hover tooltip showing route name + date range in route color
- [x] Clicking opens MigrationPopup with description, myth-connection callout, and links to related civs
- [x] "Migration Paths" toggle in header — era-aware; routes live-track during pan/zoom (RAF-throttled)
- [x] Dash animation phase synced to wall-clock time so redraws don't cause visible resets
- [x] 8 routes: Out of Africa, Peopling of the Americas, Indo-European (east + west arcs), Austronesian expansion, Bantu expansion, Silk Road, Arab maritime routes

## Phase 10 — Data & Infrastructure
- [ ] Split `myths.js` into per-civilization JSON files for lazy loading
- [x] Add `relatedTexts` field to myths (primary source references with links)
- [x] Wikipedia Commons image integration — `imageUrl` field in myth data, shown in popup banner (UI ready; add image URLs to `myths.js` to activate)
- [x] Keyboard navigation — arrow keys to step through eras, Escape to close popup
- [x] Offline support — service worker (`public/sw.js`) caches GeoJSON files cache-first
- [x] Analytics — localStorage tracker for civ views and theme uses; "Your journey" section in About modal

---

## Phase 11 — Theme Constellation Panel ✅
_Goal: a dedicated view that shows the entire myth network as a force-directed graph — the "god's-eye view" of how all myths relate._

- [x] **Force-directed graph** — custom simulation (no d3 dependency); nodes sized by connection count; colors match era
- [x] **Toggle between map view and constellation view** — "✦ Constellation" button in header; smooth 350ms crossfade transition
- [x] **Interactive nodes** — hover highlights connected nodes and edges; unconnected nodes dim; click opens MythPopup
- [x] **Edge labels** — hover any edge to see the shared theme names in a tooltip at the midpoint
- [x] **Filter by theme** — active `filterTheme` dims non-matching nodes/edges; theme edges glow gold; works with ThemeBar
- [x] **Era ring layout option** — "◎ Era Rings" toggle places nodes on concentric circles by era; animated transition between layouts; dashed ring guides fade in

## Phase 12 — Comparative Myth Viewer ✅
_Goal: read two myths side-by-side to discover structural parallels — the academic core of the project._

- [x] **Split-panel view** — `CompareView.jsx`: two myth panels (left/right) with a center score strip; triggered by "↔ Compare" in each MythPopup header or "↔" button on each related-myth item; also accessible via "↔ Compare" in the app header
- [x] **Shared theme highlights** — themes present in both myths glow gold (`compare-theme-tag.shared`); themes unique to one myth are dimmed (`compare-theme-tag.unique`)
- [x] **Structural parallels sidebar** — auto-generated list of narrative parallels from a `THEME_PARALLELS` map (25 theme descriptions); shown below the panels; graceful "no shared themes" message when there is no overlap
- [x] **URL state** — `#civA+civB` hash format; parsed on mount to restore compare view; synced whenever `compareCivs` state changes
- [x] **"Surprise me" button** — `pickSurprisePair()` finds the top 25 cross-region pairs by shared theme count, picks randomly; available in both the compare modal header and the app header; excludes current pairing to always produce a new result
- [x] **Pending compare banner** — after clicking "↔ Compare" in a popup, an animated banner prompts "Click any civilization to compare with [Name]"; Escape or "Cancel" exits; clicking a map region completes the pairing

## Phase 13 — Timeline Deep Dive ✅
_Goal: make time a richer axis — show myth evolution, not just era placement._

- [x] **Century-resolution slider** — "⏱ Timeline" toggle in the slider footer switches from 5-era steps to a continuous year slider (−5000 to 1800 CE, step 100 years); era-color-gradient track with BCE/CE ruler ticks; arrow keys move in 100-year increments; MapView filters visible civs by date-range overlap using `parseYearRange()`; Legend shows civs active at current year; starfield follows the effective era
- [x] **Myth lineage arrows** — `src/data/influences.js` with 17 documented influence relationships (Sumer→Akkadian→Canaan, Hittite→Greece, Olmec→Maya→Aztec, Vedic→Zoroastrian, etc.); "↯ Lineage" toggle in header; dashed amber arcs with directional arrowheads drawn on a dedicated SVG layer (z:455), redrawn on pan/zoom; hover tooltip shows source → target civ names + description
- [x] **Era info cards** — `EraInfoCard.jsx`; clicking the ⓘ icon on any era tick in the slider opens a full-screen modal with historical context paragraph, key-developments bullet list, and clickable civilization cards for that era; `src/data/eraInfo.js` holds all content
- [x] **"Active centuries" bar** — `CenturiesBar` component in `Legend.jsx`; thin proportional bar under each civ name in the expanded era list, scaled against `ERA_YEAR_BOUNDS`; powered by `parseYearRange()`; `src/utils/parseYearRange.js` handles all dateRange string formats

## Phase 14 — Sound & Atmosphere
_Goal: subtle ambient audio that reinforces the ancient, geographic feel._

- [ ] **Era ambient tracks** — short looping audio clips (distant drums for prehistoric, temple bells for ancient, etc.); autoplay off by default, toggled via a speaker icon
- [ ] **Region hover sound** — soft, culturally appropriate tone when hovering a region (e.g. sitar drone for India, throat-singing for Central Asia); volume very low, opt-in
- [ ] **Transition sound** — brief wind/whoosh sound effect when changing eras
- [ ] All audio off by default; single mute/unmute toggle; no audio loads until user enables it

## Phase 15 — Social & Sharing
_Goal: make the project easy to share and cite._

- [ ] **Embed widget** — `<iframe>` embed code for any single civilization popup; shows myth summary + glyph, links back to the full map
- [ ] **Image export** — "Save as image" button renders the current map view + era + any active theme filter to a PNG (using `html2canvas` or Leaflet's built-in print plugin)
- [ ] **Citation helper** — "Cite this" button in each popup generates a formatted citation (MLA/APA/Chicago) for the myth content with the sources listed in `relatedTexts`
- [ ] **"Myth of the Day"** — random featured civilization on the landing page; rotates daily using a deterministic date-based seed so all visitors see the same one
