import {
  Award,
  CalendarCheck,
  CalendarHeart,
  Compass,
  Crosshair,
  Eye,
  Flame,
  Footprints,
  Gem,
  Map,
  Search,
  Shapes,
  Sparkles,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react"

import { dailyPoints, dailyStreak } from "@/features/games/daily"
import { GAME_IDS, type GameEvent } from "@/stores/events"

/** What the badges look at: the progress after the game was recorded. */
export type BadgeState = {
  played: Partial<Record<string, number>>
  daily: Record<string, number[]>
  visited: string[]
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
    description: "Jouer au moins une fois à chacun des 7 jeux.",
    icon: Shapes,
    earned: (_, state) =>
      GAME_IDS.every((game) => (state.played[game] ?? 0) > 0),
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
