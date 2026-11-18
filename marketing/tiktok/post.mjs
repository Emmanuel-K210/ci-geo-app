// Publishes Culture Ivoire's videos on its TikTok account with the Content
// Posting API (Direct Post). Keys in .env, never committed:
//   TIKTOK_CLIENT_KEY=…  TIKTOK_CLIENT_SECRET=…
//
//   npm run tiktok -- login               prints the link to authorize the account
//   npm run tiktok -- code <CODE>         saves the account's tokens (code shown
//                                         by tiktok-callback.html)
//   npm run tiktok -- post <video.mp4> "<légende>"
//   npm run tiktok -- due <lot-AAAA-MM-JJ>  posts the batch's videos whose time
//                                         has come (programme.csv), once each
//
// Until TikTok has reviewed the app, posts can only be private (SELF_ONLY):
// the script picks the most public level TikTok allows.
import { randomBytes } from "node:crypto"
import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs"

const ROOT = new URL("../../", import.meta.url)
const TOKENS = new URL(".tokens.json", import.meta.url)
const API = "https://open.tiktokapis.com/v2"
const REDIRECT = "https://ci-geo-app.vercel.app/tiktok-callback.html"
const SCOPES = "user.info.basic,video.publish"

function env(name) {
  if (process.env[name]) return process.env[name]
  const file = new URL(".env", ROOT)
  if (!existsSync(file)) return undefined
  const line = readFileSync(file, "utf8")
    .split(/\r?\n/)
    .find((l) => l.startsWith(`${name}=`))
  return line?.slice(name.length + 1).trim() || undefined
}

function keys() {
  const key = env("TIKTOK_CLIENT_KEY")
  const secret = env("TIKTOK_CLIENT_SECRET")
  if (!key || !secret)
    throw new Error(
      "TIKTOK_CLIENT_KEY et TIKTOK_CLIENT_SECRET manquent dans .env"
    )
  return { key, secret }
}

// Tokens ------------------------------------------------------------------

