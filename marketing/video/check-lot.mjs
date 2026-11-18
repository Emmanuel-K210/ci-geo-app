// Checks a whole batch: decodes every MP4 in Chrome, lists size and duration,
// and saves one sheet with a frame of each video (at 40 % of its length).
//
//   node marketing/video/check-lot.mjs lot-2026-11-19
import { copyFileSync, mkdirSync, readdirSync, writeFileSync } from "node:fs"
import { chromium } from "playwright-core"

const lot = process.argv[2]
const ROOT = new URL("../../", import.meta.url)
const FROM = new URL(`marketing/video/out/${lot}/`, ROOT)
const SERVED = new URL(`dist/_videos/${lot}/`, ROOT)
mkdirSync(SERVED, { recursive: true })
const files = readdirSync(FROM)
  .filter((f) => f.endsWith(".mp4"))
  .sort()
for (const file of files)
  copyFileSync(new URL(file, FROM), new URL(file, SERVED))

const browser = await chromium.launch({
  executablePath:
    process.env.CHROME ??
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
})
const page = await browser.newPage()
await page.goto("http://localhost:4173/_videos/encoder.html")
const result = await page.evaluate(
  async ([folder, names]) => {
    const cols = 7
    const w = 150
    const h = 267
    const canvas = document.createElement("canvas")
    canvas.width = cols * w
    canvas.height = Math.ceil(names.length / cols) * (h + 20)
    const ctx = canvas.getContext("2d")
    ctx.fillStyle = "#fff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    const report = []
    for (const [i, name] of names.entries()) {
      const video = document.createElement("video")
      video.muted = true
      video.src = `/_videos/${folder}/${name}`
      try {
        await new Promise((resolve, reject) => {
          video.onloadeddata = resolve
          video.onerror = () => reject(new Error("decode"))
        })
        video.currentTime = video.duration * 0.4
        await new Promise((r) => (video.onseeked = r))
        await new Promise((r) =>
          requestAnimationFrame(() => requestAnimationFrame(r))
        )
        const x = (i % cols) * w
        const y = Math.floor(i / cols) * (h + 20)
        ctx.drawImage(video, x, y, w, h)
        ctx.fillStyle = "#000"
        ctx.font = "11px sans-serif"
        ctx.fillText(name.replace(".mp4", "").slice(5, 26), x + 3, y + h + 14)
        report.push(
          `${name} ${video.videoWidth}x${video.videoHeight} ${video.duration.toFixed(1)} s`
        )
      } catch {
        report.push(`${name} ILLISIBLE`)
      }
    }
    return { report, sheet: canvas.toDataURL("image/jpeg", 0.8).split(",")[1] }
  },
  [lot, files]
)
writeFileSync(new URL("planche.jpg", FROM), Buffer.from(result.sheet, "base64"))
console.log(result.report.join("\n"))
await browser.close()
