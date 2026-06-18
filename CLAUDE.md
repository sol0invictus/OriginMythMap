# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Definition

**Origin Myth Map** is an interactive world map website that visualizes creation/origin myths from civilizations across human history. Users navigate a globe, move through time via an era slider, click highlighted regions to read myths, filter by theme, and search across all content.

Primary axis: **time (era)**. Regions are filtered/highlighted by era using a timeline slider.

**Current status:** 51 civilizations across 5 eras (Prehistoric → Medieval). Full myth content, theme filtering, search, share links, animated transitions, about modal, typography polish, SVG theme-arc overlays, hover resonance, theme shortcut bar, 8 animated migration routes, era-aware influence arrows, starfield background, sepia mode, force-directed constellation graph, comparative myth viewer, century-resolution timeline, offline service worker, localStorage analytics, first-visit hint, era watermark, and random myth button. See [IMPLEMENTATION.md](./IMPLEMENTATION.md) for the full roadmap.

## Tech Stack

- **React** (Vite) — UI framework
- **Leaflet.js** (vanilla, not react-leaflet) — interactive map engine; layers managed imperatively via refs
- **GeoJSON** — civilization boundary polygons in `public/geojson/`
- **JS modules** — myth and civilization data (`src/data/`) — no database yet

## Commands

```bash
npm install        # install dependencies
npm run dev        # start dev server (localhost:5173)
npm run build      # production build
npm run preview    # preview production build
```

## Architecture

```
src/
  components/
    MapView.jsx          # Leaflet map — GeoJSON layers, SVG arc overlays, migration routes,
                         #   influence arrows, starfield, selected-civ marker, era watermark
    TimeSlider.jsx       # era slider — 4 stops with era-gradient track, drives selectedEra state;
                         #   also a continuous century-resolution timeline mode (−5000 to 1800 CE)
    MythPopup.jsx        # full-screen overlay: summary, full text, themes, sources, cross-refs,
                         #   share, connections badge, compare trigger
    MigrationPopup.jsx   # overlay for a clicked migration route: description, myth-connection
                         #   callout, links to related civs
    CompareView.jsx      # side-by-side myth comparison: shared theme highlights, structural
                         #   parallels sidebar, URL state (#civA+civB), "Surprise me" button
    EraInfoCard.jsx      # full-screen modal with era historical context + civilization cards;
                         #   triggered by ⓘ on era slider ticks
    ConstellationView.jsx# three layouts via toggle: Cosmogenesis (cluster by creation archetype) +
                         #   Era Rings (concentric rings by era) share a theme-affinity star graph
                         #   (StarGraph); Network is the "Lines of Influence" lineage diagram
                         #   (LineageNetwork) — family lanes, time left→right, directional influence arrows
    Starfield.jsx        # animated star canvas shown on prehistoric/ancient eras (mix-blend-mode: screen)
    Legend.jsx           # right-side panel — era list or theme-filter mode; scrolls to active civ
    SearchBar.jsx        # ranked search across name, myth title, themes, region; `/` key to focus
    ThemeBar.jsx         # strip of 8 preset theme buttons below the header; shows civ count per theme
    AboutModal.jsx       # project info modal + "Your journey" analytics section
  data/
    civilizations.js     # ERAS array (4 eras) + civilizations array (44 civs)
    myths.js             # myth content keyed by civilization id; includes relatedTexts and imageUrl
    migrations.js        # 8 migration route entries (id, label, dateRange, eras[], color, waypoints)
    influences.js        # ~21 documented influence relationships between civs; drawn as era-aware
                         #   directional arrows (gold = cross-era, terracotta = same-era)
    eraInfo.js           # historical context paragraphs + key-development bullets for 4 eras
    analytics.js         # localStorage tracker: trackCiv(), trackTheme(), getStats()
  utils/
    parseYearRange.js    # parses dateRange strings → [startYear, endYear]; yearToEra(); formatYear()
  App.jsx                # root state — see App State section below
  index.css              # all styles — dark theme, Cinzel + EB Garamond fonts
public/
  geojson/               # one .json file per civilization id (approximate historical polygons)
  sw.js                  # service worker: cache-first for /geojson/, network-first for everything else
```

