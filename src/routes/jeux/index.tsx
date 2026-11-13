import { createFileRoute } from "@tanstack/react-router"

import { HubPage } from "@/features/games/hub-page"

export const Route = createFileRoute("/jeux/")({
  component: HubPage,
})
