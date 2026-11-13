import { useEffect, useState } from "react"

import { msUntilNextDay } from "@/features/games/daily"

export function useCountdown() {
  const [left, setLeft] = useState(() => msUntilNextDay())
  useEffect(() => {
    const timer = setInterval(() => setLeft(msUntilNextDay()), 1000)
    return () => clearInterval(timer)
  }, [])
  const seconds = Math.floor(left / 1000)
  const pad = (value: number) => String(value).padStart(2, "0")
  return `${pad(Math.floor(seconds / 3600))}:${pad(Math.floor((seconds % 3600) / 60))}:${pad(seconds % 60)}`
}

export const shareUrl = () =>
  location.protocol.startsWith("http") ? location.href.split("#")[0] : undefined
