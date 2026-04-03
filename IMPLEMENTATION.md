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
- [ ] **Theme constellation panel** — deferred to Phase 7 (D3-style network graph, significant effort)

## Phase 7 — Visual Polish
_Goal: make the map feel like a living artifact, not a data tool._

- [ ] **Starfield background** — subtle animated star/particle canvas behind the Leaflet map for
      the prehistoric and ancient eras
- [ ] **Region pulse on load** — newly loaded era regions animate in with a brief glow/expand
      rather than just a fade
- [ ] **Era color gradient on slider** — fill the slider track with a gradient of all era colors
      left to right
- [ ] **Popup slide-in animation** — popup animates in from the bottom (mobile) or from the right
      (desktop) rather than appearing instantly
- [ ] **Custom map marker** for the selected/open civilization (small glowing dot at centroid)
- [ ] **Dark mode / sepia mode toggle** — sepia palette for an aged-map aesthetic

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

## Phase 9 — Migration Paths
_Goal: overlay the human migration routes that carried origin myths across the world — showing
not just where a civilization was, but where its people came from and who they influenced._

**Data model** — add a `migrations.js` data file:
```js
{
  id: 'out-of-africa',
  label: 'Out of Africa',
  dateRange: '70,000–50,000 BCE',
  description: 'The dispersal of anatomically modern humans from East Africa...',
  waypoints: [          // ordered [lat, lng] stops along the route
    [-3, 36],           // East Africa (origin)
    [15, 43],           // Arabian Peninsula
    [27, 57],           // Persian Gulf coast
    [25, 70],           // Indus Valley corridor
    [22, 100],          // Southeast Asia
    [-10, 130],         // Sahul (Australia)
  ],
  relatedCivIds: ['san-people', 'aboriginal-australia'],
  era: 'prehistoric',
}
```

**UI / rendering:**
- [x] Animated dashed arrows with arrowheads per segment, flowing in travel direction
- [x] Glow backing on each segment; pulsing origin dot at route start
- [x] Wide invisible hit-target per segment (pointer-events: visibleStroke) for easy clicking
- [x] Hover tooltip showing route name + date range in route color
- [x] Clicking opens MigrationPopup with description, myth-connection callout, and links to related civs
- [x] "Migration Paths" toggle in header — era-aware (shows routes matching current era, or all when showAll)
- [x] Routes redraw on map pan/zoom via stable `drawMigrRef` pattern

**Routes implemented (8 total):**
- [x] Out of Africa (prehistoric) — East Africa → Arabian Peninsula → South Asia → SE Asia → Australia
- [x] Peopling of the Americas (prehistoric) — Siberia → Beringia → Pacific coast → South America
- [x] Indo-European dispersal — eastern arc (ancient) — Pontic steppe → Persia → Vedic India
- [x] Indo-European dispersal — western arc (ancient) — Pontic steppe → Greece → Rome → Celtic → Norse → Slavic
- [x] Austronesian expansion (ancient/classical/medieval) — Taiwan → Philippines → Indonesia → Hawaii → New Zealand
- [x] Bantu expansion (ancient/classical) — Central Africa → East Africa → Southern Africa
- [x] Silk Road (classical/medieval) — Chang'an → Central Asia → Persia → Rome
- [x] Arab maritime routes (medieval) — Arabian Peninsula → East Africa + South Asia → SE Asia

**Why this matters for the myth map:** Migration routes explain the structural similarities between
myths — why flood narratives appear on every continent, why the cosmic egg appears in both China
and Finland, why sacrifice myths span Mesoamerica and South Asia. Showing the routes alongside the
myths makes the connection geographic and visceral, not just academic.

## Phase 10 — Data & Infrastructure
- [ ] Split `myths.js` into per-civilization JSON files for lazy loading
- [ ] Add `relatedTexts` field to myths (primary source references with links)
- [ ] Wikipedia Commons image integration — `imageUrl` field in myth data, shown in popup banner
- [ ] Keyboard navigation — arrow keys to step through eras, Escape to close popup
- [ ] Offline support — service worker caching GeoJSON + myth data
- [ ] Analytics — track which civilizations and themes are most viewed
