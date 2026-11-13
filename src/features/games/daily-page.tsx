import { Share2 } from "lucide-react"
import { useMemo, useState } from "react"

import {
  CountryMap,
  Marker,
  Route as RouteLine,
} from "@/components/country-map"
import { Button } from "@/components/ui"
import {
  Feedback,
  GameLayout,
  GameTop,
  QuestionText,
  ResultView,
} from "@/features/games/components"
import { useFinish } from "@/features/games/use-finish"
import {
  DAILY_COUNT,
  DAILY_MAX,
  dailyPoints,
  dailyVilles,
  dayKey,
  formatDay,
  shareText,
  square,
} from "@/features/games/daily"
import { shareUrl, useCountdown } from "@/features/games/use-countdown"
import { distanceKm } from "@/geo"
import { px, py } from "@/geo/projection"
import { feedback } from "@/lib/feedback"
import { de, fmtKm } from "@/lib/format"
import { shareOrCopy } from "@/lib/share"
import { useProgress } from "@/stores/progress"

type Point = { lat: number; lon: number }

function Summary({ day, distances }: { day: string; distances: number[] }) {
  const targets = dailyVilles(day)
  return (
    <ul className="flex flex-col">
      {targets.map((ville, index) => (
        <li
          key={ville.id}
          className="flex min-h-11 items-center gap-3 border-b border-line text-sm last:border-0"
        >
          <span aria-hidden>{square(distances[index])}</span>
          <span className="flex-1 font-medium">{ville.nom}</span>
          <span className="font-mono text-xs text-muted">
            {fmtKm(distances[index])} · {dailyPoints(distances[index])} pts
          </span>
        </li>
      ))}
    </ul>
  )
}

export function DailyPage() {
  const day = useMemo(() => dayKey(), [])
  const targets = useMemo(() => dailyVilles(day), [day])
  const played = useProgress((state) => state.daily[day])
  const { outcome, finish } = useFinish()
  const countdown = useCountdown()

  const [index, setIndex] = useState(0)
  const [guess, setGuess] = useState<Point | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [distances, setDistances] = useState<number[]>([])

  if (played) {
    const results = played
    const total = results.reduce((sum, km) => sum + dailyPoints(km), 0)
    return (
      <GameLayout title="Défi du jour">
        <ResultView
          eyebrow={`Défi du ${formatDay(day)}`}
          big={
            <span className="text-[32px] tracking-[0.15em] whitespace-nowrap">
              {results.map(square).join("")}
            </span>
          }
          message={`${total} / ${DAILY_MAX} points`}
          detail={`Prochain défi dans ${countdown}`}
          outcome={outcome}
          actions={
            <Button
              variant="orange"
              onClick={() =>
                void shareOrCopy(shareText(day, results, shareUrl()))
              }
            >
              <Share2 className="size-4" aria-hidden />
              Partager mon résultat
            </Button>
          }
        >
          <Summary day={day} distances={results} />
          <p className="text-xs text-muted">
            🟩 moins de 25 km · 🟨 moins de 75 km · 🟧 moins de 150 km · 🟥
            au-delà
          </p>
        </ResultView>
      </GameLayout>
    )
  }

  const target = targets[index]
  const km = guess ? distanceKm(guess, target) : 0

  function validate() {
    if (!guess) return
    const next = [...distances, km]
    setDistances(next)
    setRevealed(true)
    if (dailyPoints(km) >= 80) feedback.good()
    else if (dailyPoints(km) < 30) feedback.bad()
  }

  function nextCity() {
    if (index + 1 >= DAILY_COUNT) {
      finish({ game: "daily", day, distances })
      return
    }
    setIndex(index + 1)
    setGuess(null)
    setRevealed(false)
  }

  return (
    <GameLayout title="Défi du jour">
      <GameTop step={index + (revealed ? 1 : 0)} total={DAILY_COUNT}>
        {index + 1}/{DAILY_COUNT} ·{" "}
        {distances.reduce((sum, value) => sum + dailyPoints(value), 0)} pts
      </GameTop>
      <QuestionText type={`Défi du ${formatDay(day)}`}>
        Où se trouve {target.nom} ?
      </QuestionText>
      <div className="card p-1.5">
        <CountryMap
          showCities={false}
          onPoint={revealed ? undefined : setGuess}
          label="Touchez la carte pour placer votre épingle"
        >
          {guess && revealed && <RouteLine from={guess} to={target} />}
          {guess && <Marker at={guess} kind="guess" />}
          {revealed && (
            <>
              <Marker at={target} kind="target" />
              <text
                className="label"
                x={px(target.lon)}
                y={py(target.lat) - 14}
                textAnchor="middle"
              >
                {target.nom}
              </text>
            </>
          )}
        </CountryMap>
      </div>
      {revealed ? (
        <>
          <Feedback ok={dailyPoints(km) >= 50}>
            {square(km)} Votre épingle est à {fmtKm(km)} {de(target.nom)} :{" "}
            <b>{dailyPoints(km)} points</b>.
          </Feedback>
          <Button autoFocus onClick={nextCity} className="self-start">
            {index + 1 < DAILY_COUNT ? "Ville suivante" : "Voir mon résultat"}
          </Button>
        </>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={validate} disabled={!guess}>
            Valider l'épingle
          </Button>
          <p className="text-sm text-muted">
            {guess
              ? "Touchez ailleurs pour la déplacer."
              : "Touchez la carte là où vous pensez que se trouve la ville."}
          </p>
        </div>
      )}
    </GameLayout>
  )
}
