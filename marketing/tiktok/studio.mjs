// Culture Ivoire Studio: a local web page to connect the TikTok account and
// post the batch videos with a click, without typing commands.
//
//   npm run studio   (or double-click « Studio Culture Ivoire.cmd »)
//   then http://localhost:3457
//
// It only listens on this computer (127.0.0.1); keys stay in .env.
import {
  createReadStream,
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
} from "node:fs"
import { createServer } from "node:http"

import {
  account,
  authorize,
  authUrl,
  connected,
  postFromLot,
  programme,
  published,
} from "./post.mjs"

const PORT = 3457
const OUT = new URL("../video/out/", import.meta.url)
const PAGE = new URL("studio.html", import.meta.url)

const lots = () =>
  existsSync(OUT)
    ? readdirSync(OUT)
        .filter((name) => /^lot-\d{4}-\d{2}-\d{2}$/.test(name))
        .filter((name) => existsSync(new URL(`${name}/programme.csv`, OUT)))
        .sort()
        .reverse()
    : []

function send(res, status, body, type = "application/json; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type, "Cache-Control": "no-store" })
  res.end(typeof body === "string" ? body : JSON.stringify(body))
}

async function readJson(req) {
  let raw = ""
  for await (const chunk of req) raw += chunk
  return raw ? JSON.parse(raw) : {}
}

/** Streams an MP4, with ranges so the browser can seek in it. */
function video(req, res, lot, file) {
  const path = new URL(`${lot}/${file}`, OUT)
  if (
    !lots().includes(lot) ||
    !/^[\w.-]+\.mp4$/.test(file) ||
    !existsSync(path)
  )
    return send(res, 404, { error: "Vidéo introuvable" })
  const size = statSync(path).size
  const range = /bytes=(\d*)-(\d*)/.exec(req.headers.range ?? "")
  if (range) {
    const start = Number(range[1] || 0)
    const end = range[2] ? Number(range[2]) : size - 1
    res.writeHead(206, {
      "Content-Type": "video/mp4",
      "Content-Range": `bytes ${start}-${end}/${size}`,
      "Accept-Ranges": "bytes",
      "Content-Length": end - start + 1,
    })
    createReadStream(path, { start, end }).pipe(res)
  } else {
    res.writeHead(200, { "Content-Type": "video/mp4", "Content-Length": size })
    createReadStream(path).pipe(res)
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`)
  try {
    if (req.method === "GET" && url.pathname === "/")
      return send(
        res,
        200,
        readFileSync(PAGE, "utf8"),
        "text/html; charset=utf-8"
      )

    if (req.method === "GET" && url.pathname === "/api/state") {
      let user = null
      if (connected())
        user = await account().catch((error) => ({ error: error.message }))
      return send(res, 200, { connected: connected(), user, lots: lots() })
    }

    if (req.method === "GET" && url.pathname === "/api/lot") {
      const lot = url.searchParams.get("lot")
      if (!lots().includes(lot))
        return send(res, 404, { error: "Lot introuvable" })
      const log = published(lot)
      return send(res, 200, {
        rows: programme(lot).map((row) => ({
          ...row,
          at: row.at.toISOString(),
          published: log[row.file] ?? null,
          exists: existsSync(new URL(`${lot}/${row.file}`, OUT)),
        })),
      })
    }

    const match = /^\/video\/(lot-[\d-]+)\/([^/]+)$/.exec(url.pathname)
    if (req.method === "GET" && match)
      return video(req, res, match[1], match[2])

    if (req.method === "POST" && url.pathname === "/api/login")
      return send(res, 200, { url: authUrl() })

    if (req.method === "POST" && url.pathname === "/api/code") {
      const { code } = await readJson(req)
      const tokens = await authorize(code ?? "")
      return send(res, 200, { scope: tokens.scope })
    }

    if (req.method === "POST" && url.pathname === "/api/post") {
      const { lot, file } = await readJson(req)
      const row =
        lots().includes(lot) && programme(lot).find((r) => r.file === file)
      if (!row)
        return send(res, 404, { error: "Vidéo introuvable dans le programme" })
      return send(res, 200, await postFromLot(lot, row))
    }

    send(res, 404, { error: "Introuvable" })
  } catch (error) {
    send(res, 500, { error: error.message })
  }
})

server.listen(PORT, "127.0.0.1", () =>
  console.log(
    `Studio Culture Ivoire : http://localhost:${PORT}  (Ctrl+C pour arrêter)`
  )
)
