import { createFileRoute } from "@tanstack/react-router"

import { CloserPage } from "@/features/games/closer-page"

export const Route = createFileRoute("/jeux/plus-pres-plus-loin")({
  component: CloserPage,
})
