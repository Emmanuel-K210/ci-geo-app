import { Link } from "@tanstack/react-router"
import { useState } from "react"

import { buttonClass } from "@/components/button-class"
import {
  CountryMap,
  Marker,
  Route as RouteLine,
} from "@/components/country-map"
import { Button } from "@/components/ui"
import { WikiPhoto } from "@/culture/wiki-photo"
import { CATEGORY_ICONS } from "@/features/decouvrir/story-meta"
import {
  Feedback,
  GameLayout,
  GameTop,
  QuestionText,
  ResultView,
} from "@/features/games/components"
import { dailyPoints, square } from "@/features/games/daily"
import { SITES_MAX, SITES_ROUND, sitesRound } from "@/features/games/sites-game"
import { useFinish } from "@/features/games/use-finish"
import { distanceKm } from "@/geo"
import { px, py } from "@/geo/projection"
import { feedback } from "@/lib/feedback"
import { fmtKm } from "@/lib/format"

type Point = { lat: number; lon: number }

export function SitesGamePage() {
  const [targets, setTargets] = useState(() => sitesRound())
  const [index, setIndex] = useState(0)
  const [guess, setGuess] = useState<Point | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [distances, setDistances] = useState<number[]>([])
  const [over, setOver] = useState(false)
  const { outcome, finish, clear } = useFinish()

  const target = targets[index]
  const km = guess ? distanceKm(guess, target) : 0
  const total = distances.reduce((sum, value) => sum + dailyPoints(value), 0)

  function validate() {
    if (!guess) return
    setDistances([...distances, km])
    setRevealed(true)
    if (dailyPoints(km) >= 80) feedback.good()
    else if (dailyPoints(km) < 30) feedback.bad()
  }

  function next() {
    if (index + 1 >= SITES_ROUND) {
      finish({ game: "sites", distances })
      setOver(true)
      return
    }
    setIndex(index + 1)
    setGuess(null)
    setRevealed(false)
  }

  function restart() {
    setTargets(sitesRound())
    setIndex(0)
    setGuess(null)
    setRevealed(false)
    setDistances([])
    setOver(false)
    clear()
  }

  if (over)
    return (
      <GameLayout title="Où est ce site ?">
        <ResultView
          eyebrow="Où est ce site ? · terminé"
          big={
            <span className="text-[32px] tracking-[0.15em] whitespace-nowrap">
              {distances.map(square).join("")}
            </span>
          }
          message={`${total} / ${SITES_MAX} points`}
          detail={`En moyenne à ${fmtKm(distances.reduce((a, b) => a + b, 0) / distances.length)} des sites`}
          outcome={outcome}
          share={`Où est ce site ? ${distances.map(square).join("")} ${total}/${SITES_MAX}`}
          actions={<Button onClick={restart}>Rejouer</Button>}
        >
          <ul className="flex flex-col">
            {targets.map((site, i) => (
              <li
                key={site.id}
                className="flex min-h-11 items-center gap-3 border-b border-line text-sm last:border-0"
              >
                <span aria-hidden>{square(distances[i])}</span>
                <Link
                  to="/decouvrir/sites/$id"
                  params={{ id: site.id }}
                  className="flex-1 font-medium hover:text-green"
                >
                  {site.nom}
                </Link>
                <span className="font-mono text-xs text-muted">
                  {fmtKm(distances[i])}
                </span>
              </li>
            ))}
          </ul>
        </ResultView>
      </GameLayout>
    )

  return (
    <GameLayout title="Où est ce site ?">
      <GameTop step={index + (revealed ? 1 : 0)} total={SITES_ROUND}>
        {index + 1}/{SITES_ROUND} · {total} pts
      </GameTop>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:items-start">
        <div className="flex flex-col gap-3">
          <WikiPhoto
            key={target.id}
            title={target.wiki}
            alt={target.nom}
            icon={CATEGORY_ICONS[target.categorie]}
            className="aspect-[16/10] rounded-2xl"
          />
          <QuestionText key={`${target.id}:question`} type="Placez ce lieu">
            {target.nom}
          </QuestionText>
          {revealed && (
            <Feedback ok={dailyPoints(km) >= 50}>
              {square(km)} À {fmtKm(km)} : <b>{dailyPoints(km)} points</b>.{" "}
              {target.resume}
            </Feedback>
          )}
        </div>
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
                  {target.nom.split(" ")[0]}
                </text>
              </>
            )}
          </CountryMap>
        </div>
      </div>
      {revealed ? (
        <div className="flex flex-wrap gap-2">
          <Button autoFocus onClick={next}>
            {index + 1 < SITES_ROUND ? "Site suivant" : "Voir mon résultat"}
          </Button>
          <Link
            to="/decouvrir/sites/$id"
            params={{ id: target.id }}
            className={buttonClass("ghost")}
          >
            Lire son histoire
          </Link>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={validate} disabled={!guess}>
            Valider l'épingle
          </Button>
          <p className="text-sm text-muted">
            {guess
              ? "Touchez ailleurs pour la déplacer."
              : "Touchez la carte là où vous pensez que se trouve ce lieu."}
          </p>
        </div>
      )}
    </GameLayout>
  )
}
