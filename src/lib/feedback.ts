import confetti from "canvas-confetti"
import { toast } from "sonner"

import { useProgress, type Outcome } from "@/stores/progress"

let audio: AudioContext | null = null

function tones(frequencies: number[], step = 0.09) {
  if (!useProgress.getState().settings.sound) return
  try {
    audio ??= new AudioContext()
    const context = audio
    const start = context.currentTime
    frequencies.forEach((frequency, index) => {
      const at = start + index * step
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.frequency.value = frequency
      gain.gain.setValueAtTime(0.0001, at)
      gain.gain.exponentialRampToValueAtTime(0.1, at + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, at + step)
      oscillator.connect(gain).connect(context.destination)
      oscillator.start(at)
      oscillator.stop(at + step + 0.02)
    })
  } catch {
    // No audio in this browser: the game works without it.
  }
}

function vibrate(pattern: number | number[]) {
  if (useProgress.getState().settings.vibration) navigator.vibrate?.(pattern)
}

/** Orange, white and green, the colours of the flag. */
export function burst() {
  void confetti({
    particleCount: 90,
    spread: 75,
    origin: { y: 0.75 },
    colors: ["#f77f00", "#ffffff", "#009e60"],
    disableForReducedMotion: true,
  })
}

export const feedback = {
  good: () => tones([660, 880]),
  bad: () => {
    tones([240, 180], 0.12)
    vibrate(120)
  },
  win: () => {
    tones([523, 659, 784, 1047], 0.1)
    burst()
  },
}

/** Tells the player what the game brought: XP, badges, a new level. */
export function announce(outcome: Outcome) {
  if (outcome.newBadges.length || outcome.levelUp || outcome.record)
    feedback.win()
  if (outcome.levelUp)
    toast.success(
      `Niveau ${outcome.levelUp.number} : ${outcome.levelUp.name}`,
      {
        description: "Vous montez d'un niveau.",
      }
    )
  for (const badge of outcome.newBadges)
    toast.success(`Badge débloqué : ${badge.title}`, {
      description: badge.description,
    })
}
