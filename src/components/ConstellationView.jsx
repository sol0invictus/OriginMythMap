import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { civilizations, ERAS } from '../data/civilizations'
import { myths } from '../data/myths'
import { influences } from '../data/influences'
import { getSvgGlyph, getHtmlGlyph } from '../utils/glyphs'

// ════════════════════════════════════════════════════════════════════════
//  Shared helpers
// ════════════════════════════════════════════════════════════════════════
const ERA_ORDER = ERAS.map(e => e.id)
const eraRank   = id => Math.max(0, ERA_ORDER.indexOf(id))
const civById   = id => civilizations.find(c => c.id === id)
const eraColor  = id => ERAS.find(e => e.id === id)?.color || '#888'
const eraLabel  = id => ERAS.find(e => e.id === id)?.label || id

// ════════════════════════════════════════════════════════════════════════
//  STAR GRAPH (Cosmogenesis + Era Rings) — theme-affinity constellation
// ════════════════════════════════════════════════════════════════════════
const GRAPH_NODES = civilizations.map((civ, idx) => {
  const myth = myths[civ.mythId]
  const connections = civilizations.filter((other, j) => {
    if (j === idx) return false
    return myth?.themes?.some(t => myths[other.mythId]?.themes?.includes(t))
  }).length
  return {
    id: civ.id, idx,
    name: civ.name, era: civ.era,
    region: civ.region || '',
    color: eraColor(civ.era),
    connections,
    themes: myth?.themes || [],
  }
})

const GRAPH_EDGES = (() => {
  const edges = []
  for (let i = 0; i < civilizations.length; i++) {
    for (let j = i + 1; j < civilizations.length; j++) {
      const mi = myths[civilizations[i].mythId]
      const mj = myths[civilizations[j].mythId]
      if (!mi?.themes || !mj?.themes) continue
      const shared = mi.themes.filter(t => mj.themes.includes(t))
      if (shared.length) edges.push({ source: i, target: j, themes: shared })
    }
  }
  return edges
})()

// Creation-myth archetypes — each civ joins the FIRST archetype it matches.
const ARCHETYPES = [
  { id: 'cosmic-egg',        label: 'Cosmic Egg',        themes: ['cosmic-egg'],                       glyph: '⊚' },
  { id: 'world-tree',        label: 'World Tree',        themes: ['tree'],                             glyph: '⟁' },
  { id: 'earth-diver',       label: 'Earth Diver',       themes: ['earth-diver'],                      glyph: '◐' },
  { id: 'sky-earth',         label: 'Sky & Earth',       themes: ['sky-earth'],                        glyph: '☯' },
  { id: 'primordial-waters', label: 'Primordial Waters', themes: ['water', 'flood'],                   glyph: '〜' },
  { id: 'twins',             label: 'Twins & Dualism',   themes: ['twins', 'dualism'],                 glyph: '⚭' },
  { id: 'from-body',         label: 'From the Body',     themes: ['creation-from-body', 'sacrifice'],  glyph: '✷' },
  { id: 'word-song',         label: 'Word & Song',       themes: ['word-creation', 'song', 'dance'],   glyph: '♬' },
  { id: 'void',              label: 'From the Void',     themes: ['void', 'darkness', 'chaos'],        glyph: '◯' },
  { id: 'other',             label: 'Other Origins',     themes: [],                                   glyph: '✦' },
]
const archetypeOf = node => {
  for (const a of ARCHETYPES) if (a.themes.some(t => node.themes.includes(t))) return a.id
  return 'other'
}

function eraRingRadii(w, h) {
  const maxR = Math.min(w, h) / 2 - 70
  const minR = Math.max(46, maxR * 0.22)
  const n = ERA_ORDER.length
  const out = {}
  ERA_ORDER.forEach((id, i) => { out[id] = n <= 1 ? minR : minR + (maxR - minR) * (i / (n - 1)) })
  return out
}
const ERA_COUNTS = ERA_ORDER.reduce((acc, id) => {
  acc[id] = GRAPH_NODES.filter(n => n.era === id).length
  return acc
}, {})

const MAX_CONN = Math.max(...GRAPH_NODES.map(n => n.connections))
const nodeRadius = c => 8 + (c / MAX_CONN) * 11

// World regions become fixed spokes in the Era Rings view: every region keeps
// the same angle on every ring, so reading outward along a spoke follows that
// region's traditions through time. Ordered roughly west→east, Old World then
// New, so neighbouring spokes are also geographic neighbours.
const REGION_ORDER = [
  'Europe', 'Middle East', 'Africa', 'West Africa', 'Central Africa', 'Southern Africa',
  'Central Asia', 'South Asia', 'SE Asia', 'East Asia', 'Oceania',
  'North America', 'Mesoamerica', 'South America',
]
const REGIONS = (() => {
  const present = Array.from(new Set(GRAPH_NODES.map(n => n.region).filter(Boolean)))
  present.sort((a, b) => {
    const ia = REGION_ORDER.indexOf(a), ib = REGION_ORDER.indexOf(b)
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a.localeCompare(b)
  })
  const angle = {}
  const step = (Math.PI * 2) / present.length
  // +0.5 keeps any spoke from landing exactly on the vertical, where the era
  // labels live.
  present.forEach((r, i) => { angle[r] = -Math.PI / 2 + (i + 0.5) * step })
  return { list: present, angle, count: present.length, step }
})()
const regionAngle = region => REGIONS.angle[region] ?? -Math.PI / 2

