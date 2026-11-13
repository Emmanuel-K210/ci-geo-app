import { createFileRoute } from "@tanstack/react-router"

import { ExportsPage } from "@/features/more/exports-page"

export const Route = createFileRoute("/plus/exports")({
  component: ExportsPage,
})
