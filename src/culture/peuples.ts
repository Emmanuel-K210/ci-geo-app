// The peoples of Côte d'Ivoire, by the five large language groups. Texts are
// short summaries for general readers; `wiki` is the French Wikipedia article
// they can be checked against, and where the photo comes from.

export type Groupe = {
  id: string
  nom: string
  /** Where they mostly live. */
  aire: string
  origine: string[]
  wiki: string
}

export type Peuple = {
  id: string
  nom: string
  groupeId: string
  /** Cities of the reference where they are at home (ids without « ci-v- »). */
  villes: string[]
  resume: string
  histoire: string[]
  culture: string[]
  /** Clues that do not give the name away, for the games. */
  indices: string[]
  wiki: string
}

export const GROUPES: Groupe[] = [
  {
    id: "akan",
    nom: "Akan",
    aire: "Centre, est et sud-est",
    origine: [
      "Beaucoup de peuples akan sont arrivés de l'actuel Ghana entre le XVIIe et le XVIIIe siècle, poussés par des guerres de succession et par l'expansion du royaume ashanti.",
      "Ils ont fondé en Côte d'Ivoire des royaumes toujours vivants, comme le Sanwi autour de Krinjabo, l'Indénié autour d'Abengourou ou le Gyaman autour de Bondoukou. Les peuples des lagunes, autour d'Abidjan, appartiennent aussi à ce groupe.",
      "Rois et chefs, or, tabourets sacrés et fête des ignames sont des traits que beaucoup d'entre eux partagent.",
    ],
    wiki: "Akan (peuple)",
  },
  {
    id: "krou",
    nom: "Krou",
    aire: "Sud-ouest et ouest",
    origine: [
      "Les Krou sont comptés parmi les plus anciens habitants de la forêt de l'ouest ivoirien. Ils sont apparentés aux peuples kru du Liberia voisin.",
      "Leur société repose sur des lignages et des villages autonomes plutôt que sur de grands royaumes. La parole, le chant et la danse y tiennent une place centrale.",
    ],
    wiki: "Krou (peuple)",
  },
  {
    id: "mande-nord",
    nom: "Mandé du Nord",
    aire: "Nord-ouest, et les villes marchandes de tout le pays",
    origine: [
      "Héritiers du Manden, le berceau de l'empire du Mali, les Mandé du Nord se sont installés dans le nord-ouest au fil des siècles.",
      "Leurs commerçants, les Dioula, ont ouvert les routes de la kola, de l'or et du tissu entre la savane et la forêt. Leur langue est devenue celle des marchés dans tout le pays.",
    ],
    wiki: "Mandingues",
  },
  {
    id: "mande-sud",
    nom: "Mandé du Sud",
    aire: "Ouest montagneux et centre-ouest",
    origine: [
      "Venus il y a plusieurs siècles des savanes du nord-ouest, les Mandé du Sud se sont fixés dans les montagnes de l'ouest et dans la forêt du centre-ouest.",
      "Leurs langues sont cousines du malinké, mais leur culture s'est fondue dans la forêt : masques, danses et sociétés d'initiation y règlent la vie du village.",
    ],
    wiki: "Langues mandées",
  },
  {
    id: "gur",
    nom: "Gur (Voltaïques)",
    aire: "Nord et nord-est",
    origine: [
      "Parmi les plus anciens occupants des savanes du nord, les peuples gur parlent des langues apparentées à celles du Burkina Faso et du Ghana voisins.",
      "Agriculteurs réputés, ils ont développé des sociétés d'initiation puissantes et des arts majeurs : sculpture, balafon, toiles peintes, architecture de terre.",
    ],
    wiki: "Langues gour",
  },
]