function computeRingLayout(w, h) {
  const result = {}
  const radii = eraRingRadii(w, h)
  for (const era of ERA_ORDER) {
    const r = radii[era]
    // Group this era's civs by region, then fan same-region civs across a slice
    // of their spoke so they don't stack on the exact same point.
    const byRegion = {}
    GRAPH_NODES.filter(n => n.era === era).forEach(n => { (byRegion[n.region] ||= []).push(n) })
    for (const region in byRegion) {
      const cell = byRegion[region].slice().sort((a, b) => a.name.localeCompare(b.name))
      const base = regionAngle(region)
      const k = cell.length
      const band = REGIONS.step * Math.min(0.85, 0.32 + k * 0.13)
      cell.forEach((node, i) => {
        const a = k === 1 ? base : base - band / 2 + (i / (k - 1)) * band
        // gentle radial zig-zag de-collides crowded cells without blurring the ring
        const rr = r + (k >= 3 ? ((i % 2) * 2 - 1) * 9 : 0)
        result[node.id] = { x: w / 2 + rr * Math.cos(a), y: h / 2 + rr * Math.sin(a) }
      })
    }
  }
  return result
}

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))   // ~137.5°, even sunflower fill

function computeCosmogenesisLayout(w, h) {
  const result = {}
  const cx = w / 2, cy = h / 2
  const HUB_R = Math.min(w, h) * 0.32
  const byArch = {}
  ARCHETYPES.forEach(a => { byArch[a.id] = [] })
  GRAPH_NODES.forEach(n => { byArch[archetypeOf(n)].push(n) })
  const populated = ARCHETYPES.filter(a => byArch[a.id].length > 0)
  const N = populated.length
  populated.forEach((arch, archIdx) => {
    const hubAngle = (archIdx / N) * Math.PI * 2 - Math.PI / 2
    const hx = cx + HUB_R * Math.cos(hubAngle)
    const hy = cy + HUB_R * Math.sin(hubAngle)
    const nodes = byArch[arch.id]
    if (nodes.length === 1) { result[nodes[0].id] = { x: hx, y: hy }; return }
    // Sunflower (phyllotaxis) packing fills the whole disk instead of a single
    // thin rim, so even the big archetypes (sky-earth = 17, primordial-waters
    // = 12) read as a spread, legible cluster rather than an overcrowded ring.
    const k = nodes.length
    const clusterR = Math.min(102, 18 * Math.sqrt(k) + 10)
    nodes.forEach((node, i) => {
      const rr = clusterR * Math.sqrt((i + 0.5) / k)
      const a = i * GOLDEN_ANGLE
      result[node.id] = { x: hx + rr * Math.cos(a), y: hy + rr * Math.sin(a) }
    })
  })
  return result
}

function archetypeHubs(w, h) {
  const cx = w / 2, cy = h / 2
  const HUB_R = Math.min(w, h) * 0.32
  const byArchCount = {}
  GRAPH_NODES.forEach(n => { const a = archetypeOf(n); byArchCount[a] = (byArchCount[a] || 0) + 1 })
  const populated = ARCHETYPES.filter(a => (byArchCount[a.id] || 0) > 0)
  return populated.map((arch, i) => ({
    arch,
    angle: (i / populated.length) * Math.PI * 2 - Math.PI / 2,
    x: cx + HUB_R * Math.cos((i / populated.length) * Math.PI * 2 - Math.PI / 2),
    y: cy + HUB_R * Math.sin((i / populated.length) * Math.PI * 2 - Math.PI / 2),
    count: byArchCount[arch.id],
  }))
}

const LAYOUT_FNS = { cosmogenesis: computeCosmogenesisLayout, rings: computeRingLayout }

// Phones / touch devices: skip the GPU-heavy decoration (per-node blur filters,
// continuous twinkle animations) and the per-frame intro/morph reflows that make
// pinch-zoom stutter. Re-evaluates on resize/orientation change.
function useIsMobile() {
  const query = '(max-width: 768px), (pointer: coarse)'
  const [mobile, setMobile] = useState(() =>
    (typeof window !== 'undefined' && window.matchMedia?.(query).matches) || false)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia(query)
    const onChange = () => setMobile(mq.matches)
    mq.addEventListener?.('change', onChange)
    return () => mq.removeEventListener?.('change', onChange)
  }, [])
  return mobile
}

