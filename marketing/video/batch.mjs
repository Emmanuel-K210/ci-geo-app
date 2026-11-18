// Plans a batch of TikTok videos: two a day (the daily challenge at noon, and
// a guess / did-you-know / quiz video in the evening), with captions and a
// posting schedule for TikTok Studio. Then renders them with render.mjs.
//
//   node marketing/video/batch.mjs 2026-11-19 21     plan + render 21 days
//   node marketing/video/batch.mjs 2026-11-19 21 --plan-only
import { execFileSync } from "node:child_process"
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

const ROOT = new URL("../../", import.meta.url)
const [start = new Date().toISOString().slice(0, 10), daysArg = "21"] =
  process.argv.slice(2).filter((arg) => !arg.startsWith("--"))
const DAYS = Number(daysArg)
const FOLDER = `lot-${start}`
const OUT = new URL(`marketing/video/out/${FOLDER}/`, ROOT)

// The app's own draw (src/features/games/daily.ts), from its sources.
const { hashSeed, sample, seededRng } = await import(
  new URL("src/lib/random.ts", ROOT).href
)
const { PEUPLES } = await import(new URL("src/culture/peuples.ts", ROOT).href)
const { SITES } = await import(new URL("src/culture/sites.ts", ROOT).href)
const geo = JSON.parse(readFileSync(new URL("src/geo/ci-geo.json", ROOT)))
const villes = [...geo.villes].sort((a, b) => a.nom.localeCompare(b.nom, "fr"))
const dailyVilles = (key) =>
  sample(villes, 5, seededRng(hashSeed(`ci-geo:${key}`)))

// The app gave these cities on 2026-11-13: the draw must match.
const check = dailyVilles("2026-11-13")
  .map((v) => v.nom)
  .join(", ")
if (check !== "Soubré, Dabou, Touba, Abidjan, Grand-Bassam")
  throw new Error(`Daily draw differs from the app: ${check}`)

const addDays = (key, n) => {
  const date = new Date(`${key}T12:00:00Z`)
  date.setUTCDate(date.getUTCDate() + n)
  return date.toISOString().slice(0, 10)
}
const fmt = (key) => key.split("-").reverse().join("/")

// Evening videos: the best-known cities first, stories alternating
// peoples and sites, quizzes with a new seed each time.
const guessCities = [
  ...villes.filter((v) => v.chefLieuDe === "district"),
  ...villes.filter((v) => v.chefLieuDe === "region"),
  ...villes.filter((v) => !v.chefLieuDe),
].filter((v, i, list) => list.indexOf(v) === i)
const stories = []
for (let i = 0; i < Math.max(PEUPLES.length, SITES.length); i++) {
  if (SITES[i]) stories.push({ kind: "site", item: SITES[i] })
  if (PEUPLES[i]) stories.push({ kind: "peuple", item: PEUPLES[i] })
}
const TAGS = {
  base: "#cotedivoire #civ #225 #abidjan",
  geo: "#geographie #quiz #defi",
  culture: "#culture #histoire #lesaviezvous",
}

const jobs = []
const rows = []
let guess = 0
let story = 0
let quiz = 0
for (let d = 0; d < DAYS; d++) {
  const day = addDays(start, d)
  const today = dailyVilles(day)
  const yesterday = dailyVilles(addDays(day, -1))

  jobs.push({
    name: `${day}-1-defi`,
    page: `defi.html?day=${day}&today=${today.map((v) => v.id).join(",")}&yesterday=${yesterday.map((v) => v.id).join(",")}`,
    out: `${FOLDER}/${day}-1-defi.mp4`,
  })
  rows.push({
    day,
    time: "12:30",
    file: `${day}-1-defi.mp4`,
    caption: `Défi du ${fmt(day)} 🎯 ${today.map((v) => v.nom).join(", ")} : tu sais les placer sur la carte ? Joue sur ci-geo-app.vercel.app et dis-moi ton score 👇 (réponses demain) ${TAGS.base} ${TAGS.geo} #fyp`,
  })

  const kind = ["devine", "saviez", "quiz"][d % 3]
  if (kind === "devine") {
    const v = guessCities[guess++ % guessCities.length]
    const id = v.id.replace("ci-v-", "")
    jobs.push({
      name: `${day}-2-devine-${id}`,
      page: `devine.html?ville=${v.id}`,
      out: `${FOLDER}/${day}-2-devine-${id}.mp4`,
    })
    rows.push({
      day,
      time: "19:30",
      file: `${day}-2-devine-${id}.mp4`,
      caption: `Tu trouves cette ville en 3 secondes ? 🧐 Réponds en commentaire AVANT la fin 👇 ${TAGS.base} ${TAGS.geo} #devinette #fyp`,
    })
  } else if (kind === "saviez") {
    const { kind: k, item } = stories[story++ % stories.length]
    const title = k === "peuple" ? `les ${item.nom}` : item.nom
    jobs.push({
      name: `${day}-2-saviez-${item.id}`,
      page: `saviez.html?story=${k}:${item.id}`,
      out: `${FOLDER}/${day}-2-saviez-${item.id}.mp4`,
    })
    rows.push({
      day,
      time: "19:30",
      file: `${day}-2-saviez-${item.id}.mp4`,
      caption: `Le saviez-vous ? ${title.charAt(0).toUpperCase()}${title.slice(1)} : ${item.resume} 📖 Toute l'histoire sur CI-Geo. ${TAGS.base} ${TAGS.culture} #fyp`,
    })
  } else {
    const seed = 100 + quiz++
    jobs.push({
      name: `${day}-2-quiz-${seed}`,
      page: `quiz.html?seed=${seed}`,
      out: `${FOLDER}/${day}-2-quiz-${seed}.mp4`,
    })
    rows.push({
      day,
      time: "19:30",
      file: `${day}-2-quiz-${seed}.mp4`,
      caption: `Quiz éclair Côte d'Ivoire ⚡ 5 questions, 3 secondes chacune. Ton score sur 5 en commentaire 👇 ${TAGS.base} ${TAGS.geo} #quizz #fyp`,
    })
  }
}

mkdirSync(OUT, { recursive: true })
const jobsFile = fileURLToPath(new URL("jobs.json", OUT))
writeFileSync(jobsFile, JSON.stringify(jobs, null, 2))
const csv = (value) => `"${String(value).replace(/"/g, '""')}"`
writeFileSync(
  new URL("programme.csv", OUT),
  "﻿date;heure;fichier;legende\n" +
    rows
      .map((r) => [fmt(r.day), r.time, r.file, csv(r.caption)].join(";"))
      .join("\n")
)
writeFileSync(
  new URL("programme.md", OUT),
  [
    `# Programme TikTok du ${fmt(start)} au ${fmt(addDays(start, DAYS - 1))}`,
    "",
    "Programmez chaque vidéo dans TikTok Studio (ordinateur) : Importer, choisir le",
    "fichier, coller la légende, ajouter un son tendance, puis « Programmer » à la",
    "date et l'heure indiquées (heure d'Abidjan).",
    "",
    ...rows.flatMap((r) => [
      `## ${fmt(r.day)} · ${r.time}`,
      "",
      `Fichier : \`${r.file}\``,
      "",
      "```text",
      r.caption,
      "```",
      "",
    ]),
  ].join("\n")
)
console.log(
  `${jobs.length} vidéos planifiées dans marketing/video/out/${FOLDER}/`
)

if (!process.argv.includes("--plan-only"))
  execFileSync(
    "node",
    [
      fileURLToPath(new URL("render.mjs", import.meta.url)),
      `--jobs=${jobsFile}`,
    ],
    { stdio: "inherit" }
  )
