import {
  Brain,
  Compass,
  Crosshair,
  Landmark,
  Search,
  Swords,
  Timer,
  TrendingUpDown,
  type LucideIcon,
} from "lucide-react"

import { DAILY_MAX } from "@/features/games/daily"
import { SITES_MAX } from "@/features/games/sites-game"

export type GamePath =
  | "/jeux/ville-mystere"
  | "/jeux/plus-pres-plus-loin"
  | "/jeux/quiz"
  | "/jeux/chrono"
  | "/jeux/carte-a-trous"
  | "/jeux/boussole"
  | "/jeux/ou-est-ce-site"
  | "/jeux/duel"

export type GameCard = {
  id: string
  to: GamePath
  title: string
  description: string
  icon: LucideIcon
  best: (best: Record<string, number>) => string | null
}

const quizBest = (best: Record<string, number>) =>
  Math.max(
    0,
    ...Object.entries(best)
      .filter(([key]) => key.startsWith("quiz:"))
      .map(([, value]) => value)
  )

export const GAMES: GameCard[] = [
  {
    id: "sites",
    to: "/jeux/ou-est-ce-site",
    title: "Où est ce site ?",
    description: "La photo d'un lieu célèbre : placez-le sur la carte.",
    icon: Landmark,
    best: (best) =>
      best.sites ? `Record : ${best.sites} / ${SITES_MAX} points` : null,
  },
  {
    id: "clues",
    to: "/jeux/ville-mystere",
    title: "La ville mystère",
    description:
      "Les indices tombent un par un. Moins il en faut, plus ça rapporte.",
    icon: Search,
    best: (best) => (best.clues ? `Record : ${best.clues} / 25 points` : null),
  },
  {
    id: "closer",
    to: "/jeux/plus-pres-plus-loin",
    title: "Plus près ou plus loin ?",
    description:
      "Cette ville est-elle plus loin que la précédente ? Tenez la série.",
    icon: TrendingUpDown,
    best: (best) => (best.closer ? `Record : série de ${best.closer}` : null),
  },
  {
    id: "quiz",
    to: "/jeux/quiz",
    title: "Quiz",
    description: "Chefs-lieux, régions, districts, quartiers : 10 questions.",
    icon: Brain,
    best: (best) => (quizBest(best) ? `Record : ${quizBest(best)} / 10` : null),
  },
  {
    id: "chrono",
    to: "/jeux/chrono",
    title: "Défi chrono",
    description: "Un maximum de bonnes réponses en 60 secondes.",
    icon: Timer,
    best: (best) =>
      best.chrono ? `Record : ${best.chrono} bonnes réponses` : null,
  },
  {
    id: "pin",
    to: "/jeux/carte-a-trous",
    title: "Carte à trous",
    description: "La carte sans les noms : touchez la ville demandée.",
    icon: Crosshair,
    best: (best) => (best.pin ? `Record : ${best.pin} / 10` : null),
  },
  {
    id: "compass",
    to: "/jeux/boussole",
    title: "La boussole",
    description: "Depuis cette ville, dans quelle direction est l'autre ?",
    icon: Compass,
    best: (best) => (best.compass ? `Record : ${best.compass} / 10` : null),
  },
  {
    id: "duel",
    to: "/jeux/duel",
    title: "Duel entre amis",
    description: "Les mêmes 10 questions pour vous et un ami, par un lien.",
    icon: Swords,
    best: () => null,
  },
]

export const dailyBestLabel = (best: Record<string, number>) =>
  best.daily ? `Record : ${best.daily} / ${DAILY_MAX}` : null