function StarGraph({ layout, filterTheme, onCivSelect, isMobile }) {
  const containerRef = useRef(null)
  const [dims, setDims] = useState(null)
  const [positions, setPositions] = useState(null)
  const [hoveredNode, setHoveredNode] = useState(null)
  const [hoveredEdge, setHoveredEdge] = useState(null)
  const introDoneRef = useRef(false)
  const transitioningRef = useRef(false)
  const rafRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      if (width > 10 && height > 10) setDims({ w: width, h: height })
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  // First-mount intro (explode from the centre) + reflow on resize
  useEffect(() => {
    if (!dims) return
    const target = LAYOUT_FNS[layout](dims.w, dims.h)
    // Phones: snap straight to the final layout — no per-frame intro reflow.
    if (introDoneRef.current || isMobile) { introDoneRef.current = true; setPositions(target); return }
    const cx = dims.w / 2, cy = dims.h / 2
    const collapsed = {}
    GRAPH_NODES.forEach(n => { collapsed[n.id] = { x: cx, y: cy } })
    setPositions(collapsed)
    const start = performance.now()
    const HOLD = 320, DURATION = 1300
    const step = now => {
      const elapsed = now - start
      if (elapsed < HOLD) { rafRef.current = requestAnimationFrame(step); return }
      const tRaw = Math.min((elapsed - HOLD) / DURATION, 1)
      const t = 1 - Math.pow(1 - tRaw, 3)
      const cur = {}
      GRAPH_NODES.forEach((n, i) => {
        const stagger = 1 - (i / GRAPH_NODES.length) * 0.3
        const tn = Math.min(1, t / stagger)
        const en = 1 - Math.pow(1 - tn, 3)
        cur[n.id] = { x: cx + (target[n.id].x - cx) * en, y: cy + (target[n.id].y - cy) * en }
      })
      setPositions(cur)
      if (tRaw < 1) rafRef.current = requestAnimationFrame(step)
      else introDoneRef.current = true
    }
    rafRef.current = requestAnimationFrame(step)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [dims])

  // Morph between layouts when the prop changes (after intro)
  useEffect(() => {
    if (!dims || !introDoneRef.current) return
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    const next = LAYOUT_FNS[layout](dims.w, dims.h)
    // Phones: snap to the new layout instead of animating every node per frame.
    if (isMobile) { setPositions(next); return }
    const from = positions || next
    const start = performance.now()
    const DURATION = 700
    transitioningRef.current = true
    const step = now => {
      const t = Math.min((now - start) / DURATION, 1)
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
      const cur = {}
      for (const id in next) {
        const f = from[id] || next[id]
        cur[id] = { x: f.x + (next[id].x - f.x) * ease, y: f.y + (next[id].y - f.y) * ease }
      }
      setPositions(cur)
      if (t < 1) rafRef.current = requestAnimationFrame(step)
      else transitioningRef.current = false
    }
    rafRef.current = requestAnimationFrame(step)
  }, [layout]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }, [])

  const connectedToHovered = useMemo(() => {
    if (!hoveredNode) return null
    return new Set(
      GRAPH_EDGES
        .filter(e => e.source === hoveredNode.idx || e.target === hoveredNode.idx)
        .flatMap(e => [GRAPH_NODES[e.source].id, GRAPH_NODES[e.target].id])
    )
  }, [hoveredNode])

  const bgStars = useMemo(() => {
    if (!dims) return []
    return Array.from({ length: isMobile ? 24 : 90 }, () => ({
      x: Math.random() * dims.w, y: Math.random() * dims.h,
      r: Math.random() * 1.1 + 0.3,
      delay: Math.random() * 6, duration: 3 + Math.random() * 4,
      opacity: 0.25 + Math.random() * 0.5,
    }))
  }, [dims, isMobile])

  if (!positions || !dims) {
    return <div ref={containerRef} className="constellation-stage" />
  }

  const { w, h } = dims
  const hubs = layout === 'cosmogenesis' ? archetypeHubs(w, h) : []
  const ringRadii = eraRingRadii(w, h)
  const isRings = layout === 'rings'
  const myth = hoveredNode ? myths[hoveredNode.id] : null
  const whisper = myth?.summary?.match(/[^.!?]+[.!?]/)?.[0]?.trim() ?? ''

  return (
    <div ref={containerRef} className="constellation-stage">
      {/* Legend */}
      <div className="constellation-legend">
        <div className="const-legend-title">Eras</div>
        {ERAS.map(e => (
          <div className="const-legend-row" key={e.id}>
            <span className="const-legend-dot" style={{ background: e.color }} />
            <span className="const-legend-name">{e.label}</span>
            <span className="const-legend-count">{ERA_COUNTS[e.id]}</span>
          </div>
        ))}
        <div className="const-legend-foot">
          ✦ larger star = more shared-myth links<br />
          ╴ thread = a shared theme
        </div>
      </div>

      <svg width={w} height={h} className="constellation-svg">
        <defs>
          <radialGradient id="star-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="35%"  stopColor="currentColor" stopOpacity="0.5" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="edge-gossamer" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#8a7a4c" stopOpacity="0" />
            <stop offset="50%"  stopColor="#d4c280" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#8a7a4c" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="edge-themed" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#c9981a" stopOpacity="0.05" />
            <stop offset="50%"  stopColor="#ffd97a" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#c9981a" stopOpacity="0.05" />
          </linearGradient>
          <filter id="soft-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        <g className="constellation-bg-stars" aria-hidden="true">
          {bgStars.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#ffffff" fillOpacity={s.opacity}
              style={isMobile ? undefined : { animation: `twinkle ${s.duration}s ease-in-out ${s.delay}s infinite` }} />
          ))}
        </g>

        {/* Era ring guides */}
        {ERA_ORDER.map(era => {
          const r = ringRadii[era]
          const eo = ERAS.find(e => e.id === era)
          return (
            <g key={era}>
              <circle cx={w / 2} cy={h / 2} r={r} fill="none" stroke={eo?.color || '#888'}
                strokeOpacity={isRings ? 0.18 : 0} strokeWidth={1} strokeDasharray="2 7"
                style={{ transition: 'stroke-opacity 0.4s ease' }} />
              <text x={w / 2} y={h / 2 - r - 9} textAnchor="middle" fontSize="9.5"
                fontFamily="Fraunces, Georgia, serif" letterSpacing="0.16em" fill={eo?.color || '#888'}
                fillOpacity={isRings ? 0.7 : 0}
                style={{ transition: 'fill-opacity 0.4s ease', pointerEvents: 'none', userSelect: 'none' }}>
                {eo?.label?.toUpperCase()}
              </text>
            </g>
          )
        })}

        {/* Region spokes (era rings) — one fixed angle per world region across
            every ring, so a spoke reads as that region's traditions over time. */}
        {(() => {
          const innerR = Math.min(...ERA_ORDER.map(e => ringRadii[e]))
          const outerR = Math.max(...ERA_ORDER.map(e => ringRadii[e]))
          return REGIONS.list.map(region => {
            const a = regionAngle(region)
            const cos = Math.cos(a), sin = Math.sin(a)
            const x1 = w / 2 + (innerR - 12) * cos, y1 = h / 2 + (innerR - 12) * sin
            const x2 = w / 2 + (outerR + 8) * cos,  y2 = h / 2 + (outerR + 8) * sin
            const lx = Math.max(54, Math.min(w - 54, w / 2 + (outerR + 18) * cos))
            const ly = Math.max(12, Math.min(h - 10, h / 2 + (outerR + 18) * sin))
            return (
              <g key={region} opacity={isRings ? 1 : 0}
                style={{ transition: 'opacity 0.4s ease', pointerEvents: 'none', userSelect: 'none' }}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#6f7790" strokeOpacity={0.14}
                  strokeWidth={1} strokeDasharray="1 8" />
                <text x={lx} y={ly} textAnchor={cos < 0 ? 'end' : 'start'} dominantBaseline="middle"
                  fontSize="8.5" fontFamily="Spectral, Georgia, serif" letterSpacing="0.08em"
                  fill="#aab0c2" fillOpacity={0.82} style={{ textTransform: 'uppercase' }}>
                  {region}
                </text>
              </g>
            )
          })
        })()}

        {/* Archetype labels (cosmogenesis) — pushed well outside the cluster
            ring (past the node glow halo) and clamped to the stage, so they
            read clearly and never sit on top of the civilization stars. */}
        {hubs.map(({ arch, x, y, angle, count }) => {
          const clusterR = count <= 1 ? 0 : Math.min(102, 18 * Math.sqrt(count) + 10)
          const lr = clusterR + 60   // clear the cluster disk + the node glow halo
          const lx = Math.max(72, Math.min(w - 72, x + Math.cos(angle) * lr))
          const ly = Math.max(18, Math.min(h - 14, y + Math.sin(angle) * lr))
          return (
            <text key={arch.id} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
              fontSize="10.5" fontFamily="Fraunces, Georgia, serif" letterSpacing="0.18em" fill="#d4c280"
              fillOpacity={layout === 'cosmogenesis' ? 0.82 : 0}
              style={{ transition: 'fill-opacity 0.5s ease', textTransform: 'uppercase', pointerEvents: 'none' }}>
              {arch.glyph}  {arch.label.toUpperCase()}
            </text>
          )
        })}

        {/* Edges */}
        {GRAPH_EDGES.map((edge, i) => {
          const sn = GRAPH_NODES[edge.source], tn = GRAPH_NODES[edge.target]
          const sp = positions[sn.id], tp = positions[tn.id]
          if (!sp || !tp) return null
          const isHoveredEdge = hoveredEdge === edge
          const connectedEdge = hoveredNode && (edge.source === hoveredNode.idx || edge.target === hoveredNode.idx)
          const themeEdge = filterTheme && edge.themes.includes(filterTheme)
          let stroke = 'url(#edge-gossamer)'
          // Era Rings would be a hairball if every shared-theme thread showed at
          // once — keep the rings clean and only reveal a node's links on hover
          // (or when a theme filter is active). Cosmogenesis still shows them all.
          let opacity = hoveredNode || filterTheme ? 0.06 : (isRings ? 0 : 0.5)
          let strokeWidth = 0.7
          if (connectedEdge) { stroke = hoveredNode.color; opacity = 0.78; strokeWidth = 1.6 }
          if (isHoveredEdge && !connectedEdge) { stroke = '#ffd97a'; opacity = 0.7; strokeWidth = 1.4 }
          if (filterTheme) {
            if (themeEdge) { stroke = 'url(#edge-themed)'; opacity = 1; strokeWidth = 1.8 }
            else opacity = 0.04
          }
          const mx = (sp.x + tp.x) / 2, my = (sp.y + tp.y) / 2
          const labelText = edge.themes.length <= 3
            ? edge.themes.join(' · ')
            : `${edge.themes.slice(0, 2).join(' · ')} +${edge.themes.length - 2}`
          const labelW = Math.max(70, labelText.length * 5.8 + 16)
          return (
            <g key={i}>
              <line x1={sp.x} y1={sp.y} x2={tp.x} y2={tp.y} stroke={stroke} strokeWidth={strokeWidth}
                strokeOpacity={opacity} strokeLinecap="round"
                style={{ pointerEvents: 'none', transition: 'stroke-opacity 0.2s, stroke-width 0.2s' }} />
              {!isMobile && (
                <line x1={sp.x} y1={sp.y} x2={tp.x} y2={tp.y} stroke="transparent" strokeWidth={12}
                  onMouseEnter={() => setHoveredEdge(edge)} onMouseLeave={() => setHoveredEdge(null)} />
              )}
              {isHoveredEdge && (
                <g transform={`translate(${mx},${my})`} style={{ pointerEvents: 'none' }}>
                  <rect x={-labelW / 2} y={-10} width={labelW} height={20} rx={6}
                    fill="rgba(13,16,24,0.95)" stroke="#3a3220" strokeWidth={1} />
                  <text textAnchor="middle" y={4} fontSize="9" fontFamily="Spectral, Georgia, serif" fill="#ffd97a" letterSpacing="0.06em">
                    {labelText}
                  </text>
                </g>
              )}
            </g>
          )
        })}

        {/* Nodes */}
        {GRAPH_NODES.map((node, idx) => {
          const pos = positions[node.id]
          if (!pos) return null
          const isHovered = hoveredNode === node
          const r = nodeRadius(node.connections)
          const dr = isHovered ? r + 3 : r
          let nodeOpacity = 1
          if (hoveredNode && !isHovered) nodeOpacity = connectedToHovered?.has(node.id) ? 1 : 0.18
          if (filterTheme) nodeOpacity = myths[node.id]?.themes?.includes(filterTheme) ? 1 : 0.1
          const glyph = getSvgGlyph(node.id)
          const glyphSize = glyph.length > 1 ? Math.max(7, dr * 0.5) : Math.max(9, dr * 0.75)
          const twinkleDur = 3.5 + (idx % 7) * 0.4
          const twinkleDelay = (idx * 0.13) % 4
          const isNeighbour = hoveredNode && connectedToHovered?.has(node.id)
          const showHoverLabel = !isRings && (isHovered || isNeighbour)
          const label = node.name.length > 14 ? node.name.slice(0, 13) + '…' : node.name
          const ang = Math.atan2(pos.y - h / 2, pos.x - w / 2)
          const flip = Math.cos(ang) < 0
          const radialDeg = (flip ? ang + Math.PI : ang) * 180 / Math.PI
          const radialOff = dr + 7
          return (
            <g key={node.id} transform={`translate(${pos.x},${pos.y})`}
              style={{ cursor: 'pointer', transition: 'opacity 0.2s', color: node.color }}
              opacity={nodeOpacity}
              onMouseEnter={() => setHoveredNode(node)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => onCivSelect(civById(node.id))}>
              <circle r={dr * 2.4} fill="url(#star-glow)" opacity={isHovered ? 1 : 0.55}
                style={{ pointerEvents: 'none', transition: 'opacity 0.2s',
                         animation: isMobile ? undefined : `node-twinkle ${twinkleDur}s ease-in-out ${twinkleDelay}s infinite` }} />
              <g style={{ pointerEvents: 'none' }} opacity={isHovered ? 0.95 : 0.7}>
                <polygon points={`0,${-dr * 1.8} ${dr * 0.3},0 0,${dr * 1.8} ${-dr * 0.3},0`} fill={node.color} filter={isMobile ? undefined : 'url(#soft-glow)'} />
                {!isMobile && (
                  <polygon points={`${-dr * 1.8},0 0,${-dr * 0.3} ${dr * 1.8},0 0,${dr * 0.3}`} fill={node.color} filter="url(#soft-glow)" opacity="0.85" />
                )}
              </g>
              <circle r={dr} fill="#0a0d14" stroke={node.color} strokeWidth={isHovered ? 2.5 : 1.5}
                style={{ transition: 'stroke-width 0.15s' }} />
              <circle r={dr * 0.35} fill="#fff8e8" opacity={isHovered ? 0.9 : 0.55}
                style={{ pointerEvents: 'none', transition: 'opacity 0.15s' }} />
              <text textAnchor="middle" dominantBaseline="central" fontSize={glyphSize}
                fontFamily="'Segoe UI Emoji', 'Noto Sans', serif" fill={node.color}
                style={{ pointerEvents: 'none', userSelect: 'none' }}>{glyph}</text>
              {isRings && (
                <text transform={`rotate(${radialDeg})`} x={flip ? -radialOff : radialOff}
                  textAnchor={flip ? 'end' : 'start'} dominantBaseline="central" fontSize="8.5"
                  fontFamily="Spectral, Georgia, serif" fill="#d8dae6"
                  fillOpacity={hoveredNode ? (isHovered || isNeighbour ? 1 : 0.28) : 0.82}
                  style={{ pointerEvents: 'none', userSelect: 'none', transition: 'fill-opacity 0.15s' }}>
                  {label}
                </text>
              )}
              {showHoverLabel && (
                <text textAnchor="middle" y={dr * 1.95 + 7} fontSize="10" fontFamily="Spectral, Georgia, serif"
                  fill="#f0ead8" fillOpacity={1} style={{ pointerEvents: 'none', userSelect: 'none' }}>
                  {label}
                </text>
              )}
            </g>
          )
        })}
      </svg>

      {hoveredNode && !hoveredEdge && (
        <div className="constellation-tooltip">
          <strong>{hoveredNode.name}</strong>
          <span>{civById(hoveredNode.id)?.dateRange}</span>
          {whisper && <em className="constellation-whisper">“{whisper}”</em>}
          <span className="tooltip-hint">
            {hoveredNode.connections} connected myth{hoveredNode.connections !== 1 ? 's' : ''} · click to open
          </span>
        </div>
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════
//  LINEAGE NETWORK (Network tab) — documented lines of influence
// ════════════════════════════════════════════════════════════════════════
const LINKED = new Set()
influences.forEach(i => { LINKED.add(i.from); LINKED.add(i.to) })

function buildFamilies() {
  const parent = {}
  const find = x => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x] } return x }
  const union = (a, b) => { parent[find(a)] = find(b) }
  LINKED.forEach(id => { parent[id] = id })
  influences.forEach(i => { if (parent[i.from] != null && parent[i.to] != null) union(i.from, i.to) })
  const groups = {}
  LINKED.forEach(id => { const r = find(id); (groups[r] ||= []).push(id) })
  return Object.values(groups)
}
const FAMILY_NAMES = [
  { has: 'sumer',             name: 'Mesopotamian & Mediterranean' },
  { has: 'yamnaya',           name: 'Indo-European (Steppe)' },
  { has: 'yoruba',            name: 'West African' },
  { has: 'han-china',         name: 'East Asian' },
  { has: 'maya',              name: 'Mesoamerican' },
  { has: 'polynesian',        name: 'Polynesian' },
  { has: 'siberian-shamanic', name: 'Inner Asian / Shamanic' },
]
const familyName = members => FAMILY_NAMES.find(f => members.includes(f.has))?.name || 'Lineage'
const FAMILIES = buildFamilies()
  .map(members => ({ members, name: familyName(members) }))
  .sort((a, b) => {
    const ea = Math.min(...a.members.map(m => eraRank(civById(m).era)))
    const eb = Math.min(...b.members.map(m => eraRank(civById(m).era)))
    return ea - eb || b.members.length - a.members.length
  })
