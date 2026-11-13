import type { LucideIcon } from "lucide-react"

import { fileUrl, useWikiImage } from "@/culture/wiki"
import { cn } from "@/lib/cn"

/**
 * The photo of a Wikipedia article, with its credit; an illustration in the
 * colours of the app while it loads or when there is none.
 */
export function WikiPhoto({
  title,
  alt,
  icon: Icon,
  className,
  credit = "short",
}: {
  title: string
  alt: string
  icon: LucideIcon
  className?: string
  credit?: "short" | "full" | "none"
}) {
  const image = useWikiImage(title)
  return (
    <figure className={cn("relative overflow-hidden bg-land", className)}>
      {image ? (
        <img
          src={image.src}
          alt={alt}
          loading="lazy"
          decoding="async"
          width={image.width}
          height={image.height}
          className="absolute inset-0 size-full object-cover"
        />
      ) : (
        <div
          aria-hidden
          className={cn(
            "absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_30%_20%,var(--green-soft),transparent_60%),radial-gradient(circle_at_80%_90%,var(--warn-bg),transparent_55%)]",
            image === undefined && "animate-pulse"
          )}
        >
          <Icon className="size-10 text-green/60" />
        </div>
      )}
      {image && credit !== "none" && (
        <figcaption className="absolute right-0 bottom-0 left-0 truncate bg-gradient-to-t from-black/60 to-transparent px-2.5 pt-4 pb-1 text-[10px] text-white/90">
          {/* Cards are links already: only the full credit links to the file. */}
          {credit === "full" ? (
            <a
              href={fileUrl(image.file)}
              target="_blank"
              rel="noreferrer"
              className="hover:underline"
            >
              Photo : {image.artist || "auteur inconnu"}
              {image.license && ` · ${image.license}`} · Wikimedia Commons
            </a>
          ) : (
            <span>© {image.artist || "Wikimedia Commons"}</span>
          )}
        </figcaption>
      )}
    </figure>
  )
}
