import { useState } from "react"

import { announce } from "@/lib/feedback"
import type { GameEvent } from "@/stores/events"
import { useProgress, type Outcome } from "@/stores/progress"

/** Records the finished game once, and gives back what it brought. */
export function useFinish() {
  const record = useProgress((state) => state.record)
  const [outcome, setOutcome] = useState<Outcome | null>(null)
  return {
    outcome,
    finish: (event: GameEvent) => {
      const result = record(event)
      announce(result)
      setOutcome(result)
      return result
    },
    clear: () => setOutcome(null),
  }
}
