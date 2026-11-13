import { Lock } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { Button, PageTitle, ProgressBar } from "@/components/ui"
import { dailyStreak } from "@/features/games/daily"
import { villes } from "@/geo"
import { cn } from "@/lib/cn"
import { plural } from "@/lib/format"
import { BADGES } from "@/stores/badges"
import { LEVELS, levelOf } from "@/stores/levels"
import { useProgress, type Settings } from "@/stores/progress"

function Toggle({
  label,
  setting,
}: {
  label: string
  setting: keyof Settings
}) {
  const value = useProgress((state) => state.settings[setting])
  const setSetting = useProgress((state) => state.setSetting)
  return (
    <label className="flex min-h-12 items-center justify-between gap-3 border-b border-line last:border-0">
      <span className="font-medium">{label}</span>
      <input
        type="checkbox"
        role="switch"
        checked={value}
        onChange={(event) => setSetting(setting, event.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className="relative h-7 w-12 rounded-full bg-land-2 transition-colors peer-checked:bg-green peer-focus-visible:outline-2 peer-focus-visible:outline-orange after:absolute after:top-1 after:left-1 after:size-5 after:rounded-full after:bg-surface after:shadow after:transition-transform peer-checked:after:translate-x-5"
      />
    </label>
  )
}

export function ProfilePage() {
  const { xp, badges, played, daily, visited, reset } = useProgress()
  const level = levelOf(xp)
  const [confirm, setConfirm] = useState(false)
  const games = Object.values(played).reduce<number>(
    (sum, count) => sum + (count ?? 0),
    0
  )
  const earned = BADGES.filter((badge) => badges[badge.id]).length

  return (
    <div className="flex flex-col gap-4">
      <PageTitle eyebrow="Profil" title="Votre progression" />

      <section className="flex flex-col gap-3 card p-5">
        <div className="flex items-center gap-4">
          <span className="grid size-16 flex-none place-items-center rounded-2xl bg-orange font-display text-3xl font-bold text-orange-ink">
            {level.number}
          </span>
          <div className="min-w-0">
            <p className="eyebrow">Niveau {level.number}</p>
            <p className="font-display text-2xl leading-tight font-bold">
              {level.name}
            </p>
            <p className="font-mono text-xs text-muted">
              {xp} XP
              {level.next &&
                ` · encore ${level.next.min - xp} pour « ${level.next.name} »`}
            </p>
          </div>
        </div>
        <ProgressBar value={level.progress} label="Vers le niveau suivant" />
        <dl className="grid grid-cols-3 gap-2 text-center">
          {[
            [String(games), "parties"],
            [String(dailyStreak(Object.keys(daily))), "jours de suite"],
            [`${visited.length}/${villes.length}`, "villes visitées"],
          ].map(([value, label]) => (
            <div key={label} className="rounded-xl bg-land p-2.5">
              <dt className="sr-only">{label}</dt>
              <dd className="font-display text-xl font-bold">{value}</dd>
              <dd className="text-[11px] text-muted">{label}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="flex flex-col gap-2.5">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-lg font-semibold">Badges</h2>
          <span className="font-mono text-xs text-muted">
            {earned}/{BADGES.length}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
          {BADGES.map((badge) => {
            const at = badges[badge.id]
            return (
              <div
                key={badge.id}
                className={cn(
                  "flex flex-col items-center gap-1.5 card p-3 text-center",
                  !at && "opacity-60"
                )}
              >
                <span
                  className={cn(
                    "grid size-12 place-items-center rounded-full",
                    at ? "bg-gold/15 text-gold" : "bg-land text-muted"
                  )}
                >
                  {at ? (
                    <badge.icon className="size-6" aria-hidden />
                  ) : (
                    <Lock className="size-5" aria-hidden />
                  )}
                </span>
                <span className="font-display text-sm leading-tight font-semibold">
                  {badge.title}
                </span>
                <span className="text-[12px] leading-snug text-muted">
                  {badge.description}
                </span>
                {at && (
                  <span className="font-mono text-[10px] text-green">
                    {new Date(at).toLocaleDateString("fr-FR")}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <section className="flex flex-col card p-4">
        <h2 className="mb-1 font-display text-lg font-semibold">Réglages</h2>
        <Toggle label="Sons" setting="sound" />
        <Toggle label="Vibrations" setting="vibration" />
      </section>

      <section className="flex flex-col gap-2 card p-4">
        <h2 className="font-display text-lg font-semibold">Les niveaux</h2>
        <ol className="flex flex-col">
          {LEVELS.map((item, index) => (
            <li
              key={item.name}
              className={cn(
                "flex min-h-10 items-center gap-3 border-b border-line text-sm last:border-0",
                index + 1 === level.number && "font-semibold text-orange"
              )}
            >
              <span className="w-5 font-mono">{index + 1}</span>
              <span className="flex-1">{item.name}</span>
              <span className="font-mono text-xs text-muted">
                {item.min} XP
              </span>
            </li>
          ))}
        </ol>
        <p className="text-xs text-muted">
          La progression est gardée dans ce navigateur, sur cet appareil.
        </p>
        {confirm ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm">
              Effacer {plural(earned, "badge")} et {xp} XP ?
            </span>
            <Button
              variant="orange"
              onClick={() => {
                reset()
                setConfirm(false)
                toast.success("Progression effacée")
              }}
            >
              Effacer
            </Button>
            <Button variant="ghost" onClick={() => setConfirm(false)}>
              Annuler
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            className="self-start"
            onClick={() => setConfirm(true)}
          >
            Remettre à zéro
          </Button>
        )}
      </section>
    </div>
  )
}
