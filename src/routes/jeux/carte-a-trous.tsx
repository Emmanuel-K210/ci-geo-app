import { createFileRoute } from "@tanstack/react-router"

import { PinPage } from "@/features/games/pin-page"

export const Route = createFileRoute("/jeux/carte-a-trous")({
  component: PinPage,
})
