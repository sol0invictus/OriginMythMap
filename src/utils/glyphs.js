// HTML_GLYPHS: emoji-friendly, for MythPopup and CompareView (HTML context)
export const HTML_GLYPHS = {
  sumer: '𒀭', egypt: '𓂀', 'vedic-india': 'ॐ', 'shang-china': '龍',
  zoroastrian: '𐬀', canaan: '𐤀', nubia: '𓇯', korea: '☯',
  'aboriginal-australia': '◉', 'san-people': '✦',
  greece: 'Ω', maya: '𝕄', rome: 'SPQR', celtic: '᚛', yoruba: '✵',
  norse: 'ᚱ', 'hindu-puranic': '꩜', 'japan-shinto': '⛩', slavic: '⊕', maori: '᭡',
  aztec: '☀', inca: '🌄', haudenosaunee: '🐢', polynesian: '🌊',
  'siberian-shamanic': '🥁', magdalenian: '🦬', 'ancient-melanesia': '🌴',
  'yupik-inuit': '🐋', sami: '🦌',
  'anatolia-neolithic': '♀', jomon: '🔥', olmec: '🐆', hittite: '⚡',
  akkadian: '𒀭', 'han-china': '龍', scythian: '🏹', aksum: '✡',
  tibetan: '🕉', khmer: '🐍', mali: '〜', lakota: '✴',
  guarani: '🌿', navajo: '🌈', javanese: '🎭',
  'indus-valley': '⊡', minoan: '🌀', mycenaean: '⚔', babylon: '⬟',
  'caral-supe': '◬', elam: '⬡', ugarit: '𐎀', yamnaya: '🐎',
  sanxingdui: '🌳', 'xia-china': '鼎', dilmun: '◎', punt: '⛵',
  'ancient-cyprus': '⚱', cucuteni: '♾',
  dogon: '🥚', fon: '🌈', zulu: '🌾', muisca: '✨', mapuche: '⛰',
}

// SVG_GLYPHS: Unicode symbols only (no emoji), for ConstellationView SVG <text> nodes
export const SVG_GLYPHS = {
  sumer: '𒀭', egypt: '𓂀', 'vedic-india': 'ॐ', 'shang-china': '龍',
  zoroastrian: '𐬀', canaan: '𐤀', nubia: '𓇯', korea: '☯',
  'aboriginal-australia': '◉', 'san-people': '✦',
  greece: 'Ω', maya: '𝕄', rome: '⚔', celtic: '᚛', yoruba: '✵',
  norse: 'ᚱ', 'hindu-puranic': '꩜', 'japan-shinto': '⛩', slavic: '⊕', maori: '᭡',
  aztec: '☀', inca: '◈', haudenosaunee: '♦', polynesian: '〜',
  'siberian-shamanic': '⊛', magdalenian: '⊳', 'ancient-melanesia': '◒',
  'yupik-inuit': '❄', sami: '⊼',
  'anatolia-neolithic': '♀', jomon: '△', olmec: '⬡', hittite: '⚡',
  akkadian: '𒀭', 'han-china': '龍', scythian: '⊰', aksum: '✡',
  tibetan: '☸', khmer: '❖', mali: '≋', lakota: '⊸',
  guarani: '◌', navajo: '⌀', javanese: '◎',
  'indus-valley': '⊡', minoan: '⊛', mycenaean: '⚔', babylon: '⬟',
  'caral-supe': '◬', elam: '⬡', ugarit: '𐎀', yamnaya: '⊵',
  sanxingdui: '⊙', 'xia-china': '鼎', dilmun: '◎', punt: '▷',
  'ancient-cyprus': '⊗', cucuteni: '⌾',
  dogon: '⊚', fon: '☽', zulu: '≈', muisca: '✧', mapuche: '▲',
}

export const getHtmlGlyph = id => HTML_GLYPHS[id] || '◈'
export const getSvgGlyph  = id => SVG_GLYPHS[id]  || '◈'
