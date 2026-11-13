// Checks a rendered video by decoding it in Chrome: prints its size and
// duration, and saves a contact sheet of frames taken every `step` seconds.
//
//   node marketing/video/contact-sheet.mjs v1-presentation [step]
import { copyFileSync, writeFileSync } from "node:fs"
import { chromium } from "playwright-core"

const name = process.argv[2]
const step = Number(process.argv[3] ?? 2)
const ROOT = new URL("../../", import.meta.url)
copyFileSync(
  new URL(`marketing/video/out/${name}.mp4`, ROOT),
  new URL(`dist/_videos/${name}.mp4`, ROOT)
)

const browser = await chromium.launch({
  executablePath:
    process.env.CHROME ??
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
})
const page = await browser.newPage()
await page.goto("http://localhost:4173/_videos/encoder.html")
const result = await page.evaluate(
  async ([src, every]) => {
    const video = document.createElement("video")
    video.muted = true
    video.src = src
    await new Promise((resolve, reject) => {
      video.onloadeddata = resolve
      video.onerror = () => reject(new Error("cannot decode"))
    })
    const times = []
    for (let t = 0.5; t < video.duration; t += every) times.push(t)
    const cols = 6
    const w = 180
    const h = 320
    const canvas = document.createElement("canvas")
    canvas.width = cols * w
    canvas.height = Math.ceil(times.length / cols) * (h + 24)
    const ctx = canvas.getContext("2d")
    ctx.fillStyle = "#fff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    for (const [i, t] of times.entries()) {
      video.currentTime = t
      await new Promise((r) => (video.onseeked = r))
      // The seeked frame is drawable only after the next paint.
      await new Promise((r) =>
        requestAnimationFrame(() => requestAnimationFrame(r))
      )
      const x = (i % cols) * w
      const y = Math.floor(i / cols) * (h + 24)
      ctx.drawImage(video, x, y, w, h)
      ctx.fillStyle = "#000"
      ctx.font = "16px sans-serif"
      ctx.fillText(`${t.toFixed(1)} s`, x + 6, y + h + 18)
    }
    return {
      duration: video.duration,
      size: `${video.videoWidth}x${video.videoHeight}`,
      sheet: canvas.toDataURL("image/jpeg", 0.85).split(",")[1],
    }
  },
  [`/_videos/${name}.mp4`, step]
)
writeFileSync(
  new URL(`marketing/video/out/${name}-planche.jpg`, ROOT),
  Buffer.from(result.sheet, "base64")
)
console.log(name, result.size, `${result.duration.toFixed(2)} s`)
await browser.close()