**Key data flow:**
`TimeSlider` → `selectedEra` in `App` → `MapView` fetches & renders GeoJSON layers (with fade transition) → click opens `MythPopup` → theme tag click sets `filterTheme` → `MapView` re-filters to matching civilizations.

**Migration routes:** `showMigrations` toggle in `App` → `MapView` draws animated dashed SVG arcs per route (via `drawMigrRef` pattern, redrawn on pan/zoom) → click opens `MigrationPopup`.

**Influence arrows:** `showInfluences` toggle → `MapView` draws era-filtered directional arcs from `influences.js`. When on era N (non-showAll mode), only arrows whose destination civ is in era N are shown. Cross-era arrows are gold/solid; same-era are terracotta/dashed. Hover shows source → target names + first sentence of description.

**Theme arcs:** When `filterTheme` is active, `MapView` draws animated SVG gold arcs between all civilization centroids sharing that theme; hovering a region pulses other visible civs sharing any theme with it.

**Constellation view:** `showConstellation` toggle in `App` (header button labelled "✦ Network") → `.view-panel` crossfade (CSS opacity transition, map never unmounts) → `ConstellationView`, which has a Layout toggle with three views:
- **Cosmogenesis** & **Era Rings** — the cosmic `StarGraph`: a theme-affinity star map (edges = shared themes) that either clusters nodes by creation archetype or arranges them in concentric era rings, with an animated morph between the two, era legend, hover resonance, and a first-mount "explode from centre" intro.
- **Network** — `LineageNetwork`, the "Lines of Influence" diagram: civilizations grouped into cultural "families" (connected components of `influences.js` via union-find), each a horizontal lane with x-position = era (time flows left→right) and directional gold arrows = documented influence. Civs with no documented influence appear in an "Independent traditions" grid below; a fixed era-axis header stays put while the body scrolls; hovering a node traces its lineage.

The whole view is always rendered on the dark palette regardless of theme (`.constellation-container` pins the dark CSS variables).

**Compare view:** `compareCivs` state (`[idA, idB] | null`) → `CompareView` modal with split panels, shared-theme highlights, and auto-generated structural parallels. URL hash `#civA+civB` syncs state; "Surprise me" picks the highest-shared-theme cross-region pair.

**App state:**
- `selectedEra` — active era key ('prehistoric' | 'ancient' | 'classical' | 'medieval')
- `selectedCiv` — currently open civilization object (drives MythPopup)
- `showAll` — show all eras simultaneously
- `filterTheme` — active theme filter string
- `showAbout` — AboutModal visibility
- `showMigrations` — migration arc overlay
- `selectedMigration` — clicked migration (drives MigrationPopup)
- `sepia` — sepia/aged-map mode
- `showConstellation` — constellation graph view
- `compareCivs` — `[idA, idB]` pair for CompareView, or null
- `pendingCompare` — civId awaiting a second click to form a compare pair
- `timelineMode` — century-resolution slider vs. 4-era step slider
- `timelineYear` — current year in timeline mode (−5000 to 1800)
- `showInfluences` — influence arrow overlay
- `eraInfoId` — era key for EraInfoCard modal, or null
- `showHint` — first-visit onboarding hint (persisted to localStorage key `omm-visited`)
- `compareSelect` — "pick two civilizations" mode triggered by the header Compare button; first map/graph click sets `pendingCompare`, second opens CompareView
- `theme` — `'light' | 'dark'`, default light, persisted to localStorage key `omm-theme` and applied as `data-theme` on `<html>` (also set pre-paint by an inline script in `index.html`). Light/dark swap CARTO `light_all`/`dark_all` tiles in MapView. The constellation view pins its own dark palette regardless of theme (`.constellation-container` redeclares the theme CSS variables).

