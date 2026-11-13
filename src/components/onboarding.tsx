import { useNavigate } from "@tanstack/react-router"
import { Gamepad2, Map, Trophy, type LucideIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui"
import { cn } from "@/lib/cn"
import { useProgress } from "@/stores/progress"

type Slide = { icon: LucideIcon; title: string; text: string }

const SLIDES: Slide[] = [
  {
    icon: Map,
    title: "La Côte d'Ivoire dans la poche",
    text: "14 districts, 31 régions, des villes, des communes et leurs quartiers : feuilletez l'atlas ou cherchez un lieu.",
  },
  {
    icon: Gamepad2,
    title: "Apprendre en jouant",
    text: "Ville mystère, quiz, boussole, carte à trous… et chaque jour, un défi identique pour tout le monde.",
  },
  {
    icon: Trophy,
    title: "Progressez chaque jour",
    text: "Gagnez de l'XP, montez de niveau, débloquez des badges et tenez votre série de jours.",
  },
]

/** Three welcome screens on the very first visit. */
export function Onboarding() {
  const show = useProgress((state) => !state.onboarded && state.xp === 0)
  const finishOnboarding = useProgress((state) => state.finishOnboarding)
  const navigate = useNavigate()
  const [index, setIndex] = useState(0)
  const primary = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (show) primary.current?.focus()
  }, [show, index])

  useEffect(() => {
    if (!show) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") finishOnboarding()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [show, finishOnboarding])

  if (!show) return null
  const slide = SLIDES[index]
  const last = index === SLIDES.length - 1

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-sm sm:items-center sm:p-6"
    >
      <div className="flex w-full max-w-md flex-col gap-5 rounded-t-3xl bg-surface p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:rounded-3xl sm:pb-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5" aria-hidden>
            {SLIDES.map((item, dot) => (
              <span
                key={item.title}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  dot === index ? "w-6 bg-orange" : "w-1.5 bg-land-2"
                )}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={finishOnboarding}
            className="min-h-11 px-2 text-sm font-medium text-muted hover:text-ink"
          >
            Passer
          </button>
        </div>

        <div key={index} className="animate-pop flex flex-col gap-3">
          <span className="grid size-16 place-items-center rounded-2xl bg-green-soft text-green">
            <slide.icon className="size-8" aria-hidden />
          </span>
          <h2
            id="onboarding-title"
            className="font-display text-2xl leading-tight font-bold tracking-tight text-balance"
          >
            {slide.title}
          </h2>
          <p className="text-muted">{slide.text}</p>
          <p className="sr-only">
            Étape {index + 1} sur {SLIDES.length}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {last ? (
            <>
              <Button
                ref={primary}
                variant="orange"
                onClick={() => {
                  finishOnboarding()
                  void navigate({ to: "/jeux/du-jour" })
                }}
              >
                Jouer le défi du jour
              </Button>
              <Button variant="ghost" onClick={finishOnboarding}>
                Explorer d'abord
              </Button>
            </>
          ) : (
            <>
              <Button ref={primary} onClick={() => setIndex(index + 1)}>
                Suivant
              </Button>
              {index > 0 && (
                <Button variant="ghost" onClick={() => setIndex(index - 1)}>
                  Retour
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
