import { useState, useRef, useEffect } from 'react'
import { civilizations } from '../data/civilizations'
import { myths } from '../data/myths'

function score(civ, query) {
  const q = query.toLowerCase()
  const myth = myths[civ.mythId]
  if (civ.name.toLowerCase().includes(q)) return 3
  if (myth?.title?.toLowerCase().includes(q)) return 2
  if (myth?.themes?.some(t => t.includes(q))) return 2
  if (civ.region?.toLowerCase().includes(q)) return 1
  return 0
}

export default function SearchBar({ onSelect }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const inputRef = useRef(null)

  // `/` key focuses search from anywhere on the page
  useEffect(() => {
    const handler = (e) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault()
        inputRef.current?.focus()
        setOpen(true)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const results = query.length >= 2
    ? civilizations
        .map(c => ({ civ: c, s: score(c, query) }))
        .filter(x => x.s > 0)
        .sort((a, b) => b.s - a.s)
        .slice(0, 8)
        .map(x => x.civ)
    : []

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSelect = (civ) => {
    onSelect(civ)
    setQuery('')
    setOpen(false)
  }

  return (
    <div className="search-wrap" ref={ref}>
      <div className="search-input-wrap">
        <span className="search-icon">⌕</span>
        <input
          ref={inputRef}
          className="search-input"
          type="text"
          placeholder="Search civilizations, myths, themes…"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
        />
        {query && (
          <button className="search-clear" onClick={() => { setQuery(''); setOpen(false) }}>✕</button>
        )}
      </div>
      {open && results.length > 0 && (
        <ul className="search-dropdown">
          {results.map(civ => {
            const myth = myths[civ.mythId]
            const matchedTheme = query.length >= 2
              ? myth?.themes?.find(t => t.includes(query.toLowerCase()))
              : null
            return (
              <li key={civ.id} className="search-result" onMouseDown={() => handleSelect(civ)}>
                <div className="search-result-name">{civ.name}</div>
                <div className="search-result-meta">
                  {myth?.title && <span className="search-myth-title">"{myth.title}"</span>}
                  {matchedTheme && <span className="search-theme-match">theme: {matchedTheme}</span>}
                  <span className="search-era-label">{civ.era} · {civ.region}</span>
                </div>
              </li>
            )
          })}
        </ul>
      )}
      {open && query.length >= 2 && results.length === 0 && (
        <div className="search-empty">No civilizations found</div>
      )}
    </div>
  )
}