**Map initialization:** Leaflet is controlled imperatively through `mapInstanceRef` and `layersRef` (both `useRef`). On mount: `map.fitBounds([[-75,-180],[75,180]])` sets the initial zoom so the full world fills the viewport; `map.setMinZoom(map.getZoom())` locks that as the floor. A `resize` listener recalculates on window resize. `worldCopyJump: false` and `noWrap: true` on the tile layer prevent duplicate world copies. Never use `react-leaflet`.

**Keyboard navigation:**
- Arrow keys step through eras (when no popup is open)
- `/` focuses the search bar from anywhere on the page
- Escape cascades: `selectedMigration` → `selectedCiv` → `showAbout` → `showConstellation`

## Data Model

**Civilization entry** (`src/data/civilizations.js`):
```js
{
  id: "sumer",           // matches GeoJSON filename and myth key
  name: "Sumer",
  era: "ancient",        // prehistoric | ancient | classical | medieval
  dateRange: "3500–2000 BCE",
  mythId: "sumer",       // key into myths.js
  region: "Middle East",
  centroid: [31.0, 46.5] // [lat, lng] for arrow/marker placement
}
```

**Myth entry** (`src/data/myths.js`):
```js
{
  id: "sumer",
  title: "Enuma Elish",
  civilization: "Sumer / Babylon",
  dateRange: "3500–2000 BCE",
  category: "chaos-combat", // one of the 8 MYTH_TYPES keys (see Myth categories)
  summary: "...",        // ~2 tight sentences (the gist) shown in popup header
  fullText: "...",       // multi-paragraph; split on \n\n for rendering
  themes: ["water", "chaos", "battle"], // canonical vocabulary only (see Themes)
  imageUrl: "",          // optional image URL shown in popup banner (Wikimedia Commons)
  relatedTexts: [        // primary sources shown in popup Sources section
    { title: "Enuma Elish", author: "Various", type: "Primary text", url: "https://..." }
  ]
}
```

**Influence entry** (`src/data/influences.js`):
```js
{
  id: "sumer-akkadian",
  from: "sumer",         // source civilization id
  to: "akkadian",        // destination civilization id
  theme: "flood",        // primary shared theme
  label: "Flood myth & creation",
  description: "..."     // 2–3 sentences; first sentence shown in hover tooltip
}
```

**Migration entry** (`src/data/migrations.js`):
```js
{
  id: "out-of-africa",
  label: "Out of Africa",
  dateRange: "70,000–50,000 BCE",
  eras: ["prehistoric"],          // eras in which this route is shown
  color: "#e8884a",
  description: "...",
  mythLink: "...",                // one-sentence connection to related myths
  relatedCivIds: ["san-people", "aboriginal-australia"],
  waypoints: [[-3, 36], ...],     // ordered [lat, lng] stops
}
```

**Adding a new civilization:**
1. Add entry to `civilizations` array in `civilizations.js` (include `centroid`)
2. Add myth entry to `myths.js` (include `category`, ~2-sentence `summary`, canonical `themes`, `relatedTexts`, `imageUrl: ""`)
3. Create `public/geojson/<id>.json` (GeoJSON Feature with approximate polygon)
4. Add glyph to `getGlyph()` in both `MythPopup.jsx` and `ConstellationView.jsx`
5. Optionally add influence entries to `influences.js`

## Eras

| Key | Label | Range |
|---|---|---|
| prehistoric | Prehistoric | Before 3000 BCE |
| bronze-age | Bronze Age | 3000–1200 BCE |
| iron-age | Iron Age | 1200–500 BCE |
| classical | Classical | 500 BCE–500 CE |
| medieval | Medieval | 500–1800 CE |

## Scope: world-origin myths only

