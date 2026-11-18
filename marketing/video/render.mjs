// Renders the TikTok videos (1080 × 1920, 30 fps, MP4 H.264) with the
// installed Chrome: each scene page is set to a time, screenshotted, and the
// frames are encoded by Chrome itself.
//
//   npm run build && npx vite preview --port 4173
//   node marketing/video/render.mjs [scene …]            the hand-made scenes
//   node marketing/video/render.mjs --jobs=plan.json     a batch (batch.mjs)
//   … --stills=3.5,5                                     frames as JPEG only
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs"
import { execFileSync } from "node:child_process"
import { fileURLToPath } from "node:url"
import { chromium } from "playwright-core"

import { speak, voiceEnabled } from "./elevenlabs.mjs"

const ROOT = new URL("../../", import.meta.url)
const HERE = new URL("./", import.meta.url)
const SITE = new URL("dist/_videos/", ROOT)
const OUT = new URL("out/", HERE)
const BASE = "http://localhost:4173/_videos/"
const CHROME =
  process.env.CHROME ?? "C:/Program Files/Google/Chrome/Application/chrome.exe"
const WIDTH = 1080
const HEIGHT = 1920
const FPS = 30

/** Hand-made scenes → duration in seconds. */
const SCENES = {
  "v1-presentation": 13.5,
  "v2-defi": 24,
  "v3-pokou": 25,
}

// The site the scenes are served from: pages, styles, fonts and data.
mkdirSync(new URL("fonts/", SITE), { recursive: true })
mkdirSync(OUT, { recursive: true })
for (const file of readdirSync(HERE))
  if (/\.(html|js|css)$/.test(file))
    copyFileSync(new URL(file, HERE), new URL(file, SITE))
for (const file of ["poster.css", "demo.js"])
  copyFileSync(new URL(`marketing/posters/${file}`, ROOT), new URL(file, SITE))
copyFileSync(
  new URL("node_modules/mp4-muxer/build/mp4-muxer.js", ROOT),
  new URL("mp4-muxer.js", SITE)
)
copyFileSync(new URL("src/geo/ci-geo.json", ROOT), new URL("ci-geo.json", SITE))
copyFileSync(new URL("src/geo/shapes.json", ROOT), new URL("shapes.json", SITE))
// Voice-overs (marketing/video/audio/*.mp3), served next to the scenes.
const AUDIO = new URL("audio/", HERE)
if (existsSync(AUDIO))
  for (const file of readdirSync(AUDIO).filter((f) => /\.(mp3|wav)$/.test(f)))
    copyFileSync(new URL(file, AUDIO), new URL(file, SITE))
// The Découvrir texts, straight from the app's sources (Node strips the types).
const { GROUPES, PEUPLES } = await import(
  new URL("src/culture/peuples.ts", ROOT).href
)
const { SITES, CATEGORIES } = await import(
  new URL("src/culture/sites.ts", ROOT).href
)
writeFileSync(
  new URL("culture.json", SITE),
  JSON.stringify({ GROUPES, PEUPLES, SITES, CATEGORIES })
)
for (const font of [
  "space-grotesk/files/space-grotesk-latin-600-normal",
  "space-grotesk/files/space-grotesk-latin-700-normal",
  "ibm-plex-sans/files/ibm-plex-sans-latin-400-normal",
  "ibm-plex-sans/files/ibm-plex-sans-latin-600-normal",
  "ibm-plex-mono/files/ibm-plex-mono-latin-500-normal",
])
  copyFileSync(
    new URL(`node_modules/@fontsource/${font}.woff2`, ROOT),
    new URL(`fonts/${font.split("/").pop()}.woff2`, SITE)
  )
execFileSync("node", [
  fileURLToPath(new URL("marketing/make-map.mjs", ROOT)),
  fileURLToPath(new URL("carte.svg", SITE)),
])

const args = process.argv.slice(2)
const stills = args
  .find((arg) => arg.startsWith("--stills="))
  ?.slice(9)
  .split(",")
  .map(Number)
const jobsFile = args.find((arg) => arg.startsWith("--jobs="))?.slice(7)
const wanted = args.filter((arg) => !arg.startsWith("--"))

/** What to render: { name, page, out, seconds? }; a scene may set its own
 * duration (window.duration). */
const jobs = jobsFile
  ? JSON.parse(readFileSync(jobsFile, "utf8")).filter(
      (job) => !wanted.length || wanted.includes(job.name)
    )
  : Object.entries(SCENES)
      .filter(([name]) => !wanted.length || wanted.includes(name))
      .map(([name, seconds]) => ({
        name,
        page: `${name}.html`,
        out: `${name}.mp4`,
        seconds,
      }))

let warned = false
function warnNoVoice() {
  if (warned) return
  warned = true
  console.log(
    "\nPas de clé ElevenLabs (ELEVENLABS_API_KEY dans .env) : vidéos sans voix."
  )
}

