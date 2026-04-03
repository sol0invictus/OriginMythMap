import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { civilizations, ERAS } from '../data/civilizations'
import { myths } from '../data/myths'
import { migrations } from '../data/migrations'

const TRANSITION_MS = 350

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
  showMigrations, onMigrationClick,
}) {
  const mapRef         = useRef(null)
  const mapInstanceRef = useRef(null)
  const paneRef        = useRef(null)
  const arcSvgRef      = useRef(null)
  const migSvgRef      = useRef(null)
  const calcArcsRef    = useRef(null)
  const drawMigrRef    = useRef(null)
  const layersRef      = useRef({})
  const layerMetaRef   = useRef({})
  const resonatingRef  = useRef(new Set())
  const [hoveredCiv, setHoveredCiv]   = useState(null)
  const [hoveredMig, setHoveredMig]   = useState(null)

  // ── Initialize map once ──────────────────────────────────────
  useEffect(() => {
    if (mapInstanceRef.current) return

    const map = L.map(mapRef.current, {
      center: [20, 10], zoom: 2, minZoom: 2, maxZoom: 8, zoomControl: true,
    })

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
      subdomains: 'abcd', maxZoom: 20,
    }).addTo(map)

    mapInstanceRef.current = map
    paneRef.current = map.getPane('overlayPane')

    // Migration SVG — below theme arcs, above polygons
    const migSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    migSvg.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:350;'
    mapRef.current.appendChild(migSvg)
    migSvgRef.current = migSvg

    // Theme arc SVG — topmost
    const arcSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    arcSvg.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:400;'
    mapRef.current.appendChild(arcSvg)
    arcSvgRef.current = arcSvg

    const onView = () => { calcArcsRef.current?.(); drawMigrRef.current?.() }
    map.on('moveend zoomend', onView)

    return () => {
      migSvg.remove(); migSvgRef.current = null
      arcSvg.remove(); arcSvgRef.current = null
      map.remove();    mapInstanceRef.current = null
    }
  }, [])

  // ── Rebuild civilization layers + theme arcs ─────────────────
  useEffect(() => {
    const map  = mapInstanceRef.current
    const pane = paneRef.current
    const arcSvg = arcSvgRef.current
    if (!map || !pane) return

    pane.style.transition = `opacity ${TRANSITION_MS}ms ease`
    pane.style.opacity = '0'
    if (arcSvg) { arcSvg.style.transition = `opacity ${TRANSITION_MS}ms ease`; arcSvg.style.opacity = '0' }

    const timer = setTimeout(() => {
      Object.values(layersRef.current).forEach(l => { if (map.hasLayer(l)) map.removeLayer(l) })
      layersRef.current = {}
      layerMetaRef.current = {}
      resonatingRef.current.clear()
      if (arcSvg) while (arcSvg.firstChild) arcSvg.removeChild(arcSvg.firstChild)

      let visible
      if (filterTheme) {
        visible = civilizations.filter(c => myths[c.mythId]?.themes?.includes(filterTheme))
      } else if (showAll) {
        visible = civilizations
      } else {
        visible = civilizations.filter(c => c.era === selectedEra)
      }

      const wideMode = showAll || !!filterTheme

      visible.forEach(civ => {
        const eraColor    = ERAS.find(e => e.id === civ.era)?.color || '#fff'
        const baseOpacity = wideMode ? 0.18 : 0.28

        fetch(`/geojson/${civ.id}.json`)
          .then(r => r.json())
          .then(geojson => {
            if (!mapInstanceRef.current) return
            let featureLayerRef = null

            const layer = L.geoJSON(geojson, {
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
                    fl.setStyle({ fillOpacity: baseOpacity, weight: 2 })
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
          })
          .catch(err => console.warn(`GeoJSON load failed for ${civ.id}:`, err))
      })

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

        const container = map.getContainer()
        svg.setAttribute('width',  container.offsetWidth)
        svg.setAttribute('height', container.offsetHeight)

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
            const pa = map.latLngToContainerPoint(L.latLng(a.centroid[0], a.centroid[1]))
            const pb = map.latLngToContainerPoint(L.latLng(b.centroid[0], b.centroid[1]))

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
            path.setAttribute('stroke-opacity', '0')
            path.setAttribute('class', 'theme-arc')
            svg.appendChild(path)

            const len = path.getTotalLength()
            path.style.strokeDasharray  = len
            path.style.strokeDashoffset = len
            path.getBoundingClientRect()
            path.style.transition = `stroke-dashoffset 1.1s cubic-bezier(0.4,0,0.2,1) ${pairIdx * 60}ms, stroke-opacity 0.4s ease ${pairIdx * 60}ms`
            path.style.strokeOpacity    = '0.65'
            path.style.strokeDashoffset = '0'

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

      requestAnimationFrame(() => {
        pane.style.opacity = '1'
        if (arcSvg) arcSvg.style.opacity = '1'
        calcArcs()
      })
    }, TRANSITION_MS)

    return () => clearTimeout(timer)
  }, [selectedEra, onCivClick, showAll, filterTheme])

  // ── Migration path rendering ──────────────────────────────────
  useEffect(() => {
    const map    = mapInstanceRef.current
    const migSvg = migSvgRef.current
    if (!map || !migSvg) return

    function drawMigrations() {
      while (migSvg.firstChild) migSvg.removeChild(migSvg.firstChild)
      if (!showMigrations) return

      const visible = showAll
        ? migrations
        : migrations.filter(m => m.eras.includes(selectedEra))

      if (visible.length === 0) return

      const container = map.getContainer()
      migSvg.setAttribute('width',  container.offsetWidth)
      migSvg.setAttribute('height', container.offsetHeight)

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
        const { waypoints, color, id } = migration
        if (waypoints.length < 2) return

        const pts = waypoints.map(([lat, lng]) => {
          try { return map.latLngToContainerPoint(L.latLng(lat, lng)) }
          catch { return null }
        }).filter(Boolean)

        if (pts.length < 2) return

        const safeId    = color.replace('#', 'c')
        const markerId  = `arrow-${safeId}`

        // Draw each segment separately so each gets its own arrowhead
        for (let i = 0; i < pts.length - 1; i++) {
          const pa = pts[i], pb = pts[i + 1]

          // Glow backing
          const glow = document.createElementNS('http://www.w3.org/2000/svg', 'line')
          glow.setAttribute('x1', pa.x); glow.setAttribute('y1', pa.y)
          glow.setAttribute('x2', pb.x); glow.setAttribute('y2', pb.y)
          glow.setAttribute('stroke', color)
          glow.setAttribute('stroke-width', '5')
          glow.setAttribute('stroke-opacity', '0.12')
          migSvg.appendChild(glow)

          // Animated dashed line
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
          line.setAttribute('x1', pa.x); line.setAttribute('y1', pa.y)
          line.setAttribute('x2', pb.x); line.setAttribute('y2', pb.y)
          line.setAttribute('stroke', color)
          line.setAttribute('stroke-width', '1.8')
          line.setAttribute('stroke-opacity', '0.75')
          line.setAttribute('stroke-dasharray', '8 14')
          line.setAttribute('stroke-linecap', 'round')
          line.setAttribute('marker-end', `url(#${markerId})`)
          line.setAttribute('class', 'migration-path')
          line.style.setProperty('--dash-period', '22')
          migSvg.appendChild(line)

          // Invisible hit-target line (wider, pointer-events enabled)
          const hit = document.createElementNS('http://www.w3.org/2000/svg', 'line')
          hit.setAttribute('x1', pa.x); hit.setAttribute('y1', pa.y)
          hit.setAttribute('x2', pb.x); hit.setAttribute('y2', pb.y)
          hit.setAttribute('stroke', 'transparent')
          hit.setAttribute('stroke-width', '18')
          hit.style.cursor = 'pointer'
          hit.style.pointerEvents = 'visibleStroke'
          hit.addEventListener('mouseenter', () => setHoveredMig(migration))
          hit.addEventListener('mouseleave', () => setHoveredMig(null))
          hit.addEventListener('click', (e) => { e.stopPropagation(); onMigrationClick(migration) })
          migSvg.appendChild(hit)
        }

        // Origin dot
        const origin = pts[0]
        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
        dot.setAttribute('cx', origin.x); dot.setAttribute('cy', origin.y)
        dot.setAttribute('r', '5'); dot.setAttribute('fill', color)
        dot.setAttribute('fill-opacity', '0.8')
        dot.setAttribute('class', 'migration-origin-dot')
        migSvg.appendChild(dot)
      })

      // Enable pointer events on the migration SVG container for hit targets
      migSvg.style.pointerEvents = 'none'
    }

    drawMigrRef.current = drawMigrations
    drawMigrations()
  }, [showMigrations, selectedEra, showAll, onMigrationClick])

  return (
    <div className="map-container">
      <div ref={mapRef} className="leaflet-map" />

      {hoveredCiv && !hoveredMig && (
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
    </div>
  )
}
