import { Link } from "@tanstack/react-router"
import { useCallback, useState } from "react"

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
import { useFinish } from "@/features/games/use-finish"
import {
  makeQuestion,
  QUIZ_MODES,
  quizModes,
  type Question,
  type QuizMode,
} from "@/features/games/questions"
import { cn } from "@/lib/cn"
import { feedback } from "@/lib/feedback"
import { useProgress } from "@/stores/progress"

export const QUIZ_ROUND = 10

type Answer = { question: Question; given: string }

function ModePicker() {
  const best = useProgress((state) => state.best)
  return (
    <GameLayout title="Quiz">
      <div>
        <p className="eyebrow text-green">Quiz</p>
        <h2 className="font-display text-[24px] leading-tight font-bold">
          Choisissez une catégorie
        </h2>
        <p className="text-sm text-muted">
          {QUIZ_ROUND} questions tirées du référentiel, quatre réponses
          possibles.
        </p>
      </div>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {QUIZ_MODES.map((mode) => (
          <Link
            key={mode}
            to="/jeux/quiz"
            search={{ mode }}
            className="flex flex-col gap-0.5 card p-4 transition-transform active:scale-[0.98]"
          >
            <span className="font-display font-semibold">
              {quizModes[mode].label}
            </span>
            <span className="text-[13px] text-muted">
              {quizModes[mode].hint}
            </span>
            <span className="font-mono text-[11px] text-orange">
              {best[`quiz:${mode}`]
                ? `Record : ${best[`quiz:${mode}`]} / ${QUIZ_ROUND}`
                : "Pas encore joué"}
            </span>
          </Link>
        ))}
      </div>
    </GameLayout>
  )
}

function QuizGame({ mode }: { mode: QuizMode }) {
  const [question, setQuestion] = useState(() => makeQuestion(mode))
  const [answers, setAnswers] = useState<Answer[]>([])
  const [given, setGiven] = useState<string | null>(null)
  const [over, setOver] = useState(false)
  const { outcome, finish, clear } = useFinish()

  const score = answers.filter((a) => a.given === a.question.good).length
  const streak = (() => {
    let count = 0
    for (
      let i = answers.length - 1;
      i >= 0 && answers[i].given === answers[i].question.good;
      i--
    )
      count++
    return count
  })()

  const answer = useCallback(
    (option: string) => {
      if (given) return
      setGiven(option)
      setAnswers((list) => [...list, { question, given: option }])
      if (option === question.good) feedback.good()
      else feedback.bad()
    },
    [given, question]
  )

  function next() {
    if (answers.length >= QUIZ_ROUND) {
      finish({ game: "quiz", mode, score, total: QUIZ_ROUND })
      setOver(true)
      return
    }
    setQuestion(
      makeQuestion(
        mode,
        answers.map((a) => a.question.text)
      )
    )
    setGiven(null)
  }

  function restart() {
    setAnswers([])
    setGiven(null)
    setOver(false)
    setQuestion(makeQuestion(mode))
    clear()
  }

  if (over) {
    const ratio = score / QUIZ_ROUND
    return (
      <GameLayout title="Quiz">
        <ResultView
          eyebrow={`Résultat · ${quizModes[mode].label}`}
          big={`${score}/${QUIZ_ROUND}`}
          message={
            ratio === 1
              ? "Sans faute, bravo !"
              : ratio >= 0.7
                ? "Très bien joué."
                : ratio >= 0.4
                  ? "Pas mal, encore un tour ?"
                  : "On révise avec l'atlas, puis on recommence."
          }
          outcome={outcome}
          actions={
            <>
              <Button onClick={restart}>Rejouer</Button>
              <Link
                to="/jeux/quiz"
                search={{}}
                className={buttonClass("ghost")}
              >
                Changer de catégorie
              </Link>
            </>
          }
        >
          <ul className="flex flex-col">
            {answers.map((item) => {
              const ok = item.given === item.question.good
              return (
                <li
                  key={item.question.text}
                  className="flex gap-2.5 border-b border-line py-2 text-[13px] last:border-0"
                >
                  <span
                    className={cn(
                      "w-4 flex-none font-mono font-semibold",
                      ok ? "text-green" : "text-orange"
                    )}
                  >
                    {ok ? "✓" : "✗"}
                  </span>
                  <span>
                    {item.question.text} <b>{item.question.good}</b>
                    {!ok && (
                      <span className="text-muted"> (vous : {item.given})</span>
                    )}
                  </span>
                </li>
              )
            })}
          </ul>
        </ResultView>
      </GameLayout>
    )
  }

  return (
    <GameLayout title={quizModes[mode].label}>
      <GameTop step={answers.length} total={QUIZ_ROUND}>
        {Math.min(answers.length + (given ? 0 : 1), QUIZ_ROUND)}/{QUIZ_ROUND} ·{" "}
        {score} pts
        {streak > 1 && ` · série ${streak}`}
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
            {answers.length < QUIZ_ROUND
              ? "Question suivante"
              : "Voir le résultat"}
          </Button>
        </>
      )}
    </GameLayout>
  )
}

export function QuizPage({ mode }: { mode?: QuizMode }) {
  return mode ? <QuizGame key={mode} mode={mode} /> : <ModePicker />
}
