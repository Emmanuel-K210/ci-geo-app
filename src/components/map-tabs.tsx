import { Link } from "@tanstack/react-router"

const TAB =
  "inline-flex min-h-9 items-center rounded-full px-4 text-[13px] font-medium text-muted data-[status=active]:bg-surface data-[status=active]:text-ink data-[status=active]:shadow-sm"

/** Atlas or map: on phones the map is reached from the atlas. */
export function MapTabs() {
  return (
    <nav
      aria-label="Vue"
      className="inline-flex self-start rounded-full border border-line bg-land p-[3px]"
    >
      <Link to="/atlas" className={TAB}>
        Atlas
      </Link>
      <Link to="/carte" className={TAB}>
        Carte
      </Link>
    </nav>
  )
}