export const PEUPLES: Peuple[] = [
  // Akan
  {
    id: "baoule",
    nom: "Baoulé",
    groupeId: "akan",
    villes: [
      "bouake",
      "yamoussoukro",
      "toumodi",
      "tiebissou",
      "beoumi",
      "dimbokro",
      "daoukro",
    ],
    resume:
      "Le peuple du centre, autour de Bouaké et de Yamoussoukro, né d'un exode et d'un sacrifice.",
    histoire: [
      "Au XVIIIe siècle, après la mort d'un roi ashanti, une guerre de succession éclate. La princesse Abla Pokou fuit vers l'ouest avec les siens.",
      "La légende raconte qu'arrivés devant le fleuve Comoé en crue, poursuivis par leurs ennemis, les fugitifs ne trouvent aucun passage. Le devin annonce que le fleuve exige le plus précieux des enfants. Pokou offre son propre fils ; les arbres se courbent et forment un pont, ou les hippopotames s'alignent, selon les versions.",
      "Une fois de l'autre côté, la reine aurait murmuré « ba ouli » : « l'enfant est mort ». Le peuple prend ce nom, Baoulé, et s'installe dans les savanes du centre.",
    ],
    culture: [
      "Masques Goli, qui dansent lors des funérailles et des grandes fêtes.",
      "Statuettes « mari ou épouse de l'autre monde », sculptées pour apaiser un conjoint spirituel.",
      "Pagnes tissés en bandes, dont le kita, et orfèvrerie en or.",
    ],
    indices: [
      "Leur nom viendrait d'une phrase de leur reine : « l'enfant est mort ».",
      "La reine Abla Pokou les a conduits jusqu'au centre du pays.",
      "Ils dansent le masque Goli.",
    ],
    wiki: "Baoulés",
  },
  {
    id: "agni",
    nom: "Agni",
    groupeId: "akan",
    villes: ["abengourou", "aboisso", "bongouanou"],
    resume:
      "Les gens des royaumes de l'est : le Sanwi à Krinjabo, l'Indénié à Abengourou.",
    histoire: [
      "Venus de l'actuel Ghana à partir du XVIIe siècle, les Agni fondent plusieurs royaumes dans l'est forestier.",
      "Le royaume du Sanwi, autour de Krinjabo près d'Aboisso, traite très tôt avec les Européens sur la côte. Celui de l'Indénié a pour capitale Abengourou, où le roi réside toujours.",
    ],
    culture: [
      "Cour royale, porte-cannes et tabourets symboles du pouvoir.",
      "Fête des ignames, qui marque la nouvelle récolte.",
      "Terres cuites funéraires anciennes, représentant les défunts.",
    ],
    indices: [
      "Leur royaume du Sanwi a pour capitale Krinjabo.",
      "Le roi de l'Indénié réside à Abengourou.",
    ],
    wiki: "Agnis",
  },
  {
    id: "abron",
    nom: "Abron",
    groupeId: "akan",
    villes: ["bondoukou"],
    resume: "Le peuple du royaume du Gyaman, au nord-est, autour de Bondoukou.",
    histoire: [
      "À la fin du XVIIe siècle, des Abron venus du pays ashanti fondent le royaume du Gyaman, entre l'actuelle Côte d'Ivoire et l'actuel Ghana.",
      "Ils y vivent aux côtés des commerçants dioula de Bondoukou et des Koulango, plus anciens dans la région.",
    ],
    culture: [
      "Royauté et fête des ignames.",
      "Voisinage ancien avec les Dioula et les Koulango.",
    ],
    indices: [
      "Leur royaume s'appelle le Gyaman.",
      "Ils vivent autour de Bondoukou.",
    ],
    wiki: "Abron (peuple)",
  },
  {
    id: "ebrie",
    nom: "Ébrié",
    groupeId: "akan",
    villes: ["abidjan"],
    resume:
      "Les premiers habitants des rives de la lagune où s'est construite Abidjan.",
    histoire: [
      "Les Ébrié, qui se nomment eux-mêmes Tchaman, occupaient les bords de la lagune bien avant la ville moderne.",
      "Leurs villages sont aujourd'hui des quartiers d'Abidjan, et la lagune Ébrié porte leur nom.",
    ],
    culture: [
      "Classes d'âge : les hommes d'une même génération forment un groupe, célébré par de grandes fêtes de génération.",
      "Pêche lagunaire et villages restés au cœur de la ville.",
    ],
    indices: [
      "La lagune d'Abidjan porte leur nom.",
      "Ils se nomment eux-mêmes Tchaman.",
    ],
    wiki: "Ébriés",
  },
  {
    id: "nzima",
    nom: "N'zima",
    groupeId: "akan",
    villes: ["grand-bassam"],
    resume: "Le peuple de Grand-Bassam, qui célèbre chaque année l'Abissa.",
    histoire: [
      "Les N'zima vivent sur la côte, de part et d'autre de la frontière avec le Ghana. Une partie d'entre eux s'est installée à Grand-Bassam.",
    ],
    culture: [
      "L'Abissa, à la fin octobre ou au début novembre : pendant une semaine de tambours et de danses, chacun peut dire publiquement ce qu'il reproche aux autres, même aux chefs, sans être puni. On se purifie pour commencer l'année réconcilié.",
    ],
    indices: [
      "Ils célèbrent l'Abissa à Grand-Bassam.",
      "Pendant leur grande fête, on peut critiquer les chefs sans crainte.",
    ],
    wiki: "Nzema (peuple)",
  },
  {
    id: "attie",
    nom: "Attié",
    groupeId: "akan",
    villes: ["adzope", "akoupe"],
    resume: "Le peuple de la forêt d'Adzopé et d'Akoupé, au nord d'Abidjan.",
    histoire: [
      "Les Attié, ou Akyé, occupent la forêt au nord de la lagune, dans la région de la Mé.",
    ],
    culture: [
      "Classes d'âge et fêtes de génération, comme chez leurs voisins des lagunes.",
      "Grande région de cacao et de café.",
    ],
    indices: ["On les appelle aussi Akyé.", "Ils vivent autour d'Adzopé."],
    wiki: "Attié (peuple)",
  },

  // Krou
  {
    id: "bete",
    nom: "Bété",
    groupeId: "krou",
    villes: ["gagnoa", "daloa", "issia", "soubre"],
    resume:
      "Le grand peuple du centre-ouest, de Gagnoa à Daloa, connu pour ses chants et ses danses.",
    histoire: [
      "Installés dans la forêt du centre-ouest, les Bété vivaient en villages autonomes groupés par lignages, sans pouvoir central.",
      "Au XXe siècle, la région devient l'un des cœurs de l'économie du cacao et du café.",
    ],
    culture: [
      "Polyphonies vocales et danses comme l'alloukou.",
      "Les musiques de l'ouest ont nourri le zouglou, né à Abidjan vers 1990 dans le milieu étudiant.",
    ],
    indices: [
      "Ils vivent autour de Gagnoa et de Daloa.",
      "On leur doit la danse alloukou.",
    ],
    wiki: "Bétés",
  },
  {
    id: "dida",
    nom: "Dida",
    groupeId: "krou",
    villes: ["divo", "lakota"],
    resume: "Le peuple de Divo et de Lakota, maître des tissus de raphia.",
    histoire: [
      "Les Dida occupent la forêt entre le Bandama et la côte, dans la région de Divo et de Lakota.",
    ],
    culture: [
      "Pagnes en fibres de raphia, noués et teints, aux motifs géométriques.",
    ],
    indices: [
      "Ils tissent de célèbres pagnes en raphia.",
      "Ils vivent autour de Divo et de Lakota.",
    ],
    wiki: "Dida (peuple)",
  },
  {
    id: "we",
    nom: "Wè",
    groupeId: "krou",
    villes: ["duekoue", "guiglo"],
    resume:
      "Les Guéré et les Wobé de l'ouest, peuple des grands masques justiciers.",
    histoire: [
      "Les Wè, que l'on appelle aussi Guéré et Wobé, vivent dans la forêt de l'ouest, autour de Duékoué et de Guiglo.",
    ],
    culture: [
      "Masques aux traits puissants, garnis de dents, de cornes ou de clochettes : ils jugent, apaisent les conflits et maintiennent l'ordre du village.",
    ],
    indices: [
      "On les appelle aussi Guéré et Wobé.",
      "Leurs masques rendent la justice au village.",
    ],
    wiki: "Wés",
  },
  {
    id: "kroumen",
    nom: "Kroumen",
    groupeId: "krou",
    villes: ["tabou", "san-pedro"],
    resume:
      "Le peuple de la côte sud-ouest, marins célèbres de l'Afrique de l'Ouest.",
    histoire: [
      "Du XIXe siècle au milieu du XXe, les hommes kroumen de la région de Tabou s'engageaient sur les navires européens qui longeaient la côte : chargement, pilotage, équipage.",
      "Leur réputation était telle que « krouman » finit par désigner, dans les ports, n'importe quel marin de la côte africaine.",
    ],
    culture: ["Pêche en mer et villages de la côte, de Tabou à San-Pédro."],
    indices: [
      "Ils furent des marins réputés sur les navires européens.",
      "Ils vivent autour de Tabou.",
    ],
    wiki: "Kroumen",
  },

  // Mandé du Nord
  {
    id: "malinke",
    nom: "Malinké",
    groupeId: "mande-nord",
    villes: ["odienne", "minignan", "touba", "seguela"],
    resume: "Les héritiers du Manden, dans le nord-ouest, d'Odienné à Séguéla.",
    histoire: [
      "Descendants des populations de l'empire du Mali, les Malinké s'installent dans le nord-ouest au fil des siècles.",
      "Au XIXe siècle, Odienné devient la capitale du royaume du Kabadougou.",
    ],
    culture: [
      "Griots, gardiens de la mémoire des familles, chantée avec la kora ou le balafon.",
      "Islam ancien et mosquées de terre.",
    ],
    indices: [
      "Leurs ancêtres venaient de l'empire du Mali.",
      "Odienné est l'une de leurs capitales.",
    ],
    wiki: "Malinkés",
  },
  {
    id: "dioula",
    nom: "Dioula",
    groupeId: "mande-nord",
    villes: ["bondoukou"],
    resume:
      "Les commerçants qui ont donné leur langue aux marchés de tout le pays.",
    histoire: [
      "« Dioula » veut dire commerçant. Ces marchands mandé ont relié pendant des siècles les savanes du nord et la forêt du sud, échangeant kola, or, sel et tissus.",
      "Au début du XVIIIe siècle, Sékou Ouattara fait de Kong la capitale d'un puissant État commerçant et musulman. Kong est détruite par Samory Touré en 1897.",
    ],
    culture: [
      "Le dioula est la langue la plus parlée dans les marchés et les gares routières du pays.",
      "Mosquées de terre de style soudanais, à Kong et dans tout le nord.",
    ],
    indices: [
      "Leur nom veut dire « commerçant ».",
      "Kong fut leur grande capitale marchande.",
    ],
    wiki: "Dioula (peuple)",
  },

  // Mandé du Sud
  {
    id: "dan",
    nom: "Dan (Yacouba)",
    groupeId: "mande-sud",
    villes: ["man", "danane"],
    resume: "Le peuple des montagnes de Man, des masques et des échassiers.",
    histoire: [
      "Les Dan, que l'on appelle aussi Yacouba, vivent dans la région montagneuse de Man et de Danané, à cheval sur la Guinée et le Liberia.",
    ],
    culture: [
      "Les masques y sont des esprits de la forêt : certains éduquent, d'autres jugent ou font rire.",
      "Les échassiers dansent perchés sur de hautes échasses, sous de longues jupes de raphia.",
      "Ponts de lianes tendus au-dessus des rivières, qui selon la tradition sont tissés en une nuit par des initiés.",
    ],
    indices: [
      "On les appelle aussi Yacouba.",
      "Leurs échassiers dansent au-dessus de la foule.",
    ],
    wiki: "Dan (peuple)",
  },
  {
    id: "gouro",
    nom: "Gouro",
    groupeId: "mande-sud",
    villes: ["bouafle", "sinfra"],
    resume: "Le peuple du centre-ouest, celui du Zaouli.",
    histoire: [
      "Les Gouro vivent entre forêt et savane, dans la région de la Marahoué, autour de Bouaflé, Sinfra et Zuénoula.",
    ],
    culture: [
      "Le Zaouli, danse masquée aux pas d'une vitesse étonnante, inscrit au patrimoine culturel immatériel de l'UNESCO en 2017. Selon la tradition la plus racontée, son masque rend hommage à une jeune fille d'une grande beauté nommée Zaouli.",
      "Masques et sculptures sur bois d'une grande finesse.",
    ],
    indices: [
      "Ils dansent le Zaouli.",
      "Ils vivent autour de Bouaflé et de Sinfra.",
    ],
    wiki: "Gouro (peuple)",
  },

  // Gur
  {
    id: "senoufo",
    nom: "Sénoufo",
    groupeId: "gur",
    villes: ["korhogo", "boundiali", "ferkessedougou"],
    resume:
      "Le grand peuple du nord, autour de Korhogo : Poro, balafon et toiles peintes.",
    histoire: [
      "Les Sénoufo occupent depuis des siècles les savanes du nord, entre la Côte d'Ivoire, le Mali et le Burkina Faso.",
      "Korhogo, leur grande ville, est la capitale du pays sénoufo.",
    ],
    culture: [
      "Le Poro, société d'initiation qui forme les jeunes hommes pendant de longues années, par cycles.",
      "Le balafon : ses pratiques chez les Sénoufo sont inscrites au patrimoine immatériel de l'UNESCO.",
      "Toiles de Korhogo peintes à la main, forgerons de Koni et potières de la région de Katiola.",
    ],
    indices: [
      "Korhogo est la capitale de leur pays.",
      "Leurs jeunes hommes sont initiés par le Poro.",
    ],
    wiki: "Sénoufos",
  },
  {
    id: "lobi",
    nom: "Lobi",
    groupeId: "gur",
    villes: ["bouna"],
    resume:
      "Le peuple du nord-est, autour de Bouna, aux maisons-forteresses de terre.",
    histoire: [
      "Venus des bords de la Volta noire aux XVIIIe et XIXe siècles, les Lobi se sont installés autour de Bouna, à la frontière du Burkina Faso et du Ghana.",
    ],
    culture: [
      "Maisons de terre aux murs épais et sans ouverture sur l'extérieur, véritables forteresses familiales.",
      "Statuettes bateba, gardiennes de la maison, et maniement de l'arc.",
    ],
    indices: [
      "Leurs maisons de terre sont de vraies forteresses.",
      "Ils sculptent les statuettes bateba.",
    ],
    wiki: "Lobi (peuple)",
  },
  {
    id: "koulango",
    nom: "Koulango",
    groupeId: "gur",
    villes: ["bouna", "bondoukou"],
    resume: "Le peuple ancien du royaume de Bouna, au nord-est.",
    histoire: [
      "Les Koulango comptent parmi les plus anciens habitants du nord-est. Bouna fut la capitale de leur royaume.",
    ],
    culture: [
      "Royauté de Bouna, voisinage avec les Lobi, les Abron et les Dioula.",
    ],
    indices: ["Bouna fut la capitale de leur royaume."],
    wiki: "Koulango (peuple)",
  },
]

export const groupeById = (id: string) => GROUPES.find((g) => g.id === id)
export const peupleById = (id: string) => PEUPLES.find((p) => p.id === id)
export const peuplesDe = (groupeId: string) =>
  PEUPLES.filter((p) => p.groupeId === groupeId)
