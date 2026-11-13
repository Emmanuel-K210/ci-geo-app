import { createFileRoute } from "@tanstack/react-router"

import { MorePage } from "@/features/more/more-page"

export const Route = createFileRoute("/plus/")({
  component: MorePage,
})
