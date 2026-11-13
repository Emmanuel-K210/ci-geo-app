import { Link, Outlet } from "@tanstack/react-router"
import {
  Gamepad2,
  LayoutGrid,
  Map,
  MapPinned,
  Search,
  Trophy,
  type LucideIcon,
} from "lucide-react"
import { useEffect } from "react"
import { Toaster } from "sonner"

import { SearchSheet } from "@/components/search-sheet"
import { dayKey } from "@/features/games/daily"
import { cn } from "@/lib/cn"
import { levelOf } from "@/stores/levels"
import { useProgress } from "@/stores/progress"
import { useUi } from "@/stores/ui"

type NavItem = {
  to: "/" | "/carte" | "/jeux" | "/profil" | "/plus"
  label: string
  icon: LucideIcon
}

const NAV: NavItem[] = [
  { to: "/", label: "Atlas", icon: Map },
  { to: "/carte", label: "Carte", icon: MapPinned },
  { to: "/jeux", label: "Jeux", icon: Gamepad2 },
  { to: "/profil", label: "Profil", icon: Trophy },
  { to: "/plus", label: "Plus", icon: LayoutGrid },
]

function Pin({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 34 34" aria-hidden className={className}>
      <path
        d="M17 3c-6 0-10.5 4.6-10.5 10.3C6.5 21 17 31 17 31s10.5-10 10.5-17.7C27.5 7.6 23 3 17 3Z"
        fill="var(--orange)"
      />
      <circle cx="17" cy="13.3" r="4" fill="var(--surface)" />
    </svg>
  )
}

/** An orange dot on « Jeux » while today's challenge is waiting. */
function useDailyPending() {
  return useProgress((state) => !state.daily[dayKey()])
}

function LevelChip() {
  const xp = useProgress((state) => state.xp)
  const level = levelOf(xp)
  return (
    <Link
      to="/profil"
      className="flex min-h-11 items-center gap-2 rounded-full bg-land py-1 pr-3 pl-1.5"
      aria-label={`Niveau ${level.number}, ${level.name}, ${xp} points d'expérience`}
    >
      <span className="grid size-8 place-items-center rounded-full bg-orange font-display text-sm font-bold text-orange-ink">
        {level.number}
      </span>
      <span className="flex flex-col gap-1">
        <span className="font-mono text-[11px] leading-none">{xp} XP</span>
        <span className="block h-1 w-12 overflow-hidden rounded-full bg-land-2">
          <span
            className="block h-full rounded-full bg-orange"
            style={{ width: `${level.progress * 100}%` }}
          />
        </span>
      </span>
    </Link>
  )
}

export function AppShell() {
  const setSearchOpen = useUi((state) => state.setSearchOpen)
  const dailyPending = useDailyPending()

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      if (event.key === "/" && !target.closest("input, select, textarea")) {
        event.preventDefault()
        setSearchOpen(true)
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [setSearchOpen])

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-paper/90 pt-[env(safe-area-inset-top)] backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-3 px-4">
          <Link
            to="/"
            className="flex items-center gap-2"
            aria-label="CI-Geo, accueil"
          >
            <Pin className="size-8" />
            <span className="font-display text-lg font-bold tracking-tight">
              CI-Geo
            </span>
          </Link>
          <nav className="ml-4 hidden gap-1 lg:flex" aria-label="Sections">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                className="relative rounded-full px-3.5 py-2 text-sm font-medium text-muted hover:text-ink data-[status=active]:bg-land data-[status=active]:text-ink"
              >
                {item.label}
                {item.to === "/jeux" && dailyPending && (
                  <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-orange" />
                )}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <LevelChip />
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Rechercher un lieu"
              className="grid size-11 place-items-center rounded-full border border-line bg-surface"
            >
              <Search className="size-5" aria-hidden />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pt-4 pb-nav lg:pb-12">
        <Outlet />
      </main>

      <nav
        aria-label="Sections"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      >
        <div className="mx-auto grid max-w-md grid-cols-5">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="group flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted data-[status=active]:text-ink"
            >
              <span
                className={cn(
                  "relative grid h-8 w-14 place-items-center rounded-full transition-colors group-data-[status=active]:bg-land"
                )}
              >
                <item.icon
                  className="size-5 group-data-[status=active]:text-orange"
                  aria-hidden
                />
                {item.to === "/jeux" && dailyPending && (
                  <span className="absolute top-0.5 right-3 size-2 rounded-full bg-orange ring-2 ring-surface" />
                )}
              </span>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      <SearchSheet />
      <Toaster
        position="top-center"
        theme="system"
        toastOptions={{
          className:
            "!rounded-2xl !border-line !bg-surface !text-ink !font-sans",
        }}
      />
    </>
  )
}
