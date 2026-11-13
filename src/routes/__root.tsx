import { createRootRoute, Link } from "@tanstack/react-router"

import { AppShell } from "@/components/app-shell"
import { buttonClass } from "@/components/button-class"

export const Route = createRootRoute({
  component: AppShell,
  notFoundComponent: () => (
    <div className="flex flex-col items-start gap-3 py-10">
      <h1 className="font-display text-2xl font-bold">Page introuvable</h1>
      <p className="text-muted">Ce lieu n'existe pas sur notre carte.</p>
      <Link to="/" className={buttonClass()}>
        Retour à l'accueil
      </Link>
    </div>
  ),
})
