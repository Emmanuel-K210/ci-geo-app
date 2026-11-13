import { createFileRoute } from "@tanstack/react-router"

import { SitesGamePage } from "@/features/games/sites-page"

export const Route = createFileRoute("/jeux/ou-est-ce-site")({
  component: SitesGamePage,
})
