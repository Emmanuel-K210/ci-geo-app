import { createFileRoute } from "@tanstack/react-router"

import { CluesPage } from "@/features/games/clues-page"

export const Route = createFileRoute("/jeux/ville-mystere")({
  component: CluesPage,
})
