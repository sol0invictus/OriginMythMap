// HTML_GLYPHS: emoji-friendly, for MythPopup and CompareView (HTML context)
export const HTML_GLYPHS = {
  sumer: '𒀭', egypt: '𓂀', 'vedic-india': 'ॐ', zoroastrian: '𐬀',
  canaan: '𐤀', nubia: '𓇯', korea: '☯',
  'aboriginal-australia': '◉', 'san-people': '✦',
  greece: 'Ω', maya: '𝕄', rome: 'SPQR', yoruba: '✵',
  norse: 'ᚱ', 'hindu-puranic': '꩜', 'japan-shinto': '⛩', slavic: '⊕', maori: '᭡',
  aztec: '☀', inca: '🌄', haudenosaunee: '🐢', polynesian: '🌊',
  'siberian-shamanic': '🥁', 'yupik-inuit': '🐋',
  akkadian: '𒀭', 'han-china': '龍',
  tibetan: '🕉', mali: '〜', lakota: '✴',
  guarani: '🌿', navajo: '🌈', javanese: '🎭',
  babylon: '⬟', yamnaya: '🐎',
  dogon: '🥚', fon: '🌈', zulu: '🌾', muisca: '✨', mapuche: '⛰',
  hebrew: '✡', finnish: '❆', mongolian: '🏹', igbo: '♁', hopi: '◭', kuba: '◓',
  etruscan: '☉', vietnamese: '柱', cherokee: '🪲', akan: '❂', ainu: '🐻', tagalog: '🎋',
}

// SVG_GLYPHS: Unicode symbols only (no emoji), for ConstellationView SVG <text> nodes
export const SVG_GLYPHS = {
  sumer: '𒀭', egypt: '𓂀', 'vedic-india': 'ॐ', zoroastrian: '𐬀',
  canaan: '𐤀', nubia: '𓇯', korea: '☯',
  'aboriginal-australia': '◉', 'san-people': '✦',
  greece: 'Ω', maya: '𝕄', rome: '⚔', yoruba: '✵',
  norse: 'ᚱ', 'hindu-puranic': '꩜', 'japan-shinto': '⛩', slavic: '⊕', maori: '᭡',
  aztec: '☀', inca: '◈', haudenosaunee: '♦', polynesian: '〜',
  'siberian-shamanic': '⊛', 'yupik-inuit': '❄',
  akkadian: '𒀭', 'han-china': '龍',
  tibetan: '☸', mali: '≋', lakota: '⊸',
  guarani: '◌', navajo: '⌀', javanese: '◎',
  babylon: '⬟', yamnaya: '⊵',
  dogon: '⊚', fon: '☽', zulu: '≈', muisca: '✧', mapuche: '▲',
  hebrew: '✡', finnish: '❋', mongolian: '⊰', igbo: '♁', hopi: '◭', kuba: '◓',
  etruscan: '⊙', vietnamese: '柱', cherokee: '◐', akan: '❂', ainu: '◑', tagalog: '⋎',
}

export const getHtmlGlyph = id => HTML_GLYPHS[id] || '◈'
export const getSvgGlyph  = id => SVG_GLYPHS[id]  || '◈'