const INDEPENDENT = civilizations.filter(c => !LINKED.has(c.id)).map(c => c.id)
const NEIGHBOURS = {}
civilizations.forEach(c => { NEIGHBOURS[c.id] = { in: [], out: [] } })
influences.forEach(i => {
  if (NEIGHBOURS[i.from]) NEIGHBOURS[i.from].out.push({ id: i.to })
  if (NEIGHBOURS[i.to])   NEIGHBOURS[i.to].in.push({ id: i.from })
})

const LN_R = 13, LN_PAD_L = 172, LN_PAD_R = 30

// Within each family, place a civ in the column = its depth in the lineage
// (longest path of influence steps from an origin). This guarantees every
// arrow flows strictly left → right, so direction is never ambiguous — even
// when several civs share a column. Cycle-safe via a recursion guard.
const INCOMING = {}
civilizations.forEach(c => { INCOMING[c.id] = [] })
influences.forEach(i => { if (INCOMING[i.to]) INCOMING[i.to].push(i.from) })

function familyDepths(members) {
  const set = new Set(members)
  const memo = {}, visiting = new Set()
  const depthOf = id => {
    if (memo[id] != null) return memo[id]
    if (visiting.has(id)) return 0          // break cycles (e.g. Egypt ↔ Nubia)
    visiting.add(id)
    let d = 0
    INCOMING[id].forEach(p => { if (set.has(p)) d = Math.max(d, depthOf(p) + 1) })
    visiting.delete(id)
    return (memo[id] = d)
  }
  const out = {}
  members.forEach(m => { out[m] = depthOf(m) })
  return out
}

