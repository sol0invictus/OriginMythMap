import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { civilizations, ERAS } from '../data/civilizations'
import { myths } from '../data/myths'
import { migrations } from '../data/migrations'
import { influences } from '../data/influences'
import { parseYearRange } from '../utils/parseYearRange'
import Starfield from './Starfield'

const TRANSITION_MS = 350

// Module-level cache: parsed GeoJSON survives unmount/remount and is shared
// across re-renders so timeline scrubbing doesn't re-fetch + re-parse.
const geoJsonCache = new Map()
const inflightFetches = new Map()
function loadGeoJson(civId) {
  if (geoJsonCache.has(civId)) return Promise.resolve(geoJsonCache.get(civId))
  if (inflightFetches.has(civId)) return inflightFetches.get(civId)
  const p = fetch(`/geojson/${civId}.json`)
    .then(r => r.json())
    .then(g => { geoJsonCache.set(civId, g); inflightFetches.delete(civId); return g })
    .catch(err => { inflightFetches.delete(civId); throw err })
  inflightFetches.set(civId, p)
  return p
}

const prefersReducedMotion = typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

function makeArcPath(pa, pb, idx) {
  const mx = (pa.x + pb.x) / 2
  const my = (pa.y + pb.y) / 2
  const dx = pb.x - pa.x
  const dy = pb.y - pa.y
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const bow = Math.min(len * 0.32, 110)
  const sign = idx % 2 === 0 ? -1 : 1
  const cpx = mx + (-dy / len) * bow * sign
  const cpy = my + (dx / len) * bow * sign
  return `M ${pa.x} ${pa.y} Q ${cpx} ${cpy} ${pb.x} ${pb.y}`
}

