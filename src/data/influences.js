/**
 * Documented cultural influence relationships between civilizations.
 * Each entry has a `from` civ that influenced the `to` civ.
 * These are rendered as directional arrows on the map when showInfluences is on.
 */
export const influences = [
  // ── Mesopotamian transmission ───────────────────────────────────
  {
    id: 'sumer-akkadian',
    from: 'sumer', to: 'akkadian',
    theme: 'flood',
    label: 'Flood myth & creation',
    description: 'Sumerian flood hero Ziusudra became Akkadian Utnapishtim. The Enuma Elish and Eridu Genesis both fed into the Atrahasis Epic. Creation-from-combat theology flowed upstream to downstream Mesopotamia.',
  },
  {
    id: 'akkadian-canaan',
    from: 'akkadian', to: 'canaan',
    theme: 'flood',
    label: 'Flood narrative westward',
    description: 'The Mesopotamian flood myth traveled westward through trade and diplomacy, entering Canaanite oral tradition and eventually becoming the Hebrew story of Noah (Genesis 6–9).',
  },
  {
    id: 'sumer-egypt',
    from: 'sumer', to: 'egypt',
    theme: 'water',
    label: 'Primordial-waters motif',
    description: 'Both traditions feature a primordial watery chaos (Apsu/Tiamat; Nun) from which the first creator emerges. Early Bronze Age trade via the Levant carried cosmological ideas between Mesopotamia and Egypt.',
  },

  // ── Yamnaya / Aryan lineage ─────────────────────────────────────
  {
    id: 'yamnaya-vedic',
    from: 'yamnaya', to: 'vedic-india',
    theme: 'fire',
    label: 'Aryan migration → Vedic religion',
    description: 'The Vedic tradition is the direct religious product of Indo-Aryan migrants from the Yamnaya-related steppe cultures. The Rigveda\'s fire sacrifice (yajna), soma ritual, sky-father Dyaus Pita, and warrior epic tradition all descend from the Proto-Indo-Iranian religion of the steppe. Genetic and archaeological evidence places this migration between 2000 and 1500 BCE.',
  },
  {
    id: 'yamnaya-zoroastrian',
    from: 'yamnaya', to: 'zoroastrian',
    theme: 'dualism',
    label: 'Aryan migration → Zoroastrian Persia',
    description: 'The Iranian branch of the Indo-Aryan migration settled the Iranian plateau and became the Zoroastrian tradition. Ahura Mazda (the Wise Lord) is cognate with Vedic Varuna; haoma is cognate with soma; the Avesta and the Rigveda share hymn structures. Zarathustra\'s radical dualism (Ahura Mazda vs. Angra Mainyu) was a theological development from the same steppe root.',
  },
  {
    id: 'yamnaya-norse',
    from: 'yamnaya', to: 'norse',
    theme: 'sky-earth',
    label: 'Steppe proto-religion → Norse mythology',
    description: 'Norse mythology preserves striking parallels with Proto-Indo-European steppe religion: Tyr (cognate with Dyaus Pita / Jupiter) as the original sky-father, the world tree Yggdrasil as a cosmic axis, divine twins, and the final battle Ragnarök echoing PIE eschatology. Proto-Germanic peoples descended from the westward arc of Yamnaya expansion into northern Europe.',
  },
  {
    id: 'yamnaya-slavic',
    from: 'yamnaya', to: 'slavic',
    theme: 'sky-earth',
    label: 'Steppe proto-religion → Slavic mythology',
    description: 'Slavic mythology\'s thunder god Perun is directly cognate with Vedic Parjanya and Baltic Perkunas — all descendants of the Proto-Indo-European storm deity. The Slavic world tree, the Rod and Rozhanitsy fertility deities, and the three-world cosmology all trace to the Yamnaya-derived steppe religion that spread into Eastern Europe.',
  },

  // ── Indo-European ───────────────────────────────────────────────
  {
    id: 'vedic-zoroastrian',
    from: 'vedic-india', to: 'zoroastrian',
    theme: 'dualism',
    label: 'Indo-Iranian shared roots',
    description: 'Vedic India and Zoroastrian Persia share a common Indo-Iranian proto-religion that diverged c. 1500 BCE. Ahura/Asura, Deva/Daeva, Mitra/Mithra, and soma/haoma are parallel developments from the same root tradition.',
  },
  {
    id: 'canaan-greece',
    from: 'canaan', to: 'greece',
    theme: 'sky-earth',
    label: 'Phoenician cosmology to Aegean',
    description: 'Phoenician traders carried Near Eastern mythological motifs into the Aegean. El, the Canaanite sky father, parallels Greek Kronos. The scribal tradition at Ugarit shows direct parallels with early Greek theogony.',
  },
  {
    id: 'greece-rome',
    from: 'greece', to: 'rome',
    theme: 'creation-from-body',
    label: 'Direct mythological adoption',
    description: 'Roman myth absorbed Greek cosmogony wholesale. Ovid\'s Metamorphoses retells Greek creation myths with Roman names. Zeus→Jupiter, Kronos→Saturn, Gaia→Terra. Roman religion became a vehicle for transmitting Greek cosmology across Europe.',
  },

  // ── Chinese cultural sphere ─────────────────────────────────────
  {
    id: 'hanchina-japan',
    from: 'han-china', to: 'japan-shinto',
    theme: 'sky-earth',
    label: 'Chinese cosmology to Japan',
    description: 'The Nihon Shoki explicitly cites Chinese cosmological texts. The Japanese concept of a primordial chaotic mass that separated into heaven and earth draws on the Chinese yin-yang creation framework transmitted through Buddhism and continental scholarship.',
  },

  // ── Indian influence eastward ───────────────────────────────────
  {
    id: 'vedic-hindupuranic',
    from: 'vedic-india', to: 'hindu-puranic',
    theme: 'sacrifice',
    label: 'Vedic to Puranic evolution',
    description: 'Puranic Hinduism (the Brahma-Vishnu-Shiva triad) evolved from Vedic roots over 1,500 years. The cosmic sacrifice of Purusha becomes Brahma\'s self-creation; the simple Vedic fire altar becomes the multi-layered cosmology of the Puranas.',
  },
  {
    id: 'hindupuranic-tibetan',
    from: 'hindu-puranic', to: 'tibetan',
    theme: 'cosmic-egg',
    label: 'Indian Buddhism to Tibet',
    description: 'Tibetan Vajrayana Buddhism arrived from India in the 7th century CE, layering over indigenous Bön tradition. Mount Meru, the six realms, and the cosmic egg cosmology are Indian Buddhist frameworks adapted through a Tibetan lens.',
  },
  {
    id: 'hindupuranic-javanese',
    from: 'hindu-puranic', to: 'javanese',
    theme: 'serpent',
    label: 'Hindu-Buddhist synthesis in Java',
    description: 'Java received both Hindu and Buddhist traditions from India over a millennium. Batara Guru is a Javanese form of Shiva; the cosmic serpent Antaboga and turtle Bedawang reinterpret Indian cosmological architecture.',
  },

  // ── Nile corridor — Egypt ↔ Nubia ──────────────────────────────
  {
    id: 'egypt-nubia',
    from: 'egypt', to: 'nubia',
    theme: 'sun',
    label: 'Egyptian cosmology to Kush',
    description: 'Egyptian state religion spread southward along the Nile into Nubia / Kush during the New Kingdom occupation (1550–1070 BCE). The cults of Amun, Isis, and Osiris took root at Napata and Meroe, and Nubian rulers were buried under pyramids in the Egyptian style. The ram-headed Amun of Jebel Barkal became the supreme deity of the Kushite state.',
  },
  {
    id: 'nubia-egypt',
    from: 'nubia', to: 'egypt',
    theme: 'sun',
    label: 'Kushite pharaohs bring southern traditions',
    description: 'In the 8th century BCE, Nubian pharaohs of the 25th Dynasty ruled all of Egypt, bringing Kushite theology north. Scholars now argue the ram-headed Amun cult may have originated in Nubia and been adopted by Egypt rather than the reverse. Nubian divine kingship ideology and solar theology shaped Egypt\'s late religious traditions.',
  },

  // ── Mesopotamian succession ─────────────────────────────────────
  {
    id: 'babylon-canaan',
    from: 'babylon', to: 'canaan',
    theme: 'flood',
    label: 'Babylonian flood myth → Hebrew tradition',
    description: 'The Epic of Gilgamesh and the Atrahasis flood narrative were known across the ancient Near East via Old Babylonian scribal schools. Canaanite scribes at Ugarit and Megiddo had access to these texts; the Hebrew Noah narrative (Genesis 6–9) closely mirrors Utnapishtim\'s survival story, including the sending of birds to find dry land.',
  },

  // ── Bronze Age Aegean succession ────────────────────────────────

  // ── South Asian lineage ──────────────────────────────────────────

  // ── East Asian succession ────────────────────────────────────────

  // ── African cultural lineage ────────────────────────────────────
  {
    id: 'yoruba-mali',
    from: 'yoruba', to: 'mali',
    theme: 'creation-from-body',
    label: 'West African cosmological continuum',
    description: 'The Yoruba and Mande-speaking peoples share a West African cosmological substrate — Oduduwa (Yoruba) and Faro (Bambara/Mali) are both cosmic primordial beings associated with water and creation of the world. The Mali Empire\'s oral tradition (preserved in the Sundiata epic and Bambara cosmology) draws on the same root West African mythological complex as the Yoruba Ife creation tradition.',
  },

  // ── Steppe → Medieval ───────────────────────────────────────────

  // ── Prehistoric → Ancient transmission ─────────────────────────

  // ── Mesoamerican continuum ──────────────────────────────────────
  {
    id: 'maya-aztec',
    from: 'maya', to: 'aztec',
    theme: 'sacrifice',
    label: 'Mesoamerican mythological continuum',
    description: 'Aztec cosmogony — the Five Suns, Quetzalcoatl, and the sacrificial creation of the current age — shares deep structural parallels with Maya tradition, mediated through Teotihuacan and the Toltec cultural phase.',
  },

  // ── Pacific ─────────────────────────────────────────────────────
  {
    id: 'polynesian-maori',
    from: 'polynesian', to: 'maori',
    theme: 'sky-earth',
    label: 'Polynesian settlement of New Zealand',
    description: 'Māori cosmology is a direct branch of Pan-Polynesian tradition. Ranginui and Papatūānuku (Sky Father and Earth Mother) are found across the Pacific as Rangi and Papa variants. Māori oral tradition preserves the Polynesian mythological framework intact.',
  },

  // ── West African religious continuum ────────────────────────────
  {
    id: 'yoruba-fon',
    from: 'yoruba', to: 'fon',
    theme: 'trickster',
    label: 'Yoruba → Fon religious exchange',
    description: 'The Fon Vodun tradition shares deep structural parallels with Yoruba religion. Legba (Fon) and Eshu (Yoruba) are the same trickster-messenger deity. The Vodun loa system maps onto the Yoruba orisha; centuries of contact and cultural exchange shaped both traditions.',
  },
  {
    id: 'mali-dogon',
    from: 'mali', to: 'dogon',
    theme: 'ancestors',
    label: 'Mali Empire and Dogon cultural sphere',
    description: 'The Dogon people lived within the orbit of the Mali Empire and its successor states in the Bandiagara region of modern Mali. While Dogon cosmology is distinct and largely self-contained, Mande cultural influence is visible in shared agricultural rituals and ancestor veneration practices.',
  },
  // ── New-civ connections ─────────────────────────────────────────
  {
    id: 'babylon-hebrew',
    from: 'babylon', to: 'hebrew',
    theme: 'flood',
    label: 'Mesopotamian flood & creation → Genesis',
    description: 'The Hebrew creation and flood narratives reshape older Mesopotamian material known across the Near East: the watery deep (tehom) echoes Tiamat, and the story of Noah closely follows the Babylonian Atrahasis and Gilgamesh flood accounts — demythologized into the work of a single God.',
  },
  {
    id: 'canaan-hebrew',
    from: 'canaan', to: 'hebrew',
    theme: 'sky-earth',
    label: 'Canaanite El → the Hebrew God',
    description: 'Israelite religion grew directly out of the Canaanite world. The Hebrew God inherits the name and titles of the Canaanite high god El (El Elyon, El Shaddai), and the watery, formless beginning of Genesis shares the imagery of the Phoenician cosmogony of the Levantine coast.',
  },
  {
    id: 'siberian-mongolian',
    from: 'siberian-shamanic', to: 'mongolian',
    theme: 'earth-diver',
    label: 'Inner Asian earth-diver & sky-worship',
    description: 'Mongol Tengrism and the Buryat earth-diver creation belong to the same Inner Asian shamanic world as the Evenki: a three-layered cosmos beneath the sky-god, a diving bird that raises the first earth from the primordial sea, and the shaman\'s drum as the vehicle between worlds.',
  },
  {
    id: 'yoruba-igbo',
    from: 'yoruba', to: 'igbo',
    theme: 'ancestors',
    label: 'West African cosmological neighbors',
    description: 'The Yoruba and Igbo, neighboring peoples of southern Nigeria, share a West African pattern: a remote supreme creator (Olodumare / Chukwu) who fashions the world and humanity from a watery beginning and then withdraws, leaving the world to lesser deities and the ancestors.',
  },
]
