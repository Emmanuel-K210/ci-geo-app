import { Link } from "@tanstack/react-router"
import {
  BookOpen,
  ChevronRight,
  Flame,
  LayoutGrid,
  MapPin,
  RotateCcw,
  Sparkles,
  type LucideIcon,
} from "lucide-react"

import { buttonClass } from "@/components/button-class"
import { CountryMap } from "@/components/country-map"
import { GoalRing } from "@/components/goal-ring"
import { WeekStrip } from "@/components/week-strip"
import { storyOfTheDay } from "@/culture/stories"
import { StoryCard } from "@/features/decouvrir/components"
import { GAMES, type GameCard } from "@/features/games/catalog"
import { DailyCard } from "@/features/games/daily-card"
import {
  cityOfTheDay,
  DAILY_GOAL,
  dailyStreak,
  dayKey,
} from "@/features/games/daily"
import { quizModes } from "@/features/games/questions"
import { nearest, villeKind } from "@/geo"
import { de, fmtKm, plural } from "@/lib/format"
import type { GameId } from "@/stores/events"
import { levelOf } from "@/stores/levels"
import { useProgress, type LastGame } from "@/stores/progress"

function greeting(date = new Date()) {
  const hour = date.getHours()
  return hour >= 18 || hour < 4 ? "Bonsoir" : "Bonjour"
}

const longDate = (date = new Date()) =>
  date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })

function GoalCard() {
  const today = useProgress((state) => state.xpByDay[dayKey()] ?? 0)
  const daily = useProgress((state) => state.daily)
  const streak = dailyStreak(Object.keys(daily))
  const left = Math.max(0, DAILY_GOAL - today)
  return (
    <section className="flex flex-col gap-4 card p-4">
      <div className="flex items-center gap-4">
        <GoalRing value={today / DAILY_GOAL} size={76} stroke={7}>
          <span className="flex flex-col items-center leading-none">
            <span className="font-display text-xl font-bold tabular-nums">
              {Math.min(today, DAILY_GOAL)}
            </span>
            <span className="font-mono text-[10px] text-muted">
              / {DAILY_GOAL} XP
            </span>
          </span>
        </GoalRing>
        <div className="min-w-0 flex-1">
          <p className="eyebrow">Objectif du jour</p>
          <p className="font-display text-lg leading-snug font-semibold text-balance">
            {left === 0
              ? "Objectif atteint, bravo !"
              : today === 0
                ? `Gagnez ${DAILY_GOAL} XP aujourd'hui.`
                : `Encore ${left} XP pour l'atteindre.`}
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-muted">
            <Flame className="size-4 flex-none text-orange" aria-hidden />
            {streak
              ? `Série de ${plural(streak, "jour")} au défi du jour`
              : "Jouez le défi du jour pour lancer une série"}
          </p>
        </div>
      </div>
      <WeekStrip />
    </section>
  )
}

function GameTile({
  eyebrow,
  icon: Icon,
  game,
  detail,
  mode,
}: {
  eyebrow: string
  icon: LucideIcon
  game: GameCard
  detail: string
  mode?: LastGame["mode"]
}) {
  const content = (
    <>
      <span className="flex items-center gap-1.5 eyebrow text-orange">
        <Icon className="size-3.5" aria-hidden />
        {eyebrow}
      </span>
      <span className="flex items-center gap-3">
        <span className="grid size-11 flex-none place-items-center rounded-2xl bg-green-soft text-green">
          <game.icon className="size-5" aria-hidden />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="font-display font-semibold">{game.title}</span>
          <span className="text-[13px] leading-snug text-muted">{detail}</span>
        </span>
        <ChevronRight className="size-5 flex-none text-muted" aria-hidden />
      </span>
    </>
  )
  const className =
    "flex flex-col gap-2.5 card p-4 transition-transform active:scale-[0.98]"
  return mode ? (
    <Link to="/jeux/quiz" search={{ mode }} className={className}>
      {content}
    </Link>
  ) : (
    <Link to={game.to} className={className}>
      {content}
    </Link>
  )
}

