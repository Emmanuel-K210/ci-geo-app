// Re-encodes a video to fit under a size (TikTok's demo video, for example)
// with the installed Chrome: frames are read by seeking, encoded in H.264 at
// the bit rate that fits, the sound re-encoded in AAC.
//
//   node marketing/video/compress.mjs <source.mp4> <out.mp4> [max Mo = 50]
//   (needs the preview server: npx vite preview --port 4173)
import { copyFileSync, mkdirSync, statSync, writeFileSync } from "node:fs"
import { chromium } from "playwright-core"

const [source, out, maxArg = "50"] = process.argv.slice(2)
if (!source || !out)
  throw new Error(
    "Usage : node marketing/video/compress.mjs <source> <sortie> [Mo]"
  )
const ROOT = new URL("../../", import.meta.url)
const SERVED = new URL("dist/_videos/compress/", ROOT)
mkdirSync(SERVED, { recursive: true })
copyFileSync(source, new URL("source.mp4", SERVED))
copyFileSync(
  new URL("node_modules/mp4-muxer/build/mp4-muxer.js", ROOT),
  new URL("mp4-muxer.js", SERVED)
)
writeFileSync(
  new URL("index.html", SERVED),
  '<!doctype html><script src="mp4-muxer.js"></script>'
)

// Aim at 85 % of the limit, keeping room for the sound and the container.
const target = Number(maxArg) * 1024 * 1024 * 0.85

const browser = await chromium.launch({
  executablePath:
    process.env.CHROME ??
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
})
const page = await browser.newPage()
page.on("console", (message) => {
  if (message.text().startsWith("progress"))
    process.stdout.write(`\r${message.text()}   `)
})
await page.goto("http://localhost:4173/_videos/compress/index.html")
const base64 = await page.evaluate(async (targetBytes) => {
  const FPS = 30
  const video = document.createElement("video")
  video.muted = true
  video.src = "source.mp4"
  await new Promise((resolve) => (video.onloadeddata = resolve))
  const width = video.videoWidth - (video.videoWidth % 2)
  const height = video.videoHeight - (video.videoHeight % 2)
  const seconds = video.duration

  const audioBuffer = await new OfflineAudioContext(2, 1, 48000)
    .decodeAudioData(await (await fetch("source.mp4")).arrayBuffer())
    .catch(() => null)
  const audioBits = audioBuffer ? 128_000 : 0
  const videoBitrate = Math.min(
    8_000_000,
    Math.max(500_000, Math.floor((targetBytes * 8) / seconds - audioBits))
  )

  const muxer = new Mp4Muxer.Muxer({
    target: new Mp4Muxer.ArrayBufferTarget(),
    video: { codec: "avc", width, height },
    ...(audioBuffer
      ? { audio: { codec: "aac", numberOfChannels: 2, sampleRate: 48000 } }
      : {}),
    fastStart: "in-memory",
  })
  const encoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (error) => console.error(error),
  })
  encoder.configure({
    codec: "avc1.640028",
    width,
    height,
    bitrate: videoBitrate,
    framerate: FPS,
    avc: { format: "avc" },
  })

  const canvas = new OffscreenCanvas(width, height)
  const ctx = canvas.getContext("2d")
  const frames = Math.floor(seconds * FPS)
  for (let i = 0; i < frames; i++) {
    video.currentTime = i / FPS
    await new Promise((resolve) => (video.onseeked = resolve))
    ctx.drawImage(video, 0, 0, width, height)
    const frame = new VideoFrame(canvas, {
      timestamp: Math.round((i * 1e6) / FPS),
      duration: Math.round(1e6 / FPS),
    })
    encoder.encode(frame, { keyFrame: i % (FPS * 2) === 0 })
    frame.close()
    while (encoder.encodeQueueSize > 10)
      await new Promise((r) => setTimeout(r, 5))
    if (i % FPS === 0)
      console.log(`progress ${Math.round(i / FPS)}/${Math.round(seconds)} s`)
  }
  await encoder.flush()

  if (audioBuffer) {
    const audio = new AudioEncoder({
      output: (chunk, meta) => muxer.addAudioChunk(chunk, meta),
      error: (error) => console.error(error),
    })
    audio.configure({
      codec: "mp4a.40.2",
      sampleRate: 48000,
      numberOfChannels: 2,
      bitrate: 128_000,
    })
    const left = audioBuffer.getChannelData(0)
    const right = audioBuffer.getChannelData(
      audioBuffer.numberOfChannels > 1 ? 1 : 0
    )
    for (let i = 0; i < audioBuffer.length; i += 4800) {
      const n = Math.min(4800, audioBuffer.length - i)
      const planar = new Float32Array(n * 2)
      planar.set(left.subarray(i, i + n), 0)
      planar.set(right.subarray(i, i + n), n)
      const data = new AudioData({
        format: "f32-planar",
        sampleRate: 48000,
        numberOfFrames: n,
        numberOfChannels: 2,
        timestamp: Math.round((i * 1e6) / 48000),
        data: planar,
      })
      audio.encode(data)
      data.close()
    }
    await audio.flush()
  }
  muxer.finalize()
  const bytes = new Uint8Array(muxer.target.buffer)
  let binary = ""
  for (let i = 0; i < bytes.length; i += 0x8000)
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(binary)
}, target)
await browser.close()

writeFileSync(out, Buffer.from(base64, "base64"))
const mb = (bytes) => (bytes / 1024 / 1024).toFixed(1)
console.log(
  `\n${out} : ${mb(statSync(source).size)} Mo → ${mb(statSync(out).size)} Mo`
)
