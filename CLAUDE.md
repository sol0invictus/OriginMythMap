# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Definition

**Origin Myth Map** is an interactive world map website that visualizes creation/origin myths from civilizations across human history. Users navigate a globe, move through time via an era slider, click highlighted regions to read myths, filter by theme, and search across all content.

Primary axis: **time (era)**. Regions are filtered/highlighted by era using a timeline slider.

**Current status:** Phases 1–5 complete. 24 civilizations, 5 eras, full myth content, theme filtering, search, share links, animated transitions, about modal, and typography polish. See [IMPLEMENTATION.md](./IMPLEMENTATION.md) for the full roadmap.

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
    MapView.jsx      # Leaflet map — GeoJSON layers, animated overlay transitions
    TimeSlider.jsx   # era slider — 5 stops, drives selectedEra state
    MythPopup.jsx    # full-screen overlay: summary, full text, themes, cross-refs, share
    Legend.jsx       # right-side panel — era list or theme-filter mode
    SearchBar.jsx    # ranked search across name, myth title, themes, region
    AboutModal.jsx   # project info modal
  data/
    civilizations.js # ERAS array + civilizations array (id, name, era, dateRange, mythId, region)
    myths.js         # myth content keyed by civilization id
  App.jsx            # root: selectedEra, selectedCiv, showAll, filterTheme, showAbout state
  index.css          # all styles — dark theme, Cinzel + EB Garamond fonts
public/
  geojson/           # one .json file per civilization id (approximate historical polygons)
```

**Key data flow:**
`TimeSlider` → `selectedEra` in `App` → `MapView` fetches & renders GeoJSON layers (with fade transition) → click opens `MythPopup` → theme tag click sets `filterTheme` → `MapView` re-filters to matching civilizations.

**Map layer management:** Leaflet is controlled imperatively through `mapInstanceRef` and `layersRef` (both `useRef`). The overlay pane's CSS opacity is animated to fade out/in during layer swaps. Never use `react-leaflet` — the map is initialized once in a `useEffect` with an empty dependency array.

## Data Model

**Civilization entry** (`src/data/civilizations.js`):
```js
{
  id: "sumer",           // matches GeoJSON filename and myth key
  name: "Sumer",
  era: "ancient",        // prehistoric | ancient | classical | medieval | early-modern
  dateRange: "3500–2000 BCE",
  mythId: "sumer",       // key into myths.js
  region: "Middle East"
}
```

**Myth entry** (`src/data/myths.js`):
```js
{
  id: "sumer",
  title: "Enuma Elish",
  civilization: "Sumer / Babylon",
  dateRange: "3500–2000 BCE",
  summary: "...",        // 2–3 sentences shown in popup header
  fullText: "...",       // multi-paragraph; split on \n\n for rendering
  themes: ["water", "chaos", "battle"]
}
```

**Adding a new civilization:**
1. Add entry to `civilizations` array in `civilizations.js`
2. Add myth entry to `myths.js`
3. Create `public/geojson/<id>.json` (GeoJSON Feature with approximate polygon)
4. Add glyph to `getGlyph()` in `MythPopup.jsx`

## Eras

| Key | Label | Range |
|---|---|---|
| prehistoric | Prehistoric | Before 3000 BCE |
| ancient | Ancient | 3000–500 BCE |
| classical | Classical | 500 BCE–500 CE |
| medieval | Medieval | 500–1500 CE |
| early-modern | Early Modern | 1500–1800 CE |

## Themes

Themes are free-form lowercase strings on myth entries. Current themes in use include:
`water`, `chaos`, `sacrifice`, `creation-from-body`, `cosmic-egg`, `void`, `fire`, `sun`, `sky-earth`, `flood`, `cycles`, `trickster`, `underworld`, `hero`, `tree`, `serpent`, `word-creation`, `earth-diver`, `twins`, `darkness`, `dance`, `ancestors`, `land`, `dualism`, `transformation`, `ages`.

Theme filtering works by matching `myth.themes.includes(filterTheme)` — keep themes lowercase and hyphenated.
