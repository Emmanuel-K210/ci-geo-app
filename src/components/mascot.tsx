import { useMemo } from "react"

import { mascotSvg, type Mood } from "@/components/mascot-art"
import { cn } from "@/lib/cn"

/** Zézé, the quiz mascot: breathes, flaps an ear, jumps when happy. */
export function Zeze({
  mood = "idle",
  className,
}: {
  mood?: Mood
  className?: string
}) {
  const svg = useMemo(() => mascotSvg(mood), [mood])
  return (
    <span
      className={cn("zeze block", className)}
      data-mood={mood}
      // The drawing is our own static markup (mascot-art.ts), no user input.
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
