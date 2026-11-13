import {
  Church,
  Landmark,
  Mountain,
  Palette,
  Users,
  Waves,
  type LucideIcon,
} from "lucide-react"

import { groupeById } from "@/culture/peuples"
import { CATEGORIES, type SiteCategorie } from "@/culture/sites"
import type { Story } from "@/culture/stories"
import { useProgress } from "@/stores/progress"

export const CATEGORY_ICONS: Record<SiteCategorie, LucideIcon> = {
  patrimoine: Landmark,
  nature: Mountain,
  foi: Church,
  culture: Palette,
  plage: Waves,
}

export const storyIcon = (story: Story) =>
  story.kind === "site" ? CATEGORY_ICONS[story.item.categorie] : Users

export const storyEyebrow = (story: Story) =>
  story.kind === "site"
    ? CATEGORIES[story.item.categorie]
    : `Peuple ${groupeById(story.item.groupeId)?.nom ?? ""}`

export function useIsRead(key: string) {
  return useProgress((state) => state.read.includes(key))
}
