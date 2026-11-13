import { createFileRoute } from "@tanstack/react-router"

import { PickerPage } from "@/features/more/picker-page"

export const Route = createFileRoute("/plus/selecteur")({
  component: PickerPage,
})
