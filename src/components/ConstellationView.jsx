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
      // Center pull
      let fx = (cx - pos[i].x) * 0.025
      let fy = (cy - pos[i].y) * 0.025

      // Repulsion between all pairs
      for (let j = 0; j < pos.length; j++) {
        if (i === j) continue
        const dx = pos[i].x - pos[j].x
        const dy = pos[i].y - pos[j].y
        const d2 = dx * dx + dy * dy + 1
        const s = 2600 / d2
        fx += dx * s
        fy += dy * s
      }

      // Spring attraction along edges
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


// ── Component ────────────────────────────────────────────────────────────
export default function ConstellationView({ filterTheme, onCivSelect, onThemeFilter }) {
  const containerRef = useRef(null)
  const [dims, setDims] = useState(null)
  const [positions, setPositions] = useState(null)
  const [layout, setLayout] = useState('force')
  const [transitioning, setTransitioning] = useState(false)
  const [hoveredNode, setHoveredNode] = useState(null)
  const [hoveredEdge, setHoveredEdge] = useState(null)
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

  // Run simulation whenever container size is known
  useEffect(() => {
    if (!dims) return
    setPositions(runSimulation(dims.w, dims.h))
    setLayout('force')
  }, [dims])

  // Animate transition between layouts
  const switchLayout = useCallback((target) => {
    if (transitioning || !positions || !dims) return
    if (rafRef.current) cancelAnimationFrame(rafRef.current)

    const nextPos = target === 'rings'
      ? computeRingLayout(dims.w, dims.h)
      : runSimulation(dims.w, dims.h)

    const from = positions
    const start = performance.now()
    const DURATION = 550

    setTransitioning(true)
    setLayout(target)

    const step = now => {
      const t = Math.min((now - start) / DURATION, 1)
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
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

  if (!positions) {
    return (
      <div ref={containerRef} className="constellation-container">
        <div className="constellation-loading">Computing myth network…</div>
      </div>
    )
  }

  const { w, h } = dims

  return (
    <div ref={containerRef} className="constellation-container">

      {/* Layout toggle */}
      <div className="constellation-controls">
        <span className="constellation-controls-label">Layout</span>
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
            : 'Click a myth · hover for connections'}
        </span>
      </div>

      <svg width={w} height={h} className="constellation-svg">

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

        {/* Edges */}
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

          let stroke = '#6e7a96'
          let opacity = hoveredNode || filterTheme ? 0.04 : 0.18
          let strokeWidth = 1

          if (connectedEdge) {
            stroke = hoveredNode.color; opacity = 0.65; strokeWidth = 1.8
          }
          if (isHoveredEdge && !connectedEdge) {
            stroke = '#dde0ec'; opacity = 0.55; strokeWidth = 1.5
          }
          if (filterTheme) {
            if (themeEdge) { stroke = '#c9981a'; opacity = 0.7; strokeWidth = 2 }
            else { opacity = 0.03 }
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
                style={{ pointerEvents: 'none', transition: 'stroke-opacity 0.15s' }}
              />
              {/* Wide invisible hit-target */}
              <line x1={sp.x} y1={sp.y} x2={tp.x} y2={tp.y}
                stroke="transparent" strokeWidth={12}
                style={{ cursor: 'default' }}
                onMouseEnter={() => setHoveredEdge(edge)}
                onMouseLeave={() => setHoveredEdge(null)}
              />
              {/* Edge label on hover */}
              {isHoveredEdge && (
                <g transform={`translate(${mx},${my})`} style={{ pointerEvents: 'none' }}>
                  <rect x={-labelW / 2} y={-10} width={labelW} height={20}
                    rx={6} fill="#13161f" stroke="#252b40" strokeWidth={1}
                  />
                  <text textAnchor="middle" y={4}
                    fontSize="9" fontFamily="sans-serif"
                    fill="#c9981a" letterSpacing="0.04em"
                  >
                    {labelText}
                  </text>
                </g>
              )}
            </g>
          )
        })}

        {/* Nodes */}
        {GRAPH_NODES.map(node => {
          const pos = positions[node.id]
          if (!pos) return null

          const isHovered = hoveredNode === node
          const r = nodeRadius(node.connections)
          const dr = isHovered ? r + 3 : r

          let nodeOpacity = 1
          if (hoveredNode && !isHovered) {
            nodeOpacity = connectedToHovered?.has(node.id) ? 1 : 0.2
          }
          if (filterTheme) {
            const has = myths[node.id]?.themes?.includes(filterTheme)
            nodeOpacity = has ? 1 : 0.12
          }

          const glyph = getSvgGlyph(node.id)
          const glyphSize = glyph.length > 1
            ? Math.max(7, dr * 0.5)
            : Math.max(9, dr * 0.75)

          return (
            <g
              key={node.id}
              transform={`translate(${pos.x},${pos.y})`}
              style={{ cursor: 'pointer', transition: 'opacity 0.15s' }}
              opacity={nodeOpacity}
              onMouseEnter={() => setHoveredNode(node)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => onCivSelect(civilizations.find(c => c.id === node.id))}
            >
              {/* Glow halo */}
              <circle r={dr + 7} fill={node.color} fillOpacity={isHovered ? 0.18 : 0.07}
                style={{ pointerEvents: 'none', transition: 'r 0.15s, fill-opacity 0.15s' }}
              />
              {/* Main circle */}
              <circle r={dr} fill="#0d0f14" stroke={node.color}
                strokeWidth={isHovered ? 2.5 : 1.5}
                style={{ transition: 'r 0.15s, stroke-width 0.15s' }}
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
                textAnchor="middle" y={dr + 13}
                fontSize="9.5"
                fontFamily="sans-serif"
                fill="#c8cfe0"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {node.name.length > 13 ? node.name.slice(0, 12) + '…' : node.name}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Hover tooltip */}
      {hoveredNode && !hoveredEdge && (
        <div className="constellation-tooltip">
          <strong>{hoveredNode.name}</strong>
          <span>{civilizations.find(c => c.id === hoveredNode.id)?.dateRange}</span>
          <span className="tooltip-hint">
            {hoveredNode.connections} connected myth{hoveredNode.connections !== 1 ? 's' : ''} · click to open
          </span>
        </div>
      )}
    </div>
  )
}
