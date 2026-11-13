import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

import { QuizPage } from "@/features/games/quiz-page"
import { QUIZ_MODES } from "@/features/games/questions"

export const Route = createFileRoute("/jeux/quiz")({
  validateSearch: z.object({
    mode: z.enum(QUIZ_MODES).optional().catch(undefined),
  }),
  component: function Quiz() {
    return <QuizPage mode={Route.useSearch().mode} />
  },
})
