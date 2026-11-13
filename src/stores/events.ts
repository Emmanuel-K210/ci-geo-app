import type { QuizMode } from "@/features/games/questions"

export const GAME_IDS = [
  "daily",
  "clues",
  "closer",
  "quiz",
  "chrono",
  "pin",
  "compass",
] as const
export type GameId = (typeof GAME_IDS)[number]

export type GameEvent =
  | { game: "quiz"; mode: QuizMode; score: number; total: number }
  | { game: "chrono"; score: number }
  | { game: "pin"; score: number; total: number }
  | { game: "daily"; day: string; distances: number[] }
  | { game: "clues"; points: number; firstClue: number }
  | { game: "closer"; streak: number }
  | { game: "compass"; score: number; total: number }
