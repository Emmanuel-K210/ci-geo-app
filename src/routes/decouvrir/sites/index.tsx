import { createFileRoute } from "@tanstack/react-router"

import { SitesPage } from "@/features/decouvrir/sites-page"

export const Route = createFileRoute("/decouvrir/sites/")({
  component: SitesPage,
})
