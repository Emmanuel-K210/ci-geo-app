import {
  makeQuestion,
  type Question,
  type QuizMode,
} from "@/features/games/questions"
import { seededRng } from "@/lib/random"

export const DUEL_ROUND = 10

/** The same ten questions for both players: they come from the seed. */
export function duelQuestions(mode: QuizMode, seed: number): Question[] {
  const rng = seededRng(seed)
  const questions: Question[] = []
  for (let i = 0; i < DUEL_ROUND; i++)
    questions.push(
      makeQuestion(
        mode,
        questions.map((q) => q.text),
        rng
      )
    )
  return questions
}

export const newSeed = () => Math.floor(Math.random() * 2 ** 31)

/** The link a friend opens to play the same questions against a score. */
export function duelLink(mode: QuizMode, seed: number, score: number) {
  const base = location.href.split("#")[0]
  return `${base}#/jeux/duel?m=${mode}&s=${seed}&a=${score}`
}