export default function MapView({
  selectedEra, onCivClick, showAll, filterTheme,
  showMigrations, onMigrationClick, selectedCiv,
  timelineYear, showInfluences, theme,
}) {
  const mapRef         = useRef(null)
  const mapInstanceRef = useRef(null)
  const tileLayerRef   = useRef(null)
  const paneRef        = useRef(null)
  const arcSvgRef      = useRef(null)
  const migSvgRef      = useRef(null)
  const calcArcsRef    = useRef(null)
  const drawMigrRef    = useRef(null)
  const layersRef      = useRef({})
  const layerMetaRef   = useRef({})
  const resonatingRef  = useRef(new Set())
  const infSvgRef           = useRef(null)
  const drawInfluRef        = useRef(null)
  const inflSourcesRef      = useRef(new Set())
  const inflSourceLayersRef = useRef({})
  const civMarkerRef        = useRef(null)
  const [hoveredCiv, setHoveredCiv]   = useState(null)
  const [hoveredMig, setHoveredMig]   = useState(null)
  const [hoveredInfl, setHoveredInfl] = useState(null)

  // ── Initialize map once ──────────────────────────────────────
  useEffect(() => {
    if (mapInstanceRef.current) return

    const map = L.map(mapRef.current, {
      center: [20, 10], zoom: 2, minZoom: 1, maxZoom: 8, zoomControl: true,
      worldCopyJump: false,
      // Smoother wheel/pinch zoom
      zoomSnap: 0.25,
      zoomDelta: 0.5,
      wheelPxPerZoomLevel: 100,
      wheelDebounceTime: 30,
      zoomAnimation: true,
      fadeAnimation: true,
      inertia: true,
      inertiaDeceleration: 2400,
    })

    // Fit the whole world, then lock minZoom so user can't zoom out past it
    map.fitBounds([[-75, -180], [75, 180]])
    map.setMinZoom(map.getZoom())

    // Tile layer is created/swapped by the theme effect below.

    mapInstanceRef.current = map
    paneRef.current = map.getPane('overlayPane')

    // SVG overlays live INSIDE Leaflet's custom panes (children of
    // .leaflet-map-pane which carries the CSS zoom-animation transform).
    // That way they scale and pan in perfect sync with the tiles — no
    // zoomanim hacks needed.  Coordinates are in layerPoint space so they
    // don't need to be redrawn during a pan or zoom animation; only after
    // the gesture ends (moveend / zoomend) do we redraw at updated coords.
    map.createPane('migPane');  map.getPane('migPane').style.zIndex  = '450'
    map.createPane('infPane');  map.getPane('infPane').style.zIndex  = '455'
    map.createPane('arcPane');  map.getPane('arcPane').style.zIndex  = '460'
    ;['migPane','infPane','arcPane'].forEach(p => {
      map.getPane(p).style.pointerEvents = 'none'
    })

    const migSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    migSvg.style.cssText = 'position:absolute;top:0;left:0;overflow:visible;pointer-events:none;'
    map.getPane('migPane').appendChild(migSvg)
    migSvgRef.current = migSvg

    const infSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    infSvg.style.cssText = 'position:absolute;top:0;left:0;overflow:visible;pointer-events:none;'
    map.getPane('infPane').appendChild(infSvg)
    infSvgRef.current = infSvg

    // Theme-arc SVG lives inside arcPane (a Leaflet pane) — using layerPoint
    // coords means it scales/translates in lockstep with tiles during the
    // CSS zoom-animation, instead of jumping at zoomend.
    const arcSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    arcSvg.style.cssText = 'position:absolute;top:0;left:0;overflow:visible;pointer-events:none;'
    map.getPane('arcPane').appendChild(arcSvg)
    arcSvgRef.current = arcSvg

    const onMoveEnd = () => {
      calcArcsRef.current?.()
      drawMigrRef.current?.()
      drawInfluRef.current?.()
    }
    map.on('moveend zoomend', onMoveEnd)

    const onResize = () => {
      map.fitBounds([[-75, -180], [75, 180]])
      map.setMinZoom(map.getZoom())
    }
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      migSvg.remove(); migSvgRef.current = null
      infSvg.remove(); infSvgRef.current = null
      arcSvg.remove(); arcSvgRef.current = null
      map.remove();    mapInstanceRef.current = null
    }
  }, [])

  // ── Tile layer: swap basemap to match light/dark theme ──
  // Light = a classical "physical atlas" look: Esri World Physical relief
  // (no labels) + a light Boundaries & Places overlay so we keep modern
  // country borders and names without an all-in-one atlas tile's clutter.
  // Dark = CARTO dark (keeps the cosmic feel). No API keys required.
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return
    // Tear down the previous basemap layer(s)
    if (tileLayerRef.current) {
      tileLayerRef.current.forEach(l => map.removeLayer(l))
      tileLayerRef.current = null
    }
    const esri = 'Tiles &copy; Esri'
    let layers
    if (theme === 'light') {
      const base = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}',
        { attribution: `${esri} &mdash; US National Park Service`, maxZoom: 8, noWrap: true, zIndex: 1 }
      )
      const labels = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places_Alternate/MapServer/tile/{z}/{y}/{x}',
        { attribution: esri, maxZoom: 13, noWrap: true, zIndex: 2 }
      )
      layers = [base, labels]
    } else {
      layers = [L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
        subdomains: 'abcd', maxZoom: 20, noWrap: true, zIndex: 1,
      })]
    }
    layers.forEach(l => l.addTo(map))
    tileLayerRef.current = layers
  }, [theme])

  // Track previous mode flags to decide whether to fade or to diff.
  const prevModeRef = useRef({ selectedEra: null, showAll: false, filterTheme: null })

  // ── Diff civilization layers + redraw theme arcs ─────────────
  useEffect(() => {
    const map  = mapInstanceRef.current
    const pane = paneRef.current
    const arcSvg = arcSvgRef.current
    if (!map || !pane) return

    // Compute the visible civ set under current state
    let visible
    if (filterTheme) {
      visible = civilizations.filter(c => myths[c.mythId]?.themes?.includes(filterTheme))
    } else if (timelineYear != null) {
      const MIN_YEAR = -5000
      visible = civilizations.filter(c => {
        const [start, end] = parseYearRange(c.dateRange)
        if (start < MIN_YEAR) return timelineYear <= MIN_YEAR
        return start <= timelineYear && timelineYear <= end
      })
    } else if (showAll) {
      visible = civilizations
    } else {
      visible = civilizations.filter(c => c.era === selectedEra)
    }

    const wideMode    = showAll || !!filterTheme
    const baseOpacity = wideMode ? 0.18 : 0.28
    const visibleIds  = new Set(visible.map(c => c.id))

    // A "mode change" (era/showAll/filterTheme) is a deliberate user action and
    // gets the dramatic crossfade. Timeline-year scrubs just diff inline.
    const prev = prevModeRef.current
    const isModeChange = prev.selectedEra !== selectedEra ||
                         prev.showAll !== showAll ||
                         prev.filterTheme !== filterTheme
    prevModeRef.current = { selectedEra, showAll, filterTheme }

    function buildLayer(civ) {
      const eraColor = ERAS.find(e => e.id === civ.era)?.color || '#fff'
      let featureLayerRef = null

      const layer = L.geoJSON(geoJsonCache.get(civ.id), {
        style: { color: eraColor, weight: 2, fillColor: eraColor, fillOpacity: baseOpacity },
        onEachFeature: (_, fl) => {
          featureLayerRef = fl
          fl.on({
            mouseover: () => {
              fl.setStyle({ fillOpacity: 0.65, weight: 3 })
              setHoveredCiv(civ)
              const myThemes = myths[civ.mythId]?.themes || []
              Object.entries(layerMetaRef.current).forEach(([otherId, meta]) => {
                if (otherId === civ.id) return
                const otherCiv = civilizations.find(c => c.id === otherId)
                const otherThemes = myths[otherCiv?.mythId]?.themes || []
                if (!myThemes.some(t => otherThemes.includes(t))) return
                resonatingRef.current.add(otherId)
                meta.setStyle({ fillOpacity: meta.baseOpacity + 0.22, weight: 3 })
                meta.getEl()?.classList.add('resonating')
              })
            },
            mouseout: () => {
              const meta = layerMetaRef.current[civ.id]
              fl.setStyle({ fillOpacity: meta?.baseOpacity ?? baseOpacity, weight: 2 })
              setHoveredCiv(null)
              resonatingRef.current.forEach(id => {
                const m = layerMetaRef.current[id]
                if (!m) return
                m.setStyle({ fillOpacity: m.baseOpacity, weight: 2 })
                m.getEl()?.classList.remove('resonating')
              })
              resonatingRef.current.clear()
            },
            click: () => onCivClick(civ),
          })
        },
      }).addTo(map)

      layersRef.current[civ.id] = layer
      layerMetaRef.current[civ.id] = {
        setStyle: s => layer.setStyle(s),
        getEl:    () => featureLayerRef?.getElement?.(),
        baseOpacity, eraColor,
      }
      // Subtle fade-in for newly added layers
      const el = featureLayerRef?.getElement?.()
      if (el && !prefersReducedMotion) {
        el.style.opacity = '0'
        requestAnimationFrame(() => {
          el.style.transition = 'opacity 0.45s ease'
          el.style.opacity = '1'
        })
      }
    }

    function applyDiff() {
      // Remove civs that left the visible set
      Object.keys(layersRef.current).forEach(id => {
        if (visibleIds.has(id)) return
        const layer = layersRef.current[id]
        const el = layerMetaRef.current[id]?.getEl?.()
        delete layersRef.current[id]
        delete layerMetaRef.current[id]
        resonatingRef.current.delete(id)
        if (el && !prefersReducedMotion) {
          el.style.transition = 'opacity 0.3s ease'
          el.style.opacity = '0'
          setTimeout(() => { if (map.hasLayer(layer)) map.removeLayer(layer) }, 320)
        } else {
          if (map.hasLayer(layer)) map.removeLayer(layer)
        }
      })

      // Restyle remaining if baseOpacity changed, then add newcomers
      visible.forEach(civ => {
        const meta = layerMetaRef.current[civ.id]
        if (meta) {
          if (meta.baseOpacity !== baseOpacity) {
            meta.baseOpacity = baseOpacity
            meta.setStyle({ fillOpacity: baseOpacity })
          }
          return
        }
        // Ensure GeoJSON is in cache, then build
        loadGeoJson(civ.id)
          .then(() => {
            if (!mapInstanceRef.current) return
            // Skip if no longer visible (e.g. user scrubbed past quickly)
            if (!visibleIds.has(civ.id)) return
            if (layersRef.current[civ.id]) return
            buildLayer(civ)
          })
          .catch(err => console.warn(`GeoJSON load failed for ${civ.id}:`, err))
      })
    }

    function calcArcs() {
      const svg = arcSvgRef.current
      const map = mapInstanceRef.current
      if (!svg || !map) return
      while (svg.firstChild) svg.removeChild(svg.firstChild)
      if (!filterTheme) return

      const themed = civilizations.filter(c =>
        c.centroid && myths[c.mythId]?.themes?.includes(filterTheme)
      )
      if (themed.length < 2) return

      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
      defs.innerHTML = `<filter id="arc-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>`
      svg.appendChild(defs)

      let pairIdx = 0
      for (let i = 0; i < themed.length; i++) {
        for (let j = i + 1; j < themed.length; j++) {
          const a = themed[i], b = themed[j]
          // layerPoint coords → ride the pane's CSS transform during zoom
          const pa = map.latLngToLayerPoint(L.latLng(a.centroid[0], a.centroid[1]))
          const pb = map.latLngToLayerPoint(L.latLng(b.centroid[0], b.centroid[1]))

          const glow = document.createElementNS('http://www.w3.org/2000/svg', 'path')
          glow.setAttribute('d', makeArcPath(pa, pb, pairIdx))
          glow.setAttribute('fill', 'none')
          glow.setAttribute('stroke', '#c9981a')
          glow.setAttribute('stroke-width', '4')
          glow.setAttribute('stroke-opacity', '0.15')
          glow.setAttribute('filter', 'url(#arc-glow)')
          svg.appendChild(glow)

          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
          path.setAttribute('d', makeArcPath(pa, pb, pairIdx))
          path.setAttribute('fill', 'none')
          path.setAttribute('stroke', '#c9981a')
          path.setAttribute('stroke-width', '1.5')
          path.setAttribute('class', 'theme-arc')

          if (prefersReducedMotion) {
            path.setAttribute('stroke-opacity', '0.65')
          } else {
            path.setAttribute('stroke-opacity', '0')
            svg.appendChild(path)
            const len = path.getTotalLength()
            path.style.strokeDasharray  = len
            path.style.strokeDashoffset = len
            path.getBoundingClientRect()
            path.style.transition = `stroke-dashoffset 1.1s cubic-bezier(0.4,0,0.2,1) ${pairIdx * 60}ms, stroke-opacity 0.4s ease ${pairIdx * 60}ms`
            path.style.strokeOpacity    = '0.65'
            path.style.strokeDashoffset = '0'
          }
          if (prefersReducedMotion) svg.appendChild(path)

          ;[pa, pb].forEach(pt => {
            const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
            dot.setAttribute('cx', pt.x); dot.setAttribute('cy', pt.y)
            dot.setAttribute('r', '4'); dot.setAttribute('fill', '#c9981a')
            dot.setAttribute('fill-opacity', '0.7'); dot.setAttribute('class', 'arc-dot')
            svg.appendChild(dot)
          })
          pairIdx++
        }
      }
    }

    calcArcsRef.current = calcArcs

    if (isModeChange && !prefersReducedMotion) {
      // Mode change → dramatic crossfade
      pane.style.transition = `opacity ${TRANSITION_MS}ms ease`
      pane.style.opacity = '0'
      if (arcSvg) { arcSvg.style.transition = `opacity ${TRANSITION_MS}ms ease`; arcSvg.style.opacity = '0' }

      const timer = setTimeout(() => {
        // Tear everything down on mode change so we get a clean visual reset
        Object.values(layersRef.current).forEach(l => { if (map.hasLayer(l)) map.removeLayer(l) })
        layersRef.current = {}
        layerMetaRef.current = {}
        resonatingRef.current.clear()
        if (arcSvg) while (arcSvg.firstChild) arcSvg.removeChild(arcSvg.firstChild)

        applyDiff()

        requestAnimationFrame(() => {
          pane.style.opacity = '1'
          if (arcSvg) arcSvg.style.opacity = '1'
          calcArcs()
          pane.classList.add('pane-glow-in')
          setTimeout(() => pane.classList.remove('pane-glow-in'), 750)
        })
      }, TRANSITION_MS)

      return () => clearTimeout(timer)
    }

    // Timeline-year scrub or reduced-motion: diff in place, no full fade
    pane.style.opacity = '1'
    if (arcSvg) arcSvg.style.opacity = '1'
    applyDiff()
    calcArcs()
  }, [selectedEra, onCivClick, showAll, filterTheme, timelineYear])

  // ── Migration path rendering ──────────────────────────────────
  useEffect(() => {
    const map    = mapInstanceRef.current
    const migSvg = migSvgRef.current
    if (!map || !migSvg) return

    function drawMigrations() {
      while (migSvg.firstChild) migSvg.removeChild(migSvg.firstChild)
      if (!showMigrations) return

      const currentEra = timelineYear < -3000 ? 'prehistoric'
        : timelineYear < -1200 ? 'bronze-age'
        : timelineYear < -500  ? 'iron-age'
        : timelineYear < 500   ? 'classical' : 'medieval'
      const visible = showAll
        ? migrations
        : migrations.filter(m => m.eras.includes(currentEra))

      if (visible.length === 0) return

      // Build arrow marker defs — one per unique color
      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
      const seenColors = new Set()
      visible.forEach(({ color }) => {
        if (seenColors.has(color)) return
        seenColors.add(color)
        const safeId = color.replace('#', 'c')
        defs.innerHTML += `
          <marker id="arrow-${safeId}" markerWidth="6" markerHeight="6"
                  refX="5" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill="${color}" fill-opacity="0.85"/>
          </marker>`
      })
      migSvg.appendChild(defs)

      visible.forEach(migration => {
        const { waypoints, color } = migration
        if (waypoints.length < 2) return

        const safeId   = color.replace('#', 'c')
        const markerId = `arrow-${safeId}`
        const PERIOD_MS = 1600
        const elapsed   = performance.now() % PERIOD_MS

        function drawSvgSegment(pa, pb, withArrow) {
          const glow = document.createElementNS('http://www.w3.org/2000/svg', 'line')
          glow.setAttribute('x1', pa.x); glow.setAttribute('y1', pa.y)
          glow.setAttribute('x2', pb.x); glow.setAttribute('y2', pb.y)
          glow.setAttribute('stroke', color); glow.setAttribute('stroke-width', '5')
          glow.setAttribute('stroke-opacity', '0.12')
          migSvg.appendChild(glow)

          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
          line.setAttribute('x1', pa.x); line.setAttribute('y1', pa.y)
          line.setAttribute('x2', pb.x); line.setAttribute('y2', pb.y)
          line.setAttribute('stroke', color); line.setAttribute('stroke-width', '1.8')
          line.setAttribute('stroke-opacity', '0.75')
          line.setAttribute('stroke-dasharray', '8 14')
          line.setAttribute('stroke-linecap', 'round')
          if (withArrow) line.setAttribute('marker-end', `url(#${markerId})`)
          // Sync dash phase to wall-clock so pan/zoom redraws don't hitch
          line.style.animation = `migrate-flow ${PERIOD_MS}ms linear -${Math.round(elapsed)}ms infinite`
          migSvg.appendChild(line)

          const hit = document.createElementNS('http://www.w3.org/2000/svg', 'line')
          hit.setAttribute('x1', pa.x); hit.setAttribute('y1', pa.y)
          hit.setAttribute('x2', pb.x); hit.setAttribute('y2', pb.y)
          hit.setAttribute('stroke', 'transparent'); hit.setAttribute('stroke-width', '18')
          hit.style.cursor = 'pointer'; hit.style.pointerEvents = 'stroke'
          hit.addEventListener('mouseenter', () => setHoveredMig(migration))
          hit.addEventListener('mouseleave', () => setHoveredMig(null))
          hit.addEventListener('click', (e) => { e.stopPropagation(); onMigrationClick(migration) })
          migSvg.appendChild(hit)
        }

        for (let i = 0; i < waypoints.length - 1; i++) {
          const [latA, lngA] = waypoints[i]
          const [latB, lngB_raw] = waypoints[i + 1]
          const isLast = i === waypoints.length - 2

          // Normalize lngB to take the shorter arc from lngA (diff stays within ±180)
          let diff = lngB_raw - lngA
          while (diff > 180)  diff -= 360
          while (diff < -180) diff += 360
          const lngB = lngA + diff

          // Split at antimeridian if the adjusted path crosses ±180
          let subSegs
          if (lngB > 180) {
            const t = (180 - lngA) / (lngB - lngA)
            const latM = latA + t * (latB - latA)
            subSegs = [[latA, lngA, latM, 180], [latM, -180, latB, lngB_raw]]
          } else if (lngB < -180) {
            const t = (-180 - lngA) / (lngB - lngA)
            const latM = latA + t * (latB - latA)
            subSegs = [[latA, lngA, latM, -180], [latM, 180, latB, lngB_raw]]
          } else {
            subSegs = [[latA, lngA, latB, lngB]]
          }

          subSegs.forEach(([la, la_lng, lb, lb_lng], si) => {
            try {
              const pa = map.latLngToLayerPoint(L.latLng(la, la_lng))
              const pb = map.latLngToLayerPoint(L.latLng(lb, lb_lng))
              const withArrow = isLast && si === subSegs.length - 1
              drawSvgSegment(pa, pb, withArrow)
            } catch { /* coords off-screen */ }
          })
        }

        // Origin dot
        try {
          const origin = map.latLngToLayerPoint(L.latLng(waypoints[0][0], waypoints[0][1]))
          const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
          dot.setAttribute('cx', origin.x); dot.setAttribute('cy', origin.y)
          dot.setAttribute('r', '5'); dot.setAttribute('fill', color)
          dot.setAttribute('fill-opacity', '0.8')
          dot.setAttribute('class', 'migration-origin-dot')
          migSvg.appendChild(dot)
        } catch { /* skip */ }
      })

      // Keep SVG container pointer-events:none; hit-target children override via pointer-events:stroke
      migSvg.style.pointerEvents = 'none'
    }

    drawMigrRef.current = drawMigrations
    drawMigrations()
  }, [showMigrations, selectedEra, showAll, onMigrationClick, timelineYear])

  // ── Influence arrows ──────────────────────────────────────────
  useEffect(() => {
    const map    = mapInstanceRef.current
    const infSvg = infSvgRef.current
    if (!map || !infSvg) return

    const COLOR_CROSS  = '#c9a84c'  // gold — cross-era (N-1 → N)
    const COLOR_SAME   = '#d4704a'  // terracotta — same-era borrowing
    const COLOR_ORIGIN = '#6ec6e8'  // sky blue — originating region highlight
    const BOW_FACTOR   = 0.22
    const eraOrder     = ERAS.map(e => e.id)

    function civActiveAt(civ, year) {
      const [s, e] = parseYearRange(civ.dateRange)
      if (s < -5000) return year <= -5000
      return s <= year && year <= e
    }

    // ── Layer management (runs on state change, not pan/zoom) ────────

    // Reset previously re-styled layers
    inflSourcesRef.current.forEach(id => {
      const meta = layerMetaRef.current[id]
      if (meta) meta.setStyle({ fillColor: meta.eraColor, color: meta.eraColor, fillOpacity: meta.baseOpacity, weight: 2 })
    })
    inflSourcesRef.current.clear()

    // Remove temp layers added for out-of-era source civs
    Object.values(inflSourceLayersRef.current).forEach(l => map.removeLayer(l))
    inflSourceLayersRef.current = {}

    if (showInfluences) {
      const visibleInfl = influences.filter(infl => {
        const fromCiv = civilizations.find(c => c.id === infl.from)
        const toCiv   = civilizations.find(c => c.id === infl.to)
        if (!fromCiv || !toCiv) return false
        return civActiveAt(toCiv, timelineYear)
      })

      visibleInfl.forEach(infl => {
        const meta = layerMetaRef.current[infl.from]
        if (meta) {
          // Source civ already on map — restyle it sky-blue
          meta.setStyle({ fillColor: COLOR_ORIGIN, color: COLOR_ORIGIN, fillOpacity: 0.42, weight: 2.5 })
          inflSourcesRef.current.add(infl.from)
        } else if (!inflSourceLayersRef.current[infl.from]) {
          // Source civ not on map (earlier era) — fetch and add a temp layer
          const civ = civilizations.find(c => c.id === infl.from)
          if (!civ) return
          fetch(`/geojson/${civ.id}.json`)
            .then(r => r.json())
            .then(geojson => {
              if (!mapInstanceRef.current || inflSourceLayersRef.current[infl.from]) return
              const layer = L.geoJSON(geojson, {
                style: { color: COLOR_ORIGIN, weight: 2.5, fillColor: COLOR_ORIGIN, fillOpacity: 0.42 },
                onEachFeature: (_, fl) => {
                  fl.on({
                    mouseover: () => { fl.setStyle({ fillOpacity: 0.65, weight: 3 }); setHoveredCiv(civ) },
                    mouseout:  () => { fl.setStyle({ fillOpacity: 0.42, weight: 2.5 }); setHoveredCiv(null) },
                    click:     () => onCivClick(civ),
                  })
                },
              }).addTo(map)
              inflSourceLayersRef.current[infl.from] = layer
            })
            .catch(() => {})
        }
      })
    }

    // ── SVG arrow drawing (also called on pan/zoom via ref) ──────────

    function drawInfluences() {
      while (infSvg.firstChild) infSvg.removeChild(infSvg.firstChild)
      if (!showInfluences) return

      // Show an arrow when the destination civilization is active at the current year.
      const visible = influences.filter(infl => {
        const fromCiv = civilizations.find(c => c.id === infl.from)
        const toCiv   = civilizations.find(c => c.id === infl.to)
        if (!fromCiv || !toCiv) return false
        return civActiveAt(toCiv, timelineYear)
      })

      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
      defs.innerHTML = `
        <marker id="infl-arrow-cross" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto">
          <path d="M0,0 L0,6 L9,3 z" fill="${COLOR_CROSS}" fill-opacity="0.9"/>
        </marker>
        <marker id="infl-arrow-same" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="${COLOR_SAME}" fill-opacity="0.85"/>
        </marker>
        <filter id="infl-glow-cross" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="infl-glow-same" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>`
      infSvg.appendChild(defs)

      visible.forEach((infl, idx) => {
        const civA = civilizations.find(c => c.id === infl.from)
        const civB = civilizations.find(c => c.id === infl.to)
        if (!civA?.centroid || !civB?.centroid) return

        const fromIdx   = eraOrder.indexOf(civA.era)
        const toIdx     = eraOrder.indexOf(civB.era)
        const crossEra  = fromIdx < toIdx
        const color     = crossEra ? COLOR_CROSS : COLOR_SAME
        const markerId  = crossEra ? 'infl-arrow-cross' : 'infl-arrow-same'
        const glowId    = crossEra ? 'infl-glow-cross'  : 'infl-glow-same'
        const strokeW   = crossEra ? '2.2' : '1.5'
        const dashArray = crossEra ? 'none' : '4 6'
        const opacity   = crossEra ? '0.82' : '0.65'

        try {
          const pa = map.latLngToLayerPoint(L.latLng(civA.centroid[0], civA.centroid[1]))
          const pb = map.latLngToLayerPoint(L.latLng(civB.centroid[0], civB.centroid[1]))

          const mx = (pa.x + pb.x) / 2, my = (pa.y + pb.y) / 2
          const dx = pb.x - pa.x,       dy = pb.y - pa.y
          const len = Math.sqrt(dx * dx + dy * dy) || 1
          const bow = Math.min(len * BOW_FACTOR, 80)
          const sign = idx % 2 === 0 ? -1 : 1
          const cpx = mx + (-dy / len) * bow * sign
          const cpy = my + (dx / len) * bow * sign
          const d = `M ${pa.x} ${pa.y} Q ${cpx} ${cpy} ${pb.x} ${pb.y}`

          const glow = document.createElementNS('http://www.w3.org/2000/svg', 'path')
          glow.setAttribute('d', d); glow.setAttribute('fill', 'none')
          glow.setAttribute('stroke', color); glow.setAttribute('stroke-width', crossEra ? '5' : '3')
          glow.setAttribute('stroke-opacity', '0.12'); glow.setAttribute('filter', `url(#${glowId})`)
          infSvg.appendChild(glow)

          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
          path.setAttribute('d', d); path.setAttribute('fill', 'none')
          path.setAttribute('stroke', color); path.setAttribute('stroke-width', strokeW)
          path.setAttribute('stroke-opacity', opacity)
          if (dashArray !== 'none') path.setAttribute('stroke-dasharray', dashArray)
          path.setAttribute('marker-end', `url(#${markerId})`)
          infSvg.appendChild(path)

          const hit = document.createElementNS('http://www.w3.org/2000/svg', 'path')
          hit.setAttribute('d', d); hit.setAttribute('fill', 'none')
          hit.setAttribute('stroke', 'transparent'); hit.setAttribute('stroke-width', '14')
          hit.style.cursor = 'pointer'; hit.style.pointerEvents = 'stroke'
          hit.addEventListener('mouseenter', () => setHoveredInfl(infl))
          hit.addEventListener('mouseleave', () => setHoveredInfl(null))
          infSvg.appendChild(hit)
        } catch { /* skip if coords off-screen */ }
      })

      infSvg.style.pointerEvents = 'none'
    }

    drawInfluRef.current = drawInfluences
    drawInfluences()
  }, [showInfluences, timelineYear, showAll, selectedEra])

  // ── Idle ambient pulse ───────────────────────────────────────
  useEffect(() => {
    if (selectedCiv || filterTheme || showInfluences) return
    let timeoutId
    function pulse() {
      const ids = Object.keys(layerMetaRef.current)
      if (ids.length) {
        const id = ids[Math.floor(Math.random() * ids.length)]
        const el = layerMetaRef.current[id]?.getEl()
        if (el) {
          el.classList.add('idle-pulse')
          setTimeout(() => el.classList.remove('idle-pulse'), 2000)
        }
      }
      timeoutId = setTimeout(pulse, 3500 + Math.random() * 2500)
    }
    timeoutId = setTimeout(pulse, 2500)
    return () => clearTimeout(timeoutId)
  }, [selectedCiv, filterTheme, showInfluences])

  // ── Selected civilization glowing marker ─────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return
    if (civMarkerRef.current) { map.removeLayer(civMarkerRef.current); civMarkerRef.current = null }
    if (!selectedCiv?.centroid) return
    const [lat, lng] = selectedCiv.centroid
    const color = ERAS.find(e => e.id === selectedCiv.era)?.color || '#c9981a'
    civMarkerRef.current = L.circleMarker([lat, lng], {
      radius: 7,
      color: '#fff',
      weight: 2,
      fillColor: color,
      fillOpacity: 1,
      className: 'selected-civ-dot',
    }).addTo(map)
  }, [selectedCiv])

  const timelineEra = timelineYear != null
    ? (timelineYear < -3000 ? 'prehistoric' : timelineYear < -1200 ? 'bronze-age' : timelineYear < -500 ? 'iron-age' : timelineYear < 500 ? 'classical' : 'medieval')
    : null
  const showStarfield = !showAll && (
    (timelineYear == null && (selectedEra === 'prehistoric' || selectedEra === 'bronze-age')) ||
    (timelineYear != null && (timelineEra === 'prehistoric' || timelineEra === 'bronze-age'))
  )

  // Derive influence tooltip data outside JSX to keep it readable
  const inflFromCiv = hoveredInfl ? civilizations.find(c => c.id === hoveredInfl.from) : null
  const inflToCiv   = hoveredInfl ? civilizations.find(c => c.id === hoveredInfl.to)   : null
  const inflCrossEra = inflFromCiv && inflToCiv &&
    ERAS.findIndex(e => e.id === inflFromCiv.era) < ERAS.findIndex(e => e.id === inflToCiv.era)
  const inflColor = inflCrossEra ? '#c9a84c' : '#d4704a'
  // First sentence only for the tooltip
  const inflSnippet = hoveredInfl?.description.match(/[^.!?]+[.!?]/)?.[0] ?? ''

  const currentEra = ERAS.find(e => e.id === selectedEra)

  return (
    <div className="map-container">
      <Starfield active={showStarfield && theme !== 'light'} />
      <div ref={mapRef} className="leaflet-map" />
      {!showAll && (
        <div className="era-watermark" style={{ color: currentEra?.color }}>
          {currentEra?.label}
        </div>
      )}

      {hoveredCiv && !hoveredMig && !hoveredInfl && (
        <div className="map-tooltip">
          <strong>{hoveredCiv.name}</strong>
          <span>{hoveredCiv.dateRange}</span>
          <span className="tooltip-hint">Click to read origin myth</span>
        </div>
      )}

      {hoveredMig && (
        <div className="map-tooltip map-tooltip--migration" style={{ '--route-color': hoveredMig.color }}>
          <strong>{hoveredMig.label}</strong>
          <span>{hoveredMig.dateRange}</span>
          <span className="tooltip-hint">Click for details</span>
        </div>
      )}

      {hoveredInfl && !hoveredMig && (
        <div className="map-tooltip map-tooltip--influence">
          <strong>{hoveredInfl.label}</strong>
          <span style={{ color: inflColor }}>
            {inflFromCiv?.name} → {inflToCiv?.name}
          </span>
          {inflFromCiv?.region && (
            <span className="tooltip-region" style={{ color: '#6ec6e8' }}>Origin: {inflFromCiv.region}</span>
          )}
          <span>{inflSnippet}</span>
        </div>
      )}
    </div>
  )
}
