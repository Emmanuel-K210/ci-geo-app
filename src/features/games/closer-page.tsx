import { ArrowDown, ArrowUp } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { CountryMap, Route as RouteLine } from "@/components/country-map"
import { Button } from "@/components/ui"
import {
  CLOSER_REFERENCES,
  isRight,
  nextChallenger,
  type CloserChoice,
} from "@/features/games/closer"
import { GameLayout, ResultView } from "@/features/games/components"
import { useFinish } from "@/features/games/use-finish"
import { distanceKm, villes, type Ville } from "@/geo"
import { cn } from "@/lib/cn"
import { feedback } from "@/lib/feedback"
import { de, fmtKm } from "@/lib/format"
import { pick } from "@/lib/random"
import { useProgress } from "@/stores/progress"

function newGame() {
  const reference = pick(CLOSER_REFERENCES)
  const current = pick(villes.filter((ville) => ville !== reference))
  return { reference, current, challenger: nextChallenger(reference, current) }
}

function CityCard({
  ville,
  reference,
  hidden,
  tone,
}: {
  ville: Ville
  reference: Ville
  hidden: boolean
  tone?: "good" | "bad"
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1 rounded-2xl border p-4 text-center",
        tone === "good"
          ? "animate-pop border-green bg-green-soft"
          : tone === "bad"
            ? "animate-shake border-orange bg-warn-bg"
            : "border-line bg-surface"
      )}
    >
      <p className="font-display text-2xl font-bold tracking-tight">
        {ville.nom}
      </p>
      <p className="font-mono text-sm text-muted">
        {hidden ? "? km" : fmtKm(distanceKm(reference, ville))}{" "}
        {de(reference.nom)}
      </p>
    </div>
  )
}

export function CloserPage() {
  const [game, setGame] = useState(newGame)
  const [streak, setStreak] = useState(0)
  const [answer, setAnswer] = useState<"good" | "bad" | null>(null)
  const { outcome, finish, clear } = useFinish()
  const best = useProgress((state) => state.best.closer ?? 0)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  const { reference, current, challenger } = game

  function choose(choice: CloserChoice) {
    if (answer) return
    if (isRight(reference, current, challenger, choice)) {
      setAnswer("good")
      feedback.good()
      timer.current = setTimeout(() => {
        setStreak((value) => value + 1)
        setGame({
          reference,
          current: challenger,
          challenger: nextChallenger(reference, challenger),
        })
        setAnswer(null)
      }, 1100)
    } else {
      setAnswer("bad")
      feedback.bad()
      timer.current = setTimeout(() => finish({ game: "closer", streak }), 1300)
    }
  }

  function restart() {
    setGame(newGame())
    setStreak(0)
    setAnswer(null)
    clear()
  }

  if (outcome)
    return (
      <GameLayout title="Plus près ou plus loin ?">
        <ResultView
          eyebrow="Série terminée"
          big={streak}
          message={
            streak >= 25
              ? "Inarrêtable !"
              : streak >= 10
                ? "Belle série."
                : streak >= 4
                  ? "Pas mal du tout."
                  : "Ça arrive aux meilleurs."
          }
          detail={`${streak > 1 ? "bonnes réponses" : "bonne réponse"} d'affilée · record ${Math.max(best, streak)}`}
          outcome={outcome}
          actions={<Button onClick={restart}>Rejouer</Button>}
        />
      </GameLayout>
    )

  return (
    <GameLayout title="Plus près ou plus loin ?">
      <div className="flex items-center justify-between">
        <p className="eyebrow text-green">Distances depuis {reference.nom}</p>
        <p className="font-mono text-xs text-muted">
          série <b className="text-ink">{streak}</b> · record {best}
        </p>
      </div>

      <CityCard ville={current} reference={reference} hidden={false} />
      <p className="text-center font-display text-lg font-semibold text-balance">
        {challenger.nom} est-elle plus près ou plus loin {de(reference.nom)} ?
      </p>
      <CityCard
        key={challenger.id}
        ville={challenger}
        reference={reference}
        hidden={!answer}
        tone={answer ?? undefined}
      />

      <div className="grid grid-cols-2 gap-2.5">
        <Button
          variant="outline"
          className="min-h-14 text-base"
          disabled={!!answer}
          onClick={() => choose("closer")}
        >
          <ArrowDown className="size-5" aria-hidden />
          Plus près
        </Button>
        <Button
          variant="outline"
          className="min-h-14 text-base"
          disabled={!!answer}
          onClick={() => choose("farther")}
        >
          <ArrowUp className="size-5" aria-hidden />
          Plus loin
        </Button>
      </div>

      <div className="mx-auto w-full max-w-sm card p-1.5">
        <CountryMap
          muted
          labelled={
            answer ? [reference, current, challenger] : [reference, current]
          }
          cityClass={(ville) =>
            cn(
              ville === reference && "on",
              ville === current && "good",
              answer &&
                ville === challenger &&
                (answer === "good" ? "good" : "bad")
            )
          }
          under={
            <>
              <RouteLine from={reference} to={current} />
              {answer && <RouteLine from={reference} to={challenger} />}
            </>
          }
          label={`Carte : ${reference.nom} et ${current.nom}`}
        />
      </div>
    </GameLayout>
  )
}
