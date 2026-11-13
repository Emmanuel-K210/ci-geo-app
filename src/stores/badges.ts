import {
  Award,
  BookOpen,
  CalendarCheck,
  CalendarHeart,
  Compass,
  Crosshair,
  Eye,
  Flame,
  Footprints,
  Landmark,
  Feather,
  Gem,
  Goal,
  Map,
  Plane,
  Medal,
  Search,
  Shapes,
  Sparkles,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react"

import {
  DAILY_GOAL,
  dailyPoints,
  dailyStreak,
  dayKey,
} from "@/features/games/daily"
import { PEUPLES } from "@/culture/peuples"
import { SITES } from "@/culture/sites"
import { GAME_IDS, type GameEvent } from "@/stores/events"

/** What the badges look at: the progress after the game was recorded. */
export type BadgeState = {
  played: Partial<Record<string, number>>
  daily: Record<string, number[]>
  visited: string[]
  /** Stories read in « Découvrir » (« peuple:baoule », « site:tai »). */
  read: string[]
  /** XP earned per day (UTC date). */
  xpByDay: Record<string, number>
}

export type Badge = {
  id: string
  title: string
  description: string
  icon: LucideIcon
  earned: (event: GameEvent | null, state: BadgeState) => boolean
}

const dailyTotal = (distances: number[]) =>
  distances.reduce((sum, km) => sum + dailyPoints(km), 0)

export const BADGES: Badge[] = [
  {
    id: "premiers-pas",
    title: "Premiers pas",
    description: "Terminer une première partie.",
    icon: Footprints,
    earned: (event) => event !== null,
  },
  {
    id: "rendez-vous",
    title: "Rendez-vous",
    description: "Jouer le défi du jour.",
    icon: CalendarCheck,
    earned: (event) => event?.game === "daily",
  },
  {
    id: "fidele",
    title: "Fidèle",
    description: "Jouer le défi du jour 3 jours de suite.",
    icon: CalendarHeart,
    earned: (_, state) => dailyStreak(Object.keys(state.daily)) >= 3,
  },
  {
    id: "assidu",
    title: "Assidu",
    description: "Jouer le défi du jour 7 jours de suite.",
    icon: Flame,
    earned: (_, state) => dailyStreak(Object.keys(state.daily)) >= 7,
  },
  {
    id: "inconditionnel",
    title: "Inconditionnel",
    description: "Jouer le défi du jour 30 jours de suite.",
    icon: Medal,
    earned: (_, state) => dailyStreak(Object.keys(state.daily)) >= 30,
  },
  {
    id: "objectif",
    title: "Objectif atteint",
    description: `Gagner ${DAILY_GOAL} XP dans la journée.`,
    icon: Goal,
    earned: (_, state) => (state.xpByDay[dayKey()] ?? 0) >= DAILY_GOAL,
  },
  {
    id: "coup-parfait",
    title: "Coup parfait",
    description: "Faire 450 points ou plus au défi du jour.",
    icon: Gem,
    earned: (event) =>
      event?.game === "daily" && dailyTotal(event.distances) >= 450,
  },
  {
    id: "detective",
    title: "Détective",
    description: "Trouver une ville mystère dès le premier indice.",
    icon: Search,
    earned: (event) => event?.game === "clues" && event.firstClue > 0,
  },
  {
    id: "en-serie",
    title: "En série",
    description: "Enchaîner 10 bonnes réponses à « Plus près ou plus loin ».",
    icon: Flame,
    earned: (event) => event?.game === "closer" && event.streak >= 10,
  },
  {
    id: "inarretable",
    title: "Inarrêtable",
    description: "Enchaîner 25 bonnes réponses à « Plus près ou plus loin ».",
    icon: Sparkles,
    earned: (event) => event?.game === "closer" && event.streak >= 25,
  },
  {
    id: "sans-faute",
    title: "Sans faute",
    description: "Faire 10 sur 10 à un quiz.",
    icon: Trophy,
    earned: (event) => event?.game === "quiz" && event.score === event.total,
  },
  {
    id: "enfant-d-abidjan",
    title: "Enfant d'Abidjan",
    description: "Faire 10 sur 10 au quiz des quartiers d'Abidjan.",
    icon: Award,
    earned: (event) =>
      event?.game === "quiz" &&
      event.mode === "abidjan" &&
      event.score === event.total,
  },
  {
    id: "eclair",
    title: "Éclair",
    description: "15 bonnes réponses au défi chrono.",
    icon: Zap,
    earned: (event) => event?.game === "chrono" && event.score >= 15,
  },
  {
    id: "cartographe",
    title: "Cartographe",
    description: "Placer 8 villes sur 10 à la carte à trous.",
    icon: Map,
    earned: (event) => event?.game === "pin" && event.score >= 8,
  },
  {
    id: "oeil-de-lynx",
    title: "Œil de lynx",
    description: "Placer les 10 villes de la carte à trous.",
    icon: Crosshair,
    earned: (event) => event?.game === "pin" && event.score === event.total,
  },
  {
    id: "boussole-vivante",
    title: "Boussole vivante",
    description: "Trouver 8 directions sur 10 à la boussole.",
    icon: Compass,
    earned: (event) => event?.game === "compass" && event.score >= 8,
  },
  {
    id: "touche-a-tout",
    title: "Touche-à-tout",
    description: `Jouer au moins une fois à chacun des ${GAME_IDS.length} jeux.`,
    icon: Shapes,
    earned: (_, state) =>
      GAME_IDS.every((game) => (state.played[game] ?? 0) > 0),
  },
  {
    id: "globe-trotteur",
    title: "Globe-trotteur",
    description: "Placer 5 sites à moins de 50 km chacun.",
    icon: Plane,
    earned: (event) =>
      event?.game === "sites" && event.distances.every((km) => km < 50),
  },
  {
    id: "curieux",
    title: "Curieux",
    description: "Lire 5 récits dans « Découvrir ».",
    icon: BookOpen,
    earned: (_, state) => state.read.length >= 5,
  },
  {
    id: "griot",
    title: "Griot",
    description: "Lire l'histoire de tous les peuples.",
    icon: Feather,
    earned: (_, state) =>
      PEUPLES.every((peuple) => state.read.includes(`peuple:${peuple.id}`)),
  },
  {
    id: "guide",
    title: "Guide touristique",
    description: "Lire le récit de tous les sites.",
    icon: Landmark,
    earned: (_, state) =>
      SITES.every((site) => state.read.includes(`site:${site.id}`)),
  },
  {
    id: "explorateur",
    title: "Explorateur",
    description: "Ouvrir la fiche de 20 villes dans l'atlas.",
    icon: Eye,
    earned: (_, state) => state.visited.length >= 20,
  },
]

export const badgeById = (id: string) => BADGES.find((badge) => badge.id === id)
