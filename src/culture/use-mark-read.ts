import { useEffect } from "react"
import { toast } from "sonner"

import { burst } from "@/lib/feedback"
import { useProgress } from "@/stores/progress"

/** Counts the story as read once it is opened, and announces new badges. */
export function useMarkRead(key: string | undefined) {
  const markRead = useProgress((state) => state.markRead)
  useEffect(() => {
    if (!key) return
    for (const badge of markRead(key)) {
      burst()
      toast.success(`Badge débloqué : ${badge.title}`, {
        description: badge.description,
      })
    }
  }, [key, markRead])
}