function computeLineageLayout(W) {
  const ROW = 50
  // Depth per civ + the global max depth (for a shared column width)
  const depth = {}
  let maxDepth = 0
  FAMILIES.forEach(f => {
    const d = familyDepths(f.members)
    Object.assign(depth, d)
    maxDepth = Math.max(maxDepth, ...Object.values(d))
  })
  const colW = Math.max(132, (W - LN_PAD_L - LN_PAD_R) / (maxDepth + 1))
  const colX = d => LN_PAD_L + d * colW + colW / 2

  const pos = {}, lanes = []
  let y = 18
  FAMILIES.forEach(({ members, name }) => {
    const set = new Set(members)
    const byCol = {}
    members.forEach(id => { (byCol[depth[id]] ||= []).push(id) })
    const colKeys = Object.keys(byCol).map(Number).sort((a, b) => a - b)
    const maxStack = Math.max(...colKeys.map(k => byCol[k].length))
    const laneH = Math.max(ROW * 1.4, maxStack * ROW + 24)
    const cy = y + laneH / 2
    // Order each column by the average y of its parents (barycenter) to
    // minimise arrow crossings; roots (depth 0) ordered by name.
    colKeys.forEach(k => {
      const arr = byCol[k]
      if (k === 0) {
        arr.sort((a, b) => civById(a).name.localeCompare(civById(b).name))
      } else {
        const bary = id => {
          const ps = INCOMING[id].filter(p => set.has(p) && pos[p])
          return ps.length ? ps.reduce((s, p) => s + pos[p].y, 0) / ps.length : cy
        }
        arr.sort((a, b) => bary(a) - bary(b) || civById(a).name.localeCompare(civById(b).name))
      }
      arr.forEach((id, i) => { pos[id] = { x: colX(k), y: cy + (i - (arr.length - 1) / 2) * ROW } })
    })
    lanes.push({ name, y0: y, y1: y + laneH, cy, members })
    y += laneH
  })

  const indepY0 = y + 14
  const cellW = 132, cellH = 56
  const gridCols = Math.max(1, Math.floor((W - LN_PAD_L - LN_PAD_R) / cellW))
  INDEPENDENT.forEach((id, idx) => {
    const r = Math.floor(idx / gridCols), c = idx % gridCols
    pos[id] = { x: LN_PAD_L + c * cellW + cellW / 2, y: indepY0 + 48 + r * cellH }
  })
  const indepRows = Math.ceil(INDEPENDENT.length / gridCols)
  const indep = { y0: indepY0, y1: indepY0 + 48 + indepRows * cellH }
  return { pos, lanes, colX, colW, maxDepth, indep, totalH: indep.y1 + 24 }
}

