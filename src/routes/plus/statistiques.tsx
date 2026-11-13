import { createFileRoute } from "@tanstack/react-router"

import { StatsPage } from "@/features/more/stats-page"

export const Route = createFileRoute("/plus/statistiques")({
  component: StatsPage,
})