function NextGames() {
  const last = useProgress((state) => state.last)
  const played = useProgress((state) => state.played)
  const best = useProgress((state) => state.best)
  const count = (game: GameCard) => played[game.id as GameId] ?? 0
  const resume = GAMES.find((game) => game.id === last?.game)
  // A game never played first, otherwise the one played the least.
  const discover = GAMES.filter((game) => game !== resume).sort(
    (a, b) => count(a) - count(b)
  )[0]

  return (
    <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
      {resume && (
        <GameTile
          eyebrow="Reprendre"
          icon={RotateCcw}
          game={resume}
          mode={last?.mode}
          detail={
            last?.mode
              ? `Catégorie ${quizModes[last.mode].label}`
              : (resume.best(best) ?? resume.description)
          }
        />
      )}
      <GameTile
        eyebrow={count(discover) ? "Et pourquoi pas" : "À découvrir"}
        icon={Sparkles}
        game={discover}
        detail={discover.description}
      />
    </div>
  )
}

function StoryOfTheDay() {
  const story = storyOfTheDay(dayKey())
  return (
    <section className="flex flex-col gap-2">
      <p className="flex items-center gap-1.5 eyebrow text-orange">
        <BookOpen className="size-3.5" aria-hidden />
        Le récit du jour
      </p>
      <StoryCard story={story} size="lg" />
    </section>
  )
}

function CityOfTheDay() {
  const ville = cityOfTheDay(dayKey())
  const visited = useProgress((state) => state.visited.includes(ville.id))
  const close = nearest(ville, 1)[0]
  return (
    <section className="overflow-hidden card">
      <div className="grid grid-cols-[minmax(0,1fr)_112px] items-center gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_150px]">
        <div className="flex min-w-0 flex-col gap-1.5">
          <p className="flex items-center gap-1.5 eyebrow text-green">
            <MapPin className="size-3.5" aria-hidden />
            Ville du jour
          </p>
          <h2 className="font-display text-2xl leading-tight font-bold tracking-tight">
            {ville.nom}
          </h2>
          <p className="text-sm text-muted">
            {villeKind(ville)} · {ville.district.nom}
          </p>
          <ul className="mt-1 flex flex-col gap-0.5 text-[13px]">
            {close && (
              <li>
                À {fmtKm(close.km)} {de(close.ville.nom)}, la ville la plus
                proche.
              </li>
            )}
            {ville.quartiers.length > 0 && (
              <li>
                {plural(ville.quartiers.length, "quartier")} dans l'atlas.
              </li>
            )}
          </ul>
        </div>
        <CountryMap
          muted
          labels={false}
          cityClass={(item) => (item === ville ? "on" : "")}
          label={`${ville.nom} sur la carte`}
          className="[&_.gratl]:hidden"
        />
      </div>
      <div className="flex flex-wrap items-center gap-3 border-t border-line px-4 py-3">
        <Link
          to="/atlas"
          search={{ ville: ville.id }}
          className={buttonClass("primary")}
        >
          Ouvrir la fiche
        </Link>
        <span className="text-xs text-muted">
          {visited ? "Déjà visitée ✓" : "Compte pour le badge Explorateur"}
        </span>
      </div>
    </section>
  )
}

export function TodayPage() {
  const xp = useProgress((state) => state.xp)
  const level = levelOf(xp)
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="eyebrow text-green">{longDate()}</p>
        <h1 className="font-display text-[26px] leading-tight font-bold tracking-tight">
          {greeting()} !
        </h1>
        <p className="text-sm text-muted">
          Niveau {level.number} · {level.name}
          {level.next &&
            ` · ${level.next.min - xp} XP avant « ${level.next.name} »`}
        </p>
      </div>
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <DailyCard />
          <GoalCard />
        </div>
        <div className="flex flex-col gap-4">
          <NextGames />
          <StoryOfTheDay />
          <CityOfTheDay />
        </div>
      </div>
      <Link
        to="/plus"
        className="flex min-h-14 items-center gap-3 card px-4 lg:hidden"
      >
        <LayoutGrid className="size-5 text-green" aria-hidden />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="font-medium">Le référentiel</span>
          <span className="text-[13px] text-muted">
            Liste, statistiques, exports et sélecteur
          </span>
        </span>
        <ChevronRight className="size-5 text-muted" aria-hidden />
      </Link>
    </div>
  )
}
