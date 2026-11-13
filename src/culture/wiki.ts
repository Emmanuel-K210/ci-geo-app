import { useEffect, useSyncExternalStore } from "react"

// Photos from Wikimedia Commons, through the lead image of a French Wikipedia
// article. Requests made in the same tick go out as one batch; results are
// kept a week in localStorage.

export type WikiImage = {
  src: string
  width: number
  height: number
  /** Commons file name, for the credit link. */
  file: string
  artist?: string
  license?: string
}

const API = "https://fr.wikipedia.org/w/api.php"
const CACHE_KEY = "ci-geo-wiki-v3"
const TTL_MS = 7 * 24 * 3600 * 1000
const THUMB = 800

type Entry = { image: WikiImage | null; at: number }

function readCache(): Record<string, Entry> {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) ?? "{}")
  } catch {
    return {}
  }
}

const cache = new Map<string, WikiImage | null>()
for (const [title, entry] of Object.entries(readCache()))
  if (Date.now() - entry.at < TTL_MS) cache.set(title, entry.image)

function writeCache() {
  try {
    const now = Date.now()
    const out: Record<string, Entry> = {}
    for (const [title, image] of cache) out[title] = { image, at: now }
    localStorage.setItem(CACHE_KEY, JSON.stringify(out))
  } catch {
    // Storage full or blocked: the photos simply load again next time.
  }
}

const listeners = new Set<() => void>()
const notify = () => listeners.forEach((listener) => listener())

const pending = new Set<string>()
const inFlight = new Set<string>()
let timer: ReturnType<typeof setTimeout> | undefined

async function query(params: Record<string, string>) {
  const search = new URLSearchParams({
    action: "query",
    format: "json",
    formatversion: "2",
    origin: "*",
    ...params,
  })
  const response = await fetch(`${API}?${search}`)
  if (!response.ok) throw new Error(`Wikipedia ${response.status}`)
  return response.json()
}

/** The author as plain text: « Unknown author » and long credits made short. */
function artistName(html: string): string | undefined {
  const text = (
    new DOMParser().parseFromString(html, "text/html").body.textContent ?? ""
  )
    .replace(/\s+/g, " ")
    .trim()
  if (!text || /unknown|inconnu/i.test(text)) return undefined
  return text.length > 60 ? `${text.slice(0, 57)}…` : text
}

async function load(titles: string[]) {
  const data = await query({
    prop: "pageimages",
    piprop: "thumbnail|name",
    pithumbsize: String(THUMB),
    redirects: "1",
    titles: titles.join("|"),
  })
  // Follow normalisations and redirects back to the titles that were asked.
  const alias = new Map<string, string>()
  for (const step of [
    ...(data.query?.normalized ?? []),
    ...(data.query?.redirects ?? []),
  ])
    alias.set(step.to, step.from)
  const original = (title: string) => {
    let current = title
    while (alias.has(current)) current = alias.get(current)!
    return current
  }

  const found = new Map<string, WikiImage>()
  for (const page of data.query?.pages ?? [])
    // Only free files from Commons: a file stored on fr.wikipedia itself is a
    // non-free image used there under fair use, which the app may not reuse.
    if (
      page.thumbnail &&
      page.pageimage &&
      page.thumbnail.source.includes("/wikipedia/commons/")
    )
      found.set(original(page.title), {
        src: page.thumbnail.source,
        width: page.thumbnail.width,
        height: page.thumbnail.height,
        file: page.pageimage,
      })

  // Authors and licences, for the credit under each photo.
  if (found.size) {
    const files = [...new Set([...found.values()].map((image) => image.file))]
    const meta = await query({
      prop: "imageinfo",
      iiprop: "extmetadata",
      iiextmetadatafilter: "Artist|LicenseShortName",
      titles: files.map((file) => `File:${file}`).join("|"),
    }).catch(() => null)
    const byFile = new Map<string, { artist?: string; license?: string }>()
    for (const page of meta?.query?.pages ?? []) {
      const ext = page.imageinfo?.[0]?.extmetadata
      byFile.set(
        String(page.title)
          .replace(/^[^:]+:/, "")
          .replace(/ /g, "_"),
        {
          artist: ext?.Artist?.value ? artistName(ext.Artist.value) : undefined,
          license: ext?.LicenseShortName?.value,
        }
      )
    }
    for (const image of found.values())
      Object.assign(image, byFile.get(image.file.replace(/ /g, "_")))
  }

  for (const [title, image] of found)
    if (image.license && /non[ -]libre|non-free|fair use/i.test(image.license))
      found.delete(title)
  for (const title of titles) cache.set(title, found.get(title) ?? null)
  writeCache()
}

function flush() {
  const titles = [...pending].slice(0, 50)
  for (const title of titles) {
    pending.delete(title)
    inFlight.add(title)
  }
  if (pending.size) timer = setTimeout(flush, 0)
  load(titles)
    .catch(() => {
      // Offline or refused: keep the illustration, try again on next visit.
    })
    .finally(() => {
      for (const title of titles) inFlight.delete(title)
      notify()
    })
}

function request(title: string) {
  if (cache.has(title) || pending.has(title) || inFlight.has(title)) return
  pending.add(title)
  clearTimeout(timer)
  timer = setTimeout(flush, 0)
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** The photo of an article: undefined while loading, null when there is none. */
export function useWikiImage(title: string): WikiImage | null | undefined {
  useEffect(() => request(title), [title])
  return useSyncExternalStore(subscribe, () =>
    cache.has(title) ? cache.get(title) : undefined
  )
}

export const articleUrl = (title: string) =>
  `https://fr.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`

export const fileUrl = (file: string) =>
  `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file)}`
