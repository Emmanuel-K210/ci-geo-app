import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

import { DuelPage } from "@/features/games/duel-page"
import { QUIZ_MODES } from "@/features/games/questions"

export const Route = createFileRoute("/jeux/duel")({
  validateSearch: z.object({
    m: z.enum(QUIZ_MODES).optional().catch(undefined),
    s: z.coerce.number().int().nonnegative().optional().catch(undefined),
    a: z.coerce.number().int().min(0).max(10).optional().catch(undefined),
  }),
  component: function Duel() {
    const { m, s, a } = Route.useSearch()
    return <DuelPage mode={m} seed={s} against={a} />
  },
})
