import { createFileRoute } from "@tanstack/react-router"

import { SitePage } from "@/features/decouvrir/site-page"

export const Route = createFileRoute("/decouvrir/sites/$id")({
  component: function Story() {
    const { id } = Route.useParams()
    return <SitePage key={id} id={id} />
  },
})
