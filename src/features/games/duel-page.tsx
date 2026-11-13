import { Link, useNavigate } from "@tanstack/react-router"
import { Swords } from "lucide-react"
import { useCallback, useMemo, useState } from "react"

import { buttonClass } from "@/components/button-class"
import { Button } from "@/components/ui"
import {
  AnswerGrid,
  Feedback,
  GameLayout,
  GameTop,
  QuestionText,
  ResultView,
} from "@/features/games/components"
import {
  DUEL_ROUND,
  duelLink,
  duelQuestions,
  newSeed,
} from "@/features/games/duel"
import {
  QUIZ_MODES,
  quizModes,
  type QuizMode,
} from "@/features/games/questions"
import { useFinish } from "@/features/games/use-finish"
import { feedback } from "@/lib/feedback"
import { shareOrCopy } from "@/lib/share"

function Picker() {
  const navigate = useNavigate()
  return (
    <GameLayout title="Duel">
      <div className="flex flex-col gap-1">
        <p className="eyebrow text-green">Duel entre amis</p>
        <h2 className="font-display text-[24px] leading-tight font-bold">
          Défiez quelqu'un sur les mêmes questions
        </h2>
        <p className="text-sm text-muted">
          Jouez {DUEL_ROUND} questions, puis envoyez le lien : votre ami reçoit
          exactement les mêmes et voit votre score à battre.
        </p>
      </div>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {QUIZ_MODES.map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() =>
              void navigate({
                to: "/jeux/duel",
                search: { m: mode, s: newSeed() },
              })
            }
            className="flex flex-col gap-0.5 card p-4 text-left transition-transform active:scale-[0.98]"
          >
            <span className="font-display font-semibold">
              {quizModes[mode].label}
            </span>
            <span className="text-[13px] text-muted">
              {quizModes[mode].hint}
            </span>
          </button>
        ))}
      </div>
    </GameLayout>
  )
}

function verdict(mine: number, theirs: number) {
  if (mine > theirs) return "Vous gagnez le duel !"
  if (mine < theirs) return "Votre ami l'emporte. Revanche ?"
  return "Égalité parfaite."
}

function DuelGame({
  mode,
  seed,
  against,
}: {
  mode: QuizMode
  seed: number
  against?: number
}) {
  const questions = useMemo(() => duelQuestions(mode, seed), [mode, seed])
  const [index, setIndex] = useState(0)
  const [given, setGiven] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [over, setOver] = useState(false)
  const { outcome, finish } = useFinish()
  const question = questions[index]

  const answer = useCallback(
    (option: string) => {
      if (given) return
      setGiven(option)
      if (option === question.good) {
        setScore((value) => value + 1)
        feedback.good()
      } else feedback.bad()
    },
    [given, question]
  )

  function next() {
    if (index + 1 >= DUEL_ROUND) {
      finish({ game: "quiz", mode, score, total: DUEL_ROUND })
      setOver(true)
      return
    }
    setIndex(index + 1)
    setGiven(null)
  }

  const challenge = () =>
    void shareOrCopy(
      [
        `CI-Geo · Duel ${quizModes[mode].label} : j'ai fait ${score}/${DUEL_ROUND}. Tu fais mieux ?`,
        duelLink(mode, seed, score),
      ].join("\n")
    )

  if (over)
    return (
      <GameLayout title="Duel">
        <ResultView
          eyebrow={`Duel · ${quizModes[mode].label}`}
          big={
            against === undefined
              ? `${score}/${DUEL_ROUND}`
              : `${score} – ${against}`
          }
          message={
            against === undefined
              ? "Envoyez le lien : votre ami aura les mêmes questions."
              : verdict(score, against)
          }
          detail={
            against === undefined
              ? undefined
              : `Vous ${score}/${DUEL_ROUND} · votre ami ${against}/${DUEL_ROUND}`
          }
          outcome={outcome}
          actions={
            <>
              <Button variant="orange" onClick={challenge}>
                <Swords className="size-4" aria-hidden />
                {against === undefined ? "Défier un ami" : "Renvoyer le défi"}
              </Button>
              <Link
                to="/jeux/duel"
                search={{}}
                className={buttonClass("ghost")}
              >
                Nouveau duel
              </Link>
            </>
          }
        />
      </GameLayout>
    )

  return (
    <GameLayout title="Duel">
      {against !== undefined && (
        <p className="rounded-2xl bg-warn-bg p-3 text-sm text-warn-fg">
          Score à battre :{" "}
          <b>
            {against}/{DUEL_ROUND}
          </b>
        </p>
      )}
      <GameTop step={index + (given ? 1 : 0)} total={DUEL_ROUND}>
        {index + 1}/{DUEL_ROUND} · {score} pts
      </GameTop>
      <QuestionText key={question.text} type={question.type}>
        {question.text}
      </QuestionText>
      <AnswerGrid
        options={question.options}
        good={question.good}
        answered={given}
        onAnswer={answer}
      />
      {given && (
        <>
          <Feedback ok={given === question.good}>
            {given === question.good
              ? "Bonne réponse. "
              : `Raté : c'était ${question.good}. `}
            {question.why}
          </Feedback>
          <Button autoFocus onClick={next} className="self-start">
            {index + 1 < DUEL_ROUND ? "Question suivante" : "Voir le résultat"}
          </Button>
        </>
      )}
    </GameLayout>
  )
}

export function DuelPage({
  mode,
  seed,
  against,
}: {
  mode?: QuizMode
  seed?: number
  against?: number
}) {
  if (!mode || seed === undefined) return <Picker />
  return (
    <DuelGame
      key={`${mode}:${seed}`}
      mode={mode}
      seed={seed}
      against={against}
    />
  )
}