async function tokenRequest(fields) {
  const { key, secret } = keys()
  const response = await fetch(`${API}/oauth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: key,
      client_secret: secret,
      ...fields,
    }),
  })
  const data = await response.json()
  if (!response.ok || data.error)
    throw new Error(
      `TikTok (jeton) : ${data.error_description ?? data.error ?? response.status}`
    )
  const now = Date.now()
  const tokens = {
    open_id: data.open_id,
    scope: data.scope,
    access_token: data.access_token,
    access_expires: now + data.expires_in * 1000,
    refresh_token: data.refresh_token,
    refresh_expires: now + data.refresh_expires_in * 1000,
  }
  writeFileSync(TOKENS, JSON.stringify(tokens, null, 2))
  return tokens
}

/** A valid access token, refreshed when it has expired (it lasts 24 h). */
async function accessToken() {
  if (!existsSync(TOKENS))
    throw new Error(
      "Compte non autorisé : lancez d'abord « npm run tiktok -- login »"
    )
  const tokens = JSON.parse(readFileSync(TOKENS, "utf8"))
  if (Date.now() < tokens.access_expires - 60_000) return tokens.access_token
  if (Date.now() > tokens.refresh_expires)
    throw new Error(
      "Autorisation expirée : relancez « npm run tiktok -- login »"
    )
  return (
    await tokenRequest({
      grant_type: "refresh_token",
      refresh_token: tokens.refresh_token,
    })
  ).access_token
}

async function api(path, body) {
  const response = await fetch(`${API}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${await accessToken()}`,
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify(body ?? {}),
  })
  const data = await response.json()
  if (data.error?.code && data.error.code !== "ok")
    throw new Error(
      `TikTok ${path} : ${data.error.code} ${data.error.message ?? ""}`
    )
  return data.data
}

// Posting -----------------------------------------------------------------

const PRIVACY_ORDER = [
  "PUBLIC_TO_EVERYONE",
  "MUTUAL_FOLLOW_FRIENDS",
  "FOLLOWER_OF_CREATOR",
  "SELF_ONLY",
]

/** Uploads a video and publishes it with its caption; returns its status. */
async function post(file, caption) {
  const creator = await api("/post/publish/creator_info/query/")
  const allowed = creator.privacy_level_options ?? ["SELF_ONLY"]
  const privacy =
    env("TIKTOK_PRIVACY") ?? PRIVACY_ORDER.find((p) => allowed.includes(p))
  const size = statSync(file).size
  if (size > 64 * 1024 * 1024)
    throw new Error(
      "Vidéo de plus de 64 Mo : non prise en charge par ce script"
    )

  const init = await api("/post/publish/video/init/", {
    post_info: {
      title: caption,
      privacy_level: privacy,
      disable_comment: false,
      disable_duet: false,
      disable_stitch: false,
    },
    source_info: {
      source: "FILE_UPLOAD",
      video_size: size,
      chunk_size: size,
      total_chunk_count: 1,
    },
  })

  const upload = await fetch(init.upload_url, {
    method: "PUT",
    headers: {
      "Content-Type": "video/mp4",
      "Content-Length": String(size),
      "Content-Range": `bytes 0-${size - 1}/${size}`,
    },
    body: readFileSync(file),
  })
  if (!upload.ok) throw new Error(`Envoi refusé : ${upload.status}`)

  // TikTok processes the video, then publishes it.
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 5000))
    const status = await api("/post/publish/status/fetch/", {
      publish_id: init.publish_id,
    })
    if (status.status === "PUBLISH_COMPLETE")
      return { publish_id: init.publish_id, privacy, status: status.status }
    if (status.status === "FAILED")
      throw new Error(
        `Publication échouée : ${status.fail_reason ?? "raison inconnue"}`
      )
  }
  return { publish_id: init.publish_id, privacy, status: "EN_COURS" }
}

// The batch's schedule ----------------------------------------------------

/** Rows of programme.csv: date (JJ/MM/AAAA), time (Abidjan = UTC), file, caption. */
function programme(lot) {
  const text = readFileSync(
    new URL(`marketing/video/out/${lot}/programme.csv`, ROOT),
    "utf8"
  ).replace(/^﻿/, "")
  return text
    .split(/\r?\n/)
    .slice(1)
    .filter(Boolean)
    .map((line) => {
      const [date, time, file, ...rest] = line.split(";")
      const caption = rest.join(";").replace(/^"|"$/g, "").replace(/""/g, '"')
      const [d, m, y] = date.split("/")
      return { at: new Date(`${y}-${m}-${d}T${time}:00Z`), file, caption }
    })
}

async function due(lot) {
  const logFile = new URL(`marketing/video/out/${lot}/publie.json`, ROOT)
  const log = existsSync(logFile)
    ? JSON.parse(readFileSync(logFile, "utf8"))
    : {}
  const now = new Date()
  const ready = programme(lot).filter((row) => row.at <= now && !log[row.file])
  if (!ready.length) return console.log("Rien à publier pour l'instant.")
  for (const row of ready) {
    const file = new URL(`marketing/video/out/${lot}/${row.file}`, ROOT)
    console.log(`Publication de ${row.file}…`)
    const result = await post(file, row.caption)
    log[row.file] = { ...result, at: new Date().toISOString() }
    writeFileSync(logFile, JSON.stringify(log, null, 2))
    console.log(`  ${result.status} (${result.privacy})`)
  }
}

// Commands ----------------------------------------------------------------

const [command, ...rest] = process.argv.slice(2)
try {
  if (command === "login") {
    const params = new URLSearchParams({
      client_key: keys().key,
      scope: SCOPES,
      response_type: "code",
      redirect_uri: REDIRECT,
      state: randomBytes(8).toString("hex"),
    })
    console.log("Ouvrez ce lien, connecté au compte TikTok Culture Ivoire :")
    console.log(`https://www.tiktok.com/v2/auth/authorize/?${params}`)
    console.log("Puis : npm run tiktok -- code <le code affiché>")
  } else if (command === "code") {
    const tokens = await tokenRequest({
      code: decodeURIComponent(rest[0] ?? ""),
      grant_type: "authorization_code",
      redirect_uri: REDIRECT,
    })
    console.log(`Compte autorisé (droits : ${tokens.scope}).`)
  } else if (command === "post") {
    const [file, caption = ""] = rest
    console.log(await post(file, caption))
  } else if (command === "due") {
    await due(rest[0])
  } else {
    console.log(
      'Commandes : login, code <CODE>, post <vidéo> "<légende>", due <lot>'
    )
  }
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
}
