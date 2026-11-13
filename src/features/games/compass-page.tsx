import { useState } from "react"

import { CountryMap, Route as RouteLine } from "@/components/country-map"
import { Button } from "@/components/ui"
import {
  compassQuestion,
  COMPASS_ROUND,
  type CompassQuestion,
} from "@/features/games/compass-game"
import {
  Feedback,
  GameLayout,
  GameTop,
  QuestionText,
  ResultView,
} from "@/features/games/components"
import { useFinish } from "@/features/games/use-finish"
import { ARROWS, directionNames, towards, type Direction } from "@/geo/compass"
import { distanceKm } from "@/geo"
import { cn } from "@/lib/cn"
import { feedback } from "@/lib/feedback"
import { de, fmtKm } from "@/lib/format"

/** The rose as a 3 × 3 grid, north on top. */
const ROSE: (Direction | null)[] = [
  "NO",
  "N",
  "NE",
  "O",
  null,
  "E",
  "SO",
  "S",
  "SE",
]

export function CompassPage() {
  const [questions, setQuestions] = useState<CompassQuestion[]>(() => [
    compassQuestion(),
  ])
  const [given, setGiven] = useState<Direction | null>(null)
  const [score, setScore] = useState(0)
  const { outcome, finish, clear } = useFinish()

  const question = questions[questions.length - 1]
  const index = questions.length - 1

  function answer(dir: Direction) {
    if (given) return
    setGiven(dir)
    if (dir === question.answer) {
      setScore(score + 1)
      feedback.good()
    } else feedback.bad()
  }

  function next() {
    if (questions.length >= COMPASS_ROUND) {
      finish({ game: "compass", score, total: COMPASS_ROUND })
      return
    }
    setQuestions([...questions, compassQuestion(questions)])
    setGiven(null)
  }

  function restart() {
    setQuestions([compassQuestion()])
    setGiven(null)
    setScore(0)
    clear()
  }

  if (outcome)
    return (
      <GameLayout title="La boussole">
        <ResultView
          eyebrow="Boussole · terminé"
          big={`${score}/${COMPASS_ROUND}`}
          message={
            score >= 8
              ? "Une boussole vivante."
              : score >= 5
                ? "Le nord n'a plus de secret."
                : "On s'oriente avec la carte, puis on recommence."
          }
          outcome={outcome}
          actions={<Button onClick={restart}>Rejouer</Button>}
        />
      </GameLayout>
    )

  return (
    <GameLayout title="La boussole">
      <GameTop step={index + (given ? 1 : 0)} total={COMPASS_ROUND}>
        {index + 1}/{COMPASS_ROUND} · {score} pts
      </GameTop>
      <QuestionText
        key={`${question.from.id}-${question.to.id}`}
        type="Boussole"
      >
        Depuis {question.from.nom}, dans quelle direction se trouve{" "}
        {question.to.nom} ?
      </QuestionText>

      <div className="mx-auto grid w-full max-w-xs grid-cols-3 gap-2">
        {ROSE.map((dir, position) =>
          dir ? (
            <button
              key={dir}
              type="button"
              disabled={!!given}
              onClick={() => answer(dir)}
              aria-label={directionNames[dir]}
              className={cn(
                "flex aspect-square flex-col items-center justify-center gap-0.5 rounded-2xl border transition-transform active:scale-95",
                given && dir === question.answer
                  ? "animate-pop border-green bg-green-soft"
                  : given && dir === given
                    ? "animate-shake border-orange bg-warn-bg"
                    : "border-line bg-surface"
              )}
            >
              <span className="text-2xl leading-none" aria-hidden>
                {ARROWS[dir]}
              </span>
              <span className="font-mono text-xs font-medium">{dir}</span>
            </button>
          ) : (
            <div
              key={`center-${position}`}
              className="grid aspect-square place-items-center rounded-full bg-orange p-1 text-center font-display text-[11px] leading-tight font-semibold text-orange-ink"
            >
              {question.from.nom}
            </div>
          )
        )}
      </div>

      {given && (
        <>
          <Feedback ok={given === question.answer}>
            {question.to.nom} est {towards(question.answer)}{" "}
            {de(question.from.nom)} (cap {Math.round(question.degrees)}°), à{" "}
            {fmtKm(distanceKm(question.from, question.to))}.
          </Feedback>
          <div className="mx-auto w-full max-w-sm card p-1.5">
            <CountryMap
              muted
              labelled={[question.from, question.to]}
              cityClass={(ville) =>
                cn(
                  ville === question.from && "on",
                  ville === question.to && "good"
                )
              }
              under={<RouteLine from={question.from} to={question.to} />}
              label={`${question.from.nom} et ${question.to.nom} sur la carte`}
            />
          </div>
          <Button autoFocus onClick={next} className="self-start">
            {questions.length < COMPASS_ROUND
              ? "Question suivante"
              : "Voir le résultat"}
          </Button>
        </>
      )}
    </GameLayout>
  )
}
