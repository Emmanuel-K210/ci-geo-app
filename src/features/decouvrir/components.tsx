import { Link } from "@tanstack/react-router"
import { Check, ChevronLeft } from "lucide-react"
import type { ReactNode } from "react"

import { buttonClass } from "@/components/button-class"
import type { Story } from "@/culture/stories"
import { articleUrl } from "@/culture/wiki"
import { WikiPhoto } from "@/culture/wiki-photo"
import {
  storyEyebrow,
  storyIcon,
  useIsRead,
} from "@/features/decouvrir/story-meta"
import { cn } from "@/lib/cn"

export function BackLink({
  to,
  children,
}: {
  to: "/decouvrir" | "/decouvrir/sites"
  children: string
}) {
  return (
    <Link
      to={to}
      className="-ml-2 inline-flex min-h-11 items-center gap-1 self-start rounded-full pr-3 pl-2 text-sm font-medium text-muted hover:text-ink"
    >
      <ChevronLeft className="size-5" aria-hidden />
      {children}
    </Link>
  )
}

function StoryLink({
  story,
  className,
  children,
}: {
  story: Story
  className: string
  children: ReactNode
}) {
  return story.kind === "site" ? (
    <Link
      to="/decouvrir/sites/$id"
      params={{ id: story.item.id }}
      className={className}
    >
      {children}
    </Link>
  ) : (
    <Link
      to="/decouvrir/peuples/$id"
      params={{ id: story.item.id }}
      className={className}
    >
      {children}
    </Link>
  )
}

/** A photo card that opens the story. */
export function StoryCard({
  story,
  size = "md",
}: {
  story: Story
  size?: "md" | "lg"
}) {
  const read = useIsRead(story.key)
  return (
    <StoryLink
      story={story}
      className="group flex flex-col overflow-hidden card transition-transform active:scale-[0.98]"
    >
      <div className="relative">
        <WikiPhoto
          title={story.item.wiki}
          alt={story.item.nom}
          icon={storyIcon(story)}
          className={size === "lg" ? "aspect-[16/10]" : "aspect-[4/3]"}
        />
        {read && (
          <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-surface/90 px-2 py-1 font-mono text-[10px] font-medium text-green backdrop-blur">
            <Check className="size-3" strokeWidth={3} aria-hidden />
            Lu
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3.5">
        <p className="eyebrow text-orange">{storyEyebrow(story)}</p>
        <p
          className={cn(
            "font-display leading-tight font-semibold text-balance",
            size === "lg" ? "text-xl" : "text-[15px]"
          )}
        >
          {story.item.nom}
        </p>
        <p className="line-clamp-3 text-[13px] leading-snug text-muted">
          {story.item.resume}
        </p>
      </div>
    </StoryLink>
  )
}

export function SectionTitle({
  title,
  children,
}: {
  title: string
  children?: ReactNode
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      {children}
    </div>
  )
}

export function Paragraphs({ items }: { items: string[] }) {
  return (
    <div className="flex flex-col gap-3 text-[15px] leading-relaxed">
      {items.map((text) => (
        <p key={text}>{text}</p>
      ))}
    </div>
  )
}

export function Facts({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null
  return (
    <section className="flex flex-col gap-2 rounded-2xl bg-green-soft p-4">
      <h2 className="eyebrow text-green">{title}</h2>
      <ul className="flex flex-col gap-2 text-sm leading-snug">
        {items.map((text) => (
          <li key={text} className="flex gap-2">
            <span
              aria-hidden
              className="mt-1.5 size-1.5 flex-none rounded-full bg-green"
            />
            {text}
          </li>
        ))}
      </ul>
    </section>
  )
}

export function StoryNotFound() {
  return (
    <div className="flex flex-col items-start gap-3 py-10">
      <h1 className="font-display text-2xl font-bold">Récit introuvable</h1>
      <p className="text-muted">Cette page n'existe pas, ou plus.</p>
      <Link to="/decouvrir" className={buttonClass()}>
        Retour à Découvrir
      </Link>
    </div>
  )
}

export function Sources({ wiki }: { wiki: string }) {
  return (
    <p className="text-xs text-muted">
      Résumé écrit pour CI-Geo. Pour aller plus loin :{" "}
      <a
        href={articleUrl(wiki)}
        target="_blank"
        rel="noreferrer"
        className="font-medium text-green underline-offset-2 hover:underline"
      >
        l'article Wikipédia
      </a>
      .
    </p>
  )
}
