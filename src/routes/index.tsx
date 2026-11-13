import { createFileRoute } from "@tanstack/react-router"

import { AtlasPage } from "@/features/atlas/atlas-page"
import { atlasSearchSchema } from "@/features/atlas/search"

export const Route = createFileRoute("/")({
  validateSearch: atlasSearchSchema,
  component: function Atlas() {
    return <AtlasPage search={Route.useSearch()} />
  },
})
