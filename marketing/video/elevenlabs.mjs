// Voice-overs from ElevenLabs, for the generated videos. Each sentence is
// spoken once and kept in marketing/video/audio/cache/, so a new render of
// the same text costs nothing.
//
// .env (never committed, read by Node only, not by the app):
//   ELEVENLABS_API_KEY=…              your key (Profile › API keys)
//   ELEVENLABS_VOICE_ID=…             optional; otherwise a voice whose name
//                                     contains ELEVENLABS_VOICE_NAME is used
//   ELEVENLABS_VOICE_NAME=Paul K      optional, « Paul K » by default
import { createHash } from "node:crypto"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"

const ROOT = new URL("../../", import.meta.url)
const CACHE = new URL("audio/cache/", import.meta.url)
const API = "https://api.elevenlabs.io/v1"
const MODEL = "eleven_multilingual_v2"
const FORMAT = "mp3_44100_128"

/** The .env values, without printing them anywhere. */
function env(name) {
  if (process.env[name]) return process.env[name]
  const file = new URL(".env", ROOT)
  if (!existsSync(file)) return undefined
  const line = readFileSync(file, "utf8")
    .split(/\r?\n/)
    .find((l) => l.startsWith(`${name}=`))
  return line?.slice(name.length + 1).trim() || undefined
}

export const voiceEnabled = () => !!env("ELEVENLABS_API_KEY")

let voiceId
async function voice() {
  if (voiceId) return voiceId
  voiceId = env("ELEVENLABS_VOICE_ID")
  if (voiceId) return voiceId
  const wanted = (env("ELEVENLABS_VOICE_NAME") ?? "Paul K").toLowerCase()
  const response = await fetch(`${API}/voices`, {
    headers: { "xi-api-key": env("ELEVENLABS_API_KEY") },
  })
  if (!response.ok) throw new Error(`ElevenLabs voices: ${response.status}`)
  const { voices } = await response.json()
  const found = voices.find((v) => v.name.toLowerCase().includes(wanted))
  if (!found)
    throw new Error(
      `Voix « ${wanted} » absente de votre bibliothèque ElevenLabs (ajoutez-la, ou mettez ELEVENLABS_VOICE_ID dans .env)`
    )
  voiceId = found.voice_id
  return voiceId
}

/**
 * Speaks `text`; returns the cached MP3 file name and its duration in
 * seconds (128 kb/s constant bit rate, so the size gives the length).
 */
export async function speak(text) {
  mkdirSync(CACHE, { recursive: true })
  const id = await voice()
  const name = `${createHash("sha1").update(`${id}|${MODEL}|${text}`).digest("hex").slice(0, 16)}.mp3`
  const file = new URL(name, CACHE)
  if (!existsSync(file)) {
    const response = await fetch(
      `${API}/text-to-speech/${id}?output_format=${FORMAT}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": env("ELEVENLABS_API_KEY"),
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: MODEL,
          voice_settings: { stability: 0.45, similarity_boost: 0.8 },
        }),
      }
    )
    if (!response.ok)
      throw new Error(`ElevenLabs: ${response.status} ${await response.text()}`)
    writeFileSync(file, Buffer.from(await response.arrayBuffer()))
  }
  const bytes = readFileSync(file).length
  return { name, file, seconds: (bytes * 8) / 128_000 }
}