Every civilization on the map must have a genuine **cosmogony** — a "how the world came to be" narrative. Cultures whose famous myth is the origin of a *dynasty, people, deity, crop, or the dead* (rather than the world), and cultures known only from archaeology with no recorded creation narrative, were deliberately removed. When a culture had a real but lesser-known world-creation myth, the entry uses that (e.g. Korea → the Changse-ga; Inuit → the Raven creation; Canaan/Phoenicia → Sanchuniathon's cosmic-egg cosmogony, not the Baal Cycle).

## Civilizations (51 total)

**Prehistoric (4):** Aboriginal Australia, San People, Siberian Shamanic (Evenki), Yupik / Inuit (Arctic)

**Bronze Age (6):** Sumer, Ancient Egypt, Nubia / Kush, Old Babylon, Yamnaya (Pontic Steppe), Akkadian Empire

**Iron Age (6):** Vedic India, Ancient Persia (Zoroastrian), Canaan / Phoenicia, Korea (Changse-ga), Ancient Israel (Genesis), Etruscan Civilization

**Classical (6):** Ancient Greece, Maya, Roman Empire, Yoruba, Han Dynasty China, Vietnam (Việt)

**Medieval (29):** Norse Scandinavia, Hindu Puranic, Japan Shinto, Slavic, Maori, Aztec, Inca, Haudenosaunee, Polynesia/Hawaii, Tibetan Bön/Buddhist, Mali Empire/Mande, Lakota, Guaraní, Navajo/Diné, Javanese, Dogon, Fon/Dahomey, Zulu/Nguni Bantu, Muisca, Mapuche, Finnish (Kalevala), Mongolia (Tengrist), Igbo, Hopi (Pueblo), Kuba/Bushongo, Cherokee, Akan / Ashanti, Ainu, Tagalog (Philippines)

## Myth categories (uniform typology)

Every myth carries exactly one `category` — a scholarly cosmogony type (after Eliade / Long / Weigle). The 8 types are defined once in `MYTH_TYPES` (`src/data/civilizations.js`) with a `label`, `tagline`, and `icon`, and shown as a badge in the myth popup:

| Key | Label | Gist |
|---|---|---|
| `chaos-combat` | Chaos & Combat | Cosmos wrested from a formless chaos / watery abyss, often through battle |
| `ex-nihilo` | Ex Nihilo & Sacred Word | A creator makes the world from nothing by word, thought, or breath |
| `world-parent` | World-Parent Separation | A primal sky-and-earth pair is parted to make room for the world |
| `cosmic-egg` | Cosmic Egg | The world hatches / unfolds from a primordial egg |
| `cosmic-sacrifice` | Cosmic Sacrifice | The world is formed from the body of a slain/sacrificed being |
| `earth-diver` | Earth-Diver | An animal dives into the primal waters to bring up the first earth |
| `emergence` | Emergence | Beings ascend through a series of lower worlds into this one |
| `ancestral-animist` | Ancestral & Animist | Creation as an ongoing presence — ancestral beings shape/inhabit a living world; also the home for cultures reconstructed from archaeology and ancestral-founding myths |

When adding a civilization, assign the single best-fit `category` by the dominant cosmogonic mechanism in its myth.

## Themes

Themes are lowercase, hyphenated strings on myth entries, drawn from a **canonical controlled vocabulary** (29 tags — do not invent one-off synonyms; map to the nearest existing tag):
`ancestors`, `animals`, `battle`, `chaos`, `cosmic-egg`, `creation-from-body`, `cycles`, `dualism`, `earth-diver`, `fertility`, `fire`, `flood`, `hero`, `kingship`, `land`, `maize`, `sacrifice`, `serpent`, `sky-earth`, `sun`, `trance`, `transformation`, `tree`, `trickster`, `twins`, `underworld`, `void`, `water`, `word-creation`.

Each myth uses ~3–6 of these. Theme filtering works by matching `myth.themes.includes(filterTheme)`. `THEME_SHORTCUTS` (the theme bar) references a subset of these keys, so keep them valid.

Summaries (`summary`) are kept to ~2 tight sentences — the gist shown in the popup — with the long-form narrative living in `fullText`.
