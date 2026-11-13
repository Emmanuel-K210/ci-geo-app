import { createFileRoute } from "@tanstack/react-router"

import { ListPage } from "@/features/more/list-page"

export const Route = createFileRoute("/plus/liste")({
  component: ListPage,
})
