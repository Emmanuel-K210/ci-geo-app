import { createFileRoute } from "@tanstack/react-router"

import { CartePage } from "@/features/carte/carte-page"
import { carteSearchSchema } from "@/features/carte/search"

export const Route = createFileRoute("/carte")({
  validateSearch: carteSearchSchema,
  component: function Carte() {
    return <CartePage search={Route.useSearch()} />
  },
})
