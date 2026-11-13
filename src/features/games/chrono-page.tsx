import { useCallback, useEffect, useState } from "react"

import { Button } from "@/components/ui"
import {
  AnswerGrid,
  GameLayout,
  QuestionText,
  ResultView,
} from "@/features/games/components"
import { useFinish } from "@/features/games/use-finish"
import { makeQuestion } from "@/features/games/questions"
import { cn } from "@/lib/cn"
import { feedback } from "@/lib/feedback"
import { plural } from "@/lib/format"
import { useProgress } from "@/stores/progress"

const DURATION = 60_000

export function ChronoPage() {
  const [end, setEnd] = useState<number | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const [question, setQuestion] = useState(() => makeQuestion("tout"))
  const [score, setScore] = useState(0)
  const [wrong, setWrong] = useState(0)
  const [flash, setFlash] = useState<"good" | "bad" | null>(null)
  const { outcome, finish, clear } = useFinish()
  const best = useProgress((state) => state.best.chrono ?? 0)

  const left = end ? Math.max(0, Math.ceil((end - now) / 1000)) : 60
  const running = end !== null && left > 0 && !outcome

  useEffect(() => {
    if (!running) return
    const timer = setInterval(() => setNow(Date.now()), 200)
    return () => clearInterval(timer)
  }, [running])

  useEffect(() => {
    if (end !== null && left === 0 && !outcome)
      finish({ game: "chrono", score })
  }, [end, left, outcome, finish, score])

  const answer = useCallback(
    (option: string) => {
      if (!running) return
      const ok = option === question.good
      if (ok) {
        setScore((value) => value + 1)
        feedback.good()
      } else {
        setWrong((value) => value + 1)
        feedback.bad()
      }
      setFlash(ok ? "good" : "bad")
      setQuestion(makeQuestion("tout", [question.text]))
    },
    [running, question]
  )

  function start() {
    clear()
    setScore(0)
    setWrong(0)
    setFlash(null)
    setQuestion(makeQuestion("tout"))
    setNow(Date.now())
    setEnd(Date.now() + DURATION)
  }

  if (outcome)
    return (
      <GameLayout title="Défi chrono">
        <ResultView
          eyebrow="Défi chrono · terminé"
          big={score}
          message={
            outcome.record
              ? "Nouveau record !"
              : `${plural(score, "bonne réponse")} en 60 secondes.`
          }
          detail={`${plural(wrong, "erreur")} · record ${Math.max(best, score)}`}
          outcome={outcome}
          share={`Défi chrono : ${plural(score, "bonne réponse")} en 60 s`}
          actions={<Button onClick={start}>Rejouer</Button>}
        />
      </GameLayout>
    )

  if (end === null)
    return (
      <GameLayout title="Défi chrono">
        <section className="flex flex-col items-start gap-3 card p-5">
          <p className="eyebrow text-green">60 secondes</p>
          <h2 className="font-display text-[24px] leading-tight font-bold text-balance">
            Un maximum de bonnes réponses, toutes catégories.
          </h2>
          <p className="text-sm text-muted">
            La question suivante arrive dès que vous répondez. Record : {best}.
          </p>
          <Button variant="orange" onClick={start}>
            C'est parti
          </Button>
        </section>
      </GameLayout>
    )

  return (
    <GameLayout title="Défi chrono">
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "font-display text-[32px] leading-none font-bold tabular-nums",
            left <= 10 && "text-orange"
          )}
          aria-live="off"
        >
          {left} s
        </span>
        <span className="font-mono text-sm text-muted">
          score <b className="text-ink">{score}</b>
          {flash && (
            <span
              className={cn(
                "ml-2",
                flash === "good" ? "text-green" : "text-orange"
              )}
            >
              {flash === "good" ? "✓" : "✗"}
            </span>
          )}
        </span>
      </div>
      <QuestionText key={question.text} type={question.type}>
        {question.text}
      </QuestionText>
      <AnswerGrid
        key={`a-${question.text}`}
        options={question.options}
        onAnswer={answer}
      />
    </GameLayout>
  )
}
