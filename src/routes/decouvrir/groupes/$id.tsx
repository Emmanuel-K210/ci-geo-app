import { createFileRoute } from "@tanstack/react-router"

import { GroupePage } from "@/features/decouvrir/groupe-page"

export const Route = createFileRoute("/decouvrir/groupes/$id")({
  component: function Story() {
    const { id } = Route.useParams()
    return <GroupePage key={id} id={id} />
  },
})
