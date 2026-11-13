import { useMemo, useRef, useState } from "react"

import { Button } from "@/components/ui"
import {
  cluePoints,
  cluesFor,
  CLUE_COUNT,
  CLUES_ROUND,
  guessFeedback,
  type Guess,
} from "@/features/games/clues"
import {
  Feedback,
  GameLayout,
  GameTop,
  ResultView,
} from "@/features/games/components"
import { useFinish } from "@/features/games/use-finish"
import { villes, type Ville } from "@/geo"
import { ARROWS, towards } from "@/geo/compass"
import { cn } from "@/lib/cn"
import { feedback } from "@/lib/feedback"
import { fmtKm, normalize, plural } from "@/lib/format"
import { sample } from "@/lib/random"

const MAX_POINTS = CLUE_COUNT * CLUES_ROUND

type Status = "playing" | "found" | "lost"

export function CluesPage() {
  const [targets, setTargets] = useState(() => sample(villes, CLUES_ROUND))
  const [index, setIndex] = useState(0)
  const [guesses, setGuesses] = useState<Guess[]>([])
  const [status, setStatus] = useState<Status>("playing")
  const [points, setPoints] = useState(0)
  const [firstClue, setFirstClue] = useState(0)
  const [query, setQuery] = useState("")
  const [over, setOver] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  const { outcome, finish, clear } = useFinish()

  const target = targets[index]
  const clues = useMemo(() => cluesFor(target), [target])
  const shown = status === "playing" ? guesses.length + 1 : CLUE_COUNT

  const suggestions = useMemo(() => {
    const key = normalize(query)
    if (!key) return []
    const tried = new Set(guesses.map((guess) => guess.ville))
    return villes
      .filter(
        (ville) => !tried.has(ville) && normalize(ville.nom).includes(key)
      )
      .sort(
        (a, b) =>
          Number(!normalize(a.nom).startsWith(key)) -
          Number(!normalize(b.nom).startsWith(key))
      )
      .slice(0, 6)
  }, [query, guesses])

  function guess(ville: Ville) {
    setQuery("")
    if (ville === target) {
      const earned = cluePoints(guesses.length)
      setPoints(points + earned)
      if (guesses.length === 0) setFirstClue(firstClue + 1)
      setStatus("found")
      feedback.good()
      return
    }
    const next = [...guesses, guessFeedback(ville, target)]
    setGuesses(next)
    feedback.bad()
    if (next.length >= CLUE_COUNT) setStatus("lost")
    else input.current?.focus()
  }

  function nextCity() {
    if (index + 1 >= CLUES_ROUND) {
      finish({ game: "clues", points, firstClue })
      setOver(true)
      return
    }
    setIndex(index + 1)
    setGuesses([])
    setStatus("playing")
    requestAnimationFrame(() => input.current?.focus())
  }

  function restart() {
    setTargets(sample(villes, CLUES_ROUND))
    setIndex(0)
    setGuesses([])
    setStatus("playing")
    setPoints(0)
    setFirstClue(0)
    setOver(false)
    clear()
  }

  if (over)
    return (
      <GameLayout title="La ville mystère">
        <ResultView
          eyebrow="Ville mystère · terminé"
          big={`${points}`}
          message={
            points === MAX_POINTS
              ? "Tout trouvé au premier indice !"
              : points >= 18
                ? "Un vrai détective."
                : points >= 10
                  ? "Bien joué, encore une enquête ?"
                  : "La carte vous aidera pour la prochaine."
          }
          detail={`sur ${MAX_POINTS} points · ${plural(firstClue, "ville trouvée", "villes trouvées")} au premier indice`}
          outcome={outcome}
          actions={<Button onClick={restart}>Nouvelle enquête</Button>}
        />
      </GameLayout>
    )

  return (
    <GameLayout title="La ville mystère">
      <GameTop
        step={index + (status === "playing" ? 0 : 1)}
        total={CLUES_ROUND}
      >
        {index + 1}/{CLUES_ROUND} · {points} pts
      </GameTop>

      <section className="flex flex-col gap-2 card p-4" aria-live="polite">
        <div className="flex items-center justify-between">
          <p className="eyebrow text-green">Indices</p>
          <p className="font-mono text-xs text-muted">
            {status === "playing"
              ? `vaut ${cluePoints(guesses.length)} pts`
              : status === "found"
                ? `+${cluePoints(guesses.length)} pts`
                : "0 pt"}
          </p>
        </div>
        <ol className="flex flex-col gap-2">
          {clues.slice(0, shown).map((clue, position) => (
            <li
              key={clue.label}
              className={cn(
                "flex gap-3 rounded-xl bg-land p-3",
                position === shown - 1 && status === "playing" && "animate-pop"
              )}
            >
              <span className="grid size-6 flex-none place-items-center rounded-full bg-orange font-mono text-xs text-orange-ink">
                {position + 1}
              </span>
              <span className="text-[15px]">{clue.text}</span>
            </li>
          ))}
        </ol>
      </section>

      {guesses.length > 0 && (
        <ul className="flex flex-col gap-1.5" aria-label="Essais">
          {guesses.map((item) => (
            <li
              key={item.ville.id}
              className="animate-pop flex min-h-11 items-center gap-3 rounded-xl border border-line bg-surface px-3 text-sm"
            >
              <span className="flex-1 font-medium line-through decoration-orange">
                {item.ville.nom}
              </span>
              <span className="font-mono text-xs text-muted">
                {fmtKm(item.km)}
              </span>
              <span
                className="grid size-8 place-items-center rounded-full bg-land text-lg"
                aria-label={`La ville mystère est ${towards(item.towards)}`}
              >
                {ARROWS[item.towards]}
              </span>
            </li>
          ))}
        </ul>
      )}

      {status === "playing" ? (
        <div className="relative">
          <input
            ref={input}
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && suggestions[0]) guess(suggestions[0])
            }}
            placeholder="Tapez le nom d'une ville…"
            aria-label="Votre réponse"
            autoComplete="off"
            className="h-12 w-full rounded-2xl border border-line bg-surface px-4 text-[16px] outline-none focus:border-orange"
          />
          {suggestions.length > 0 && (
            <div className="mt-1.5 flex flex-col overflow-hidden rounded-2xl border border-line bg-surface">
              {suggestions.map((ville) => (
                <button
                  key={ville.id}
                  type="button"
                  onClick={() => guess(ville)}
                  className="min-h-12 border-b border-line px-4 text-left font-medium last:border-0 hover:bg-land"
                >
                  {ville.nom}
                </button>
              ))}
            </div>
          )}
          <p className="mt-2 text-xs text-muted">
            Chaque erreur dévoile un indice et la direction de la ville mystère.
          </p>
        </div>
      ) : (
        <>
          <Feedback ok={status === "found"}>
            {status === "found"
              ? `Trouvé : ${target.nom}${target.region ? `, région ${target.region.nom}` : ""}.`
              : `C'était ${target.nom}${target.region ? `, région ${target.region.nom}` : ""}.`}
          </Feedback>
          <Button autoFocus onClick={nextCity} className="self-start">
            {index + 1 < CLUES_ROUND ? "Ville suivante" : "Voir le résultat"}
          </Button>
        </>
      )}
    </GameLayout>
  )
}
