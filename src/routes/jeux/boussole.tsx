import { createFileRoute } from "@tanstack/react-router"

import { CompassPage } from "@/features/games/compass-page"

export const Route = createFileRoute("/jeux/boussole")({
  component: CompassPage,
})