// Sankey-style edge: leaves the right side of the source, enters the left
// side of the target, with horizontal tangents — so the attachment point on
// each node is unambiguous and lines don't pile up vertically.
function lineageArrow(s, t) {
  const sx = s.x + LN_R, sy = s.y
  const tx = t.x - LN_R - 7, ty = t.y
  const c = Math.max(30, Math.abs(tx - sx) * 0.5)
  return `M ${sx} ${sy} C ${sx + c} ${sy} ${tx - c} ${ty} ${tx} ${ty}`
}

function LineageNetwork({ onCivSelect }) {
  const scrollRef = useRef(null)
  const [dims, setDims] = useState(null)
  const [hovered, setHovered] = useState(null)
  const [hoveredEdge, setHoveredEdge] = useState(null)
  const [selectedInf, setSelectedInf] = useState(null)

  useEffect(() => {
    if (!scrollRef.current) return
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      if (width > 10) setDims({ w: width, h: height })
    })
    ro.observe(scrollRef.current)
    return () => ro.disconnect()
  }, [])

  const W = dims?.w
  const layout = useMemo(() => (W ? computeLineageLayout(W) : null), [W])
  const related = useMemo(() => {
    if (!hovered) return null
    const s = new Set([hovered])
    NEIGHBOURS[hovered].in.forEach(n => s.add(n.id))
    NEIGHBOURS[hovered].out.forEach(n => s.add(n.id))
    return s
  }, [hovered])
  const hov = hovered ? civById(hovered) : null

  return (
    <div className="lineage-net">
      <div className="lineage-header">
        <div className="lh-titles">
          <div className="lh-title">Lines of Influence</div>
          <div className="lh-sub">origins on the left → descendants on the right</div>
        </div>
        <div className="lh-eralegend">
          {ERAS.map(e => (
            <span className="lh-era" key={e.id}>
              <i style={{ background: e.color }} />{e.label}
            </span>
          ))}
        </div>
        <div className="lh-key">
          <div className="lh-key-main">→ influenced / gave rise to</div>
          <div className="lh-key-dim">hover a tradition to trace its lineage</div>
        </div>
      </div>
      <div className="lineage-scroll" ref={scrollRef}>
        {layout && (() => {
          const { pos, lanes, colX, colW, maxDepth, indep, totalH } = layout
          const bodyH = Math.max(totalH, dims.h)
          // On narrow screens the columns hit their minimum width and the
          // diagram grows wider than the viewport — let it scroll horizontally
          // rather than clip. On desktop this equals W (no scroll).
          const contentW = Math.max(W, LN_PAD_L + (maxDepth + 1) * colW + LN_PAD_R)
          const isDim = id => hovered && !related.has(id)
          const lanesBottom = lanes.at(-1)?.y1 || 0
          return (
            <svg width={contentW} height={bodyH} className="lineage-svg" onClick={() => setSelectedInf(null)}>
              <defs>
                <marker id="li-arrow" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L8,3 z" fill="#c9a24b" />
                </marker>
                <marker id="li-arrow-hot" markerWidth="10" markerHeight="10" refX="7" refY="3.2" orient="auto">
                  <path d="M0,0 L0,6.4 L8.5,3.2 z" fill="#ffd97a" />
                </marker>
              </defs>
              {/* Faint depth-column guides */}
              {Array.from({ length: maxDepth + 1 }).map((_, d) => (
                <line key={d} x1={colX(d)} y1={6} x2={colX(d)} y2={lanesBottom}
                  stroke="#2a3a44" strokeOpacity="0.4" strokeWidth="1" strokeDasharray="1 7" />
              ))}
              {lanes.map((lane, i) => (
                <g key={i}>
                  {i > 0 && <line x1={16} y1={lane.y0} x2={contentW - LN_PAD_R} y2={lane.y0} stroke="#243038" strokeOpacity="0.55" strokeWidth="1" strokeDasharray="2 6" />}
                  <text x={16} y={lane.cy - 4} fontFamily="Fraunces, Georgia, serif" fontSize="11" fill="#d4c280" fillOpacity="0.92">{lane.name}</text>
                  <text x={16} y={lane.cy + 12} fontFamily="Spectral, Georgia, serif" fontSize="8.5" fill="#5e7880">{lane.members.length} traditions</text>
                </g>
              ))}
              {influences.map((inf, i) => {
                const s = pos[inf.from], t = pos[inf.to]
                if (!s || !t) return null
                const onPath = hovered && (inf.from === hovered || inf.to === hovered)
                const isSelected = selectedInf?.id === inf.id
                const dim = (hovered && !onPath) || (selectedInf && !isSelected)
                const hot = onPath || hoveredEdge === i || isSelected
                const d = lineageArrow(s, t)
                return (
                  <g key={inf.id}>
                    <path d={d} fill="none" stroke={hot ? '#ffd97a' : '#c9a24b'} strokeWidth={hot ? 2.4 : 1.3}
                      strokeOpacity={dim ? 0.07 : hot ? 0.95 : 0.4} markerEnd={`url(#${hot ? 'li-arrow-hot' : 'li-arrow'})`}
                      style={{ transition: 'stroke-opacity 0.15s, stroke 0.15s' }} />
                    <path d={d} fill="none" stroke="transparent" strokeWidth="13" style={{ cursor: 'pointer' }}
                      onMouseEnter={() => setHoveredEdge(i)} onMouseLeave={() => setHoveredEdge(null)}
                      onClick={(e) => { e.stopPropagation(); setHoveredEdge(null); setSelectedInf(inf) }} />
                  </g>
                )
              })}
              <line x1={16} y1={indep.y0} x2={contentW - LN_PAD_R} y2={indep.y0} stroke="#243038" strokeOpacity="0.55" strokeWidth="1" strokeDasharray="2 6" />
              <text x={16} y={indep.y0 + 26} fontFamily="Fraunces, Georgia, serif" fontSize="11" fill="#d4c280" fillOpacity="0.92">Independent traditions</text>
              <text x={16} y={indep.y0 + 42} fontFamily="Spectral, Georgia, serif" fontSize="8.5" fill="#5e7880">no documented transmission</text>
              {civilizations.map(c => {
                const p = pos[c.id]
                if (!p) return null
                const isHov = hovered === c.id
                const dim = isDim(c.id)
                const col = eraColor(c.era)
                const glyph = getHtmlGlyph(c.id)   // richer "logo" set: emoji + script marks
                const cps = Array.from(glyph).length
                const r = isHov ? LN_R + 2 : LN_R
                const name = c.name.length > 16 ? c.name.slice(0, 15) + '…' : c.name
                return (
                  <g key={c.id} transform={`translate(${p.x},${p.y})`}
                    style={{ cursor: 'pointer', opacity: dim ? 0.22 : 1, transition: 'opacity 0.15s' }}
                    onMouseEnter={() => setHovered(c.id)} onMouseLeave={() => setHovered(null)}
                    onClick={() => onCivSelect(civById(c.id))}>
                    <circle r={r} fill="#0c1014" stroke={col} strokeWidth={isHov ? 3 : 2} />
                    <text textAnchor="middle" dominantBaseline="central" fontSize={cps >= 3 ? 7.5 : isHov ? 15 : 13}
                      fontFamily="'Segoe UI Emoji','Noto Color Emoji','Noto Sans',serif" fill={col} style={{ pointerEvents: 'none', userSelect: 'none' }}>{glyph}</text>
                    <text textAnchor="middle" y={r + 13} fontSize="10" fontFamily="Spectral, Georgia, serif"
                      fill={isHov ? '#f0ead8' : '#c3c8d0'} fillOpacity={isHov ? 1 : 0.88} style={{ pointerEvents: 'none', userSelect: 'none' }}>{name}</text>
                  </g>
                )
              })}
            </svg>
          )
        })()}
      </div>
      {hov && (
        <div className="lineage-tooltip">
          <strong>{hov.name}</strong>
          <span className="lineage-tt-meta">{eraLabel(hov.era)} · {hov.dateRange}</span>
          {NEIGHBOURS[hov.id].in.length > 0 && (
            <div className="lineage-tt-line"><span className="lineage-tt-key">Descended from</span>
              {NEIGHBOURS[hov.id].in.map(n => civById(n.id)?.name).join(', ')}</div>
          )}
          {NEIGHBOURS[hov.id].out.length > 0 && (
            <div className="lineage-tt-line"><span className="lineage-tt-key">Influenced</span>
              {NEIGHBOURS[hov.id].out.map(n => civById(n.id)?.name).join(', ')}</div>
          )}
          {NEIGHBOURS[hov.id].in.length === 0 && NEIGHBOURS[hov.id].out.length === 0 && (
            <div className="lineage-tt-line lineage-tt-independent">An independent tradition</div>
          )}
          <span className="lineage-tt-hint">click to read the myth</span>
        </div>
      )}
      {hoveredEdge != null && !hovered && !selectedInf && (() => {
        const inf = influences[hoveredEdge]
        return (
          <div className="lineage-tooltip lineage-edge-tip">
            <strong>{civById(inf.from)?.name} → {civById(inf.to)?.name}</strong>
            <span className="lineage-tt-meta">{inf.label}</span>
            <span className="lineage-tt-hint">click the arrow for the full story</span>
          </div>
        )
      })()}

      {/* Clicked-arrow detail panel — how the two traditions are related */}
      {selectedInf && (() => {
        const a = civById(selectedInf.from), b = civById(selectedInf.to)
        return (
          <div className="lineage-edge-panel" onClick={e => e.stopPropagation()}>
            <button className="lep-close" onClick={() => setSelectedInf(null)} aria-label="Close">✕</button>
            <div className="lep-route">
              <span style={{ color: eraColor(a.era) }}>{a.name}</span>
              <span className="lep-arrow">→</span>
              <span style={{ color: eraColor(b.era) }}>{b.name}</span>
            </div>
            <div className="lep-label">{selectedInf.label}</div>
            <p className="lep-desc">{selectedInf.description}</p>
            <div className="lep-actions">
              <button onClick={() => onCivSelect(a)}>Read {a.name}</button>
              <button onClick={() => onCivSelect(b)}>Read {b.name}</button>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════
//  Parent — layout toggle across the three views
// ════════════════════════════════════════════════════════════════════════
export default function ConstellationView({ filterTheme, onCivSelect }) {
  const [view, setView] = useState('cosmogenesis')
  const isMobile = useIsMobile()

  const hint = view === 'network'
    ? 'Documented influence between traditions'
    : view === 'cosmogenesis'
      ? (filterTheme ? <>Theme filter: <strong>{filterTheme}</strong></> : 'Each cluster is a creation archetype')
      : (filterTheme ? <>Theme filter: <strong>{filterTheme}</strong></> : 'Rings = eras · spokes = world regions')

  return (
    <div className="constellation-container constellation-cosmic">
      <div className="constellation-nebula" aria-hidden="true" />

      <div className="constellation-controls">
        <span className="constellation-controls-label">Layout</span>
        <button className={`const-layout-btn ${view === 'cosmogenesis' ? 'active' : ''}`}
          onClick={() => setView('cosmogenesis')} title="Group myths by creation archetype">Cosmogenesis</button>
        <button className={`const-layout-btn ${view === 'network' ? 'active' : ''}`}
          onClick={() => setView('network')} title="Documented lines of influence between traditions">Network</button>
        <button className={`const-layout-btn ${view === 'rings' ? 'active' : ''}`}
          onClick={() => setView('rings')} title="Group traditions into concentric era rings">Era Rings</button>
        <span className="constellation-hint">{hint}</span>
      </div>

      {view === 'network'
        ? <LineageNetwork onCivSelect={onCivSelect} />
        : <StarGraph layout={view} filterTheme={filterTheme} onCivSelect={onCivSelect} isMobile={isMobile} />}
    </div>
  )
}
