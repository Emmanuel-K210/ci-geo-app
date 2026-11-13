import { inject, pageview } from "@vercel/analytics"
import type { AnyRouter } from "@tanstack/react-router"

/**
 * Visit counts with Vercel Web Analytics (no cookies). Routes live in the
 * hash (#/jeux), which the script does not see, so each resolved route is sent
 * by hand, without its search parameters. Off the Vercel host the script is
 * simply missing and nothing is sent.
 */
export function startAnalytics(router: AnyRouter) {
  inject({
    mode: import.meta.env.PROD ? "production" : "development",
    debug: false,
    disableAutoTrack: true,
  })
  router.subscribe("onResolved", ({ toLocation }) => {
    const match = router.state.matches.at(-1)
    pageview({ path: toLocation.pathname, route: match?.routeId ?? null })
  })
}
