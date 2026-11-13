import { createFileRoute } from "@tanstack/react-router"

import { ChronoPage } from "@/features/games/chrono-page"

export const Route = createFileRoute("/jeux/chrono")({
  component: ChronoPage,
})
