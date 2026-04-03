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
    eras: ['ancient'],
    color: '#d4a017',
    description: `The expansion of Proto-Indo-European speaking peoples from the Pontic-Caspian steppe (modern Ukraine and Kazakhstan) — probably the Yamnaya culture — spread their language and mythology in two great arcs: westward into Europe (becoming Greek, Latin, Celtic, Germanic, and Slavic) and southeastward through Persia into South Asia (becoming Vedic Sanskrit and Avestan). This single originating culture explains the striking structural parallels between Greek Theogony, Norse Eddas, Vedic Purusha Sukta, Celtic druidic myth, and Zoroastrian cosmology: sky-father deities, cosmic sacrifice, storm gods slaying sea serpents, and divine twins.`,
    mythLink: 'The structural parallels between Greek (Ouranos), Vedic (Dyaus Pita), Norse (sky myths), Celtic, and Zoroastrian creation stories are not coincidence — they share a common Proto-Indo-European ancestor tradition carried by this migration.',
    relatedCivIds: ['vedic-india', 'zoroastrian', 'greece', 'celtic', 'norse', 'rome', 'slavic'],
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
    eras: ['ancient'],
    color: '#c9a840',
    description: `The westward branch of the Indo-European dispersal, spreading from the Pontic steppe into Europe through the Bell Beaker culture and later movements. These migrations introduced Proto-Celtic, Proto-Germanic, Proto-Slavic, and Proto-Italic languages — and with them, the shared mythological substrate visible in Greek, Norse, Celtic, Roman, and Slavic creation traditions.`,
    mythLink: 'Greek Theogony, Norse Eddas, Celtic creation myths, Roman cosmogony, and Slavic creation are all western branches of the same Proto-Indo-European tradition carried by this migration.',
    relatedCivIds: ['greece', 'celtic', 'norse', 'rome', 'slavic'],
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
    eras: ['ancient', 'classical', 'medieval'],
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
    eras: ['ancient', 'classical'],
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
    id: 'silk-road',
    label: 'Silk Road',
    dateRange: '200 BCE–1400 CE',
    eras: ['classical', 'medieval'],
    color: '#c4904a',
    description: `The network of overland and maritime trade routes connecting East Asia to the Mediterranean, active for over 1,600 years. The Silk Road was not merely a trade route — it was the world's first intercultural transmission network, carrying Buddhism, Zoroastrianism, Manichaeism, Nestorian Christianity, and Islam eastward, and Taoist and Confucian ideas westward. Creation myths and cosmological concepts traveled with merchants, missionaries, and diplomats: Buddhist cosmology reached China alongside silk; Persian dualism influenced Gnostic Christianity; Indian astronomical systems reached Islamic Baghdad and then medieval Europe.`,
    mythLink: 'The Silk Road explains why Chinese (Pangu), Indian (Puranic), and Persian (Zoroastrian) creation concepts show philosophical cross-pollination despite originating independently — centuries of exchange blurred the boundaries.',
    relatedCivIds: ['shang-china', 'hindu-puranic', 'zoroastrian', 'rome'],
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

  {
    id: 'arab-maritime',
    label: 'Arab Maritime Routes',
    dateRange: '700–1400 CE',
    eras: ['medieval'],
    color: '#b56ab5',
    description: `Arab and Persian merchant-sailors created a maritime network spanning the Indian Ocean from East Africa to Southeast Asia using monsoon winds — a navigation system known since antiquity but systematized and expanded dramatically after the rise of Islam. These routes carried not only trade goods but Islamic cosmology, Quranic creation accounts, and Sufi philosophical interpretations of creation. Arab geographers and traders brought literacy, Islamic scholarship, and new creation narratives to coastal East Africa, South India, the Malabar coast, Sri Lanka, and Maritime Southeast Asia, profoundly shaping the religious traditions of these regions.`,
    mythLink: 'This route traces the spread of Islamic creation cosmology (the Quran\'s account of Allah creating the heavens and earth in six days, and fashioning Adam from clay) through the Indian Ocean world.',
    relatedCivIds: ['canaan', 'zoroastrian', 'vedic-india'],
    waypoints: [
      [21, 39],    // Jeddah / Red Sea (origin)
      [13, 44],    // Aden / Gulf of Aden
      [-4, 40],    // Mombasa (East Africa)
      [-14, 42],   // Mozambique channel
      [13, 50],    // Gulf of Oman
      [22, 59],    // Muscat
      [20, 65],    // Makran coast
      [11, 76],    // Malabar coast (Kerala)
      [6, 80],     // Sri Lanka
      [4, 100],    // Strait of Malacca
      [1, 104],    // Singapore / Java Sea
    ],
  },
]
