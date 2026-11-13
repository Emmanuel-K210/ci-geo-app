// Renders the TikTok videos (1080 × 1920, 30 fps, MP4 H.264) with the
// installed Chrome: each scene page is set to a time, screenshotted, and the
// frames are encoded by Chrome itself.
//
//   npm run build && npx vite preview --port 4173
//   node marketing/video/render.mjs [scene …]
import { copyFileSync, mkdirSync, readdirSync, writeFileSync } from "node:fs"
import { execFileSync } from "node:child_process"
import { fileURLToPath } from "node:url"
import { chromium } from "playwright-core"

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

/** Scene file → duration in seconds. */
const SCENES = {
  "v1-presentation": 22,
  "v2-defi": 24,
  "v3-pokou": 25,
}

// The site the scenes are served from: scene pages, poster styles, fonts.
mkdirSync(new URL("fonts/", SITE), { recursive: true })
mkdirSync(OUT, { recursive: true })
for (const file of readdirSync(HERE))
  if (/\.(html|js|css)$/.test(file) && file !== "render.mjs")
    copyFileSync(new URL(file, HERE), new URL(file, SITE))
for (const file of ["poster.css", "demo.js"])
  copyFileSync(new URL(`marketing/posters/${file}`, ROOT), new URL(file, SITE))
copyFileSync(
  new URL("node_modules/mp4-muxer/build/mp4-muxer.js", ROOT),
  new URL("mp4-muxer.js", SITE)
)
copyFileSync(new URL("src/geo/ci-geo.json", ROOT), new URL("ci-geo.json", SITE))
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
// --stills=3.5,5 : save those frames as JPEG instead of encoding a video.
const stills = args
  .find((arg) => arg.startsWith("--stills="))
  ?.slice(9)
  .split(",")
  .map(Number)
const wanted = args.filter((arg) => !arg.startsWith("--"))
const browser = await chromium.launch({ executablePath: CHROME })

for (const [name, seconds] of Object.entries(SCENES)) {
  if (wanted.length && !wanted.includes(name)) continue
  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    locale: "fr-FR",
  })
  const scene = await context.newPage()
  await scene.goto(`${BASE}${name}.html`)
  await scene.evaluate(() => window.ready)
  if (stills) {
    const last = Math.max(...stills)
    for (let i = 0; i <= Math.round(last * FPS); i++) {
      const t = i / FPS
      await scene.evaluate((time) => window.setTime(time), t)
      if (stills.some((s) => Math.round(s * FPS) === i))
        writeFileSync(
          new URL(`${name}-${t.toFixed(1)}s.jpg`, OUT),
          await scene.screenshot({ type: "jpeg", quality: 80 })
        )
    }
    console.log(`${name}: stills ${stills.join(", ")}`)
    await context.close()
    continue
  }
  const encoder = await context.newPage()
  await encoder.goto(`${BASE}encoder.html`)
  await encoder.evaluate(
    ([w, h, f]) => window.init(w, h, f),
    [WIDTH, HEIGHT, FPS]
  )

  const frames = Math.round(seconds * FPS)
  for (let i = 0; i < frames; i++) {
    await scene.evaluate((t) => window.setTime(t), i / FPS)
    const shot = await scene.screenshot({ type: "jpeg", quality: 90 })
    await encoder.evaluate(
      ([b64, index]) => window.addFrame(b64, index),
      [shot.toString("base64"), i]
    )
    if (i % FPS === 0) process.stdout.write(`\r${name} ${i / FPS}/${seconds} s`)
  }
  const mp4 = await encoder.evaluate(() => window.finish())
  writeFileSync(new URL(`${name}.mp4`, OUT), Buffer.from(mp4, "base64"))
  console.log(`\r${name}: marketing/video/out/${name}.mp4`)
  await context.close()
}
await browser.close()
