import { createFileRoute } from "@tanstack/react-router"

import { PeuplePage } from "@/features/decouvrir/peuple-page"

export const Route = createFileRoute("/decouvrir/peuples/$id")({
  component: function Story() {
    const { id } = Route.useParams()
    return <PeuplePage key={id} id={id} />
  },
})