const browser = await chromium.launch({ executablePath: CHROME })

/** Renders one job; throws on any failure so the caller can retry it. */
async function renderOne(job, label, target) {
  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    locale: "fr-FR",
    // The app's offline worker would answer every page, the encoder included.
    serviceWorkers: "block",
  })
  try {
    const scene = await context.newPage()
    await scene.goto(`${BASE}${job.page}`)
    await scene.evaluate(() => window.ready)

    // Voice-over in two passes: the scene gives its sentences, ElevenLabs
    // speaks them, then the scene is reloaded with their durations and sets
    // its timing (and when each sentence starts) to fit them.
    let voices = []
    const script = await scene.evaluate(() => window.voiceScript ?? null)
    if (
      script?.length &&
      !args.includes("--silent") &&
      !args.includes("--no-voice")
    ) {
      if (!voiceEnabled()) warnNoVoice()
      else {
        const durations = {}
        const clips = {}
        for (const line of script) {
          const clip = await speak(line.text)
          copyFileSync(clip.file, new URL(clip.name, SITE))
          durations[line.id] = Number(clip.seconds.toFixed(2))
          clips[line.id] = clip.name
        }
        const glue = job.page.includes("?") ? "&" : "?"
        await scene.goto(
          `${BASE}${job.page}${glue}durations=${encodeURIComponent(JSON.stringify(durations))}`
        )
        await scene.evaluate(() => window.ready)
        const timeline = await scene.evaluate(() => window.voiceTimeline ?? [])
        voices = timeline.map(({ id, at }) => ({ src: clips[id], at }))
      }
    }

    const seconds = (await scene.evaluate(() => window.duration)) ?? job.seconds
    // Soundtrack: set by the scene (window.audio) or the job; --silent drops it.
    const base = args.includes("--silent")
      ? null
      : ((await scene.evaluate(() => window.audio ?? null)) ??
        job.audio ??
        null)
    const sfx = args.includes("--silent")
      ? []
      : await scene.evaluate(() => window.sfx ?? [])
    const audio =
      base || voices.length || sfx.length
        ? {
            sfx,
            music: true,
            ...base,
            voices: voices.length ? voices : (base?.voices ?? []),
          }
        : null

    if (stills) {
      const last = Math.max(...stills)
      for (let i = 0; i <= Math.round(last * FPS); i++) {
        const t = i / FPS
        await scene.evaluate((time) => window.setTime(time), t)
        if (stills.some((s) => Math.round(s * FPS) === i))
          writeFileSync(
            new URL(`${job.name}-${t.toFixed(1)}s.jpg`, OUT),
            await scene.screenshot({ type: "jpeg", quality: 80 })
          )
      }
      console.log(`${label}: stills ${stills.join(", ")} (${seconds} s)`)
      return
    }

    const encoder = await context.newPage()
    await encoder.goto(`${BASE}encoder.html`)
    await encoder.waitForFunction(() => typeof window.init === "function")
    await encoder.evaluate(
      ([w, h, f, a]) => window.init(w, h, f, a),
      [WIDTH, HEIGHT, FPS, !!audio]
    )
    const frames = Math.round(seconds * FPS)
    for (let i = 0; i < frames; i++) {
      await scene.evaluate((t) => window.setTime(t), i / FPS)
      const shot = await scene.screenshot({ type: "jpeg", quality: 90 })
      await encoder.evaluate(
        ([b64, frame]) => window.addFrame(b64, frame),
        [shot.toString("base64"), i]
      )
      if (i % FPS === 0)
        process.stdout.write(`\r${label} ${i / FPS}/${Math.ceil(seconds)} s   `)
    }
    if (audio)
      await encoder.evaluate((config) => window.encodeAudio(config), {
        ...audio,
        seconds: frames / FPS,
      })
    const mp4 = await encoder.evaluate(() => window.finish())
    writeFileSync(target, Buffer.from(mp4, "base64"))
    console.log(`\r${label}: ${job.out}            `)
  } finally {
    await context.close()
  }
}

const failed = []
for (const [index, job] of jobs.entries()) {
  const label = `[${index + 1}/${jobs.length}] ${job.name}`
  const target = new URL(job.out, OUT)
  // A batch picks up where it stopped: done videos are kept.
  if (!stills && jobsFile && existsSync(target) && !args.includes("--force"))
    continue
  mkdirSync(new URL("./", target), { recursive: true })
  // A video that fails is tried twice more before the batch moves on.
  for (let attempt = 1; ; attempt++) {
    try {
      await renderOne(job, label, target)
      break
    } catch (error) {
      console.log(`\n${label}: échec (essai ${attempt}) : ${error.message}`)
      if (attempt === 3) {
        failed.push(job.name)
        break
      }
    }
  }
}
await browser.close()
if (failed.length) {
  console.log(`Vidéos en échec : ${failed.join(", ")}`)
  process.exitCode = 1
}
