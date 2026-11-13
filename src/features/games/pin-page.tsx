import { useState } from "react"

import { CountryMap, Route as RouteLine } from "@/components/country-map"
import { Button } from "@/components/ui"
import {
  Feedback,
  GameLayout,
  GameTop,
  QuestionText,
  ResultView,
} from "@/features/games/components"
import { useFinish } from "@/features/games/use-finish"
import { distanceKm, villes, type Ville } from "@/geo"
import { cn } from "@/lib/cn"
import { feedback } from "@/lib/feedback"
import { de, fmtKm } from "@/lib/format"
import { sample } from "@/lib/random"
import { useProgress } from "@/stores/progress"

export const PIN_ROUND = 10

export function PinPage() {
  const [targets, setTargets] = useState(() => sample(villes, PIN_ROUND))
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<Ville | null>(null)
  const [score, setScore] = useState(0)
  const [totalKm, setTotalKm] = useState(0)
  const { outcome, finish, clear } = useFinish()
  const best = useProgress((state) => state.best.pin ?? 0)

  const target = targets[index]

  function pick(ville: Ville) {
    if (picked) return
    setPicked(ville)
    if (ville === target) {
      setScore(score + 1)
      feedback.good()
    } else {
      setTotalKm(totalKm + distanceKm(ville, target))
      feedback.bad()
    }
  }

  function next() {
    if (index + 1 >= PIN_ROUND) {
      finish({ game: "pin", score, total: PIN_ROUND })
      return
    }
    setIndex(index + 1)
    setPicked(null)
  }

  function restart() {
    setTargets(sample(villes, PIN_ROUND))
    setIndex(0)
    setPicked(null)
    setScore(0)
    setTotalKm(0)
    clear()
  }

  if (outcome)
    return (
      <GameLayout title="Carte à trous">
        <ResultView
          eyebrow="Carte à trous · terminé"
          big={`${score}/${PIN_ROUND}`}
          message={
            score === PIN_ROUND
              ? "Vous connaissez la carte par cœur."
              : `En moyenne à ${fmtKm(totalKm / PIN_ROUND)} de la bonne ville.`
          }
          detail={`Record : ${Math.max(best, score)} / ${PIN_ROUND}`}
          outcome={outcome}
          share={`Carte à trous : ${score}/${PIN_ROUND}`}
          actions={<Button onClick={restart}>Rejouer</Button>}
        />
      </GameLayout>
    )

  return (
    <GameLayout title="Carte à trous">
      <GameTop step={index + (picked ? 1 : 0)} total={PIN_ROUND}>
        {index + 1}/{PIN_ROUND} · {score} pts
      </GameTop>
      <QuestionText key={target.id} type="Carte à trous">
        Où se trouve {target.nom} ?
      </QuestionText>
      <div className="card p-1.5">
        <CountryMap
          labels={!!picked}
          snapKm={Infinity}
          onCity={picked ? undefined : pick}
          cityClass={(ville) =>
            cn(
              picked && ville === target && "good",
              picked && ville === picked && ville !== target && "bad"
            )
          }
          under={
            picked &&
            picked !== target && <RouteLine from={picked} to={target} />
          }
          label="Touchez la ville demandée"
        />
      </div>
      {picked ? (
        <>
          <Feedback ok={picked === target}>
            {picked === target
              ? `Bien vu : ${target.nom}${target.region ? `, région ${target.region.nom}` : ""}.`
              : `Vous avez touché ${picked.nom}, à ${fmtKm(distanceKm(picked, target))} ${de(target.nom)}.`}
          </Feedback>
          <Button autoFocus onClick={next} className="self-start">
            {index + 1 < PIN_ROUND ? "Ville suivante" : "Voir le résultat"}
          </Button>
        </>
      ) : (
        <p className="text-sm text-muted">
          Touchez le point de la ville. Les points orange sont les chefs-lieux.
        </p>
      )}
    </GameLayout>
  )
}
