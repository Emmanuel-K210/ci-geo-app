import { createFileRoute } from "@tanstack/react-router"

import { DecouvrirPage } from "@/features/decouvrir/decouvrir-page"

export const Route = createFileRoute("/decouvrir/")({
  component: DecouvrirPage,
})
