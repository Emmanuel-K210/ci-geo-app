import {
  createHashHistory,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import { startAnalytics } from "@/lib/analytics"
import { routeTree } from "@/routeTree.gen"
import { startCloud } from "@/stores/cloud"
import "@/styles.css"

// Hash URLs (#/jeux): the build works from a plain folder or any static host.
const router = createRouter({
  routeTree,
  history: createHashHistory(),
  defaultPreload: "intent",
  scrollRestoration: true,
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

startCloud()
startAnalytics(router)

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
