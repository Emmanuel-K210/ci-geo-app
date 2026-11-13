import { createFileRoute } from "@tanstack/react-router"

import { DailyPage } from "@/features/games/daily-page"

export const Route = createFileRoute("/jeux/du-jour")({
  component: DailyPage,
})
