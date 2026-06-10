export const migrations = [
  {
    id: 'out-of-africa',
    label: 'Out of Africa',
    dateRange: '70,000–50,000 BCE',
    eras: ['prehistoric'],
    color: '#e8884a',
    description: `The founding dispersal of anatomically modern humans from East Africa. A small group — perhaps only a few hundred individuals — crossed the Arabian Peninsula during a period of wetter climate and green corridors. They spread along coastal routes through South Asia and Southeast Asia, eventually reaching the Australian continent (then connected to New Guinea as "Sahul") by boat or raft at least 50,000 years ago. This migration carried the earliest known spiritual traditions, including the ancestor veneration and animist worldviews that survive in Aboriginal Australian Dreamtime and San Bushmen mythology.`,
    mythLink: 'This route connects the two oldest mythological traditions on this map — the San people\'s /Kaggen and Aboriginal Australian Dreamtime — both rooted in the original human dispersal from Africa.',
    relatedCivIds: ['san-people', 'aboriginal-australia'],
    waypoints: [
      [-3, 36],    // East Africa (origin — Great Rift Valley)
      [11, 43],    // Horn of Africa / Gulf of Aden crossing
      [15, 50],    // Arabian Peninsula (southern coast)
      [24, 57],    // Persian Gulf coastline
      [23, 68],    // Indus corridor (Makran coast)
      [13, 80],    // South India coastline
      [5, 100],    // Malay Peninsula
      [-5, 115],   // Indonesia (Sundaland)
      [-10, 130],  // Wallacea
      [-20, 132],  // Northern Australia (arrival)
    ],
  },

  {
    id: 'peopling-americas',
    label: 'Peopling of the Americas',
    dateRange: '25,000–13,000 BCE',
    eras: ['prehistoric'],
    color: '#9b6ad4',
    description: `Humans crossed into the Americas from Siberia via Beringia — the land bridge now submerged beneath the Bering Strait — during the Last Glacial Maximum when sea levels were 120m lower than today. Two main theories exist: a coastal kelp-highway route by boat along the Pacific coast, and an inland ice-free corridor route through present-day Alberta. Both routes led to rapid dispersal throughout the Americas within a few thousand years, reaching Patagonia by ~12,500 BCE. This single migration event is the source of all pre-Columbian mythological traditions in the Americas, from the Haudenosaunee Sky Woman to the Aztec Five Suns to the Inca Viracocha.`,
    mythLink: 'Every civilization in the Americas on this map — Haudenosaunee, Aztec, Maya, Inca — descends from this founding migration, which is why earth-diver, flood, and sky-world themes recur across cultures with no later contact.',
    relatedCivIds: ['haudenosaunee', 'aztec', 'maya', 'inca'],
    waypoints: [
      [60, 140],   // Siberia (origin)
      [64, 170],   // Eastern Siberia
      [66, -168],  // Beringia crossing
      [63, -158],  // Alaska
      [57, -136],  // Pacific coast corridor
      [47, -122],  // Pacific Northwest
      [35, -115],  // Great Basin
      [20, -100],  // Central Mexico
      [0, -75],    // Colombia / Darien Gap
      [-13, -74],  // Peru (Inca heartland)
      [-40, -65],  // Patagonia
    ],
  },

  {
    id: 'indo-european',
    label: 'Indo-European Dispersal',
    dateRange: '3500–1000 BCE',
    eras: ['bronze-age'],
    color: '#d4a017',
    description: `The expansion of Proto-Indo-European speaking peoples from the Pontic-Caspian steppe (modern Ukraine and Kazakhstan) — probably the Yamnaya culture — spread their language and mythology in two great arcs: westward into Europe (becoming Greek, Latin, Celtic, Germanic, and Slavic) and southeastward through Persia into South Asia (becoming Vedic Sanskrit and Avestan). This single originating culture explains the striking structural parallels between Greek Theogony, Norse Eddas, Vedic Purusha Sukta, Celtic druidic myth, and Zoroastrian cosmology: sky-father deities, cosmic sacrifice, storm gods slaying sea serpents, and divine twins.`,
    mythLink: 'The structural parallels between Greek (Ouranos), Vedic (Dyaus Pita), Norse (sky myths), Celtic, and Zoroastrian creation stories are not coincidence — they share a common Proto-Indo-European ancestor tradition carried by this migration.',
    relatedCivIds: ['vedic-india', 'zoroastrian', 'greece', 'norse', 'rome', 'slavic'],
    waypoints: [
      [48, 38],    // Pontic steppe origin (Ukraine)
      [45, 55],    // Caspian steppe
      [42, 72],    // Central Asian corridor
      [38, 58],    // Bactria / Margiana
      [35, 52],    // Persia (Zoroastrian heartland)
      [30, 68],    // Indus Valley approach
      [24, 78],    // Vedic India (arrival)
    ],
  },

  {
    id: 'indo-european-west',
    label: 'Indo-European — Western Arc',
    dateRange: '3000–500 BCE',
    eras: ['bronze-age', 'iron-age'],
    color: '#c9a840',
    description: `The westward branch of the Indo-European dispersal, spreading from the Pontic steppe into Europe through the Bell Beaker culture and later movements. These migrations introduced Proto-Celtic, Proto-Germanic, Proto-Slavic, and Proto-Italic languages — and with them, the shared mythological substrate visible in Greek, Norse, Celtic, Roman, and Slavic creation traditions.`,
    mythLink: 'Greek Theogony, Norse Eddas, Celtic creation myths, Roman cosmogony, and Slavic creation are all western branches of the same Proto-Indo-European tradition carried by this migration.',
    relatedCivIds: ['greece', 'norse', 'rome', 'slavic'],
    waypoints: [
      [48, 38],    // Pontic steppe origin
      [47, 28],    // Romania / Balkans
      [42, 22],    // Greece (arrival)
      [45, 14],    // Adriatic coast
      [42, 12],    // Italy (Rome)
      [47, 8],     // Alpine corridor
      [48, 2],     // Gaul (Celtic)
      [55, 10],    // Germanic heartland
      [58, 14],    // Scandinavia (Norse)
      [52, 26],    // Slavic lands
    ],
  },

  {
    id: 'austronesian',
    label: 'Austronesian Expansion',
    dateRange: '3000 BCE–1300 CE',
    eras: ['bronze-age', 'iron-age', 'classical', 'medieval'],
    color: '#4a8ab5',
    description: `The most extraordinary maritime migration in human history. Beginning from Taiwan around 3000 BCE, Austronesian-speaking peoples island-hopped through the Philippines, Indonesia, and Melanesia into the open Pacific in outrigger canoes — navigating by stars, swells, and bird flight with no instruments. They reached Hawaii (~800 CE), Easter Island (~1200 CE), and New Zealand (~1280 CE). This explains why Polynesian, Maori, and Hawaiian cosmologies are so structurally similar — they share a single ancestral tradition. The Kumulipo, Maori Rangi-and-Papa, and Polynesian creation chants are regional variations of the same source.`,
    mythLink: 'Polynesian (Kumulipo), Maori (Rangi and Papa), and Hawaiian cosmologies are not parallel inventions — they are the same tradition carried by this single extraordinary migration across 10,000 miles of open ocean.',
    relatedCivIds: ['maori', 'polynesian'],
    waypoints: [
      [23, 121],   // Taiwan (origin)
      [13, 122],   // Philippines
      [1, 110],    // Borneo / Indonesia
      [-8, 118],   // Lesser Sunda Islands
      [-9, 148],   // Papua New Guinea coast
      [-18, 168],  // Vanuatu
      [-18, 178],  // Fiji
      [-14, -170], // Samoa
      [-16, -151], // Tahiti / Society Islands
      [20, -157],  // Hawaii (arrival ~800 CE)
      [-27, -109], // Easter Island (~1200 CE)
      [-41, 172],  // New Zealand / Maori (arrival ~1280 CE)
    ],
  },

  {
    id: 'bantu',
    label: 'Bantu Expansion',
    dateRange: '1000 BCE–500 CE',
    eras: ['iron-age', 'classical'],
    color: '#6ab55a',
    description: `The spread of Bantu-speaking agricultural peoples from the Nigeria-Cameroon border region throughout central, eastern, and southern Africa over approximately 1,500 years. This expansion introduced iron-working, agriculture, and — crucially — a shared mythological substrate. Bantu-speaking peoples today include the Zulu, Shona, Kikuyu, and hundreds of other ethnic groups whose creation traditions share common structural features: a high god (Mulungu, Nyambe, Katonda) who creates and then withdraws, primal humans who displease the creator, and myths explaining the origin of death.`,
    mythLink: 'The Yoruba (West Africa) and Zulu (Southern Africa) traditions are connected by this expansion — both descended from a West African origin tradition that spread south and east with Bantu-speaking agriculturalists.',
    relatedCivIds: ['yoruba', 'san-people'],
    waypoints: [
      [5, 12],     // Nigeria-Cameroon border (origin)
      [-3, 18],    // Congo Basin
      [-6, 28],    // Great Lakes region
      [-12, 32],   // Zambia / Malawi corridor
      [-20, 30],   // Zimbabwe plateau
      [-26, 28],   // South Africa (Zulu heartland, arrival)
    ],
  },

  {
    id: 'aryan-migration',
    label: 'Indo-Aryan Migration',
    dateRange: '2000–1200 BCE',
    eras: ['bronze-age', 'iron-age'],
    color: '#c9841a',
    description: `The migration of Indo-Iranian speaking peoples from the Pontic-Caspian steppe (related to the Yamnaya culture) southeastward through Central Asia into the Iranian plateau and the Indian subcontinent. Moving through the Bactria-Margiana Archaeological Complex (BMAC) in modern Afghanistan and Uzbekistan, one branch entered Persia to become the Zoroastrian tradition; another crossed the Hindu Kush and descended into the Indus Valley, absorbing and displacing the Harappan civilization. These migrants brought the Proto-Indo-Iranian religion — fire sacrifice, soma ritual, sky-father deity, and warrior epics — which became the Rigveda in India and the Avesta in Persia. Archaeological and genetic evidence confirms a massive Bronze Age migration from the steppe into South Asia around 2000–1500 BCE.`,
    mythLink: 'Vedic India and Zoroastrian Persia are both direct products of this migration — the Rigveda and the Avesta are two branches of the same Proto-Indo-Iranian ritual tradition, separated when one group turned south into India and another settled Persia.',
    relatedCivIds: ['yamnaya', 'vedic-india', 'zoroastrian'],
    waypoints: [
      [47, 40],    // Yamnaya steppe (origin — North Caucasus/Pontic)
      [44, 55],    // Caspian corridor
      [40, 62],    // Turkmenistan / BMAC western edge
      [37, 65],    // Bactria-Margiana (BMAC core)
      [34, 62],    // Afghan plateau
      [33, 57],    // → Persia (Zoroastrian branch arrival)
      [30, 67],    // Makran coast / Balochistan
      [27, 68],    // Indus Valley corridor
      [24, 72],    // Vedic heartland (Sarasvati / Ganges plain)
    ],
  },

  {
    id: 'phoenician-expansion',
    label: 'Phoenician Maritime Expansion',
    dateRange: '1100–500 BCE',
    eras: ['iron-age'],
    color: '#8b44c9',
    description: `Starting from city-states on the Levantine coast (modern Lebanon), Phoenician sailors established the ancient world's most extensive maritime trading network. Master navigators and shipbuilders, they founded colonies across the Mediterranean: Kition in Cyprus, Carthage in North Africa (814 BCE), Gadir (modern Cádiz) in Spain, and dozens of way stations on the Sicilian, Sardinian, and North African coasts. Their most transformative export was not purple dye or glass but the alphabet — the Phoenician script (itself descended from Canaanite/Ugaritic proto-alphabets) was adapted by the Greeks and became the ancestor of every Western alphabet in use today. Phoenician sailors also carried Canaanite mythological motifs — El and Baal — into the Greek Aegean world, directly influencing early Greek theogony.`,
    mythLink: 'The Greek figure of Kronos parallels the Canaanite El, and the Baal Cycle\'s storm-god defeating a sea serpent foreshadows Zeus vs. Typhon — these mythological transfers traveled on Phoenician trading ships across the Mediterranean.',
    relatedCivIds: ['canaan', 'greece', 'rome'],
    waypoints: [
      [33.5, 35.5], // Sidon / Tyre (origin — Phoenician heartland)
      [35.0, 33.0], // Cyprus (Kition)
      [35.2, 25.0], // Crete (way station)
      [37.5, 15.0], // Sicily (Motya)
      [36.8, 10.2], // Carthage (North Africa — 814 BCE)
      [39.0, 9.0],  // Sardinia
      [39.5, 2.5],  // Balearic Islands
      [36.5, -6.3], // Gadir / Cádiz (westernmost colony)
    ],
  },

  {
    id: 'nile-corridor',
    label: 'Nile Cultural Corridor',
    dateRange: '3000–500 BCE',
    eras: ['bronze-age', 'iron-age'],
    color: '#4a9e7a',
    description: `The Nile River was not merely a waterway but a 6,000-kilometer cultural corridor linking the Mediterranean world to sub-Saharan Africa. For three millennia, Egyptian and Nubian civilizations existed in a dynamic relationship of trade, warfare, and mythological exchange that flowed along its banks. Egypt exported its state religion southward — the cults of Amun, Isis, and Osiris took root at Napata and Meroe — while Nubia sent its own theological innovations northward: the ram-headed Amun cult, which reached its canonical form at Jebel Barkal in Nubia, may have originated there before becoming Egypt's supreme deity. In the 8th century BCE, Nubian pharaohs of the 25th Dynasty ruled all Egypt, bringing Kushite religious practices to the Nile Delta. This was one of history's most sustained two-directional cultural transmissions.`,
    mythLink: 'The Nubian sky-god and divine kingship theology shaped Egyptian New Kingdom religion as much as Egypt shaped Nubia — the Amun of Karnak and the Amun of Jebel Barkal were in continuous theological dialogue for 2,500 years.',
    relatedCivIds: ['egypt', 'nubia'],
    waypoints: [
      [30.0, 31.0], // Nile Delta / Memphis (origin)
      [27.0, 31.0], // Upper Egypt / Thebes
      [24.0, 32.5], // First Cataract (Aswan)
      [20.0, 33.0], // Kerma / Napata
      [16.5, 33.0], // Meroe (Nubian heartland)
      [14.5, 39.0], // Aksum (southern endpoint — Ethiopian highlands)
    ],
  },

  {
    id: 'silk-road',
    label: 'Silk Road',
    dateRange: '200 BCE–1400 CE',
    eras: ['classical', 'medieval'],
    color: '#c4904a',
    description: `The network of overland and maritime trade routes connecting East Asia to the Mediterranean, active for over 1,600 years. The Silk Road was not merely a trade route — it was the world's first intercultural transmission network, carrying Buddhism, Zoroastrianism, Manichaeism, Nestorian Christianity, and Islam eastward, and Taoist and Confucian ideas westward. Creation myths and cosmological concepts traveled with merchants, missionaries, and diplomats: Buddhist cosmology reached China alongside silk; Persian dualism influenced Gnostic Christianity; Indian astronomical systems reached Islamic Baghdad and then medieval Europe.`,
    mythLink: 'The Silk Road explains why Chinese (Pangu), Indian (Puranic), and Persian (Zoroastrian) creation concepts show philosophical cross-pollination despite originating independently — centuries of exchange blurred the boundaries.',
    relatedCivIds: ['hindu-puranic', 'zoroastrian', 'rome'],
    waypoints: [
      [34, 109],   // Chang'an (Xi'an) — eastern terminus
      [40, 82],    // Dunhuang / Tarim Basin
      [40, 68],    // Samarkand
      [38, 58],    // Merv (Turkmenistan)
      [36, 52],    // Tehran corridor
      [33, 44],    // Baghdad / Mesopotamia
      [36, 36],    // Antioch / Levant
      [37, 27],    // Ephesus
      [42, 12],    // Rome — western terminus
    ],
  },

]
