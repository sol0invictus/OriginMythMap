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
  {
    id: 'sumer-hittite',
    from: 'sumer', to: 'hittite',
    theme: 'chaos',
    label: 'Mesopotamian cosmology to Anatolia',
    description: 'Hittite tablets from Hattusa include Akkadian-language myth fragments alongside native Hurrian traditions, showing direct Mesopotamian cosmological influence on Anatolian theology.',
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
  {
    id: 'yamnaya-celtic',
    from: 'yamnaya', to: 'celtic',
    theme: 'sacrifice',
    label: 'Steppe proto-religion → Celtic druidism',
    description: 'Celtic religion shares the PIE sacrificial tradition (the Druids\' ritual calendar, sacred oak groves, and cosmic fire ceremonies parallel Vedic yajna), divine twins, and a sky-father figure (Dagda / Dyaus Pita). Proto-Celtic speakers were part of the westward Indo-European expansion from the Yamnaya steppe through the Bell Beaker culture.',
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
    id: 'hittite-greece',
    from: 'hittite', to: 'greece',
    theme: 'succession',
    label: 'Kumarbi → Kronos succession myth',
    description: 'Hesiod\'s Theogony — Ouranos castrated by Kronos, who swallows his children — closely mirrors the earlier Hittite Kumarbi Cycle. This is one of the best-documented cases of myth transmission in the ancient world.',
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
    id: 'shang-korea',
    from: 'shang-china', to: 'korea',
    theme: 'sky-earth',
    label: 'Chinese cosmology to Korea',
    description: 'The Dangun myth reflects Chinese cosmological influence — the heavenly descent of Hwanin/Hwanung parallels Chinese sky-deity traditions. Chinese writing, bronze technology, and ritual forms spread to the Korean peninsula during the Shang and Zhou periods.',
  },
  {
    id: 'shang-hanchina',
    from: 'shang-china', to: 'han-china',
    theme: 'cosmic-egg',
    label: 'Shang → Han cosmological evolution',
    description: 'Han Dynasty mythology (Pangu, Nüwa, the Five Emperors) synthesized and elaborated earlier Shang and Zhou cosmological traditions. The Pangu creation story first appears in written form in Han-era texts.',
  },
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
    id: 'hindupuranic-khmer',
    from: 'hindu-puranic', to: 'khmer',
    theme: 'water',
    label: 'Hinduism to Southeast Asia',
    description: 'The Khmer Empire adopted Hindu cosmology wholesale via maritime Indian traders and scholars from the 2nd century CE. Angkor Wat\'s Churning of the Ocean is a direct transplant of the Puranic Samudra Manthan myth.',
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
  {
    id: 'ugarit-canaan',
    from: 'ugarit', to: 'canaan',
    theme: 'sky-earth',
    label: 'Ugaritic Baal Cycle → Canaanite / Hebrew religion',
    description: 'The Ugaritic Baal Cycle (14th century BCE) is the direct source of Canaanite mythology and a major substrate of the Hebrew Bible. El (the sky father), Baal (storm god), Yam (sea), Mot (death), and Asherah (earth mother) from the Baal Cycle all appear in later Canaanite and Hebrew texts under the same or cognate names.',
  },
  {
    id: 'elam-sumer',
    from: 'elam', to: 'sumer',
    theme: 'water',
    label: 'Elamite trade & cosmological exchange',
    description: 'Elam and Sumer were closely intertwined neighbors for three millennia. Elamite cylinder seals and religious imagery appear in Sumerian contexts, and lapis lazuli trade via Elam connected Mesopotamia to the Afghan highlands. The Elamite goddess Kiririsha has parallels with Sumerian Inanna / Ninhursag in fertility and underworld functions.',
  },

  // ── Bronze Age Aegean succession ────────────────────────────────
  {
    id: 'minoan-mycenaean',
    from: 'minoan', to: 'mycenaean',
    theme: 'serpent',
    label: 'Minoan palace culture → Mycenaean Greece',
    description: 'Mycenaean Greek culture absorbed Minoan civilization wholesale after c. 1450 BCE. Linear B script (Mycenaean Greek) was adapted from Minoan Linear A. The bull-leaping frescos, snake goddess iconography, double-axe labrys, and labyrinth myth all originate in Minoan Crete and were transplanted into Mycenaean and later Classical Greek religion.',
  },
  {
    id: 'mycenaean-greece',
    from: 'mycenaean', to: 'greece',
    theme: 'hero',
    label: 'Bronze Age heroic tradition → Classical mythology',
    description: 'Classical Greek mythology is largely a literary crystallization of the Mycenaean heroic tradition preserved through the "Dark Ages" in oral epic. The Trojan War, the Olympian pantheon\'s names (Zeus, Hera, Poseidon, Athena all appear in Linear B tablets), and the hero cult all descend directly from Mycenaean Bronze Age religion, filtered through Homer.',
  },

  // ── South Asian lineage ──────────────────────────────────────────
  {
    id: 'indus-vedic',
    from: 'indus-valley', to: 'vedic-india',
    theme: 'serpent',
    label: 'Indus Valley imagery into Vedic tradition',
    description: 'As Vedic Indo-Aryan culture spread across the subcontinent, it absorbed Indus Valley religious elements. The proto-Shiva seated in yogic posture on Indus seals, the sacred peepal tree, serpent veneration, ritual bathing in tanks, and the lingam symbol all appear in both Indus material culture and later Hindu tradition — suggesting absorption rather than simple replacement.',
  },

  // ── East Asian succession ────────────────────────────────────────
  {
    id: 'xia-shang',
    from: 'xia-china', to: 'shang-china',
    theme: 'ancestors',
    label: 'Xia → Shang dynastic-theological continuity',
    description: 'The Shang Dynasty regarded the Xia as a legitimate predecessor whose kings were ancestral spirits worthy of veneration. The oracle bone inscriptions of the Shang record sacrifices to Xia kings alongside Shang ancestors. The cosmological framework of di (heavenly power), ancestral spirits, and divination by bone all flow from Xia through Shang into Han cosmology.',
  },

  // ── African cultural lineage ────────────────────────────────────
  {
    id: 'egypt-aksum',
    from: 'egypt', to: 'aksum',
    theme: 'sun',
    label: 'Egyptian/Coptic tradition to Aksum',
    description: 'The Kingdom of Aksum adopted Christianity in the 4th century CE, but the theology it received was Egyptian Coptic, filtered through Alexandria. Egyptian solar cosmology, the Isis-Osiris resurrection narrative, and divine kingship ideology had been spreading southward toward Ethiopia for millennia via the Nile. The Solomonic dynasty myth linking Aksum to the Hebrew-Egyptian tradition also arrived through this corridor.',
  },
  {
    id: 'yoruba-mali',
    from: 'yoruba', to: 'mali',
    theme: 'creation-from-body',
    label: 'West African cosmological continuum',
    description: 'The Yoruba and Mande-speaking peoples share a West African cosmological substrate — Oduduwa (Yoruba) and Faro (Bambara/Mali) are both cosmic primordial beings associated with water and creation of the world. The Mali Empire\'s oral tradition (preserved in the Sundiata epic and Bambara cosmology) draws on the same root West African mythological complex as the Yoruba Ife creation tradition.',
  },

  // ── Steppe → Medieval ───────────────────────────────────────────
  {
    id: 'scythian-slavic',
    from: 'scythian', to: 'slavic',
    theme: 'ancestors',
    label: 'Scythian steppe religion → Slavic mythology',
    description: 'Early Slavic peoples absorbed significant elements from their Scythian/Sarmatian steppe neighbors — the dual-world cosmology, the role of the wind deity (Slavic Stribog / Scythian wind cults), ancestor veneration through burial mounds (kurgans), and the sacred horse sacrifice (konets) all show Scythian-to-Slavic transmission across the Ukrainian steppe.',
  },

  // ── Prehistoric → Ancient transmission ─────────────────────────
  {
    id: 'siberian-jomon',
    from: 'siberian-shamanic', to: 'jomon',
    theme: 'trance',
    label: 'Siberian shamanism to Jōmon Japan',
    description: 'The Jōmon people of Japan likely migrated from Siberia via the land bridges of the Pleistocene. Their animist, ancestor-centered worldview — including the dogu spirit-figures and bear veneration — closely mirrors Siberian shamanic traditions from which they descend.',
  },
  {
    id: 'siberian-sami',
    from: 'siberian-shamanic', to: 'sami',
    theme: 'trance',
    label: 'Circumpolar shamanism to Sámi',
    description: 'The Sámi noaidi tradition shares core features with Siberian shamanism: the drum as cosmic map, spirit-flight, animal helpers, and the three-world axis. These patterns suggest a shared ancestral shamanic tradition that spread across the circumpolar zone as people followed reindeer herds westward after the last Ice Age.',
  },
  {
    id: 'magdalenian-celtic',
    from: 'magdalenian', to: 'celtic',
    theme: 'animals',
    label: 'Paleolithic sacred landscape to Celtic',
    description: 'Celtic veneration of sacred groves, animals, and the animated landscape inherits a spiritual relationship with the natural world stretching back to the Magdalenian. The same caves and rivers that were sacred in the Upper Paleolithic retained their sanctity through the Neolithic and Bronze Age into Celtic use.',
  },
  {
    id: 'anatolia-sumer',
    from: 'anatolia-neolithic', to: 'sumer',
    theme: 'water',
    label: 'Neolithic Anatolian goddess traditions to Mesopotamia',
    description: 'The Great Mother and bull imagery of Çatalhöyük foreshadow fertility goddesses in Mesopotamian religion. As Anatolian Neolithic farmers spread into the Fertile Crescent and Mesopotamia, their cosmological frameworks — earth as mother, wild animal as sacred force — shaped the later Sumerian religious imagination.',
  },

  // ── Mesoamerican continuum ──────────────────────────────────────
  {
    id: 'olmec-maya',
    from: 'olmec', to: 'maya',
    theme: 'maize',
    label: 'Olmec → Maya cultural succession',
    description: 'The Olmec are the "mother culture" of Mesoamerica. The Maya Maize God, hero-twin myths, Long Count calendar, and ballgame ritual all develop from Olmec prototypes. The were-jaguar deity carries forward as the Jaguar God of the Underworld.',
  },
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
]
