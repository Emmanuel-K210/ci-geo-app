// Places worth the trip, each with the story behind it. Coordinates are rounded
// (about 1 km); `wiki` is the French Wikipedia article the photo comes from.

export type SiteCategorie =
  "patrimoine" | "nature" | "foi" | "culture" | "plage"

export type Site = {
  id: string
  nom: string
  categorie: SiteCategorie
  lat: number
  lon: number
  /** The city of the reference it belongs to (id without « ci-v- »). */
  ville: string
  /** Year of the UNESCO World Heritage listing. */
  unesco?: number
  resume: string
  histoire: string[]
  aSavoir: string[]
  /** Clues that do not give the name away, for the games. */
  indices: string[]
  wiki: string
}

export const CATEGORIES: Record<SiteCategorie, string> = {
  patrimoine: "Patrimoine",
  nature: "Nature",
  foi: "Lieux de culte",
  culture: "Culture",
  plage: "Côte",
}

export const SITES: Site[] = [
  {
    id: "basilique-yamoussoukro",
    nom: "Basilique Notre-Dame-de-la-Paix",
    categorie: "foi",
    lat: 6.81,
    lon: -5.3,
    ville: "yamoussoukro",
    resume:
      "L'une des plus grandes églises du monde, dressée dans la savane de Yamoussoukro.",
    histoire: [
      "Le président Félix Houphouët-Boigny fait bâtir la basilique dans sa ville natale, devenue capitale politique du pays en 1983. Le chantier dure de 1985 à 1989.",
      "Inspirée de Saint-Pierre de Rome, elle est consacrée par le pape Jean-Paul II le 10 septembre 1990. Sa coupole, surmontée d'une croix, culmine à environ 158 mètres.",
    ],
    aSavoir: [
      "Ses vitraux couvrent des milliers de mètres carrés ; sur l'un d'eux figure Houphouët-Boigny parmi les apôtres.",
      "Non loin, autour du palais présidentiel, des lacs abritent des crocodiles nourris chaque jour.",
    ],
    indices: [
      "Elle est inspirée de Saint-Pierre de Rome.",
      "Jean-Paul II l'a consacrée en 1990.",
    ],
    wiki: "Basilique Notre-Dame-de-la-Paix de Yamoussoukro",
  },
  {
    id: "grand-bassam",
    nom: "Ville historique de Grand-Bassam",
    categorie: "patrimoine",
    lat: 5.2,
    lon: -3.74,
    ville: "grand-bassam",
    unesco: 2012,
    resume:
      "La première capitale de la colonie, ses maisons à galeries et son quartier France.",
    histoire: [
      "Comptoir commercial sur la côte, Grand-Bassam devient en 1893 la première capitale de la colonie de Côte d'Ivoire.",
      "En 1899, une épidémie de fièvre jaune décime la ville : la capitale part à Bingerville en 1900. Le quartier France, avec ses maisons coloniales, son ancien palais du gouverneur et ses entrepôts, est inscrit au patrimoine mondial de l'UNESCO en 2012.",
    ],
    aSavoir: [
      "L'ancien palais du gouverneur abrite le Musée national du costume.",
      "Chaque année, les N'zima y célèbrent l'Abissa.",
    ],
    indices: [
      "Ce fut la première capitale de la colonie.",
      "La fièvre jaune a fait partir la capitale en 1900.",
    ],
    wiki: "Ville historique de Grand-Bassam",
  },
  {
    id: "tai",
    nom: "Parc national de Taï",
    categorie: "nature",
    lat: 5.75,
    lon: -7.1,
    ville: "soubre",
    unesco: 1982,
    resume:
      "L'un des derniers grands morceaux de forêt primaire d'Afrique de l'Ouest.",
    histoire: [
      "Protégé depuis les années 1920 puis parc national en 1972, Taï conserve une forêt tropicale primaire immense, inscrite au patrimoine mondial en 1982.",
      "Ses chimpanzés y sont célèbres : ils cassent des noix avec des pierres et des morceaux de bois posés sur des racines, comme un marteau sur une enclume. Les chercheurs les observent depuis des décennies.",
    ],
    aSavoir: [
      "On y trouve l'hippopotame pygmée, petit et discret, qui vit en forêt.",
      "Le parc abrite aussi de nombreuses espèces de singes et des céphalophes.",
    ],
    indices: [
      "Ses chimpanzés cassent des noix avec des pierres.",
      "On y croise l'hippopotame pygmée.",
    ],
    wiki: "Parc national de Taï",
  },
  {
    id: "comoe",
    nom: "Parc national de la Comoé",
    categorie: "nature",
    lat: 8.85,
    lon: -3.75,
    ville: "bouna",
    unesco: 1983,
    resume:
      "L'une des plus grandes aires protégées d'Afrique de l'Ouest, traversée par le fleuve Comoé.",
    histoire: [
      "Sur plus de 11 000 km², savanes, forêts galeries et fleuve se partagent le parc, inscrit au patrimoine mondial en 1983.",
      "Placé sur la liste du patrimoine en péril en 2003 pendant la crise, il en est retiré en 2017 grâce au retour des patrouilles et de la faune.",
    ],
    aSavoir: [
      "Éléphants, hippopotames, buffles, antilopes et chimpanzés y vivent.",
      "C'est le même fleuve Comoé que la reine Abla Pokou aurait franchi.",
    ],
    indices: [
      "Il a quitté la liste du patrimoine en péril en 2017.",
      "C'est l'un des plus grands parcs d'Afrique de l'Ouest.",
    ],
    wiki: "Parc national de la Comoé",
  },
  {
    id: "nimba",
    nom: "Mont Nimba",
    categorie: "nature",
    lat: 7.62,
    lon: -8.42,
    ville: "danane",
    unesco: 1981,
    resume:
      "Le point culminant du pays, 1 752 mètres, à la frontière de la Guinée et du Liberia.",
    histoire: [
      "Le mont Nimba dresse ses crêtes au-dessus de la forêt et des savanes d'altitude. Sa réserve naturelle intégrale, partagée avec la Guinée, est inscrite au patrimoine mondial.",
      "Il abrite des espèces qu'on ne trouve nulle part ailleurs, comme le crapaud vivipare du Nimba, qui met au monde des petits déjà formés au lieu de pondre.",
    ],
    aSavoir: [
      "Son sommet, le mont Richard-Molard, est le point le plus haut de la Côte d'Ivoire et de la Guinée.",
    ],
    indices: [
      "C'est le point culminant du pays.",
      "Un crapaud qui ne pond pas d'œufs y vit.",
    ],
    wiki: "Mont Nimba",
  },
  {
    id: "kong",
    nom: "Mosquées de Kong",
    categorie: "foi",
    lat: 9.15,
    lon: -4.61,
    ville: "ferkessedougou",
    unesco: 2021,
    resume:
      "Les mosquées de terre de l'ancienne capitale marchande des Dioula.",
    histoire: [
      "Au début du XVIIIe siècle, Sékou Ouattara fait de Kong la capitale d'un État commerçant et un grand centre d'études islamiques. En 1897, la ville est détruite par Samory Touré.",
      "Ses mosquées en terre crue, de style soudanais, sont hérissées de pieux de bois : ils servent d'échafaudage quand on refait l'enduit après la saison des pluies. Avec d'autres mosquées du nord, comme celles de Kouto et de Tengréla, elles sont inscrites au patrimoine mondial en 2021.",
    ],
    aSavoir: [
      "Le recrépissage est un travail collectif, que tout le quartier accomplit ensemble.",
    ],
    indices: [
      "Ses mosquées de terre sont hérissées de pieux de bois.",
      "Samory Touré a détruit la ville en 1897.",
    ],
    wiki: "Mosquée de Kong",
  },
  {
    id: "man",
    nom: "Man et la Dent de Man",
    categorie: "nature",
    lat: 7.45,
    lon: -7.52,
    ville: "man",
    resume:
      "La « ville aux dix-huit montagnes », ses cascades et ses ponts de lianes.",
    histoire: [
      "Entourée de reliefs, Man est la capitale du pays dan. La Dent de Man, un pic rocheux en forme de croc, domine la ville.",
      "Aux alentours, cascades, forêts et ponts de lianes tendus au-dessus des rivières. La tradition raconte que ces ponts sont tissés en une seule nuit, en secret, par des initiés.",
    ],
    aSavoir: [
      "Le mont Tonkoui, tout proche, offre une vue sur les montagnes jusqu'à la Guinée par temps clair.",
      "C'est le pays des masques et des échassiers dan.",
    ],
    indices: [
      "On l'appelle la ville aux dix-huit montagnes.",
      "Un pic en forme de croc la domine.",
    ],
    wiki: "Man (Côte d'Ivoire)",
  },
  {
    id: "cathedrale-abidjan",
    nom: "Cathédrale Saint-Paul d'Abidjan",
    categorie: "foi",
    lat: 5.33,
    lon: -4.02,
    ville: "abidjan",
    resume: "Une silhouette audacieuse sur le Plateau, face à la lagune.",
    histoire: [
      "Dessinée par l'architecte italien Aldo Spirito, la cathédrale voit sa première pierre posée par Jean-Paul II en 1980 ; il revient la consacrer en 1985.",
      "Sa grande tour-croix inclinée, maintenue par des haubans, évoque saint Paul en marche.",
    ],
    aSavoir: ["Elle peut accueillir plusieurs milliers de fidèles."],
    indices: [
      "Sa tour inclinée évoque l'apôtre Paul.",
      "Elle se dresse au Plateau, face à la lagune.",
    ],
    wiki: "Cathédrale Saint-Paul d'Abidjan",
  },
  {
    id: "banco",
    nom: "Parc national du Banco",
    categorie: "nature",
    lat: 5.38,
    lon: -4.05,
    ville: "abidjan",
    resume: "Une forêt primaire au cœur d'Abidjan.",
    histoire: [
      "Réserve forestière depuis le début du XXe siècle puis parc national en 1953, le Banco garde plus de 3 000 hectares de forêt au milieu de la ville.",
      "À son entrée, dans la rivière Banco, les fanicos, blanchisseurs d'Abidjan, lavent et font sécher le linge de la ville depuis des générations.",
    ],
    aSavoir: ["Arbres géants, sentiers et singes à quelques minutes d'Adjamé."],
    indices: [
      "Les fanicos y lavent le linge dans la rivière.",
      "C'est une forêt au milieu d'Abidjan.",
    ],
    wiki: "Parc national du Banco",
  },
  {
    id: "assinie",
    nom: "Assinie",
    categorie: "plage",
    lat: 5.13,
    lon: -3.29,
    ville: "aboisso",
    resume:
      "Une langue de sable entre la lagune et l'océan, et une histoire qui mène à Versailles.",
    histoire: [
      "À la fin du XVIIe siècle, des missionnaires et des marchands français s'installent un temps à Assinie, dans le royaume du Sanwi.",
      "En 1688, un jeune homme d'Assinie, Aniaba, est emmené en France. Il est baptisé à Paris avec Louis XIV pour parrain, sert dans l'armée du roi, puis revient sur la côte quelques années plus tard.",
    ],
    aSavoir: [
      "Plages, cocotiers et lagune Aby : la destination de week-end des Abidjanais.",
    ],
    indices: [
      "Un jeune homme de ce lieu eut Louis XIV pour parrain.",
      "C'est une langue de sable entre lagune et océan.",
    ],
    wiki: "Assinie",
  },
  {
    id: "bondoukou",
    nom: "Bondoukou",
    categorie: "patrimoine",
    lat: 8.04,
    lon: -2.8,
    ville: "bondoukou",
    resume: "La « ville aux mille mosquées », carrefour marchand du nord-est.",
    histoire: [
      "Au croisement des routes de l'or et de la kola, Bondoukou est depuis des siècles une ville de commerçants dioula et de lettrés musulmans.",
      "Elle voisine avec le royaume abron du Gyaman et les Koulango. On la surnomme la ville aux mille mosquées pour ses nombreux lieux de prière.",
    ],
    aSavoir: [
      "Ses vieux quartiers gardent des maisons et des mosquées en terre.",
    ],
    indices: [
      "On l'appelle la ville aux mille mosquées.",
      "Elle est voisine du royaume du Gyaman.",
    ],
    wiki: "Bondoukou",
  },
  {
    id: "musee-civilisations",
    nom: "Musée des civilisations de Côte d'Ivoire",
    categorie: "culture",
    lat: 5.32,
    lon: -4.02,
    ville: "abidjan",
    resume:
      "Masques, statues et bijoux de tous les peuples du pays, au Plateau.",
    histoire: [
      "Né pendant la période coloniale, le musée réunit des milliers d'objets venus de toutes les régions : masques, statues, instruments, parures.",
      "Pillé pendant la crise de 2011, il a été rénové et rouvert.",
    ],
    aSavoir: [
      "Le tambour parleur Djidji Ayokwe, des Ébrié, emporté en France en 1916, est devenu le symbole des demandes de restitution d'objets africains.",
    ],
    indices: [
      "On y voit des masques de tous les peuples du pays.",
      "Il est au Plateau, à Abidjan.",
    ],
    wiki: "Musée des civilisations de Côte d'Ivoire",
  },
  {
    id: "krinjabo",
    nom: "Krinjabo, capitale du Sanwi",
    categorie: "patrimoine",
    lat: 5.4,
    lon: -3.19,
    ville: "aboisso",
    resume: "La cour royale du royaume agni du Sanwi.",
    histoire: [
      "Fondé au XVIIIe siècle par des Agni venus de l'est, le royaume du Sanwi a pour capitale Krinjabo, près d'Aboisso.",
      "Le roi y siège toujours avec sa cour, et l'on peut visiter le palais royal et son musée.",
    ],
    aSavoir: [
      "Le Sanwi est l'un des royaumes qui traitèrent le plus tôt avec les Européens sur la côte.",
    ],
    indices: ["C'est la capitale du royaume du Sanwi."],
    wiki: "Royaume du Sanwi",
  },
  {
    id: "korhogo",
    nom: "Korhogo et ses artisans",
    categorie: "culture",
    lat: 9.46,
    lon: -5.63,
    ville: "korhogo",
    resume:
      "La capitale du pays sénoufo : toiles peintes, forgerons et tisserands.",
    histoire: [
      "Grande ville du nord, Korhogo est le cœur du pays sénoufo.",
      "Autour d'elle, chaque village a son art : toiles de coton peintes à la main à Fakaha, forge à Koni, tissage à Waraniéné.",
    ],
    aSavoir: [
      "Les toiles de Korhogo représentent des animaux, des masques et des scènes de la vie du village.",
    ],
    indices: [
      "C'est la capitale du pays sénoufo.",
      "Ses toiles de coton sont peintes à la main.",
    ],
    wiki: "Korhogo",
  },
  {
    id: "sassandra",
    nom: "Sassandra",
    categorie: "plage",
    lat: 4.95,
    lon: -6.09,
    ville: "sassandra",
    resume:
      "Un port de pêche à l'embouchure du fleuve, entre falaises et plages.",
    histoire: [
      "Le nom viendrait des navigateurs portugais du XVe siècle, qui baptisèrent le fleuve en l'honneur de saint André.",
      "Ancien port colonial, la ville garde un phare, des maisons anciennes et une vie de pêcheurs animée sur la plage.",
    ],
    aSavoir: ["Les pirogues colorées partent au large chaque matin."],
    indices: [
      "Les Portugais auraient baptisé son fleuve en l'honneur de saint André.",
    ],
    wiki: "Sassandra",
  },
]

export const siteById = (id: string) => SITES.find((site) => site.id === id)
