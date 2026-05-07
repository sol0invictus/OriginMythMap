import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { civilizations, ERAS } from '../data/civilizations'
import { myths } from '../data/myths'
import { getSvgGlyph } from '../utils/glyphs'

// ── Static graph data (built once) ─────────────────────────────────────
const GRAPH_NODES = civilizations.map((civ, idx) => {
  const myth = myths[civ.mythId]
  const connections = civilizations.filter((other, j) => {
    if (j === idx) return false
    return myth?.themes?.some(t => myths[other.mythId]?.themes?.includes(t))
  }).length
  return {
    id: civ.id, idx,
    name: civ.name, era: civ.era,
    color: ERAS.find(e => e.id === civ.era)?.color || '#888',
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

// ── Creation-myth archetypes ──────────────────────────────────────────
// Each civ is grouped into the FIRST archetype whose themes it shares.
// Order matters — more specific archetypes come first.
const ARCHETYPES = [
  { id: 'cosmic-egg',      label: 'Cosmic Egg',         themes: ['cosmic-egg'],                              glyph: '⊚' },
  { id: 'world-tree',      label: 'World Tree',         themes: ['tree'],                                    glyph: '⟁' },
  { id: 'earth-diver',     label: 'Earth Diver',        themes: ['earth-diver'],                             glyph: '◐' },
  { id: 'sky-earth',       label: 'Sky & Earth',        themes: ['sky-earth'],                               glyph: '☯' },
  { id: 'primordial-waters', label: 'Primordial Waters', themes: ['water', 'flood'],                          glyph: '〜' },
  { id: 'twins',           label: 'Twins & Dualism',    themes: ['twins', 'dualism'],                        glyph: '⚭' },
  { id: 'from-body',       label: 'From the Body',      themes: ['creation-from-body', 'sacrifice'],         glyph: '✷' },
  { id: 'word-song',       label: 'Word & Song',        themes: ['word-creation', 'song', 'dance'],          glyph: '♬' },
  { id: 'void',            label: 'From the Void',      themes: ['void', 'darkness', 'chaos'],               glyph: '◯' },
  { id: 'other',           label: 'Other Origins',      themes: [],                                          glyph: '✦' },
]

const archetypeOf = node => {
  for (const a of ARCHETYPES) {
    if (a.themes.some(t => node.themes.includes(t))) return a.id
  }
  return 'other'
}

const ERA_RADII = {
  prehistoric: 65, 'bronze-age': 120, 'iron-age': 175, classical: 230, medieval: 285,
}
const MAX_CONN = Math.max(...GRAPH_NODES.map(n => n.connections))
const nodeRadius = c => 9 + (c / MAX_CONN) * 12

// ── Force-directed layout simulation ───────────────────────────────────
function runSimulation(w, h) {
  const cx = w / 2, cy = h / 2
  const pos = GRAPH_NODES.map(() => ({
    x: cx + (Math.random() - 0.5) * Math.min(w, h) * 0.65,
    y: cy + (Math.random() - 0.5) * Math.min(w, h) * 0.65,
    vx: 0, vy: 0,
  }))

  for (let step = 0; step < 380; step++) {
    const alpha = Math.max(0, 1 - step / 260)
    for (let i = 0; i < pos.length; i++) {
      let fx = (cx - pos[i].x) * 0.025
      let fy = (cy - pos[i].y) * 0.025
      for (let j = 0; j < pos.length; j++) {
        if (i === j) continue
        const dx = pos[i].x - pos[j].x
        const dy = pos[i].y - pos[j].y
        const d2 = dx * dx + dy * dy + 1
        const s = 2600 / d2
        fx += dx * s
        fy += dy * s
      }
      for (const e of GRAPH_EDGES) {
        const oi = e.source === i ? e.target : e.target === i ? e.source : -1
        if (oi < 0) continue
        const dx = pos[oi].x - pos[i].x
        const dy = pos[oi].y - pos[i].y
        const d = Math.sqrt(dx * dx + dy * dy) || 1
        const rest = 95 + e.themes.length * 18
        const f = (d - rest) * 0.055 * alpha
        fx += (dx / d) * f
        fy += (dy / d) * f
      }
      pos[i].vx = (pos[i].vx + fx) * 0.52
      pos[i].vy = (pos[i].vy + fy) * 0.52
      pos[i].x = Math.max(45, Math.min(w - 45, pos[i].x + pos[i].vx))
      pos[i].y = Math.max(45, Math.min(h - 45, pos[i].y + pos[i].vy))
    }
  }
  const result = {}
  GRAPH_NODES.forEach((n, i) => { result[n.id] = { x: pos[i].x, y: pos[i].y } })
  return result
}

// ── Concentric era-ring layout ──────────────────────────────────────────
function computeRingLayout(w, h) {
  const result = {}
  for (const era of Object.keys(ERA_RADII)) {
    const nodes = GRAPH_NODES.filter(n => n.era === era)
    const r = ERA_RADII[era]
    nodes.forEach((node, i) => {
      const angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2
      result[node.id] = { x: w / 2 + r * Math.cos(angle), y: h / 2 + r * Math.sin(angle) }
    })
  }
  return result
}

// ── Cosmogenesis layout: cluster by creation-myth archetype ────────────
// Archetypes are placed around a polar arrangement; nodes within each
// archetype are packed into a small ring (or single point if alone).
function computeCosmogenesisLayout(w, h) {
  const result = {}
  const cx = w / 2, cy = h / 2
  // Distance from center for archetype hubs — scale to viewport
  const HUB_R = Math.min(w, h) * 0.32

  // Group nodes by archetype, preserving canonical ARCHETYPES order
  const byArch = {}
  ARCHETYPES.forEach(a => { byArch[a.id] = [] })
  GRAPH_NODES.forEach(n => { byArch[archetypeOf(n)].push(n) })

  // Filter out empty archetypes so layout uses just the populated ones
  const populated = ARCHETYPES.filter(a => byArch[a.id].length > 0)
  const N = populated.length

  populated.forEach((arch, archIdx) => {
    const hubAngle = (archIdx / N) * Math.PI * 2 - Math.PI / 2
    const hx = cx + HUB_R * Math.cos(hubAngle)
    const hy = cy + HUB_R * Math.sin(hubAngle)
    const nodes = byArch[arch.id]

    if (nodes.length === 1) {
      result[nodes[0].id] = { x: hx, y: hy }
      return
    }

    // Ring radius scales with cluster size; minimum to avoid overlap
    const clusterR = Math.min(80, 24 + nodes.length * 5)
    nodes.forEach((node, i) => {
      const a = (i / nodes.length) * Math.PI * 2 - Math.PI / 2
      result[node.id] = {
        x: hx + clusterR * Math.cos(a),
        y: hy + clusterR * Math.sin(a),
      }
    })
  })

  return result
}

function archetypeHubs(w, h) {
  const cx = w / 2, cy = h / 2
  const HUB_R = Math.min(w, h) * 0.32
  const byArchCount = {}
  GRAPH_NODES.forEach(n => {
    const a = archetypeOf(n)
    byArchCount[a] = (byArchCount[a] || 0) + 1
  })
  const populated = ARCHETYPES.filter(a => (byArchCount[a.id] || 0) > 0)
  return populated.map((arch, i) => ({
    arch,
    angle: (i / populated.length) * Math.PI * 2 - Math.PI / 2,
    x: cx + HUB_R * Math.cos((i / populated.length) * Math.PI * 2 - Math.PI / 2),
    y: cy + HUB_R * Math.sin((i / populated.length) * Math.PI * 2 - Math.PI / 2),
    count: byArchCount[arch.id],
  }))
}

const LAYOUT_FNS = {
  force:         runSimulation,
  rings:         computeRingLayout,
  cosmogenesis:  computeCosmogenesisLayout,
}

// ── Component ────────────────────────────────────────────────────────────
export default function ConstellationView({ filterTheme, onCivSelect, onThemeFilter }) {
  const containerRef = useRef(null)
  const [dims, setDims] = useState(null)
  const [positions, setPositions] = useState(null)
  const [layout, setLayout] = useState('cosmogenesis')
  const [transitioning, setTransitioning] = useState(false)
  const [hoveredNode, setHoveredNode] = useState(null)
  const [hoveredEdge, setHoveredEdge] = useState(null)
  const [introPlayed, setIntroPlayed] = useState(false)
  const rafRef = useRef(null)

  // Measure container with ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      if (width > 10 && height > 10) setDims({ w: width, h: height })
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  // First-mount: cosmogenesis intro animation — all nodes start at the
  // center as a single bright point and explode outward to layout positions.
  useEffect(() => {
    if (!dims || introPlayed) return
    const target = LAYOUT_FNS[layout](dims.w, dims.h)
    const cx = dims.w / 2, cy = dims.h / 2

    // Start collapsed at the singularity
    const collapsed = {}
    GRAPH_NODES.forEach(n => { collapsed[n.id] = { x: cx, y: cy } })
    setPositions(collapsed)

    // Brief pause so the user sees the singularity, then explode
    const start = performance.now()
    const HOLD = 360
    const DURATION = 1400
    const total = HOLD + DURATION

    const step = now => {
      const elapsed = now - start
      if (elapsed < HOLD) {
        rafRef.current = requestAnimationFrame(step)
        return
      }
      const tRaw = Math.min((elapsed - HOLD) / DURATION, 1)
      // Ease-out cubic — fast burst, gentle settle
      const t = 1 - Math.pow(1 - tRaw, 3)
      const cur = {}
      GRAPH_NODES.forEach((n, i) => {
        // Per-node stagger so they don't all arrive at once
        const stagger = 1 - (i / GRAPH_NODES.length) * 0.3
        const tn = Math.min(1, t / stagger)
        const en = 1 - Math.pow(1 - tn, 3)
        cur[n.id] = {
          x: cx + (target[n.id].x - cx) * en,
          y: cy + (target[n.id].y - cy) * en,
        }
      })
      setPositions(cur)
      if (elapsed < total) rafRef.current = requestAnimationFrame(step)
      else { setIntroPlayed(true) }
    }
    rafRef.current = requestAnimationFrame(step)
  }, [dims, introPlayed, layout])

  // Animate transition between layouts (after intro)
  const switchLayout = useCallback((target) => {
    if (transitioning || !positions || !dims) return
    if (rafRef.current) cancelAnimationFrame(rafRef.current)

    const nextPos = LAYOUT_FNS[target](dims.w, dims.h)
    const from = positions
    const start = performance.now()
    const DURATION = 700

    setTransitioning(true)
    setLayout(target)

    const step = now => {
      const t = Math.min((now - start) / DURATION, 1)
      // Ease-in-out cubic
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
      const cur = {}
      for (const id in from) {
        cur[id] = {
          x: from[id].x + (nextPos[id].x - from[id].x) * ease,
          y: from[id].y + (nextPos[id].y - from[id].y) * ease,
        }
      }
      setPositions(cur)
      if (t < 1) rafRef.current = requestAnimationFrame(step)
      else { setTransitioning(false) }
    }
    rafRef.current = requestAnimationFrame(step)
  }, [positions, dims, transitioning])

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }, [])

  // Precompute connected node set for hover highlighting
  const connectedToHovered = useMemo(() => {
    if (!hoveredNode) return null
    return new Set(
      GRAPH_EDGES
        .filter(e => e.source === hoveredNode.idx || e.target === hoveredNode.idx)
        .flatMap(e => [GRAPH_NODES[e.source].id, GRAPH_NODES[e.target].id])
    )
  }, [hoveredNode])

  // Background twinkling stars (computed once per dims)
  const bgStars = useMemo(() => {
    if (!dims) return []
    const N = 90
    return Array.from({ length: N }, (_, i) => ({
      x: Math.random() * dims.w,
      y: Math.random() * dims.h,
      r: Math.random() * 1.1 + 0.3,
      delay: Math.random() * 6,
      duration: 3 + Math.random() * 4,
      opacity: 0.25 + Math.random() * 0.5,
    }))
  }, [dims])

  if (!positions) {
    return (
      <div ref={containerRef} className="constellation-container">
        <div className="constellation-loading">Computing myth network…</div>
      </div>
    )
  }

  const { w, h } = dims
  const hubs = layout === 'cosmogenesis' ? archetypeHubs(w, h) : []
  const myth = hoveredNode ? myths[hoveredNode.id] : null
  // First sentence of the summary as a "myth whisper"
  const whisper = myth?.summary?.match(/[^.!?]+[.!?]/)?.[0]?.trim() ?? ''

  return (
    <div ref={containerRef} className="constellation-container constellation-cosmic">

      {/* Layered nebula background */}
      <div className="constellation-nebula" aria-hidden="true" />

      {/* Layout toggle */}
      <div className="constellation-controls">
        <span className="constellation-controls-label">Layout</span>
        <button
          className={`const-layout-btn ${layout === 'cosmogenesis' ? 'active' : ''}`}
          onClick={() => layout !== 'cosmogenesis' && !transitioning && switchLayout('cosmogenesis')}
          title="Group myths by creation archetype"
        >
          ✶ Cosmogenesis
        </button>
        <button
          className={`const-layout-btn ${layout === 'force' ? 'active' : ''}`}
          onClick={() => layout !== 'force' && !transitioning && switchLayout('force')}
        >
          ✦ Network
        </button>
        <button
          className={`const-layout-btn ${layout === 'rings' ? 'active' : ''}`}
          onClick={() => layout !== 'rings' && !transitioning && switchLayout('rings')}
        >
          ◎ Era Rings
        </button>
        <span className="constellation-hint">
          {filterTheme
            ? <>Theme filter: <strong>{filterTheme}</strong></>
            : layout === 'cosmogenesis'
              ? 'Each cluster is a creation archetype'
              : 'Click a myth · hover for connections'}
        </span>
      </div>

      <svg width={w} height={h} className="constellation-svg">
        <defs>
          {/* Reusable star glow */}
          <radialGradient id="star-glow-gold" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#fff8d8" stopOpacity="0.95" />
            <stop offset="35%"  stopColor="#c9a84c" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#c9a84c" stopOpacity="0" />
          </radialGradient>
          {/* Per-node glow uses stop-color="currentColor" via gradient template */}
          <radialGradient id="star-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="35%"  stopColor="currentColor" stopOpacity="0.5" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
          {/* Gossamer edge gradient — fades at endpoints, peaks mid-line */}
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

        {/* Ambient background stars */}
        <g className="constellation-bg-stars" aria-hidden="true">
          {bgStars.map((s, i) => (
            <circle
              key={i} cx={s.x} cy={s.y} r={s.r}
              fill="#ffffff" fillOpacity={s.opacity}
              style={{
                animation: `twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
              }}
            />
          ))}
        </g>

        {/* Era ring guide circles (rings layout) */}
        {Object.entries(ERA_RADII).map(([era, r]) => {
          const eraObj = ERAS.find(e => e.id === era)
          const showRing = layout === 'rings'
          return (
            <g key={era}>
              <circle
                cx={w / 2} cy={h / 2} r={r}
                fill="none"
                stroke={eraObj?.color || '#888'}
                strokeOpacity={showRing ? 0.15 : 0}
                strokeWidth={1}
                strokeDasharray="3 6"
                style={{ transition: 'stroke-opacity 0.4s ease' }}
              />
              <text
                x={w / 2} y={h / 2 - r - 7}
                textAnchor="middle"
                fontSize="9"
                fontFamily="sans-serif"
                letterSpacing="0.1em"
                fill={eraObj?.color || '#888'}
                fillOpacity={showRing ? 0.55 : 0}
                style={{ transition: 'fill-opacity 0.4s ease', pointerEvents: 'none', userSelect: 'none' }}
              >
                {eraObj?.label?.toUpperCase()}
              </text>
            </g>
          )
        })}

        {/* Archetype labels (cosmogenesis layout) */}
        {hubs.map(({ arch, x, y, angle, count }) => {
          // Push label outward from the cluster center along the hub's polar angle
          const lr = Math.min(95, 30 + count * 6)
          const lx = x + Math.cos(angle) * lr * 1.05
          const ly = y + Math.sin(angle) * lr * 1.05
          return (
            <g key={arch.id} className="archetype-label" style={{ pointerEvents: 'none' }}>
              <text
                x={lx} y={ly}
                textAnchor="middle" dominantBaseline="middle"
                fontSize="10.5"
                fontFamily="'Cinzel', serif"
                letterSpacing="0.18em"
                fill="#d4c280"
                fillOpacity={layout === 'cosmogenesis' ? 0.78 : 0}
                style={{ transition: 'fill-opacity 0.5s ease', textTransform: 'uppercase' }}
              >
                {arch.glyph}  {arch.label.toUpperCase()}
              </text>
            </g>
          )
        })}

        {/* Edges — gossamer threads */}
        {GRAPH_EDGES.map((edge, i) => {
          const sn = GRAPH_NODES[edge.source]
          const tn = GRAPH_NODES[edge.target]
          const sp = positions[sn.id]
          const tp = positions[tn.id]
          if (!sp || !tp) return null

          const isHoveredEdge = hoveredEdge === edge
          const connectedEdge = hoveredNode &&
            (edge.source === hoveredNode.idx || edge.target === hoveredNode.idx)
          const themeEdge = filterTheme && edge.themes.includes(filterTheme)

          let stroke = 'url(#edge-gossamer)'
          let opacity = hoveredNode || filterTheme ? 0.06 : 0.5
          let strokeWidth = 0.7

          if (connectedEdge) {
            stroke = hoveredNode.color
            opacity = 0.78
            strokeWidth = 1.6
          }
          if (isHoveredEdge && !connectedEdge) {
            stroke = '#ffd97a'
            opacity = 0.7
            strokeWidth = 1.4
          }
          if (filterTheme) {
            if (themeEdge) {
              stroke = 'url(#edge-themed)'
              opacity = 1
              strokeWidth = 1.8
            } else {
              opacity = 0.04
            }
          }

          const mx = (sp.x + tp.x) / 2
          const my = (sp.y + tp.y) / 2
          const labelText = edge.themes.length <= 3
            ? edge.themes.join(' · ')
            : `${edge.themes.slice(0, 2).join(' · ')} +${edge.themes.length - 2}`
          const labelW = Math.max(70, labelText.length * 5.8 + 16)

          return (
            <g key={i}>
              <line x1={sp.x} y1={sp.y} x2={tp.x} y2={tp.y}
                stroke={stroke} strokeWidth={strokeWidth} strokeOpacity={opacity}
                strokeLinecap="round"
                style={{ pointerEvents: 'none', transition: 'stroke-opacity 0.2s, stroke-width 0.2s' }}
              />
              <line x1={sp.x} y1={sp.y} x2={tp.x} y2={tp.y}
                stroke="transparent" strokeWidth={12}
                style={{ cursor: 'default' }}
                onMouseEnter={() => setHoveredEdge(edge)}
                onMouseLeave={() => setHoveredEdge(null)}
              />
              {isHoveredEdge && (
                <g transform={`translate(${mx},${my})`} style={{ pointerEvents: 'none' }}>
                  <rect x={-labelW / 2} y={-10} width={labelW} height={20}
                    rx={6} fill="rgba(13,16,24,0.95)" stroke="#3a3220" strokeWidth={1}
                  />
                  <text textAnchor="middle" y={4}
                    fontSize="9" fontFamily="sans-serif"
                    fill="#ffd97a" letterSpacing="0.06em"
                  >
                    {labelText}
                  </text>
                </g>
              )}
            </g>
          )
        })}

        {/* Nodes — twinkling stars */}
        {GRAPH_NODES.map((node, idx) => {
          const pos = positions[node.id]
          if (!pos) return null

          const isHovered = hoveredNode === node
          const r = nodeRadius(node.connections)
          const dr = isHovered ? r + 3 : r

          let nodeOpacity = 1
          if (hoveredNode && !isHovered) {
            nodeOpacity = connectedToHovered?.has(node.id) ? 1 : 0.18
          }
          if (filterTheme) {
            const has = myths[node.id]?.themes?.includes(filterTheme)
            nodeOpacity = has ? 1 : 0.1
          }

          const glyph = getSvgGlyph(node.id)
          const glyphSize = glyph.length > 1
            ? Math.max(7, dr * 0.5)
            : Math.max(9, dr * 0.75)

          // Twinkle period varies per node so they don't pulse in unison
          const twinkleDur = 3.5 + (idx % 7) * 0.4
          const twinkleDelay = (idx * 0.13) % 4

          return (
            <g
              key={node.id}
              transform={`translate(${pos.x},${pos.y})`}
              style={{ cursor: 'pointer', transition: 'opacity 0.2s', color: node.color }}
              opacity={nodeOpacity}
              onMouseEnter={() => setHoveredNode(node)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => onCivSelect(civilizations.find(c => c.id === node.id))}
            >
              {/* Outer soft glow halo */}
              <circle r={dr * 2.4} fill="url(#star-glow)"
                opacity={isHovered ? 1 : 0.55}
                style={{
                  pointerEvents: 'none',
                  transition: 'opacity 0.2s',
                  animation: `node-twinkle ${twinkleDur}s ease-in-out ${twinkleDelay}s infinite`,
                }}
              />
              {/* 4-point star rays — long thin diamond, then rotated 45° */}
              <g style={{ pointerEvents: 'none' }} opacity={isHovered ? 0.95 : 0.7}>
                <polygon
                  points={`0,${-dr * 1.8} ${dr * 0.3},0 0,${dr * 1.8} ${-dr * 0.3},0`}
                  fill={node.color}
                  filter="url(#soft-glow)"
                />
                <polygon
                  points={`${-dr * 1.8},0 0,${-dr * 0.3} ${dr * 1.8},0 0,${dr * 0.3}`}
                  fill={node.color}
                  filter="url(#soft-glow)"
                  opacity="0.85"
                />
              </g>
              {/* Core orb — dark with bright rim */}
              <circle r={dr} fill="#0a0d14"
                stroke={node.color} strokeWidth={isHovered ? 2.5 : 1.5}
                style={{ transition: 'stroke-width 0.15s' }}
              />
              {/* White-hot center */}
              <circle r={dr * 0.35} fill="#fff8e8" opacity={isHovered ? 0.9 : 0.55}
                style={{ pointerEvents: 'none', transition: 'opacity 0.15s' }}
              />
              {/* Glyph */}
              <text
                textAnchor="middle" dominantBaseline="central"
                fontSize={glyphSize}
                fontFamily="'Segoe UI Emoji', 'Noto Sans', serif"
                fill={node.color}
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {glyph}
              </text>
              {/* Name label */}
              <text
                textAnchor="middle" y={dr * 1.95 + 6}
                fontSize="9.5"
                fontFamily="'EB Garamond', serif"
                fill="#d8dae6"
                fillOpacity={isHovered ? 1 : 0.78}
                style={{ pointerEvents: 'none', userSelect: 'none', transition: 'fill-opacity 0.15s' }}
              >
                {node.name.length > 13 ? node.name.slice(0, 12) + '…' : node.name}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Hover tooltip with myth whisper */}
      {hoveredNode && !hoveredEdge && (
        <div className="constellation-tooltip">
          <strong>{hoveredNode.name}</strong>
          <span>{civilizations.find(c => c.id === hoveredNode.id)?.dateRange}</span>
          {whisper && <em className="constellation-whisper">“{whisper}”</em>}
          <span className="tooltip-hint">
            {hoveredNode.connections} connected myth{hoveredNode.connections !== 1 ? 's' : ''} · click to open
          </span>
        </div>
      )}
    </div>
  )
}
